import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, Heart, ArrowRight, Sparkles, Clock, 
  MessageCircle, X, ChevronRight, CheckCircle2, 
  MapPin, Phone, Mail, Award, Calendar, Users, Coffee, Eye, Check, Sparkle
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import AutoScrollCarousel from '../components/common/AutoScrollCarousel';
import api from '../services/api';
import { MOCK_PRODUCTS } from '../data/mockData';

// High-resolution photography for signature experiences matching Latte Global Cafe
const PHILOSOPHY_OFFERINGS = [
  {
    title: 'SPECIALTY COFFEE',
    tag: 'CRAFTED DAILY',
    desc: '100% Single-Origin Arabica beans, roasted in small batches and precision-brewed.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    link: '/coffee'
  },
  {
    title: 'ARTISAN BAKERY',
    tag: 'FRESH FROM THE OVEN',
    desc: 'Signature multi-layered celebration gateaux, pure Callebaut Belgian cocoa, and flaky crusts.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    link: '#cakes'
  },
  {
    title: 'GLOBAL CUISINE',
    tag: 'CURATED PLATES',
    desc: 'Gourmet cafe savories, buttery sourdough pastries, tartines, and exquisite brunch plates.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cafe-savory'
  },
  {
    title: 'CHOCOLATES',
    tag: 'MADE TO INDULGE',
    desc: 'Single-estate cocoa beans, velvety chocolate confections, and bespoke keepsake trunks.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
    link: '/chocolate'
  }
];

