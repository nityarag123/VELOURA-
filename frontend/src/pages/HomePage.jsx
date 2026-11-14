import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, ArrowRight, Sparkles, Clock, ShieldCheck,
  MessageCircle, X, ChevronLeft, ChevronRight, CheckCircle2, 
  MapPin, Phone, Mail, Award, Calendar, Users, Coffee, 
  Eye, Check, Sparkle, ShoppingBag, Compass, ChevronDown, Quote
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import AutoScrollCarousel from '../components/common/AutoScrollCarousel';
import api from '../services/api';
import { MOCK_PRODUCTS } from '../data/mockData';

// 1. Automatic 4-Slide Luxury Hero Carousel Dataset
const HERO_SLIDES = [
  {
    id: 1,
    category: 'Luxury Chocolate Cakes',
    tag: 'HAUTE CHOCOLATERIE • 70% BELGIAN CALLEBAUT',
    headline: 'Luxury Belgian Chocolate Cakes',
    italicWord: 'Pure Dark Indulgence',
    desc: 'Crafted with 70% pure Callebaut Belgian dark cocoa, silky truffle ganache layers, and delicate 24K edible gold leaf for true chocolate connoisseurs.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Shop Chocolate Cakes',
    buttonLink: '/bakery?category=cakes',
    secondaryButtonText: 'Explore Bakery',
    secondaryButtonLink: '/bakery',
    badge: '70% Callebaut Belgian Ganache'
  },
  {
    id: 2,
    category: 'Strawberry and Fruit Cakes',
    tag: 'FRESH HARVEST • SUMMER BERRY COLLECTION',
    headline: 'Fresh Strawberry & Summer Fruit Cakes',
    italicWord: 'Chantilly Cream Elegance',
    desc: 'Delicate Madagascar vanilla sponge layered with hand-picked strawberries, wild forest raspberries, and light whipped mascarpone chantilly cream.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Shop Fruit Cakes',
    buttonLink: '/bakery?category=cakes',
    secondaryButtonText: 'Explore Bakery',
    secondaryButtonLink: '/bakery',
    badge: 'Farm-Fresh Strawberries & Berries'
  },
  {
    id: 3,
    category: 'French Pastries and Macarons',
    tag: 'PARISIAN BOULANGERIE • HAUTE PÂTISSERIE',
    headline: 'Artisan French Pastries & Macarons',
    italicWord: 'Crisp & Melt-in-Mouth',
    desc: 'Delicate almond meringue macarons with pistachio, salted caramel, and dark chocolate ganache, alongside golden flaky morning viennoiserie.',
    image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Shop French Pastries',
    buttonLink: '/bakery?category=boulangerie',
    secondaryButtonText: 'Desserts & Sweets',
    secondaryButtonLink: '/bakery?category=desserts',
    badge: 'Parisian Macarons & Viennoiserie'
  },
  {
    id: 4,
    category: 'Birthday and Celebration Cakes',
    tag: 'CELEBRATION GRAND • BESPOKE DESIGNS',
    headline: 'Sculpted Celebration & Birthday Gateaux',
    italicWord: 'For Milestone Memories',
    desc: 'Bespoke multi-tiered showstoppers designed to make birthdays, anniversaries, and milestones extraordinary, with 2-hour express delivery across Hyderabad and metros.',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=2000&q=85',
    buttonText: 'Shop Celebration Cakes',
    buttonLink: '/bakery?category=cakes',
    secondaryButtonText: 'Reserve Custom Cake',
    secondaryButtonLink: '/#reservation',
    badge: 'Custom Celebration Tiered Designs'
  }
];

