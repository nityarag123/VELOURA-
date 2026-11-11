import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, User as UserIcon, MapPin, 
  ChevronDown, X, Menu, Shield, LogOut, Package, ArrowRight,
  Percent, Sparkles, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const CITIES = [
  { name: 'Mumbai', pincode: '400001' },
  { name: 'Delhi NCR', pincode: '110001' },
  { name: 'Bengaluru', pincode: '560001' },
  { name: 'Pune', pincode: '411001' },
  { name: 'Hyderabad', pincode: '500001' },
  { name: 'Kolkata', pincode: '700001' }
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('veloura_city') || 'Mumbai';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [customPincode, setCustomPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Track order modal
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackError, setTrackError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.slice(0, 5));
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    localStorage.setItem('veloura_city', city.name);
    setIsCityModalOpen(false);
    setPincodeMessage('');
  };

  const handleCustomPincodeSubmit = (e) => {
    e.preventDefault();
    if (customPincode.trim().length === 6 && /^\d+$/.test(customPincode.trim())) {
      const text = `Pin ${customPincode.trim()}`;
      setSelectedCity(text);
      localStorage.setItem('veloura_city', text);
      setPincodeMessage('Delivery available! Express 2-hour slot active.');
      setTimeout(() => {
        setIsCityModalOpen(false);
        setPincodeMessage('');
      }, 900);
    } else {
      setPincodeMessage('Please enter a valid 6-digit postal code.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) return;
    setIsTrackModalOpen(false);
    navigate(`/order-confirmation/${trackOrderNumber.trim()}`);
    setTrackOrderNumber('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 shadow-sm">
        
        {/* TOP FESTIVE RED BAR (Bakingo-style vibrant celebration header) */}
        <div className="relative z-30 bg-[#E31837] text-white px-4 sm:px-6 lg:px-8 pt-3 pb-4 border-b border-[#BE122C]">
          
          {/* Subtle starry / fairy background glow */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FFE082_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">
            
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-white hover:bg-white/10 rounded-lg lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo & Delivering To */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/" className="flex items-center gap-1.5 group">
                <span className="font-serif italic text-3xl sm:text-4xl font-extrabold tracking-wide text-white drop-shadow-xs">
                  veloura
                </span>
                <Sparkles className="w-4 h-4 text-[#FFD166] animate-pulse" />
              </Link>

              {/* Location Picker */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/95 hover:text-white transition font-medium bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>Delivering To <strong>{selectedCity}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>

            {/* Wide Search Bar */}
            <div className="relative flex-1 max-w-xl mx-2 hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search For Cakes, Occasion, Flavour And More..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                    className="w-full bg-white text-gray-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFD166] placeholder-gray-400 font-medium"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </form>

              {/* Live Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden text-gray-800">
                  {isSearching ? (
                    <div className="py-6 text-center text-xs text-gray-500">Searching Veloura menu...</div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Products ({searchResults.length})
                      </div>
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          to={`/product/${item.slug}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition"
                        >
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-[11px] text-[#E31837] font-bold">₹{item.discount_price || item.base_price}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-1.5 text-right">
                        <Link 
                          to={`/products?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="text-xs text-[#E31837] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          View all cakes <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-500">
                      No cakes found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Links on Right */}
            <div className="flex items-center gap-4 sm:gap-6 text-white text-xs font-semibold">
              
              {/* Track Order */}
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className="hidden sm:flex flex-col items-center hover:text-[#FFD166] transition group"
              >
                <Percent className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium tracking-tight">Track Order</span>
              </button>

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center hover:text-[#FFD166] transition relative group"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-white text-[#E31837] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                      {totalItemCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight hidden sm:inline">Cart</span>
              </button>

              {/* Login / Signup or User Profile */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 py-1.5 px-3 rounded-full transition text-xs text-white"
                  >
                    <UserIcon className="w-4 h-4 text-[#FFD166]" />
                    <span className="font-semibold max-w-[90px] truncate">{user.full_name?.split(' ')[0] || 'Patron'}</span>
                    <ChevronDown className="w-3 h-3 opacity-80" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex flex-col items-center hover:text-[#FFD166] transition group"
                  >
                    <UserIcon className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-medium tracking-tight">Login/Signup</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-[#E31837] transition"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-[#E31837] transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Order History</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#E31837] font-bold hover:bg-red-50 transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Console & Catalog</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Glowing Garland Lights decoration along bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[radial-gradient(circle,#FFE082_2px,transparent_3px)] [background-size:18px_6px] opacity-80" />
        </div>

        {/* SECONDARY WHITE CATEGORY NAVIGATION BAR */}
        <nav className="bg-white border-b border-gray-200 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-between text-xs font-semibold text-gray-800 py-2.5 overflow-x-auto gap-3 whitespace-nowrap scrollbar-none">
              <li>
                <Link 
                  to="/" 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition text-xs ${
                    location.pathname === '/' 
                      ? 'bg-[#E31837] text-white font-bold shadow-xs' 
                      : 'text-gray-700 hover:text-[#E31837] hover:bg-red-50 font-semibold'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=gift-hampers" className="flex items-center gap-1.5 text-[#E31837] hover:underline font-bold px-2 py-1">
                  <span>🎉 Celebrations</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=chocolate-cakes" className="hover:text-[#E31837] transition">
                  Cakes
                </Link>
              </li>
              <li>
                <Link to="/products?category=coffee-brews" className="flex items-center gap-1 text-[#8C5E3C] hover:text-[#E31837] font-bold transition">
                  <span>☕ Artisan Coffee</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=cafe-savory" className="flex items-center gap-1 text-[#C06014] hover:text-[#E31837] font-bold transition">
                  <span>🥐 Cafe & Savory</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=designer-cakes" className="hover:text-[#E31837] transition">
                  Bento
                </Link>
              </li>
              <li>
                <Link to="/products?category=designer-cakes" className="hover:text-[#E31837] transition">
                  Theme Cakes
                </Link>
              </li>
              <li>
                <Link to="/products?category=anniversary-cakes" className="hover:text-[#E31837] transition">
                  By Relationship
                </Link>
              </li>
              <li>
                <Link to="/products?category=gift-hampers" className="hover:text-[#E31837] transition">
                  Desserts & Hampers
                </Link>
              </li>
              <li>
                <Link to="/products?category=birthday-cakes" className="hover:text-[#E31837] transition">
                  Birthday
                </Link>
              </li>
              <li>
                <Link to="/products?category=designer-cakes" className="hover:text-[#E31837] transition">
                  Customized Cakes
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-500 hover:text-black font-medium flex items-center gap-0.5">
                  <span>View More</span>
                  <ChevronDown className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile Search & Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search cakes, occasion, flavour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-xs px-3 py-2 pl-9 rounded-xl border border-gray-200"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-800">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-red-50 text-[#E31837] font-bold flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">All Items</Link>
              <Link to="/products?category=coffee-brews" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-amber-50 text-[#8C5E3C] font-bold">☕ Artisan Coffee</Link>
              <Link to="/products?category=cafe-savory" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-orange-50 text-[#C06014] font-bold">🥐 Cafe & Savory</Link>
              <Link to="/products?category=birthday-cakes" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Birthday Cakes</Link>
              <Link to="/products?category=chocolate-cakes" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Chocolate</Link>
              <Link to="/products?category=designer-cakes" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Bento Cakes</Link>
              <Link to="/products?category=gift-hampers" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-red-50 text-[#E31837]">Hampers</Link>
              <button 
                onClick={() => {
                  setIsCityModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-gray-50 text-left flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E31837]" />
                <span className="truncate">{selectedCity}</span>
              </button>
            </div>
          </div>
        )}

      </header>

      {/* Track Order Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsTrackModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">Track Celebration Order</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your unique order number (e.g., VEL-2026-89102)</p>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="VEL-2026-XXXXX"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 text-xs font-mono uppercase tracking-wider border rounded-xl focus:outline-none focus:border-[#E31837]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Track Live Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* City & Delivery Pincode Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setIsCityModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 text-[#E31837] flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Select Delivery City</h3>
              <p className="text-xs text-gray-500 mt-1">We offer guaranteed same-day & midnight delivery in major metro cities.</p>
            </div>

            {/* Popular Cities */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Metro Hubs</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleCitySelect(c)}
                    className="flex flex-col items-start p-2.5 rounded-xl border border-gray-200 hover:border-[#E31837] hover:bg-red-50/50 text-left transition"
                  >
                    <span className="text-xs font-bold text-gray-900">{c.name}</span>
                    <span className="text-[10px] text-gray-400">Pincode {c.pincode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pincode Input */}
            <form onSubmit={handleCustomPincodeSubmit} className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Or Enter Your Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400001"
                  value={customPincode}
                  onChange={(e) => setCustomPincode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-[#E31837]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E31837] hover:bg-[#C51132] text-white text-xs font-bold rounded-xl transition"
                >
                  Verify
                </button>
              </div>
              {pincodeMessage && (
                <p className="text-[11px] text-emerald-600 mt-2 font-medium">{pincodeMessage}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
