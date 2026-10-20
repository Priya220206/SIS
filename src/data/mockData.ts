// =============================================================================
// SIM — Comprehensive Mock Data
// Store dimensions: 40m × 30m (origin at top-left corner)
// =============================================================================

import {
  StoreZone, ShelfUnit, Product, InventoryItem, StockAlert,
  ReplenishmentTask, ReplenishmentRoute, RouteDirection,
  DashboardMetrics, ZoneUtilization, StockTrend, getStockStatus
} from '@/types';

// ---------------------------------------------------------------------------
// Store Zones — 6 retail sections
// ---------------------------------------------------------------------------
export const storeZones: StoreZone[] = [
  { id: 'z1', name: 'Produce',      color: '#22c55e', bounds: { x: 1,  y: 1,  width: 12, height: 13 } },
  { id: 'z2', name: 'Dairy',        color: '#3b82f6', bounds: { x: 14, y: 1,  width: 12, height: 13 } },
  { id: 'z3', name: 'Bakery',       color: '#f59e0b', bounds: { x: 27, y: 1,  width: 12, height: 13 } },
  { id: 'z4', name: 'Electronics',  color: '#8b5cf6', bounds: { x: 1,  y: 16, width: 12, height: 13 } },
  { id: 'z5', name: 'Household',    color: '#06b6d4', bounds: { x: 14, y: 16, width: 12, height: 13 } },
  { id: 'z6', name: 'Snacks',       color: '#ef4444', bounds: { x: 27, y: 16, width: 12, height: 13 } },
];

