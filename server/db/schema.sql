-- Turso / SQLite schema for SIM.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS store_zones (
  zone_id TEXT PRIMARY KEY,
  zone_name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  bounds_x REAL NOT NULL,
  bounds_y REAL NOT NULL,
  bounds_w REAL NOT NULL,
  bounds_h REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shelf_units (
  shelf_id TEXT PRIMARY KEY,
  shelf_code TEXT NOT NULL UNIQUE,
  zone_id TEXT NOT NULL REFERENCES store_zones(zone_id),
  pos_x REAL NOT NULL,
  pos_y REAL NOT NULL,
  dim_width REAL NOT NULL DEFAULT 3,
  dim_height REAL NOT NULL DEFAULT 1.2,
  total_capacity INTEGER NOT NULL DEFAULT 100 CHECK (total_capacity > 0),
  fill_percentage REAL NOT NULL DEFAULT 0 CHECK (fill_percentage BETWEEN 0 AND 100),
  rotation REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shelf_units_zone ON shelf_units(zone_id);

CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  inventory_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(product_id),
  shelf_id TEXT NOT NULL REFERENCES shelf_units(shelf_id),
  zone_id TEXT NOT NULL REFERENCES store_zones(zone_id),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
  reorder_point INTEGER NOT NULL DEFAULT 10 CHECK (reorder_point >= 0),
  backroom_stock INTEGER NOT NULL DEFAULT 0 CHECK (backroom_stock >= 0),
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, shelf_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_shelf ON inventory(shelf_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_zone ON inventory(zone_id);

CREATE TABLE IF NOT EXISTS replenishment_tasks (
  task_id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL REFERENCES inventory(inventory_id),
  from_location TEXT NOT NULL DEFAULT 'Backroom Bay A',
  to_shelf_id TEXT NOT NULL REFERENCES shelf_units(shelf_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  assigned_to TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_replenishment_tasks_pending ON replenishment_tasks(completed, priority);

CREATE TABLE IF NOT EXISTS restock_routes (
  route_id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_ids TEXT NOT NULL,
  total_distance REAL NOT NULL,
  estimated_time REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE VIEW IF NOT EXISTS v_stock_alerts AS
SELECT
  i.inventory_id,
  p.name AS product_name,
  p.sku,
  s.shelf_code,
  z.zone_name,
  i.quantity,
  i.capacity,
  i.reorder_point,
  CASE
    WHEN i.quantity = 0 THEN 'stockout'
    WHEN i.quantity <= i.reorder_point * 0.5 THEN 'critical'
    ELSE 'warning'
  END AS severity,
  i.last_updated
FROM inventory i
JOIN products p ON p.product_id = i.product_id
JOIN shelf_units s ON s.shelf_id = i.shelf_id
JOIN store_zones z ON z.zone_id = i.zone_id
WHERE i.quantity <= i.reorder_point;

CREATE VIEW IF NOT EXISTS v_zone_utilization AS
SELECT
  z.zone_id,
  z.zone_name,
  z.color,
  COUNT(s.shelf_id) AS shelf_count,
  ROUND(AVG(s.fill_percentage), 1) AS avg_utilization,
  SUM(s.total_capacity) AS total_capacity
FROM store_zones z
LEFT JOIN shelf_units s ON s.zone_id = z.zone_id
GROUP BY z.zone_id, z.zone_name, z.color;
