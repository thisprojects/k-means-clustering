## K-Means Clustering Library

A simple and efficient K-Means clustering library for JavaScript and React applications. This library provides support for multiple K-Means runs with K-Means++ initialization to ensure stable and consistent clustering results.

## Features

**K-Means Clustering**: Efficiently clusters data points into k groups.
**K-Means++ Initialization**: Improves clustering stability by initializing centroids using the K-Means++ algorithm.
**Multiple Runs with Optimal Inertia**: Runs the algorithm multiple times to select the best result based on inertia.

## Installation

Install the package via npm:

`npm install k-means-clustering-js`

## Functions

### 1. `kMeans`

Performs K-Means clustering on a dataset.

#### Parameters

- **`data`**: `number[][]`  
  The dataset to cluster, where each data point is an array of numbers.
- **`k`**: `number`  
  The number of clusters to form.
- **`maxIterations`**: `number` (optional, default: `100`)  
  The maximum number of iterations for the algorithm to converge.
- **`tolerance`**: `number` (optional, default: `1e-6`)  
  The threshold for centroid movement to determine convergence.

#### Returns

An array of clusters, each containing:

- **`centroid`**: The centroid coordinates.
- **`points`**: The data points assigned to the cluster.

Example

```javascript
import { kMeans } from "k-means-clustering-js";

const data = [
  [1, 1],
  [1.5, 1.5],
  [1, 1.5],
  [5, 5],
  [5.5, 5.5],
  [5, 5.5],
  [9, 9],
  [9.5, 9],
  [9, 9.5],
];

const clusters = kMeans({
  data,
  k: 3,
  maxIterations: 100,
  tolerance: 1e-6,
});

console.log(clusters);
```

### 2. `runKMeansWithOptimalInertia`

Runs the K-Means algorithm multiple times with different initializations and selects the best result based on the lowest inertia.

#### Parameters

- **`data`**: `number[][]`  
  The dataset to cluster, where each data point is an array of numbers.
- **`k`**: `number`  
  The number of clusters to form.
- **`numRuns`**: `number` (optional, default: `10`)  
  The number of times to run the algorithm.
- **`maxIterations`**: `number` (optional, default: `100`)  
  The maximum number of iterations for the algorithm to converge.
- **`tolerance`**: `number` (optional, default: `1e-6`)  
  The threshold for centroid movement to determine convergence.

#### Returns

The clustering result with the lowest inertia.``

Example

```javascript
import { runKMeansWithOptimalInertia } from "k-means-clustering";

const data = [
  [1, 1],
  [1.5, 1.5],
  [1, 1.5],
  [5, 5],
  [5.5, 5.5],
  [5, 5.5],
  [9, 9],
  [9.5, 9],
  [9, 9.5],
];

const bestClusters = runKMeansWithOptimalInertia({
  data,
  k: 3,
  numRuns: 10,
  maxIterations: 100,
  tolerance: 1e-6,
});

console.log(bestClusters);
```

### Types

#### `Cluster`

Represents a single cluster, with the following properties:

- `centroid: number[]`
- The coordinates of the cluster's centroid.

- `points: number[][]`
- The data points assigned to the cluster.

---

### Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for bug fixes, improvements, or new features.

---

### License

This library is licensed under the MIT License.
