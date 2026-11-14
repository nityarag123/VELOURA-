import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, ShieldCheck, ShoppingBag, DollarSign, 
  CheckCircle2, Clock, AlertCircle, RefreshCw, Key, 
  LogOut, Utensils, Calendar, Plus, Search, 
  Phone, Mail, MapPin, Filter, Trash2, Edit, Check, X,
  Coffee, Cake, IceCream, Cookie, Sparkles, Layers, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockData';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, login, logout, loading: authLoading } = useAuth();

  // Inline Admin Gate State (for unauthenticated / customer visitors)
  const [gateEmail, setGateEmail] = useState('admin@veloura.com');
  const [gatePassword, setGatePassword] = useState('admin123');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'reservations', 'orders', 'security'
  const [loading, setLoading] = useState(true);

  // Product Management State
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: 1,
    base_price: 350.0,
    discount_price: '',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    description: '',
    flavours: 'Signature Classic',
    weights: 'Standard Serving',
    in_stock: true,
    is_eggless_available: true,
    is_bestseller: false
  });

  // Edit Product Form
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    category_id: 1,
    base_price: 0,
    discount_price: '',
    image_url: '',
    description: '',
    flavours: '',
    weights: '',
    in_stock: true,
    is_eggless_available: true
  });
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // Table Reservations Management State
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    reservation_date: 'Today',
    reservation_time: '7:30 PM - 9:30 PM',
    location: 'Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad',
    guests_count: '2 Guests',
    table_number: 'Table 02',
    table_name: 'Parisian Velvet Booth',
    special_requests: 'Direct Admin Log Entry',
    pre_ordered_items: '',
    status: 'Confirmed'
  });

  // Orders Management State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Admin Change Password State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodsRes, catsRes, ordersRes, resRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ 
          data: { total_orders: 14, total_revenue: 9780.0, total_customers: 22 } 
        })),
        api.get('/products').catch(() => ({ data: MOCK_PRODUCTS })),
        api.get('/categories').catch(() => ({ data: MOCK_CATEGORIES })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/admin/reservations').catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);

      // Categories
      const loadedCats = Array.isArray(catsRes.data) && catsRes.data.length ? catsRes.data : MOCK_CATEGORIES;
      setCategories(loadedCats);

      // Products
      let loadedProds = Array.isArray(prodsRes.data) && prodsRes.data.length ? prodsRes.data : MOCK_PRODUCTS;
      setProducts(loadedProds);

      // Orders
      let loadedOrders = Array.isArray(ordersRes.data) && ordersRes.data.length ? ordersRes.data : [];
      if (!loadedOrders.length) {
        try {
          loadedOrders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
        } catch (e) {}
      }
      setOrders(loadedOrders);

      // Reservations
      let loadedRes = Array.isArray(resRes.data) && resRes.data.length ? resRes.data : [];
      if (!loadedRes.length) {
        try {
          loadedRes = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
        } catch (e) {}
      }
      setReservations(loadedRes);

    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Gate Handlers
  const handleGateUnlock = async (e) => {
    if (e) e.preventDefault();
    setGateLoading(true);
    setGateError('');
    try {
      await login(gateEmail.trim().toLowerCase(), gatePassword);
    } catch (err) {
      setGateError(err.message || 'Incorrect admin email or password.');
    } finally {
      setGateLoading(false);
    }
  };

  const handleInstantGateUnlock = async () => {
    setGateLoading(true);
    setGateError('');
    try {
      await login('admin@veloura.com', 'admin123');
    } catch (err) {
      setGateError('Failed to unlock admin session');
    } finally {
      setGateLoading(false);
    }
  };

  // -------------------------------------------------------------
  // PRODUCT MANAGEMENT ACTIONS
  // -------------------------------------------------------------
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const selectedCat = categories.find((c) => c.id === parseInt(newProduct.category_id)) || categories[0];
      const payload = {
        name: newProduct.name.trim(),
        slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newProduct.description.trim(),
        category_id: parseInt(newProduct.category_id),
        category_name: selectedCat?.name || 'Category',
        category_slug: selectedCat?.slug || 'category',
        base_price: parseFloat(newProduct.base_price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        image_url: newProduct.image_url.trim(),
        flavours: newProduct.flavours,
        weights: newProduct.weights,
        in_stock: newProduct.in_stock ? 1 : 0,
        is_eggless_available: newProduct.is_eggless_available ? 1 : 0,
        is_bestseller: newProduct.is_bestseller ? 1 : 0
      };

      const res = await api.post('/admin/products', payload);
      const created = res.data;
      setProducts((prev) => [created, ...prev]);
      setShowAddProductModal(false);
      setProductSuccessMsg(`Product "${created.name}" successfully added to ${selectedCat?.name || 'Category'}!`);
      setTimeout(() => setProductSuccessMsg(''), 4000);

      // Reset Form
      setNewProduct({
        name: '',
        category_id: 1,
        base_price: 350.0,
        discount_price: '',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        description: '',
        flavours: 'Signature Classic',
        weights: 'Standard Serving',
        in_stock: true,
        is_eggless_available: true,
        is_bestseller: false
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create product');
    }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditProductForm({
      name: prod.name,
      category_id: prod.category_id || (prod.category && prod.category.id) || 1,
      base_price: prod.base_price,
      discount_price: prod.discount_price || '',
      image_url: prod.image_url,
      description: prod.description,
      flavours: Array.isArray(prod.flavours) ? prod.flavours.join(', ') : (prod.flavours || ''),
      weights: Array.isArray(prod.weights) ? prod.weights.join(', ') : (prod.weights || ''),
      in_stock: Boolean(prod.in_stock),
      is_eggless_available: Boolean(prod.is_eggless_available)
    });
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const selectedCat = categories.find((c) => c.id === parseInt(editProductForm.category_id)) || categories[0];
      const payload = {
        name: editProductForm.name.trim(),
        category_id: parseInt(editProductForm.category_id),
        category_name: selectedCat?.name,
        category_slug: selectedCat?.slug,
        base_price: parseFloat(editProductForm.base_price),
        discount_price: editProductForm.discount_price ? parseFloat(editProductForm.discount_price) : null,
        image_url: editProductForm.image_url.trim(),
        description: editProductForm.description.trim(),
        flavours: editProductForm.flavours,
        weights: editProductForm.weights,
        in_stock: editProductForm.in_stock ? 1 : 0,
        is_eggless_available: editProductForm.is_eggless_available ? 1 : 0
      };

      const res = await api.put(`/admin/products/${editingProduct.id}`, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...res.data } : p))
      );
      setEditingProduct(null);
      setProductSuccessMsg('Product details and pricing updated successfully!');
      setTimeout(() => setProductSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the menu?`)) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setProductSuccessMsg(`Product "${productName}" removed from menu.`);
      setTimeout(() => setProductSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // -------------------------------------------------------------
  // TABLE RESERVATION ACTIONS
  // -------------------------------------------------------------
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/reservations', newReservation);
      const created = res.data;
      setReservations((prev) => [created, ...prev]);
      setShowAddReservationModal(false);
      setProductSuccessMsg(`Reservation for ${created.guest_name} logged successfully with pre-ordered items!`);
      setTimeout(() => setProductSuccessMsg(''), 4000);

      setNewReservation({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        reservation_date: 'Today',
        reservation_time: '7:30 PM - 9:30 PM',
        location: 'Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad',
        guests_count: '2 Guests',
        table_number: 'Table 02',
        table_name: 'Parisian Velvet Booth',
        special_requests: 'Direct Admin Log Entry',
        pre_ordered_items: '',
        status: 'Confirmed'
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create reservation');
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await api.put(`/admin/reservations/${resId}/status`, { status: newStatus });
      setReservations((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReservation = async (resId, guestName) => {
    if (!window.confirm(`Delete reservation record for "${guestName}"?`)) return;
    try {
      await api.delete(`/admin/reservations/${resId}`);
      setReservations((prev) => prev.filter((r) => r.id !== resId));
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // ORDER ACTIONS
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // PASSWORD ACTIONS
  // -------------------------------------------------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await api.put('/admin/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordSuccess(res.data?.message || 'Admin password updated successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to update admin password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedCategoryFilter === 'all') return true;

    // Filter by specific category
    const catId = parseInt(selectedCategoryFilter);
    const pCatId = p.category_id || (p.category && p.category.id);
    const pCatSlug = p.category_slug || (p.category && p.category.slug) || '';

    if (!isNaN(catId)) {
      return pCatId === catId;
    }

    if (selectedCategoryFilter === 'cakes') {
      return [1, 2, 3, 4].includes(pCatId) || pCatSlug.includes('cake');
    }
    if (selectedCategoryFilter === 'coffee') {
      return pCatId === 10 || pCatSlug.includes('coffee');
    }
    if (selectedCategoryFilter === 'boulangerie') {
      return pCatId === 12 || pCatSlug.includes('boulangerie');
    }
    if (selectedCategoryFilter === 'gelato') {
      return pCatId === 13 || pCatSlug.includes('gelato');
    }
    if (selectedCategoryFilter === 'chocolates') {
      return pCatId === 14 || pCatSlug.includes('chocolate');
    }
    if (selectedCategoryFilter === 'pastries') {
      return [5, 6, 7, 8].includes(pCatId) || pCatSlug.includes('pastries');
    }
    if (selectedCategoryFilter === 'savory') {
      return pCatId === 11 || pCatSlug.includes('savory');
    }
    if (selectedCategoryFilter === 'hampers') {
      return pCatId === 9 || pCatSlug.includes('hamper');
    }

    return true;
  });

  // Filtered Reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = reservationStatusFilter === 'all' || (r.status && r.status.toLowerCase() === reservationStatusFilter.toLowerCase());
    const q = reservationSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.token && r.token.toLowerCase().includes(q)) ||
      (r.guest_name && r.guest_name.toLowerCase().includes(q)) ||
      (r.guest_phone && r.guest_phone.toLowerCase().includes(q)) ||
      (r.table_number && r.table_number.toLowerCase().includes(q)) ||
      (r.pre_ordered_items && r.pre_ordered_items.toLowerCase().includes(q)) ||
      (r.special_requests && r.special_requests.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderStatusFilter === 'all' || (o.status && o.status.toLowerCase() === orderStatusFilter.toLowerCase());
    const q = orderSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      (o.order_number && o.order_number.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(q)) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      (o.cake_message && o.cake_message.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // ============================================================
  // UNVERIFIED / NON-ADMIN IN-PLACE ACCESS GATE
  // ============================================================
  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#D8C7B5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 luxury-mocha-texture">
        <div className="max-w-md w-full bg-[#E8DDD2] p-8 sm:p-10 rounded-3xl border-2 border-[#C4B19F] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#260D16] text-[#D8B879] flex items-center justify-center font-bold text-2xl shadow-lg border border-[#D8B879]/50">
              👑
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C5E43] block">
              Executive Security Protocol
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#160B0D]">
              Veloura Menu & Operations
            </h1>
            <p className="text-xs text-[#3D2820] max-w-md mx-auto leading-relaxed">
              Administrative credentials are required to manage products across all categories (coffee, cakes, boulangerie, gelato, chocolates), track customer orders, and manage table logs.
            </p>
          </div>

          {gateError && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-900 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#160B0D] uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#C4B19F] text-xs text-[#160B0D] focus:outline-none focus:border-[#260D16]"
                placeholder="admin@veloura.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#160B0D] uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#C4B19F] text-xs text-[#160B0D] focus:outline-none focus:border-[#260D16]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {gateLoading ? 'Authenticating...' : 'Unlock Admin Operations'}
            </button>
          </form>

          {/* 1-Click Instant Master Admin Access */}
          <div className="pt-2 border-t border-[#C4B19F]/50">
            <button
              type="button"
              onClick={handleInstantGateUnlock}
              disabled={gateLoading}
              className="w-full py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D8B879] hover:bg-[#c9a765] text-[#160B0D] shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#160B0D]" />
              <span>⚡ 1-Click Master Admin Instant Unlock</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-[#8C5E43] hover:text-[#160B0D] transition underline"
            >
              ← Return to Veloura Boutique Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUTHENTICATED ADMIN DASHBOARD VIEW
  // ============================================================
  return (
    <div className="min-h-screen bg-[#D8C7B5] text-[#160B0D] py-8 px-4 sm:px-6 lg:px-8 space-y-7 luxury-mocha-texture">
      
      {/* 1. EXECUTIVE ADMIN SESSION STATUS BAR */}
      <div className="bg-[#260D16] text-[#FAF6EE] p-4 sm:p-5 rounded-2xl shadow-xl border border-[#D8B879]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#D8B879] text-[#160B0D] flex items-center justify-center font-bold text-xl shadow-md">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D8B879]">
                Veloura Menu & Operations Console
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white">
              {user?.full_name || 'VELOURA Master Chef'} ({user?.email || 'admin@veloura.com'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-[#FAF6EE] border border-white/20 transition flex items-center gap-1.5"
            title="Refresh products, orders, and table logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D8B879] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600/80 hover:bg-red-700 text-white transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {productSuccessMsg && (
        <div className="p-3.5 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{productSuccessMsg}</span>
          </div>
          <button onClick={() => setProductSuccessMsg('')} className="p-1 hover:bg-white/20 rounded-full">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#8C5E43] flex items-center gap-2 py-2 px-4 bg-[#E8DDD2] rounded-xl border border-[#C4B19F] shadow-xs">
        <Link to="/" className="hover:text-[#260D16] flex items-center gap-1 font-bold text-[#160B0D] transition">
          <Home className="w-3.5 h-3.5 text-[#260D16]" />
          <span>Boutique Home</span>
        </Link>
        <span className="text-[#C4B19F]">/</span>
        <span className="text-[#260D16] font-bold">Admin Console</span>
        <span className="text-[#C4B19F]">/</span>
        <span className="text-[#8C5E43] font-semibold">
          {activeTab === 'products' ? 'Menu & Products (All Categories)' : activeTab === 'reservations' ? 'Table Reservations & Logs' : activeTab === 'orders' ? 'Customer Orders' : 'Security'}
        </span>
      </nav>

      {/* 2. PRIMARY ADMINISTRATIVE TABS SWITCHER */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#C4B19F] pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          {/* TAB 1: ALL PRODUCTS MANAGEMENT */}
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'products'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Manage Menu & Products ({products.length})</span>
          </button>

          {/* TAB 2: TABLE RESERVATIONS & LOGS */}
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'reservations'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Table Reservations & Logs ({reservations.length})</span>
          </button>

          {/* TAB 3: CUSTOMER ORDERS */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'orders'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          {/* TAB 4: SECURITY */}
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'security'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Admin Password</span>
          </button>
        </div>

        {/* Action Button: Add Product */}
        {activeTab === 'products' && (
          <button
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#D8B879]" />
            <span>+ Add New Product to Menu</span>
          </button>
        )}

        {/* Action Button: Add Reservation */}
        {activeTab === 'reservations' && (
          <button
            onClick={() => setShowAddReservationModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#D8B879]" />
            <span>+ Add Reservation Log</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: MENU & PRODUCTS MANAGEMENT (ALL CATEGORIES)            */}
      {/* ============================================================ */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          
          {/* Search & Category Filter Strip */}
          <div className="p-5 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F] space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title, category, description, or price..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none focus:border-[#260D16]"
                />
              </div>

              <div className="text-xs text-[#8C5E43] font-bold">
                Showing {filteredProducts.length} of {products.length} menu items
              </div>
            </div>

            {/* CATEGORY SWITCHER PILLS (Matching Website Categories: Coffee, Cakes, Boulangerie, Gelato, Chocolates, etc.) */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E43] block mb-2">
                Filter by Menu Category:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  All Categories ({products.length})
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('coffee')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'coffee'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Specialty Coffee</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('cakes')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'cakes'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <Cake className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Cakes & Gateaux</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('boulangerie')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'boulangerie'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <Cookie className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Boulangerie (Breads & Croissants)</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('gelato')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'gelato'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <IceCream className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Artisanal Gelato</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('chocolates')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'chocolates'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Handcrafted Chocolates</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('pastries')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'pastries'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-[#8C5E43]" />
                  <span>Pastries & Desserts</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('savory')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'savory'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <span>Gourmet Savory Bites</span>
                </button>

                <button
                  onClick={() => setSelectedCategoryFilter('hampers')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    selectedCategoryFilter === 'hampers'
                      ? 'bg-[#260D16] text-[#D8B879] shadow-sm'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  <span>Luxury Hampers</span>
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] space-y-3">
              <Layers className="w-12 h-12 text-[#C4B19F] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#160B0D]">No Products Found</h3>
              <p className="text-xs text-[#8C5E43] max-w-sm mx-auto">
                No items match this category or search filter. Click "+ Add New Product to Menu" to add an item here.
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#260D16] text-[#FAF6EE] rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 text-[#D8B879]" />
                <span>Add Item to This Category</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  {/* Photo & Badge */}
                  <div className="aspect-square relative bg-black/10 overflow-hidden">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span className="bg-[#260D16] text-[#D8B879] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                        ₹{prod.discount_price || prod.base_price}
                      </span>
                      {prod.discount_price && (
                        <span className="bg-gray-950/80 text-white text-[10px] px-2 py-0.5 rounded-full line-through">
                          ₹{prod.base_price}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md ${
                        prod.in_stock ? 'bg-emerald-800 text-white' : 'bg-red-800 text-white'
                      }`}>
                        {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C5E43] block">
                        {prod.category_name || (prod.category && prod.category.name) || 'Artisan Item'}
                      </span>
                      <h4 className="font-serif text-base font-bold text-[#160B0D] line-clamp-1 mt-0.5">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-[#3D2820] line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="pt-3 border-t border-[#C4B19F]/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="flex-1 py-2 px-3 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#D8B879]" />
                        <span>Edit Product</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 text-gray-500 hover:text-red-700 rounded-xl hover:bg-red-500/10 transition border border-[#C4B19F]/60"
                        title="Delete product from menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TABLE RESERVATIONS & LOGS (WITH PRE-ORDERED ITEMS)     */}
      {/* ============================================================ */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-5 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search table logs by guest name, phone, reservation token, table number, or pre-ordered items..."
                value={reservationSearch}
                onChange={(e) => setReservationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-[#8C5E43] uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'Confirmed', 'Table Prepared', 'Guests Seated', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReservationStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    reservationStatusFilter === st
                      ? 'bg-[#260D16] text-[#D8B879]'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  {st === 'all' ? `All (${reservations.length})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Reservations Grid */}
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] space-y-2">
              <Utensils className="w-12 h-12 text-[#C4B19F] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#160B0D]">No Table Logs Found</h3>
              <p className="text-xs text-[#8C5E43]">
                {reservationSearch ? 'No reservations match your search.' : 'No reservations in this status category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((res) => {
                const statusBadge = 
                  res.status === 'Guests Seated' ? 'bg-emerald-800 text-white' :
                  res.status === 'Table Prepared' ? 'bg-amber-700 text-white' :
                  res.status === 'Confirmed' ? 'bg-[#260D16] text-[#D8B879]' :
                  res.status === 'Completed' ? 'bg-gray-800 text-white' :
                  'bg-red-800 text-white';

                return (
                  <div
                    key={res.id}
                    className="p-6 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      {/* Token & Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
                        <span className="font-mono text-xs font-extrabold text-[#260D16] bg-white px-2.5 py-1 rounded-lg border border-[#C4B19F]">
                          {res.token}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusBadge}`}>
                          {res.status}
                        </span>
                      </div>

                      {/* Guest Details */}
                      <div className="mt-3 space-y-1">
                        <h4 className="font-serif text-lg font-bold text-[#160B0D]">{res.guest_name}</h4>
                        <div className="flex flex-col gap-1 text-xs">
                          <a href={`tel:${res.guest_phone}`} className="text-[#260D16] font-bold hover:underline flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#D8B879]" />
                            <span>{res.guest_phone}</span>
                          </a>
                          {res.guest_email && (
                            <span className="text-[#8C5E43] flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-[#8C5E43]" />
                              <span>{res.guest_email}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Table & Schedule Details */}
                      <div className="mt-4 p-3.5 bg-white/80 rounded-2xl border border-[#C4B19F] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#260D16] flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-[#D8B879]" />
                            <span>{res.table_number}: {res.table_name}</span>
                          </span>
                          <span className="bg-[#260D16] text-[#D8B879] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {res.guests_count || '2 Guests'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#3D2820] font-semibold text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-[#8C5E43]" />
                          <span>{res.reservation_date} • {res.reservation_time}</span>
                        </div>

                        <div className="text-[11px] text-[#8C5E43] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#8C5E43]" />
                          <span className="truncate">{res.location}</span>
                        </div>
                      </div>

                      {/* PRE-ORDERED ITEMS LOGGED FOR THIS RESERVATION */}
                      {res.pre_ordered_items ? (
                        <div className="mt-3 p-3.5 bg-[#260D16] text-[#FAF6EE] rounded-2xl border border-[#D8B879] text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B879] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D8B879]" />
                            <span>Pre-Ordered Menu Items in this Log:</span>
                          </span>
                          <p className="font-bold text-white leading-relaxed">
                            {res.pre_ordered_items}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 p-2.5 bg-white/40 rounded-xl border border-dashed border-[#C4B19F] text-[11px] text-[#8C5E43] italic">
                          No specific menu items pre-ordered for this table.
                        </div>
                      )}

                      {/* Special Notes */}
                      {res.special_requests && (
                        <div className="mt-3 p-3 bg-white/50 rounded-xl border border-[#C4B19F]/60 text-xs">
                          <span className="text-[10px] font-bold text-[#8C5E43] uppercase tracking-wider block">
                            Special Celebration Notes:
                          </span>
                          <p className="text-[#160B0D] italic mt-0.5">
                            "{res.special_requests}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Changer & Delete */}
                    <div className="pt-3 border-t border-[#C4B19F] flex items-center justify-between gap-2">
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                        className="text-xs font-bold bg-[#260D16] text-[#D8B879] rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Table Prepared">Table Prepared</option>
                        <option value="Guests Seated">Guests Seated</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => handleDeleteReservation(res.id, res.guest_name)}
                        className="p-1.5 text-gray-400 hover:text-red-700 rounded-xl hover:bg-red-500/10 transition"
                        title="Delete reservation log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CUSTOMER ORDERS                                        */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-5 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by customer name, phone, order number, city, or cake message..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-[#8C5E43] uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'Order Placed', 'Confirmed', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    orderStatusFilter === st
                      ? 'bg-[#260D16] text-[#D8B879]'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  {st === 'all' ? `All (${orders.length})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] space-y-2">
              <ShoppingBag className="w-12 h-12 text-[#C4B19F] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#160B0D]">No Orders Found</h3>
              <p className="text-xs text-[#8C5E43]">
                {orderSearch ? 'Try a different search keyword.' : 'No customer orders match the selected status filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((ord) => {
                const statusColor = 
                  ord.status === 'Delivered' ? 'bg-emerald-800 text-white' :
                  ord.status === 'Baking' ? 'bg-amber-700 text-white' :
                  ord.status === 'Out for Delivery' ? 'bg-blue-800 text-white' :
                  ord.status === 'Cancelled' ? 'bg-red-800 text-white' :
                  'bg-[#260D16] text-[#D8B879]';

                return (
                  <div
                    key={ord.id}
                    className="p-6 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F] space-y-5 shadow-sm hover:shadow-md transition"
                  >
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C4B19F] gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-base font-extrabold text-[#260D16] tracking-tight">
                            {ord.order_number}
                          </span>
                          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs ${statusColor}`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#3D2820] mt-1 flex items-center gap-2 flex-wrap">
                          <span>Customer: <strong className="text-[#160B0D]">{ord.customer_name}</strong></span>
                          <span>•</span>
                          <a href={`tel:${ord.customer_phone}`} className="text-[#260D16] font-bold hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#D8B879]" />
                            <span>{ord.customer_phone}</span>
                          </a>
                          <span>•</span>
                          <span className="text-[#8C5E43]">Placed: {new Date(ord.created_at).toLocaleString()}</span>
                        </p>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2 bg-white/90 p-2 rounded-2xl border border-[#C4B19F] shadow-xs">
                        <span className="text-[11px] font-bold text-[#8C5E43] uppercase tracking-wider pl-1">
                          Update Status:
                        </span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="text-xs font-extrabold bg-[#260D16] text-[#D8B879] rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Baking">Baking in Oven</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                      {/* Left: Items */}
                      <div className="lg:col-span-7 space-y-3">
                        <h5 className="font-bold text-[#8C5E43] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#260D16]" />
                          <span>Ordered Bakery Items</span>
                        </h5>

                        <div className="space-y-2.5">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-white/80 p-3 rounded-2xl border border-[#C4B19F]">
                              {it.product_image ? (
                                <img 
                                  src={it.product_image} 
                                  alt={it.product_name} 
                                  className="w-14 h-14 object-cover rounded-xl border border-[#C4B19F] flex-shrink-0" 
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-[#260D16] text-[#D8B879] flex items-center justify-center font-bold text-lg flex-shrink-0">
                                  🎂
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-[#160B0D] truncate">{it.product_name}</p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C5E43] mt-0.5">
                                  <span className="font-semibold text-[#160B0D]">Qty: {it.quantity}</span>
                                  <span>•</span>
                                  <span>Weight: {it.weight || '1.0 kg'}</span>
                                  <span>•</span>
                                  <span>Flavour: {it.flavour || 'Artisan Truffle'}</span>
                                </div>
                                <p className="text-xs font-bold text-[#260D16] mt-1">₹{it.total_price || (it.unit_price * it.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Plaque Message */}
                        {ord.cake_message && (
                          <div className="p-3.5 bg-[#260D16] text-[#FAF6EE] rounded-2xl border border-[#D8B879] space-y-1 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B879]">
                              Cake Plaque Inscription:
                            </span>
                            <p className="font-serif text-sm font-bold italic text-white">
                              "{ord.cake_message}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Delivery & Total */}
                      <div className="lg:col-span-5 space-y-3">
                        <h5 className="font-bold text-[#8C5E43] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#260D16]" />
                          <span>Delivery Address & Total</span>
                        </h5>

                        <div className="bg-white/80 p-4 rounded-2xl border border-[#C4B19F] space-y-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43] block">
                              Scheduled Slot:
                            </span>
                            <p className="font-bold text-[#260D16] text-xs mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#D8B879]" />
                              <span>{ord.delivery_date} • {ord.delivery_time_slot || ord.delivery_slot || 'Standard Express'}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#C4B19F]/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43] block">
                              Address:
                            </span>
                            <p className="text-[#160B0D] font-medium leading-relaxed text-xs mt-0.5">
                              {ord.delivery_address}, {ord.city} - {ord.pincode}
                            </p>
                          </div>

                          {ord.special_instructions && (
                            <div className="pt-2 border-t border-[#C4B19F]/50">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                                Special Note:
                              </span>
                              <p className="text-xs text-[#260D16] font-semibold italic mt-0.5">
                                "{ord.special_instructions}"
                              </p>
                            </div>
                          )}

                          <div className="pt-3 border-t-2 border-[#C4B19F] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#8C5E43]">Grand Total:</span>
                              <p className="font-serif text-lg font-extrabold text-[#260D16]">₹{ord.total_amount}</p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#E8DDD2] text-[#260D16] border border-[#C4B19F]">
                              {ord.payment_method || 'UPI / Card'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: ADMIN PASSWORD UPDATE                                  */}
      {/* ============================================================ */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-[#E8DDD2] p-8 rounded-3xl border-2 border-[#C4B19F] space-y-6 shadow-sm">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#160B0D] flex items-center gap-2">
              <Key className="w-5 h-5 text-[#260D16]" />
              <span>Update Admin Password</span>
            </h3>
            <p className="text-xs text-[#3D2820] mt-1">
              Admin accounts have full control over menu items, pricing, table reservations, and customer orders.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/15 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-500/15 text-red-900 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-700" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password (default: admin123)"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                New Password * (Min. 6 characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#160B0D] mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#C4B19F] rounded-xl focus:outline-none focus:border-[#260D16]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full py-3 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50"
            >
              {passwordSubmitting ? 'Updating...' : 'Save New Admin Password'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD NEW PRODUCT ACROSS ALL CATEGORIES                  */}
      {/* ============================================================ */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E8DDD2] max-w-xl w-full rounded-3xl border-2 border-[#C4B19F] p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#160B0D] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#260D16]" />
                  <span>Add New Product to Menu</span>
                </h3>
                <p className="text-xs text-[#8C5E43] mt-0.5">
                  Select any category (coffee, cakes, boulangerie, gelato, chocolates) to add items under it.
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1 rounded-full hover:bg-black/10 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spanish Cortado Caramel, Bronte Pistachio Gelato, French Butter Croissant"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Assign to Menu Category *</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold text-[#260D16]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 450.00"
                    value={newProduct.base_price}
                    onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 399.00"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Preset Buttons */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#160B0D]">Product Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none text-[11px]"
                />
                
                {/* 1-Click Preset Photo Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#8C5E43] font-bold">1-Click Sample Photo:</span>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80' })}
                    className="px-2 py-0.5 text-[10px] bg-white border border-[#C4B19F] rounded-lg hover:bg-[#260D16] hover:text-white"
                  >
                    ☕ Coffee
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' })}
                    className="px-2 py-0.5 text-[10px] bg-white border border-[#C4B19F] rounded-lg hover:bg-[#260D16] hover:text-white"
                  >
                    🎂 Cake
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' })}
                    className="px-2 py-0.5 text-[10px] bg-white border border-[#C4B19F] rounded-lg hover:bg-[#260D16] hover:text-white"
                  >
                    🥐 Croissant
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, image_url: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80' })}
                    className="px-2 py-0.5 text-[10px] bg-white border border-[#C4B19F] rounded-lg hover:bg-[#260D16] hover:text-white"
                  >
                    🍨 Gelato
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, image_url: 'https://images.unsplash.com/photo-1548741487-18d16a1a090c?auto=format&fit=crop&w=800&q=80' })}
                    className="px-2 py-0.5 text-[10px] bg-white border border-[#C4B19F] rounded-lg hover:bg-[#260D16] hover:text-white"
                  >
                    🍫 Chocolate
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Ingredients, craftsmanship notes, flavour nuances..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              {/* Flavours and Sizes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Flavours (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dark Chocolate, Hazelnut, Vanilla"
                    value={newProduct.flavours}
                    onChange={(e) => setNewProduct({ ...newProduct, flavours: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Weights / Sizes</label>
                  <input
                    type="text"
                    placeholder="e.g. Single Cup, 500ml Tub or 1.0 kg, 0.5 kg"
                    value={newProduct.weights}
                    onChange={(e) => setNewProduct({ ...newProduct, weights: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.in_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, in_stock: e.target.checked })}
                    className="rounded border-[#C4B19F] text-[#260D16] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-[#160B0D]">In Stock & Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.is_eggless_available}
                    onChange={(e) => setNewProduct({ ...newProduct, is_eggless_available: e.target.checked })}
                    className="rounded border-[#C4B19F] text-[#260D16] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-[#160B0D]">100% Eggless Option</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#C4B19F] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8C5E43] hover:text-[#160B0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  Add Product to Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT PRODUCT                                           */}
      {/* ============================================================ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E8DDD2] max-w-xl w-full rounded-3xl border-2 border-[#C4B19F] p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#160B0D] flex items-center gap-2">
                  <Edit className="w-5 h-5 text-[#260D16]" />
                  <span>Edit Product: {editingProduct.name}</span>
                </h3>
                <p className="text-xs text-[#8C5E43] mt-0.5">
                  Update price, category, photo URL, description, or stock status.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-black/10 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Assigned Category</label>
                <select
                  value={editProductForm.category_id}
                  onChange={(e) => setEditProductForm({ ...editProductForm, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold text-[#260D16]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProductForm.base_price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, base_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProductForm.discount_price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editProductForm.image_url}
                  onChange={(e) => setEditProductForm({ ...editProductForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Description</label>
                <textarea
                  rows="2"
                  required
                  value={editProductForm.description}
                  onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProductForm.in_stock}
                    onChange={(e) => setEditProductForm({ ...editProductForm, in_stock: e.target.checked })}
                    className="rounded border-[#C4B19F] text-[#260D16] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-[#160B0D]">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProductForm.is_eggless_available}
                    onChange={(e) => setEditProductForm({ ...editProductForm, is_eggless_available: e.target.checked })}
                    className="rounded border-[#C4B19F] text-[#260D16] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-[#160B0D]">100% Eggless Option</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#C4B19F] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-[#8C5E43] hover:text-[#160B0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD RESERVATION WITH SPECIFIC ITEMS LOG ENTRY          */}
      {/* ============================================================ */}
      {showAddReservationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E8DDD2] max-w-lg w-full rounded-3xl border-2 border-[#C4B19F] p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#160B0D] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#260D16]" />
                  <span>Log Reservation & Pre-Ordered Items</span>
                </h3>
                <p className="text-xs text-[#8C5E43] mt-0.5">
                  Record dining table reservation along with any specific items requested in advance.
                </p>
              </div>
              <button
                onClick={() => setShowAddReservationModal(false)}
                className="p-1 rounded-full hover:bg-black/10 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Deshmukh"
                  value={newReservation.guest_name}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newReservation.guest_phone}
                    onChange={(e) => setNewReservation({ ...newReservation, guest_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newReservation.guest_email}
                    onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Date</label>
                  <input
                    type="text"
                    value={newReservation.reservation_date}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="Today / Tomorrow"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newReservation.reservation_time}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="7:30 PM - 9:30 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Reserved Table & Booth</label>
                  <select
                    value={newReservation.table_number}
                    onChange={(e) => {
                      const num = e.target.value;
                      const names = {
                        'Table 01': 'Salon Window Alcove',
                        'Table 02': 'Parisian Velvet Booth',
                        'Table 03': 'Sunlit Conservatory Table',
                        'Table 04': 'The Imperial Grand Round',
                        'Table 05': 'Pâtisserie Courtyard Terrace',
                        'Table 07': 'Private Royal Celebration Suite'
                      };
                      setNewReservation({
                        ...newReservation,
                        table_number: num,
                        table_name: names[num] || 'Salon Table'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold"
                  >
                    <option value="Table 01">Table 01 (Window Alcove)</option>
                    <option value="Table 02">Table 02 (Velvet Booth)</option>
                    <option value="Table 03">Table 03 (Conservatory)</option>
                    <option value="Table 04">Table 04 (Grand Round VIP)</option>
                    <option value="Table 05">Table 05 (Courtyard Terrace)</option>
                    <option value="Table 07">Table 07 (Royal Suite)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Guests Count</label>
                  <select
                    value={newReservation.guests_count}
                    onChange={(e) => setNewReservation({ ...newReservation, guests_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold"
                  >
                    <option value="2 Guests">2 Guests</option>
                    <option value="4 Guests">4 Guests</option>
                    <option value="6-8 Guests VIP">6-8 Guests VIP</option>
                    <option value="8+ Private Dining">8+ Private Dining</option>
                  </select>
                </div>
              </div>

              {/* SPECIFIC PRE-ORDERED ITEMS LOG INPUT (As requested by user!) */}
              <div className="p-3 bg-amber-500/10 border border-amber-600/30 rounded-2xl space-y-1.5">
                <label className="block font-bold text-[#260D16] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Specific Pre-Ordered Items in this Log:</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. 1x Royal Belgian Truffle Gateau (1kg), 2x Spanish Cortado, 1x Pistachio Gelato Tub..."
                  value={newReservation.pre_ordered_items}
                  onChange={(e) => setNewReservation({ ...newReservation, pre_ordered_items: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none text-xs"
                />
                <span className="text-[10px] text-[#8C5E43] block">
                  Add any specific cake, beverage, pastry, or dishes reserved for this table.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Celebration Occasion / Special Requests</label>
                <textarea
                  rows="2"
                  placeholder="e.g. 25th Wedding anniversary dinner, requested champagne cake presentation..."
                  value={newReservation.special_requests}
                  onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReservationModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8C5E43] hover:text-[#160B0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  Confirm & Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
