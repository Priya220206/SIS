import { databaseError, getTursoClient } from '@/lib/turso';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const capacity = Number(body.capacity);
    const reorderPoint = Number(body.reorderPoint);
    if (!Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(reorderPoint) || reorderPoint < 0) {
      return Response.json({ success: false, error: 'Capacity and reorder point must be valid whole numbers.' }, { status: 400 });
    }

    const db = getTursoClient();
    const transaction = await db.transaction('write');
    try {
      const current = await transaction.execute({
        sql: 'SELECT quantity, shelf_id FROM inventory WHERE inventory_id = ?',
        args: [id],
      });
      if (!current.rows.length) {
        await transaction.rollback();
        return Response.json({ success: false, error: 'Inventory item not found.' }, { status: 404 });
      }
      if (capacity < Number(current.rows[0].quantity)) {
        await transaction.rollback();
        return Response.json({ success: false, error: 'Capacity cannot be lower than the current quantity.' }, { status: 400 });
      }
      await transaction.execute({
        sql: 'UPDATE inventory SET capacity = ?, reorder_point = ?, last_updated = CURRENT_TIMESTAMP WHERE inventory_id = ?',
        args: [capacity, reorderPoint, id],
      });
      await transaction.execute({
        sql: `UPDATE shelf_units SET fill_percentage = COALESCE(
                (SELECT ROUND(100.0 * SUM(quantity) / NULLIF(SUM(capacity), 0), 1)
                 FROM inventory WHERE shelf_id = shelf_units.shelf_id), fill_percentage)
              WHERE shelf_id = ?`,
        args: [String(current.rows[0].shelf_id)],
      });
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
