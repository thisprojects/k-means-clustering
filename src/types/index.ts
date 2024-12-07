export interface Cluster {
  centroid: number[];
  points: number[][];
}

export interface IKmeansWithRuns extends IKmeans {
  numRuns?: number;
}

export interface IKmeans {
  data: number[][];
  k: number;
  maxIterations?: number;
  tolerance?: number;
}
