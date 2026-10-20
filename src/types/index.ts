// =============================================================================
// SIM — Spatial Inventory Management System
// Core Type Definitions
// =============================================================================

/** Represents a physical zone/section within the store (e.g., Produce, Dairy) */
export interface StoreZone {
  id: string;
  name: string;
  color: string;          // Hex color for map rendering
  /** Bounding box in store-local coordinates (meters) */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** Represents a physical shelf unit on the store floor */
export interface ShelfUnit {
  id: string;
  code: string;           // Human-readable code, e.g. "A-01"
  zoneId: string;
  /** Position in store-local coordinates (meters from origin) */
  position: { x: number; y: number };
  /** Dimensions in meters */
  dimensions: { width: number; height: number };
  /** Total capacity in units across all facings */
  totalCapacity: number;
  /** Current fill percentage (0–100) */
  fillPercentage: number;
  rotation?: number;      // degrees
}

/** A product / SKU in the catalog */
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  /** URL to product image (placeholder) */
  imageUrl?: string;
}

/** Inventory record linking a product to a shelf location */
export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  shelfId: string;
  shelf: ShelfUnit;
  zoneId: string;
  /** Current quantity on shelf */
  quantity: number;
  /** Maximum shelf capacity for this product */
  capacity: number;
  /** Quantity threshold that triggers a reorder alert */
  reorderPoint: number;
  /** Backroom stock available for replenishment */
  backroomStock: number;
  lastUpdated: string;    // ISO timestamp
}

/** Stock status derived from quantity vs thresholds */
export type StockStatus = 'in-stock' | 'low' | 'critical' | 'stockout';

/** Computes the stock status for an inventory item */
export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.quantity === 0) return 'stockout';
  if (item.quantity <= item.reorderPoint * 0.5) return 'critical';
  if (item.quantity <= item.reorderPoint) return 'low';
  return 'in-stock';
}

/** A stockout or low-stock alert */
export interface StockAlert {
  id: string;
  inventoryItemId: string;
  productName: string;
  shelfCode: string;
  zoneName: string;
  severity: 'warning' | 'critical' | 'stockout';
  message: string;
  timestamp: string;      // ISO timestamp
  acknowledged: boolean;
}

/** A single replenishment task (pick one product from backroom → shelf) */
export interface ReplenishmentTask {
  id: string;
  inventoryItemId: string;
  productName: string;
  sku: string;
  /** Source: backroom location */
  fromLocation: string;
  /** Destination shelf */
  toShelfCode: string;
  toShelfId: string;
  toZoneName: string;
  /** Quantity to restock */
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

/** An optimized route through the store for replenishment */
export interface ReplenishmentRoute {
  /** Ordered list of task IDs representing the optimized sequence */
  sequence: string[];
  /** Total Euclidean distance in meters */
  totalDistance: number;
  /** Estimated completion time in minutes */
  estimatedTime: number;
  /** Turn-by-turn directions */
  directions: RouteDirection[];
}

/** A single step in the route's turn-by-turn directions */
export interface RouteDirection {
  stepNumber: number;
  instruction: string;
  /** Distance from previous stop in meters */
  distance: number;
  /** Target shelf code */
  targetShelf: string;
  /** Product to restock */
  productName: string;
  quantity: number;
}

/** Dashboard KPI metrics */
export interface DashboardMetrics {
  activeAlerts: number;
  pendingTasks: number;
  spaceUtilization: number;   // percentage
  itemsBelowReorder: number;
  totalSKUs: number;
  totalShelves: number;
}

/** Space utilization data per zone (for charts) */
export interface ZoneUtilization {
  zoneName: string;
  utilization: number;        // percentage
  color: string;
}

/** Stock trend data point (for charts) */
export interface StockTrend {
  date: string;
  inStock: number;
  low: number;
  critical: number;
  stockout: number;
}
