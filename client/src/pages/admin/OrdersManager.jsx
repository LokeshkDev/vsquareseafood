import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PROCESSING', label: 'Cleaning & Packing', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOrders({
        status: selectedStatus || undefined,
        limit: 50,
      });
      setOrders(res.data || res.orders || res || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to fetch customer orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setActionNotice({ type: 'success', message: `Order status updated to ${newStatus}` });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update order status.' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      searchTerm === '' ||
      o.id?.toLowerCase().includes(term) ||
      o.user?.firstName?.toLowerCase().includes(term) ||
      o.user?.phone?.includes(term) ||
      o.customAddress?.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders & Fulfillment</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer seafood orders, update delivery progress, and view custom cutting instructions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[5px] hover:bg-slate-50 shadow-subtle transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
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

      {/* Status Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-subtle space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-colors ${
              selectedStatus === ''
                ? 'bg-ocean-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition-colors ${
                selectedStatus === opt.value
                  ? 'bg-ocean-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ocean-600" />
            <span>Fetching customer orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No orders found</p>
            <p className="text-slate-400 mt-1">Customer checkouts will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-3">Customer Info</th>
                  <th className="py-3 px-3">Items Purchased</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const customerName =
                    o.user?.firstName
                      ? `${o.user.firstName} ${o.user.lastName || ''}`
                      : o.customAddress?.fullName || 'Walk-in Customer';

                  const customerPhone = o.user?.phone || o.customAddress?.phone || '—';
                  const itemCount = o.items?.length || 0;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-[11px]">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{customerName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{customerPhone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-700">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {o.items?.map((it) => it.product?.name || it.productVariant?.sku).join(', ') || 'Fresh Seafood'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{Number(o.totalAmount || o.subtotal || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {o.paymentStatus || 'PAID'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold rounded-[4px] border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-ocean-500 shadow-2xs"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 border border-ocean-200 rounded-[4px] transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[5px] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()} Details
                </h3>
                <span className="text-[11px] text-slate-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[5px] border border-slate-200">
                <span className="font-bold text-slate-700">Fulfillment Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="px-2.5 py-1 font-bold text-xs rounded-[4px] border border-slate-300 bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-[5px] overflow-hidden">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-bold text-slate-900">
                          {it.product?.name || it.productVariant?.product?.name || 'Seafood Item'}
                        </div>
                        {it.productVariant?.cutType && (
                          <div className="text-[10px] text-ocean-700 font-semibold">
                            Cut: {it.productVariant.cutType}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Quantity: {it.quantity} x ₹{Number(it.price || 0)}
                        </div>
                      </div>
                      <div className="font-black text-slate-900 text-sm">
                        ₹{Number((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider">
                  Delivery Destination
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[5px] text-slate-700 space-y-1">
                  <div className="font-bold">
                    {selectedOrder.customAddress?.fullName || selectedOrder.user?.firstName || 'Customer'}
                  </div>
                  <div>{selectedOrder.customAddress?.streetAddress || 'Address on file'}</div>
                  <div>
                    {selectedOrder.customAddress?.city || 'Chennai'}, {selectedOrder.customAddress?.postalCode || '600001'}
                  </div>
                  <div className="text-slate-500 font-medium">
                    Phone: {selectedOrder.customAddress?.phone || selectedOrder.user?.phone || '—'}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{Number(selectedOrder.subtotal || selectedOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{Number(selectedOrder.deliveryFee || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                  <span>Total Settled:</span>
                  <span>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-[4px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
