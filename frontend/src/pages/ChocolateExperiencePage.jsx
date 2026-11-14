import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Heart, ArrowRight, CheckCircle2, 
  ShoppingBag, Gift, Award, Star, Droplets,
  Compass, Flame, ShieldCheck, Thermometer, Eye, Volume2, Wind, Smile
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CHOCOLATE_PRODUCTS = [
  {
    id: 'choc-bar-dark',
    name: 'Single-Origin 70% Dark Chocolate Bar',
    category: 'Chocolate Bars',
    price: 299,
    rating: 4.95,
    origin: 'Madagascar Sambirano Valley',
    cocoa: '70% Pure Criollo',
    desc: 'Pure Callebaut Belgian dark chocolate with roasted cocoa nibs, red berry notes, and edible 24k gold leaf.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tag: 'Single Origin'
  },
  {
    id: 'choc-truffle-box',
    name: 'Artisanal Belgian Truffles & Pralines (12 Pcs)',
    category: 'Artisanal Chocolates',
    price: 699,
    rating: 4.98,
    origin: 'Belgian Craftsmanship',
    cocoa: 'Assorted 54% - 72%',
    desc: 'Handcrafted ballotin of sea-salt Fleur de Sel caramel, roasted Piedmont hazelnut gianduja, and espresso ganache.',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    tag: 'Bestseller'
  },
  {
    id: 'choc-spread-hazelnut',
    name: 'Roasted Hazelnut & Dark Cocoa Spread (250g)',
    category: 'Chocolate Spreads',
    price: 349,
    rating: 4.93,
    origin: 'Piedmont IGP Hazelnuts',
    cocoa: '45% Hazelnuts + 60% Cocoa',
    desc: '48-hour stone-ground Italian hazelnuts blended with pure Callebaut cocoa and bourbon vanilla. 100% palm-oil free.',
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    tag: 'Artisan Pantry'
  },
  {
    id: 'choc-bar-milk',
    name: 'Madagascar Milk Chocolate with Roasted Almonds',
    category: 'Chocolate Bars',
    price: 289,
    rating: 4.89,
    origin: 'Madagascar Cocoa',
    cocoa: '38% Creamy Milk',
    desc: 'Silky 38% milk chocolate infused with caramelized Californian almonds, sea salt flakes, and floral honey.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
    tag: 'Creamy Classic'
  },
  {
    id: 'choc-ruby-bark',
    name: 'Ruby Chocolate & Freeze-Dried Raspberry Bark',
    category: 'Artisanal Chocolates',
    price: 329,
    rating: 4.91,
    origin: 'Ruby Cocoa Beans',
    cocoa: '34% Natural Ruby Cocoa',
    desc: 'Naturally pink Ruby cocoa bark studded with tart freeze-dried raspberries, roasted pistachio slivers, and rose petals.',
    image: 'https://images.unsplash.com/photo-1575372587186-500b396791e8?auto=format&fit=crop&w=800&q=80',
    tag: 'Exotic Creation'
  },
  {
    id: 'choc-gift-trunk',
    name: 'The Veloura Grand Keepsake Chocolate Trunk',
    category: 'Gifting Collection',
    price: 1799,
    rating: 4.99,
    origin: 'Couture Hamper Collection',
    cocoa: 'Complete Grand Cru Curation',
    desc: 'Silk-lined royal keepsake trunk with 2 single-origin bars, 12 luxury bonbons, and 1 jar of stone-ground spread.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    tag: 'Grand Luxury'
  }
];

