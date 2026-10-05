import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  Package,
  ArrowUpRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[5px] bg-ocean-100 text-ocean-900 border border-ocean-200">
              Admin Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Overview & Performance</h1>
          <p className="text-xs text-slate-500">Live metrics from MySQL database</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[5px] hover:bg-slate-50 shadow-subtle transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-ocean-900 rounded-[5px] hover:bg-ocean-800 shadow-card transition-colors"
          >
            View Live Store
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-[5px] text-amber-800 text-sm mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Database Connection Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {error}. (Ensure your live MySQL credentials are configured in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">server/.env</code> and the database has been migrated).
            </p>
          </div>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{stats?.todayRevenue ? stats.todayRevenue.toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Paid orders settled today</p>
        </div>

        <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-[5px] bg-ocean-50 text-ocean-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.todayOrders ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total placed since midnight</p>
        </div>

        <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-[5px] bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats?.pendingOrdersCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires confirmation or dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-[5px] border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Variants</span>
            <div className="w-8 h-8 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {stats?.lowStockVariants?.length ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Stock ≤ 5 units remaining</p>
        </div>
      </div>

      {/* Main Content Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
            <span className="text-[11px] text-slate-400">Live order queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-ocean-900">{ord.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-700">{ord.customerNameSnapshot}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{Number(ord.total).toFixed(0)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-[5px] bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-[5px] ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No orders recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Low Stock Inventory</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-[5px] bg-rose-50 text-rose-700">
              Needs Attention
            </span>
          </div>

          {stats?.lowStockVariants && stats.lowStockVariants.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockVariants.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-[5px] bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600">{item.availableQuantity} left</span>
                    <p className="text-[10px] text-slate-400">Min {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              All inventory levels healthy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

