import { euclideanDistance } from '../utils/euclidianDistance';
import { Cluster } from '../types'

/**
 * Performs K-Means clustering on a dataset.
 * @param data - An array of data points, where each point is an array of numbers.
 * @param k - The number of clusters to form.
 * @param maxIterations - The maximum number of iterations to run the algorithm.
 * @param tolerance - Convergence threshold for centroid movement (default: 1e-6).
 * @returns An array of clusters, each containing a centroid and the associated points.
 * @throws Error if input parameters are invalid.
 */
export function kMeans(
  data: number[][], 
  k: number, 
  maxIterations: number = 100,
  tolerance: number = 1e-6
): Cluster[] {

  if (data.length === 0 || k <= 0 || k > data.length) {
      throw new Error('Invalid number of clusters or empty dataset.');
  }

  const dimensions = data[0].length;
  if (!data.every(point => point.length === dimensions)) {
      throw new Error('All data points must have the same dimensions.');
  }

  let centroids = initialiseCentroids(data, k);
  let clusters: Cluster[] = [];
  let hasConverged = false;
  let iteration = 0;

  while (!hasConverged && iteration < maxIterations) {
      clusters = assignPointsToCentroidClusters(data, centroids);

      // Calculate new centroids
      const newCentroids = clusters.map((cluster, i) => {
          if (cluster.points.length === 0) {
              // Handle empty clusters by reinitialising their centroids
              return initialiseCentroids(data, 1)[0];
          }
          return calculateCentroidPosition(cluster.points);
      });

      // Check convergence using Euclidean distance
      hasConverged = centroids.every((centroid, i) => 
        euclideanDistance(centroid, newCentroids[i]) < tolerance
      );

      centroids = newCentroids;
      iteration++;
  }

  return clusters;
}

/**
 * Randomly initialises centroids from the dataset using Fisher-Yates shuffle.
 * @param data - The dataset.
 * @param k - The number of clusters.
 * @returns An array of initial centroids.
 * @throws Error if k is greater than the dataset size.
 */
function initialiseCentroids(data: number[][], k: number): number[][] {
  if (k > data.length) {
      throw new Error('Number of clusters cannot exceed number of data points');
  }

  // Create array of indices and shuffle using Fisher-Yates
  const indices = Array.from({ length: data.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Select first k indices and return corresponding data points
  return indices.slice(0, k).map(index => data[index]);
}

/**
 * Assigns each point to the nearest centroid.
 * @param data - The dataset.
 * @param centroids - The current centroids.
 * @returns An array of clusters.
 */
function assignPointsToCentroidClusters(data: number[][], centroids: number[][]): Cluster[] {
  const clusters: Cluster[] = centroids.map(centroid => ({ centroid, points: [] }));

  data.forEach(point => {
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
    throw new Error('Cannot calculate the mean of an empty cluster.');
  }

  // Minimum dimension of 2 eg [1,2], each point will be a vector with the same dimensions. 
  const dimensionOfPoints = points[0].length;
  if (dimensionOfPoints < 1) {
    throw new Error('Points must have at least one dimension.');
  }

  const mean = Array(dimensionOfPoints).fill(0);

  // Sum all the vectors in the points array. 
  points.forEach(point => {
    if (point.length !== dimensionOfPoints) {
      throw new Error(`Point has incorrect dimensions: expected ${dimensionOfPoints}, but got ${point.length}`)
    }

    point.forEach((value, i) => {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`Invalid coordinate value at dimension ${i}: ${point}`);
      }
      mean[i] += value;
    });
  });

  // return the centroids new position
  return mean.map(value => value / points.length);
}
