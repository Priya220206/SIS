import type { ReplenishmentRoute, ReplenishmentTask, RouteDirection, ShelfUnit, StoreZone } from '@/types';

export const STORE_DIMENSIONS = { width: 40, height: 30 };
export const BACKROOM_POSITION = { x: 20, y: 30 };

export function buildOptimizedRoute(
  tasks: ReplenishmentTask[],
  shelves: ShelfUnit[]
): ReplenishmentRoute {
  const shelfById = new Map(shelves.map((shelf) => [shelf.id, shelf]));
  const unvisited = tasks.flatMap((task) => {
    const shelf = shelfById.get(task.toShelfId);
    return shelf ? [{ task, shelf }] : [];
  });
  const ordered: typeof unvisited = [];
  let current = BACKROOM_POSITION;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < unvisited.length; index += 1) {
      const position = unvisited[index].shelf.position;
      const distance = Math.hypot(current.x - position.x, current.y - position.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }
    const [stop] = unvisited.splice(nearestIndex, 1);
    totalDistance += nearestDistance;
    current = stop.shelf.position;
    ordered.push(stop);
  }

  if (ordered.length) {
    const lastPosition = ordered[ordered.length - 1].shelf.position;
    totalDistance += Math.hypot(lastPosition.x - BACKROOM_POSITION.x, lastPosition.y - BACKROOM_POSITION.y);
  }

  const directions: RouteDirection[] = ordered.map((stop, index) => {
    const previous = index === 0 ? BACKROOM_POSITION : ordered[index - 1].shelf.position;
    const distance = Math.hypot(previous.x - stop.shelf.position.x, previous.y - stop.shelf.position.y);
    const from = index === 0 ? 'Backroom Bay A' : `Shelf ${ordered[index - 1].shelf.code}`;
    return {
      stepNumber: index + 1,
      instruction: `From ${from} → proceed to Shelf ${stop.shelf.code} (${stop.task.toZoneName} zone)`,
      distance: Math.round(distance * 10) / 10,
      targetShelf: stop.shelf.code,
      productName: stop.task.productName,
      quantity: stop.task.quantity,
    };
  });

  return {
    sequence: ordered.map(({ task }) => task.id),
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedTime: Math.round((totalDistance / 1.2 / 60) * 10) / 10,
    directions,
  };
}

export function getStoreDimensions(zones: StoreZone[]) {
  return {
    width: Math.max(STORE_DIMENSIONS.width, ...zones.map((zone) => zone.bounds.x + zone.bounds.width)),
    height: Math.max(STORE_DIMENSIONS.height, ...zones.map((zone) => zone.bounds.y + zone.bounds.height)),
  };
}
