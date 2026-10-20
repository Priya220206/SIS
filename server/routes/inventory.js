// =============================================================================
// SIM — Inventory API Routes
// CRUD endpoints for inventory management.
// =============================================================================

const express = require('express');
const router = express.Router();

// ---------------------------------------------------------------------------
// Mock data (mirrors frontend for standalone testing)
// ---------------------------------------------------------------------------
const mockInventory = [
  { id: 'inv1',  sku: 'PRD-001', name: 'Organic Bananas',       zone: 'Produce',     shelf: 'P-01', quantity: 45, capacity: 60,  reorderPoint: 15, backroomStock: 120 },
  { id: 'inv3',  sku: 'PRD-003', name: 'Baby Spinach 5oz',      zone: 'Produce',     shelf: 'P-02', quantity: 8,  capacity: 50,  reorderPoint: 12, backroomStock: 60  },
  { id: 'inv6',  sku: 'PRD-006', name: 'Romaine Lettuce',       zone: 'Produce',     shelf: 'P-03', quantity: 0,  capacity: 25,  reorderPoint: 6,  backroomStock: 30  },
  { id: 'inv11', sku: 'DRY-003', name: 'Cheddar Cheese Block',  zone: 'Dairy',       shelf: 'D-02', quantity: 3,  capacity: 45,  reorderPoint: 10, backroomStock: 50  },
  { id: 'inv15', sku: 'DRY-007', name: 'Mozzarella Shredded',   zone: 'Dairy',       shelf: 'D-04', quantity: 0,  capacity: 50,  reorderPoint: 10, backroomStock: 65  },
  { id: 'inv25', sku: 'ELC-003', name: 'AA Batteries (8-pack)', zone: 'Electronics', shelf: 'E-02', quantity: 2,  capacity: 20,  reorderPoint: 5,  backroomStock: 40  },
];

// ---------------------------------------------------------------------------
// GET /api/inventory
// Returns inventory list with optional filters.
//
// Query Params:
//   - zone: filter by zone name
//   - status: "all" | "in-stock" | "low" | "critical" | "stockout"
//   - search: text search on name/SKU
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const { zone, status, search } = req.query;
    let results = [...mockInventory];

    // In production: SELECT i.*, p.name, p.sku, s.shelf_code, z.zone_name
    //                FROM inventory i JOIN products p ... JOIN shelf_units s ... JOIN store_zones z ...

    if (zone) {
      results = results.filter(i => i.zone.toLowerCase() === zone.toLowerCase());
    }

    if (status && status !== 'all') {
      results = results.filter(i => {
        if (status === 'stockout') return i.quantity === 0;
        if (status === 'critical') return i.quantity > 0 && i.quantity <= i.reorderPoint * 0.5;
        if (status === 'low') return i.quantity > i.reorderPoint * 0.5 && i.quantity <= i.reorderPoint;
        if (status === 'in-stock') return i.quantity > i.reorderPoint;
        return true;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.shelf.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/inventory/:id
// Updates inventory item metadata (capacity, reorder point).
//
// Body: { capacity?: number, reorderPoint?: number }
// ---------------------------------------------------------------------------
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { capacity, reorderPoint } = req.body;

    const item = mockInventory.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: `Item ${id} not found` });
    }

    // In production: UPDATE inventory SET capacity = $1, reorder_point = $2 WHERE inventory_id = $3
    if (capacity !== undefined) item.capacity = capacity;
    if (reorderPoint !== undefined) item.reorderPoint = reorderPoint;

    res.json({
      success: true,
      message: `Inventory item ${id} updated`,
      data: item,
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update inventory' });
  }
});

module.exports = router;
