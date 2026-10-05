import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import {
  Fish,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  X,
  UtensilsCrossed,
  Flame,
  Layers,
  Clock,
  Thermometer,
  Anchor,
  EyeOff,
  CheckSquare,
} from 'lucide-react';
import ImageUploadField from '../../components/admin/ImageUploadField';
import MultipleImageUploadField from '../../components/admin/MultipleImageUploadField';
import { CLEANING_OPTIONS } from '../../data/products';
import { translateToTanglishTamil } from '../../utils/tanglishTranslator';

const RAW_PRESET_IMAGES = [
  { name: 'Vanjaram / Seer Fish', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80' },
  { name: 'Black Pomfret (Vavval)', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'White Pomfret', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tiger Prawns', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
  { name: 'White Sea Prawns', url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Blue Sea Crab', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sankara / Red Snapper', url: 'https://images.unsplash.com/photo-1510130387422-82ebd33b1044?auto=format&fit=crop&w=800&q=80' },
  { name: 'Asian Sea Bass (Koduva)', url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },
  { name: 'Freshwater Dam Rohu', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Marinated Steaks', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
];

const KITCHEN_PRESET_IMAGES = [
  { name: 'Kasimedu Fish Curry Meal', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Royal Seafood Thali', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { name: 'Claypot Meen Kuzhambu', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chettinad Crab Masala', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80' },
  { name: 'Vanjaram Tawa Fry', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { name: 'Prawn Pepper Roast', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crispy Nethili 65', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Prawn Dum Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Seer Fish Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chettinad Nandu Rasam', url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=800&q=80' },
];

const isKitchenProduct = (p) => {
  if (!p) return false;
  if (p.type === 'KITCHEN') return true;
  const catSlug = (p.category?.slug || p.categoryId || '').toLowerCase();
  return catSlug.startsWith('kitchen-') || catSlug === 'cloud-kitchen';
};

const isRawProduct = (p) => !isKitchenProduct(p);

export default function ProductsManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDeptParam = searchParams.get('dept');
  const activeDept = rawDeptParam === 'kitchen' ? 'kitchen' : rawDeptParam === 'all' ? 'all' : 'raw';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formDept, setFormDept] = useState('raw'); // 'raw' or 'kitchen'
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    slug: '',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: '',
    compareAtPrice: '',
    initialStock: 30,
    grossWeight: '500g',
    netWeight: '400g - 420g',
    serves: '2-3 people',
    harborSource: 'Kasimedu Fishing Harbor, Chennai (4:30 AM Catch)',
    storageTemp: '0°C - 4°C in crushed ice',
    imageUrl: RAW_PRESET_IMAGES[0].url,
    images: [RAW_PRESET_IMAGES[0].url],
    badge: "Today's Catch",
    isFreshCatch: true,
    isPopular: false,
    isFeatured: false,
    description: '',
    cookingTips: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminService.getProducts({ limit: 100 }),
        adminService.getCategories(true),
      ]);
      setProducts(prodRes.data || prodRes || []);
      setCategories(catRes.data || catRes || []);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
      setError(err.message || 'Failed to fetch catalog from live server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeptSwitch = (dept) => {
    setSearchParams({ dept });
    setSelectedCategory(''); // Reset category filter on department change
  };

  // Grouped Categories
  const rawCategories = useMemo(() => {
    return categories.filter((c) => {
      const slug = (c.slug || c.id || '').toLowerCase();
      return !slug.startsWith('kitchen-') && slug !== 'cloud-kitchen' && c.department !== 'kitchen';
    });
  }, [categories]);

  const kitchenCategories = useMemo(() => {
    return categories.filter((c) => {
      const slug = (c.slug || c.id || '').toLowerCase();
      return slug.startsWith('kitchen-') || slug === 'cloud-kitchen' || c.department === 'kitchen';
    });
  }, [categories]);

  // Counts
  const rawCount = useMemo(() => products.filter(isRawProduct).length, [products]);
  const kitchenCount = useMemo(() => products.filter(isKitchenProduct).length, [products]);

  // Open Create Modal with Department Presets
  const openCreateModal = (targetDept = activeDept) => {
    const dept = targetDept === 'kitchen' ? 'kitchen' : 'raw';
    setEditingProduct(null);
    setFormDept(dept);

    if (dept === 'kitchen') {
      const defaultCat = kitchenCategories[0]?.id || kitchenCategories[0]?.slug || 'kitchen-meals';
      setFormData({
        name: '',
        localName: '',
        slug: '',
        categoryId: defaultCat,
        type: 'KITCHEN',
        basePrice: '',
        compareAtPrice: '',
        initialStock: 40,
        grossWeight: 'Full Meal Box / 500ml',
        netWeight: 'Serves 1-2 people generously',
        serves: '1-2 people',
        harborSource: 'Cloud Kitchen Chef Counter (Cooked Fresh to Order)',
        storageTemp: 'Piping Hot (65°C - 70°C) Thermal Pack',
        imageUrl: KITCHEN_PRESET_IMAGES[0].url,
        images: [KITCHEN_PRESET_IMAGES[0].url],
        badge: 'Chef Special',
        isFreshCatch: false,
        isPopular: true,
        isFeatured: true,
        description: '',
        cookingTips: 'Delivered ready to eat in food-grade thermal containers. Consume hot.',
      });
    } else {
      const defaultCat = rawCategories[0]?.id || rawCategories[0]?.slug || 'sea-fish';
      setFormData({
        name: '',
        localName: '',
        slug: '',
        categoryId: defaultCat,
        type: 'RAW',
        basePrice: '',
        compareAtPrice: '',
        initialStock: 35,
        grossWeight: '500g',
        netWeight: '400g - 420g',
        serves: '2-3 people',
        harborSource: 'Kasimedu Fishing Harbor, Chennai (4:30 AM Catch)',
        storageTemp: '0°C - 4°C in crushed ice',
        imageUrl: RAW_PRESET_IMAGES[0].url,
        images: [RAW_PRESET_IMAGES[0].url],
        badge: "Today's Catch",
        isFreshCatch: true,
        isPopular: false,
        isFeatured: false,
        description: '',
        cookingTips: 'Marinate with red chili, turmeric, ginger-garlic paste and lemon. Shallow fry on iron tawa.',
        cutPrices: {},
        cleaningOptions: ['full-piece-uncut', 'curry-cut', 'fry-cut', 'whole-cleaned'],
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    const isKit = isKitchenProduct(p);
    setFormDept(isKit ? 'kitchen' : 'raw');

    const rawImages = (p.images && p.images.length > 0)
      ? p.images.map((img) => (typeof img === 'string' ? img : (img.publicUrl || img.url || ''))).filter(Boolean)
      : (p.imageUrl ? [p.imageUrl] : []);
    const primaryImg = p.images?.find((img) => img.isPrimary)?.publicUrl || rawImages[0] || p.imageUrl || '';
    const imagesList = rawImages.length > 0 ? rawImages : (primaryImg ? [primaryImg] : []);

    setFormData({
      name: p.name || '',
      localName: p.localName || '',
      slug: p.slug || '',
      categoryId: p.categoryId || (isKit ? 'kitchen-meals' : 'sea-fish'),
      type: p.type || (isKit ? 'KITCHEN' : 'RAW'),
      basePrice: p.basePrice || '',
      compareAtPrice: p.variants?.[0]?.compareAtPrice || '',
      initialStock: p.variants?.[0]?.inventory?.availableQuantity ?? 30,
      grossWeight: p.grossWeight || '',
      netWeight: p.netWeight || '',
      serves: p.serves || '',
      harborSource: p.harborSource || '',
      storageTemp: p.storageTemp || '',
      imageUrl: primaryImg,
      images: imagesList,
      badge: p.badge || '',
      isFreshCatch: Boolean(p.isFreshCatch),
      isPopular: Boolean(p.isPopular),
      isFeatured: Boolean(p.isFeatured),
      description: p.description || '',
      cookingTips: p.cookingTips || '',
      cutPrices: p.cutPrices || {},
      cleaningOptions: p.cleaningOptions || ['full-piece-uncut', 'curry-cut', 'fry-cut', 'whole-cleaned'],
    });
    setModalOpen(true);
  };

  const handleModalDeptChange = (newDept) => {
    setFormDept(newDept);
    if (newDept === 'kitchen') {
      const defaultCat = kitchenCategories[0]?.id || kitchenCategories[0]?.slug || 'kitchen-meals';
      setFormData((prev) => ({
        ...prev,
        type: 'KITCHEN',
        categoryId: defaultCat,
        harborSource: prev.harborSource.includes('Kasimedu') ? 'Cloud Kitchen Chef Counter' : prev.harborSource,
        storageTemp: prev.storageTemp.includes('crushed ice') ? 'Piping Hot (65°C - 70°C)' : prev.storageTemp,
        grossWeight: prev.grossWeight === '500g' ? 'Meal Box / 500ml' : prev.grossWeight,
        badge: prev.badge === "Today's Catch" ? 'Chef Special' : prev.badge,
        isFreshCatch: false,
        imageUrl: prev.imageUrl.includes('photo-1534482421') ? KITCHEN_PRESET_IMAGES[0].url : prev.imageUrl,
        images: prev.images?.length > 0 ? prev.images : [KITCHEN_PRESET_IMAGES[0].url],
      }));
    } else {
      const defaultCat = rawCategories[0]?.id || rawCategories[0]?.slug || 'sea-fish';
      setFormData((prev) => ({
        ...prev,
        type: 'RAW',
        categoryId: defaultCat,
        harborSource: prev.harborSource.includes('Chef Counter') ? 'Kasimedu Fishing Harbor, Chennai' : prev.harborSource,
        storageTemp: prev.storageTemp.includes('Piping Hot') ? '0°C - 4°C in crushed ice' : prev.storageTemp,
        grossWeight: prev.grossWeight === 'Meal Box / 500ml' ? '500g' : prev.grossWeight,
        badge: prev.badge === 'Chef Special' ? "Today's Catch" : prev.badge,
        isFreshCatch: true,
        imageUrl: prev.imageUrl.includes('photo-1589301760') ? RAW_PRESET_IMAGES[0].url : prev.imageUrl,
        images: prev.images?.length > 0 ? prev.images : [RAW_PRESET_IMAGES[0].url],
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionNotice(null);

    try {
      const firstImage = formData.images?.[0] || formData.imageUrl?.trim() || undefined;
      const payload = {
        name: formData.name.trim(),
        localName: formData.localName?.trim() || undefined,
        slug: formData.slug?.trim() || undefined,
        categoryId: formData.categoryId,
        type: formData.type,
        basePrice: Number(formData.basePrice),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        grossWeight: formData.grossWeight || undefined,
        netWeight: formData.netWeight || undefined,
        serves: formData.serves || undefined,
        harborSource: formData.harborSource || undefined,
        storageTemp: formData.storageTemp || undefined,
        imageUrl: firstImage,
        images: formData.images && formData.images.length > 0 ? formData.images : (firstImage ? [firstImage] : []),
        badge: formData.badge?.trim() || undefined,
        isFreshCatch: formData.isFreshCatch,
        isPopular: formData.isPopular,
        isFeatured: formData.isFeatured,
        initialStock: Number(formData.initialStock) || 30,
        description: formData.description?.trim() || undefined,
        cookingTips: formData.cookingTips?.trim() || undefined,
        cutPrices: formData.cutPrices,
        cleaningOptions: formData.cleaningOptions,
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        setActionNotice({ type: 'success', message: `Product "${payload.name}" updated successfully in database!` });
      } else {
        await adminService.createProduct(payload);
        setActionNotice({ type: 'success', message: `Product "${payload.name}" created successfully in database!` });
      }

      setModalOpen(false);
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      console.error('Error saving product:', err);
      setActionNotice({ type: 'error', message: err.message || 'Failed to save product.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await adminService.deleteProduct(id);
      const msg = res?.data?.message || res?.message || `Product "${name}" deleted.`;
      setActionNotice({ type: 'success', message: msg });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete product.' });
    }
  };

  const handleToggleProductStatus = async (p) => {
    const newStatus = p.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      await adminService.updateProduct(p.id, { status: newStatus });
      setActionNotice({
        type: 'success',
        message: `Product "${p.name}" status updated to ${newStatus}.`,
      });
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to update product status.' });
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    // 1. Department match
    if (activeDept === 'raw' && !isRawProduct(p)) return false;
    if (activeDept === 'kitchen' && !isKitchenProduct(p)) return false;

    // 2. Search match
    const matchesSearch =
      searchTerm === '' ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.localName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Category match
    const matchesCategory =
      selectedCategory === '' || p.categoryId === selectedCategory || p.category?.slug === selectedCategory;

    // 4. Type match
    const matchesType = selectedType === '' || p.type === selectedType;

    // 5. Status match
    const currentStatus = p.status || 'ACTIVE';
    const matchesStatus =
      selectedStatus === '' ||
      selectedStatus === 'ALL' ||
      currentStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Bulk Selection Logic
  const toggleSelectProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllFilteredSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every((p) => selectedIds.has(p.id));
  }, [filteredProducts, selectedIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return filteredProducts.some((p) => selectedIds.has(p.id)) && !isAllFilteredSelected;
  }, [filteredProducts, selectedIds, isAllFilteredSelected]);

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p.id));
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
      const res = await adminService.bulkUpdateProductStatus(ids, 'ACTIVE');
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully activated ${ids.length} product(s)!`,
      });
      setSelectedIds(new Set());
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to activate selected products.' });
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
      const res = await adminService.bulkUpdateProductStatus(ids, 'INACTIVE');
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully deactivated ${ids.length} product(s)!`,
      });
      setSelectedIds(new Set());
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to deactivate selected products.' });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected product(s)? Items without customer orders will be permanently removed.`)) {
      return;
    }
    setBulkProcessing(true);
    setActionNotice(null);
    try {
      const ids = Array.from(selectedIds);
      const res = await adminService.bulkDeleteProducts(ids);
      setActionNotice({
        type: 'success',
        message: res?.message || `Successfully deleted ${count} product(s).`,
      });
      setSelectedIds(new Set());
      fetchData();
      try {
        window.dispatchEvent(new Event('v2_cms_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
    } catch (err) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to delete selected products.' });
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[5px] bg-ocean-100 text-ocean-900">
              {activeDept === 'kitchen' ? <UtensilsCrossed className="w-5 h-5 text-amber-600" /> : <Fish className="w-5 h-5" />}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeDept === 'kitchen' ? 'Cloud Kitchen Menu' : activeDept === 'raw' ? 'Raw Seafood Catalog' : 'All Products Catalog'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeDept === 'kitchen'
              ? 'Manage cooked hot food dishes, claypot gravies, tawa fries, biryanis & thali meal boxes.'
              : activeDept === 'raw'
              ? 'Manage fresh harbor catches, cutting yield weights, cold-chain storage & daily sea landings.'
              : 'Master view across all fresh seafood catches and hot cooked cloud kitchen meals.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-[5px] hover:bg-slate-50 shadow-subtle transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => openCreateModal(activeDept)}
            style={{ backgroundColor: '#E15E18' }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] shadow-card transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {activeDept === 'kitchen' ? 'Add Kitchen Dish' : 'Add Seafood Product'}
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

      {/* Department Switcher Bar */}
      <div className="bg-white p-2.5 rounded-[5px] border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Raw Seafood Tab */}
          <button
            onClick={() => handleDeptSwitch('raw')}
            className={`px-4 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDept === 'raw'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-800 bg-sky-50 hover:bg-sky-100'
            }`}
          >
            <Fish className="w-4 h-4" />
            <span>🐟 Fresh Raw Seafood Catalog</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeDept === 'raw' ? 'bg-white/20 text-white' : 'bg-sky-200 text-sky-900'}`}>
              {rawCount}
            </span>
          </button>

          {/* Cloud Kitchen Tab */}
          <button
            onClick={() => handleDeptSwitch('kitchen')}
            className={`px-4 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeDept === 'kitchen'
                ? 'bg-[#E15E18] text-white shadow-xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>🍳 Cloud Kitchen Hot Food Menu</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeDept === 'kitchen' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-950'}`}>
              {kitchenCount}
            </span>
          </button>

          {/* All Catalog Tab */}
          <button
            onClick={() => handleDeptSwitch('all')}
            className={`px-3 py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeDept === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Items ({products.length})</span>
          </button>
        </div>

        {/* Quick Add Shortcut */}
        <div className="flex items-center gap-2">
          {activeDept !== 'kitchen' && (
            <button
              onClick={() => openCreateModal('raw')}
              className="px-2.5 py-1.5 rounded-[5px] text-[11px] font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Raw Catch</span>
            </button>
          )}
          {activeDept !== 'raw' && (
            <button
              onClick={() => openCreateModal('kitchen')}
              className="px-2.5 py-1.5 rounded-[5px] text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Kitchen Dish</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-subtle flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeDept === 'kitchen'
                ? 'Search dishes (e.g. Kasimedu meals, Vanjaram fry, Biryani)...'
                : 'Search raw seafood (e.g. Vanjaram, Tiger Prawns, Mud Crab)...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
          />
        </div>

        {/* Dynamic Category Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
          >
            <option value="">
              {activeDept === 'kitchen' ? 'All Kitchen Categories' : activeDept === 'raw' ? 'All Raw Categories' : 'All Categories'}
            </option>

            {activeDept === 'raw' &&
              rawCategories.map((c) => (
                <option key={c.id || c.slug} value={c.id || c.slug}>
                  {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                </option>
              ))}

            {activeDept === 'kitchen' &&
              kitchenCategories.map((c) => (
                <option key={c.id || c.slug} value={c.id || c.slug}>
                  {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                </option>
              ))}

            {activeDept === 'all' && (
              <>
                <optgroup label="🐟 Fresh Raw Seafood">
                  {rawCategories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🍳 Cloud Kitchen Hot Food">
                  {kitchenCategories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-36">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
          >
            <option value="">All Types</option>
            {activeDept !== 'kitchen' && <option value="RAW">Raw Fresh Catch</option>}
            {activeDept !== 'kitchen' && <option value="READY_TO_COOK">Ready to Cook</option>}
            {activeDept !== 'raw' && <option value="KITCHEN">Cloud Kitchen</option>}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>
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
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
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
              title="Activate selected products (visible on customer shop)"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Activate Selected'}</span>
            </button>

            <button
              onClick={handleBulkDeactivate}
              disabled={bulkProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Deactivate selected products (hide from customer shop)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Deactivate Selected'}</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Delete selected products from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{bulkProcessing ? 'Processing...' : 'Delete Selected'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table Card */}
      <div className="bg-white rounded-[5px] border border-slate-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-ocean-600" />
            <span>Loading catalog from live MySQL database...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            {activeDept === 'kitchen' ? (
              <UtensilsCrossed className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            ) : (
              <Fish className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            )}
            <p className="font-bold text-slate-700">No items found in this section</p>
            <p className="text-slate-400 mt-1">Try switching departments or adjust your search filter.</p>
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
                      title="Select / Deselect All visible products"
                    />
                  </th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-3">Division & Category</th>
                  <th className="py-3 px-3">Base Price</th>
                  <th className="py-3 px-3">{activeDept === 'kitchen' ? 'Portion / Serves' : 'Catch Weight & Yield'}</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Source / Prep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isKit = isKitchenProduct(p);
                  const primaryImg =
                    p.images?.find((img) => img.isPrimary)?.publicUrl ||
                    p.images?.[0]?.publicUrl ||
                    (isKit ? KITCHEN_PRESET_IMAGES[0].url : RAW_PRESET_IMAGES[0].url);

                  const stockQty = p.variants?.[0]?.inventory?.availableQuantity ?? 30;
                  const isSelected = selectedIds.has(p.id);
                  const isInactive = p.status === 'INACTIVE';
                  const isArchived = p.status === 'ARCHIVED';

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-ocean-50/70 hover:bg-ocean-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-4 h-4 rounded text-ocean-600 focus:ring-ocean-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={primaryImg}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-[5px] border border-slate-200 bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.src = isKit ? KITCHEN_PRESET_IMAGES[0].url : RAW_PRESET_IMAGES[0].url;
                              }}
                            />
                            {p.images && p.images.length > 1 && (
                              <span
                                title={`${p.images.length} photos uploaded`}
                                className="absolute -bottom-1 -right-1 bg-slate-900/90 text-white font-black text-[9px] px-1 py-0.2 rounded shadow-xs"
                              >
                                {p.images.length} 📷
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-ocean-700">{p.name}</div>
                            {p.localName && (
                              <div className="text-[11px] text-ocean-700 font-semibold font-tamil">{p.localName}</div>
                            )}
                            <div className="text-[10px] text-slate-400 font-mono">/{p.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Division & Category */}
                      <td className="py-3.5 px-3">
                        <div className="mb-1">
                          {isKit ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
                              <UtensilsCrossed className="w-2.5 h-2.5" />
                              Cloud Kitchen
                            </span>
                          ) : p.type === 'READY_TO_COOK' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-extrabold bg-orange-50 text-orange-900 border border-orange-200">
                              <Flame className="w-2.5 h-2.5" />
                              Ready to Cook
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-extrabold bg-sky-50 text-sky-900 border border-sky-200">
                              <Fish className="w-2.5 h-2.5" />
                              Raw Catch
                            </span>
                          )}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-[3px] text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.category?.name || p.categoryId}
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{Number(p.basePrice).toLocaleString('en-IN')}
                        </div>
                        {p.variants?.[0]?.compareAtPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{Number(p.variants[0].compareAtPrice).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Weight / Serves */}
                      <td className="py-3.5 px-3 text-slate-600">
                        {isKit ? (
                          <>
                            <div className="font-bold text-[11px] text-slate-800">{p.grossWeight || 'Meal Box / Container'}</div>
                            <div className="text-[10px] text-slate-500">{p.netWeight || p.serves || 'Ready to eat'}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-[11px]">Gross: {p.grossWeight || '500g'}</div>
                            <div className="text-[10px] text-slate-400">Net: {p.netWeight || '420g yield'}</div>
                          </>
                        )}
                      </td>

                      {/* Stock Units */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${
                            stockQty > 10
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : stockQty > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {stockQty > 0 ? `${stockQty} units` : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleProductStatus(p)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold cursor-pointer transition-colors ${
                            isInactive
                              ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              : isArchived
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to toggle Active/Inactive"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isInactive ? 'bg-slate-400' : isArchived ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          {p.status || 'ACTIVE'}
                        </button>
                      </td>

                      {/* Source / Prep */}
                      <td className="py-3.5 px-3">
                        <div className="text-[11px] text-slate-700 font-medium truncate max-w-[180px]" title={p.harborSource}>
                          {p.harborSource || (isKit ? 'Cloud Kitchen' : 'Kasimedu Harbor')}
                        </div>
                        {p.badge && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-ocean-50 text-ocean-700 border border-ocean-200">
                            {p.badge}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-600 hover:text-ocean-700 hover:bg-ocean-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Delete Product"
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

      {/* Add / Edit Product Modal - Full Screen / Max Space UI-Friendly */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <div className="bg-white rounded-[8px] border border-slate-200 shadow-2xl w-full max-w-6xl h-full sm:h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">
                    {editingProduct
                      ? `Edit Item: ${editingProduct.name}`
                      : formDept === 'kitchen'
                      ? 'Add New Cloud Kitchen Dish (Hot Food)'
                      : 'Add New Fresh Raw Seafood Item'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">Live synchronized with database</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[5px] hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form with Fixed Footer */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 text-sm font-medium">
                {/* Department Toggle inside modal */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Department / Division *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleModalDeptChange('raw')}
                      className={`py-2 px-3 rounded-[5px] text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formDept === 'raw'
                          ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Fish className="w-4 h-4 text-sky-600" />
                      <span>🐟 Fresh Raw Seafood</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModalDeptChange('kitchen')}
                      className={`py-2 px-3 rounded-[5px] text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formDept === 'kitchen'
                          ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <span>🍳 Cloud Kitchen (Hot Food)</span>
                    </button>
                  </div>
                </div>

                {/* Row 1: Name & Tamil Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setFormData({
                          ...formData,
                          name: val,
                          slug: editingProduct ? formData.slug : autoSlug,
                        });
                      }}
                      placeholder={formDept === 'kitchen' ? 'e.g. Kasimedu Meen Kuzhambu Meal' : 'e.g. Seer Fish / Vanjaram'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Local Name (Tamil)</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.name) {
                            const translated = translateToTanglishTamil(formData.name);
                            setFormData((prev) => ({ ...prev, localName: translated }));
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sea-800 bg-sea-50 hover:bg-sea-100 border border-sea-200 px-2 py-0.5 rounded-[4px] transition cursor-pointer"
                        title="Auto-translate English Product Name into Tanglish / Tamil script"
                      >
                        <Sparkles className="w-3 h-3 text-sea-600" />
                        <span>Auto Translate</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.localName}
                      onChange={(e) => setFormData({ ...formData, localName: e.target.value })}
                      placeholder={formDept === 'kitchen' ? 'e.g. காசிமேடு மீன் சாப்பாடு' : 'e.g. வஞ்சரம் மீன்'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-tamil"
                    />
                  </div>
                </div>

                {/* Row 2: Category & Product Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
                    >
                      {(formDept === 'kitchen' ? kitchenCategories : rawCategories).map((c) => (
                        <option key={c.id || c.slug} value={c.id || c.slug}>
                          {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white font-medium"
                    >
                      {formDept === 'kitchen' ? (
                        <option value="KITCHEN">Cloud Kitchen (Hot Food)</option>
                      ) : (
                        <>
                          <option value="RAW">Raw Fresh Seafood</option>
                          <option value="READY_TO_COOK">Ready to Cook (Marinated)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Row 3: Pricing & Starting Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g. 349"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Original MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      placeholder="e.g. 399"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Starting Stock (Units)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                      placeholder="40"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Row 4: Weights / Portion & Servings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formDept === 'kitchen' ? 'Container / Packaging' : 'Gross Weight (Catch)'}
                    </label>
                    <input
                      type="text"
                      value={formData.grossWeight}
                      onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                      placeholder={formDept === 'kitchen' ? 'e.g. Full Meal Box / 500ml' : 'e.g. 500g'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formDept === 'kitchen' ? 'Portion Accompaniments' : 'Net Cleaned Yield'}
                    </label>
                    <input
                      type="text"
                      value={formData.netWeight}
                      onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                      placeholder={formDept === 'kitchen' ? 'e.g. With 2 Steaks + Rice + Salna' : 'e.g. 400g - 420g'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Serves</label>
                    <input
                      type="text"
                      value={formData.serves}
                      onChange={(e) => setFormData({ ...formData, serves: e.target.value })}
                      placeholder="e.g. 1-2 people"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Seafood Cut & Cleaning Differential Pricing Section */}
                {formDept === 'raw' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-[5px] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Seafood Cut & Cleaning Differential Pricing Setup
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Configure exact prices per cut preference (e.g. Full Piece: ₹649, Curry Cut: ₹699, Fry Cut: ₹719, Fillet: ₹789).
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {CLEANING_OPTIONS.map((cut) => {
                        const isEnabled = formData.cleaningOptions?.includes(cut.id);
                        const basePriceNum = Number(formData.basePrice || 0);
                        const defaultCalcPrice = basePriceNum > 0 ? basePriceNum + (cut.priceModifier || 0) : '';
                        const cutPrice = formData.cutPrices?.[cut.id] !== undefined ? formData.cutPrices[cut.id] : defaultCalcPrice;

                        return (
                          <div
                            key={cut.id}
                            className={`p-3 rounded-[5px] border flex items-center justify-between gap-3 ${
                              isEnabled ? 'bg-white border-sea-400 shadow-2xs' : 'bg-slate-100/60 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={Boolean(isEnabled)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newOptions = checked
                                    ? [...(formData.cleaningOptions || []), cut.id]
                                    : (formData.cleaningOptions || []).filter((id) => id !== cut.id);
                                  setFormData({ ...formData, cleaningOptions: newOptions });
                                }}
                                className="rounded text-ocean-600 focus:ring-ocean-500 cursor-pointer"
                              />
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-800 block truncate">{cut.label}</span>
                                <span className="text-[10px] text-slate-500 block truncate">{cut.desc}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                disabled={!isEnabled}
                                value={cutPrice}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  setFormData({
                                    ...formData,
                                    cutPrices: {
                                      ...(formData.cutPrices || {}),
                                      [cut.id]: val,
                                    },
                                  });
                                }}
                                placeholder="Price"
                                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-[3px] text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-sea-500 disabled:bg-slate-100"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row 5: Multiple Product Images with Upload, Reorder, Delete, Cover Designation */}
                <MultipleImageUploadField
                  images={formData.images || (formData.imageUrl ? [formData.imageUrl] : [])}
                  onChange={(newImages) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: newImages,
                      imageUrl: newImages[0] || '',
                    }));
                  }}
                  presets={formDept === 'kitchen' ? KITCHEN_PRESET_IMAGES : RAW_PRESET_IMAGES}
                  folder={formDept === 'kitchen' ? 'kitchen' : 'seafood'}
                  label={formDept === 'kitchen' ? 'Dish Photos & Plated Images Gallery *' : 'Product Photos & Fresh Catch Images Gallery *'}
                  maxImages={10}
                />

                {/* Row 6: Sourcing & Temperatures */}
                <div className="p-3.5 bg-slate-50 rounded-[5px] border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {formDept === 'kitchen' ? 'Kitchen Station / Prep Method' : 'Harbor Landing Source'}
                      </label>
                      <input
                        type="text"
                        value={formData.harborSource}
                        onChange={(e) => setFormData({ ...formData, harborSource: e.target.value })}
                        placeholder={formDept === 'kitchen' ? 'e.g. Claypot Slow Simmered (2 Hours)' : 'e.g. Kasimedu Fishing Harbor, Chennai'}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-[5px] text-xs focus:outline-none focus:ring-1 focus:ring-ocean-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {formDept === 'kitchen' ? 'Delivered Serving Temperature' : 'Cold-Chain Storage Temp'}
                      </label>
                      <input
                        type="text"
                        value={formData.storageTemp}
                        onChange={(e) => setFormData({ ...formData, storageTemp: e.target.value })}
                        placeholder={formDept === 'kitchen' ? 'e.g. Piping Hot (65°C - 70°C)' : 'e.g. 0°C - 4°C in crushed ice'}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-[5px] text-xs focus:outline-none focus:ring-1 focus:ring-ocean-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Badge Text (Optional)</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder={formDept === 'kitchen' ? 'e.g. Chef Special, Lunch Bestseller' : "e.g. Today's Catch, Best Value"}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-[5px] text-xs focus:outline-none focus:ring-1 focus:ring-ocean-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {formDept === 'kitchen' ? 'Serving Accompaniments' : 'Cooking / Cleaning Tip'}
                      </label>
                      <input
                        type="text"
                        value={formData.cookingTips}
                        onChange={(e) => setFormData({ ...formData, cookingTips: e.target.value })}
                        placeholder={formDept === 'kitchen' ? 'e.g. Served with hot salna, raita & appalam' : 'e.g. Shallow fry on iron tawa with coconut oil'}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-[5px] text-xs focus:outline-none focus:ring-1 focus:ring-ocean-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    {formDept === 'raw' && (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFreshCatch}
                          onChange={(e) => setFormData({ ...formData, isFreshCatch: e.target.checked })}
                          className="rounded text-ocean-600 focus:ring-ocean-500"
                        />
                        <span className="font-semibold text-slate-700">Display in "Fresh Catch" Section</span>
                      </label>
                    )}

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="rounded text-ocean-600 focus:ring-ocean-500"
                      />
                      <span className="font-semibold text-slate-700">Mark as Popular / Bestseller</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded text-ocean-600 focus:ring-ocean-500"
                      />
                      <span className="font-semibold text-slate-700">Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={
                      formDept === 'kitchen'
                        ? 'Describe ingredients, flavors, cooking vessel, accompaniments...'
                        : 'Describe fish texture, taste, bones count, origin harbor...'
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-ocean-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Fixed Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
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
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#E15E18] hover:bg-[#D8511C] rounded-[5px] transition-all disabled:opacity-60 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? 'Saving to Database...' : editingProduct ? 'Save Changes' : formDept === 'kitchen' ? 'Save Kitchen Dish' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}