// Exact Auto-Scrolling Showcases matching media_1794506752768.png, media_1794506791952.png, media_1794506810770.png
const CAKES_SHOWCASE = [
  {
    title: 'TROPICAL HARVEST',
    tag: 'Fresh Fruits',
    desc: 'Layered vanilla gateau topped with exotic glazed tropical fruits.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  },
  {
    title: 'SEASONAL SIGNATURE',
    tag: 'Artisan Bespoke',
    desc: 'Handcrafted floral celebration cake with delicate sugar craft figurines.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  },
  {
    title: 'HAZELNUT',
    tag: 'Belgian Truffle',
    desc: 'Dark Callebaut chocolate mousse with roasted Piedmont hazelnut piped curls.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  },
  {
    title: 'CUSTOM CREATION',
    tag: 'Celebration Grand',
    desc: 'Bespoke multi-tiered enchanted castle cake crafted for fairytale memories.',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  },
  {
    title: 'BELGIAN NOIR TRUFFLE',
    tag: 'Callebaut 70%',
    desc: 'Intense dark chocolate ganache, moist cocoa sponge, and gold leaf finish.',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  },
  {
    title: 'LOTUS BISCOFF CRUMBLE',
    tag: 'Caramelized Biscuit',
    desc: 'Silky cream cheese gateau infused with authentic Belgian Biscoff spread.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=cakes'
  }
];

const BOULANGERIE_SHOWCASE = [
  {
    title: 'CROISSANT',
    tag: 'Normandy Butter',
    desc: 'Layered 27-fold lamination with flaky crisp crust and honeycombed crumb.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  },
  {
    title: 'SOURDOUGH',
    tag: '48h Ferment',
    desc: 'Naturally leavened wild yeast country loaf with blistered caramelized crust.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  },
  {
    title: 'BREAD',
    tag: 'Daily Oven',
    desc: 'Fluffy golden brioche loaves and pillowy French milk rolls baked every morning.',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  },
  {
    title: 'ARTISAN LOAF',
    tag: 'Multi-Seed',
    desc: 'Ancient grain batard crusted with toasted flaxseed, sesame, and sunflower seeds.',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  },
  {
    title: 'PAIN AU CHOCOLAT',
    tag: 'French Classic',
    desc: 'Twin batons of pure bittersweet Belgian chocolate baked inside golden viennoiserie.',
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  }
];

const GELATO_SHOWCASE = [
  {
    title: 'LEMON',
    tag: 'Zesty Citrus',
    desc: 'Sun-drenched Sicilian lemons slow-churned into refreshing tart silk.',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  },
  {
    title: 'CHOCOLATE',
    tag: 'Pure Cocoa',
    desc: 'Dense, velvety 64% dark single-origin chocolate gelato with cocoa nibs.',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  },
  {
    title: 'FRENCH VANILLA',
    tag: 'Bourbon Bean',
    desc: 'Infused with Madagascar vanilla caviar and fresh full-cream organic milk.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  },
  {
    title: 'MINT',
    tag: 'Fresh Garden',
    desc: 'Garden spearmint leaves infused into crisp green gelato with chocolate shavings.',
    image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  },
  {
    title: 'ROASTED PISTACHIO',
    tag: 'Sicilian Bronte',
    desc: 'Creamy roasted emerald pistachios from Mount Etna, pure nutty indulgence.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  }
];

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    title: 'The Veloura Dining Salon',
    desc: 'A serene sanctuary of warmth, elegance, and aroma.',
    isLarge: true
  },
  {
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    title: 'Artisan Sourdough & Croissants',
    desc: 'Laminated with pure Normandy butter.'
  },
  {
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    title: 'Classic Tiramisu & Gateau',
    desc: 'Espresso-soaked savoiardi with mascarpone.'
  },
  {
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    title: 'Single-Origin Pour Over',
    desc: 'Floral Ethiopian Yirgacheffe notes.'
  },
  {
    url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    title: 'Parisian Macaron Collection',
    desc: 'Pistachio, salted caramel & dark ganache.'
  }
];

// Signature Dining Salon Tables with capacity, ambience, and real photography
const RESTAURANT_TABLES = [
  {
    id: 'T-01',
    tableNumber: 'Table 01',
    name: 'Salon Window Alcove',
    zone: 'window',
    zoneName: 'Window & Light',
    capacity: '2 Guests',
    guestsValue: '2 Guests',
    tag: 'Couples & Intimate',
    badge: 'Window View',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    description: 'Bathed in warm street-side sunlight with French linen drapery, fresh orchid blooms, and crystal water carafes.',
    perks: ['Panoramic street views', 'Soft acoustic jazz', 'Candlelit evening setting']
  },
  {
    id: 'T-02',
    tableNumber: 'Table 02',
    name: 'Parisian Velvet Booth',
    zone: 'booth',
    zoneName: 'Velvet Booths',
    capacity: '4 Guests',
    guestsValue: '4 Guests',
    tag: 'Signature Experience',
    badge: 'Most Popular',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description: 'Plush burgundy velvet banquette seating with fluted mahogany paneling and brass reading pendants.',
    perks: ['Ultra-plush velvet seating', 'Dedicated table concierge', 'Acoustic privacy alcove']
  },
  {
    id: 'T-03',
    tableNumber: 'Table 03',
    name: 'Sunlit Conservatory Table',
    zone: 'window',
    zoneName: 'Window & Light',
    capacity: '2-4 Guests',
    guestsValue: '3 Guests',
    tag: 'Daylight & Greenery',
    badge: 'Botanical Setting',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    description: 'Surrounded by indoor olive trees and marble planters beneath high glass skylights. Ideal for afternoon high tea.',
    perks: ['Glass skylight canopy', 'Artisan tea service setup', 'Natural photo lighting']
  },
  {
    id: 'T-04',
    tableNumber: 'Table 04',
    name: 'The Imperial Grand Round',
    zone: 'vip',
    zoneName: 'Suites & Celebrations',
    capacity: '6-8 Guests',
    guestsValue: '5+ Guests (Private Area)',
    tag: 'Celebration Table',
    badge: 'Chandelier Suite',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-carved Italian marble round dining table under an oversized Venetian crystal chandelier with cake presentation pedestal.',
    perks: ['Celebration cake stand included', 'Dedicated master sommelier/barista', 'Spacious round seating']
  },
  {
    id: 'T-05',
    tableNumber: 'Table 05',
    name: 'Pâtisserie Courtyard Terrace',
    zone: 'terrace',
    zoneName: 'Courtyard Terrace',
    capacity: '2 Guests',
    guestsValue: '2 Guests',
    tag: 'Open Air Garden',
    badge: 'Alfresco Dining',
    image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80',
    description: 'Open-air Parisian café table framed by jasmine trellises, bistro wicker chairs, and hand-painted tile work.',
    perks: ['Open-air garden breeze', 'Bistro wicker seating', 'Warm fairy light canopy']
  },
  {
    id: 'T-06',
    tableNumber: 'Table 06',
    name: 'Master Roastery Bar Counter',
    zone: 'booth',
    zoneName: 'Velvet Booths',
    capacity: '1-2 Guests',
    guestsValue: '1 Guest',
    tag: 'Coffee Connoisseurs',
    badge: 'Live Brewing View',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
    description: 'Front-row view of our custom Slayer espresso machine and siphon bar. Watch single-origin extractions up close.',
    perks: ['Direct barista interaction', 'Siphon & pour-over showcase', 'Complimentary tasting shots']
  },
  {
    id: 'T-07',
    tableNumber: 'Table 07',
    name: 'Private Royal Celebration Suite',
    zone: 'vip',
    zoneName: 'Suites & Celebrations',
    capacity: '8-12 Guests',
    guestsValue: '5+ Guests (Private Area)',
    tag: 'VIP Private Salon',
    badge: 'Private Room',
    image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
    description: 'Completely private salon room with antique gilded mirrors, bespoke audio controls, and custom floral installations.',
    perks: ['Complete private dining room', 'Personalized menu printing', 'VIP concierge service']
  },
  {
    id: 'T-08',
    tableNumber: 'Table 08',
    name: 'The Heritage Library Alcove',
    zone: 'booth',
    zoneName: 'Velvet Booths',
    capacity: '2-4 Guests',
    guestsValue: '4 Guests',
    tag: 'Quiet Sanctuary',
    badge: 'Book Lovers Corner',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'Surrounded by rare culinary tomes, aged oak bookshelves, warm banker lamps, and butter-soft cognac leather chairs.',
    perks: ['Whisper-quiet acoustic zone', 'Library collection access', 'Leather lounge chairs']
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  // Smooth scroll to hash when navigating e.g. /#cakes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Reservation & Table form state
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const [reservationEmail, setReservationEmail] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [reservationLocation, setReservationLocation] = useState('Veloura Flagship Roastery • Bandra West, Mumbai');
  const [reservationType, setReservationType] = useState('Table Reservation');
  const [reservationGuests, setReservationGuests] = useState('4 Guests');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('T-02');
  const [activeZoneFilter, setActiveZoneFilter] = useState('all');
  const [tableModal, setTableModal] = useState(null);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  const selectedTable = RESTAURANT_TABLES.find((t) => t.id === selectedTableId) || RESTAURANT_TABLES[1];

  const handleSelectTable = (table) => {
    setSelectedTableId(table.id);
    setReservationGuests(table.guestsValue);
    const formEl = document.getElementById('reservation-booking-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Floating Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: 'Bonjour & Welcome to VELOURA. May we help you curate a celebration cake or reserve a table?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching products', err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeCategoryTab === 'all') return true;
    if (activeCategoryTab === 'cakes') return p.category?.slug === 'chocolate-cakes' || p.category?.slug === 'birthday-cakes' || p.category?.slug === 'anniversary-cakes';
    if (activeCategoryTab === 'coffee') return p.category?.slug === 'coffee-brews';
    if (activeCategoryTab === 'pastries') return p.category?.slug === 'pastries' || p.category?.slug === 'cupcakes';
    if (activeCategoryTab === 'savory') return p.category?.slug === 'cafe-savory';
    if (activeCategoryTab === 'hampers') return p.category?.slug === 'gift-hampers';
    return true;
  });

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    const token = 'VL-' + Math.floor(100000 + Math.random() * 900000);
    setConfirmedBookingData({
      token,
      name: reservationName,
      phone: reservationPhone,
      email: reservationEmail,
      date: reservationDate,
      time: reservationTime,
      type: reservationType,
      guests: reservationGuests,
      location: reservationLocation,
      table: selectedTable
    });
    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setReservationName('');
      setReservationPhone('');
      setReservationEmail('');
    }, 12000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { from: 'user', text: userText },
      { from: 'bot', text: 'Thank you! A dedicated celebration concierge is available to assist your order directly at +91 88825 53333, or you can complete checkout online with 2-hour delivery!' }
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-0 pb-16 bg-[#FAF8F5] text-[#2D2020]">
      
      {/* 1. CINEMATIC HERO SECTION (Inspired by Latte Global Cafe Hero) */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-[#1F0A11] text-white overflow-hidden">
        
        {/* Background Image with Dark Luxury Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=2000&q=85"
            alt="Veloura Pâtisserie & Specialty Cafe"
            className="w-full h-full object-cover object-center opacity-45 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A11] via-[#2D0D18]/70 to-[#1F0A11]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20 sm:py-28 space-y-6">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFDFB3] text-xs font-semibold uppercase tracking-[0.25em] shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Welcome to Veloura Pâtisserie & Cafe</span>
          </div>

          {/* Main Title with Serif & Italic Accents */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-sm max-w-4xl mx-auto">
            An Exceptional Journey of <br className="hidden sm:inline" />
            <em className="text-[#F8E7C5] font-serif not-italic italic font-normal">Sweetness & Taste</em>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
            A globally inspired pâtisserie and specialty roastery where world flavours, artisanal craftsmanship, pure Belgian cocoa, and warm hospitality come together beautifully.
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#reservation"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-xl hover:scale-105 transition-all"
            >
              Reserve a Table
            </a>
            <Link
              to="/products"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-lg hover:scale-105 transition-all"
            >
              Explore Collection
            </Link>
          </div>

          {/* Provenance Pills */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/80 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>100% Belgian Callebaut</span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>Single-Origin Arabica</span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>Crafted Fresh Daily</span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>2-Hour Express Delivery</span>
            </div>
          </div>

        </div>

      </section>

      {/* 2. ABOUT US SECTION (Matching Latte Global Cafe's About Grid & Leaf Pattern) */}
      <section className="py-20 sm:py-28 leaf-pattern-light border-b border-[#EFE8DF]" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Editorial Image Arch */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80"
                  alt="Veloura Master Pâtissier at work"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-[#2D2020] shadow-lg border border-[#EFE8DF]">
                  <p className="text-[10px] uppercase tracking-widest text-[#8C6D4C] font-bold">Artisanal Heritage</p>
                  <p className="font-serif text-sm font-bold text-[#3D121A]">Handcrafted with Pure Callebaut Belgian Cocoa</p>
                </div>
              </div>

              {/* Floating accent badge */}
              <div className="absolute -top-4 -right-4 bg-[#3D121A] text-[#FAF5EE] px-5 py-3 rounded-2xl shadow-xl border border-[#C5A059]/40 hidden sm:block">
                <p className="text-xl font-serif font-bold text-[#C5A059]">Est. 2026</p>
                <p className="text-[9px] tracking-wider uppercase opacity-80">European Pâtisserie</p>
              </div>
            </div>

            {/* Right: Copy & Provenance Stats */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
                  About Us
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D121A] leading-tight">
                  A modern global pâtisserie with a refined soul
                </h2>
              </div>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                Inspired by centuries-old European pastry traditions and contemporary cafe culture, our spaces and creations are designed to feel both elevated and approachable: whether you're stopping by for a morning specialty coffee, indulging in afternoon gateaux, gathering with family, or celebrating life's most meaningful milestones.
              </p>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                From globally sourced single-origin Arabica roasts to signature layered chocolate gateaux and buttery Parisian croissants, every single element of Veloura is shaped around one simple idea: creating flavors people love to return to.
              </p>

              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider btn-maroon"
                >
                  <span>Discover More</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </Link>
              </div>

              {/* 3 Stat Boxes matching Latte Global Cafe */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EAE2D5]">
                <div className="space-y-0.5">
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3D121A]">4</span>
                  <p className="text-xs text-gray-600 font-medium">Distinct Formats</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3D121A]">30+</span>
                  <p className="text-xs text-gray-600 font-medium">Global Inspirations</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#3D121A]">100%</span>
                  <p className="text-xs text-gray-600 font-medium">Crafted Fresh Daily</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. SIGNATURE OFFERINGS (Exact Match to Latte Global Cafe Screenshot media_1794505799535.png) */}
      <section className="py-20 sm:py-28 luxury-cream-texture border-b border-[#EAE2D5] relative overflow-hidden" id="experience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header - Exact Typography & Tracking from Screenshot */}
          <div className="text-center max-w-4xl mx-auto mb-14 space-y-3">
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[2.65rem] font-normal tracking-[0.14em] text-[#3D121A] uppercase leading-[1.2]">
              A COLLECTION OF THOUGHTFULLY <br className="hidden sm:inline" />
              CURATED EXPERIENCES
            </h2>
          </div>

          {/* 4 Tall Vertical Cards matching media_1794505799535.png */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHILOSOPHY_OFFERINGS.map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group relative rounded-3xl overflow-hidden shadow-lg border border-[#EFE8DF] aspect-[3/4.2] flex flex-col justify-end p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Image & Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F0A11]/95 via-[#1F0A11]/40 to-transparent" />
                </div>

                {/* Card Content on Overlay */}
                <div className="relative z-10 space-y-1.5 text-white">
                  <p className="text-[#D4AF37] font-semibold text-xs tracking-[0.2em] uppercase">
                    {item.tag}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-white uppercase tracking-[0.08em] group-hover:text-[#F8E7C5] transition-colors word-click">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 font-normal leading-relaxed pt-1">
                    {item.desc}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] group-hover:translate-x-1.5 transition-transform">
                    <span className="uppercase tracking-wider text-[11px]">Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3.1 CAKES AUTO-SCROLLING SHOWCASE (Direct match to media_1794506752768.png) */}
      <AutoScrollCarousel
        id="cakes"
        title="CAKES"
        subtitle="From rich chocolate to Biscoff and seasonal signature flavours, our cakes are designed for celebrations both big and small, with customisation available for special occasions and memorable gatherings."
        items={CAKES_SHOWCASE}
        theme="dark"
        autoScrollSpeed={1.2}
      />

      {/* 3.2 BOULANGERIE AUTO-SCROLLING SHOWCASE (Direct match to media_1794506791952.png) */}
      <AutoScrollCarousel
        id="boulangerie"
        title="BOULANGERIE"
        subtitle="From flaky croissants to freshly baked breads, our boulangerie brings together the warmth, aroma, and simple pleasures of traditional baking."
        items={BOULANGERIE_SHOWCASE}
        theme="dark"
        autoScrollSpeed={1.0}
      />

      {/* 3.3 GELATO AUTO-SCROLLING SHOWCASE (Direct match to media_1794506810770.png) */}
      <AutoScrollCarousel
        id="gelato"
        title="GELATO"
        subtitle="Rich yet refreshing, our gelatos are designed to bring a playful layer of indulgence to the Latte experience, with flavours that feel both comforting and memorable."
        items={GELATO_SHOWCASE}
        theme="light"
        autoScrollSpeed={1.1}
      />

      {/* 4. CURATED MENU SHOWCASE ("Veloura Loves & Seasonal Creations") */}
      <section className="py-20 sm:py-24 leaf-pattern-light border-y border-[#EFE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
                Veloura Catalogue
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D121A] tracking-tight">
                Curated Pâtisserie & Specialty Creations
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Freshly baked each morning using pure Belgian chocolate and dairy butter.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: 'All Creations' },
                { id: 'cakes', label: 'Artisan Cakes' },
                { id: 'coffee', label: '☕ Roastery Coffee' },
                { id: 'pastries', label: '🥐 French Pastries' },
                { id: 'savory', label: 'Bistro Savory' },
                { id: 'hampers', label: 'Gift Hampers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                    activeCategoryTab === tab.id
                      ? 'bg-[#3D121A] text-[#FAF5EE] border border-[#3D121A]'
                      : 'bg-white text-gray-700 hover:text-[#3D121A] border border-[#E8DEC8] hover:border-[#C5A059]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.slice(0, 10).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          {/* View Full Menu CTA */}
          <div className="text-center pt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-outline-maroon text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              <span>Explore Complete 28-Creation Collection</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL VISUAL GALLERY ("A visual taste of our world") */}
      <section className="py-20 sm:py-28 luxury-cream-texture border-b border-[#EAE2D5] relative overflow-hidden" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
              Explore Veloura
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D121A] tracking-tight">
              A visual taste of our <em className="italic font-normal">world</em>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              A glimpse into our signature gateaux, French pastries, single-origin drinks, and thoughtfully designed spaces that define the Veloura experience.
            </p>
          </div>

          {/* Asymmetric Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* 1. Large Feature Tile */}
            <div className="sm:col-span-2 lg:col-span-6 lg:row-span-2 rounded-3xl overflow-hidden shadow-md group relative min-h-[320px] lg:min-h-full">
              <img
                src={GALLERY_IMAGES[0].url}
                alt={GALLERY_IMAGES[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">The Ambiance</p>
                <h4 className="font-serif text-xl sm:text-2xl font-bold">{GALLERY_IMAGES[0].title}</h4>
                <p className="text-xs text-white/80 mt-1">{GALLERY_IMAGES[0].desc}</p>
              </div>
            </div>

            {/* 2. Smaller Tile */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-md group relative aspect-4/3">
              <img
                src={GALLERY_IMAGES[1].url}
                alt={GALLERY_IMAGES[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="font-serif text-base font-bold">{GALLERY_IMAGES[1].title}</h4>
              </div>
            </div>

            {/* 3. Smaller Tile */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-md group relative aspect-4/3">
              <img
                src={GALLERY_IMAGES[2].url}
                alt={GALLERY_IMAGES[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="font-serif text-base font-bold">{GALLERY_IMAGES[2].title}</h4>
              </div>
            </div>

            {/* 4. Smaller Tile */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-md group relative aspect-4/3">
              <img
                src={GALLERY_IMAGES[3].url}
                alt={GALLERY_IMAGES[3].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="font-serif text-base font-bold">{GALLERY_IMAGES[3].title}</h4>
              </div>
            </div>

            {/* 5. Smaller Tile */}
            <div className="lg:col-span-3 rounded-3xl overflow-hidden shadow-md group relative aspect-4/3">
              <img
                src={GALLERY_IMAGES[4].url}
                alt={GALLERY_IMAGES[4].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <h4 className="font-serif text-base font-bold">{GALLERY_IMAGES[4].title}</h4>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. RESERVATION & BESPOKE INQUIRY SECTION (Latte Global Cafe Arch Card Section with Table Selection) */}
      <section className="py-20 sm:py-28 leaf-pattern-light border-t border-[#EFE8DF]" id="reservation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DEC8] text-[#8C6D4C] text-[11px] font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Salon Seating & Ambience</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D121A] leading-tight">
              Select Your Table & Reserve an Experience
            </h2>
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="h-px w-12 bg-[#C5A059]/40" />
              <span className="w-2 h-2 rotate-45 border border-[#C5A059] bg-[#FAF6EE]" />
              <span className="h-px w-12 bg-[#C5A059]/40" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Every table at Veloura offers a distinct sensory mood. Choose your preferred seat from sunlit botanical alcoves to plush velvet booths, and preview its authentic setting before you arrive.
            </p>

            {/* Zone Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: 'all', label: 'All Tables (8)' },
                { id: 'window', label: 'Window & Light' },
                { id: 'booth', label: 'Velvet Booths' },
                { id: 'terrace', label: 'Courtyard Terrace' },
                { id: 'vip', label: 'Suites & Celebrations' }
              ].map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setActiveZoneFilter(zone.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                    activeZoneFilter === zone.id
                      ? 'bg-[#3D121A] text-[#FAF5EE] shadow-md scale-105 border border-[#3D121A]'
                      : 'bg-white/80 hover:bg-white text-gray-700 border border-[#E8DEC8] hover:border-[#C5A059]'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tables Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RESTAURANT_TABLES.filter(t => activeZoneFilter === 'all' || t.zone === activeZoneFilter).map((table) => {
              const isSelected = selectedTableId === table.id;
              return (
                <div
                  key={table.id}
                  className={`group rounded-3xl overflow-hidden bg-white transition-all duration-300 flex flex-col justify-between border ${
                    isSelected
                      ? 'border-[#C5A059] shadow-2xl ring-2 ring-[#C5A059]/30 translate-y-[-4px]'
                      : 'border-[#E8DEC8] hover:border-[#C5A059] shadow-sm hover:shadow-xl'
                  }`}
                >
                  {/* Photo Container with Table Number badge */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <img
                      src={table.image}
                      alt={`${table.tableNumber} - ${table.name}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    {/* Top Left: Table Number Badge */}
                    <div className="absolute top-3 left-3 bg-[#3D121A]/90 backdrop-blur-md text-[#FAF5EE] border border-[#C5A059]/60 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{table.tableNumber}</span>
                    </div>

                    {/* Top Right: Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#3D121A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {table.badge}
                    </div>

                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableModal(table);
                      }}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-[#3D121A] backdrop-blur-md shadow-md transition-transform hover:scale-110 active:scale-95"
                      title="View full setting photo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Capacity Indicator on bottom left */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <Users className="w-3 h-3 text-[#C5A059]" />
                      <span>{table.capacity}</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D4C]">
                          {table.zoneName}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {table.tag}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#3D121A] leading-snug">
                        {table.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {table.description}
                      </p>

                      {/* Perks */}
                      <div className="pt-1 space-y-1">
                        {table.perks.slice(0, 2).map((perk, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            <span className="text-[#C5A059]">✦</span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleSelectTable(table)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#C5A059] text-[#2B0E16] shadow-md hover:bg-[#d6b168]'
                            : 'bg-[#FAF5EE] hover:bg-[#3D121A] text-[#3D121A] hover:text-white border border-[#E8DEC8]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Reserve Seat</span>
                        )}
                      </button>

                      <button
                        onClick={() => setTableModal(table)}
                        className="px-2.5 py-2.5 rounded-xl border border-[#E8DEC8] hover:border-[#C5A059] text-gray-600 hover:text-[#3D121A] bg-white transition"
                        title="Preview table photography"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Form and Locations Grid */}
          <div id="reservation-booking-form" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pt-6 scroll-mt-24">
            
            {/* Left Column: Arch Card with Reservation Form */}
            <div className="lg:col-span-6 bg-[#2B0E16] text-[#FAF5EE] p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-[#431622]">
              
              {/* Subtle gold starry pattern in arch card */}
              <div className="absolute inset-0 bg-[radial-gradient(#C5A059_0.8px,transparent_0.8px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                    Table & Bespoke Booking
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
                    Reserve an Experience
                  </h3>
                  <p className="text-xs text-white/70 mt-1 font-normal leading-relaxed">
                    Plan your visit or let our master chefs prepare a seamless bespoke dining & celebration gateau for you.
                  </p>
                </div>

                {/* Selected Table Preview Banner */}
                {selectedTable && (
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-[#C5A059]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedTable.image}
                        alt={selectedTable.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#C5A059]/50 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                            {selectedTable.tableNumber}
                          </span>
                          <span className="text-[10px] text-white/60">
                            • {selectedTable.capacity}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-white leading-tight">
                          {selectedTable.name}
                        </h4>
                        <p className="text-[10px] text-white/70">{selectedTable.zoneName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('reservation');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] hover:underline shrink-0"
                    >
                      Change Table
                    </button>
                  </div>
                )}

                {reservationSuccess ? (
                  <div className="p-6 rounded-2xl bg-[#3B1520] border border-[#C5A059] text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059] text-[#2B0E16] flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                        Booking Confirmed • Token {confirmedBookingData?.token || 'VL-882190'}
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-white">
                        Table Reserved Successfully!
                      </h4>
                    </div>

                    {confirmedBookingData?.table && (
                      <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3 text-left">
                        <img
                          src={confirmedBookingData.table.image}
                          alt={confirmedBookingData.table.name}
                          className="w-16 h-16 rounded-lg object-cover border border-[#C5A059]/40"
                        />
                        <div className="space-y-0.5 text-xs text-white">
                          <p className="font-bold text-[#C5A059] uppercase text-[10px] tracking-wider">
                            {confirmedBookingData.table.tableNumber} — {confirmedBookingData.table.name}
                          </p>
                          <p className="text-white/80">{confirmedBookingData.date} at {confirmedBookingData.time}</p>
                          <p className="text-white/60 text-[10px]">{confirmedBookingData.guests} • {confirmedBookingData.location}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-white/80 leading-relaxed">
                      Thank you, {reservationName}. Your table has been reserved in our salon system. Our concierge will send your arrival token directly to {reservationPhone || 'your phone'}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReservationSubmit} className="space-y-4">
                    
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={reservationName}
                        onChange={(e) => setReservationName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number (+91)"
                        value={reservationPhone}
                        onChange={(e) => setReservationPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#C5A059]"
                      />
                      <input
                        type="email"
                        placeholder="Email Address (Optional)"
                        value={reservationEmail}
                        onChange={(e) => setReservationEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/70 uppercase tracking-wider">Date</label>
                        <input
                          type="date"
                          required
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/70 uppercase tracking-wider">Time</label>
                        <input
                          type="time"
                          required
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        />
                      </div>
                    </div>

                    {/* Table Select Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/70 uppercase tracking-wider">Reserved Table Setting</label>
                      <select
                        value={selectedTableId}
                        onChange={(e) => {
                          const tbl = RESTAURANT_TABLES.find(t => t.id === e.target.value);
                          if (tbl) {
                            setSelectedTableId(tbl.id);
                            setReservationGuests(tbl.guestsValue);
                          }
                        }}
                        className="w-full px-4 py-3 bg-[#2B0E16] border border-[#C5A059]/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        {RESTAURANT_TABLES.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.tableNumber} — {t.name} ({t.capacity} • {t.zoneName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={reservationType}
                        onChange={(e) => setReservationType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#2B0E16] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option>Table Reservation</option>
                        <option>Wedding Cake Tasting</option>
                        <option>Celebration High Tea</option>
                        <option>Corporate Hamper Inquiries</option>
                      </select>

                      <select
                        value={reservationGuests}
                        onChange={(e) => setReservationGuests(e.target.value)}
                        className="w-full px-4 py-3 bg-[#2B0E16] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option>1 Guest</option>
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4 Guests</option>
                        <option>5+ Guests (Private Area)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={reservationLocation}
                        onChange={(e) => setReservationLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-[#2B0E16] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option>Veloura Flagship Roastery • Bandra West, Mumbai</option>
                        <option>Veloura Pâtisserie & Tea Salon • Indiranagar, Bengaluru</option>
                        <option>Veloura Bistro & Bakehouse • Connaught Place, New Delhi</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl btn-cream font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2"
                    >
                      <span>Reserve {selectedTable?.tableNumber || 'Selected Table'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-white/60 text-center">
                      Reservations are confirmed promptly via WhatsApp. Same-day celebration cake orders can also be placed online with 2-hour delivery.
                    </p>
                  </form>
                )}

              </div>
            </div>

            {/* Right Column: Boutique Contact & Hours */}
            <div className="lg:col-span-6 space-y-8">
              
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
                  Find Us
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#3D121A] leading-tight">
                  Where everyday moments feel elevated
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  Visit Veloura Pâtisserie & Cafe across major metro destinations to experience handcrafted desserts, specialty roastery coffees, and warm hospitality in spaces created for connection.
                </p>
              </div>

              {/* Boutique Locations list */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#3D121A]">Veloura Flagship Roastery</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">Mumbai</span>
                  </div>
                  <p className="text-xs text-gray-600">Turner Road, Bandra West, Mumbai, Maharashtra – 400050</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#3D121A]">Veloura Pâtisserie & Tea Salon</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">Bengaluru</span>
                  </div>
                  <p className="text-xs text-gray-600">100 Feet Road, Indiranagar, Bengaluru, Karnataka – 560038</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#3D121A]">Veloura Bistro & Bakehouse</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">New Delhi</span>
                  </div>
                  <p className="text-xs text-gray-600">Inner Circle, Connaught Place, New Delhi – 110001</p>
                </div>
              </div>

              {/* Operating Hours & Contact */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D4C]">Operating Hours</p>
                  <p className="text-xs font-bold text-gray-900">Monday – Sunday</p>
                  <p className="text-xs text-gray-600">8:00 AM – 11:30 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D4C]">Concierge Desk</p>
                  <p className="text-xs font-bold text-gray-900">+91 88825 53333</p>
                  <p className="text-xs text-gray-600">concierge@veloura.com</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Table Ambiance Photo Modal / Lightbox */}
      {tableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF6EE] max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E8DEC8] flex flex-col relative animate-in zoom-in-95">
            
            {/* Modal Image Header */}
            <div className="relative aspect-16/10 w-full overflow-hidden bg-black">
              <img
                src={tableModal.image}
                alt={tableModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              <button
                onClick={() => setTableModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#C5A059] text-[#2B0E16] text-[10px] font-bold tracking-widest uppercase">
                    {tableModal.tableNumber}
                  </span>
                  <span className="text-xs text-white/80 font-medium">
                    {tableModal.zoneName} • {tableModal.capacity}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  {tableModal.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                {tableModal.description}
              </p>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D4C]">
                  Seating Ambiance & Perks
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tableModal.perks.map((perk, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-[#E8DEC8] text-xs text-gray-800 flex items-center gap-2 shadow-2xs">
                      <span className="text-[#C5A059] font-bold">✦</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#E8DEC8]">
                <button
                  onClick={() => setTableModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8DEC8] hover:bg-gray-100 text-xs font-semibold text-gray-700"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleSelectTable(tableModal);
                    setTableModal(null);
                  }}
                  className="px-6 py-2.5 rounded-xl btn-maroon text-xs font-bold tracking-wider uppercase shadow-lg flex items-center gap-2"
                >
                  <span>Reserve {tableModal.tableNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* 7. FLOATING CONCIERGE CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isChatOpen && (
          <div className="mb-2 bg-white px-3 py-1.5 rounded-2xl shadow-xl border border-[#EFE8DF] text-xs font-semibold text-[#3D121A] flex items-center gap-1.5 animate-bounce">
            <span>Celebration assistance?</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}

        {isChatOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EFE8DF] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#3D121A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C5A059] text-[#2B0E16] flex items-center justify-center font-bold text-xs">
                  V
                </div>
                <div>
                  <h4 className="text-xs font-bold">Veloura Concierge</h4>
                  <p className="text-[10px] text-white/70">Online • Artisanal Bakery Support</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto space-y-3 bg-[#FAF8F5] text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-[#3D121A] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-[#EFE8DF] rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-[#EFE8DF] bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask about flavours, cakes, or slots..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-[#E8DEC8] rounded-xl focus:outline-none focus:border-[#3D121A]"
              />
              <button
                type="submit"
                className="px-4 py-2 btn-maroon text-xs font-bold rounded-xl"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-[#3D121A] hover:bg-[#2B0E16] text-[#C5A059] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 border-2 border-[#C5A059]/40"
          title="Veloura Concierge"
        >
          {isChatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}

