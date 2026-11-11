import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ArrowRight, Sparkles, Clock, 
  MessageCircle, X, ChevronRight, CheckCircle2 
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import api from '../services/api';

const MENU_CARDS = [
  {
    title: 'COFFEE',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    slug: 'coffee-brews'
  },
  {
    title: 'CAFE BITES',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    slug: 'cafe-savory'
  },
  {
    title: 'HAMPERS',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    slug: 'gift-hampers'
  },
  {
    title: 'CLASSIC',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    slug: 'chocolate-cakes'
  },
  {
    title: 'BENTO',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
    slug: 'designer-cakes'
  },
  {
    title: 'DESIGNER',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    slug: 'birthday-cakes'
  },
  {
    title: 'DESSERTS',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    slug: 'pastries'
  },
  {
    title: 'CUPCAKES',
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=600&q=80',
    slug: 'cupcakes'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Floating Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Hello! Welcome to VELOURA. How can we make your celebration special today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const res = await api.get('/products');
        setBestsellers(res.data);
      } catch (err) {
        console.error('Error fetching bestsellers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
  }, []);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { from: 'user', text: userText },
      { from: 'bot', text: 'Thank you for reaching out! A celebration concierge is available to assist via WhatsApp at +91 88825 53333 or you can place your order online with express delivery!' }
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-12 pb-20 bg-[#FAF9F8]">
      
      {/* 1. TOP HERO BANNER (Vibrant Bakingo celebration promotional banner) */}
      <section className="relative bg-gradient-to-r from-[#C51132] via-[#E31837] to-[#8C0B21] text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-sm">
        
        {/* Shimmer / light glow background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#FFE082_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <span className="inline-block bg-[#FFD166] text-[#630414] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
              Every Celebration Deserves Something Sweet
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight text-white tracking-tight drop-shadow-sm">
              Artisanal Cakes Handcrafted Fresh Daily
            </h1>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg font-medium">
              Pure Belgian chocolate, zero preservatives, 100% eggless options, and guaranteed 2-hour express delivery.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/products?category=chocolate-cakes"
                className="px-6 py-2.5 bg-white text-[#E31837] hover:bg-[#FFF4F5] text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md transition"
              >
                Order Bestsellers
              </Link>
              <Link
                to="/products?category=designer-cakes"
                className="px-6 py-2.5 bg-[#630414]/60 hover:bg-[#630414] text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/30 backdrop-blur-xs transition"
              >
                Explore Bento Cakes
              </Link>
            </div>
          </div>

          {/* Hero Celebration Imagery */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-video sm:aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
              alt="Veloura Celebration Cake"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-white text-[10px] font-bold">
              ⚡ 2-Hour Delivery in Metro Hubs
            </div>
          </div>
        </div>
      </section>

      {/* 2. "MENU - What will you wish for?" (Exact section matching Screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Section Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E31837] tracking-tight">
            Menu
          </h2>
          <p className="text-sm sm:text-base text-gray-500 font-normal mt-0.5">
            What will you wish for?
          </p>
        </div>

        {/* Garland Lights / Star Garland Decoration Bar */}
        <div className="relative mb-2">
          <div className="h-6 flex items-center justify-around text-[#E6C387] opacity-80 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="text-sm">✦</span>
            ))}
          </div>
        </div>

        {/* Horizontal Row of Rounded Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {MENU_CARDS.map((item) => (
            <Link
              key={item.title}
              to={`/products?category=${item.slug}`}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 group-hover:shadow-xl transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="mt-3 text-xs sm:text-sm font-extrabold tracking-wide text-gray-900 group-hover:text-[#E31837] transition uppercase">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. "⭐ VELOURA LOVES - Bestsellers from across the country" (Exact section matching Screenshot 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Section Heading with Golden Star */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-[#E31837] tracking-tight">
            <span className="text-[#FFD166] text-3xl">★</span>
            <span>Veloura Loves</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Bestsellers from across the country
          </p>
        </div>

        {/* Bestseller Products Grid matching Screenshot 2 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {bestsellers.slice(0, 10).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

        {/* Centered "VIEW ALL" button matching screenshot */}
        <div className="text-center pt-8">
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2D2020] hover:text-[#E31837] underline underline-offset-8 transition"
          >
            VIEW ALL
          </Link>
        </div>
      </section>

      {/* 3b. "☕ VELOURA CAFE & SPECIALTY ROASTERY" - Dedicated showcase for Coffees & Cafe items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-3xl bg-gradient-to-r from-[#2C1810] via-[#3D2314] to-[#1F100A] text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest bg-[#C5A059] text-[#1F100A] px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                <span>☕</span>
                <span>The Veloura Cafe & Specialty Brews</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FFFDF9] tracking-tight">
                Artisan Coffees & Gourmet Cafe Savories
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl">
                Brewed from 100% Arabica Single-Origin Beans, paired with buttery French croissants, truffle sourdough melts, and artisan quiches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/products?category=coffee-brews"
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#1F100A] text-xs font-extrabold uppercase tracking-wider rounded-full transition shadow-sm"
              >
                All Coffees
              </Link>
              <Link
                to="/products?category=cafe-savory"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20 transition"
              >
                Cafe Savories
              </Link>
            </div>
          </div>

          {/* Grid of Cafe & Coffee Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
            {bestsellers
              .filter(p => p.category?.slug === 'coffee-brews' || p.category?.slug === 'cafe-savory')
              .slice(0, 5)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
          </div>
        </div>
      </section>

      {/* 4. Midnight Surprise & Luxury Hampers Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-[#C51132] text-white p-8 flex flex-col justify-between min-h-[220px] shadow-sm">
            <div className="space-y-2 max-w-sm">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFD166] text-[#630414] px-2.5 py-0.5 rounded-full inline-block">
                Midnight Delivery Available
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Surprise Your Loved Ones at 12:00 AM
              </h3>
              <p className="text-xs text-white/90">
                Temperature-controlled delivery right when the celebration begins.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/products?category=birthday-cakes"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-[#C51132] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-[#FFF4F5] transition"
              >
                <span>Book Midnight Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-[#2D0C16] text-white p-8 flex flex-col justify-between min-h-[220px] shadow-sm">
            <div className="space-y-2 max-w-sm">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#E6C387] text-[#2D0C16] px-2.5 py-0.5 rounded-full inline-block">
                Artisanal Hampers
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Celebration Gift Trunks
              </h3>
              <p className="text-xs text-white/90">
                Couture macarons, Belgian walnut brownies, and gourmet chocolates.
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/products?category=gift-hampers"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#E6C387] text-[#2D0C16] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-[#D4AF37] transition"
              >
                <span>Explore Hampers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* 5. FLOATING CONCIERGE CHAT WIDGET (Matching the screenshot's bottom-right button) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Tooltip bubble matching screenshot */}
        {!isChatOpen && (
          <div className="mb-2 bg-white px-3 py-1.5 rounded-2xl shadow-xl border border-gray-100 text-xs font-semibold text-gray-800 flex items-center gap-1.5 animate-bounce">
            <span>Hey, need any help?</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}

        {/* Chat Drawer / Window */}
        {isChatOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#E31837] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  V
                </div>
                <div>
                  <h4 className="text-xs font-bold">Veloura Cake Concierge</h4>
                  <p className="text-[10px] text-white/80">Online • Replies in minutes</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-gray-50 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-[#E31837] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask about delivery, flavours, or custom cakes..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-[#E31837]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#E31837] text-white text-xs font-bold rounded-xl"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Floating Bubble Button matching screenshot's red circle */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-[#E31837] hover:bg-[#C51132] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95"
          title="Customer Support"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        </button>
      </div>

    </div>
  );
}
