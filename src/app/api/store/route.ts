import { databaseError, getTursoClient } from '@/lib/turso';
import type { InventoryItem, Product, ShelfUnit, StoreZone, ReplenishmentTask } from '@/types';

export const dynamic = 'force-dynamic';

type Row = Record<string, string | number | null>;

export async function GET() {
  try {
    const db = getTursoClient();
    const [zonesResult, shelvesResult, inventoryResult, tasksResult] = await Promise.all([
      db.execute('SELECT zone_id, zone_name, color, bounds_x, bounds_y, bounds_w, bounds_h FROM store_zones ORDER BY zone_name'),
      db.execute('SELECT shelf_id, shelf_code, zone_id, pos_x, pos_y, dim_width, dim_height, total_capacity, fill_percentage, rotation FROM shelf_units ORDER BY shelf_code'),
      db.execute(`
        SELECT i.inventory_id, i.product_id, i.shelf_id, i.zone_id, i.quantity, i.capacity,
               i.reorder_point, i.backroom_stock, i.last_updated,
               p.sku, p.name AS product_name, p.category, p.price, p.image_url
        FROM inventory i
        JOIN products p ON p.product_id = i.product_id
        ORDER BY p.name
      `),
      db.execute(`
        SELECT t.task_id, t.inventory_id, t.from_location, t.to_shelf_id, t.quantity, t.priority,
               t.completed, p.name AS product_name, p.sku, s.shelf_code, z.zone_name
        FROM replenishment_tasks t
        JOIN inventory i ON i.inventory_id = t.inventory_id
        JOIN products p ON p.product_id = i.product_id
        JOIN shelf_units s ON s.shelf_id = t.to_shelf_id
        JOIN store_zones z ON z.zone_id = s.zone_id
        ORDER BY CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, t.created_at
      `),
    ]);

    const zones: StoreZone[] = zonesResult.rows.map((raw) => {
      const row = raw as Row;
      return {
        id: String(row.zone_id),
        name: String(row.zone_name),
        color: String(row.color),
        bounds: {
          x: Number(row.bounds_x),
          y: Number(row.bounds_y),
          width: Number(row.bounds_w),
          height: Number(row.bounds_h),
        },
      };
    });

    const shelves: ShelfUnit[] = shelvesResult.rows.map((raw) => {
      const row = raw as Row;
      return {
        id: String(row.shelf_id),
        code: String(row.shelf_code),
        zoneId: String(row.zone_id),
        position: { x: Number(row.pos_x), y: Number(row.pos_y) },
        dimensions: { width: Number(row.dim_width), height: Number(row.dim_height) },
        totalCapacity: Number(row.total_capacity),
        fillPercentage: Number(row.fill_percentage ?? 0),
        rotation: Number(row.rotation ?? 0),
      };
    });

    const shelfMap = new Map(shelves.map((shelf) => [shelf.id, shelf]));
    const inventoryItems: InventoryItem[] = inventoryResult.rows.map((raw) => {
      const row = raw as Row;
      const shelf = shelfMap.get(String(row.shelf_id));
      if (!shelf) throw new Error(`Inventory item ${String(row.inventory_id)} references a missing shelf.`);
      const product: Product = {
        id: String(row.product_id),
        sku: String(row.sku),
        name: String(row.product_name),
        category: String(row.category ?? ''),
        price: Number(row.price),
        imageUrl: row.image_url == null ? undefined : String(row.image_url),
      };

      return {
        id: String(row.inventory_id),
        productId: product.id,
        product,
        shelfId: shelf.id,
        shelf,
        zoneId: String(row.zone_id),
        quantity: Number(row.quantity),
        capacity: Number(row.capacity),
        reorderPoint: Number(row.reorder_point),
        backroomStock: Number(row.backroom_stock),
        lastUpdated: String(row.last_updated ?? ''),
      };
    });

    const replenishmentTasks: ReplenishmentTask[] = tasksResult.rows.map((raw) => {
      const row = raw as Row;
      return {
        id: String(row.task_id),
        inventoryItemId: String(row.inventory_id),
        productName: String(row.product_name),
        sku: String(row.sku),
        fromLocation: String(row.from_location),
        toShelfCode: String(row.shelf_code),
        toShelfId: String(row.to_shelf_id),
        toZoneName: String(row.zone_name),
        quantity: Number(row.quantity),
        priority: row.priority === 'high' || row.priority === 'low' ? row.priority : 'medium',
        completed: Boolean(row.completed),
      };
    });

    return Response.json({
      success: true,
      data: { zones, shelves, inventoryItems, replenishmentTasks },
    });
  } catch (error) {
    return databaseError(error);
  }
}