const COCOA_PERCENTAGES = [
  {
    pct: '85%',
    name: 'Noir Grand Cru',
    notes: 'Smoky oak, roasted cacao nibs, espresso crema',
    roast: 'Dark Roast',
    bestFor: 'Chocolate purists & neat espresso pairings',
    color: 'from-amber-950 to-stone-900'
  },
  {
    pct: '70%',
    name: 'Single Origin Terroir',
    notes: 'Sun-dried cherries, toasted brioche, bourbon vanilla',
    roast: 'Medium Roast',
    bestFor: 'Signature daily indulgence & wine pairings',
    color: 'from-amber-900 to-amber-950'
  },
  {
    pct: '54%',
    name: 'Dark Velvet Confection',
    notes: 'Sweet fudge, warm cinnamon, roasted almonds',
    roast: 'Gentle Roast',
    bestFor: 'Pastry coatings, truffles & hot chocolate',
    color: 'from-yellow-950 to-amber-900'
  },
  {
    pct: '38%',
    name: 'Madagascar Alpine Milk',
    notes: 'Golden caramel, clotted cream, wild wildflower honey',
    roast: 'Light Roast',
    bestFor: 'Comforting sweetness & afternoon tea',
    color: 'from-amber-800 to-yellow-900'
  },
  {
    pct: '34%',
    name: 'Ruby Botanical',
    notes: 'Crisp raspberry acidity, tart pomegranate, floral lift',
    roast: 'Unfermented Ruby',
    bestFor: 'Champagne pairings & fruit desserts',
    color: 'from-rose-900 to-pink-950'
  }
];

const TASTING_STEPS = [
  {
    num: '01',
    step: 'Look (Mirror Gloss)',
    icon: Eye,
    detail: 'Inspect the surface under light. A flawless satin gloss indicates perfect temper and beta-crystal alignment.'
  },
  {
    num: '02',
    step: 'Snap (The Acoustic Test)',
    icon: Volume2,
    detail: 'Break a piece near your ear. A clean, musical crack signals high-purity cocoa butter and absence of palm oil.'
  },
  {
    num: '03',
    step: 'Aroma (Terroir Scent)',
    icon: Wind,
    detail: 'Warm the chocolate between your thumb and finger. Breathe in to detect top notes of red fruit, toast, or florals.'
  },
  {
    num: '04',
    step: 'Melt (36°C Body Dissolution)',
    icon: Thermometer,
    detail: 'Rest on the tongue without chewing. Pure cocoa butter melts precisely at human body temperature (36°C).'
  },
  {
    num: '05',
    step: 'Finish (The Lingering Note)',
    icon: Smile,
    detail: 'Notice how the cocoa flavors evolve. A fine artisanal chocolate leaves a resonant, clean finish for up to 5 minutes.'
  }
];

