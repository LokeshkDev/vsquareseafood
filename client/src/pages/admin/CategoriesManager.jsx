import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Waves,
  Fish,
  Flame,
  UtensilsCrossed,
  Package,
  Layers,
  Sparkles,
  EyeOff,
} from 'lucide-react';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { translateToTanglishTamil } from '../../utils/tanglishTranslator';

const RAW_CATEGORY_PRESETS = [
  { name: 'Sea Fish', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Prawns', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80' },
  { name: 'Crabs & Squid', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80' },
  { name: 'River Fish', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Combos', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Ready to Cook', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
];

const KITCHEN_CATEGORY_PRESETS = [
  { name: 'Meals & Thali', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Claypot Curries', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tawa & Deep Fry', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
  { name: 'Biryani & Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Soups & Starters', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80' },
];

const RAW_ICON_OPTIONS = [
  { id: 'Waves', label: 'Sea Waves' },
  { id: 'Fish', label: 'Fish' },
  { id: 'Shrimp', label: 'Shrimp / Prawns' },
  { id: 'Shell', label: 'Shell / Crab' },
  { id: 'Flame', label: 'Flame (Ready to Cook)' },
  { id: 'Package', label: 'Combo Assortment' },
  { id: 'Layers', label: 'General / All' },
];

const KITCHEN_ICON_OPTIONS = [
  { id: 'UtensilsCrossed', label: 'Meals & Thali' },
  { id: 'Flame', label: 'Tawa Fry & Curries' },
  { id: 'Package', label: 'Meal Box & Starters' },
  { id: 'Fish', label: 'Fish Dishes' },
  { id: 'Layers', label: 'General Kitchen' },
];

export const getCategoryDept = (c) => {
  if (!c) return 'raw';
  const slug = (c.slug || c.id || '').toLowerCase();
  if (slug.startsWith('kitchen-') || slug === 'cloud-kitchen' || c.department === 'kitchen') {
    return 'kitchen';
  }
  return 'raw';
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    department: 'raw',
    name: '',
    tamilName: '',
    slug: '',
    icon: 'Fish',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCategories(true);
      setCategories(res.data || res || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = (presetDept = null) => {
    setEditingCategory(null);
    const targetDept = presetDept || (selectedDept !== 'all' ? selectedDept : 'raw');
    setFormData({
      department: targetDept,
      name: '',
      tamilName: '',
      slug: targetDept === 'kitchen' ? 'kitchen-' : '',
      icon: targetDept === 'kitchen' ? 'UtensilsCrossed' : 'Waves',
      image: '',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCategory(c);
    const dept = getCategoryDept(c);
    setFormData({
      department: dept,
      name: c.name || '',
      tamilName: c.tamilName || '',
      slug: c.slug || '',
      icon: c.icon || (dept === 'kitchen' ? 'UtensilsCrossed' : 'Fish'),
      image: c.image || '',
      sortOrder: c.sortOrder ?? 0,
      isActive: Boolean(c.isActive),
    });
    setModalOpen(true);
  };

  const handleDepartmentSwitchInModal = (newDept) => {
    let newSlug = formData.slug;
    if (newDept === 'kitchen' && !newSlug.startsWith('kitchen-')) {
      newSlug = `kitchen-${newSlug.replace(/^kitchen-/, '')}`;
    } else if (newDept === 'raw' && newSlug.startsWith('kitchen-')) {
      newSlug = newSlug.replace(/^kitchen-/, '');
    }

    setFormData({
      ...formData,
      department: newDept,
      slug: newSlug,
      icon: newDept === 'kitchen' ? 'UtensilsCrossed' : 'Waves',
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionNotice(null);

    try {
      let finalSlug = formData.slug?.trim();
      if (!finalSlug && formData.name) {
        finalSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (formData.department === 'kitchen' && !finalSlug.startsWith('kitchen-')) {
          finalSlug = `kitchen-${finalSlug}`;
        }
      }

      const payload = {
        name: formData.name.trim(),
        tamilName: formData.tamilName?.trim() || undefined,
        slug: finalSlug,
        icon: formData.icon,
        image: formData.image?.trim() || undefined,
        sortOrder: Number(formData.sortOrder) || 0,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
        setActionNotice({ type: 'success', message: `Category "${payload.name}" updated successfully!` });
      } else {
        await adminService.createCategory(payload);
        setActionNotice({ type: 'success', message: `Category "${payload.name}" created successfully!` });
      }

      setModalOpen(false);
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error saving category:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to save category.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const count = category._count?.products ?? 0;
    const actionPrompt = count === 0
      ? `Are you sure you want to permanently delete category "${category.name}"?`
      : `Category "${category.name}" has ${count} attached product(s). Deleting it will permanently remove this category from the database. Proceed with deletion?`;

    if (!window.confirm(actionPrompt)) return;
    try {
      const catKey = category.id || category.slug;
      const res = await adminService.deleteCategory(catKey);
      const msg = res?.data?.message || res?.message || `Category "${category.name}" permanently deleted.`;
      setActionNotice({ type: 'success', message: msg });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(catKey);
        return next;
      });
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete category.' });
    }
  };

  const handleToggleSingleCategoryActive = async (category) => {
    try {
      const catKey = category.id || category.slug;
      const nextActive = !category.isActive;
      await adminService.updateCategory(catKey, { isActive: nextActive });
      setActionNotice({
        type: 'success',
        message: `Category "${category.name}" is now ${nextActive ? 'Active' : 'Inactive'}.`,
      });
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update category status.' });
    }
  };

  // Counts
  const rawCount = categories.filter((c) => getCategoryDept(c) === 'raw').length;
  const kitchenCount = categories.filter((c) => getCategoryDept(c) === 'kitchen').length;

  const filteredCategories = categories.filter((c) => {
    const dept = getCategoryDept(c);
    const matchesDept = selectedDept === 'all' || dept === selectedDept;

    const matchesSearch =
      searchTerm === '' ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tamilName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDept && matchesSearch;
  });

  // Bulk Selection Logic
  const toggleSelectCategory = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllFilteredSelected = useMemo(() => {
    if (filteredCategories.length === 0) return false;
    return filteredCategories.every((c) => selectedIds.has(c.id || c.slug));
  }, [filteredCategories, selectedIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return filteredCategories.some((c) => selectedIds.has(c.id || c.slug)) && !isAllFilteredSelected;
  }, [filteredCategories, selectedIds, isAllFilteredSelected]);

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCategories.forEach((c) => next.delete(c.id || c.slug));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredCategories.forEach((c) => next.add(c.id || c.slug));
        return next;
      });
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    setActionNotice(null);
    try {
      const ids = Array.from(selectedIds);
      const res = await adminService.bulkUpdateCategoryStatus(ids, true);
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully activated ${ids.length} category/division(s)!`,
      });
      setSelectedIds(new Set());
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to activate categories.' });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    setActionNotice(null);
    try {
      const ids = Array.from(selectedIds);
      const res = await adminService.bulkUpdateCategoryStatus(ids, false);
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully deactivated ${ids.length} category/division(s)!`,
      });
      setSelectedIds(new Set());
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to deactivate categories.' });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} selected category/division(s)? Attached products will be reassigned.`)) {
      return;
    }
    setBulkProcessing(true);
    setActionNotice(null);
    try {
      const ids = Array.from(selectedIds);
      const res = await adminService.bulkDeleteCategories(ids);
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully deleted ${count} category/division(s).`,
      });
      setSelectedIds(new Set());
      fetchCategories();
      window.dispatchEvent(new Event('v2_cms_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete selected categories.' });
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Categories & Menus</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage category divisions: Fresh Raw Seafood harbor cuts & Cloud Kitchen hot food menus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[5px] hover:bg-slate-50 shadow-subtle transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => openCreateModal()}
            style={{ backgroundColor: '#E15E18' }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-card transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Category
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
            {actionNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Department Tabs Bar */}
      <div className="bg-white p-2 rounded-[5px] border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedDept === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedDept === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedDept('raw')}
            className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedDept === 'raw'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-800 bg-sky-50 hover:bg-sky-100'
            }`}
          >
            <Fish className="w-3.5 h-3.5" />
            <span>🐟 Raw Seafood Categories</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedDept === 'raw' ? 'bg-white/20 text-white' : 'bg-sky-200 text-sky-900'}`}>
              {rawCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedDept('kitchen')}
            className={`px-3.5 py-1.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedDept === 'kitchen'
                ? 'bg-[#E15E18] text-white shadow-xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>🍳 Cloud Kitchen Categories</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedDept === 'kitchen' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-950'}`}>
              {kitchenCount}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-[5px] shadow-lg flex flex-wrap items-center justify-between gap-3 border border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-ocean-500 text-white text-xs font-black flex items-center justify-center">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-slate-100">
              {selectedIds.size} categor{selectedIds.size > 1 ? 'ies' : 'y'} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[11px] text-slate-400 hover:text-white underline ml-2 cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkActivate}
              disabled={bulkProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Activate selected categories (display on storefront)"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Activate Selected'}</span>
            </button>

            <button
              onClick={handleBulkDeactivate}
              disabled={bulkProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Deactivate selected categories (hide from storefront)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Deactivate Selected'}</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Delete selected categories permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Delete Selected'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ocean-600" />
            <span>Loading categories from MySQL...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Tag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No categories found in this section</p>
            <p className="text-slate-400 mt-1">Add a new category or click "Sync Catalog to DB".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeFilteredSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-ocean-600 focus:ring-ocean-500 border-slate-300 cursor-pointer"
                      title="Select / Deselect All visible categories"
                    />
                  </th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-3">Division</th>
                  <th className="py-3 px-3">Tamil Title</th>
                  <th className="py-3 px-3">Slug / URL Key</th>
                  <th className="py-3 px-3">Active Products</th>
                  <th className="py-3 px-3">Sort Order</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((c) => {
                  const productCount = c._count?.products ?? 0;
                  const dept = getCategoryDept(c);
                  const catKey = c.id || c.slug;
                  const isSelected = selectedIds.has(catKey);

                  return (
                    <tr
                      key={catKey}
                      className={`transition-colors ${
                        isSelected ? 'bg-ocean-50/70 hover:bg-ocean-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCategory(catKey)}
                          className="w-4 h-4 rounded text-ocean-600 focus:ring-ocean-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-8 h-8 rounded-[5px] object-cover border border-slate-200 shrink-0 bg-white"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-[5px] flex items-center justify-center font-bold text-xs shrink-0 ${
                                dept === 'kitchen'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-100 text-sky-900 border border-sky-300'
                              }`}
                            >
                              {dept === 'kitchen' ? '🍳' : '🐟'}
                            </div>
                          )}
                          <div>
                            <span className="text-slate-900 block font-bold">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Icon: {c.icon || 'Default'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Division Badge */}
                      <td className="py-3.5 px-3">
                        {dept === 'kitchen' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                            <UtensilsCrossed className="w-3 h-3" />
                            Cloud Kitchen
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold bg-sky-50 text-sky-800 border border-sky-200">
                            <Fish className="w-3 h-3" />
                            Raw Seafood
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 font-semibold font-tamil">
                        {c.tamilName || '—'}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                        /{c.slug}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {productCount} items
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-semibold">
                        #{c.sortOrder ?? 0}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleSingleCategoryActive(c)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold cursor-pointer transition-colors ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Active/Inactive"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          />
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-600 hover:text-ocean-700 hover:bg-ocean-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-colors cursor-pointer"
                            title={productCount > 0 ? "Reassign & Delete Category" : "Delete Category Permanently"}
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-[8px] border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h3>
                <p className="text-xs font-semibold text-slate-500">Live synchronized with database</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[5px] hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm font-medium">
              {/* Department Choice */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Division / Department *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDepartmentSwitchInModal('raw')}
                    className={`py-2 px-3 rounded-[5px] text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.department === 'raw'
                        ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🐟</span>
                    <span>Raw Seafood</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDepartmentSwitchInModal('kitchen')}
                    className={`py-2 px-3 rounded-[5px] text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.department === 'kitchen'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🍳</span>
                    <span>Cloud Kitchen</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const prefix = formData.department === 'kitchen' ? 'kitchen-' : '';
                    setFormData({
                      ...formData,
                      name: val,
                      slug: editingCategory ? formData.slug : `${prefix}${autoSlug}`,
                    });
                  }}
                  placeholder={formData.department === 'kitchen' ? 'e.g. Claypot Fish Curries' : 'e.g. Sea Fish / Vanjaram'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Tamil Title</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.name) {
                        const translated = translateToTanglishTamil(formData.name);
                        setFormData((prev) => ({ ...prev, tamilName: translated }));
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sea-800 bg-sea-50 hover:bg-sea-100 border border-sea-200 px-2 py-0.5 rounded-[4px] transition cursor-pointer"
                    title="Auto-translate English Category Name into Tanglish / Tamil script"
                  >
                    <Sparkles className="w-3 h-3 text-sea-600" />
                    <span>Auto Translate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.tamilName}
                  onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                  placeholder={formData.department === 'kitchen' ? 'e.g. மீன் குழம்பு வகைகள்' : 'e.g. கடல் மீன்'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-tamil"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug / URL Identifier *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={formData.department === 'kitchen' ? 'kitchen-curry' : 'sea-fish'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {formData.department === 'kitchen'
                    ? 'Tip: Prefix with "kitchen-" to group under Cloud Kitchen'
                    : 'Unique URL identifier for this raw category'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Icon Key</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
                >
                  {(formData.department === 'kitchen' ? KITCHEN_ICON_OPTIONS : RAW_ICON_OPTIONS).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Image with Upload, Replace, Delete */}
              <ImageUploadField
                value={formData.image}
                onChange={(newUrl) => setFormData({ ...formData, image: newUrl })}
                presets={formData.department === 'kitchen' ? KITCHEN_CATEGORY_PRESETS : RAW_CATEGORY_PRESETS}
                folder="categories"
                recommendedDimensions="600 × 600 px (1:1 Square)"
                label="Category Card Thumbnail Photo *"
                helpText="Displayed on homepage category scroller and department grid (Auto-compressed to ~40KB WebP)"
                aspectRatio="square"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-ocean-600 focus:ring-ocean-500"
                    />
                    <span className="font-bold text-slate-700">Category Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-[5px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#E15E18' }}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] transition-all disabled:opacity-60 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
