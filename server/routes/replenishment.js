// =============================================================================
// SIM — Replenishment API Routes
// Endpoints for generating optimized replenishment sequences.
// =============================================================================

const express = require('express');
const router = express.Router();
const { solveNearestNeighborTSP } = require('../algorithms/tspSolver');

// ---------------------------------------------------------------------------
// Mock data (mirrors frontend mockData.ts for standalone server testing)
// In production, this would query the PostgreSQL/PostGIS database.
// ---------------------------------------------------------------------------
const BACKROOM_POSITION = { id: 'depot', x: 20, y: 30 };

const mockPendingTasks = [
  { id: 'task-1',  shelfCode: 'P-02', zoneName: 'Produce',     productName: 'Baby Spinach 5oz',     quantity: 42, x: 3,  y: 6  },
  { id: 'task-2',  shelfCode: 'P-02', zoneName: 'Produce',     productName: 'Avocados (3-pack)',    quantity: 25, x: 3,  y: 6  },
  { id: 'task-3',  shelfCode: 'P-03', zoneName: 'Produce',     productName: 'Cherry Tomatoes',      quantity: 38, x: 3,  y: 9  },
  { id: 'task-4',  shelfCode: 'P-03', zoneName: 'Produce',     productName: 'Romaine Lettuce',      quantity: 25, x: 3,  y: 9  },
  { id: 'task-5',  shelfCode: 'D-02', zoneName: 'Dairy',       productName: 'Cheddar Cheese Block', quantity: 42, x: 16, y: 6  },
  { id: 'task-6',  shelfCode: 'D-02', zoneName: 'Dairy',       productName: 'Butter Unsalted',      quantity: 45, x: 16, y: 6  },
  { id: 'task-7',  shelfCode: 'D-04', zoneName: 'Dairy',       productName: 'Mozzarella Shredded',  quantity: 50, x: 21, y: 3  },
  { id: 'task-8',  shelfCode: 'D-04', zoneName: 'Dairy',       productName: 'Heavy Cream 16oz',     quantity: 50, x: 21, y: 3  },
  { id: 'task-9',  shelfCode: 'B-03', zoneName: 'Bakery',      productName: 'Bagels (6-pack)',      quantity: 22, x: 29, y: 9  },
  { id: 'task-10', shelfCode: 'B-03', zoneName: 'Bakery',      productName: 'Cinnamon Rolls',       quantity: 17, x: 29, y: 9  },
  { id: 'task-11', shelfCode: 'E-02', zoneName: 'Electronics', productName: 'AA Batteries (8-pack)',quantity: 18, x: 3,  y: 21 },
  { id: 'task-12', shelfCode: 'E-02', zoneName: 'Electronics', productName: 'Screen Protector',     quantity: 14, x: 3,  y: 21 },
  { id: 'task-13', shelfCode: 'E-04', zoneName: 'Electronics', productName: 'HDMI Cable 3ft',       quantity: 15, x: 8,  y: 21 },
  { id: 'task-14', shelfCode: 'E-04', zoneName: 'Electronics', productName: 'Power Bank 10000mAh',  quantity: 14, x: 8,  y: 21 },
  { id: 'task-15', shelfCode: 'H-02', zoneName: 'Household',   productName: 'Laundry Detergent',    quantity: 55, x: 16, y: 21 },
  { id: 'task-16', shelfCode: 'H-02', zoneName: 'Household',   productName: 'Trash Bags (30ct)',    quantity: 48, x: 16, y: 21 },
  { id: 'task-17', shelfCode: 'S-02', zoneName: 'Snacks',      productName: 'Trail Mix 26oz',       quantity: 80, x: 29, y: 21 },
  { id: 'task-18', shelfCode: 'S-02', zoneName: 'Snacks',      productName: 'Granola Bars (12ct)',  quantity: 75, x: 29, y: 21 },
];

// ---------------------------------------------------------------------------
// GET /api/replenishment/route
// Generates an optimized replenishment route for all pending tasks.
//
// Query Params:
//   - priorityFilter: "all" | "high" | "medium" | "low" (default: "all")
//
// Response:
// {
//   route: { sequence, totalDistance, estimatedTime, directions },
//   tasks: [...],
//   generatedAt: ISO timestamp
// }
// ---------------------------------------------------------------------------
router.get('/route', (req, res) => {
  try {
    const { priorityFilter = 'all' } = req.query;

    // Filter tasks by priority if requested
    let tasks = [...mockPendingTasks];
    // In production, we'd query: SELECT * FROM replenishment_tasks WHERE completed = FALSE

    // De-duplicate by shelf (TSP visits unique locations)
    const uniqueShelves = new Map();
    for (const task of tasks) {
      if (!uniqueShelves.has(task.shelfCode)) {
        uniqueShelves.set(task.shelfCode, task);
      }
    }
    const stops = Array.from(uniqueShelves.values());

    // Solve TSP
    const route = solveNearestNeighborTSP(BACKROOM_POSITION, stops);

    res.json({
      success: true,
      route,
      taskCount: tasks.length,
      uniqueStops: stops.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate optimized route',
      message: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/replenishment/complete
// Marks a replenishment task as completed.
//
// Body: { taskId: string }
// ---------------------------------------------------------------------------
router.post('/complete', (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'taskId is required',
      });
    }

    // In production: UPDATE replenishment_tasks SET completed = TRUE, completed_at = NOW() WHERE task_id = $1
    const task = mockPendingTasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task ${taskId} not found`,
      });
    }

    res.json({
      success: true,
      message: `Task ${taskId} marked as completed`,
      task: { ...task, completed: true, completedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Task completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task',
    });
  }
});

module.exports = router;
