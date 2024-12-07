import { euclideanDistance } from "../utils/euclidianDistance";
import { Cluster, IKmeans, IKmeansWithRuns } from "../types";

/**
 * Runs the K-Means algorithm multiple times with different initializations and selects the best result.
 * The best result is determined by the lowest inertia, which is the sum of squared distances between points and their assigned centroids.
 * This approach helps achieve more stable and consistent clustering results.
 *
 * @param data - The dataset, an array of data points (each point is an array of numbers).
 * @param k - The number of clusters to form.
 * @param numRuns - The number of times to run the K-Means algorithm (default: 10).
 * @returns The best clustering result, which is the one with the lowest inertia.
 */
export function runKMeansWithOptimalInertia({
  data,
  k,
  maxIterations = 100,
  tolerance = 1e-6,
  numRuns = 10,
}: IKmeansWithRuns): Cluster[] {
  let bestClusters: Cluster[] = [];
  let bestInertia = Infinity;

  for (let i = 0; i < numRuns; i++) {
    const clusters = kMeans({ data, k, maxIterations, tolerance });
    const inertia = calculateInertia(clusters);
    if (inertia < bestInertia) {
      bestInertia = inertia;
      bestClusters = clusters;
    }
  }

  return bestClusters;
}

/**
 * Calculates the inertia (sum of squared distances) for a set of clusters.
 * Inertia measures how well the points are clustered around their centroids, with lower values indicating better clustering.
 *
 * @param clusters - An array of clusters, each containing points and the corresponding centroid.
 * @returns The total inertia, which is the sum of squared distances from each point to its assigned centroid.
 */
function calculateInertia(clusters: Cluster[]): number {
  return clusters.reduce((inertia, cluster) => {
    return (
      inertia +
      cluster.points.reduce((sum, point) => {
        return sum + euclideanDistance(point, cluster.centroid) ** 2;
      }, 0)
    );
  }, 0);
}

/**
 * Performs K-Means clustering on a dataset.
 * @param data - An array of data points, where each point is an array of numbers.
 * @param k - The number of clusters to form.
 * @param maxIterations - The maximum number of iterations to run the algorithm.
 * @param tolerance - Convergence threshold for centroid movement (default: 1e-6).
 * @returns An array of clusters, each containing a centroid and the associated points.
 * @throws Error if input parameters are invalid.
 */

export function kMeans({
  data,
  k,
  maxIterations = 100,
  tolerance = 1e-6,
}: IKmeans): Cluster[] {
  if (data.length === 0 || k <= 0 || k > data.length) {
    throw new Error("Invalid number of clusters or empty dataset.");
  }

  const dimensions = data[0].length;
  if (!data.every((point) => point.length === dimensions)) {
    throw new Error("All data points must have the same dimensions.");
  }

  let centroids = initializeCentroidsWithKMeansPlusPlus(data, k);
  let clusters: Cluster[] = [];
  let hasConverged = false;
  let iteration = 0;

  while (!hasConverged && iteration < maxIterations) {
    clusters = assignPointsToCentroidClusters(data, centroids);

    // Calculate new centroids
    const newCentroids = clusters.map((cluster, i) => {
      if (cluster.points.length === 0) {
        // Handle empty clusters by reinitialising their centroids
        return initializeCentroidsWithKMeansPlusPlus(data, 1)[0];
      }
      return calculateCentroidPosition(cluster.points);
    });

    // Check convergence using Euclidean distance
    hasConverged = centroids.every(
      (centroid, i) => euclideanDistance(centroid, newCentroids[i]) < tolerance
    );

    centroids = newCentroids;
    iteration++;
  }

  return clusters;
}

/**
 * Initializes centroids using the K-Means++ method.
 * This method selects the first centroid randomly, and then each subsequent centroid is chosen based on
 * a weighted probability distribution, where points farther from existing centroids are more likely to be selected.
 * @param data - The dataset, an array of data points (each point is an array of numbers).
 * @param k - The number of centroids to initialize.
 * @returns An array of `k` centroids, each represented as an array of numbers.
 */
function initializeCentroidsWithKMeansPlusPlus(
  data: number[][],
  k: number
): number[][] {
  const centroids: number[][] = [];
  const randomIndex = Math.floor(Math.random() * data.length);
  centroids.push(data[randomIndex]); // Pick the first centroid randomly

  while (centroids.length < k) {
    // Calculate the distance of each point to the closest centroid
    const distances: number[] = data.map((point) => {
      let minDistance = Infinity;
      centroids.forEach((centroid) => {
        const distance = euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
        }
      });
      return minDistance * minDistance;
    });

    // Pick the next centroid based on weighted probabilities
    const totalDistance = distances.reduce(
      (sum, distance) => sum + distance,
      0
    );

    const randomValue = Math.random() * totalDistance;
    let cumulativeSum = 0;

    // Selects the next centroid based on a weighted probability distribution proportional to the squared distance from the nearest centroid.
    for (let i = 0; i < distances.length; i++) {
      cumulativeSum += distances[i];
      if (cumulativeSum >= randomValue) {
        centroids.push(data[i]);
        break;
      }
    }
  }

  return centroids;
}

/**
 * Assigns each point to the nearest centroid.
 * @param data - The dataset.
 * @param centroids - The current centroids.
 * @returns An array of clusters.
 */
function assignPointsToCentroidClusters(
  data: number[][],
  centroids: number[][]
): Cluster[] {
  const clusters: Cluster[] = centroids.map((centroid) => ({
    centroid,
    points: [],
  }));

  data.forEach((point) => {
    let nearestIndex = 0;

    // Distance of the first centroid to the first point is given as a baseline,
    // at this stage it may not be the shortest distance between a centroid and this particular point.
    // The shortest distance between the current point and a centroid is updated as we loop through.
    let shortestDistance = euclideanDistance(point, centroids[0]);

    // loop through each centroid and test each point for shortest distance. The point is then associated with
    // the centroid with the shortest distance to the point.
    centroids.forEach((centroid, i) => {
      const distance = euclideanDistance(point, centroid);
      if (distance < shortestDistance) {
        nearestIndex = i;
        shortestDistance = distance;
      }
    });

    clusters[nearestIndex].points.push(point);
  });

  return clusters;
}

/**
 * Calculates the arithmetic mean (centroid) of a set of n-dimensional points.
 * @param points - An array of points, where each point is an array of numbers representing coordinates.
 * @returns The mean point with the same dimensions as the input points.
 * @throws Error if points array is empty or if points have inconsistent dimensions.
 */
function calculateCentroidPosition(points: number[][]): number[] {
  if (!points || points.length === 0) {
    throw new Error("Cannot calculate the mean of an empty cluster.");
  }

  // Minimum dimension of 2 eg [1,2], each point will be a vector with the same dimensions.
  const dimensionOfPoints = points[0].length;
  if (dimensionOfPoints < 1) {
    throw new Error("Points must have at least one dimension.");
  }

  const mean = Array(dimensionOfPoints).fill(0);

  // Sum all the vectors in the points array.
  points.forEach((point) => {
    if (point.length !== dimensionOfPoints) {
      throw new Error(
        `Point has incorrect dimensions: expected ${dimensionOfPoints}, but got ${point.length}`
      );
    }

    point.forEach((value, i) => {
      if (typeof value !== "number" || isNaN(value)) {
        throw new Error(`Invalid coordinate value at dimension ${i}: ${point}`);
      }
      mean[i] += value;
    });
  });

  // return the centroids new position
  return mean.map((value) => value / points.length);
}
