import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, Phone, Mail, 
  Clock, Check, ExternalLink, ArrowRight, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';

  const { user, updateProfile, logout } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activeTabParam) setActiveTab(activeTabParam);
  }, [activeTabParam]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const res = await api.get('/orders/my-orders');
          setOrders(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Please sign in to view your account</h2>
        <Link
          to="/login"
          className="mt-4 inline-block px-6 py-2.5 bg-[#4A1525] text-white text-xs font-semibold rounded-full"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb Home Bar */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 py-2 px-4 bg-white rounded-xl border border-[#EFE8DF] shadow-2xs">
        <Link to="/" className="hover:text-[#4A1525] flex items-center gap-1 font-bold text-gray-700 transition">
          <Home className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Home</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#4A1525] font-bold">My Account</span>
      </nav>

      {/* Profile Header */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#F0E6DA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#4A1525] text-[#E6C387] flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2020]">{user.full_name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="text-xs font-semibold text-red-600 hover:underline px-3 py-1.5"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#F0E6DA] pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'profile'
              ? 'bg-[#4A1525] text-white shadow-xs'
              : 'bg-[#FAF3EB] text-gray-700 hover:bg-[#F5EAD9]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Address</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'orders'
              ? 'bg-[#4A1525] text-white shadow-xs'
              : 'bg-[#FAF3EB] text-gray-700 hover:bg-[#F5EAD9]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'wishlist'
              ? 'bg-[#4A1525] text-white shadow-xs'
              : 'bg-[#FAF3EB] text-gray-700 hover:bg-[#F5EAD9]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Tab 1: Profile & Address */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6DA] space-y-4 shadow-2xs">
          <h3 className="font-serif text-lg font-bold text-[#2D2020] pb-2 border-b border-gray-100">
            Personal Information & Default Delivery Address
          </h3>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Your profile details have been saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default Street Address</label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={profileForm.pincode}
                onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <p className="text-xs text-gray-500 py-10 text-center">Loading past orders...</p>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#F0E6DA]">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="font-serif text-lg font-bold">No orders placed yet</h4>
              <p className="text-xs text-gray-500 mt-1">Order your first cake today and track its progress in real-time!</p>
              <Link
                to="/products"
                className="mt-4 inline-block px-6 py-2 bg-[#4A1525] text-white text-xs font-semibold rounded-full"
              >
                Browse Cakes
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#4A1525]">{ord.order_number}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Placed on {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#FAF3EB] text-[#4A1525]">
                      {ord.status}
                    </span>
                    <Link
                      to={`/order-confirmation/${ord.order_number}`}
                      className="text-xs text-[#A62846] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Track Order</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <img
                        src={it.product_image}
                        alt={it.product_name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#2D2020] truncate">{it.product_name}</p>
                        <p className="text-[10px] text-gray-400">{it.weight} • Qty: {it.quantity}</p>
                      </div>
                      <span className="font-bold text-[#4A1525]">₹{it.total_price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Delivered to: {ord.city} ({ord.delivery_date})</span>
                  <span className="font-bold text-[#4A1525] text-sm">Total: ₹{ord.total_amount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#F0E6DA]">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h4 className="font-serif text-lg font-bold">Your wishlist is empty</h4>
              <p className="text-xs text-gray-500 mt-1">Tap the heart on any cake to save it for your next celebration.</p>
              <Link
                to="/products"
                className="mt-4 inline-block px-6 py-2 bg-[#4A1525] text-white text-xs font-semibold rounded-full"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
