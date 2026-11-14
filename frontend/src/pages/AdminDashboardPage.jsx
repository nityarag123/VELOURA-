import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Home, ShieldCheck, ShoppingBag, DollarSign, Users, 
  CheckCircle2, Clock, AlertCircle, RefreshCw, Key, 
  LogOut, Utensils, Calendar, Sparkles, Plus, Search, 
  Phone, Mail, MapPin, Filter, PartyPopper, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [works, setWorks] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'bookings', 'works', 'security'
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [workSearch, setWorkSearch] = useState('');
  const [workStatusFilter, setWorkStatusFilter] = useState('all');

  // Modals state
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
    special_requests: 'Direct Admin / Phone Reservation',
    status: 'Confirmed'
  });

  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [newWork, setNewWork] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    occasion: 'Bespoke Celebration Gateau',
    event_date: 'Upcoming',
    guest_count: 50,
    flavour_profile: 'Belgian Dark Truffle & Hazelnut Praline',
    tier_count: '2 Tiers',
    dietary_spec: '100% Eggless',
    design_notes: '',
    estimated_budget: 15000.0,
    status: 'Inquiry Received'
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
      const [statsRes, ordersRes, resRes, worksRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ 
          data: { total_orders: 14, total_revenue: 9780.0, total_customers: 22 } 
        })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/admin/reservations').catch(() => ({ data: [] })),
        api.get('/admin/works').catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);

      // Orders
      let loadedOrders = Array.isArray(ordersRes.data) && ordersRes.data.length ? ordersRes.data : [];
      if (!loadedOrders.length) {
        try {
          loadedOrders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
        } catch (e) {}
      }
      if (!loadedOrders.length) {
        loadedOrders = [
          {
            id: 101,
            order_number: "VEL-2026-92814",
            customer_name: "Aarav Sharma",
            customer_email: "aarav.sharma@example.com",
            customer_phone: "+91 98765 43210",
            delivery_address: "Flat 402, Sea Green Apartments, Worli",
            city: "Mumbai",
            pincode: "400018",
            delivery_date: "Today",
            delivery_time_slot: "Midnight Surprise (11:00 PM - 12:00 AM)",
            cake_message: "Happy 25th Anniversary Mom & Dad!",
            special_instructions: "Please ring bell discreetly. It's a midnight surprise celebration.",
            total_amount: 1499.0,
            status: "Baking",
            payment_method: "UPI (Google Pay)",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            items: [
              {
                id: 1,
                product_name: "Royal Belgian Truffle Gateau",
                product_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
                weight: "1.0 kg",
                flavour: "Belgian Dark Truffle",
                is_eggless: true,
                cake_message: "Happy 25th Anniversary Mom & Dad!",
                total_price: 1399.0
              }
            ]
          },
          {
            id: 102,
            order_number: "VEL-2026-74912",
            customer_name: "Meera Nair",
            customer_email: "meera.nair@gmail.com",
            customer_phone: "+91 91234 56789",
            delivery_address: "Villa 12, Palm Meadows, Whitefield",
            city: "Bengaluru",
            pincode: "560066",
            delivery_date: "Today",
            delivery_time_slot: "Evening Prime (6:00 PM - 9:00 PM)",
            cake_message: "Happy Birthday Arjun!",
            special_instructions: "Extra gold birthday candles and cutlery requested.",
            total_amount: 849.0,
            status: "Order Placed",
            payment_method: "Credit Card (HDFC)",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            items: [
              {
                id: 2,
                product_name: "Korean Minimalist Bento Cake",
                product_image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
                weight: "0.5 kg",
                flavour: "Strawberry Shortcake",
                is_eggless: true,
                cake_message: "Happy Birthday Arjun!",
                total_price: 749.0
              }
            ]
          }
        ];
      }
      setOrders(loadedOrders);

      // Reservations
      let loadedRes = Array.isArray(resRes.data) && resRes.data.length ? resRes.data : [];
      if (!loadedRes.length) {
        try {
          loadedRes = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
        } catch (e) {}
      }
      if (!loadedRes.length) {
        loadedRes = [
          {
            id: 1,
            token: "VL-938210",
            guest_name: "Aarav & Radhika Sharma",
            guest_phone: "+91 98765 43210",
            guest_email: "aarav.sharma@example.com",
            reservation_date: "Today",
            reservation_time: "7:30 PM - 9:30 PM",
            location: "Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad",
            guests_count: "2 Guests",
            table_number: "Table 02",
            table_name: "Parisian Velvet Booth",
            special_requests: "25th Anniversary private dining with champagne gateau presentation.",
            status: "Table Prepared",
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            token: "VL-621840",
            guest_name: "Vikramaditya Singhania",
            guest_phone: "+91 98200 11223",
            guest_email: "vikram.singh@example.com",
            reservation_date: "Tomorrow",
            reservation_time: "8:00 PM - 10:30 PM",
            location: "Veloura Grand Reserve Salon • Mumbai Seafront",
            guests_count: "6-8 Guests VIP",
            table_number: "Table 04",
            table_name: "The Imperial Grand Round",
            special_requests: "Family Milestone Birthday celebration. Chandelier suite required.",
            status: "Confirmed",
            created_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 3,
            token: "VL-410952",
            guest_name: "Ananya Deshmukh",
            guest_phone: "+91 99887 66554",
            guest_email: "ananya.desh@gmail.com",
            reservation_date: "Today",
            reservation_time: "4:00 PM - 6:00 PM",
            location: "Veloura Grand Reserve Salon • Bengaluru",
            guests_count: "2 Guests",
            table_number: "Table 01",
            table_name: "Salon Window Alcove",
            special_requests: "Afternoon High Tea and signature pour-over tasting.",
            status: "Guests Seated",
            created_at: new Date(Date.now() - 14400000).toISOString()
          }
        ];
      }
      setReservations(loadedRes);

      // Works
      let loadedWorks = Array.isArray(worksRes.data) && worksRes.data.length ? worksRes.data : [];
      if (!loadedWorks.length) {
        try {
          loadedWorks = JSON.parse(localStorage.getItem('veloura_customer_works') || '[]');
        } catch (e) {}
      }
      if (!loadedWorks.length) {
        loadedWorks = [
          {
            id: 1,
            work_code: "WRK-2026-101",
            client_name: "Mrs. Gayatri Varma",
            client_phone: "+91 98450 99887",
            client_email: "gayatri.varma@example.com",
            occasion: "3-Tier Royal Velvet & 24K Gold Wedding Gateau",
            event_date: "2026-11-28",
            guest_count: 180,
            flavour_profile: "Belgian Dark Truffle & Madagascar Vanilla Bean",
            tier_count: "3 Tiers Hand-Sculpted",
            dietary_spec: "100% Eggless",
            design_notes: "Cascading edible sugar-craft white roses with brushed edible 24K gold foil. Matching wedding motif.",
            estimated_budget: 24500.0,
            status: "Design Consulted",
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            work_code: "WRK-2026-102",
            client_name: "Rohan Malhotra (TechCorp India)",
            client_phone: "+91 97112 33445",
            client_email: "rohan.m@techcorp.in",
            occasion: "Corporate 10th Milestone Celebration Cake",
            event_date: "2026-11-20",
            guest_count: 80,
            flavour_profile: "Opera Hazelnut Praline",
            tier_count: "2 Tiers Sculpted Modernist",
            dietary_spec: "Eggless & Nut-labelled",
            design_notes: "Corporate logo printed on white Belgian chocolate plaque with LED back-glow stage stand.",
            estimated_budget: 16500.0,
            status: "In Production",
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 3,
            work_code: "WRK-2026-103",
            client_name: "Dr. Meenakshi Iyer",
            client_phone: "+91 98220 54321",
            client_email: "meenakshi.iyer@hospital.org",
            occasion: "Bespoke 50th Golden Jubilee Botanical Gateau",
            event_date: "2026-11-25",
            guest_count: 50,
            flavour_profile: "Persian Pistachio & Rose Saffron",
            tier_count: "2 Tiers Hexagonal",
            dietary_spec: "100% Eggless / Sugar-Conscious",
            design_notes: "Handmade edible sugar orchids with botanical green velvet finish.",
            estimated_budget: 14000.0,
            status: "Quotation Approved",
            created_at: new Date(Date.now() - 259200000).toISOString()
          }
        ];
      }
      setWorks(loadedWorks);

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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
        try { localStorage.setItem('veloura_orders', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    try {
      await api.put(`/admin/reservations/${resId}/status`, { status: newStatus });
      setReservations((prev) => {
        const updated = prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r));
        try { localStorage.setItem('veloura_table_bookings', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/reservations', newReservation);
      const created = res.data;
      setReservations((prev) => [created, ...prev]);
      setShowAddReservationModal(false);
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
        special_requests: 'Direct Admin / Phone Reservation',
        status: 'Confirmed'
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create reservation');
    }
  };

  const handleUpdateWorkStatus = async (workId, newStatus) => {
    try {
      await api.put(`/admin/works/${workId}/status`, { status: newStatus });
      setWorks((prev) => {
        const updated = prev.map((w) => (w.id === workId ? { ...w, status: newStatus } : w));
        try { localStorage.setItem('veloura_customer_works', JSON.stringify(updated)); } catch(e){}
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/works', newWork);
      const created = res.data;
      setWorks((prev) => [created, ...prev]);
      setShowAddWorkModal(false);
      setNewWork({
        client_name: '',
        client_phone: '',
        client_email: '',
        occasion: 'Bespoke Celebration Gateau',
        event_date: 'Upcoming',
        guest_count: 50,
        flavour_profile: 'Belgian Dark Truffle & Hazelnut Praline',
        tier_count: '2 Tiers',
        dietary_spec: '100% Eggless',
        design_notes: '',
        estimated_budget: 15000.0,
        status: 'Inquiry Received'
      });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create work order');
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
      setPasswordSuccess(res.data?.message || 'Admin password updated successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to update admin password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Filtered lists
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

  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = bookingStatusFilter === 'all' || (r.status && r.status.toLowerCase() === bookingStatusFilter.toLowerCase());
    const q = bookingSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (r.token && r.token.toLowerCase().includes(q)) ||
      (r.guest_name && r.guest_name.toLowerCase().includes(q)) ||
      (r.guest_phone && r.guest_phone.toLowerCase().includes(q)) ||
      (r.table_number && r.table_number.toLowerCase().includes(q)) ||
      (r.table_name && r.table_name.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const filteredWorks = works.filter((w) => {
    const matchesFilter = workStatusFilter === 'all' || (w.status && w.status.toLowerCase() === workStatusFilter.toLowerCase());
    const q = workSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (w.work_code && w.work_code.toLowerCase().includes(q)) ||
      (w.client_name && w.client_name.toLowerCase().includes(q)) ||
      (w.client_phone && w.client_phone.toLowerCase().includes(q)) ||
      (w.occasion && w.occasion.toLowerCase().includes(q)) ||
      (w.flavour_profile && w.flavour_profile.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // Calculate order counts by status
  const orderCounts = {
    all: orders.length,
    placed: orders.filter((o) => o.status === 'Order Placed').length,
    baking: orders.filter((o) => o.status === 'Baking').length,
    delivery: orders.filter((o) => o.status === 'Out for Delivery').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

  // Calculate reservation counts
  const reservationCounts = {
    all: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'Confirmed').length,
    prepared: reservations.filter((r) => r.status === 'Table Prepared').length,
    seated: reservations.filter((r) => r.status === 'Guests Seated').length,
    completed: reservations.filter((r) => r.status === 'Completed').length,
  };

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
              Veloura Operations Console
            </h1>
            <p className="text-xs text-[#3D2820] max-w-md mx-auto leading-relaxed">
              Administrative credentials are required to view incoming customer orders, manage dining salon table reservations, and track bespoke cake works.
            </p>
          </div>

          {user && !isAdmin && (
            <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-600/30 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-[#8C5E43] text-[11px] font-semibold">Currently signed in as:</p>
                <p className="font-bold text-[#160B0D] truncate">{user.full_name || user.email}</p>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Customer Mode</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 text-xs font-bold bg-white/80 hover:bg-white text-red-700 border border-red-300 rounded-xl transition shadow-xs"
              >
                Sign Out
              </button>
            </div>
          )}

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
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#C4B19F] text-xs text-[#160B0D] focus:outline-none focus:border-[#260D16] focus:ring-1 focus:ring-[#260D16]"
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
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#C4B19F] text-xs text-[#160B0D] focus:outline-none focus:border-[#260D16] focus:ring-1 focus:ring-[#260D16]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {gateLoading ? 'Authenticating...' : 'Unlock Admin Operations Console'}
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
  // AUTHENTICATED EXECUTIVE ADMIN DASHBOARD VIEW
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
                Executive Operations Console
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
            title="Refresh live orders & bookings"
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
          {activeTab === 'orders' ? 'Customer Orders & Works' : activeTab === 'bookings' ? 'Table Bookings & Reservations' : activeTab === 'works' ? 'Bespoke Customer Works' : 'Admin Security'}
        </span>
      </nav>

      {/* Console Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C4B19F] gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C5E43] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#260D16]" />
            <span>Back-Office Operations</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#160B0D] mt-0.5">
            Customer Orders, Table Bookings & Works
          </h1>
        </div>
      </div>

      {/* 2. EXECUTIVE OPERATIONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => setActiveTab('orders')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeTab === 'orders' ? 'bg-[#260D16] text-[#FAF6EE] border-[#D8B879]' : 'bg-[#E8DDD2] text-[#160B0D] border-[#C4B19F] hover:border-[#260D16]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'orders' ? 'text-[#D8B879]' : 'text-[#8C5E43]'}`}>
              Customer Orders
            </span>
            <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#D8B879]' : 'text-[#260D16]'}`} />
          </div>
          <p className="font-serif text-3xl font-extrabold mt-1">{orders.length}</p>
          <p className={`text-[11px] font-semibold mt-1 ${activeTab === 'orders' ? 'text-emerald-300' : 'text-emerald-700'}`}>
            {orderCounts.baking} Baking • {orderCounts.placed} Placed
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('bookings')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeTab === 'bookings' ? 'bg-[#260D16] text-[#FAF6EE] border-[#D8B879]' : 'bg-[#E8DDD2] text-[#160B0D] border-[#C4B19F] hover:border-[#260D16]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'bookings' ? 'text-[#D8B879]' : 'text-[#8C5E43]'}`}>
              Salon Table Bookings
            </span>
            <Utensils className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-[#D8B879]' : 'text-[#260D16]'}`} />
          </div>
          <p className="font-serif text-3xl font-extrabold mt-1">{reservations.length}</p>
          <p className={`text-[11px] font-semibold mt-1 ${activeTab === 'bookings' ? 'text-[#D8B879]' : 'text-[#8C5E43]'}`}>
            {reservationCounts.prepared + reservationCounts.seated} Active in Salon Today
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('works')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            activeTab === 'works' ? 'bg-[#260D16] text-[#FAF6EE] border-[#D8B879]' : 'bg-[#E8DDD2] text-[#160B0D] border-[#C4B19F] hover:border-[#260D16]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'works' ? 'text-[#D8B879]' : 'text-[#8C5E43]'}`}>
              Bespoke Works
            </span>
            <Sparkles className={`w-4 h-4 ${activeTab === 'works' ? 'text-[#D8B879]' : 'text-[#260D16]'}`} />
          </div>
          <p className="font-serif text-3xl font-extrabold mt-1">{works.length}</p>
          <p className={`text-[11px] font-semibold mt-1 ${activeTab === 'works' ? 'text-amber-300' : 'text-[#8C5E43]'}`}>
            Custom Wedding & Milestone Cakes
          </p>
        </div>

        <div className="p-5 bg-[#E8DDD2] rounded-2xl border border-[#C4B19F] space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E43]">Order Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-[#260D16]">
            ₹{stats?.total_revenue || (orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0))}
          </p>
          <p className="text-[11px] text-[#3D2820] font-medium">Recorded bakery sales</p>
        </div>
      </div>

      {/* 3. PRIMARY ADMINISTRATIVE TABS SWITCHER */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#C4B19F] pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'orders'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Customer Orders & Works ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'bookings'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Table Bookings & Salon Reservations ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('works')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'works'
                ? 'bg-[#260D16] text-[#FAF6EE] shadow-md'
                : 'bg-[#E8DDD2] text-[#160B0D] hover:bg-[#F3ECE4] border border-[#C4B19F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B879]" />
            <span>Bespoke Customer Commissions ({works.length})</span>
          </button>

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

        {/* Tab Actions */}
        {activeTab === 'bookings' && (
          <button
            onClick={() => setShowAddReservationModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition"
          >
            <Plus className="w-4 h-4 text-[#D8B879]" />
            <span>+ Manual / Phone Reservation</span>
          </button>
        )}

        {activeTab === 'works' && (
          <button
            onClick={() => setShowAddWorkModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition"
          >
            <Plus className="w-4 h-4 text-[#D8B879]" />
            <span>+ New Bespoke Work Order</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CUSTOMER ORDERS & PRODUCTION WORKS                     */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-[#E8DDD2] rounded-2xl border border-[#C4B19F]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by customer name, phone, order number, city, or cake message..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none focus:border-[#260D16]"
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
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
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
                    {/* Order Top Bar */}
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

                      {/* Live Status Dropdown Updater */}
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

                    {/* Order Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                      
                      {/* Left: Ordered Cakes & Items */}
                      <div className="lg:col-span-7 space-y-3">
                        <h5 className="font-bold text-[#8C5E43] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#260D16]" />
                          <span>Ordered Bakery Gateaux & Items</span>
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
                                  {it.is_eggless && (
                                    <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                                      100% Eggless
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-[#260D16] mt-1">₹{it.total_price || (it.unit_price * it.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* HIGHLIGHTED CAKE MESSAGE PLAQUE */}
                        {ord.cake_message && (
                          <div className="p-3.5 bg-[#260D16] text-[#FAF6EE] rounded-2xl border border-[#D8B879] space-y-1 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B879] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#D8B879]" />
                              <span>Custom Cake Plaque Inscription (To be written on cake):</span>
                            </span>
                            <p className="font-serif text-sm sm:text-base font-bold italic text-white tracking-wide">
                              "{ord.cake_message}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Delivery Slot, Address & Payment */}
                      <div className="lg:col-span-5 space-y-3">
                        <h5 className="font-bold text-[#8C5E43] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#260D16]" />
                          <span>Delivery Logistics & Patron Details</span>
                        </h5>

                        <div className="bg-white/80 p-4 rounded-2xl border border-[#C4B19F] space-y-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43] block">
                              Scheduled Delivery Slot:
                            </span>
                            <p className="font-bold text-[#260D16] text-xs mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#D8B879]" />
                              <span>{ord.delivery_date} • {ord.delivery_time_slot || ord.delivery_slot || 'Standard Express'}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#C4B19F]/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43] block">
                              Delivery Address:
                            </span>
                            <p className="text-[#160B0D] font-medium leading-relaxed text-xs mt-0.5">
                              {ord.delivery_address}, {ord.city} - {ord.pincode}
                            </p>
                          </div>

                          {ord.special_instructions && (
                            <div className="pt-2 border-t border-[#C4B19F]/50">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                                Customer Special Note:
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
      {/* TAB 2: TABLE BOOKINGS & SALON RESERVATIONS                     */}
      {/* ============================================================ */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-[#E8DDD2] rounded-2xl border border-[#C4B19F]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search table bookings by guest name, phone, reservation token, table number, or salon..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none focus:border-[#260D16]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-[#8C5E43] uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'Confirmed', 'Table Prepared', 'Guests Seated', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    bookingStatusFilter === st
                      ? 'bg-[#260D16] text-[#D8B879]'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  {st === 'all' ? `All (${reservations.length})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] space-y-2">
              <Utensils className="w-12 h-12 text-[#C4B19F] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#160B0D]">No Table Bookings Found</h3>
              <p className="text-xs text-[#8C5E43]">
                {bookingSearch ? 'No reservations match your search.' : 'No bookings in this status filter.'}
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
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
                        <span className="font-mono text-xs font-extrabold text-[#260D16] bg-white px-2.5 py-1 rounded-lg border border-[#C4B19F]">
                          {res.token}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusBadge}`}>
                          {res.status}
                        </span>
                      </div>

                      {/* Guest Info */}
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

                      {/* Celebration Note */}
                      {res.special_requests && (
                        <div className="mt-3 p-3 bg-white/50 rounded-xl border border-[#C4B19F]/60 text-xs">
                          <span className="text-[10px] font-bold text-[#8C5E43] uppercase tracking-wider block">
                            Celebration / Occasion Notes:
                          </span>
                          <p className="text-[#160B0D] italic mt-0.5">
                            "{res.special_requests}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Changer */}
                    <div className="pt-3 border-t border-[#C4B19F] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43]">Status:</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: CUSTOMER WORKS & BESPOKE COMMISSIONS                   */}
      {/* ============================================================ */}
      {activeTab === 'works' && (
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-[#E8DDD2] rounded-2xl border border-[#C4B19F]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C5E43] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bespoke works by client, phone, work code, occasion, or flavour..."
                value={workSearch}
                onChange={(e) => setWorkSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#C4B19F] rounded-xl text-[#160B0D] focus:outline-none focus:border-[#260D16]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-[11px] text-[#8C5E43] uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {['all', 'Inquiry Received', 'Design Consulted', 'Quotation Approved', 'In Production', 'Ready for Setup', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setWorkStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    workStatusFilter === st
                      ? 'bg-[#260D16] text-[#D8B879]'
                      : 'bg-white/80 hover:bg-white text-[#160B0D] border border-[#C4B19F]'
                  }`}
                >
                  {st === 'all' ? `All (${works.length})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Works List */}
          {filteredWorks.length === 0 ? (
            <div className="p-12 text-center bg-[#E8DDD2] rounded-3xl border border-[#C4B19F] space-y-2">
              <Sparkles className="w-12 h-12 text-[#C4B19F] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#160B0D]">No Bespoke Works Found</h3>
              <p className="text-xs text-[#8C5E43]">
                {workSearch ? 'No commissions match your search.' : 'No custom works in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredWorks.map((w) => {
                const statusBadge = 
                  w.status === 'In Production' ? 'bg-amber-700 text-white' :
                  w.status === 'Design Consulted' ? 'bg-[#260D16] text-[#D8B879]' :
                  w.status === 'Completed' ? 'bg-emerald-800 text-white' :
                  'bg-blue-800 text-white';

                return (
                  <div
                    key={w.id}
                    className="p-6 bg-[#E8DDD2] rounded-3xl border-2 border-[#C4B19F] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      {/* Work Top Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
                        <span className="font-mono text-xs font-extrabold text-[#260D16] bg-white px-3 py-1 rounded-lg border border-[#C4B19F]">
                          {w.work_code}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${statusBadge}`}>
                          {w.status}
                        </span>
                      </div>

                      {/* Client & Occasion */}
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C5E43]">Client Commission:</span>
                        <h4 className="font-serif text-lg font-extrabold text-[#160B0D]">{w.occasion}</h4>
                        <p className="text-xs text-[#3D2820]">
                          Client: <strong>{w.client_name}</strong> • <a href={`tel:${w.client_phone}`} className="font-bold text-[#260D16] hover:underline">{w.client_phone}</a>
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="mt-4 p-4 bg-white/80 rounded-2xl border border-[#C4B19F] space-y-2 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#8C5E43] font-semibold block">Event Date:</span>
                            <span className="font-bold text-[#160B0D]">{w.event_date}</span>
                          </div>
                          <div>
                            <span className="text-[#8C5E43] font-semibold block">Guest Count:</span>
                            <span className="font-bold text-[#160B0D]">{w.guest_count} Guests</span>
                          </div>
                          <div>
                            <span className="text-[#8C5E43] font-semibold block">Tiers:</span>
                            <span className="font-bold text-[#160B0D]">{w.tier_count}</span>
                          </div>
                          <div>
                            <span className="text-[#8C5E43] font-semibold block">Dietary:</span>
                            <span className="font-bold text-emerald-800">{w.dietary_spec}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[#8C5E43] font-semibold block">Flavour Profile:</span>
                            <span className="font-bold text-[#160B0D]">{w.flavour_profile}</span>
                          </div>
                        </div>

                        {w.design_notes && (
                          <div className="pt-2 border-t border-[#C4B19F]/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43] block">Design Notes:</span>
                            <p className="text-[#160B0D] italic text-xs mt-0.5">{w.design_notes}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#C4B19F]/60 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E43]">Quotation / Budget:</span>
                          <span className="font-serif text-base font-extrabold text-[#260D16]">₹{w.estimated_budget}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status Changer */}
                    <div className="pt-3 border-t border-[#C4B19F] flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E43]">Stage:</span>
                      <select
                        value={w.status}
                        onChange={(e) => handleUpdateWorkStatus(w.id, e.target.value)}
                        className="text-xs font-bold bg-[#260D16] text-[#D8B879] rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="Inquiry Received">Inquiry Received</option>
                        <option value="Design Consulted">Design Consulted</option>
                        <option value="Quotation Approved">Quotation Approved</option>
                        <option value="In Production">In Production / Baking</option>
                        <option value="Ready for Setup">Ready for Setup</option>
                        <option value="Completed">Completed</option>
                      </select>
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
              Admin accounts have full access to customer orders and table reservations. Keep your master password safe.
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
      {/* MODAL: MANUAL / PHONE TABLE RESERVATION                       */}
      {/* ============================================================ */}
      {showAddReservationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E8DDD2] max-w-lg w-full rounded-3xl border-2 border-[#C4B19F] p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
              <h3 className="font-serif text-lg font-bold text-[#160B0D] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#260D16]" />
                <span>Log Manual / Phone Reservation</span>
              </h3>
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
                    placeholder="Today / Tomorrow / 2026-11-18"
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
                  <label className="block font-bold text-[#160B0D] mb-1">Table Number & Booth</label>
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
                    <option value="Table 05">Table 05 (Terrace)</option>
                    <option value="Table 07">Table 07 (Royal Suite)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Party Size</label>
                  <select
                    value={newReservation.guests_count}
                    onChange={(e) => setNewReservation({ ...newReservation, guests_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none font-bold"
                  >
                    <option value="2 Guests">2 Guests (Couple)</option>
                    <option value="4 Guests">4 Guests</option>
                    <option value="6-8 Guests VIP">6-8 Guests VIP</option>
                    <option value="8+ Private Dining">8+ Private Dining</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Celebration Occasion / Special Requests</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Birthday anniversary dinner, requested champagne cake presentation..."
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
                  className="px-5 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  Confirm & Reserve Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: NEW CUSTOM WORK ORDER                                  */}
      {/* ============================================================ */}
      {showAddWorkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E8DDD2] max-w-lg w-full rounded-3xl border-2 border-[#C4B19F] p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4B19F]">
              <h3 className="font-serif text-lg font-bold text-[#160B0D] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#260D16]" />
                <span>Log New Bespoke Work Order</span>
              </h3>
              <button
                onClick={() => setShowAddWorkModal(false)}
                className="p-1 rounded-full hover:bg-black/10 text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWork} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Occasion / Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Tier Royal Velvet & 24K Gold Wedding Gateau"
                  value={newWork.occasion}
                  onChange={(e) => setNewWork({ ...newWork, occasion: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Gayatri Varma"
                    value={newWork.client_name}
                    onChange={(e) => setNewWork({ ...newWork, client_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 99887"
                    value={newWork.client_phone}
                    onChange={(e) => setNewWork({ ...newWork, client_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Event Date</label>
                  <input
                    type="text"
                    value={newWork.event_date}
                    onChange={(e) => setNewWork({ ...newWork, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="2026-11-28"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={newWork.guest_count}
                    onChange={(e) => setNewWork({ ...newWork, guest_count: parseInt(e.target.value) || 50 })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Tiers</label>
                  <input
                    type="text"
                    value={newWork.tier_count}
                    onChange={(e) => setNewWork({ ...newWork, tier_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="3 Tiers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Flavour Profile</label>
                  <input
                    type="text"
                    value={newWork.flavour_profile}
                    onChange={(e) => setNewWork({ ...newWork, flavour_profile: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="Belgian Dark Truffle"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#160B0D] mb-1">Dietary Spec</label>
                  <input
                    type="text"
                    value={newWork.dietary_spec}
                    onChange={(e) => setNewWork({ ...newWork, dietary_spec: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                    placeholder="100% Eggless"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Design Specifications & Notes</label>
                <textarea
                  rows="2"
                  placeholder="Cascading edible sugar-craft flowers, 24K gold foil, matching colour palette..."
                  value={newWork.design_notes}
                  onChange={(e) => setNewWork({ ...newWork, design_notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#160B0D] mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={newWork.estimated_budget}
                  onChange={(e) => setNewWork({ ...newWork, estimated_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C4B19F] rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8C5E43] hover:text-[#160B0D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#260D16] hover:bg-[#3D121A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
                >
                  Create Work Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
