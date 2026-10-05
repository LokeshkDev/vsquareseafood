import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCustomers({ search: searchTerm, limit: 50 });
      setCustomers(res.data || res.customers || res || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError(err.message || 'Failed to fetch registered customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await adminService.updateCustomerStatus(id, newStatus);
      setActionNotice({
        type: 'success',
        message: `Customer account ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c))
      );
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update customer status.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Accounts</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer profiles, orders placed count, and account active access status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
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

      {/* Search */}
      <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-subtle">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ocean-600" />
            <span>Loading customer accounts...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No customers found</p>
            <p className="text-slate-400 mt-1">Customers will appear here when they register or order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Orders Settled</th>
                  <th className="py-3 px-3">Member Since</th>
                  <th className="py-3 px-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const fullName = c.firstName
                    ? `${c.firstName} ${c.lastName || ''}`.trim()
                    : 'Customer';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-[5px] bg-ocean-50 text-ocean-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{fullName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                        {c.email || '—'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">
                        {c.phone || '—'}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {c._count?.orders ?? 0} orders
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-[4px] border transition-colors ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Blocked'}
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
    </div>
  );
}
