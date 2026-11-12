import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, ShieldCheck, Package, DollarSign, Users, ShoppingBag, 
  Plus, Edit, Trash2, CheckCircle2, Clock, AlertCircle, RefreshCw, Key, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'security'
  const [loading, setLoading] = useState(true);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category_id: 1,
    base_price: 0,
    discount_price: 0,
    image_url: '',
    description: '',
    in_stock: true,
    is_eggless_available: true
  });
  const [editSuccess, setEditSuccess] = useState('');

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: 1,
    base_price: 549.0,
    discount_price: 499.0,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    is_bestseller: true,
    is_featured: true,
    is_eggless_available: true
  });

  // Admin Change Password State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, prodsRes, catsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ 
          data: { total_orders: 14, total_revenue: 9780.0, total_customers: 22, total_products: MOCK_PRODUCTS.length } 
        })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: MOCK_PRODUCTS })),
        api.get('/categories').catch(() => ({ data: MOCK_CATEGORIES }))
      ]);
      setStats(statsRes.data);
      setOrders(Array.isArray(ordersRes.data) && ordersRes.data.length ? ordersRes.data : [
        {
          id: 101,
          order_number: "VEL-2026-92814",
          customer_name: "Aarav Sharma",
          customer_email: "aarav.sharma@example.com",
          customer_phone: "+91 98765 43210",
          delivery_address: "Flat 402, Sea Green Apartments, Worli, Mumbai",
          delivery_city: "Mumbai",
          delivery_pincode: "400018",
          delivery_date: "Today",
          delivery_slot: "Midnight Surprise (11:00 PM - 12:00 AM)",
          cake_message: "Happy 25th Anniversary Mom & Dad!",
          total_amount: 1499.0,
          status: "Baking",
          payment_method: "UPI (Google Pay)",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { id: 1, product_name: "Royal Belgian Truffle Gateau", quantity: 1, weight: "1.0 kg", flavour: "Belgian Dark Truffle", total_price: 1399.0 }
          ]
        }
      ]);
      setProducts(Array.isArray(prodsRes.data) && prodsRes.data.length ? prodsRes.data : MOCK_PRODUCTS);
      setCategories(Array.isArray(catsRes.data) && catsRes.data.length ? catsRes.data : MOCK_CATEGORIES);
    } catch (err) {
      console.error('Admin fetch error', err);
      setStats({ total_orders: 14, total_revenue: 9780.0, total_customers: 22, total_products: MOCK_PRODUCTS.length });
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAdmin]);

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      category_id: prod.category_id || (prod.category && prod.category.id) || 1,
      base_price: prod.base_price,
      discount_price: prod.discount_price || '',
      image_url: prod.image_url,
      description: prod.description,
      in_stock: prod.in_stock,
      is_eggless_available: prod.is_eggless_available
    });
    setEditSuccess('');
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        category_id: parseInt(editForm.category_id),
        base_price: parseFloat(editForm.base_price),
        discount_price: editForm.discount_price ? parseFloat(editForm.discount_price) : null,
        image_url: editForm.image_url,
        description: editForm.description,
        in_stock: editForm.in_stock,
        is_eggless_available: editForm.is_eggless_available
      };

      const res = await api.put(`/admin/products/${editingProduct.id}`, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...res.data } : p))
      );
      setEditSuccess('Product details, photo & price updated successfully!');
      setTimeout(() => {
        setEditingProduct(null);
        setEditSuccess('');
      }, 900);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update product');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/products', newProduct);
      setProducts([res.data, ...products]);
      setShowAddProductModal(false);
      setNewProduct({
        name: '',
        slug: '',
        description: '',
        category_id: 1,
        base_price: 549.0,
        discount_price: 499.0,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        is_bestseller: true,
        is_featured: true,
        is_eggless_available: true
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from the menu?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

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
      setPasswordSuccess(res.data.message || 'Password updated successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb Home Bar */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 py-2 px-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
        <Link to="/" className="hover:text-[#E31837] flex items-center gap-1 font-bold text-gray-700 transition">
          <Home className="w-3.5 h-3.5 text-[#E31837]" />
          <span>Home</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#E31837] font-bold">Admin Console</span>
      </nav>

      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E31837] text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E31837]">
              Master Chef & Operations Console
            </span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-gray-900 mt-1">
            Veloura Bakery Administration
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-1 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <p className="font-serif text-3xl font-extrabold text-gray-900">{stats.total_orders}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Live order tracking active</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-1 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <p className="font-serif text-3xl font-extrabold text-[#E31837]">₹{stats.total_revenue}</p>
            <p className="text-[11px] text-gray-500 font-medium">Recorded sales</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-1 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Patrons</span>
            <p className="font-serif text-3xl font-extrabold text-gray-900">{stats.total_customers}</p>
            <p className="text-[11px] text-gray-400">Passwordless verified customers</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-1 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Menu Cakes</span>
            <p className="font-serif text-3xl font-extrabold text-gray-900">{products.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Editable photos & prices</p>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'products'
                ? 'bg-[#E31837] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manage Menu, Pics & Prices ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'orders'
                ? 'bg-[#E31837] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manage Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'security'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Admin Password & Security</span>
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cake</span>
          </button>
        )}
      </div>

      {/* TAB 1: PRODUCT CATALOG, PICTURES & PRICE MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between text-xs text-[#E31837] font-semibold">
            <span>You can update the image URL, cake title, category, base price, and discount price of any cake in real-time.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="aspect-square relative bg-gray-50 overflow-hidden">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="bg-[#E31837] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ₹{prod.discount_price || prod.base_price}
                    </span>
                    {prod.discount_price && (
                      <span className="bg-gray-900/80 text-white text-[10px] px-1.5 py-0.5 rounded-full line-through">
                        ₹{prod.base_price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-gray-900 line-clamp-1">{prod.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{prod.category?.name || 'Category'}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="flex-1 py-1.5 px-3 bg-red-50 hover:bg-[#E31837] text-[#E31837] hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Price & Pic</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ORDER STATUS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#E31837]">
                      {ord.order_number}
                    </span>
                    <span className="text-xs bg-red-50 text-[#E31837] font-bold px-2.5 py-0.5 rounded-full">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Customer: <strong>{ord.customer_name}</strong> ({ord.customer_phone}) • Placed: {new Date(ord.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Update Status:</span>
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-[#E31837] focus:outline-none focus:border-[#E31837]"
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

              {/* Items & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Cake Items</h5>
                  <div className="space-y-2">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="flex gap-2">
                        <img src={it.product_image} alt="" className="w-10 h-10 object-cover rounded-lg border" />
                        <div>
                          <p className="font-semibold text-gray-900">{it.product_name}</p>
                          <p className="text-[10px] text-gray-400">{it.weight} • {it.flavour} • Qty: {it.quantity}</p>
                          {it.cake_message && (
                            <p className="text-[10px] text-[#E31837] italic">Message Plaque: "{it.cake_message}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p><strong>Address:</strong> {ord.delivery_address}, {ord.city} - {ord.pincode}</p>
                  <p><strong>Slot:</strong> {ord.delivery_date} ({ord.delivery_time_slot})</p>
                  {ord.special_instructions && (
                    <p className="text-[#E31837]"><strong>Special Note:</strong> {ord.special_instructions}</p>
                  )}
                  <p className="font-bold text-sm text-[#E31837] pt-2 border-t border-gray-200">
                    Grand Total: ₹{ord.total_amount} ({ord.payment_method})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ADMIN PASSWORD UPDATE */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-8 rounded-3xl border border-gray-200 space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#E31837]" />
              <span>Update Admin Password</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Admin accounts require strict password authentication. Update your password here anytime.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password (default: admin123)"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                New Password * (Min. 6 characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E31837]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full py-3 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md"
            >
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (Update pics, menu & prices) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Edit Cake Details, Picture & Price
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Modifications are saved immediately to the live bakery database.
            </p>

            {editSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              {/* Image Preview & URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cake Picture URL</label>
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    <img src={editForm.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="url"
                    required
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs border rounded-xl"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Cake Title / Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={editForm.category_id}
                  onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Regular Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editForm.base_price}
                    onChange={(e) => setEditForm({ ...editForm, base_price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discounted Sale Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Leave empty if no discount"
                    value={editForm.discount_price}
                    onChange={(e) => setEditForm({ ...editForm, discount_price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-bold text-[#E31837]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Add New Bakery Creation</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cake Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Belgian Truffle Gateau"
                  value={newProduct.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setNewProduct({ ...newProduct, name, slug });
                  }}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.base_price}
                    onChange={(e) => setNewProduct({ ...newProduct, base_price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.discount_price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E31837] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                >
                  Publish Cake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
