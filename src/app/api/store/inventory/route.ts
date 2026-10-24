import { databaseError, getTursoClient } from '@/lib/turso';
import { randomUUID } from 'node:crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const sku = typeof body.sku === 'string' ? body.sku.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const quantity = Number(body.quantity);
    const capacity = Number(body.capacity);
    const reorderPoint = Number(body.reorderPoint);
    const price = Number(body.price);

    if (!name || !sku || !category || !Number.isInteger(quantity) || quantity < 0 ||
      !Number.isInteger(capacity) || capacity < 1 || quantity > capacity ||
      !Number.isInteger(reorderPoint) || reorderPoint < 0 || !Number.isFinite(price) || price < 0) {
      return Response.json({ success: false, error: 'Enter valid product and inventory values.' }, { status: 400 });
    }

    const db = getTursoClient();
    const shelfResult = await db.execute({
      sql: `SELECT s.shelf_id, s.zone_id FROM shelf_units s
            JOIN store_zones z ON z.zone_id = s.zone_id
            WHERE z.zone_name = ? ORDER BY s.shelf_code LIMIT 1`,
      args: [category],
    });
    const shelf = shelfResult.rows[0];
    if (!shelf) {
      return Response.json({ success: false, error: `No shelf is configured for ${category}.` }, { status: 400 });
    }

    const productId = randomUUID();
    const inventoryId = randomUUID();
    const now = new Date().toISOString();
    const transaction = await db.transaction('write');
    try {
      await transaction.execute({
        sql: 'INSERT INTO products (product_id, sku, name, category, price) VALUES (?, ?, ?, ?, ?)',
        args: [productId, sku, name, category, price],
      });
      await transaction.execute({
        sql: `INSERT INTO inventory
              (inventory_id, product_id, shelf_id, zone_id, quantity, capacity, reorder_point, backroom_stock, last_updated)
              VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        args: [inventoryId, productId, String(shelf.shelf_id), String(shelf.zone_id), quantity, capacity, reorderPoint, now],
      });
      await transaction.execute({
        sql: `UPDATE shelf_units SET fill_percentage = COALESCE(
                (SELECT ROUND(100.0 * SUM(quantity) / NULLIF(SUM(capacity), 0), 1)
                 FROM inventory WHERE shelf_id = ?), fill_percentage)
              WHERE shelf_id = ?`,
        args: [String(shelf.shelf_id), String(shelf.shelf_id)],
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return Response.json({ success: true, data: { id: inventoryId } }, { status: 201 });
  } catch (error) {
    return databaseError(error);
  }
}
