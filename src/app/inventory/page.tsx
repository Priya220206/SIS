'use client';

import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import { inventoryItems, shelfUnits, storeZones } from '@/data/mockData';
import { getStockStatus, InventoryItem } from '@/types';
import { cn, getStatusBg } from '@/lib/utils';
import { Search, Filter, Edit3, X, Save, Package, Plus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Inventory Catalog Page — Data table with inline editing
// ---------------------------------------------------------------------------
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ capacity: number; reorderPoint: number }>({
    capacity: 0,
    reorderPoint: 0,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: storeZones[0]?.name ?? '',
    quantity: 1,
    capacity: 12,
    reorderPoint: 3,
    price: 0,
  });
  const [addProductError, setAddProductError] = useState('');

  // Filtered inventory list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shelf.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = filterZone === 'all' || item.zoneId === filterZone;

      const status = getStockStatus(item);
      const matchesStatus = filterStatus === 'all' || status === filterStatus;

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [items, searchQuery, filterZone, filterStatus]);

  const startEditing = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setEditingId(itemId);
      setEditValues({ capacity: item.capacity, reorderPoint: item.reorderPoint });
    }
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems((current) =>
      current.map((item) =>
        item.id === editingId
          ? { ...item, capacity: editValues.capacity, reorderPoint: editValues.reorderPoint }
          : item
      )
    );
    setEditingId(null);
  };

  const addProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sku = newProduct.sku.trim();
    if (!newProduct.name.trim() || !sku) {
      setAddProductError('Enter a product name and barcode or SKU.');
      return;
    }
    if (items.some((item) => item.product.sku.toLowerCase() === sku.toLowerCase())) {
      setAddProductError('That barcode or SKU is already in your products.');
      return;
    }
    const zone = storeZones.find((entry) => entry.name === newProduct.category);
    const shelf = zone && shelfUnits.find((entry) => entry.zoneId === zone.id);
    if (!shelf || !zone) {
      setAddProductError('There is no shelf available for this category yet.');
      return;
    }
    const product = {
      id: `new-${Date.now()}`,
      sku,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: newProduct.price,
    };
    const item: InventoryItem = {
      id: `inventory-${product.id}`,
      productId: product.id,
      product,
      shelfId: shelf.id,
      shelf,
      zoneId: shelf.zoneId,
      quantity: newProduct.quantity,
      capacity: newProduct.capacity,
      reorderPoint: newProduct.reorderPoint,
      backroomStock: 0,
      lastUpdated: new Date().toISOString(),
    };
    setItems((current) => [item, ...current]);
    setShowAddProduct(false);
    setAddProductError('');
    setNewProduct({
      name: '',
      sku: '',
      category: storeZones[0]?.name ?? '',
      quantity: 1,
      capacity: 12,
      reorderPoint: 3,
      price: 0,
    });
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Inventory Catalog" />

      <div className="page-content page-stack">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-medium tracking-tight text-[var(--color-text-primary)]">My Products</h1>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Your inventory, organised and always within reach.</p>
          </div>
          <button
            onClick={() => {
              setAddProductError('');
              setShowAddProduct(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#0c8980] px-3.5 py-2 text-[10px] font-medium text-white hover:bg-[#08776f]"
          >
            <Plus size={13} /> Add Product
          </button>
        </div>

        {/* --- Filters Bar --- */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Search by product name or barcode"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
              />
            </div>

            {/* Zone filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[var(--color-text-muted)]" />
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="px-3 py-2.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-cyan)]"
              >
                <option value="all">All Zones</option>
                {storeZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-cyan)]"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
              <option value="stockout">Stockout</option>
            </select>

            {/* Results count */}
            <span className="text-xs text-[var(--color-text-muted)] ml-auto">
              {filteredItems.length} of {items.length} products
            </span>
          </div>
        </div>

        {/* --- Data Table --- */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-240px)]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Reorder at</th>
                  <th>Shelf</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  const zone = storeZones.find((z) => z.id === item.zoneId);
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eff8f6] text-[#168c81]"><Package size={13} /></span>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)]">{item.product.name}</p>
                            <p className="mt-0.5 text-[8px] text-[var(--color-text-muted)]">{item.product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td>{item.product.category}</td>
                      <td>
                        <span
                          className={cn(
                            'font-bold',
                            status === 'in-stock'
                              ? 'text-emerald-700'
                              : status === 'low'
                                ? 'text-amber-700'
                                : 'text-red-700'
                          )}
                        >
                          {item.quantity}
                        </span>
                        <span className="ml-1 text-[9px] text-[var(--color-text-muted)]">/ {item.capacity}</span>
                      </td>
                      <td>₹{item.product.price.toFixed(2)}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            value={editValues.capacity}
                            onChange={(event) => setEditValues({ ...editValues, capacity: Number(event.target.value) })}
                            className="w-16 rounded border border-[var(--color-accent-cyan)] bg-white px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none"
                            aria-label={`Capacity for ${item.product.name}`}
                          />
                        ) : item.capacity}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editValues.reorderPoint}
                            onChange={(event) => setEditValues({ ...editValues, reorderPoint: Number(event.target.value) })}
                            className="w-16 rounded border border-[var(--color-accent-cyan)] bg-white px-2 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none"
                            aria-label={`Reorder level for ${item.product.name}`}
                          />
                        ) : item.reorderPoint}
                      </td>
                      <td>
                        <span className="text-[#0b8981]">{item.shelf.code}</span>
                        <span className="block text-[8px] text-[var(--color-text-muted)]">{zone?.name}</span>
                      </td>
                      <td>
                        <span className={cn('badge', getStatusBg(status))}>
                          {status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 rounded-lg bg-emerald-400/15 text-emerald-700 hover:bg-emerald-400/25 transition-colors"
                              aria-label={`Save ${item.product.name}`}
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-red-400/15 text-red-700 hover:bg-red-400/25 transition-colors"
                              aria-label={`Cancel editing ${item.product.name}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(item.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)] transition-colors"
                            aria-label={`Edit ${item.product.name}`}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {showAddProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#142b33]/30 p-4" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <form onSubmit={addProduct} className="w-full max-w-lg rounded-xl border border-[var(--color-border-default)] bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 id="add-product-title" className="text-base font-medium text-[var(--color-text-primary)]">Add Product</h2>
                  <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Add an item to your shop inventory.</p>
                </div>
                <button type="button" onClick={() => setShowAddProduct(false)} aria-label="Close add product form" className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 text-[10px] font-medium text-[var(--color-text-secondary)]">
                  Product name *
                  <input required value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} className="mt-1.5 w-full rounded-md border border-[var(--color-border-default)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none" />
                </label>
                <label className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                  Barcode / SKU *
                  <input required value={newProduct.sku} onChange={(event) => setNewProduct({ ...newProduct, sku: event.target.value })} className="mt-1.5 w-full rounded-md border border-[var(--color-border-default)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none" />
                </label>
                <label className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                  Category *
                  <select value={newProduct.category} onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })} className="mt-1.5 w-full rounded-md border border-[var(--color-border-default)] bg-white px-3 py-2 text-xs text-[var(--color-text-primary)]">
                    {storeZones.map((zone) => <option key={zone.id} value={zone.name}>{zone.name}</option>)}
                  </select>
                </label>
                {([
                  ['quantity', 'Opening quantity'],
                  ['capacity', 'Shelf capacity'],
                  ['reorderPoint', 'Low-stock alert at'],
                ] as const).map(([field, label]) => (
                  <label key={field} className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                    {label} *
                    <input required min={0} type="number" value={newProduct[field]} onChange={(event) => setNewProduct({ ...newProduct, [field]: Number(event.target.value) })} className="mt-1.5 w-full rounded-md border border-[var(--color-border-default)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none" />
                  </label>
                ))}
                <label className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                  Selling price *
                  <input required min={0} step="0.01" type="number" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: Number(event.target.value) })} className="mt-1.5 w-full rounded-md border border-[var(--color-border-default)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-cyan)] focus:outline-none" />
                </label>
              </div>
              {addProductError && <p role="alert" className="mt-3 text-[10px] text-[#bd4e4e]">{addProductError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddProduct(false)} className="rounded-md border border-[var(--color-border-default)] px-3 py-2 text-[10px] font-medium text-[var(--color-text-secondary)]">Cancel</button>
                <button type="submit" className="rounded-md bg-[#0c8980] px-3.5 py-2 text-[10px] font-medium text-white hover:bg-[#08776f]">Save Product</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
