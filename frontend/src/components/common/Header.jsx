import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, User as UserIcon, MapPin, 
  ChevronDown, X, Menu, Shield, LogOut, Package, ArrowRight,
  Clock, Sparkles, Phone, Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const CITIES = [
  { name: 'Hyderabad', pincode: '500033' },
  { name: 'Mumbai', pincode: '400001' },
  { name: 'Bengaluru', pincode: '560001' },
  { name: 'Delhi NCR', pincode: '110001' },
  { name: 'Pune', pincode: '411001' },
  { name: 'Kolkata', pincode: '700001' }
];


// --- BESPOKE LUXURY CATEGORY ICONS ---
function LuxuryCakeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" />
      <path d="M4 16s2-1 4-1 4 1 4 1 2-1 4-1 4 1 4 1" />
      <path d="M2 21h20" />
      <path d="M7 8v2" />
      <path d="M12 8v2" />
      <path d="M17 8v2" />
      <circle cx="7" cy="4" r="1" fill="currentColor" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      <circle cx="17" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

function LuxuryCoffeeIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <path d="M6 2v3" />
      <path d="M10 2v3" />
      <path d="M14 2v3" />
    </svg>
  );
}

function LuxuryCroissantIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 16.5 3-3a7 7 0 0 1 9 0l3 3" />
      <path d="m2 12 3.5 1.5a11 11 0 0 1 13 0L22 12" />
      <path d="M8 8.5C9.5 7 11 6.5 12 6.5s2.5.5 4 2" />
      <path d="M7 16a6 6 0 0 0 10 0" />
    </svg>
  );
}

function LuxuryGelatoIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 13 4.5 8H7.5Z" />
      <path d="M12 3a4 4 0 0 0-4 4c0 1.2.5 2.2 1.3 3" />
      <path d="M12 3a4 4 0 0 1 4 4c0 1.2-.5 2.2-1.3 3" />
      <path d="M7.5 13h9" />
    </svg>
  );
}

function LuxuryCuisineIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v2" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      <path d="M4 17h16" />
      <path d="M4 17a8 8 0 0 1 16 0" />
      <path d="M2 20h20" />
    </svg>
  );
}

function LuxuryChocolateIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <line x1="9" x2="9" y1="5" y2="19" />
      <line x1="15" x2="15" y1="5" y2="19" />
      <line x1="3" x2="21" y1="12" y2="12" />
    </svg>
  );
}

function LuxuryMenuIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const CATEGORY_NAV_ITEMS = [
  {
    label: 'Cakes & Gateaux',
    to: '/#cakes',
    icon: LuxuryCakeIcon,
    isActive: (loc) => loc.hash === '#cakes' || (loc.pathname === '/' && !loc.hash)
  },
  {
    label: 'Specialty Coffee',
    to: '/coffee',
    icon: LuxuryCoffeeIcon,
    isActive: (loc) => loc.pathname === '/coffee'
  },
  {
    label: 'Boulangerie',
    to: '/#boulangerie',
    icon: LuxuryCroissantIcon,
    isActive: (loc) => loc.hash === '#boulangerie'
  },
  {
    label: 'Gelato',
    to: '/#gelato',
    icon: LuxuryGelatoIcon,
    isActive: (loc) => loc.hash === '#gelato'
  },
  {
    label: 'Global Cuisine',
    to: '/products?category=cafe-savory',
    icon: LuxuryCuisineIcon,
    isActive: (loc) => loc.pathname === '/products' && loc.search.includes('category=cafe-savory')
  },
  {
    label: 'Chocolates',
    to: '/chocolate',
    icon: LuxuryChocolateIcon,
    isActive: (loc) => loc.pathname === '/chocolate'
  },
  {
    label: 'Complete Menu',
    to: '/products',
    icon: LuxuryMenuIcon,
    isActive: (loc) => loc.pathname === '/products' && !loc.search
  }
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();

  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('veloura_city') || 'Hyderabad';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [customPincode, setCustomPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Track order modal
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const searchRef = useRef(null);

  // Indulgence dropdown state
  const [isIndulgenceOpen, setIsIndulgenceOpen] = useState(false);
  const indulgenceTimeoutRef = useRef(null);

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
      setPincodeMessage('Delivery confirmed! 2-Hour Express slots available.');
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
      setIsSearchOpenMobile(false);
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
      {/* 1. TOP UTILITY STRIP (High-end hospitality header strip) */}
      <div className="bg-[#2B0E16] text-[#E8DCCB] text-[11px] font-medium py-1.5 px-4 sm:px-8 border-b border-[#431622] relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: City Selection with pin */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[#E8DCCB] hover:text-[#C5A059] transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Delivering to <strong className="text-white underline underline-offset-2">{selectedCity}</strong></span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <span className="hidden md:inline text-white/30">•</span>
            <span className="hidden md:inline text-white/80">
              ⚡ Guaranteed 2-Hour Express Slots & Midnight Deliveries
            </span>
          </div>

          {/* Right: Concierge Phone & Track Order */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="tel:+918882553333" 
              className="hidden sm:inline-flex items-center gap-1.5 text-white/80 hover:text-white transition"
            >
              <Phone className="w-3 h-3 text-[#C5A059]" />
              <span>Concierge: +91 88825 53333</span>
            </a>
            <span className="hidden sm:inline text-white/30">•</span>
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="text-[#E8DCCB] hover:text-[#C5A059] transition font-semibold"
            >
              Track Order
            </button>
            {isAdmin && (
              <>
                <span className="text-white/30">•</span>
                <Link to="/admin" className="text-[#FFD166] hover:underline font-bold inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 2. MAIN LUXURY NAVBAR (Matching Latte Global Cafe aesthetic) */}
      <header className="sticky top-0 z-30 luxury-nav-surface border-b border-[#E8DEC8] shadow-[0_2px_18px_rgba(74,21,37,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#3D121A] hover:bg-[#FAF5EE] rounded-xl lg:hidden transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo: Editorial Cormorant Garamond */}
          <Link to="/" className="flex flex-col items-start group">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-[28px] font-normal tracking-[0.22em] text-[#340C16] group-hover:text-[#4A1525] transition-colors leading-none">
                VELOURA
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059] group-hover:rotate-45 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="text-[8px] sm:text-[8.5px] tracking-[0.32em] uppercase text-[#9E7D46] font-bold mt-1">
              Pâtisserie & Specialty Cafe
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-[11.5px] xl:text-[12px] uppercase tracking-[0.16em] font-semibold text-[#3D121A]">
            
            <Link 
              to="/" 
              className={`nav-word-link word-click transition py-2 relative hover:text-[#280911] ${
                location.pathname === '/' && !location.hash ? 'text-[#3D121A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C5A059]' : ''
              }`}
            >
              Home
            </Link>

            <a 
              href="/#about" 
              className="nav-word-link word-click hover:text-[#280911] transition py-2"
            >
              About
            </a>

            {/* Direct 1-Click Cakes Navigation */}
            <Link 
              to="/#cakes" 
              className={`nav-word-link word-click transition py-2 relative hover:text-[#280911] ${
                location.hash === '#cakes' ? 'text-[#3D121A] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#C5A059]' : ''
              }`}
            >
              Cakes
            </Link>

            {/* Indulgence Dropdown */}
            <div 
              className="relative py-2"
              onMouseEnter={() => {
                if (indulgenceTimeoutRef.current) clearTimeout(indulgenceTimeoutRef.current);
                setIsIndulgenceOpen(true);
              }}
              onMouseLeave={() => {
                indulgenceTimeoutRef.current = setTimeout(() => setIsIndulgenceOpen(false), 200);
              }}
            >
              <button 
                className="flex items-center gap-1 hover:text-[#280911] transition"
                onClick={() => setIsIndulgenceOpen(!isIndulgenceOpen)}
              >
                <span>Indulgence</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-200 ${isIndulgenceOpen ? 'rotate-180' : ''}`} />
              </button>

              {isIndulgenceOpen && (
                <div className="absolute top-full left-0 w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(43,14,22,0.12)] border border-[#C5A059]/30 py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 pb-2 border-b border-[#F4EFEA] mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D4C]">
                      Curated Offerings
                    </span>
                    <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  </div>
                  <Link
                    to="/coffee"
                    onClick={() => setIsIndulgenceOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-[#2D2020] hover:bg-[#FAF5EE] hover:text-[#3D121A] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#C5A059] group-hover:bg-white group-hover:shadow-xs transition">
                        <LuxuryCoffeeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-[12px]">Specialty Coffee</p>
                        <p className="text-[10px] text-gray-500">From Bean to Cup</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/#cakes"
                    onClick={() => setIsIndulgenceOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-[#2D2020] hover:bg-[#FAF5EE] hover:text-[#3D121A] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#C5A059] group-hover:bg-white group-hover:shadow-xs transition">
                        <LuxuryCakeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-[12px]">Artisan Cakes & Gateaux</p>
                        <p className="text-[10px] text-gray-500">Pure Callebaut Truffle</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/#boulangerie"
                    onClick={() => setIsIndulgenceOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-[#2D2020] hover:bg-[#FAF5EE] hover:text-[#3D121A] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#C5A059] group-hover:bg-white group-hover:shadow-xs transition">
                        <LuxuryCroissantIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-[12px]">Boulangerie</p>
                        <p className="text-[10px] text-gray-500">Flaky French Viennoiserie</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/chocolate"
                    onClick={() => setIsIndulgenceOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-[#2D2020] hover:bg-[#FAF5EE] hover:text-[#3D121A] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#C5A059] group-hover:bg-white group-hover:shadow-xs transition">
                        <LuxuryChocolateIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-[12px]">Handcrafted Chocolates</p>
                        <p className="text-[10px] text-gray-500">Single Origin & Trunks</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/products" 
              className={`hover:text-[#280911] transition py-2 ${
                location.pathname === '/products' ? 'text-[#3D121A] font-bold' : ''
              }`}
            >
              Menu
            </Link>

            <a 
              href="/#reservation" 
              className="hover:text-[#280911] transition py-2"
            >
              Reservation
            </a>

            <a 
              href="/#gallery" 
              className="hover:text-[#280911] transition py-2"
            >
              Gallery
            </a>
          </nav>

          {/* Right Action Tools: Search, Bag, User & "Book a Table / Order" */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Input (Desktop) */}
            <div className="relative hidden md:block w-48 xl:w-60" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search gateaux, coffee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                    className="w-full bg-[#FAF6F0]/90 hover:bg-white focus:bg-white text-[#2D2020] text-xs pl-9 pr-3.5 py-2.5 rounded-full border border-[#E3D7C5] focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 placeholder-[#8C7A70] font-medium transition-all shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </form>

              {/* Live Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#EFE8DF] py-2 z-50 overflow-hidden text-gray-800">
                  {isSearching ? (
                    <div className="py-6 text-center text-xs text-gray-500">Searching Veloura menu...</div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Creations ({searchResults.length})
                      </div>
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          to={`/product/${item.slug}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-[#FAF5EE] transition"
                        >
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-[#EFE8DF]" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-[11px] text-[#4A1525] font-bold">₹{item.discount_price || item.base_price}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      ))}
                      <div className="border-t border-[#F4EFEA] mt-1 pt-1 px-4 py-1.5 text-right">
                        <Link 
                          to={`/products?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="text-xs text-[#4A1525] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          View all creations <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-500">
                      No creations found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Button */}
            <button 
              onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
              className="p-2 text-[#3D121A] hover:bg-[#FAF5EE] rounded-full md:hidden transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#3D121A] hover:text-[#250910] hover:bg-[#FAF5EE] rounded-full relative transition-all border border-transparent hover:border-[#E8DEC8]"
              aria-label="Shopping Bag"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#3D121A] to-[#250910] text-[#FFDFB3] border border-[#C5A059]/60 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-[#FAF6F0] hover:bg-white py-1.5 px-3.5 rounded-full transition-all text-xs font-semibold text-[#3D121A] border border-[#E3D7C5] hover:border-[#C5A059] shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#3D121A]/10 text-[#C5A059] flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-[#C5A059]" />
                  </div>
                  <span className="font-semibold max-w-[85px] truncate">{user.full_name?.split(' ')[0] || 'Patron'}</span>
                  <ChevronDown className="w-3 h-3 text-[#8C6D4C] opacity-75" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#3D121A] hover:text-[#4A1525] px-2 py-1.5 transition"
                >
                  <UserIcon className="w-4 h-4 text-[#8C6D4C]" />
                  <span>Login</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#EFE8DF] py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#F4EFEA]">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF5EE] hover:text-[#4A1525] transition"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>My Profile & Orders</span>
                  </Link>

                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#4A1525] font-bold hover:bg-[#FAF5EE] transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>👑 Admin Console & Catalog</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login?tab=admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#8C6D4C] font-bold hover:bg-[#FAF5EE] transition"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Switch to Admin Console</span>
                    </Link>
                  )}

                  <div className="border-t border-[#F4EFEA] mt-1 pt-1">
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

            {/* Primary Action Button: Reserve a Table / Order Now (Latte Global Cafe inspired) */}
            <a
              href="/#reservation"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-[#3D121A] via-[#4D1726] to-[#2B0E16] text-[#FAF5EE] border border-[#C5A059]/70 hover:border-[#C5A059] shadow-[0_3px_14px_rgba(61,18,26,0.18)] hover:shadow-[0_6px_22px_rgba(197,160,89,0.32)] hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>Book a Table</span>
            </a>

          </div>

        </div>

        {/* 3. LUXURY HORIZONTAL CATEGORY MENU BAR WITH 1-CLICK DIRECT NAVIGATION */}
        <nav aria-label="Curated Categories" className="bg-gradient-to-r from-[#F4EEE2] via-[#FAF6EE] to-[#F4EEE2] border-t border-[#E8DEC8] border-b border-[#DFD3C0] px-4 sm:px-8 py-2.5 sm:py-3 overflow-x-auto scrollbar-none shadow-[0_2px_8px_rgba(43,14,22,0.02)]">
          <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 text-xs font-semibold whitespace-nowrap">
            {CATEGORY_NAV_ITEMS.map((item, index) => {
              const active = item.isActive(location);
              const IconComp = item.icon;
              return (
                <React.Fragment key={item.label}>
                  {index > 0 && (
                    <span 
                      className="w-1.5 h-1.5 rotate-45 bg-[#C5A059]/40 mx-1 sm:mx-1.5 flex-shrink-0 transition-opacity" 
                      aria-hidden="true" 
                    />
                  )}
                  <Link
                    to={item.to}
                    className={`nav-word-link word-click group flex items-center gap-2 py-1.5 px-3.5 rounded-full transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-[#3D121A] via-[#4D1726] to-[#340C16] text-[#FFFDF9] border border-[#C5A059]/70 shadow-[0_3px_12px_rgba(61,18,26,0.22)] ring-1 ring-[#C5A059]/25 font-bold'
                        : 'text-[#4A3B34] hover:text-[#280911] hover:bg-white/90 hover:border-[#E5DAC8] border border-transparent shadow-none hover:shadow-2xs font-medium'
                    }`}
                  >
                    <IconComp
                      className={`w-3.5 h-3.5 transition-all duration-300 ${
                        active 
                          ? 'text-[#FFDFB3] scale-110 drop-shadow-[0_1px_3px_rgba(197,160,89,0.5)]' 
                          : 'text-[#9E7D46] group-hover:text-[#C5A059] group-hover:scale-110'
                      }`}
                    />
                    <span className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.14em]">
                      {item.label}
                    </span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Mobile Search Input Drawer */}
        {isSearchOpenMobile && (
          <div className="md:hidden border-t border-[#EFE8DF] bg-[#FAF5EE] px-4 py-2.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search cakes, coffee, pastries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs pl-9 pr-3 py-2 rounded-full border border-[#E8DEC8] focus:outline-none focus:border-[#4A1525]"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}

        {/* Mobile Menu Panel (Matching Latte Global Cafe aside drawer) */}
        {isMobileMenuOpen && (
          <aside className="lg:hidden border-t border-[#EFE8DF] bg-[#FFFDF9] px-6 py-6 space-y-4 shadow-xl">
            <div className="space-y-3 text-sm font-semibold text-[#3D121A]">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 border-b border-[#F4EFEA] word-click"
              >
                Home
              </Link>
              <Link 
                to="/#cakes" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#F4EFEA] text-[#3D121A] font-semibold word-click flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <LuxuryCakeIcon className="w-4 h-4 text-[#C5A059]" />
                  <span>Cakes & Gateaux</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-[#3D121A] text-[#FFDFB3] border border-[#C5A059]/40 px-2 py-0.5 rounded-full font-medium">Signature</span>
              </Link>
              <a 
                href="/#about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 border-b border-[#F4EFEA] word-click"
              >
                About Us
              </a>
              <div className="py-2 border-b border-[#F4EFEA]">
                <p className="text-xs uppercase tracking-widest text-[#8C6D4C] font-bold mb-2">Curated Collections</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <Link to="/#cakes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-semibold">
                    <LuxuryCakeIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Cakes & Gateaux</span>
                  </Link>
                  <Link to="/coffee" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-semibold">
                    <LuxuryCoffeeIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Specialty Coffee</span>
                  </Link>
                  <Link to="/#boulangerie" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-medium">
                    <LuxuryCroissantIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Boulangerie</span>
                  </Link>
                  <Link to="/#gelato" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-medium">
                    <LuxuryGelatoIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Gelato</span>
                  </Link>
                  <Link to="/products?category=cafe-savory" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-medium">
                    <LuxuryCuisineIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Global Cuisine</span>
                  </Link>
                  <Link to="/chocolate" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F2ECE0] text-[#3D121A] border border-[#E8DEC8]/60 font-semibold">
                    <LuxuryChocolateIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Chocolates</span>
                  </Link>
                </div>
              </div>
              <Link 
                to="/products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 border-b border-[#F4EFEA] word-click"
              >
                Menu (All Creations)
              </Link>
              <a 
                href="/#reservation" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 border-b border-[#F4EFEA]"
              >
                Reservation & Bespoke
              </a>
              <a 
                href="/#gallery" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 border-b border-[#F4EFEA]"
              >
                Gallery
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a 
                href="/#reservation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full btn-maroon text-xs font-bold uppercase tracking-wider"
              >
                Reserve a Table
              </a>
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-full btn-cream text-xs font-bold uppercase tracking-wider"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </aside>
        )}
      </header>

      {/* Track Order Modal */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-[#EFE8DF]">
            <button 
              onClick={() => setIsTrackModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-2xl font-bold text-[#3D121A] mb-1">Track Celebration Order</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your order ID (e.g., VEL-2026-89102)</p>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="VEL-2026-XXXXX"
                value={trackOrderNumber}
                onChange={(e) => setTrackOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 text-xs font-mono uppercase tracking-wider border border-[#E8DEC8] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
              <button
                type="submit"
                className="w-full py-2.5 btn-maroon text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Track Live Status
              </button>
            </form>
          </div>
        </div>
      )}

      {/* City & Delivery Pincode Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EFE8DF] relative">
            <button 
              onClick={() => setIsCityModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#4A1525] flex items-center justify-center mx-auto mb-2 border border-[#E8DEC8]">
                <MapPin className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#3D121A]">Select Delivery Destination</h3>
              <p className="text-xs text-gray-500 mt-1">Guaranteed same-day 2-hour express & midnight delivery across metros.</p>
            </div>

            {/* Popular Cities */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-[#8C6D4C] uppercase tracking-wider mb-2">Metro Hubs</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleCitySelect(c)}
                    className="flex flex-col items-start p-2.5 rounded-xl border border-[#EFE8DF] hover:border-[#4A1525] hover:bg-[#FAF5EE] text-left transition"
                  >
                    <span className="text-xs font-bold text-gray-900">{c.name}</span>
                    <span className="text-[10px] text-gray-400">Pincode {c.pincode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pincode Input */}
            <form onSubmit={handleCustomPincodeSubmit} className="pt-2 border-t border-[#F4EFEA]">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Or Enter Your Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400001"
                  value={customPincode}
                  onChange={(e) => setCustomPincode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-[#E8DEC8] rounded-xl focus:outline-none focus:border-[#4A1525]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 btn-maroon text-xs font-bold rounded-xl transition"
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

