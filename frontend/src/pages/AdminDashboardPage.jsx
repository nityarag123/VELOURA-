import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, LayoutDashboard, Package, Folder, ShoppingBag, Calendar, 
  Users, Shield, Key, LogOut, RefreshCw, Plus, Search, Edit, 
  Trash2, CheckCircle, Clock, AlertCircle, Phone, Mail, MapPin, 
  Eye, X, ChevronRight, Filter, Sparkles, ExternalLink, Menu, 
  Check, DollarSign, Tag, Layers, Utensils
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

  // Active Navigation Tab: 'dashboard', 'products', 'categories', 'orders', 'reservations', 'customers', 'security'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // -------------------------------------------------------------
  // PRODUCTS STATE & MODALS
  // -------------------------------------------------------------
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [productSortBy, setProductSortBy] = useState('newest');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    category_id: 1,
    base_price: 450.0,
    discount_price: '',
    stock_quantity: 50,
    tags: 'Artisanal, Chef Signature',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    description: '',
    flavours: 'Signature Truffle, Madagascar Vanilla',
    weights: '0.5 kg, 1.0 kg',
    in_stock: true,
    is_eggless_available: true,
    is_bestseller: false,
    is_featured: false
  });

  // -------------------------------------------------------------
  // CATEGORIES STATE & MODALS
  // -------------------------------------------------------------
  const [categorySearch, setCategorySearch] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    is_featured: true
  });

  // -------------------------------------------------------------
  // ORDERS STATE
  // -------------------------------------------------------------
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentStatusFilter, setOrderPaymentStatusFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  // -------------------------------------------------------------
  // RESERVATIONS STATE & DISH ATTACHMENT MODAL
  // -------------------------------------------------------------
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [managingReservationItems, setManagingReservationItems] = useState(null); // reservation object
  const [attachDishForm, setAttachDishForm] = useState({
    product_id: '',
    product_name: '',
    unit_price: 0,
    quantity: 1,
    notes: ''
  });

  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    reservation_date: 'Today',
    reservation_time: '7:30 PM - 9:30 PM',
    location: 'Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad',
    guests_count: '2 Guests',
    table_number: 'Table 01',
    table_name: 'Salon Window Alcove',
    special_requests: '',
    status: 'Confirmed'
  });

  // -------------------------------------------------------------
  // CUSTOMERS STATE & MODALS
  // -------------------------------------------------------------
  const [customerSearch, setCustomerSearch] = useState('');
  const [viewingCustomerDetail, setViewingCustomerDetail] = useState(null);
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  // -------------------------------------------------------------
  // SECURITY STATE
  // -------------------------------------------------------------
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Helper for Toast Notifications
  const triggerSuccess = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };
  const triggerError = (msg) => {
    setActionErrorMsg(msg);
    setTimeout(() => setActionErrorMsg(''), 5000);
  };

  // -------------------------------------------------------------
  // DATA FETCHING (Dynamic from Backend Database)
  // -------------------------------------------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodsRes, catsRes, ordersRes, resRes, custRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/products').catch(() => ({ data: MOCK_PRODUCTS })),
        api.get('/admin/categories').catch(() => api.get('/categories')).catch(() => ({ data: MOCK_CATEGORIES })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/admin/reservations').catch(() => ({ data: [] })),
        api.get('/admin/customers').catch(() => ({ data: [] }))
      ]);

      // Categories
      const loadedCats = Array.isArray(catsRes.data) && catsRes.data.length ? catsRes.data : MOCK_CATEGORIES;
      setCategories(loadedCats);

      // Products
      const loadedProds = Array.isArray(prodsRes.data) && prodsRes.data.length ? prodsRes.data : MOCK_PRODUCTS;
      setProducts(loadedProds);

      // Orders
      let loadedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      if (!loadedOrders.length) {
        try { loadedOrders = JSON.parse(localStorage.getItem('veloura_orders') || '[]'); } catch (e) {}
      }
      setOrders(loadedOrders);

      // Reservations
      let loadedRes = Array.isArray(resRes.data) ? resRes.data : [];
      if (!loadedRes.length) {
        try { loadedRes = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]'); } catch (e) {}
      }
      setReservations(loadedRes);

      // Customers
      let loadedCust = Array.isArray(custRes.data) ? custRes.data : [];
      setCustomers(loadedCust);

      // Stats
      if (statsRes.data) {
        setStats(statsRes.data);
      } else {
        const rev = loadedOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        setStats({
          total_orders: loadedOrders.length,
          total_revenue: rev,
          total_customers: loadedCust.length || 3,
          total_products: loadedProds.length,
          total_categories: loadedCats.length,
          total_reservations: loadedRes.length,
          recent_orders: loadedOrders.slice(0, 5),
          recent_reservations: loadedRes.slice(0, 5)
        });
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Gate Handler
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
  // PRODUCT HANDLERS
  // -------------------------------------------------------------
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const selectedCat = categories.find((c) => c.id === parseInt(newProduct.category_id)) || categories[0];
      const payload = {
        name: newProduct.name.trim(),
        slug: newProduct.slug.trim() || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newProduct.description.trim(),
        category_id: parseInt(newProduct.category_id),
        base_price: parseFloat(newProduct.base_price),
        discount_price: newProduct.discount_price ? parseFloat(newProduct.discount_price) : null,
        stock_quantity: parseInt(newProduct.stock_quantity || 50),
        tags: newProduct.tags.trim(),
        image_url: newProduct.image_url.trim(),
        gallery: [newProduct.image_url.trim()],
        flavours: newProduct.flavours.split(',').map(s => s.trim()).filter(Boolean),
        weights: newProduct.weights.split(',').map(s => s.trim()).filter(Boolean),
        in_stock: Boolean(newProduct.in_stock),
        is_eggless_available: Boolean(newProduct.is_eggless_available),
        is_bestseller: Boolean(newProduct.is_bestseller),
        is_featured: Boolean(newProduct.is_featured)
      };

      const res = await api.post('/admin/products', payload);
      const created = res.data;
      created.category = { id: selectedCat.id, name: selectedCat.name, slug: selectedCat.slug };
      setProducts(prev => [created, ...prev]);
      setShowAddProductModal(false);
      triggerSuccess(`Product "${created.name}" created under ${selectedCat?.name}!`);

      // Reset Form
      setNewProduct({
        name: '',
        slug: '',
        category_id: categories[0]?.id || 1,
        base_price: 450.0,
        discount_price: '',
        stock_quantity: 50,
        tags: 'Artisanal, Chef Signature',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        description: '',
        flavours: 'Signature Truffle, Madagascar Vanilla',
        weights: '0.5 kg, 1.0 kg',
        in_stock: true,
        is_eggless_available: true,
        is_bestseller: false,
        is_featured: false
      });
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const selectedCat = categories.find((c) => c.id === parseInt(editingProduct.category_id)) || categories[0];
      const payload = {
        name: editingProduct.name.trim(),
        slug: editingProduct.slug.trim(),
        description: editingProduct.description.trim(),
        category_id: parseInt(editingProduct.category_id),
        base_price: parseFloat(editingProduct.base_price),
        discount_price: editingProduct.discount_price ? parseFloat(editingProduct.discount_price) : null,
        stock_quantity: parseInt(editingProduct.stock_quantity || 0),
        tags: editingProduct.tags || '',
        image_url: editingProduct.image_url.trim(),
        in_stock: Boolean(editingProduct.in_stock),
        is_eggless_available: Boolean(editingProduct.is_eggless_available),
        is_bestseller: Boolean(editingProduct.is_bestseller),
        is_featured: Boolean(editingProduct.is_featured)
      };

      const res = await api.put(`/admin/products/${editingProduct.id}`, payload);
      const updated = res.data;
      updated.category = { id: selectedCat.id, name: selectedCat.name, slug: selectedCat.slug };

      setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      setEditingProduct(null);
      triggerSuccess(`Product "${updated.name}" updated successfully!`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await api.delete(`/admin/products/${deletingProduct.id}`);
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      triggerSuccess(`Product "${deletingProduct.name}" removed successfully.`);
      setDeletingProduct(null);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  // -------------------------------------------------------------
  // CATEGORY HANDLERS
  // -------------------------------------------------------------
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim() || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: newCategory.description.trim(),
        image_url: newCategory.image_url.trim(),
        is_featured: Boolean(newCategory.is_featured)
      };

      const res = await api.post('/admin/categories', payload);
      const created = res.data;
      setCategories(prev => [...prev, created]);
      setShowAddCategoryModal(false);
      triggerSuccess(`Category "${created.name}" created successfully!`);
      setNewCategory({
        name: '',
        slug: '',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        is_featured: true
      });
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const payload = {
        name: editingCategory.name.trim(),
        slug: editingCategory.slug.trim(),
        description: editingCategory.description.trim(),
        image_url: editingCategory.image_url.trim(),
        is_featured: Boolean(editingCategory.is_featured)
      };

      const res = await api.put(`/admin/categories/${editingCategory.id}`, payload);
      const updated = res.data;
      setCategories(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
      setEditingCategory(null);
      triggerSuccess(`Category "${updated.name}" updated successfully!`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.delete(`/admin/categories/${catId}`);
      setCategories(prev => prev.filter(c => c.id !== catId));
      triggerSuccess(`Category "${catName}" deleted successfully.`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  // -------------------------------------------------------------
  // ORDER HANDLERS & PAYMENT STATUS MANAGEMENT
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
      }
      triggerSuccess(`Order status updated to "${newStatus}"`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update order status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdatingPaymentId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/payment-status`, { status: newPaymentStatus });
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updatedPayment = o.payment ? {
            ...o.payment,
            status: newPaymentStatus,
            paid_at: newPaymentStatus === 'Paid' ? new Date().toISOString() : o.payment.paid_at
          } : { status: newPaymentStatus, paid_at: newPaymentStatus === 'Paid' ? new Date().toISOString() : null };
          return {
            ...o,
            payment_status: newPaymentStatus,
            payment: updatedPayment
          };
        }
        return o;
      }));
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(prev => ({
          ...prev,
          payment_status: newPaymentStatus,
          payment: prev.payment ? {
            ...prev.payment,
            status: newPaymentStatus,
            paid_at: newPaymentStatus === 'Paid' ? new Date().toISOString() : prev.payment.paid_at
          } : { status: newPaymentStatus, paid_at: newPaymentStatus === 'Paid' ? new Date().toISOString() : null }
        }));
      }
      triggerSuccess(`Payment status marked as "${newPaymentStatus}"!`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // -------------------------------------------------------------
  // RESERVATION HANDLERS & MENU ITEM ATTACHMENT
  // -------------------------------------------------------------
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/reservations', newReservation);
      const created = res.data;
      created.items = [];
      setReservations(prev => [created, ...prev]);
      setShowAddReservationModal(false);
      triggerSuccess(`Table reservation for "${created.guest_name}" created!`);
      setNewReservation({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        reservation_date: 'Today',
        reservation_time: '7:30 PM - 9:30 PM',
        location: 'Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad',
        guests_count: '2 Guests',
        table_number: 'Table 01',
        table_name: 'Salon Window Alcove',
        special_requests: '',
        status: 'Confirmed'
      });
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to create reservation');
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await api.put(`/admin/reservations/${resId}/status`, { status: newStatus });
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: newStatus } : r));
      triggerSuccess(`Reservation status updated to "${newStatus}"`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update reservation status');
    }
  };

  const handleDeleteReservation = async (resId, guestName) => {
    if (!window.confirm(`Delete reservation for "${guestName}"?`)) return;
    try {
      await api.delete(`/admin/reservations/${resId}`);
      setReservations(prev => prev.filter(r => r.id !== resId));
      triggerSuccess(`Reservation for "${guestName}" deleted.`);
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to delete reservation');
    }
  };

  // ATTACH DISH TO RESERVATION
  const handleAttachDishToReservation = async (e) => {
    e.preventDefault();
    if (!managingReservationItems || !attachDishForm.product_name) {
      triggerError('Please select or specify a menu item');
      return;
    }
    try {
      const res = await api.post(`/admin/reservations/${managingReservationItems.id}/items`, {
        product_id: attachDishForm.product_id ? parseInt(attachDishForm.product_id) : null,
        product_name: attachDishForm.product_name,
        unit_price: parseFloat(attachDishForm.unit_price || 0),
        quantity: parseInt(attachDishForm.quantity || 1),
        notes: attachDishForm.notes
      });
      const newItem = res.data;

      // Update in active managing object
      const updatedItems = [...(managingReservationItems.items || []), newItem];
      const updatedRes = { ...managingReservationItems, items: updatedItems };
      setManagingReservationItems(updatedRes);

      // Update in global reservations list
      setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));

      triggerSuccess(`Attached "${newItem.product_name}" to table reservation!`);
      setAttachDishForm({ product_id: '', product_name: '', unit_price: 0, quantity: 1, notes: '' });
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to attach item');
    }
  };

  // REMOVE DISH FROM RESERVATION
  const handleRemoveDishFromReservation = async (itemId) => {
    if (!managingReservationItems) return;
    try {
      await api.delete(`/admin/reservations/${managingReservationItems.id}/items/${itemId}`);
      const updatedItems = (managingReservationItems.items || []).filter(it => it.id !== itemId);
      const updatedRes = { ...managingReservationItems, items: updatedItems };
      setManagingReservationItems(updatedRes);
      setReservations(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
      triggerSuccess('Menu item removed from reservation.');
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to remove item');
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER DETAIL HANDLER
  // -------------------------------------------------------------
  const handleViewCustomerDetail = async (custId) => {
    setCustomerDetailLoading(true);
    try {
      const res = await api.get(`/admin/customers/${custId}`);
      setViewingCustomerDetail(res.data);
    } catch (err) {
      triggerError('Failed to fetch customer profile history');
    } finally {
      setCustomerDetailLoading(false);
    }
  };

  // -------------------------------------------------------------
  // SECURITY HANDLER
  // -------------------------------------------------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      triggerError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      triggerError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const res = await api.put('/admin/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      triggerSuccess(res.data?.message || 'Admin password updated successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      triggerError(err.response?.data?.detail || 'Failed to update admin password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // FILTERING & SORTING LOGIC
  // -------------------------------------------------------------
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const pCatId = p.category_id || p.category?.id;
    const pCatName = p.category_name || p.category?.name || '';
    const pCatSlug = p.category_slug || p.category?.slug || '';

    const matchesSearch = !q || 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      pCatName.toLowerCase().includes(q) ||
      (p.tags && p.tags.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedCategoryFilter !== 'all') {
      const catId = parseInt(selectedCategoryFilter);
      if (!isNaN(catId)) {
        if (pCatId !== catId) return false;
      } else {
        if (!pCatSlug.includes(selectedCategoryFilter) && !pCatName.toLowerCase().includes(selectedCategoryFilter)) return false;
      }
    }

    if (productStockFilter === 'in_stock' && !p.in_stock) return false;
    if (productStockFilter === 'out_of_stock' && p.in_stock) return false;

    return true;
  }).sort((a, b) => {
    if (productSortBy === 'price_asc') return a.base_price - b.base_price;
    if (productSortBy === 'price_desc') return b.base_price - a.base_price;
    if (productSortBy === 'name') return a.name.localeCompare(b.name);
    if (productSortBy === 'stock') return (b.stock_quantity || 0) - (a.stock_quantity || 0);
    return (b.id || 0) - (a.id || 0); // newest default
  });

  const filteredCategories = categories.filter((c) => {
    const q = categorySearch.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || (o.status && o.status.toLowerCase() === orderStatusFilter.toLowerCase());
    const matchesPaymentStatus = orderPaymentStatusFilter === 'all' || (o.payment_status && o.payment_status.toLowerCase() === orderPaymentStatusFilter.toLowerCase());
    const q = orderSearch.toLowerCase().trim();
    const txnId = (o.transaction_id || o.payment?.transaction_id || '').toLowerCase();
    const matchesSearch = !q ||
      (o.order_number && o.order_number.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
      (o.customer_phone && o.customer_phone.includes(q)) ||
      txnId.includes(q);
    return matchesStatus && matchesPaymentStatus && matchesSearch;
  });

  const filteredReservations = reservations.filter((r) => {
    const matchesStatus = reservationStatusFilter === 'all' || (r.status && r.status.toLowerCase() === reservationStatusFilter.toLowerCase());
    const q = reservationSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.token && r.token.toLowerCase().includes(q)) ||
      (r.guest_name && r.guest_name.toLowerCase().includes(q)) ||
      (r.guest_phone && r.guest_phone.includes(q)) ||
      (r.table_number && r.table_number.toLowerCase().includes(q)) ||
      (r.pre_ordered_items && r.pre_ordered_items.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase().trim();
    return !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q));
  });

  // ============================================================
  // RENDER: ADMIN GATE (IF NOT AUTHENTICATED)
  // ============================================================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#1A1412] text-[#FAF6EE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#241C1A] border border-[#D8B879]/30 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D8B879] text-[#1A1412] flex items-center justify-center font-bold text-3xl shadow-lg">
              👑
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#D8B879] tracking-wide">
              VELOURA Admin Console
            </h1>
            <p className="text-xs text-[#FAF6EE]/70 uppercase tracking-widest font-semibold">
              Authorized Pâtisserie Executive Portal
            </p>
          </div>

          {gateError && (
            <div className="p-3.5 bg-red-900/40 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1412] border border-[#D8B879]/30 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                placeholder="admin@veloura.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1412] border border-[#D8B879]/30 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {gateLoading ? 'Authenticating...' : 'Unlock Admin Operations'}
            </button>
          </form>

          {/* 1-Click Instant Master Admin Access */}
          <div className="pt-2 border-t border-[#D8B879]/20">
            <button
              type="button"
              onClick={handleInstantGateUnlock}
              disabled={gateLoading}
              className="w-full py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-[#D8B879] border border-[#D8B879]/40 shadow-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <Shield className="w-4 h-4 text-[#D8B879]" />
              <span>⚡ 1-Click Master Admin Instant Unlock</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-[#D8B879]/80 hover:text-[#D8B879] transition underline"
            >
              ← Return to Veloura Boutique Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // NAVIGATION ITEMS LIST (Matching User Mock media_1794680338813.png)
  // ============================================================
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', sub: 'Business overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', sub: 'Manage all items', icon: Package },
    { id: 'categories', label: 'Categories', sub: 'Create and organise', icon: Folder },
    { id: 'orders', label: 'Orders', sub: 'Track customer orders', icon: ShoppingBag },
    { id: 'reservations', label: 'Reservations', sub: 'Manage bookings and items', icon: Calendar },
    { id: 'customers', label: 'Customers', sub: 'Customer information', icon: Users },
    { id: 'security', label: 'Security', sub: 'Admin credentials', icon: Key },
  ];

  // ============================================================
  // RENDER: MAIN AUTHENTICATED DASHBOARD WITH SIDEBAR
  // ============================================================
  return (
    <div className="min-h-screen bg-[#161210] text-[#FAF6EE] flex flex-col lg:flex-row antialiased">
      
      {/* --------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* --------------------------------------------------------- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#201815] border-r border-[#D8B879]/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D8B879]/20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8B879] text-[#1A1412] flex items-center justify-center font-bold text-xl shadow-md">
              👑
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-widest text-[#D8B879] block">
                VELOURA
              </span>
              <span className="text-[10px] text-[#FAF6EE]/60 uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#D8B879] text-[#1A1412] font-bold shadow-lg shadow-[#D8B879]/10'
                    : 'text-[#FAF6EE]/80 hover:bg-[#2A201C] hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-[#1A1412]' : 'text-[#D8B879] group-hover:scale-110'}`} />
                <div className="flex-1 truncate">
                  <div className="text-xs uppercase tracking-wider leading-none">
                    {item.label}
                  </div>
                  <div className={`text-[10px] mt-1 truncate ${isActive ? 'text-[#1A1412]/80' : 'text-[#FAF6EE]/50'}`}>
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout Footer */}
        <div className="p-4 border-t border-[#D8B879]/20 bg-[#1A1412]/60 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#D8B879]/20 border border-[#D8B879] flex items-center justify-center text-xs text-[#D8B879] font-bold">
              👨‍🍳
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.full_name || 'VELOURA Master Chef'}
              </p>
              <p className="text-[10px] text-[#FAF6EE]/50 truncate">
                {user?.email || 'admin@veloura.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-white/10"
              title="Visit Customer Boutique"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D8B879]" />
              <span>Store</span>
            </Link>
            <button
              onClick={logout}
              className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-red-800/40"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* --------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA */}
      {/* --------------------------------------------------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#201815]/95 backdrop-blur-md border-b border-[#D8B879]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-[#2A201C] text-[#D8B879] hover:bg-[#342823] transition lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold tracking-wide text-[#D8B879]">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live DB
                </span>
              </div>
              <p className="text-xs text-[#FAF6EE]/60">
                {navItems.find(n => n.id === activeTab)?.sub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#2A201C] hover:bg-[#342823] text-xs font-semibold text-[#FAF6EE] border border-[#D8B879]/30 flex items-center gap-2 transition"
              title="Sync live records from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D8B879] ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            <Link
              to="/"
              className="px-3.5 py-1.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-xs font-bold text-[#1A1412] uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Boutique</span>
            </Link>
          </div>
        </header>

        {/* Global Toast Alerts */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg('')} className="p-1 hover:bg-emerald-900 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{actionErrorMsg}</span>
            </div>
            <button onClick={() => setActionErrorMsg('')} className="p-1 hover:bg-red-900 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active Tab Content */}
        <div className="flex-1 p-6 space-y-6">

          {/* ======================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-[#D8B879] mt-2">
                    ₹{stats?.total_revenue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">Verified Orders</div>
                </div>

                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-white mt-2">
                    {stats?.total_orders || orders.length}
                  </div>
                  <div className="text-[10px] text-[#FAF6EE]/50 mt-1">All Placed Orders</div>
                </div>

                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Catalog Items</span>
                    <Package className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-white mt-2">
                    {stats?.total_products || products.length}
                  </div>
                  <div className="text-[10px] text-[#FAF6EE]/50 mt-1">Across All Categories</div>
                </div>

                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Categories</span>
                    <Folder className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-white mt-2">
                    {stats?.total_categories || categories.length}
                  </div>
                  <div className="text-[10px] text-[#FAF6EE]/50 mt-1">Active Menus</div>
                </div>

                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Table Bookings</span>
                    <Calendar className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-white mt-2">
                    {stats?.total_reservations || reservations.length}
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1">Salon Bookings</div>
                </div>

                <div className="bg-[#201815] border border-[#D8B879]/20 p-4 rounded-2xl shadow-md">
                  <div className="flex items-center justify-between text-[#D8B879]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6EE]/60">Registered Patrons</span>
                    <Users className="w-4 h-4 text-[#D8B879]" />
                  </div>
                  <div className="text-xl font-bold font-serif text-white mt-2">
                    {stats?.total_customers || customers.length}
                  </div>
                  <div className="text-[10px] text-[#FAF6EE]/50 mt-1">Active Patrons</div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => { setActiveTab('products'); setShowAddProductModal(true); }}
                  className="p-4 rounded-2xl bg-[#2A201C] hover:bg-[#342823] border border-[#D8B879]/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">+ Add New Product</div>
                    <div className="text-[11px] text-[#FAF6EE]/60 mt-0.5">Add item to any category</div>
                  </div>
                  <Plus className="w-5 h-5 text-[#D8B879] group-hover:scale-125 transition-transform" />
                </button>

                <button
                  onClick={() => { setActiveTab('categories'); setShowAddCategoryModal(true); }}
                  className="p-4 rounded-2xl bg-[#2A201C] hover:bg-[#342823] border border-[#D8B879]/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">+ Create Category</div>
                    <div className="text-[11px] text-[#FAF6EE]/60 mt-0.5">Organize new section</div>
                  </div>
                  <Plus className="w-5 h-5 text-[#D8B879] group-hover:scale-125 transition-transform" />
                </button>

                <button
                  onClick={() => { setActiveTab('reservations'); setShowAddReservationModal(true); }}
                  className="p-4 rounded-2xl bg-[#2A201C] hover:bg-[#342823] border border-[#D8B879]/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">+ Log Reservation</div>
                    <div className="text-[11px] text-[#FAF6EE]/60 mt-0.5">Book salon table & dishes</div>
                  </div>
                  <Calendar className="w-5 h-5 text-[#D8B879] group-hover:scale-125 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-2xl bg-[#2A201C] hover:bg-[#342823] border border-[#D8B879]/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">Manage Orders</div>
                    <div className="text-[11px] text-[#FAF6EE]/60 mt-0.5">Track & update deliveries</div>
                  </div>
                  <ShoppingBag className="w-5 h-5 text-[#D8B879] group-hover:scale-125 transition-transform" />
                </button>
              </div>

              {/* Two Column Layout: Recent Orders & Recent Reservations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Preview */}
                <div className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#D8B879]" />
                      <h3 className="font-serif font-bold text-sm text-[#D8B879]">Recent Customer Orders</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#D8B879] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="p-3 bg-[#1A1412] rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{order.order_number}</div>
                          <div className="text-[11px] text-[#FAF6EE]/60">{order.customer_name} • ₹{order.total_amount}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'Preparing / Baking' || order.status === 'Baking' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                    {!orders.length && (
                      <div className="text-center py-6 text-xs text-[#FAF6EE]/50">No customer orders recorded yet.</div>
                    )}
                  </div>
                </div>

                {/* Recent Reservations Preview */}
                <div className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D8B879]" />
                      <h3 className="font-serif font-bold text-sm text-[#D8B879]">Recent Salon Reservations</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('reservations')}
                      className="text-xs font-semibold text-[#D8B879] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reservations.slice(0, 5).map((res) => (
                      <div
                        key={res.id}
                        className="p-3 bg-[#1A1412] rounded-xl border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{res.guest_name} ({res.token})</div>
                          <div className="text-[11px] text-[#FAF6EE]/60">
                            {res.table_number || 'Table 01'} • {res.reservation_date} • {res.reservation_time}
                          </div>
                          {res.pre_ordered_items && (
                            <div className="text-[10px] text-[#D8B879] mt-0.5 truncate max-w-xs">
                              🍴 {res.pre_ordered_items}
                            </div>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          res.status === 'Seated' ? 'bg-purple-500/20 text-purple-300' :
                          res.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                    {!reservations.length && (
                      <div className="text-center py-6 text-xs text-[#FAF6EE]/50">No table reservations logged yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: COMPLETE PRODUCTS MANAGEMENT (ALL CATEGORIES) */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Header & Filters */}
              <div className="bg-[#201815] border border-[#D8B879]/20 p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#D8B879]">
                      Menu & Catalog Items ({filteredProducts.length})
                    </h3>
                    <p className="text-xs text-[#FAF6EE]/60">
                      Manage pricing, stock, images, and options across all bakery categories
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#D8B879] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, ingredients, tags..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  {/* Stock Filter */}
                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="in_stock">In Stock Only</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={productSortBy}
                    onChange={(e) => setProductSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="newest">Sort: Newest Added</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="price_asc">Sort: Price (Low to High)</option>
                    <option value="price_desc">Sort: Price (High to Low)</option>
                    <option value="stock">Sort: Stock Quantity</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1412] border-b border-[#D8B879]/20 text-[#D8B879] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Tags</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map((p) => {
                        const cat = categories.find(c => c.id === (p.category_id || p.category?.id));
                        return (
                          <tr key={p.id} className="hover:bg-[#2A201C]/60 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80'; }}
                                />
                                <div className="max-w-xs truncate">
                                  <div className="font-bold text-white truncate">{p.name}</div>
                                  <div className="text-[10px] text-[#FAF6EE]/50 truncate">{p.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-full bg-[#1A1412] border border-[#D8B879]/30 text-[10px] text-[#D8B879] font-medium whitespace-nowrap">
                                {cat?.name || p.category_name || p.category?.name || 'Specialty'}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-white">₹{p.base_price}</div>
                              {p.discount_price && (
                                <div className="text-[10px] text-emerald-400">Offer: ₹{p.discount_price}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-semibold text-[#FAF6EE]/90">
                                {p.stock_quantity ?? 50} units
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.in_stock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {p.in_stock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[10px] text-[#FAF6EE]/70 max-w-[120px] truncate">
                                {p.tags || (p.is_bestseller ? 'Bestseller' : 'Standard')}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5 text-[#D8B879]" />
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(p)}
                                  className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {!filteredProducts.length && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-xs text-[#FAF6EE]/50">
                            No products match your current search/filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CATEGORIES MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="bg-[#201815] border border-[#D8B879]/20 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#D8B879]">
                    Categories & Menus ({categories.length})
                  </h3>
                  <p className="text-xs text-[#FAF6EE]/60">
                    Create, edit, and organize culinary departments dynamically stored in the database
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#D8B879] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((cat) => {
                  const attachedCount = products.filter(p => (p.category_id || p.category?.id) === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-[#D8B879]/40 transition"
                    >
                      <div>
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#201815] via-transparent to-transparent" />
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#1A1412]/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-[#D8B879]">
                            {attachedCount} Products
                          </span>
                        </div>

                        <div className="p-4 space-y-1.5">
                          <h4 className="font-serif font-bold text-sm text-white group-hover:text-[#D8B879] transition">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-[#FAF6EE]/60 line-clamp-2">
                            {cat.description || 'Exclusive Veloura culinary collection.'}
                          </p>
                          <div className="text-[10px] text-[#D8B879]/80 font-mono pt-1">
                            Slug: {cat.slug}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setActiveTab('products');
                          }}
                          className="text-[11px] font-semibold text-[#D8B879] hover:underline"
                        >
                          View Products →
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D8B879]" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ORDERS & PAYMENT MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-[#201815] border border-[#D8B879]/20 p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#D8B879]">
                      Customer Orders & Payments ({filteredOrders.length})
                    </h3>
                    <p className="text-xs text-[#FAF6EE]/60">
                      Track live bakery orders, verify online transactions, and record Cash on Delivery collections
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#D8B879] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order #, customer, phone, or transaction ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="all">All Order Statuses</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing / Baking">Preparing / Baking</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={orderPaymentStatusFilter}
                    onChange={(e) => setOrderPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1412] border-b border-[#D8B879]/20 text-[#D8B879] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Order # & Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Delivery Info</th>
                        <th className="py-3 px-4">Items Summary</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment Details</th>
                        <th className="py-3 px-4">Order Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((order) => {
                        const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                        const isPending = (order.payment_status || '').toLowerCase() === 'pending' || !order.payment_status;
                        const isFailed = (order.payment_status || '').toLowerCase() === 'failed';
                        const txnId = order.transaction_id || order.payment?.transaction_id || 'N/A';

                        return (
                          <tr key={order.id} className="hover:bg-[#2A201C]/60 transition">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-white">{order.order_number}</div>
                              <div className="text-[10px] text-[#FAF6EE]/50 font-mono">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{order.customer_name}</div>
                              <div className="text-[10px] text-[#FAF6EE]/60">{order.customer_phone}</div>
                              <div className="text-[10px] text-[#FAF6EE]/50">{order.customer_email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px] text-white truncate max-w-xs">{order.delivery_address}, {order.city} - {order.pincode}</div>
                              <div className="text-[10px] text-[#D8B879]">{order.delivery_date} • {order.delivery_time_slot}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px] text-[#FAF6EE]/90">
                                {order.items?.map((it, idx) => (
                                  <span key={idx} className="block truncate max-w-[200px]">
                                    • {it.product_name} x{it.quantity}
                                  </span>
                                ))}
                                {!order.items?.length && (
                                  <span className="text-[10px] text-[#FAF6EE]/50">Specialty treat</span>
                                )}
                              </div>
                              {order.cake_message && (
                                <div className="text-[10px] text-amber-300 italic mt-0.5">
                                  Msg: "{order.cake_message}"
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-[#D8B879] text-sm">₹{order.total_amount}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-[#FAF6EE]/80 font-medium">
                                    {order.payment_method || 'Online Demo'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isPaid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    isFailed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}>
                                    {order.payment_status || (order.payment_method === 'Cash on Delivery' ? 'Pending' : 'Paid')}
                                  </span>
                                </div>
                                
                                <div className="text-[10px] text-gray-400 font-mono">
                                  Ref: {txnId}
                                </div>

                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentStatus(order.id, 'Paid')}
                                    disabled={updatingPaymentId === order.id}
                                    className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
                                    title="Mark order as paid after collecting cash or payment"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{updatingPaymentId === order.id ? 'Saving...' : 'Mark Paid (Cash Collected)'}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none border ${
                                  order.status === 'Delivered' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' :
                                  order.status === 'Cancelled' ? 'bg-red-950/80 text-red-300 border-red-500/50' :
                                  'bg-[#1A1412] text-[#D8B879] border-[#D8B879]/40'
                                }`}
                              >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Preparing / Baking">Preparing / Baking</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#D8B879] hover:text-[#1A1412] text-white text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {!filteredOrders.length && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-xs text-[#FAF6EE]/50">
                            No orders match your search or filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: TABLE RESERVATION MANAGEMENT & DISH ATTACHMENT */}
          {/* ======================================================== */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <div className="bg-[#201815] border border-[#D8B879]/20 p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#D8B879]">
                      Dining Salon Reservations ({filteredReservations.length})
                    </h3>
                    <p className="text-xs text-[#FAF6EE]/60">
                      Manage bookings, tables, and attach specific menu items/dishes to individual reservations
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddReservationModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log New Reservation</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#D8B879] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search guest name, token, phone, table..."
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  <select
                    value={reservationStatusFilter}
                    onChange={(e) => setReservationStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-[#FAF6EE] focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="all">All Reservation Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Seated">Seated</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Reservations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredReservations.map((res) => {
                  const itemCount = res.items?.length || 0;
                  return (
                    <div
                      key={res.id}
                      className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl p-5 shadow-md space-y-4 hover:border-[#D8B879]/40 transition"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#D8B879]">
                              {res.token || `VL-${res.id}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#1A1412] text-[10px] text-[#FAF6EE]/80 border border-white/10">
                              {res.guests_count || '2 Guests'}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-base text-white mt-1">
                            {res.guest_name}
                          </h4>
                          <div className="text-[11px] text-[#FAF6EE]/60 flex items-center gap-2 mt-0.5">
                            <Phone className="w-3 h-3 text-[#D8B879]" />
                            <span>{res.guest_phone}</span>
                            {res.guest_email && (
                              <>
                                <span>•</span>
                                <span className="truncate">{res.guest_email}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <select
                          value={res.status}
                          onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#1A1412] border border-[#D8B879]/30 text-xs font-bold text-[#D8B879] focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Seated">Seated</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#1A1412] border border-white/5">
                          <span className="text-[10px] font-bold text-[#D8B879] uppercase block">Date & Time</span>
                          <span className="font-semibold text-white">{res.reservation_date}</span>
                          <span className="text-[11px] text-[#FAF6EE]/60 block">{res.reservation_time}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#1A1412] border border-white/5">
                          <span className="text-[10px] font-bold text-[#D8B879] uppercase block">Table & Salon</span>
                          <span className="font-semibold text-white">{res.table_number || 'Table 01'}</span>
                          <span className="text-[11px] text-[#FAF6EE]/60 block truncate">{res.table_name || 'Parisian Booth'}</span>
                        </div>
                      </div>

                      {/* ATTACHED DISHES / MENU ITEMS BOX */}
                      <div className="p-3 bg-[#1A1412] rounded-xl border border-[#D8B879]/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#D8B879]">
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Attached Dishes / Pre-orders ({itemCount})</span>
                          </div>
                          <button
                            onClick={() => {
                              setManagingReservationItems(res);
                              setAttachDishForm({ product_id: '', product_name: '', unit_price: 0, quantity: 1, notes: '' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#D8B879]/20 hover:bg-[#D8B879]/30 text-[#D8B879] text-[11px] font-bold transition flex items-center gap-1 border border-[#D8B879]/30"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Manage Dishes</span>
                          </button>
                        </div>

                        {itemCount > 0 ? (
                          <div className="space-y-1">
                            {res.items.map((it) => (
                              <div key={it.id} className="text-xs text-[#FAF6EE]/90 flex items-center justify-between">
                                <span className="truncate">• {it.product_name} <strong className="text-[#D8B879]">(x{it.quantity})</strong></span>
                                <span className="text-[11px] text-[#FAF6EE]/60">₹{it.total_price}</span>
                              </div>
                            ))}
                          </div>
                        ) : res.pre_ordered_items ? (
                          <div className="text-xs text-[#FAF6EE]/80 italic">
                            🍴 {res.pre_ordered_items}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#FAF6EE]/40 italic">
                            No dishes attached yet. Click "Manage Dishes" to add items from catalog.
                          </div>
                        )}
                      </div>

                      {res.special_requests && (
                        <div className="text-xs text-amber-200/80 bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30">
                          <strong>Note:</strong> {res.special_requests}
                        </div>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => handleDeleteReservation(res.id, res.guest_name)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Booking</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!filteredReservations.length && (
                  <div className="col-span-full py-12 text-center text-xs text-[#FAF6EE]/50 bg-[#201815] rounded-2xl border border-white/5">
                    No table reservations found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: CUSTOMERS DIRECTORY */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-[#201815] border border-[#D8B879]/20 p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#D8B879]">
                    Patron Directory ({filteredCustomers.length})
                  </h3>
                  <p className="text-xs text-[#FAF6EE]/60">
                    Review registered customer profiles, ordering frequency, and total lifetime spend
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#D8B879] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, email, city..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879] w-64"
                  />
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-[#201815] border border-[#D8B879]/20 rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1A1412] border-b border-[#D8B879]/20 text-[#D8B879] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Patron</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Total Orders</th>
                        <th className="py-3 px-4">Total Spent</th>
                        <th className="py-3 px-4 text-right">Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-[#2A201C]/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#D8B879]/20 text-[#D8B879] font-bold flex items-center justify-center shrink-0">
                                {cust.full_name?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <div className="font-bold text-white">{cust.full_name}</div>
                                <div className="text-[10px] text-[#FAF6EE]/50">ID: #{cust.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{cust.email}</div>
                            <div className="text-[10px] text-[#FAF6EE]/60">{cust.phone || 'No phone provided'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{cust.city || 'Hyderabad'}</div>
                            <div className="text-[10px] text-[#FAF6EE]/50 truncate max-w-[150px]">{cust.address || 'Boutique Pickup'}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-white">{cust.total_orders || 0} orders</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#D8B879]">₹{cust.total_spent || '0.00'}</span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleViewCustomerDetail(cust.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#D8B879]/20 hover:bg-[#D8B879]/30 text-[#D8B879] text-xs font-bold transition flex items-center gap-1 ml-auto border border-[#D8B879]/30"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>History</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredCustomers.length && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-xs text-[#FAF6EE]/50">
                            No patrons match your search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: SECURITY & PASSWORD SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-[#201815] border border-[#D8B879]/20 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D8B879]/20 text-[#D8B879] flex items-center justify-center font-bold">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#D8B879]">Admin Security Credentials</h3>
                    <p className="text-xs text-[#FAF6EE]/60">Change master admin password for session security</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                      Current Admin Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                      New Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      required
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      required
                      placeholder="Repeat new password"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="w-full py-3 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                  >
                    {passwordSubmitting ? 'Updating...' : 'Update Admin Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: ADD NEW PRODUCT MODAL */}
      {/* ============================================================ */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#D8B879]">
                <Package className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">Add New Product</h3>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pistachio Raspberry Macaron Box"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Category *</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450.00"
                    value={newProduct.base_price}
                    onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional promotional price"
                    value={newProduct.discount_price}
                    onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Tags / Labels</label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Choice, Artisanal"
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed gourmet taste profile, ingredients, and presentation..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Flavours (comma-separated)</label>
                  <input
                    type="text"
                    value={newProduct.flavours}
                    onChange={(e) => setNewProduct({ ...newProduct, flavours: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Sizes / Weights</label>
                  <input
                    type="text"
                    value={newProduct.weights}
                    onChange={(e) => setNewProduct({ ...newProduct, weights: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.in_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, in_stock: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.is_eggless_available}
                    onChange={(e) => setNewProduct({ ...newProduct, is_eggless_available: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Eggless</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.is_bestseller}
                    onChange={(e) => setNewProduct({ ...newProduct, is_bestseller: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.is_featured}
                    onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDIT PRODUCT MODAL */}
      {/* ============================================================ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#D8B879]">
                <Edit className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">Edit Product #{editingProduct.id}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Category</label>
                  <select
                    value={editingProduct.category_id || editingProduct.category?.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.base_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, base_price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.discount_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discount_price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity ?? 50}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#D8B879] uppercase">Tags / Labels</label>
                  <input
                    type="text"
                    value={editingProduct.tags || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.in_stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, in_stock: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>In Stock</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_eggless_available}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_eggless_available: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Eggless</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_bestseller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_bestseller: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-[#D8B879] focus:ring-0"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DELETE PRODUCT CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#201815] border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-serif font-bold text-base text-white">Delete Product Confirmation</h3>
            </div>
            <p className="text-xs text-[#FAF6EE]/80">
              Are you sure you want to permanently delete <strong>"{deletingProduct.name}"</strong>? This will remove the item from all boutique menus.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: ADD CATEGORY MODAL */}
      {/* ============================================================ */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#D8B879]">
                <Folder className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">Create New Category</h3>
              </div>
              <button onClick={() => setShowAddCategoryModal(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Gelato & Sorbets"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newCategory.image_url}
                  onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Description</label>
                <textarea
                  rows="2"
                  placeholder="Category overview and story..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCategory.is_featured}
                  onChange={(e) => setNewCategory({ ...newCategory, is_featured: e.target.checked })}
                  className="rounded text-[#D8B879] focus:ring-0"
                />
                <span>Featured on Homepage</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: EDIT CATEGORY MODAL */}
      {/* ============================================================ */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#D8B879]">
                <Edit className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">Edit Category #{editingCategory.id}</h3>
              </div>
              <button onClick={() => setEditingCategory(null)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingCategory.image_url}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#D8B879] uppercase">Description</label>
                <textarea
                  rows="2"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#FAF6EE] cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingCategory.is_featured)}
                  onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                  className="rounded text-[#D8B879] focus:ring-0"
                />
                <span>Featured on Homepage</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: ATTACH SPECIFIC DISHES TO INDIVIDUAL RESERVATION */}
      {/* ============================================================ */}
      {managingReservationItems && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[#D8B879]">
                  <Utensils className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-base text-white">
                    Attach Menu Items & Pre-orders
                  </h3>
                </div>
                <p className="text-xs text-[#FAF6EE]/60 mt-0.5">
                  Guest: <strong className="text-white">{managingReservationItems.guest_name}</strong> • Table: <strong className="text-white">{managingReservationItems.table_number || 'Table 01'}</strong> ({managingReservationItems.token})
                </p>
              </div>
              <button onClick={() => setManagingReservationItems(null)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Attached Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                Currently Attached Dishes ({managingReservationItems.items?.length || 0})
              </h4>
              <div className="bg-[#1A1412] rounded-2xl border border-white/10 p-3 space-y-2 max-h-48 overflow-y-auto">
                {managingReservationItems.items?.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#201815] border border-white/5 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{it.product_name}</div>
                      <div className="text-[10px] text-[#FAF6EE]/60">
                        Qty: {it.quantity} • Unit: ₹{it.unit_price} • Total: <strong className="text-[#D8B879]">₹{it.total_price}</strong>
                      </div>
                      {it.notes && (
                        <div className="text-[10px] text-amber-300 italic">Note: {it.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveDishFromReservation(it.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition"
                      title="Remove Dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {!managingReservationItems.items?.length && (
                  <div className="text-center py-4 text-xs text-[#FAF6EE]/50">
                    No dishes attached yet. Add from catalog below!
                  </div>
                )}
              </div>
            </div>

            {/* Form to Attach New Dish */}
            <form onSubmit={handleAttachDishToReservation} className="bg-[#1A1412] p-4 rounded-2xl border border-[#D8B879]/20 space-y-3">
              <h4 className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                + Select & Attach Catalog Item
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-[#FAF6EE]/80 uppercase">Pick From Catalog *</label>
                  <select
                    value={attachDishForm.product_id}
                    onChange={(e) => {
                      const prodId = parseInt(e.target.value);
                      const chosen = products.find(p => p.id === prodId);
                      if (chosen) {
                        setAttachDishForm({
                          ...attachDishForm,
                          product_id: chosen.id,
                          product_name: chosen.name,
                          unit_price: chosen.discount_price || chosen.base_price
                        });
                      } else {
                        setAttachDishForm({ ...attachDishForm, product_id: '', product_name: '', unit_price: 0 });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#201815] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  >
                    <option value="">-- Choose item from catalog --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.discount_price || p.base_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#FAF6EE]/80 uppercase">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={attachDishForm.quantity}
                    onChange={(e) => setAttachDishForm({ ...attachDishForm, quantity: parseInt(e.target.value || 1) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#201815] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#FAF6EE]/80 uppercase">Item Name / Override</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Belgian Truffle Gateau"
                    value={attachDishForm.product_name}
                    onChange={(e) => setAttachDishForm({ ...attachDishForm, product_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#201815] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#FAF6EE]/80 uppercase">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={attachDishForm.unit_price}
                    onChange={(e) => setAttachDishForm({ ...attachDishForm, unit_price: parseFloat(e.target.value || 0) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#201815] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#FAF6EE]/80 uppercase">Special Serving Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Serve after appetizers with gold leaf candle"
                  value={attachDishForm.notes}
                  onChange={(e) => setAttachDishForm({ ...attachDishForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#201815] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Attach Dish to Table Reservation</span>
              </button>
            </form>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setManagingReservationItems(null)}
                className="px-5 py-2 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 7: ADD RESERVATION MODAL */}
      {/* ============================================================ */}
      {showAddReservationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#D8B879]">
                <Calendar className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">Log Table Reservation</h3>
              </div>
              <button onClick={() => setShowAddReservationModal(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Guest name"
                    value={newReservation.guest_name}
                    onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91..."
                    value={newReservation.guest_phone}
                    onChange={(e) => setNewReservation({ ...newReservation, guest_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#D8B879] uppercase">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={newReservation.guest_email}
                  onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Date *</label>
                  <input
                    type="text"
                    required
                    value={newReservation.reservation_date}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={newReservation.reservation_time}
                    onChange={(e) => setNewReservation({ ...newReservation, reservation_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Table #</label>
                  <input
                    type="text"
                    value={newReservation.table_number}
                    onChange={(e) => setNewReservation({ ...newReservation, table_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#D8B879] uppercase">Guests Count</label>
                  <input
                    type="text"
                    value={newReservation.guests_count}
                    onChange={(e) => setNewReservation({ ...newReservation, guests_count: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#D8B879] uppercase">Special Requests</label>
                <input
                  type="text"
                  placeholder="Anniversary champagne, window seat..."
                  value={newReservation.special_requests}
                  onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1412] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D8B879]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddReservationModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 8: CUSTOMER PROFILE & ORDER HISTORY MODAL */}
      {/* ============================================================ */}
      {viewingCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Patron Profile: {viewingCustomerDetail.full_name}
                </h3>
                <p className="text-xs text-[#FAF6EE]/60">
                  {viewingCustomerDetail.email} • {viewingCustomerDetail.phone || 'No phone'}
                </p>
              </div>
              <button onClick={() => setViewingCustomerDetail(null)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1A1412] border border-white/5">
                <span className="text-[10px] font-bold text-[#D8B879] uppercase block">Lifetime Spend</span>
                <span className="text-base font-bold text-[#D8B879]">₹{viewingCustomerDetail.total_spent || '0.00'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1A1412] border border-white/5">
                <span className="text-[10px] font-bold text-[#D8B879] uppercase block">Orders Count</span>
                <span className="text-base font-bold text-white">{viewingCustomerDetail.total_orders || 0} orders</span>
              </div>
            </div>

            {/* Past Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                Order History ({viewingCustomerDetail.orders?.length || 0})
              </h4>
              <div className="bg-[#1A1412] rounded-2xl border border-white/10 p-3 space-y-2 max-h-48 overflow-y-auto">
                {viewingCustomerDetail.orders?.map((ord) => (
                  <div key={ord.id} className="p-2.5 rounded-xl bg-[#201815] border border-white/5 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{ord.order_number}</div>
                      <div className="text-[10px] text-[#FAF6EE]/60">₹{ord.total_amount} • {ord.delivery_date}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {ord.status}
                    </span>
                  </div>
                ))}
                {!viewingCustomerDetail.orders?.length && (
                  <div className="text-center py-4 text-xs text-[#FAF6EE]/50">No orders on record.</div>
                )}
              </div>
            </div>

            {/* Past Reservations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                Salon Bookings ({viewingCustomerDetail.reservations?.length || 0})
              </h4>
              <div className="bg-[#1A1412] rounded-2xl border border-white/10 p-3 space-y-2 max-h-40 overflow-y-auto">
                {viewingCustomerDetail.reservations?.map((res) => (
                  <div key={res.id} className="p-2 rounded-xl bg-[#201815] border border-white/5 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{res.table_number || 'Table 01'} ({res.token})</div>
                      <div className="text-[10px] text-[#FAF6EE]/60">{res.reservation_date} • {res.reservation_time}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {res.status}
                    </span>
                  </div>
                ))}
                {!viewingCustomerDetail.reservations?.length && (
                  <div className="text-center py-4 text-xs text-[#FAF6EE]/50">No reservations on record.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingCustomerDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ORDER DETAILS & PAYMENT AUDIT MODAL */}
      {/* ============================================================ */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#201815] border border-[#D8B879]/30 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-6 my-8 text-white">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#D8B879] uppercase tracking-wider bg-[#D8B879]/10 px-2.5 py-0.5 rounded-full border border-[#D8B879]/30 font-mono">
                    {selectedOrderDetails.order_number}
                  </span>
                  <span className="text-[11px] text-[#FAF6EE]/50">
                    {selectedOrderDetails.created_at ? new Date(selectedOrderDetails.created_at).toLocaleString() : 'Recent Order'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-white">
                  Order & Payment Information
                </h3>
              </div>

              <button 
                onClick={() => setSelectedOrderDetails(null)} 
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PAYMENT INFORMATION AUDIT CARD */}
            <div className="p-5 rounded-2xl bg-[#1A1412] border border-[#D8B879]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D8B879]" />
                  <h4 className="text-xs font-bold text-[#D8B879] uppercase tracking-wider">
                    Payment Tracking & Reconciliation
                  </h4>
                </div>

                {/* Payment Status Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (selectedOrderDetails.payment_status || '').toLowerCase() === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : (selectedOrderDetails.payment_status || '').toLowerCase() === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  Status: {selectedOrderDetails.payment_status || (selectedOrderDetails.payment_method === 'Cash on Delivery' ? 'Pending' : 'Paid')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-[#FAF6EE]/50 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-base font-bold text-[#D8B879]">₹{selectedOrderDetails.total_amount}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#FAF6EE]/50 uppercase tracking-wider block">Payment Method</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedOrderDetails.payment_method || 'Online Payment (Demo)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#FAF6EE]/50 uppercase tracking-wider block">Transaction Reference</span>
                  <span className="text-xs font-mono text-[#D8B879]">
                    {selectedOrderDetails.transaction_id || selectedOrderDetails.payment?.transaction_id || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#FAF6EE]/50 uppercase tracking-wider block">Payment Timestamp</span>
                  <span className="text-xs text-white">
                    {selectedOrderDetails.payment?.paid_at
                      ? new Date(selectedOrderDetails.payment.paid_at).toLocaleString()
                      : (selectedOrderDetails.payment_status === 'Paid' ? 'Recorded at checkout' : 'Pending payment collection')}
                  </span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-[#FAF6EE]/70">
                  Update Payment Status:
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedOrderDetails.payment_status || 'Pending'}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrderDetails.id, e.target.value)}
                    disabled={updatingPaymentId === selectedOrderDetails.id}
                    className="px-3 py-1.5 rounded-xl bg-[#201815] border border-white/20 text-xs text-white focus:outline-none focus:border-[#D8B879] flex-1 sm:flex-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>

                  {(selectedOrderDetails.payment_status || '').toLowerCase() === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus(selectedOrderDetails.id, 'Paid')}
                      disabled={updatingPaymentId === selectedOrderDetails.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Paid (Cash Collected)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Delivery Destination Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#1A1412] border border-white/5 space-y-2">
                <h5 className="font-bold text-[#D8B879] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Customer Profile</span>
                </h5>
                <p className="font-bold text-white text-sm">{selectedOrderDetails.customer_name}</p>
                <p className="text-[#FAF6EE]/70 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#D8B879]" />
                  <span>{selectedOrderDetails.customer_phone}</span>
                </p>
                <p className="text-[#FAF6EE]/60 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#D8B879]" />
                  <span>{selectedOrderDetails.customer_email}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1412] border border-white/5 space-y-2">
                <h5 className="font-bold text-[#D8B879] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Address</span>
                </h5>
                <p className="text-white">{selectedOrderDetails.delivery_address}</p>
                <p className="text-[#FAF6EE]/70">{selectedOrderDetails.city} - {selectedOrderDetails.pincode}</p>
                <p className="text-[11px] text-[#D8B879] pt-1">
                  Slot: {selectedOrderDetails.delivery_date} • {selectedOrderDetails.delivery_time_slot}
                </p>
              </div>
            </div>

            {selectedOrderDetails.special_instructions && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>Order Notes / Plaque:</strong> "{selectedOrderDetails.special_instructions}"
              </div>
            )}

            {/* Ordered Items List */}
            <div className="space-y-2">
              <h5 className="font-bold text-[#D8B879] uppercase tracking-wider text-xs">
                Items In Order ({selectedOrderDetails.items?.length || 0})
              </h5>
              <div className="bg-[#1A1412] rounded-2xl border border-white/10 p-3 space-y-2 max-h-48 overflow-y-auto">
                {selectedOrderDetails.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#201815] border border-white/5">
                    <div className="flex items-center gap-3">
                      {it.product_image && (
                        <img src={it.product_image} alt={it.product_name} className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <div>
                        <div className="font-bold text-white">{it.product_name}</div>
                        <div className="text-[10px] text-[#FAF6EE]/50">{it.weight || 'Standard'} • Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold text-[#D8B879]">₹{it.total_price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Order Status updater & Close */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#FAF6EE]/70">Kitchen / Delivery Status:</span>
                <select
                  value={selectedOrderDetails.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#1A1412] border border-[#D8B879]/40 text-xs text-[#D8B879] font-bold focus:outline-none"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Preparing / Baking">Preparing / Baking</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-6 py-2.5 rounded-xl bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
