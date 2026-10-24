import { databaseError, getTursoClient, StoreApiError } from '@/lib/turso';

type ShelfChange = {
  id: string;
  code: string;
  zoneId: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  totalCapacity: number;
};

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const shelves: unknown = body.shelves;
    if (!Array.isArray(shelves) || shelves.length === 0) {
      return Response.json({ success: false, error: 'At least one shelf is required.' }, { status: 400 });
    }

    const db = getTursoClient();
    const transaction = await db.transaction('write');
    try {
      for (const value of shelves) {
        const shelf = value as ShelfChange;
        if (typeof shelf.id !== 'string' || typeof shelf.code !== 'string' || typeof shelf.zoneId !== 'string' ||
          !Number.isFinite(shelf.position?.x) || shelf.position.x < 0 ||
          !Number.isFinite(shelf.position?.y) || shelf.position.y < 0 ||
          !Number.isFinite(shelf.dimensions?.width) || shelf.dimensions.width <= 0 ||
          !Number.isFinite(shelf.dimensions?.height) || shelf.dimensions.height <= 0 ||
          !Number.isInteger(shelf.totalCapacity) || shelf.totalCapacity < 1) {
          throw new StoreApiError('Invalid shelf layout values.', 400);
        }
        await transaction.execute({
          sql: `INSERT INTO shelf_units
                (shelf_id, shelf_code, zone_id, pos_x, pos_y, dim_width, dim_height, total_capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(shelf_id) DO UPDATE SET shelf_code = excluded.shelf_code,
                  zone_id = excluded.zone_id, pos_x = excluded.pos_x, pos_y = excluded.pos_y,
                  dim_width = excluded.dim_width, dim_height = excluded.dim_height,
                  total_capacity = excluded.total_capacity, updated_at = CURRENT_TIMESTAMP`,
          args: [shelf.id, shelf.code, shelf.zoneId, shelf.position.x, shelf.position.y,
            shelf.dimensions.width, shelf.dimensions.height, shelf.totalCapacity],
        });
        await transaction.execute({
          sql: 'UPDATE inventory SET zone_id = ? WHERE shelf_id = ?',
          args: [shelf.zoneId, shelf.id],
        });
      }

      const shelfIds = shelves.map((shelf: ShelfChange) => shelf.id);
      const placeholders = shelfIds.map(() => '?').join(', ');
      const removed = await transaction.execute({
        sql: `SELECT shelf_id FROM shelf_units WHERE shelf_id NOT IN (${placeholders})`,
        args: shelfIds,
      });
      for (const row of removed.rows) {
        const referenced = await transaction.execute({
          sql: `SELECT 1 FROM inventory WHERE shelf_id = ?
                UNION ALL SELECT 1 FROM replenishment_tasks WHERE to_shelf_id = ? LIMIT 1`,
          args: [String(row.shelf_id), String(row.shelf_id)],
        });
        if (referenced.rows.length) {
          throw new StoreApiError('A shelf with inventory or replenishment history cannot be deleted.', 409);
        }
        await transaction.execute({
          sql: 'DELETE FROM shelf_units WHERE shelf_id = ?',
          args: [String(row.shelf_id)],
        });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    return databaseError(error);
  }
}
