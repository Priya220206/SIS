import { databaseError, getTursoClient } from '@/lib/turso';

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getTursoClient();
    const transaction = await db.transaction('write');
    try {
      const result = await transaction.execute({
        sql: `UPDATE replenishment_tasks SET completed = 1, completed_at = CURRENT_TIMESTAMP
              WHERE task_id = ? AND completed = 0`,
        args: [id],
      });
      if (Number(result.rowsAffected) === 0) {
        await transaction.rollback();
        return Response.json({ success: false, error: 'Pending replenishment task not found.' }, { status: 404 });
      }
      await transaction.execute({
        sql: `UPDATE inventory SET
                quantity = quantity + MIN(
                  (SELECT quantity FROM replenishment_tasks WHERE task_id = ?),
                  backroom_stock, capacity - quantity
                ),
                backroom_stock = backroom_stock - MIN(
                  (SELECT quantity FROM replenishment_tasks WHERE task_id = ?),
                  backroom_stock, capacity - quantity
                ),
                last_updated = CURRENT_TIMESTAMP
              WHERE inventory_id = (SELECT inventory_id FROM replenishment_tasks WHERE task_id = ?)`,
        args: [id, id, id],
      });
      await transaction.execute({
        sql: `UPDATE shelf_units SET fill_percentage = COALESCE(
                (SELECT ROUND(100.0 * SUM(quantity) / NULLIF(SUM(capacity), 0), 1)
                 FROM inventory WHERE shelf_id = shelf_units.shelf_id), fill_percentage)
              WHERE shelf_id = (SELECT to_shelf_id FROM replenishment_tasks WHERE task_id = ?)`,
        args: [id],
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