export default function ChocolateExperiencePage() {
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCocoaIndex, setSelectedCocoaIndex] = useState(1);

  const handleQuickAdd = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      base_price: item.price,
      discount_price: item.price,
      image_url: item.image,
      slug: item.id
    }, 1);
    setToastMessage(`Added "${item.name}" to order!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="bg-[#D8C7B5] text-[#2D2020] min-h-screen luxury-cream-texture">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3D121A] text-[#FAF5EE] px-5 py-3 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. CINEMATIC HERO SECTION (Matching latteglobalcafe.com/chocolate) */}
      <section className="relative min-h-[75vh] sm:min-h-[82vh] flex items-center justify-center bg-[#1D060E] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=2000&q=85"
            alt="Veloura Handcrafted Chocolates"
            className="w-full h-full object-cover opacity-35 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1D060E] via-[#2F0B15]/80 to-[#1D060E]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:26px_26px] opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20 space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFDFB3] text-xs font-semibold uppercase tracking-[0.25em]">
            Veloura Pâtisserie & Chocolaterie
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.1]">
            Artisanal Chocolate Experience
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
            From single-origin bean fermentation in Ghana and Madagascar to 72-hour stone-ground conching in Belgium. Handcrafted truffles, single-estate bars, and couture gift trunks crafted for true connoisseurs.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#collection"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-xl hover:scale-105 transition-all"
            >
              Explore Collection
            </a>
            <a
              href="#chocolate-info"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/10 border border-[#C5A059]/60 text-[#FFDFB3] hover:bg-white/20 transition-all shadow-lg"
            >
              Chocolate Tasting Guide
            </a>
            <a
              href="#menu"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-lg hover:scale-105 transition-all"
            >
              Order Chocolate Creations
            </a>
          </div>
        </div>
      </section>

      {/* 2. INTRO SECTION WITH 4 HIGHLIGHT PILLARS */}
      <section className="py-20 sm:py-24 leaf-pattern-light border-b border-[#EFE8DF]" id="collection">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
            Single-Origin Terroir & Purity
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#3D121A] leading-tight">
            The Art of Bean-to-Bar Craftsmanship
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal max-w-3xl mx-auto">
            We work exclusively with ethical, single-estate criollo and trinitario cocoa beans, celebrated for their terroir, microclimate, and distinct aromatic spectrum. Every creation is tempered with meticulous precision to deliver a musical snap, a satiny melt, and deep aromatic complexity.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 text-left">
            <div className="bg-white/80 p-5 rounded-2xl border border-[#C4B19F] shadow-xs hover:border-[#C5A059] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#3D121A]/5 flex items-center justify-center text-[#C5A059] mb-3">
                <Droplets className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-sm font-semibold text-[#3D121A]">100% Pure Cocoa Butter</h4>
              <p className="text-xs text-gray-600 mt-1">Zero hydrogenated vegetable oils, zero palm oil, and zero synthetic emulsifiers.</p>
            </div>

            <div className="bg-white/80 p-5 rounded-2xl border border-[#C4B19F] shadow-xs hover:border-[#C5A059] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#3D121A]/5 flex items-center justify-center text-[#C5A059] mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-sm font-semibold text-[#3D121A]">Single-Origin Beans</h4>
              <p className="text-xs text-gray-600 mt-1">Traceable criollo cacao from Madagascar Sambirano and Ghanaian estate farms.</p>
            </div>

            <div className="bg-white/80 p-5 rounded-2xl border border-[#C4B19F] shadow-xs hover:border-[#C5A059] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#3D121A]/5 flex items-center justify-center text-[#C5A059] mb-3">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-sm font-semibold text-[#3D121A]">72h Slow Conching</h4>
              <p className="text-xs text-gray-600 mt-1">Traditional granite roller conching eliminates astringency for micro-fine silkiness.</p>
            </div>

            <div className="bg-white/80 p-5 rounded-2xl border border-[#C4B19F] shadow-xs hover:border-[#C5A059] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#3D121A]/5 flex items-center justify-center text-[#C5A059] mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-sm font-semibold text-[#3D121A]">Master Hand-Tempering</h4>
              <p className="text-xs text-gray-600 mt-1">Tempered daily on cold Italian marble slabs to achieve a clean, musical snap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NUMBERED EDITORIAL BLOCKS 01 - 04 (All correct authentic chocolate imagery) */}
      <section className="py-16 sm:py-24 space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Block 01: Chocolate Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#FAF6F0] rounded-3xl p-6 sm:p-12 border border-[#C4B19F] shadow-xs">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 shadow-md bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan Single-Origin Chocolate Bars"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="font-serif text-4xl sm:text-5xl font-light text-[#C5A059]/80">01</div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#8C6D4C] block">Single-Estate Terroir</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#3D121A]">Artisan Chocolate Bars</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              Every bar is a snapshot of its estate soil, rainfall, and sunshine. Hand-harvested criollo cacao conched slowly for 72 hours to unlock layers of sun-dried red cherries, warm brioche, and smoky bourbon vanilla. Tempered for an unmistakable musical snap and pure, lingering melt.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">70% Dark Callebaut</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">38% Madagascar Milk</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Pure Cocoa Butter</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">72h Conched Silk</span>
            </div>
          </div>
        </div>

        {/* Block 02: Artisanal Chocolates (Reverse) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#FAF6F0] rounded-3xl p-6 sm:p-12 border border-[#C4B19F] shadow-xs">
          <div className="lg:col-span-6 lg:order-2 rounded-2xl overflow-hidden aspect-4/3 shadow-md bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=1000&q=80"
              alt="Handcrafted Bonbons, Pralines & Truffles"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-6 lg:order-1 space-y-4">
            <div className="font-serif text-4xl sm:text-5xl font-light text-[#C5A059]/80">02</div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#8C6D4C] block">Chocolatier Mastery</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#3D121A]">Bonbons, Pralines & Truffles</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              Micro-thin chocolate shells hand-cast with surgical precision, yielding effortlessly to sumptuous centers. Featuring French Guérande sea-salt Fleur de Sel caramel, slow-emulsified single-origin espresso ganache, roasted Piedmont hazelnut gianduja, and crowned by hand with 24-karat edible gold leaf.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Fleur de Sel Ganache</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Piedmont Gianduja</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Espresso Truffles</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">24k Gold Embellishment</span>
            </div>
          </div>
        </div>

        {/* Block 03: Gifting Collection (REPLACED: Luxury Chocolate Hamper Box) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#FAF6F0] rounded-3xl p-6 sm:p-12 border border-[#C4B19F] shadow-xs">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden aspect-4/3 shadow-md bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
              alt="Couture Chocolate Gift Trunks & Hampers"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="font-serif text-4xl sm:text-5xl font-light text-[#C5A059]/80">03</div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#8C6D4C] block">Celebration Keepsakes</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#3D121A]">Couture Chocolate Gift Trunks</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              Designed for life's most unforgettable milestones, wedding favors, and distinguished corporate gifting. Royal velvet-lined presentation trunks housing an opulent curation of single-origin tablets, couture bonbons, and stone-ground spreads. Finished with wax-sealed tasting menus and personalized calligraphed cards.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Velvet Keepsake Trunks</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Personalized Monograms</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Curated Tasting Menus</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Executive Gifting</span>
            </div>
          </div>
        </div>

        {/* Block 04: Chocolate Spreads (REPLACED: Authentic Hazelnut Cocoa Spread Jar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#FAF6F0] rounded-3xl p-6 sm:p-12 border border-[#C4B19F] shadow-xs">
          <div className="lg:col-span-6 lg:order-2 rounded-2xl overflow-hidden aspect-4/3 shadow-md bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=1000&q=80"
              alt="Piedmont Hazelnut & Cocoa Spread"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="lg:col-span-6 lg:order-1 space-y-4">
            <div className="font-serif text-4xl sm:text-5xl font-light text-[#C5A059]/80">04</div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#8C6D4C] block">Slow Stone-Ground Artisanship</span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#3D121A]">Piedmont Hazelnut & Cocoa Spread</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              A revelation in pure indulgence. We roast certified Italian Piedmont IGP hazelnuts to a golden amber and stone-grind them slowly for 48 hours with Dutch Callebaut cocoa, real bourbon vanilla pods, and unrefined cane sugar. Spoonable, glossy, deeply aromatic, and strictly 100% palm-oil free.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">45% Roasted Hazelnuts</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Zero Palm Oil</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Stone Ground 48 Hours</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#C4B19F] text-[#3D121A]">Pure Callebaut Cocoa</span>
            </div>
          </div>
        </div>

      </section>

      {/* 4. THE CONNOISSEUR'S CHOCOLATE GUIDE (NEAT CHOCOLATE INFO SECTION) */}
      <section className="py-20 sm:py-28 bg-[#18050B] text-white border-y border-[#3D121A]" id="chocolate-info">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
              The Connoisseur's Academy
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Anatomy of Grand Cru Chocolate
            </h2>
            <p className="text-sm sm:text-base text-white/75 font-normal leading-relaxed">
              Explore how origin terroir, percentage profiles, and tasting rituals transform fine cocoa into a sublime sensory journey.
            </p>
          </div>

          {/* Interactive Cocoa Percentage Spectrum */}
          <div className="bg-[#240A12] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Terroir Profile</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">Cocoa Percentage Spectrum</h3>
              </div>
              <p className="text-xs text-white/60 max-w-sm">
                Select a cocoa intensity to view tasting notes, bean roast profiles, and culinary pairings.
              </p>
            </div>

            {/* Percentage Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {COCOA_PERCENTAGES.map((c, idx) => (
                <button
                  key={c.pct}
                  onClick={() => setSelectedCocoaIndex(idx)}
                  className={`p-4 rounded-2xl text-left transition-all duration-300 border ${
                    selectedCocoaIndex === idx 
                      ? 'bg-[#C5A059] text-[#1D060D] border-[#C5A059] shadow-lg scale-102 font-bold' 
                      : 'bg-[#1D060E] text-white/80 border-white/10 hover:border-[#C5A059]/50'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-serif block font-bold">{c.pct}</span>
                  <span className="text-xs tracking-wide uppercase mt-1 block opacity-90">{c.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Profile Card */}
            {COCOA_PERCENTAGES[selectedCocoaIndex] && (
              <div className="bg-[#190409] rounded-2xl p-6 sm:p-8 border border-[#C5A059]/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Flavor Character</span>
                  <h4 className="font-serif text-xl sm:text-2xl text-white">
                    {COCOA_PERCENTAGES[selectedCocoaIndex].pct} {COCOA_PERCENTAGES[selectedCocoaIndex].name}
                  </h4>
                  <p className="text-xs text-white/70">
                    Roast: <span className="text-[#FFDFB3] font-semibold">{COCOA_PERCENTAGES[selectedCocoaIndex].roast}</span>
                  </p>
                </div>

                <div className="space-y-1 md:border-l md:border-white/10 md:pl-6">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Aroma & Tasting Notes</span>
                  <p className="text-sm font-serif italic text-white/95">
                    "{COCOA_PERCENTAGES[selectedCocoaIndex].notes}"
                  </p>
                </div>

                <div className="space-y-1 md:border-l md:border-white/10 md:pl-6">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Perfect Pairing</span>
                  <p className="text-xs text-white/85 font-normal">
                    {COCOA_PERCENTAGES[selectedCocoaIndex].bestFor}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5-Step Tasting Ritual Cards */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">The Sommelier Method</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white">The 5 Sensory Steps of Chocolate Tasting</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {TASTING_STEPS.map((t) => {
                const IconComponent = t.icon;
                return (
                  <div 
                    key={t.num}
                    className="bg-[#240A12] p-5 rounded-2xl border border-white/10 hover:border-[#C5A059]/60 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-serif text-2xl font-light text-[#C5A059]">{t.num}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#FFDFB3] group-hover:scale-110 transition-transform">
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-white mb-2">{t.step}</h4>
                      <p className="text-xs text-white/70 leading-relaxed">{t.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 5. CHOCOLATE PRODUCT MENU (Live purchasable items with Add to Cart) */}
      <section className="py-20 sm:py-28 bg-[#2A0B13] text-[#FAF5EE]" id="menu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
              Artisanal Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[0.14em] uppercase text-white">
              Veloura Chocolate Menu
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-normal">
              100% Belgian Callebaut cocoa with zero hydrogenated vegetable fats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CHOCOLATE_PRODUCTS.map((item) => (
              <div
                key={item.id}
                className="bg-[#1D060D] rounded-3xl overflow-hidden border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#C5A059]/60 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-black/60 backdrop-blur-md text-[#FFDFB3] border border-white/20">
                        {item.tag}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-[#3D121A]/80 backdrop-blur-md text-[#C5A059] border border-[#C5A059]/30">
                        {item.cocoa}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2.5 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-[#FFD166] text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-normal text-white group-hover:text-[#F8E7C5] transition-colors leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-xs text-[#FFDFB3]/75 font-sans italic">
                      Origin: {item.origin}
                    </p>

                    <p className="text-xs text-white/75 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-white/10 mt-4">
                  <div>
                    <span className="text-[10px] text-white/50 block uppercase">Price</span>
                    <span className="font-serif text-2xl font-bold text-[#C5A059]">₹{item.price}</span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C5A059] hover:bg-[#D4AF37] text-[#1D060D] transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. HIGHLIGHT CALL TO ACTION (Direct from Latte Global Cafe) */}
      <section className="py-20 sm:py-28 leaf-pattern-dark text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">
            Taste the Sweet Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight">
            Indulgence, Crafted to Perfection.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-normal leading-relaxed">
            Discover handcrafted desserts and single-origin chocolate creations designed to bring joy to every moment at Veloura.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/#reservation"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-xl hover:scale-105 transition-all"
            >
              Reserve Your Table
            </a>
            <Link
              to="/products?category=gift-hampers"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-xl hover:scale-105 transition-all"
            >
              Explore Gift Hampers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
