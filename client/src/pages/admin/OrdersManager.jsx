import React, { useState, useEffect, useMemo } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Package,
  DollarSign,
  Printer,
  ChevronDown,
  Scissors,
} from 'lucide-react';

export const CUT_LABELS = {
  'full-piece-uncut': 'Full Piece / Whole (Uncut)',
  'curry-cut': 'Curry Cut',
  'fry-cut': 'Fry Cut / Steaks',
  'whole-cleaned': 'Whole Cleaned',
  'fillet': 'Boneless Fillet',
  'prawns-peeled': 'Peeled & Deveined',
  'prawns-whole': 'Whole Prawns (Shell-On)',
  'crab-cleaned': 'Cleaned & Dressed Crab',
  'crab-whole': 'Whole Live Crab',
  'squid-rings': 'Squid Rings & Tentacles',
  'ready-to-eat': 'Ready to Eat (Cooked)',
};

export const getCutLabel = (rawCut) => {
  if (!rawCut) return 'Whole Cleaned';
  let clean = String(rawCut).replace(/\s*\([^)]*\)$/, '').trim();
  const lower = clean.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
  if (CUT_LABELS[lower]) return CUT_LABELS[lower];
  return clean.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PAID', label: 'Payment Done (Paid)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { value: 'PENDING', label: 'Not Done (Pending)', color: 'bg-amber-50 text-amber-800 border-amber-300' },
  { value: 'FAILED', label: 'Payment Failed', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-purple-50 text-purple-800 border-purple-300' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending Confirmation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'PROCESSING', label: 'Cleaning & Packing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'PACKED', label: 'Packed & Weighed', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'READY_FOR_DELIVERY', label: 'Ready for Dispatch', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const TIME_SLOTS = [
  '06:00 AM - 08:00 AM',
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
];

const WhatsAppIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Safe helper to parse address snapshot and metadata
export const parseOrderDetails = (order) => {
  if (!order) return {};
  let address = {};
  if (order.addressSnapshot) {
    if (typeof order.addressSnapshot === 'string') {
      try {
        address = JSON.parse(order.addressSnapshot);
      } catch (e) {
        address = { fullAddress: order.addressSnapshot };
      }
    } else if (typeof order.addressSnapshot === 'object') {
      address = order.addressSnapshot;
    }
  }

  const customerName =
    address.name ||
    address.customerName ||
    order.customerNameSnapshot ||
    (order.user?.firstName ? `${order.user.firstName} ${order.user.lastName || ''}`.trim() : null) ||
    order.customAddress?.fullName ||
    'Guest Customer';

  const customerPhone =
    address.phone ||
    order.phoneSnapshot ||
    order.user?.phone ||
    order.customAddress?.phone ||
    '—';

  const cleanDigits = customerPhone && customerPhone !== '—'
    ? customerPhone.replace(/[^0-9]/g, '')
    : '';
  const cleanPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

  const isRealEmail = (email) => {
    if (!email) return false;
    const lower = String(email).toLowerCase();
    return (
      !lower.includes('@v2seafood.guest') &&
      !lower.includes('@v2seafood.in') &&
      !lower.includes('guest') &&
      !lower.includes('@placeholder') &&
      !lower.endsWith('.guest')
    );
  };

  const rawEmail = order.user?.email || address.email || null;
  const customerEmail = isRealEmail(rawEmail) ? rawEmail : null;

  const flatNo = address.flatNo || address.addressLine1 || '';
  const street = address.street || address.addressLine2 || order.customAddress?.streetAddress || '';
  const landmark = address.landmark || '';
  const city = address.city || order.customAddress?.city || 'Chennai';
  const state = address.state || order.customAddress?.state || 'Tamil Nadu';
  const pincode = address.pincode || address.postalCode || order.customAddress?.postalCode || '';

  const addressParts = [
    flatNo,
    street,
    landmark ? `Near ${landmark}` : null,
    city,
    state,
    pincode ? `PIN: ${pincode}` : null,
  ].filter(Boolean);

  const fullAddress = address.fullAddress || (addressParts.length > 0 ? addressParts.join(', ') : 'Address on file');

  const deliveryDate = address.deliveryDate || order.deliveryDate || 'Next Day';
  const deliveryTime = address.deliveryTime || order.deliveryTime || '06:00 AM - 10:00 AM';
  const deliverySlot =
    address.deliverySlot ||
    (deliveryDate && deliveryTime ? `${deliveryDate} (${deliveryTime})` : 'Morning Slot (6 AM - 10 AM)');

  const paymentMethod =
    address.paymentMethod ||
    (order.payments?.[0]?.provider === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment');

  const deliveryCharge = Number(
    order.deliveryCharge !== undefined && order.deliveryCharge !== null
      ? order.deliveryCharge
      : (address.deliveryCharge !== undefined && address.deliveryCharge !== null ? address.deliveryCharge : 0)
  );

  const packagingFee = Number(
    order.packagingFee !== undefined && order.packagingFee !== null
      ? order.packagingFee
      : (address.packagingFee !== undefined && address.packagingFee !== null ? address.packagingFee : 0)
  );

  return {
    customerName,
    customerPhone,
    cleanPhone,
    customerEmail,
    flatNo,
    street,
    landmark,
    city,
    state,
    pincode,
    fullAddress,
    deliveryDate,
    deliveryTime,
    deliverySlot,
    paymentMethod,
    deliveryCharge,
    packagingFee,
    rawSnapshot: address,
  };
};

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Available products for manual order creation
  const [availableProducts, setAvailableProducts] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOrders({
        status: selectedStatus || undefined,
        limit: 100,
      });
      const data = res.data?.orders || res.orders || res.data || res || [];
      setOrders(Array.isArray(data) ? data : []);
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

  // Load products when creating a manual order
  useEffect(() => {
    if (isCreateModalOpen && availableProducts.length === 0) {
      adminService
        .getProducts({ limit: 100 })
        .then((res) => {
          const prods = res.data?.products || res.products || res.data || [];
          setAvailableProducts(Array.isArray(prods) ? prods : []);
        })
        .catch((err) => console.error('Failed to load products for manual order:', err));
    }
  }, [isCreateModalOpen]);

  // Status badge style helper
  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt
      ? opt.color
      : 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status);
    return opt ? opt.label : status;
  };

  // Quick inline fulfillment status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setActionNotice({ type: 'success', message: `Order status updated to ${getStatusLabel(newStatus)}` });
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

  // Quick inline payment status change (Payment Done vs Not Done)
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await adminService.updateOrder(orderId, { paymentStatus: newPaymentStatus });
      const label = newPaymentStatus === 'PAID' ? 'Payment Done (Paid)' : newPaymentStatus;
      setActionNotice({ type: 'success', message: `Order payment status updated to ${label}` });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update payment status.' });
    }
  };

  // Delete Order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await adminService.deleteOrder(orderToDelete.id);
      setActionNotice({
        type: 'success',
        message: `Order #${orderToDelete.orderNumber || orderToDelete.id.slice(0, 8)} deleted successfully. Inventory restored.`,
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      setOrderToDelete(null);
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete order.' });
    }
  };

  // Filtered orders based on search and payment status filter
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedPaymentFilter && (o.paymentStatus || 'PENDING') !== selectedPaymentFilter) {
        return false;
      }
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const parsed = parseOrderDetails(o);
      const orderNum = (o.orderNumber || o.id || '').toLowerCase();
      const customerName = parsed.customerName.toLowerCase();
      const customerPhone = parsed.customerPhone.toLowerCase();
      const address = parsed.fullAddress.toLowerCase();
      const itemNames = (o.items || [])
        .map((it) => `${it.productNameSnapshot || it.product?.name || ''} ${it.variantNameSnapshot || ''}`.toLowerCase())
        .join(' ');

      return (
        orderNum.includes(term) ||
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        address.includes(term) ||
        itemNames.includes(term)
      );
    });
  }, [orders, searchTerm, selectedPaymentFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
    const outForDelivery = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const paidCount = orders.filter((o) => o.paymentStatus === 'PAID').length;
    const unpaidCount = orders.filter((o) => o.paymentStatus !== 'PAID').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + Number(o.total ?? o.totalAmount ?? 0), 0);
    return { total, pending, confirmed, outForDelivery, delivered, paidCount, unpaidCount, totalRevenue };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-ocean-100 text-ocean-900 shadow-2xs">
              <ShoppingCart className="w-5 h-5 text-ocean-800" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Process customer seafood orders, manage dispatch schedules (6 AM - 6 PM), and maintain full order CRUD.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-ocean-900 rounded-md hover:bg-ocean-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Manual Order
          </button>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-ocean-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Orders</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Action</div>
          <div className="text-xl font-black text-amber-800 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-200/80 bg-indigo-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Processing</div>
          <div className="text-xl font-black text-indigo-800 mt-1">{stats.confirmed}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-emerald-200/80 bg-emerald-50/30 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Payment Done</div>
          <div className="text-xl font-black text-emerald-800 mt-1">{stats.paidCount}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-amber-200/80 bg-amber-50/30 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Payment Pending</div>
          <div className="text-xl font-black text-amber-800 mt-1">{stats.unpaidCount}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Settled</div>
          <div className="text-xl font-black text-slate-900 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Notifications banner */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-md border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 p-1">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        {/* Fulfillment Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all shrink-0 ${
              selectedStatus === ''
                ? 'bg-ocean-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {STATUS_OPTIONS.map((opt) => {
            const count = orders.filter((o) => o.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedStatus === opt.value
                    ? 'bg-ocean-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                      selectedStatus === opt.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment Status Tabs (Payment Done vs Not Done) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs overflow-x-auto pb-0.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
            Payment Status:
          </span>
          <button
            onClick={() => setSelectedPaymentFilter('')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 ${
              selectedPaymentFilter === ''
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setSelectedPaymentFilter('PAID')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              selectedPaymentFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>✓ Payment Done ({stats.paidCount})</span>
          </button>
          <button
            onClick={() => setSelectedPaymentFilter('PENDING')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              selectedPaymentFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⏳ Not Done / Pending ({stats.unpaidCount})</span>
          </button>
          <button
            onClick={() => setSelectedPaymentFilter('FAILED')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 ${
              selectedPaymentFilter === 'FAILED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Failed
          </button>
          <button
            onClick={() => setSelectedPaymentFilter('REFUNDED')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all shrink-0 ${
              selectedPaymentFilter === 'REFUNDED'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            Refunded
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order #, Customer name, phone, item name, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-ocean-600" />
            <span className="font-semibold text-slate-600">Fetching customer orders from server...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-700 text-sm">No orders found</p>
            <p className="text-slate-400 mt-1 max-w-md mx-auto">
              Customer orders placed from the checkout page will appear here immediately. You can also create manual phone orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-3">Customer & Contact</th>
                  <th className="py-3 px-3">Delivery Slot (6AM - 6PM)</th>
                  <th className="py-3 px-3">Items & Cut Preferences</th>
                  <th className="py-3 px-3">Payment & Status</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const parsed = parseOrderDetails(o);
                  const itemCount = o.items?.length || 0;
                  const orderCode = o.orderNumber || `#${o.id.slice(0, 8).toUpperCase()}`;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID & Time */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-[12px]">
                          {orderCode}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{parsed.customerName}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-medium">{parsed.customerPhone}</span>
                          {parsed.cleanPhone && (
                            <span className="inline-flex items-center gap-1">
                              <a
                                href={`tel:${parsed.cleanPhone}`}
                                title={`Call ${parsed.customerName} (${parsed.customerPhone})`}
                                className="p-1 rounded text-slate-600 hover:text-ocean-800 hover:bg-ocean-50 border border-slate-200 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3 h-3 text-ocean-700" />
                              </a>
                              <a
                                href={`https://wa.me/91${parsed.cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${parsed.customerName}, regarding your V2 Seafood Order ${orderCode}:`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp ${parsed.customerName}`}
                                className="p-1 rounded text-[#25D366] hover:bg-emerald-50 border border-emerald-200 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <WhatsAppIcon className="w-3 h-3 fill-[#25D366]" />
                              </a>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5" title={parsed.fullAddress}>
                          {parsed.fullAddress}
                        </div>
                      </td>

                      {/* Delivery Slot */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded text-[11px] font-semibold">
                          <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>{parsed.deliverySlot}</span>
                        </div>
                      </td>

                      {/* Items & Cut Preferences */}
                      <td className="py-3.5 px-3 min-w-[210px]">
                        <div className="font-bold text-slate-800 text-[11px] mb-1">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </div>
                        <div className="space-y-1.5 max-w-[240px]">
                          {((o.items && o.items.length > 0) ? o.items : (parsed.rawSnapshot?.items || [])).map((it, idx) => {
                            const name = it.productNameSnapshot || it.name || it.product?.name || 'Seafood';
                            const cut = getCutLabel(it.variantNameSnapshot || it.cutPreference || it.variant?.cutType || it.productVariant?.cutType);
                            return (
                              <div key={idx} className="bg-slate-50/90 p-1.5 rounded border border-slate-200 text-[11px] leading-tight">
                                <div className="font-bold text-slate-900 truncate">
                                  <span className="text-ocean-900 font-black">{it.quantity || 1}x</span> {name}
                                </div>
                                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-ocean-800 bg-ocean-100/70 border border-ocean-200 px-1.5 py-0.2 rounded mt-0.5">
                                  <Scissors className="w-2.5 h-2.5 text-ocean-700" />
                                  <span>Cut: {cut}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Payment & Payment Status Dropdown (Payment Done or Not) */}
                      <td className="py-3.5 px-3 min-w-[145px]">
                        <div className="font-bold text-slate-800 text-[11px] mb-1">
                          {parsed.paymentMethod}
                        </div>
                        <select
                          value={o.paymentStatus || 'PENDING'}
                          onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
                          className={`px-2 py-1 text-[10px] font-black rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ocean-500 uppercase tracking-wide shadow-2xs ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : o.paymentStatus === 'REFUNDED'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : o.paymentStatus === 'FAILED'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                          title="Click to toggle Payment Done vs Not Done"
                        >
                          <option value="PAID">✓ Paid (Done)</option>
                          <option value="PENDING">⏳ Not Done (Pending)</option>
                          <option value="FAILED">✕ Failed</option>
                          <option value="REFUNDED">↺ Refunded</option>
                        </select>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{Number(o.total ?? o.totalAmount ?? 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-bold rounded border focus:outline-none focus:ring-1 focus:ring-ocean-500 cursor-pointer shadow-2xs ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            title="View Full Details"
                            className="p-1.5 text-ocean-700 hover:bg-ocean-50 border border-ocean-200 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingOrder(o)}
                            title="Edit Order Details"
                            className="p-1.5 text-amber-700 hover:bg-amber-50 border border-amber-200 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(o)}
                            title="Delete Order"
                            className="p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- MODAL 1: VIEW ORDER DETAILS ----------------- */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
          onEdit={() => {
            setEditingOrder(selectedOrder);
            setSelectedOrder(null);
          }}
          onDelete={() => {
            setOrderToDelete(selectedOrder);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* ----------------- MODAL 2: EDIT ORDER ----------------- */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSuccess={(updatedOrder) => {
            setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
            setActionNotice({ type: 'success', message: 'Order details updated successfully.' });
            setEditingOrder(null);
          }}
        />
      )}

      {/* ----------------- MODAL 3: CREATE MANUAL ORDER ----------------- */}
      {isCreateModalOpen && (
        <CreateOrderModal
          availableProducts={availableProducts}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            setActionNotice({ type: 'success', message: 'Manual order created successfully.' });
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* ----------------- MODAL 4: DELETE CONFIRMATION ----------------- */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-2 bg-rose-50 rounded-full border border-rose-100">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Delete Order?</h3>
                <p className="text-xs text-slate-500">Order #{orderToDelete.orderNumber || orderToDelete.id.slice(0, 8)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this order? Reserved inventory quantities will be restored back into stock.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-sm"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL: VIEW ORDER DETAILS (Medium Sized, Screen-Fitting Dialog)
// ============================================================================
function OrderDetailsModal({ order, onClose, onStatusChange, onPaymentStatusChange, onEdit, onDelete }) {
  const parsed = parseOrderDetails(order);
  const orderCode = order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header (Sticky shrink-0) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Order {orderCode}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-ocean-100 text-ocean-900">
                {order.status}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Status Quick Bar */}
          <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Fulfillment:</span>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="px-2 py-1 font-bold text-xs rounded border border-slate-300 bg-white shadow-2xs"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Payment:</span>
              <select
                value={order.paymentStatus || 'PENDING'}
                onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
                className={`px-2 py-1 font-black text-xs rounded border cursor-pointer uppercase shadow-2xs ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : order.paymentStatus === 'REFUNDED'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : order.paymentStatus === 'FAILED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="PAID">✓ Paid (Done)</option>
                <option value="PENDING">⏳ Not Done</option>
                <option value="FAILED">✕ Failed</option>
                <option value="REFUNDED">↺ Refunded</option>
              </select>
            </div>
          </div>

          {/* Delivery & Customer Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Customer Information
              </div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">{parsed.customerName}</div>
              <div className="text-slate-700 flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{parsed.customerPhone}</span>
                {parsed.cleanPhone && (
                  <div className="inline-flex items-center gap-1.5">
                    <a
                      href={`tel:${parsed.cleanPhone}`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 hover:text-ocean-900 transition-colors shadow-2xs"
                      title={`Call ${parsed.customerName}`}
                    >
                      <Phone className="w-3 h-3 text-ocean-700" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/91${parsed.cleanPhone}?text=${encodeURIComponent(
                        `Hello ${parsed.customerName}, regarding your V2 Seafood Order ${orderCode}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
                      title={`Chat with ${parsed.customerName} on WhatsApp`}
                    >
                      <WhatsAppIcon className="w-3 h-3 fill-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
              {parsed.customerEmail && (
                <div className="text-slate-500 text-[11px] truncate">{parsed.customerEmail}</div>
              )}
            </div>

            {/* Delivery Slot */}
            <div className="p-3 bg-sky-50/50 border border-sky-200/70 rounded-lg space-y-1.5">
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-600" /> Scheduled Slot
              </div>
              <div className="font-bold text-sky-950 text-xs sm:text-sm">{parsed.deliverySlot}</div>
              <div className="text-sky-800 text-[11px]">
                Date: <span className="font-semibold">{parsed.deliveryDate}</span>
              </div>
              <div className="text-sky-800 text-[11px]">
                Window: <span className="font-semibold">{parsed.deliveryTime}</span>
              </div>
            </div>
          </div>

          {/* Full Delivery Destination */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Delivery Destination
            </div>
            <div className="text-slate-800 font-semibold">{parsed.fullAddress}</div>
            {parsed.landmark && (
              <div className="text-slate-500 text-[11px]">Landmark: {parsed.landmark}</div>
            )}
            <div className="text-slate-500 text-[11px]">
              City: {parsed.city} | PIN: {parsed.pincode} | State: {parsed.state}
            </div>
          </div>

          {/* Items Purchased List */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Ordered Items ({order.items?.length || 0})</span>
              <span className="text-slate-400">Fresh Cleaned & Cut</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {((order.items && order.items.length > 0) ? order.items : (parsed.rawSnapshot?.items || [])).map((it, idx) => {
                const itemName = it.productNameSnapshot || it.name || it.product?.name || 'Seafood Item';
                const rawCut = it.variantNameSnapshot || it.cutPreference || it.variant?.cutType || it.productVariant?.cutType || '';
                const cutType = getCutLabel(rawCut);
                const unitPrice = Number(it.unitPrice || it.price || 0);
                const quantity = Number(it.quantity || 1);
                const lineTotal = Number(it.subtotal || unitPrice * quantity);

                return (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50/50">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{itemName}</div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-ocean-900 bg-ocean-50 border border-ocean-200 px-1.5 py-0.5 rounded mt-1">
                        <Scissors className="w-2.5 h-2.5 text-ocean-700" />
                        <span>Cut: {cutType}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {quantity} {quantity === 1 ? 'pack' : 'packs'} × ₹{unitPrice}
                      </div>
                    </div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(order.subtotal ?? order.total ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-semibold text-slate-800">
                {parsed.deliveryCharge === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${parsed.deliveryCharge}`
                )}
              </span>
            </div>
            {parsed.packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Cold Chain & Packaging Fee:</span>
                <span className="font-semibold text-slate-800">
                  ₹{parsed.packagingFee}
                </span>
              </div>
            )}
            {Number(order.discount || 0) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Discount:</span>
                <span className="font-bold">-₹{Number(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-slate-900 text-sm sm:text-base pt-2 border-t border-slate-200">
              <span>Total Settled:</span>
              <span>₹{Number(order.total ?? order.totalAmount ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded text-amber-800 text-[11px]">
              <span className="font-bold">Order Notes: </span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Footer (Sticky shrink-0) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Order
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Order
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: EDIT ORDER
// ============================================================================
function EditOrderModal({ order, onClose, onSuccess }) {
  const parsed = parseOrderDetails(order);
  const [formData, setFormData] = useState({
    name: parsed.customerName || '',
    phone: parsed.customerPhone !== '—' ? parsed.customerPhone : '',
    flatNo: parsed.flatNo || '',
    street: parsed.street || '',
    landmark: parsed.landmark || '',
    city: parsed.city || 'Chennai',
    state: parsed.state || 'Tamil Nadu',
    pincode: parsed.pincode || '',
    deliveryDate: parsed.deliveryDate || getTomorrowDateStr(),
    deliveryTime: parsed.deliveryTime || TIME_SLOTS[0],
    status: order.status || 'PENDING',
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: parsed.paymentMethod || 'Cash on Delivery (COD)',
    notes: order.notes || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updatedSnapshot = {
        name: formData.name,
        phone: formData.phone,
        flatNo: formData.flatNo,
        street: formData.street,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        deliverySlot: `${formData.deliveryDate} (${formData.deliveryTime})`,
        paymentMethod: formData.paymentMethod,
        packagingFee: parsed.packagingFee,
      };

      const res = await adminService.updateOrder(order.id, {
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        customerNameSnapshot: formData.name,
        phoneSnapshot: formData.phone,
        addressSnapshot: updatedSnapshot,
      });

      onSuccess(res.data || res.order || res);
    } catch (err) {
      console.error('Failed to update order:', err);
      setError(err.message || 'Failed to save order updates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Edit Order #{order.orderNumber || order.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-slate-500">Update fulfillment status, delivery slot, or address</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
              {error}
            </div>
          )}

          {/* Status Row */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Fulfillment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-xs"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-xs"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          {/* Delivery Slot: Next Day Onwards, 6 AM - 6 PM strictly */}
          <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg space-y-2">
            <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" /> Delivery Slot (6:00 AM - 6:00 PM)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Delivery Date (Min: Next Day)
                </label>
                <input
                  type="date"
                  min={getTomorrowDateStr()}
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Time Window (6 AM - 6 PM)
                </label>
                <select
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
            </div>
          </div>

          {/* Destination Address */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">Delivery Address</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Flat / House / Building"
                value={formData.flatNo}
                onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Street / Area / Road"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Landmark"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Pincode (6 digits)"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin / Special Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Deliver to watchman, Call before arrival..."
              className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold text-white bg-ocean-900 hover:bg-ocean-800 rounded shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: CREATE MANUAL ORDER (Medium Sized, Screen-Fitting Dialog)
// ============================================================================
function CreateOrderModal({ availableProducts, onClose, onSuccess }) {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    flatNo: '',
    street: '',
    landmark: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
  });

  const [deliverySlot, setDeliverySlot] = useState({
    date: getTomorrowDateStr(),
    time: TIME_SLOTS[0],
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');

  // Selected items array
  const [items, setItems] = useState([
    {
      productId: availableProducts[0]?.id || '',
      cleaningOption: 'Whole Cleaned',
      quantity: 1,
      unitPrice: availableProducts[0]?.basePrice || 399,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sync initial product if products load late
  useEffect(() => {
    if (availableProducts.length > 0 && !items[0]?.productId) {
      setItems([
        {
          productId: availableProducts[0].id,
          cleaningOption: 'Whole Cleaned',
          quantity: 1,
          unitPrice: availableProducts[0].basePrice || 399,
        },
      ]);
    }
  }, [availableProducts]);

  const handleProductSelect = (index, prodId) => {
    const prod = availableProducts.find((p) => p.id === prodId);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        productId: prodId,
        unitPrice: prod?.basePrice || 399,
      };
      return copy;
    });
  };

  const handleAddItem = () => {
    const fallbackProd = availableProducts[0];
    setItems((prev) => [
      ...prev,
      {
        productId: fallbackProd?.id || '',
        cleaningOption: 'Whole Cleaned',
        quantity: 1,
        unitPrice: fallbackProd?.basePrice || 399,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations: Free delivery over ₹699, standard packaging fee ₹19
  const subtotal = items.reduce((acc, it) => acc + Number(it.unitPrice || 0) * Number(it.quantity || 1), 0);
  const deliveryCharge = subtotal >= 699 ? 0 : 49;
  const packagingFee = 19;
  const totalAmount = subtotal + deliveryCharge + packagingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError('Please provide customer name and phone number.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        deliveryAddress: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          flatNo: customer.flatNo.trim(),
          street: customer.street.trim(),
          landmark: customer.landmark.trim(),
          city: customer.city.trim() || 'Chennai',
          state: customer.state.trim() || 'Tamil Nadu',
          pincode: customer.pincode.trim(),
        },
        items: items.map((it) => ({
          productId: it.productId,
          cleaningOption: it.cleaningOption,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 399,
        })),
        deliverySlot: {
          date: deliverySlot.date,
          time: deliverySlot.time,
        },
        paymentMethod,
        notes: notes.trim(),
        subtotal,
        deliveryCharge,
        packagingFee,
        totalAmount,
      };

      const res = await adminService.createOrder(payload);
      onSuccess(res.data || res.order || res);
    } catch (err) {
      console.error('Failed to create manual order:', err);
      setError(err.message || 'Failed to place manual order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-black text-slate-900">Create Manual Order</h3>
            <p className="text-xs text-slate-500">Record a phone or direct walk-in customer order</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
              {error}
            </div>
          )}

          {/* Customer Details */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1. Customer Details & Address
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  10-Digit Phone *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Flat / House / Door No."
                value={customer.flatNo}
                onChange={(e) => setCustomer({ ...customer, flatNo: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
              <input
                type="text"
                placeholder="Street / Area Name"
                value={customer.street}
                onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Landmark"
                value={customer.landmark}
                onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
              />
              <input
                type="text"
                placeholder="City"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
              <input
                type="text"
                placeholder="Pincode"
                value={customer.pincode}
                onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                className="p-2 bg-white border border-slate-300 rounded text-xs"
                required
              />
            </div>
          </div>

          {/* Delivery Slot: Strictly Next Day Onwards, 6 AM - 6 PM */}
          <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200 space-y-2">
            <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" /> 2. Delivery Slot (Strictly 6:00 AM - 6:00 PM)
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Delivery Date (Enabled from Next Day)
                </label>
                <input
                  type="date"
                  min={getTomorrowDateStr()}
                  value={deliverySlot.date}
                  onChange={(e) => setDeliverySlot({ ...deliverySlot, date: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Time Window (Morning 6 AM - 6 PM)
                </label>
                <select
                  value={deliverySlot.time}
                  onChange={(e) => setDeliverySlot({ ...deliverySlot, time: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Selector */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                3. Seafood Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-ocean-700 hover:text-ocean-900"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="p-2 bg-white border border-slate-200 rounded flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[9px] text-slate-400">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                      required
                    >
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <label className="block text-[9px] text-slate-400">Cut Preference</label>
                    <select
                      value={item.cleaningOption}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].cleaningOption = e.target.value;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium"
                    >
                      <option value="Curry Cut">Curry Cut</option>
                      <option value="Fry Cut / Steaks">Fry Cut / Steaks</option>
                      <option value="Whole Cleaned">Whole Cleaned</option>
                      <option value="Boneless Fillet">Boneless Fillet</option>
                      <option value="Peeled & Deveined">Peeled & Deveined</option>
                      <option value="Whole Prawns (Shell-On)">Whole Prawns</option>
                      <option value="Cleaned & Dressed Crab">Cleaned Crab</option>
                      <option value="Whole Live Crab">Whole Live Crab</option>
                      <option value="Squid Rings & Tentacles">Squid Rings</option>
                      <option value="Full Piece / Whole (Uncut)">Whole (Uncut)</option>
                    </select>
                  </div>

                  <div className="w-14">
                    <label className="block text-[9px] text-slate-400">Qty</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-center"
                    />
                  </div>

                  <div className="w-16">
                    <label className="block text-[9px] text-slate-400">Rate</label>
                    <input
                      type="number"
                      min="1"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-center"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 mt-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              4. Payment Method
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manualPayMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-ocean-900"
                />
                <span className="font-semibold text-slate-800">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manualPayMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="text-ocean-900"
                />
                <span className="font-semibold text-slate-800">Online Payment</span>
              </label>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-semibold text-slate-800">{deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Cold Chain Packaging Fee:</span>
              <span className="font-semibold text-slate-800">₹{packagingFee}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 text-sm pt-1.5 border-t border-slate-200">
              <span>Total Payable:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-ocean-900 hover:bg-ocean-800 rounded shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