// 2. Signature Collections Dataset (Section 2)
const SIGNATURE_COLLECTIONS = [
  {
    id: 'col-1',
    title: 'Belgian Chocolate Truffles & Gateaux',
    subtitle: '70% Callebaut Dark Cocoa',
    desc: 'Intense cocoa notes, velvety ganache ribbons, and gold leaf finish.',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    link: '/bakery?category=cakes',
    tag: 'Bestseller'
  },
  {
    id: 'col-2',
    title: 'Summer Berry & Chantilly Harvest',
    subtitle: 'Fresh Strawberries & Raspberries',
    desc: 'Madagascar vanilla bean sponge with whipped mascarpone cream.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    link: '/bakery?category=cakes',
    tag: 'Seasonal Harvest'
  },
  {
    id: 'col-3',
    title: 'French Viennoiserie & Macarons',
    subtitle: 'Pure Normandy Butter',
    desc: '72-hour laminated flaky croissants and crisp Parisian macarons.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    link: '/bakery?category=boulangerie',
    tag: 'Baked at 6 AM'
  },
  {
    id: 'col-4',
    title: 'Celebration & Tiered Gateaux',
    subtitle: 'Custom Sugar Craft & Florals',
    desc: 'Grand bespoke centerpieces for milestone birthdays and weddings.',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    link: '/bakery?category=cakes',
    tag: 'Bespoke Orders'
  }
];

// 3. Chef Signature Creations Dataset (Section 8)
const CHEF_SIGNATURES = [
  {
    id: 'cs-1',
    name: 'Royal 24K Belgian Noir Truffle',
    chefTitle: 'Grand Pâtissier Signature',
    notes: '70% Callebaut dark cocoa, sea salt caramel crunch, 24K edible gold leaf',
    price: '₹1,599',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    link: '/product/royal-belgian-truffle-gateau'
  },
  {
    id: 'cs-2',
    name: 'Fleur de Framboise Wild Berry Charlotte',
    chefTitle: 'Parisian Heritage Creation',
    notes: 'Almond sponge, wild raspberry coulis, Madagascar vanilla mousse',
    price: '₹1,449',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    link: '/products'
  },
  {
    id: 'cs-3',
    name: 'Pistache & Dark Ganache Macaron Tower',
    chefTitle: 'Couture Pâtisserie Centerpiece',
    notes: 'Bronte pistachios, salted Normandy butter caramel, dark ganache',
    price: '₹1,899',
    image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    link: '/products?category=pastries'
  }
];

// 4. Testimonials & Press Dataset (Section 10)
const TESTIMONIALS = [
  {
    id: 1,
    quote: "The gold standard of luxury pâtisseries in India. Their Belgian chocolate gateaux rival the finest salons in Paris and Vienna.",
    author: "Vogue Living India",
    designation: "Luxury Dining Feature",
    rating: 5
  },
  {
    id: 2,
    quote: "A sensory sanctuary in Jubilee Hills. Impeccable single-origin coffee rituals, velvet alcoves, and showstopper celebration cakes.",
    author: "Condé Nast Traveler",
    designation: "Top Metro Destination 2026",
    rating: 5
  },
  {
    id: 3,
    quote: "Our bespoke wedding cake from Veloura was breathtaking. Guests are still asking about the raspberry coulis and Belgian dark truffle layers.",
    author: "Ananya & Dr. Kabir Rao",
    designation: "Jubilee Hills, Hyderabad",
    rating: 5
  }
];

