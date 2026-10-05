import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle,
  X,
  ArrowUpDown,
} from 'lucide-react';

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick adjust modal
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('Stock replenishment');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getInventory({
        lowStockOnly: lowStockOnly ? 'true' : 'false',
        limit: 100,
      });
      setInventory(res.data || res.inventory || res || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(err.message || 'Failed to fetch inventory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const handleQuickAdjust = async (variantId, delta) => {
    try {
      await adminService.adjustInventory(variantId, delta, `Quick admin adjustment (${delta > 0 ? '+' : ''}${delta})`);
      setActionNotice({ type: 'success', message: `Stock adjusted by ${delta > 0 ? `+${delta}` : delta} units.` });
      // Update local state smoothly
      setInventory((prev) =>
        prev.map((item) =>
          item.variantId === variantId
            ? { ...item, availableQuantity: item.availableQuantity + delta }
            : item
        )
      );
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to adjust stock.' });
    }
  };

  const handleCustomAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    setSubmitting(true);
    try {
      const delta = Number(adjustQty);
      if (isNaN(delta) || delta === 0) {
        throw new Error('Please enter a valid non-zero quantity.');
      }
      await adminService.adjustInventory(adjustModalItem.variantId, delta, adjustNotes);
      setActionNotice({ type: 'success', message: `Stock adjusted by ${delta > 0 ? `+${delta}` : delta} units.` });
      setAdjustModalItem(null);
      fetchInventory();
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to adjust inventory.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    return (
      searchTerm === '' ||
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Inventory & Stock</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock quantities, low-stock threshold triggers, and inventory adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[5px] hover:bg-slate-50 shadow-subtle transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-[5px] border flex items-center justify-between text-xs font-medium ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-2 rounded-[5px] text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              lowStockOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Alert (&le; 5 units)</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ocean-600" />
            <span>Loading inventory quantities...</span>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No inventory items found</p>
            <p className="text-slate-400 mt-1">Products must have variants created to track inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Variant Price</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Reserved / Sold</th>
                  <th className="py-3 px-3">Quick Stock Adjust</th>
                  <th className="py-3 px-4 text-right">Custom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const qty = item.availableQuantity;
                  const isLow = qty <= (item.lowStockThreshold || 5);

                  return (
                    <tr key={item.id || item.variantId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.productName}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                        {item.sku}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-xs font-black ${
                            qty > 10
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : qty > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {qty} units
                        </span>
                        {isLow && (
                          <span className="block text-[10px] text-amber-600 font-bold mt-0.5">
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-500">
                        <span>{item.reservedQuantity || 0} res</span> ·{' '}
                        <span>{item.soldQuantity || 0} sold</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickAdjust(item.variantId, -5)}
                            disabled={qty <= 0}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-[3px] disabled:opacity-40"
                            title="Decrease by 5"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item.variantId, 5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-bold text-[10px] rounded-[3px]"
                            title="Increase by 5"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickAdjust(item.variantId, 10)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-bold text-[10px] rounded-[3px]"
                            title="Increase by 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustModalItem(item);
                            setAdjustQty('');
                            setAdjustNotes('Stock replenishment');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 border border-ocean-200 rounded-[4px] transition-colors"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Adjust Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">
                Adjust Stock: {adjustModalItem.productName}
              </h3>
              <button
                onClick={() => setAdjustModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomAdjustSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[5px]">
                <div className="text-[11px] text-slate-500">Current Available Quantity:</div>
                <div className="text-base font-black text-slate-900">
                  {adjustModalItem.availableQuantity} units
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity Change (+ to add, - to subtract) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. +20 or -5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Morning harbor shipment, damaged item, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#E15E18' }}
                  className="px-4 py-1.5 font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[4px] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