// ---------------------------------------------------------------------------
// Shelf Units — 24 shelves across all zones
// ---------------------------------------------------------------------------
export const shelfUnits: ShelfUnit[] = [
  // Produce (z1)
  { id: 's1',  code: 'P-01', zoneId: 'z1', position: { x: 3,  y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 120, fillPercentage: 85 },
  { id: 's2',  code: 'P-02', zoneId: 'z1', position: { x: 3,  y: 6  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 100, fillPercentage: 42 },
  { id: 's3',  code: 'P-03', zoneId: 'z1', position: { x: 3,  y: 9  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 80,  fillPercentage: 15 },
  { id: 's4',  code: 'P-04', zoneId: 'z1', position: { x: 8,  y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 110, fillPercentage: 92 },
  // Dairy (z2)
  { id: 's5',  code: 'D-01', zoneId: 'z2', position: { x: 16, y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 90,  fillPercentage: 78 },
  { id: 's6',  code: 'D-02', zoneId: 'z2', position: { x: 16, y: 6  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 95,  fillPercentage: 8  },
  { id: 's7',  code: 'D-03', zoneId: 'z2', position: { x: 16, y: 9  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 85,  fillPercentage: 55 },
  { id: 's8',  code: 'D-04', zoneId: 'z2', position: { x: 21, y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 100, fillPercentage: 0  },
  // Bakery (z3)
  { id: 's9',  code: 'B-01', zoneId: 'z3', position: { x: 29, y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 60,  fillPercentage: 90 },
  { id: 's10', code: 'B-02', zoneId: 'z3', position: { x: 29, y: 6  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 70,  fillPercentage: 65 },
  { id: 's11', code: 'B-03', zoneId: 'z3', position: { x: 29, y: 9  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 55,  fillPercentage: 22 },
  { id: 's12', code: 'B-04', zoneId: 'z3', position: { x: 34, y: 3  }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 65,  fillPercentage: 48 },
  // Electronics (z4)
  { id: 's13', code: 'E-01', zoneId: 'z4', position: { x: 3,  y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 40,  fillPercentage: 75 },
  { id: 's14', code: 'E-02', zoneId: 'z4', position: { x: 3,  y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 35,  fillPercentage: 12 },
  { id: 's15', code: 'E-03', zoneId: 'z4', position: { x: 8,  y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 45,  fillPercentage: 60 },
  { id: 's16', code: 'E-04', zoneId: 'z4', position: { x: 8,  y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 30,  fillPercentage: 5  },
  // Household (z5)
  { id: 's17', code: 'H-01', zoneId: 'z5', position: { x: 16, y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 150, fillPercentage: 88 },
  { id: 's18', code: 'H-02', zoneId: 'z5', position: { x: 16, y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 130, fillPercentage: 35 },
  { id: 's19', code: 'H-03', zoneId: 'z5', position: { x: 21, y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 120, fillPercentage: 70 },
  { id: 's20', code: 'H-04', zoneId: 'z5', position: { x: 21, y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 140, fillPercentage: 52 },
  // Snacks (z6)
  { id: 's21', code: 'S-01', zoneId: 'z6', position: { x: 29, y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 200, fillPercentage: 95 },
  { id: 's22', code: 'S-02', zoneId: 'z6', position: { x: 29, y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 180, fillPercentage: 18 },
  { id: 's23', code: 'S-03', zoneId: 'z6', position: { x: 34, y: 18 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 160, fillPercentage: 40 },
  { id: 's24', code: 'S-04', zoneId: 'z6', position: { x: 34, y: 21 }, dimensions: { width: 3, height: 1.2 }, totalCapacity: 170, fillPercentage: 72 },
];

// ---------------------------------------------------------------------------
// Products — 50 SKUs
// ---------------------------------------------------------------------------
export const products: Product[] = [
  // Produce
  { id: 'p1',  sku: 'PRD-001', name: 'Organic Bananas',       category: 'Produce',     price: 1.29 },
  { id: 'p2',  sku: 'PRD-002', name: 'Red Apples (6-pack)',   category: 'Produce',     price: 4.99 },
  { id: 'p3',  sku: 'PRD-003', name: 'Baby Spinach 5oz',      category: 'Produce',     price: 3.49 },
  { id: 'p4',  sku: 'PRD-004', name: 'Avocados (3-pack)',     category: 'Produce',     price: 5.99 },
  { id: 'p5',  sku: 'PRD-005', name: 'Cherry Tomatoes',       category: 'Produce',     price: 3.99 },
  { id: 'p6',  sku: 'PRD-006', name: 'Romaine Lettuce',       category: 'Produce',     price: 2.49 },
  { id: 'p7',  sku: 'PRD-007', name: 'Fresh Strawberries',    category: 'Produce',     price: 4.49 },
  { id: 'p8',  sku: 'PRD-008', name: 'Sweet Potatoes',        category: 'Produce',     price: 1.99 },
  // Dairy
  { id: 'p9',  sku: 'DRY-001', name: 'Whole Milk 1 Gal',     category: 'Dairy',       price: 3.99 },
  { id: 'p10', sku: 'DRY-002', name: 'Greek Yogurt 32oz',     category: 'Dairy',       price: 5.49 },
  { id: 'p11', sku: 'DRY-003', name: 'Cheddar Cheese Block',  category: 'Dairy',       price: 6.99 },
  { id: 'p12', sku: 'DRY-004', name: 'Butter Unsalted',       category: 'Dairy',       price: 4.29 },
  { id: 'p13', sku: 'DRY-005', name: 'Cream Cheese 8oz',      category: 'Dairy',       price: 2.99 },
  { id: 'p14', sku: 'DRY-006', name: 'Oat Milk 64oz',         category: 'Dairy',       price: 4.49 },
  { id: 'p15', sku: 'DRY-007', name: 'Mozzarella Shredded',   category: 'Dairy',       price: 3.79 },
  { id: 'p16', sku: 'DRY-008', name: 'Heavy Cream 16oz',      category: 'Dairy',       price: 3.29 },
  // Bakery
  { id: 'p17', sku: 'BKR-001', name: 'Sourdough Loaf',        category: 'Bakery',      price: 5.99 },
  { id: 'p18', sku: 'BKR-002', name: 'Croissants (4-pack)',   category: 'Bakery',      price: 4.99 },
  { id: 'p19', sku: 'BKR-003', name: 'Multigrain Bread',      category: 'Bakery',      price: 4.49 },
  { id: 'p20', sku: 'BKR-004', name: 'Blueberry Muffins',     category: 'Bakery',      price: 6.49 },
  { id: 'p21', sku: 'BKR-005', name: 'Bagels (6-pack)',       category: 'Bakery',      price: 3.99 },
  { id: 'p22', sku: 'BKR-006', name: 'Cinnamon Rolls',        category: 'Bakery',      price: 7.49 },
  // Electronics
  { id: 'p23', sku: 'ELC-001', name: 'USB-C Cable 6ft',       category: 'Electronics', price: 12.99 },
  { id: 'p24', sku: 'ELC-002', name: 'Wireless Mouse',        category: 'Electronics', price: 24.99 },
  { id: 'p25', sku: 'ELC-003', name: 'AA Batteries (8-pack)', category: 'Electronics', price: 8.99 },
  { id: 'p26', sku: 'ELC-004', name: 'Screen Protector',      category: 'Electronics', price: 9.99 },
  { id: 'p27', sku: 'ELC-005', name: 'Phone Charger 20W',     category: 'Electronics', price: 19.99 },
  { id: 'p28', sku: 'ELC-006', name: 'Earbuds Wireless',      category: 'Electronics', price: 29.99 },
  { id: 'p29', sku: 'ELC-007', name: 'HDMI Cable 3ft',        category: 'Electronics', price: 7.99 },
  { id: 'p30', sku: 'ELC-008', name: 'Power Bank 10000mAh',   category: 'Electronics', price: 34.99 },
  // Household
  { id: 'p31', sku: 'HSH-001', name: 'Paper Towels (6-roll)', category: 'Household',   price: 11.99 },
  { id: 'p32', sku: 'HSH-002', name: 'Dish Soap 28oz',        category: 'Household',   price: 3.49 },
  { id: 'p33', sku: 'HSH-003', name: 'Laundry Detergent',     category: 'Household',   price: 12.99 },
  { id: 'p34', sku: 'HSH-004', name: 'Trash Bags (30ct)',     category: 'Household',   price: 8.99 },
  { id: 'p35', sku: 'HSH-005', name: 'Sponge Pack (3)',       category: 'Household',   price: 2.99 },
  { id: 'p36', sku: 'HSH-006', name: 'All-Purpose Cleaner',   category: 'Household',   price: 4.49 },
  { id: 'p37', sku: 'HSH-007', name: 'Aluminum Foil 75ft',    category: 'Household',   price: 5.99 },
  { id: 'p38', sku: 'HSH-008', name: 'Plastic Wrap 200ft',    category: 'Household',   price: 3.99 },
  // Snacks
  { id: 'p39', sku: 'SNK-001', name: 'Tortilla Chips 13oz',   category: 'Snacks',      price: 4.29 },
  { id: 'p40', sku: 'SNK-002', name: 'Salsa Medium 16oz',     category: 'Snacks',      price: 3.99 },
  { id: 'p41', sku: 'SNK-003', name: 'Trail Mix 26oz',        category: 'Snacks',      price: 9.99 },
  { id: 'p42', sku: 'SNK-004', name: 'Granola Bars (12ct)',   category: 'Snacks',      price: 5.49 },
  { id: 'p43', sku: 'SNK-005', name: 'Popcorn Microwave',     category: 'Snacks',      price: 4.99 },
  { id: 'p44', sku: 'SNK-006', name: 'Dark Chocolate Bar',    category: 'Snacks',      price: 3.49 },
  { id: 'p45', sku: 'SNK-007', name: 'Potato Chips BBQ',      category: 'Snacks',      price: 3.99 },
  { id: 'p46', sku: 'SNK-008', name: 'Pretzels 16oz',         category: 'Snacks',      price: 3.29 },
  { id: 'p47', sku: 'SNK-009', name: 'Mixed Nuts 24oz',       category: 'Snacks',      price: 11.99 },
  { id: 'p48', sku: 'SNK-010', name: 'Rice Crackers',         category: 'Snacks',      price: 4.99 },
  { id: 'p49', sku: 'PRD-009', name: 'Blueberries Organic',   category: 'Produce',     price: 5.99 },
  { id: 'p50', sku: 'DRY-009', name: 'Parmesan Wedge',        category: 'Dairy',       price: 8.99 },
];

// Helper to find objects by id
const shelfMap = new Map(shelfUnits.map(s => [s.id, s]));
const productMap = new Map(products.map(p => [p.id, p]));
const zoneMap = new Map(storeZones.map(z => [z.id, z]));

// ---------------------------------------------------------------------------
// Inventory — links products to shelves with quantities
// ---------------------------------------------------------------------------
const inventoryRaw: Omit<InventoryItem, 'product' | 'shelf'>[] = [
  // Produce shelves
  { id: 'inv1',  productId: 'p1',  shelfId: 's1',  zoneId: 'z1', quantity: 45, capacity: 60,  reorderPoint: 15, backroomStock: 120, lastUpdated: '2026-09-06T02:00:00Z' },
  { id: 'inv2',  productId: 'p2',  shelfId: 's1',  zoneId: 'z1', quantity: 30, capacity: 40,  reorderPoint: 10, backroomStock: 80,  lastUpdated: '2026-09-06T01:30:00Z' },
  { id: 'inv3',  productId: 'p3',  shelfId: 's2',  zoneId: 'z1', quantity: 8,  capacity: 50,  reorderPoint: 12, backroomStock: 60,  lastUpdated: '2026-09-06T01:00:00Z' },
  { id: 'inv4',  productId: 'p4',  shelfId: 's2',  zoneId: 'z1', quantity: 5,  capacity: 30,  reorderPoint: 8,  backroomStock: 40,  lastUpdated: '2026-09-06T00:45:00Z' },
  { id: 'inv5',  productId: 'p5',  shelfId: 's3',  zoneId: 'z1', quantity: 2,  capacity: 40,  reorderPoint: 10, backroomStock: 50,  lastUpdated: '2026-09-05T23:00:00Z' },
  { id: 'inv6',  productId: 'p6',  shelfId: 's3',  zoneId: 'z1', quantity: 0,  capacity: 25,  reorderPoint: 6,  backroomStock: 30,  lastUpdated: '2026-09-05T22:30:00Z' },
  { id: 'inv7',  productId: 'p7',  shelfId: 's4',  zoneId: 'z1', quantity: 52, capacity: 55,  reorderPoint: 14, backroomStock: 70,  lastUpdated: '2026-09-06T02:15:00Z' },
  { id: 'inv8',  productId: 'p8',  shelfId: 's4',  zoneId: 'z1', quantity: 48, capacity: 55,  reorderPoint: 12, backroomStock: 60,  lastUpdated: '2026-09-06T02:10:00Z' },
  // Dairy shelves
  { id: 'inv9',  productId: 'p9',  shelfId: 's5',  zoneId: 'z2', quantity: 35, capacity: 45,  reorderPoint: 10, backroomStock: 90,  lastUpdated: '2026-09-06T02:20:00Z' },
  { id: 'inv10', productId: 'p10', shelfId: 's5',  zoneId: 'z2', quantity: 28, capacity: 40,  reorderPoint: 8,  backroomStock: 60,  lastUpdated: '2026-09-06T01:50:00Z' },
  { id: 'inv11', productId: 'p11', shelfId: 's6',  zoneId: 'z2', quantity: 3,  capacity: 45,  reorderPoint: 10, backroomStock: 50,  lastUpdated: '2026-09-05T23:30:00Z' },
  { id: 'inv12', productId: 'p12', shelfId: 's6',  zoneId: 'z2', quantity: 1,  capacity: 50,  reorderPoint: 12, backroomStock: 45,  lastUpdated: '2026-09-05T22:00:00Z' },
  { id: 'inv13', productId: 'p13', shelfId: 's7',  zoneId: 'z2', quantity: 22, capacity: 40,  reorderPoint: 8,  backroomStock: 55,  lastUpdated: '2026-09-06T01:45:00Z' },
  { id: 'inv14', productId: 'p14', shelfId: 's7',  zoneId: 'z2', quantity: 18, capacity: 35,  reorderPoint: 8,  backroomStock: 40,  lastUpdated: '2026-09-06T01:40:00Z' },
  { id: 'inv15', productId: 'p15', shelfId: 's8',  zoneId: 'z2', quantity: 0,  capacity: 50,  reorderPoint: 10, backroomStock: 65,  lastUpdated: '2026-09-05T21:00:00Z' },
  { id: 'inv16', productId: 'p16', shelfId: 's8',  zoneId: 'z2', quantity: 0,  capacity: 50,  reorderPoint: 10, backroomStock: 55,  lastUpdated: '2026-09-05T20:30:00Z' },
  // Bakery shelves
  { id: 'inv17', productId: 'p17', shelfId: 's9',  zoneId: 'z3', quantity: 28, capacity: 30,  reorderPoint: 6,  backroomStock: 25,  lastUpdated: '2026-09-06T02:30:00Z' },
  { id: 'inv18', productId: 'p18', shelfId: 's9',  zoneId: 'z3', quantity: 25, capacity: 30,  reorderPoint: 6,  backroomStock: 30,  lastUpdated: '2026-09-06T02:25:00Z' },
  { id: 'inv19', productId: 'p19', shelfId: 's10', zoneId: 'z3', quantity: 20, capacity: 35,  reorderPoint: 8,  backroomStock: 40,  lastUpdated: '2026-09-06T02:00:00Z' },
  { id: 'inv20', productId: 'p20', shelfId: 's10', zoneId: 'z3', quantity: 15, capacity: 35,  reorderPoint: 8,  backroomStock: 35,  lastUpdated: '2026-09-06T01:55:00Z' },
  { id: 'inv21', productId: 'p21', shelfId: 's11', zoneId: 'z3', quantity: 4,  capacity: 30,  reorderPoint: 8,  backroomStock: 25,  lastUpdated: '2026-09-05T23:15:00Z' },
  { id: 'inv22', productId: 'p22', shelfId: 's11', zoneId: 'z3', quantity: 3,  capacity: 25,  reorderPoint: 6,  backroomStock: 20,  lastUpdated: '2026-09-05T23:00:00Z' },
  // Electronics shelves
  { id: 'inv23', productId: 'p23', shelfId: 's13', zoneId: 'z4', quantity: 15, capacity: 20,  reorderPoint: 5,  backroomStock: 30,  lastUpdated: '2026-09-06T02:10:00Z' },
  { id: 'inv24', productId: 'p24', shelfId: 's13', zoneId: 'z4', quantity: 12, capacity: 15,  reorderPoint: 4,  backroomStock: 20,  lastUpdated: '2026-09-06T02:05:00Z' },
  { id: 'inv25', productId: 'p25', shelfId: 's14', zoneId: 'z4', quantity: 2,  capacity: 20,  reorderPoint: 5,  backroomStock: 40,  lastUpdated: '2026-09-05T22:45:00Z' },
  { id: 'inv26', productId: 'p26', shelfId: 's14', zoneId: 'z4', quantity: 1,  capacity: 15,  reorderPoint: 4,  backroomStock: 25,  lastUpdated: '2026-09-05T22:30:00Z' },
  { id: 'inv27', productId: 'p27', shelfId: 's15', zoneId: 'z4', quantity: 10, capacity: 20,  reorderPoint: 5,  backroomStock: 35,  lastUpdated: '2026-09-06T01:30:00Z' },
  { id: 'inv28', productId: 'p28', shelfId: 's15', zoneId: 'z4', quantity: 8,  capacity: 15,  reorderPoint: 4,  backroomStock: 20,  lastUpdated: '2026-09-06T01:25:00Z' },
  { id: 'inv29', productId: 'p29', shelfId: 's16', zoneId: 'z4', quantity: 0,  capacity: 15,  reorderPoint: 4,  backroomStock: 18,  lastUpdated: '2026-09-05T21:30:00Z' },
  { id: 'inv30', productId: 'p30', shelfId: 's16', zoneId: 'z4', quantity: 1,  capacity: 15,  reorderPoint: 4,  backroomStock: 15,  lastUpdated: '2026-09-05T21:15:00Z' },
  // Household shelves
  { id: 'inv31', productId: 'p31', shelfId: 's17', zoneId: 'z5', quantity: 65, capacity: 75,  reorderPoint: 15, backroomStock: 100, lastUpdated: '2026-09-06T02:20:00Z' },
  { id: 'inv32', productId: 'p32', shelfId: 's17', zoneId: 'z5', quantity: 55, capacity: 60,  reorderPoint: 12, backroomStock: 80,  lastUpdated: '2026-09-06T02:15:00Z' },
  { id: 'inv33', productId: 'p33', shelfId: 's18', zoneId: 'z5', quantity: 10, capacity: 65,  reorderPoint: 15, backroomStock: 70,  lastUpdated: '2026-09-06T00:30:00Z' },
  { id: 'inv34', productId: 'p34', shelfId: 's18', zoneId: 'z5', quantity: 7,  capacity: 55,  reorderPoint: 12, backroomStock: 60,  lastUpdated: '2026-09-06T00:15:00Z' },
  { id: 'inv35', productId: 'p35', shelfId: 's19', zoneId: 'z5', quantity: 40, capacity: 60,  reorderPoint: 12, backroomStock: 55,  lastUpdated: '2026-09-06T01:50:00Z' },
  { id: 'inv36', productId: 'p36', shelfId: 's19', zoneId: 'z5', quantity: 32, capacity: 50,  reorderPoint: 10, backroomStock: 45,  lastUpdated: '2026-09-06T01:45:00Z' },
  { id: 'inv37', productId: 'p37', shelfId: 's20', zoneId: 'z5', quantity: 25, capacity: 70,  reorderPoint: 15, backroomStock: 50,  lastUpdated: '2026-09-06T01:00:00Z' },
  { id: 'inv38', productId: 'p38', shelfId: 's20', zoneId: 'z5', quantity: 18, capacity: 60,  reorderPoint: 12, backroomStock: 45,  lastUpdated: '2026-09-06T00:50:00Z' },
  // Snacks shelves
  { id: 'inv39', productId: 'p39', shelfId: 's21', zoneId: 'z6', quantity: 95, capacity: 100, reorderPoint: 20, backroomStock: 150, lastUpdated: '2026-09-06T02:30:00Z' },
  { id: 'inv40', productId: 'p40', shelfId: 's21', zoneId: 'z6', quantity: 88, capacity: 95,  reorderPoint: 18, backroomStock: 120, lastUpdated: '2026-09-06T02:25:00Z' },
  { id: 'inv41', productId: 'p41', shelfId: 's22', zoneId: 'z6', quantity: 6,  capacity: 90,  reorderPoint: 18, backroomStock: 80,  lastUpdated: '2026-09-05T23:45:00Z' },
  { id: 'inv42', productId: 'p42', shelfId: 's22', zoneId: 'z6', quantity: 4,  capacity: 85,  reorderPoint: 16, backroomStock: 75,  lastUpdated: '2026-09-05T23:30:00Z' },
  { id: 'inv43', productId: 'p43', shelfId: 's23', zoneId: 'z6', quantity: 25, capacity: 80,  reorderPoint: 16, backroomStock: 65,  lastUpdated: '2026-09-06T01:30:00Z' },
  { id: 'inv44', productId: 'p44', shelfId: 's23', zoneId: 'z6', quantity: 18, capacity: 70,  reorderPoint: 14, backroomStock: 55,  lastUpdated: '2026-09-06T01:25:00Z' },
  { id: 'inv45', productId: 'p45', shelfId: 's24', zoneId: 'z6', quantity: 55, capacity: 85,  reorderPoint: 16, backroomStock: 90,  lastUpdated: '2026-09-06T02:00:00Z' },
  { id: 'inv46', productId: 'p46', shelfId: 's24', zoneId: 'z6', quantity: 42, capacity: 75,  reorderPoint: 14, backroomStock: 70,  lastUpdated: '2026-09-06T01:55:00Z' },
  // Extra items on existing shelves
  { id: 'inv47', productId: 'p49', shelfId: 's1',  zoneId: 'z1', quantity: 18, capacity: 25,  reorderPoint: 6,  backroomStock: 35,  lastUpdated: '2026-09-06T02:05:00Z' },
  { id: 'inv48', productId: 'p50', shelfId: 's5',  zoneId: 'z2', quantity: 6,  capacity: 10,  reorderPoint: 3,  backroomStock: 15,  lastUpdated: '2026-09-06T01:20:00Z' },
  { id: 'inv49', productId: 'p47', shelfId: 's23', zoneId: 'z6', quantity: 14, capacity: 20,  reorderPoint: 5,  backroomStock: 25,  lastUpdated: '2026-09-06T01:10:00Z' },
  { id: 'inv50', productId: 'p48', shelfId: 's24', zoneId: 'z6', quantity: 22, capacity: 30,  reorderPoint: 6,  backroomStock: 30,  lastUpdated: '2026-09-06T01:00:00Z' },
];

export const inventoryItems: InventoryItem[] = inventoryRaw.map(item => ({
  ...item,
  product: productMap.get(item.productId)!,
  shelf: shelfMap.get(item.shelfId)!,
}));

// ---------------------------------------------------------------------------
// Alerts — derived from low-stock items
// ---------------------------------------------------------------------------
export const stockAlerts: StockAlert[] = inventoryItems
  .filter(item => {
    const status = getStockStatus(item);
    return status !== 'in-stock';
  })
  .map((item, idx) => {
    const status = getStockStatus(item);
    const zone = zoneMap.get(item.zoneId);
    return {
      id: `alert-${idx + 1}`,
      inventoryItemId: item.id,
      productName: item.product.name,
      shelfCode: item.shelf.code,
      zoneName: zone?.name || 'Unknown',
      severity: status === 'stockout' ? 'stockout' as const : status === 'critical' ? 'critical' as const : 'warning' as const,
      message: status === 'stockout'
        ? `${item.product.name} is OUT OF STOCK on shelf ${item.shelf.code}`
        : status === 'critical'
          ? `${item.product.name} critically low (${item.quantity}/${item.capacity}) on ${item.shelf.code}`
          : `${item.product.name} below reorder point (${item.quantity}/${item.reorderPoint}) on ${item.shelf.code}`,
      timestamp: item.lastUpdated,
      acknowledged: false,
    };
  })
  .sort((a, b) => {
    const severityOrder = { stockout: 0, critical: 1, warning: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

// ---------------------------------------------------------------------------
// Replenishment Tasks — items that need restocking
// ---------------------------------------------------------------------------
export const replenishmentTasks: ReplenishmentTask[] = inventoryItems
  .filter(item => getStockStatus(item) !== 'in-stock')
  .map((item, idx) => {
    const status = getStockStatus(item);
    const zone = zoneMap.get(item.zoneId);
    const restockQty = Math.min(item.capacity - item.quantity, item.backroomStock);
    return {
      id: `task-${idx + 1}`,
      inventoryItemId: item.id,
      productName: item.product.name,
      sku: item.product.sku,
      fromLocation: 'Backroom Bay A',
      toShelfCode: item.shelf.code,
      toShelfId: item.shelfId,
      toZoneName: zone?.name || 'Unknown',
      quantity: restockQty,
      priority: status === 'stockout' ? 'high' as const : status === 'critical' ? 'high' as const : 'medium' as const,
      completed: false,
    };
  });

// ---------------------------------------------------------------------------
// Pre-computed Replenishment Route (mimics TSP output)
// ---------------------------------------------------------------------------
const backroomPosition = { x: 20, y: 30 }; // backroom entrance at bottom-center

function buildOptimizedRoute(): ReplenishmentRoute {
  // Nearest-neighbor heuristic from backroom
  const taskShelves = replenishmentTasks.map(t => ({
    taskId: t.id,
    shelf: shelfMap.get(t.toShelfId)!,
    task: t,
  }));

  const visited: typeof taskShelves = [];
  const unvisited = [...taskShelves];
  let current = backroomPosition;
  let totalDist = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const pos = unvisited[i].shelf.position;
      const dist = Math.sqrt((current.x - pos.x) ** 2 + (current.y - pos.y) ** 2);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    totalDist += nearestDist;
    current = unvisited[nearestIdx].shelf.position;
    visited.push(unvisited[nearestIdx]);
    unvisited.splice(nearestIdx, 1);
  }

  // Return to backroom
  totalDist += Math.sqrt((current.x - backroomPosition.x) ** 2 + (current.y - backroomPosition.y) ** 2);

  const directions: RouteDirection[] = visited.map((stop, idx) => {
    const prevPos = idx === 0 ? backroomPosition : visited[idx - 1].shelf.position;
    const dist = Math.sqrt((prevPos.x - stop.shelf.position.x) ** 2 + (prevPos.y - stop.shelf.position.y) ** 2);
    const fromLabel = idx === 0 ? 'Backroom Bay A' : `Shelf ${visited[idx - 1].shelf.code}`;

    return {
      stepNumber: idx + 1,
      instruction: `From ${fromLabel} → proceed to Shelf ${stop.shelf.code} (${stop.task.toZoneName} zone)`,
      distance: Math.round(dist * 10) / 10,
      targetShelf: stop.shelf.code,
      productName: stop.task.productName,
      quantity: stop.task.quantity,
    };
  });

  return {
    sequence: visited.map(v => v.taskId),
    totalDistance: Math.round(totalDist * 10) / 10,
    estimatedTime: Math.round((totalDist / 1.2) / 60 * 10) / 10, // 1.2 m/s walking speed
    directions,
  };
}

export const optimizedRoute: ReplenishmentRoute = buildOptimizedRoute();

// ---------------------------------------------------------------------------
// Dashboard Metrics
// ---------------------------------------------------------------------------
export const dashboardMetrics: DashboardMetrics = {
  activeAlerts: stockAlerts.length,
  pendingTasks: replenishmentTasks.filter(t => !t.completed).length,
  spaceUtilization: Math.round(shelfUnits.reduce((sum, s) => sum + s.fillPercentage, 0) / shelfUnits.length),
  itemsBelowReorder: inventoryItems.filter(i => getStockStatus(i) !== 'in-stock').length,
  totalSKUs: products.length,
  totalShelves: shelfUnits.length,
};

// ---------------------------------------------------------------------------
// Zone Utilization (for charts)
// ---------------------------------------------------------------------------
export const zoneUtilization: ZoneUtilization[] = storeZones.map(zone => {
  const zoneShelves = shelfUnits.filter(s => s.zoneId === zone.id);
  const avg = zoneShelves.length > 0
    ? Math.round(zoneShelves.reduce((sum, s) => sum + s.fillPercentage, 0) / zoneShelves.length)
    : 0;
  return { zoneName: zone.name, utilization: avg, color: zone.color };
});

// ---------------------------------------------------------------------------
// Stock Trends (last 7 days, simulated)
// ---------------------------------------------------------------------------
export const stockTrends: StockTrend[] = [
  { date: 'Aug 31', inStock: 38, low: 6,  critical: 4, stockout: 2 },
  { date: 'Sep 01', inStock: 36, low: 7,  critical: 4, stockout: 3 },
  { date: 'Sep 02', inStock: 35, low: 7,  critical: 5, stockout: 3 },
  { date: 'Sep 03', inStock: 37, low: 6,  critical: 4, stockout: 3 },
  { date: 'Sep 04', inStock: 34, low: 8,  critical: 5, stockout: 3 },
  { date: 'Sep 05', inStock: 32, low: 8,  critical: 6, stockout: 4 },
  { date: 'Sep 06', inStock: 30, low: 8,  critical: 8, stockout: 4 },
];

// Backroom position export for route visualization
export const BACKROOM_POSITION = backroomPosition;

// Store dimensions export
export const STORE_DIMENSIONS = { width: 40, height: 30 };
