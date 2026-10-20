// =============================================================================
// SIM — TSP Solver (Nearest-Neighbor Heuristic)
// Computes an optimized replenishment route through the store.
// =============================================================================

/**
 * Computes the Euclidean distance between two 2D points.
 * @param {Object} a - Point with x, y coordinates (in meters).
 * @param {Object} b - Point with x, y coordinates (in meters).
 * @returns {number} Distance in meters.
 */
function euclideanDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Builds a distance matrix between all pairs of locations.
 * @param {Array<{id: string, x: number, y: number}>} locations - Array of locations.
 * @returns {Map<string, Map<string, number>>} Distance matrix.
 */
function buildDistanceMatrix(locations) {
  const matrix = new Map();
  for (const a of locations) {
    const row = new Map();
    for (const b of locations) {
      if (a.id !== b.id) {
        row.set(b.id, euclideanDistance(a, b));
      }
    }
    matrix.set(a.id, row);
  }
  return matrix;
}

/**
 * Solves the TSP using the Nearest-Neighbor heuristic.
 *
 * Algorithm:
 * 1. Start at the depot (backroom entrance).
 * 2. At each step, move to the nearest unvisited location.
 * 3. Repeat until all locations have been visited.
 * 4. Return to the depot.
 *
 * Time Complexity: O(n²) where n = number of locations.
 * This is a greedy heuristic — it does NOT guarantee the global optimum,
 * but produces a good-enough route for real-time use in retail settings.
 *
 * @param {Object} depot - Starting point {id, x, y} (backroom entrance).
 * @param {Array<Object>} stops - Locations to visit {id, x, y, ...metadata}.
 * @returns {Object} Optimized route with sequence, distances, and directions.
 */
function solveNearestNeighborTSP(depot, stops) {
  if (stops.length === 0) {
    return {
      sequence: [],
      totalDistance: 0,
      estimatedTime: 0,
      directions: [],
    };
  }

  // Build the full set of locations (depot + all stops)
  const allLocations = [depot, ...stops];
  const distMatrix = buildDistanceMatrix(allLocations);

  // Nearest-neighbor traversal
  const visited = [];
  const unvisited = new Set(stops.map(s => s.id));
  let currentId = depot.id;
  let totalDistance = 0;

  while (unvisited.size > 0) {
    const currentDistances = distMatrix.get(currentId);
    let nearestId = null;
    let nearestDist = Infinity;

    for (const candidateId of unvisited) {
      const dist = currentDistances.get(candidateId);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = candidateId;
      }
    }

    totalDistance += nearestDist;
    visited.push({
      id: nearestId,
      distFromPrev: nearestDist,
      stop: stops.find(s => s.id === nearestId),
    });
    unvisited.delete(nearestId);
    currentId = nearestId;
  }

  // Return leg (back to depot)
  const returnDist = distMatrix.get(currentId).get(depot.id);
  totalDistance += returnDist;

  // Build turn-by-turn directions
  const directions = visited.map((v, idx) => {
    const fromLabel = idx === 0
      ? 'Backroom Bay A'
      : `Shelf ${visited[idx - 1].stop.shelfCode}`;

    return {
      stepNumber: idx + 1,
      instruction: `From ${fromLabel} → proceed to Shelf ${v.stop.shelfCode} (${v.stop.zoneName} zone)`,
      distance: Math.round(v.distFromPrev * 10) / 10,
      targetShelf: v.stop.shelfCode,
      productName: v.stop.productName || 'Unknown',
      quantity: v.stop.quantity || 0,
    };
  });

  // Estimated time at 1.2 m/s walking speed (~4.3 km/h)
  // Plus 30 seconds per stop for physical restocking
  const WALK_SPEED = 1.2; // meters per second
  const STOP_TIME = 30;   // seconds per stop
  const walkTimeMin = totalDistance / WALK_SPEED / 60;
  const stopTimeMin = (visited.length * STOP_TIME) / 60;
  const estimatedTime = Math.round((walkTimeMin + stopTimeMin) * 10) / 10;

  return {
    sequence: visited.map(v => v.id),
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedTime,
    directions,
  };
}

/**
 * Optional 2-opt improvement pass on the nearest-neighbor solution.
 * Iteratively reverses sub-segments of the route to reduce total distance.
 *
 * @param {Array<Object>} route - Ordered stops from nearest-neighbor.
 * @param {Map} distMatrix - Pre-computed distance matrix.
 * @param {number} maxIterations - Maximum improvement iterations.
 * @returns {Array<Object>} Improved route ordering.
 */
function twoOptImprove(route, distMatrix, maxIterations = 100) {
  let improved = true;
  let iteration = 0;
  const current = [...route];

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < current.length - 1; i++) {
      for (let j = i + 2; j < current.length; j++) {
        const a = current[i].id;
        const b = current[i + 1].id;
        const c = current[j].id;
        const d = j + 1 < current.length ? current[j + 1].id : null;

        const currentDist =
          distMatrix.get(a).get(b) +
          (d ? distMatrix.get(c).get(d) : 0);

        const newDist =
          distMatrix.get(a).get(c) +
          (d ? distMatrix.get(b).get(d) : 0);

        if (newDist < currentDist) {
          // Reverse the segment between i+1 and j
          const segment = current.slice(i + 1, j + 1).reverse();
          current.splice(i + 1, j - i, ...segment);
          improved = true;
        }
      }
    }
  }

  return current;
}

module.exports = {
  euclideanDistance,
  buildDistanceMatrix,
  solveNearestNeighborTSP,
  twoOptImprove,
};