// 5. Signature Dining Salon Tables (Section 11)
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

  // Automatic Hero Carousel State (4 Slides, Silk-Smooth Cross-Fade & Timer Reset)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState(true);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState(false);
  const heroTimerRef = useRef(null);

  const resetHeroTimer = () => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    if (isHeroAutoPlaying) {
      heroTimerRef.current = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 5000);
    }
  };

  useEffect(() => {
    resetHeroTimer();
    return () => {
      if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    };
  }, [isHeroAutoPlaying]);

  const handlePrevHeroSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isHeroTransitioning) return;
    setIsHeroTransitioning(true);
    setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    resetHeroTimer();
    setTimeout(() => setIsHeroTransitioning(false), 500);
  };

  const handleNextHeroSlide = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isHeroTransitioning) return;
    setIsHeroTransitioning(true);
    setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    resetHeroTimer();
    setTimeout(() => setIsHeroTransitioning(false), 500);
  };

  const handleGoToHeroSlide = (idx) => {
    if (isHeroTransitioning || idx === currentHeroSlide) return;
    setIsHeroTransitioning(true);
    setCurrentHeroSlide(idx);
    resetHeroTimer();
    setTimeout(() => setIsHeroTransitioning(false), 500);
  };

  // Reservation & Table form state
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const [reservationEmail, setReservationEmail] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [reservationLocation, setReservationLocation] = useState('Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad');
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
    { from: 'bot', text: 'Bonjour & Welcome to VELOURA. May we help you curate a bespoke celebration cake or reserve a salon table?' }
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
    <div className="space-y-0 pb-16 bg-[#FAF6EE] text-[#160B0D]">
      
      {/* ============================================================
          SECTION 1: FULL-WIDTH EDITORIAL HERO CAROUSEL
          ============================================================ */}
      <section 
        className="relative w-full min-h-[85vh] sm:min-h-[90vh] lg:min-h-[92vh] flex items-center justify-center bg-[#15050C] text-white overflow-hidden select-none"
        onMouseEnter={() => setIsHeroAutoPlaying(false)}
        onMouseLeave={() => setIsHeroAutoPlaying(true)}
      >
        {/* Luxury Stacked Cross-Fade Slides - Silk Smooth Transitions without Glitches */}
        <div className="absolute inset-0 w-full h-full">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = currentHeroSlide === idx;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                {/* Background Image with slow Ken-Burns zoom */}
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle Dark Luxury Overlays for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#15050C] via-[#220813]/65 to-[#15050C]/55" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#15050C]/85 via-transparent to-[#15050C]/85" />
                <div className="absolute inset-0 bg-[radial-gradient(#D8B879_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

                {/* Slide Content with upward fade */}
                <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-24 sm:py-32 space-y-6 transition-all duration-700 delay-100 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  
                  {/* Eyebrow Tag */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFDFB3] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#D8B879]" />
                    <span>{slide.tag}</span>
                  </div>

                  {/* Main Premium Headline */}
                  <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.12] drop-shadow-md max-w-4xl mx-auto">
                    {slide.headline} <br className="hidden sm:inline" />
                    <em className="text-[#F8E7C5] font-serif not-italic italic font-normal">
                      {slide.italicWord}
                    </em>
                  </h1>

                  {/* Short Description */}
                  <p className="text-xs sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto font-normal leading-relaxed">
                    {slide.desc}
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <Link
                      to={slide.buttonLink}
                      className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="w-4 h-4 text-[#260D16]" />
                    </Link>

                    <Link
                      to={slide.secondaryButtonLink}
                      className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-lg hover:scale-105 transition-all"
                    >
                      {slide.secondaryButtonText}
                    </Link>
                  </div>

                  {/* Feature Badge */}
                  <div className="pt-4 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-xs border border-white/15 text-[11px] text-[#FAF5EE]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D8B879]" />
                      <span>{slide.badge}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-[#D8B879] font-medium">Guaranteed 2-Hour Express Delivery</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Navigation Arrows (Left & Right) with High Z-Index & Tactile Click */}
        <button
          type="button"
          onClick={handlePrevHeroSlide}
          disabled={isHeroTransitioning}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#160B0D]/75 hover:bg-[#D8B879] text-white hover:text-[#160B0D] backdrop-blur-md border border-[#D8B879]/50 hover:border-[#D8B879] flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={handleNextHeroSlide}
          disabled={isHeroTransitioning}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#160B0D]/75 hover:bg-[#D8B879] text-white hover:text-[#160B0D] backdrop-blur-md border border-[#D8B879]/50 hover:border-[#D8B879] flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 pointer-events-none" />
        </button>

        {/* 4 Small Pagination Dots at Bottom */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-30 flex items-center justify-center gap-2.5">
          {HERO_SLIDES.map((slide, sIdx) => {
            const isSelected = currentHeroSlide === sIdx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleGoToHeroSlide(sIdx)}
                aria-label={`Go to slide ${sIdx + 1}: ${slide.category}`}
                className={`transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                  isSelected
                    ? 'w-8 h-2.5 bg-[#D8B879] shadow-[0_0_12px_rgba(216,184,121,0.8)]'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80 hover:scale-125'
                }`}
                title={slide.category}
              />
            );
          })}
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SIGNATURE COLLECTIONS (Editorial 4-Pillar Showcase)
          ============================================================ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
            The Atelier Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D] leading-tight">
            Curated Expressions of Craft & Flavour
          </h2>
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="h-px w-12 bg-[#D8B879]/50" />
            <span className="w-2 h-2 rotate-45 border border-[#D8B879] bg-[#FAF6EE]" />
            <span className="h-px w-12 bg-[#D8B879]/50" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            From single-estate Belgian chocolate gateaux to delicate morning viennoiserie, every creation is handcrafted daily with noble ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {SIGNATURE_COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={col.link}
              className="group relative rounded-3xl overflow-hidden h-[460px] sm:h-[480px] flex flex-col justify-between p-6 sm:p-7 border border-[#EAE3D5] hover:border-[#D8B879] shadow-sm hover:shadow-2xl transition-all duration-500 bg-[#160B0D]"
            >
              {/* Full-Bleed Background Image (fills 100% of the card, zero white gaps) */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Multi-layer Dark Gradient for Flawless Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#160B0D] via-[#160B0D]/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
              
              {/* Top: Luxury Pill Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-[#160B0D]/80 backdrop-blur-md text-[#D8B879] border border-[#D8B879]/40 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                  {col.tag}
                </span>
                <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-[#D8B879]" />
                </span>
              </div>

              {/* Bottom: Cohesive Balanced Content */}
              <div className="relative z-10 space-y-2 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B879] block">
                  {col.subtitle}
                </span>
                <h3 className="font-serif text-2xl font-bold leading-snug group-hover:text-[#F8E7C5] transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {col.desc}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#D8B879] group-hover:translate-x-1 transition-transform">
                  <span>Explore Selection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 3: BESTSELLING CREATIONS (Dynamic Menu with Tabs & Cards)
          ============================================================ */}
      <section className="py-20 sm:py-28 bg-white border-y border-[#EAE3D5]" id="cakes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
                Master Pâtissier Bestsellers
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D]">
                The Haute Bakery Menu
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-normal">
                Indulge in our most celebrated gateaux, single-origin roasts, and French morning viennoiserie.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'all', label: 'All Menu' },
                { id: 'cakes', label: 'Signature Cakes' },
                { id: 'coffee', label: 'Specialty Coffee' },
                { id: 'pastries', label: 'French Pastries' },
                { id: 'savory', label: 'Cafe Savory' },
                { id: 'hampers', label: 'Gift Hampers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                    activeCategoryTab === tab.id
                      ? 'bg-[#260D16] text-[#FAF5EE] shadow-md border border-[#260D16] scale-105'
                      : 'bg-[#FAF6EE] hover:bg-white text-gray-700 border border-[#EAE3D5] hover:border-[#D8B879]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-cream text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              <span>View Entire Haute Bakery Menu</span>
              <ArrowRight className="w-4 h-4 text-[#260D16]" />
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 4: THE ART OF BELGIAN CHOCOLATE (Inspired by Kāya Chocolat)
          ============================================================ */}
      <section className="py-20 sm:py-28 bg-[#160B0D] text-white relative overflow-hidden" id="chocolate-art">
        <div className="absolute inset-0 bg-[radial-gradient(#D8B879_0.8px,transparent_0.8px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Editorial Chocolate Photography */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 aspect-4/3 relative">
                <img
                  src="https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1200&q=85"
                  alt="Belgian Chocolate Bean to Bar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#260D16]/90 backdrop-blur-md border border-[#D8B879]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#D8B879] font-bold">Terroir Selection</span>
                    <h4 className="font-serif text-base font-bold text-white">70% Callebaut Dark Cocoa</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D8B879] text-[#160B0D] font-bold text-[10px] uppercase tracking-wider">
                    Bean to Bar
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Storytelling & 3 Pillars */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B879]">
                  Bean to Bar • Pure Indulgence
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                  Where Cocoa Becomes <br />
                  <em className="text-[#F8E7C5] font-serif not-italic italic font-normal">An Art Form</em>
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal pt-2">
                  Our master chocolatiers work exclusively with single-origin beans and sustainably sourced Belgian cocoa. Each truffle and gateau is tempered to glass-like sheen, offering a sublime balance of bitter richness and silky sweetness.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 hover:border-[#D8B879]/50 transition">
                  <span className="font-mono text-xs font-bold text-[#D8B879] bg-white/10 px-2 py-1 rounded-md">(01)</span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">Crafted in Micro-Batches</h4>
                    <p className="text-xs text-white/70">Hand-poured ganache ribbons, never mass-produced, ensuring ultimate freshness.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 hover:border-[#D8B879]/50 transition">
                  <span className="font-mono text-xs font-bold text-[#D8B879] bg-white/10 px-2 py-1 rounded-md">(02)</span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">Unexpected Pairings</h4>
                    <p className="text-xs text-white/70">Flaked fleur de sel, roasted Piedmont hazelnuts, and aged single-origin espresso.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 hover:border-[#D8B879]/50 transition">
                  <span className="font-mono text-xs font-bold text-[#D8B879] bg-white/10 px-2 py-1 rounded-md">(03)</span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">Single-Estate Purity</h4>
                    <p className="text-xs text-white/70">100% pure cocoa butter, zero artificial emulsifiers or compound fats.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/chocolate"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-cream text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all"
                >
                  <span>Explore Chocolatier Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#260D16]" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: FRENCH PÂTISSERIE & BOULANGERIE COLLECTION
          ============================================================ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="boulangerie">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
            Parisian Baking Rituals
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D]">
            French Pâtisserie & Viennoiserie
          </h2>
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="h-px w-12 bg-[#D8B879]/50" />
            <span className="w-2 h-2 rotate-45 border border-[#D8B879] bg-[#FAF6EE]" />
            <span className="h-px w-12 bg-[#D8B879]/50" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            Laminated over 72 hours with pure cultured Normandy butter. Ultra-crisp exterior with a warm, melt-in-your-mouth honeycomb crumb.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group rounded-3xl overflow-hidden bg-white border border-[#EAE3D5] hover:border-[#D8B879] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
                alt="Normandy Butter Croissants"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#260D16]">
                Baked at 6:00 AM
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#160B0D]">Artisan Butter Croissants</h3>
              <p className="text-xs text-gray-600 leading-relaxed">72-hour slow fermentation with AOP Charentes-Poitou French butter.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-extrabold text-[#260D16]">₹180</span>
                <Link to="/products?category=pastries" className="text-xs font-bold text-[#9E7D46] hover:underline flex items-center gap-1">
                  Order Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden bg-white border border-[#EAE3D5] hover:border-[#D8B879] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80"
                alt="Parisian Macaron Collection"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#260D16]">
                Pure Almond Meringue
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#160B0D]">Parisian Macaron Box (8 Pcs)</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Sicilian pistachio, salted butter caramel, dark ganache & rose coulis.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-extrabold text-[#260D16]">₹890</span>
                <Link to="/products?category=pastries" className="text-xs font-bold text-[#9E7D46] hover:underline flex items-center gap-1">
                  Order Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden bg-white border border-[#EAE3D5] hover:border-[#D8B879] shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="relative aspect-4/3 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                alt="Classic Pain au Chocolat"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#260D16]">
                Double Callebaut Bar
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#160B0D]">Traditional Pain au Chocolat</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Enclosed with two batons of 55% Belgian semi-sweet dark chocolate.</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-extrabold text-[#260D16]">₹220</span>
                <Link to="/products?category=pastries" className="text-xs font-bold text-[#9E7D46] hover:underline flex items-center gap-1">
                  Order Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: SPECIALTY COFFEE EXPERIENCE
          ============================================================ */}
      <section className="py-20 sm:py-28 bg-[#260D16] text-white relative overflow-hidden" id="coffee">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B879]">
                  Single-Origin Arabica • Slayer Extraction
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                  The Specialty Coffee Ritual
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal pt-2">
                  Every extraction at Veloura is calibrated to order. We roast micro-lots from high-altitude estates in Chikmagalur and Ethiopia, coaxing delicate floral notes, juicy stone fruit acidity, and deep chocolate undertones.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B879]">Equipment</span>
                  <h4 className="font-serif text-base font-bold text-white">Custom Slayer Espresso Bar</h4>
                  <p className="text-[11px] text-white/70">Flow-rate profiling for unmatched silkiness.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8B879]">Pour Over</span>
                  <h4 className="font-serif text-base font-bold text-white">Hario V60 & Siphon</h4>
                  <p className="text-[11px] text-white/70">Crystal-clear clarity of single-origin beans.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/coffee"
                  className="px-8 py-3.5 rounded-full btn-cream text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <span>Discover Coffee Menu</span>
                  <ArrowRight className="w-4 h-4 text-[#260D16]" />
                </Link>
                <a
                  href="#reservation"
                  className="px-6 py-3.5 rounded-full btn-outline-light text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all"
                >
                  Reserve Tasting Bar
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 aspect-4/3 relative">
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85"
                  alt="Specialty Coffee Pour Over Bar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#160B0D]/90 backdrop-blur-md border border-[#D8B879]/40 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#D8B879] font-bold">Single-Origin Roast</span>
                    <h4 className="font-serif text-base font-bold">Ethiopian Yirgacheffe G1</h4>
                  </div>
                  <span className="text-xs text-[#D8B879] font-bold">Jasmine & Bergamot</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: ABOUT VELOURA ("Where Dessert Becomes Ritual")
          ============================================================ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="about">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white aspect-4/5">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                alt="Veloura Dining Salon Ambience"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-[#160B0D] shadow-lg border border-[#EAE3D5]">
                <p className="text-[10px] uppercase tracking-widest text-[#9E7D46] font-bold">Atelier Philosophy</p>
                <p className="font-serif text-sm font-bold text-[#260D16]">Where Slow Craftsmanship Becomes Sacred Ritual</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
                Our Philosophy & Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D] leading-tight">
                Where Dessert <br />
                <em className="text-[#9E7D46] font-serif not-italic italic font-normal">Becomes Ritual</em>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              A boutique studio of plated desserts, ceremonial teas, and French pâtisserie — where slow craftsmanship, noble ingredients, and the warm nostalgia of European dining salons are reinterpreted through an editorial lens.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Established with an unyielding dedication to purity, every creation is baked daily in small batches with cultured Normandy butter, Callebaut Belgian cocoa, and farm-fresh harvest berries. We never cut corners with premixes or synthetic essences.
            </p>

            {/* 4 Pillars of Excellence */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D5] space-y-1">
                <span className="text-[#D8B879] font-bold">✦</span>
                <h4 className="font-serif text-sm font-bold text-[#160B0D]">100% Belgian Callebaut</h4>
                <p className="text-[11px] text-gray-500">Pure cocoa butter without compound adulteration.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D5] space-y-1">
                <span className="text-[#D8B879] font-bold">✦</span>
                <h4 className="font-serif text-sm font-bold text-[#160B0D]">Baked at 6:00 AM Daily</h4>
                <p className="text-[11px] text-gray-500">Every croissant and gateau is fresh out of deck ovens.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D5] space-y-1">
                <span className="text-[#D8B879] font-bold">✦</span>
                <h4 className="font-serif text-sm font-bold text-[#160B0D]">2-Hour Express Delivery</h4>
                <p className="text-[11px] text-gray-500">Temperature-controlled keepsake boxes to your door.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EAE3D5] space-y-1">
                <span className="text-[#D8B879] font-bold">✦</span>
                <h4 className="font-serif text-sm font-bold text-[#160B0D]">Hyderabad Main Flagship</h4>
                <p className="text-[11px] text-gray-500">Grand Reserve Salon on Road No. 36, Jubilee Hills.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 8: CHEF'S SIGNATURE CREATIONS
          ============================================================ */}
      <section className="py-20 sm:py-28 bg-white border-y border-[#EAE3D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
              Master Chef's Reserve
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D]">
              Chef's Signature Creations
            </h2>
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="h-px w-12 bg-[#D8B879]/50" />
              <span className="w-2 h-2 rotate-45 border border-[#D8B879] bg-white" />
              <span className="h-px w-12 bg-[#D8B879]/50" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-normal">
              Limited-edition haute pâtisserie showpieces crafted by our executive master pâtissier for life’s most momentous milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CHEF_SIGNATURES.map((sig) => (
              <div 
                key={sig.id}
                className="group rounded-3xl overflow-hidden bg-[#FAF6EE] border border-[#EAE3D5] hover:border-[#D8B879] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-black/10">
                  <img
                    src={sig.image}
                    alt={sig.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 bg-[#260D16] text-[#D8B879] text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {sig.chefTitle}
                  </span>
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xl font-bold text-[#160B0D] group-hover:text-[#260D16] transition-colors">
                      {sig.name}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      {sig.notes}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#EAE3D5] flex items-center justify-between">
                    <span className="font-serif font-extrabold text-xl text-[#260D16]">{sig.price}</span>
                    <Link
                      to={sig.link}
                      className="px-4 py-2 rounded-full btn-maroon text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3 h-3 text-[#D8B879]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 9: SEASONAL HARVEST & LUXURY GIFT HAMPERS
          ============================================================ */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Summer Berry Collection */}
          <div className="rounded-3xl overflow-hidden bg-[#260D16] text-white p-8 sm:p-12 relative flex flex-col justify-between min-h-[360px] border border-[#3D1422] shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80"
              alt="Fresh Summer Berry Harvest"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#260D16] via-[#260D16]/60 to-transparent" />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B879] bg-white/10 px-3 py-1 rounded-full">
                Seasonal Harvest Edition
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Summer Strawberry & Berry Gateaux
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-md">
                Hand-harvested sweet strawberries from Mahabaleshwar estates, layered with Madagascar vanilla and mascarpone cream.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-cream text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                <span>Shop Berry Harvest</span>
                <ArrowRight className="w-4 h-4 text-[#260D16]" />
              </Link>
            </div>
          </div>

          {/* Card 2: Couture Keepsake Hampers */}
          <div className="rounded-3xl overflow-hidden bg-[#160B0D] text-white p-8 sm:p-12 relative flex flex-col justify-between min-h-[360px] border border-white/10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury Velvet Keepsake Hampers"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#160B0D] via-[#160B0D]/60 to-transparent" />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B879] bg-white/10 px-3 py-1 rounded-full">
                Couture Keepsake Trunks
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Veloura Celebration Trunks & Hampers
              </h3>
              <p className="text-xs sm:text-sm text-white/80 max-w-md">
                Bespoke burgundy velvet trunks packed with Belgian chocolate truffles, French macarons, single-origin roasts, and artisanal preserves.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                to="/products?category=gift-hampers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full btn-outline-light text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                <span>Curate A Gift Trunk</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 10: CUSTOMER TESTIMONIALS & PRESS MENTIONS
          ============================================================ */}
      <section className="py-20 sm:py-28 bg-[#FAF6EE] border-t border-[#EAE3D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
              Press & Patron Accolades
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D]">
              Celebrated by Connoisseurs
            </h2>
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="h-px w-12 bg-[#D8B879]/50" />
              <span className="w-2 h-2 rotate-45 border border-[#D8B879] bg-[#FAF6EE]" />
              <span className="h-px w-12 bg-[#D8B879]/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="p-8 rounded-3xl bg-white border border-[#EAE3D5] shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#D8B879]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#D8B879]/50" />
                  <p className="text-xs sm:text-sm text-gray-700 font-serif italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-[#F2ECE1]">
                  <h4 className="font-serif text-base font-bold text-[#160B0D]">{t.author}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{t.designation}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 11: SALON SEATING & INTERACTIVE TABLE SELECTION
          ============================================================ */}
      <section className="py-20 sm:py-28 leaf-pattern-light border-t border-[#EFE8DF]" id="reservation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EE] border border-[#E8DEC8] text-[#8C6D4C] text-[11px] font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Salon Seating & Ambience</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D] leading-tight">
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
                      ? 'bg-[#260D16] text-[#FAF5EE] shadow-md scale-105 border border-[#260D16]'
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
                    <div className="absolute top-3 left-3 bg-[#260D16]/90 backdrop-blur-md text-[#FAF5EE] border border-[#C5A059]/60 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{table.tableNumber}</span>
                    </div>

                    {/* Top Right: Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#260D16] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {table.badge}
                    </div>

                    {/* Quick View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableModal(table);
                      }}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-[#260D16] backdrop-blur-md shadow-md transition-transform hover:scale-110 active:scale-95"
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
                      <h3 className="font-serif text-lg font-bold text-[#160B0D] leading-snug">
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
                            : 'bg-[#FAF5EE] hover:bg-[#260D16] text-[#260D16] hover:text-white border border-[#E8DEC8]'
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
                        className="px-2.5 py-2.5 rounded-xl border border-[#E8DEC8] hover:border-[#C5A059] text-gray-600 hover:text-[#260D16] bg-white transition"
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
            <div className="lg:col-span-6 bg-[#160B0D] text-[#FAF5EE] p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-[#260D16]">
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
                  <div className="p-6 rounded-2xl bg-[#260D16] border border-[#C5A059] text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 rounded-full bg-[#C5A059] text-[#160B0D] flex items-center justify-center mx-auto font-bold text-xl shadow-lg">
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
                        className="w-full px-4 py-3 bg-[#160B0D] border border-[#C5A059]/40 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
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
                        className="w-full px-4 py-3 bg-[#160B0D] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option>Table Reservation</option>
                        <option>Wedding Cake Tasting</option>
                        <option>Celebration High Tea</option>
                        <option>Corporate Hamper Inquiries</option>
                      </select>

                      <select
                        value={reservationGuests}
                        onChange={(e) => setReservationGuests(e.target.value)}
                        className="w-full px-4 py-3 bg-[#160B0D] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
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
                        className="w-full px-4 py-3 bg-[#160B0D] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        <option>Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad</option>
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
                      <ArrowRight className="w-4 h-4 text-[#260D16]" />
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
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
                  Find Us
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#160B0D] leading-tight">
                  Where everyday moments feel elevated
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  Visit Veloura Pâtisserie & Cafe across major metro destinations to experience handcrafted desserts, specialty roastery coffees, and warm hospitality in spaces created for connection.
                </p>
              </div>

              {/* Boutique Locations list */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border-2 border-[#C5A059]/70 shadow-md space-y-1 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h5 className="font-serif font-bold text-base text-[#160B0D]">Veloura Grand Reserve Salon & Roastery</h5>
                    </div>
                    <span className="text-[10px] font-bold text-[#160B0D] uppercase tracking-wider bg-[#C5A059] text-white px-2.5 py-0.5 rounded-full shadow-2xs">Hyderabad • Main Flagship</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Road No. 36, Jubilee Hills, Hyderabad, Telangana – 500033</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#160B0D]">Veloura Flagship Roastery</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">Mumbai</span>
                  </div>
                  <p className="text-xs text-gray-600">Turner Road, Bandra West, Mumbai, Maharashtra – 400050</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#160B0D]">Veloura Pâtisserie & Tea Salon</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">Bengaluru</span>
                  </div>
                  <p className="text-xs text-gray-600">100 Feet Road, Indiranagar, Bengaluru, Karnataka – 560038</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-base text-[#160B0D]">Veloura Bistro & Bakehouse</h5>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#FAF5EE] px-2 py-0.5 rounded-full">New Delhi</span>
                  </div>
                  <p className="text-xs text-gray-600">Inner Circle, Connaught Place, New Delhi – 110001</p>
                </div>
              </div>

              {/* Operating Hours & Contact */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E7D46]">Operating Hours</p>
                  <p className="text-xs font-bold text-gray-900">Monday – Sunday</p>
                  <p className="text-xs text-gray-600">8:00 AM – 11:30 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E7D46]">Concierge Desk</p>
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

      {/* Floating Concierge Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isChatOpen && (
          <div className="mb-2 bg-white px-3 py-1.5 rounded-2xl shadow-xl border border-[#EFE8DF] text-xs font-semibold text-[#160B0D] flex items-center gap-1.5 animate-bounce">
            <span>Celebration assistance?</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}

        {isChatOpen && (
          <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EFE8DF] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="bg-[#160B0D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D8B879] text-[#160B0D] flex items-center justify-center font-bold text-xs">
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
                        ? 'bg-[#260D16] text-white rounded-br-none'
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
                className="flex-1 px-3 py-2 text-xs border border-[#E8DEC8] rounded-xl focus:outline-none focus:border-[#260D16]"
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
          className="w-14 h-14 rounded-full bg-[#160B0D] hover:bg-[#260D16] text-[#D8B879] flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 border-2 border-[#D8B879]/40"
          title="Veloura Concierge"
        >
          {isChatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}
