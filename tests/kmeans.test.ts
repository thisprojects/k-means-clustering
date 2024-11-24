import { kMeans } from "../src/algorithms/kmeans";
import { expect } from "@jest/globals";
import { Cluster } from "../src/types";
import { euclideanDistance } from "../src/utils/euclidianDistance";

describe("K-Means Clustering", () => {
  test("should correctly cluster simple 2D data", () => {
    const data = [
      [1, 1],
      [1.5, 2],
      [1, 1.5], // Cluster 1
      [5, 5],
      [5.5, 5.5],
      [5, 5.5], // Cluster 2
      [9, 9],
      [9.5, 9],
      [9, 9.5], // Cluster 3
    ];

    const k = 3;
    const result = kMeans({ data, k });

    expect(result).toHaveLength(k);
    expect(result.every((cluster) => cluster.points.length > 0)).toBe(true);

    // Check that points close to each other are in the same cluster
    const cluster1Points = result.find(
      (c) => euclideanDistance(c.centroid, [1.17, 1.5]) < 1
    )?.points;

    expect(cluster1Points).toHaveLength(3);
  });

  test("should throw error for empty dataset", () => {
    expect(() => kMeans({ data: [], k: 3 })).toThrow(
      "Invalid number of clusters or empty dataset"
    );
  });

  test("should throw error when k > dataset size", () => {
    const data = [
      [1, 1],
      [2, 2],
    ];
    expect(() => kMeans({ data, k: 3 })).toThrow(
      "Invalid number of clusters or empty dataset"
    );
  });

  test("should throw error for inconsistent dimensions", () => {
    const data = [
      [1, 1],
      [2, 2, 3],
      [4, 4],
    ];
    expect(() => kMeans({ data, k: 2 })).toThrow(
      "All data points must have the same dimensions"
    );
  });

  test("should converge within max iterations", () => {
    const data = Array.from({ length: 100 }, () => [
      Math.random() * 10,
      Math.random() * 10,
    ]);

    const k = 3;
    const maxIterations = 100;
    const result = kMeans({ data, k, maxIterations });

    expect(result).toHaveLength(k);
  });

  test("should produce stable results with different runs", () => {
    const data = [
      [1, 1],
      [1.1, 1.1],
      [0.9, 0.9],
      [5, 5],
      [5.1, 5.1],
      [4.9, 4.9],
    ];

    const k = 2;
    const results: Cluster[][] = [];

    for (let i = 0; i < 5; i++) {
      results.push(kMeans({ data, k }));
    }

    // Check that number of points in each cluster remains consistent
    const clusterSizes = results.map((result) =>
      result.map((cluster) => cluster.points.length).sort()
    );

    const uniqueSizes = new Set(
      clusterSizes.map((sizes) => JSON.stringify(sizes))
    );
    expect(uniqueSizes.size).toBe(1);
  });

  test("should handle higher dimensional data", () => {
    const data = [
      [1, 1, 1],
      [1.5, 1.5, 1.5],
      [1, 1, 1.5],
      [5, 5, 5],
      [5.5, 5.5, 5.5],
      [5, 5, 5.5],
    ];

    const k = 2;
    const result = kMeans({ data, k });

    expect(result).toHaveLength(k);
    expect(result[0].centroid).toHaveLength(3);
    expect(result[1].centroid).toHaveLength(3);
  });

  test("should respect tolerance parameter", () => {
    const data = [
      [1, 1],
      [1.1, 1.1],
      [5, 5],
      [5.1, 5.1],
    ];

    const k = 2;
    const strictTolerance = 1e-10;
    const looseTolerance = 1;

    const resultStrict = kMeans({
      data,
      k,
      maxIterations: 100,
      tolerance: strictTolerance,
    });
    const resultLoose = kMeans({
      data,
      k,
      maxIterations: 100,
      tolerance: looseTolerance,
    });

    expect(resultStrict).toHaveLength(k);
    expect(resultLoose).toHaveLength(k);
  });
});
