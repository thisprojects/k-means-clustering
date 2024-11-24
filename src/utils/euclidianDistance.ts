/**
 * Calculates the Euclidean distance between two points in n-dimensional space. √(Σ(x₁ᵢ - x₂ᵢ)²
 * @param point1 - The first point as an array of numbers.
 * @param point2 - The second point as an array of numbers.
 * @returns The Euclidean distance between the two points.
 */
export function euclideanDistance(point1: number[], point2: number[]): number {
  if (point1.length !== point2.length) {
    throw new Error('Points must have the same number of dimensions.');
  }

  return Math.sqrt(
    point1.reduce((sum, value, index) => sum + (value - point2[index]) ** 2, 0)
  );
}
