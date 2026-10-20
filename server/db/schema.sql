-- =============================================================================
-- SIM — Spatial Inventory Management System
-- PostgreSQL + PostGIS Database Schema
-- =============================================================================
-- Uses local coordinate system (meters from store origin, SRID 0)
-- for indoor spatial operations.
-- =============================================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Store Zones ──────────────────────────────────────────────────────────────
-- Represents physical sections within the store (e.g., Produce, Dairy).
-- Uses a Polygon geometry for zone boundaries.
CREATE TABLE store_zones (
    zone_id     VARCHAR(36) PRIMARY KEY,
    zone_name   VARCHAR(100) NOT NULL,
    color       VARCHAR(7) NOT NULL,              -- Hex color for UI rendering
    bounds_x    NUMERIC(6,2) NOT NULL,
    bounds_y    NUMERIC(6,2) NOT NULL,
    bounds_w    NUMERIC(6,2) NOT NULL,
    bounds_h    NUMERIC(6,2) NOT NULL,
    -- PostGIS polygon from bounding box (computed on insert/update)
    geom        GEOMETRY(Polygon, 0),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-generate the polygon geometry from bounding box values
CREATE OR REPLACE FUNCTION update_zone_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_MakeEnvelope(
        NEW.bounds_x,
        NEW.bounds_y,
        NEW.bounds_x + NEW.bounds_w,
        NEW.bounds_y + NEW.bounds_h,
        0  -- SRID 0 for local coordinate system
    );
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_zone_geom
    BEFORE INSERT OR UPDATE ON store_zones
    FOR EACH ROW EXECUTE FUNCTION update_zone_geom();

-- Spatial index on zone polygons
CREATE INDEX idx_store_zones_geom ON store_zones USING GIST(geom);

-- ── Shelf Units ──────────────────────────────────────────────────────────────
-- Represents physical shelf units on the store floor.
-- Uses a Point geometry for the shelf's centroid position.
CREATE TABLE shelf_units (
    shelf_id        VARCHAR(36) PRIMARY KEY,
    shelf_code      VARCHAR(20) NOT NULL UNIQUE,
    zone_id         VARCHAR(36) NOT NULL REFERENCES store_zones(zone_id),
    pos_x           NUMERIC(6,2) NOT NULL,        -- X position in meters
    pos_y           NUMERIC(6,2) NOT NULL,        -- Y position in meters
    dim_width       NUMERIC(4,2) NOT NULL DEFAULT 3.0,
    dim_height      NUMERIC(4,2) NOT NULL DEFAULT 1.2,
    total_capacity  INTEGER NOT NULL DEFAULT 100,
    fill_percentage NUMERIC(5,2) DEFAULT 0,
    rotation        NUMERIC(5,2) DEFAULT 0,
    -- PostGIS point geometry (auto-set from pos_x, pos_y)
    location        GEOMETRY(Point, 0),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-generate point geometry from position coordinates
CREATE OR REPLACE FUNCTION update_shelf_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.pos_x, NEW.pos_y), 0);
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_shelf_location
    BEFORE INSERT OR UPDATE ON shelf_units
    FOR EACH ROW EXECUTE FUNCTION update_shelf_location();

-- Spatial index on shelf locations for nearest-neighbor queries
CREATE INDEX idx_shelf_units_location ON shelf_units USING GIST(location);

-- ── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE products (
    product_id  VARCHAR(36) PRIMARY KEY,
    sku         VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url   TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Inventory ────────────────────────────────────────────────────────────────
-- Links products to shelf locations with stock quantities.
CREATE TABLE inventory (
    inventory_id    VARCHAR(36) PRIMARY KEY,
    product_id      VARCHAR(36) NOT NULL REFERENCES products(product_id),
    shelf_id        VARCHAR(36) NOT NULL REFERENCES shelf_units(shelf_id),
    zone_id         VARCHAR(36) NOT NULL REFERENCES store_zones(zone_id),
    quantity        INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    capacity        INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
    reorder_point   INTEGER NOT NULL DEFAULT 10 CHECK (reorder_point >= 0),
    backroom_stock  INTEGER NOT NULL DEFAULT 0 CHECK (backroom_stock >= 0),
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by shelf and product
CREATE INDEX idx_inventory_shelf ON inventory(shelf_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_zone ON inventory(zone_id);

-- ── Replenishment Tasks ──────────────────────────────────────────────────────
CREATE TABLE replenishment_tasks (
    task_id         VARCHAR(36) PRIMARY KEY,
    inventory_id    VARCHAR(36) NOT NULL REFERENCES inventory(inventory_id),
    from_location   VARCHAR(255) NOT NULL DEFAULT 'Backroom Bay A',
    to_shelf_id     VARCHAR(36) NOT NULL REFERENCES shelf_units(shelf_id),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    priority        VARCHAR(10) NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('high', 'medium', 'low')),
    completed       BOOLEAN DEFAULT FALSE,
    assigned_to     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE INDEX idx_replenishment_tasks_pending ON replenishment_tasks(completed)
    WHERE completed = FALSE;

-- ── Restock Routes (persisted route history) ─────────────────────────────────
CREATE TABLE restock_routes (
    route_id        SERIAL PRIMARY KEY,
    task_ids        TEXT[] NOT NULL,               -- Ordered array of task IDs
    total_distance  NUMERIC(8,2) NOT NULL,
    estimated_time  NUMERIC(6,2) NOT NULL,         -- In minutes
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP
);

-- =============================================================================
-- Spatial Query Views
-- =============================================================================

-- ── Low Stock Alerts View ────────────────────────────────────────────────────
-- Surfaces all inventory items that are at or below their reorder point
CREATE OR REPLACE VIEW v_stock_alerts AS
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
        WHEN i.quantity <= (i.reorder_point * 0.5) THEN 'critical'
        WHEN i.quantity <= i.reorder_point THEN 'warning'
        ELSE 'ok'
    END AS severity,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN shelf_units s ON i.shelf_id = s.shelf_id
JOIN store_zones z ON i.zone_id = z.zone_id
WHERE i.quantity <= i.reorder_point
ORDER BY
    CASE
        WHEN i.quantity = 0 THEN 1
        WHEN i.quantity <= (i.reorder_point * 0.5) THEN 2
        ELSE 3
    END,
    i.last_updated DESC;

-- ── Space Utilization View ───────────────────────────────────────────────────
-- Calculates average fill percentage per zone
CREATE OR REPLACE VIEW v_zone_utilization AS
SELECT
    z.zone_id,
    z.zone_name,
    z.color,
    COUNT(s.shelf_id) AS shelf_count,
    ROUND(AVG(s.fill_percentage)::numeric, 1) AS avg_utilization,
    SUM(s.total_capacity) AS total_capacity
FROM store_zones z
LEFT JOIN shelf_units s ON s.zone_id = z.zone_id
GROUP BY z.zone_id, z.zone_name, z.color
ORDER BY z.zone_name;

-- =============================================================================
-- Spatial Query Examples
-- =============================================================================

-- Find the 5 nearest shelves to a given point (e.g., the backroom entrance at 20,30)
-- SELECT shelf_code, pos_x, pos_y,
--        ST_Distance(location, ST_SetSRID(ST_MakePoint(20, 30), 0)) AS distance_m
-- FROM shelf_units
-- ORDER BY location <-> ST_SetSRID(ST_MakePoint(20, 30), 0)
-- LIMIT 5;

-- Find all shelves within a specific zone (using spatial containment)
-- SELECT s.shelf_code, z.zone_name
-- FROM shelf_units s
-- JOIN store_zones z ON ST_Contains(z.geom, s.location)
-- ORDER BY z.zone_name, s.shelf_code;

-- Calculate Euclidean distance matrix between all shelves (for TSP input)
-- SELECT a.shelf_code AS from_shelf,
--        b.shelf_code AS to_shelf,
--        ST_Distance(a.location, b.location) AS distance_m
-- FROM shelf_units a
-- CROSS JOIN shelf_units b
-- WHERE a.shelf_id != b.shelf_id
-- ORDER BY a.shelf_code, distance_m;
