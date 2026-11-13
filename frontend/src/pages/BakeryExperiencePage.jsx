import React, { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, ChevronLeft, ChevronRight, ArrowRight, 
  CheckCircle2, ShoppingBag, Eye, Heart, Phone, Calendar,
  Award, Clock, Compass, Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuickViewModal from '../components/product/QuickViewModal';

// --- DATASETS MATCHING LATTE GLOBAL CAFE BAKERY CATEGORIES ---

// 1. CAKES
const BAKERY_CAKES = [
  {
    id: 'bk-tiramisu',
    name: 'Venetian Tiramisu Gateau',
    category: 'Cakes',
    price: 890,
    rating: 4.95,
    tag: 'Signature',
    desc: 'Espresso-soaked Savoiardi ladyfingers layered with whipped mascarpone cream and dusted with Valrhona cocoa.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    slug: 'venetian-tiramisu-gateau'
  },
  {
    id: 'bk-truffle',
    name: 'Belgian Chocolate Truffle',
    category: 'Cakes',
    price: 950,
    rating: 4.98,
    tag: '70% Callebaut',
    desc: 'Layers of moist dark chocolate sponge and silky 70% Callebaut Belgian ganache, finished with cocoa nibs.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    slug: 'belgian-chocolate-truffle-gateau'
  },
  {
    id: 'bk-cherrywood',
    name: 'Cherrywood Black Forest',
    category: 'Cakes',
    price: 890,
    rating: 4.91,
    tag: 'Classic Royal',
    desc: 'Dark chocolate génoise layered with sour Morello cherry compote, Madagascar chantilly, and chocolate curls.',
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    slug: 'cherrywood-black-forest-gateau'
  },
  {
    id: 'bk-tropical',
    name: 'Tropical Harvest Gateau',
    category: 'Cakes',
    price: 920,
    rating: 4.88,
    tag: 'Seasonal',
    desc: 'Alphonso mango curd and passion fruit mousse nestled between light vanilla chiffon sponge and roasted coconut.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    slug: 'tropical-harvest-gateau'
  },
  {
    id: 'bk-signature',
    name: 'Veloura Seasonal Signature',
    category: 'Cakes',
    price: 1050,
    rating: 4.99,
    tag: "Chef's Special",
    desc: 'Master pâtissier creation with wild strawberry gelée, pistachio dacquoise, and white chocolate mascarpone.',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
    slug: 'veloura-seasonal-signature-gateau'
  },
  {
    id: 'bk-hazelnut',
    name: 'Piedmont Hazelnut Praline',
    category: 'Cakes',
    price: 980,
    rating: 4.94,
    tag: 'Crunchy Praline',
    desc: 'Slow-roasted Italian hazelnut mousse, crisp feuilletine praline wafer, and milk chocolate glaze.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    slug: 'piedmont-hazelnut-praline-gateau'
  },
  {
    id: 'bk-custom',
    name: 'Bespoke Celebration Creation',
    category: 'Cakes',
    price: 1800,
    rating: 5.0,
    tag: 'Custom Craft',
    desc: 'Sculpted multi-tiered centerpiece customized to your exact celebratory theme, colors, and flavour preferences.',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
    slug: 'bespoke-celebration-creation'
  },
  {
    id: 'bk-caramel',
    name: 'Salted Caramel Toffee Gateau',
    category: 'Cakes',
    price: 920,
    rating: 4.92,
    tag: 'Gourmet',
    desc: 'Fleur de Sel amber caramel ribbons, brown butter sponge, and caramelized white chocolate cream.',
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=800&q=80',
    slug: 'salted-caramel-toffee-gateau'
  },
  {
    id: 'bk-redvelvet',
    name: 'Crimson Red Velvet Royale',
    category: 'Cakes',
    price: 860,
    rating: 4.90,
    tag: 'Bestseller',
    desc: 'Velvety crimson cocoa sponge layered with whipped Philadelphia cream cheese frosting and bourbon vanilla.',
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80',
    slug: 'crimson-red-velvet-royale'
  }
];

// 2. DESSERTS & PETIT FOURS
const BAKERY_DESSERTS = [
  {
    id: 'ds-cookies',
    name: 'Valrhona Dark Chocolate Cookies',
    category: 'Desserts',
    price: 260,
    tag: 'Warm Center',
    desc: 'Freshly baked soft-baked cookies loaded with 70% dark chocolate chunks and Maldon sea salt flakes.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    slug: 'valrhona-dark-chocolate-cookies'
  },
  {
    id: 'ds-lemontart',
    name: 'Sicilian Meyer Lemon Tart',
    category: 'Desserts',
    price: 320,
    tag: 'Zesty Classic',
    desc: 'Buttery pâte sablée crust filled with silky Meyer lemon curd and torched Italian meringue swirls.',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    slug: 'sicilian-meyer-lemon-tart'
  },
  {
    id: 'ds-frenchtoast',
    name: 'Brioche French Toast Caramel',
    category: 'Desserts',
    price: 380,
    tag: 'Chef Signature',
    desc: 'Thick-cut golden brioche soaked in vanilla custard, caramelized with brown sugar and served with whipped crème.',
    image: 'https://images.unsplash.com/photo-1484723091739-00a6976da767?auto=format&fit=crop&w=800&q=80',
    slug: 'brioche-french-toast-caramel'
  },
  {
    id: 'ds-tiramisu-cup',
    name: 'Classic Venetian Tiramisu Cup',
    category: 'Desserts',
    price: 340,
    tag: 'Individual',
    desc: 'Personal portion of authentic Italian tiramisu with espresso savoiardi and smooth mascarpone cream.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    slug: 'classic-venetian-tiramisu-cup'
  },
  {
    id: 'ds-carrot',
    name: 'Spiced Pecan Carrot Cake',
    category: 'Desserts',
    price: 340,
    tag: 'Warm Spices',
    desc: 'Moist grated carrot and walnut cake infused with Ceylon cinnamon, topped with whipped cream cheese.',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
    slug: 'spiced-pecan-carrot-cake'
  },
  {
    id: 'ds-cheesecake',
    name: 'New York Baked Cheesecake',
    category: 'Desserts',
    price: 360,
    tag: 'Creamy Classic',
    desc: 'Dense, rich, and velvety Philadelphia cream cheese baked on a crisp graham cracker crust with blueberry coulis.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    slug: 'new-york-baked-cheesecake'
  },
  {
    id: 'ds-toffee',
    name: 'Warm Sticky Toffee Pudding',
    category: 'Desserts',
    price: 350,
    tag: 'Comfort Warm',
    desc: 'Steamed Medjool date sponge drenched in boiling toffee sauce and served with Madagascar vanilla gelato.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    slug: 'warm-sticky-toffee-pudding'
  },
  {
    id: 'ds-choux',
    name: 'Parisian Vanilla Bean Choux',
    category: 'Desserts',
    price: 280,
    tag: 'Craquelin Crisp',
    desc: 'Crispy golden craquelin puff bursting with cold Madagascar bourbon vanilla bean crème diplomate.',
    image: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80',
    slug: 'parisian-vanilla-bean-choux'
  },
  {
    id: 'ds-feuille',
    name: 'Wild Berry Mille-Feuille',
    category: 'Desserts',
    price: 380,
    tag: 'Flaky Layers',
    desc: 'Caramelized inverted puff pastry layered with light Tahitian vanilla mousseline and fresh forest berries.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    slug: 'wild-berry-mille-feuille'
  }
];

// 3. BOULANGERIE & VIENNOISERIE
const BAKERY_BOULANGERIE = [
  {
    id: 'bl-sourdough',
    name: 'Wild Fermented Sourdough Loaf',
    category: 'Boulangerie',
    price: 280,
    tag: '36-Hr Ferment',
    desc: 'Cultured with our 8-year-old sourdough starter, featuring a blistered crisp crust and open airy crumb.',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    slug: 'wild-fermented-sourdough-loaf'
  },
  {
    id: 'bl-croissant',
    name: 'Normandy Butter Croissant',
    category: 'Boulangerie',
    price: 190,
    tag: 'Pure Butter',
    desc: 'Laminated over 72 hours with pure French Normandy butter for honeycomb interior and golden flaky crust.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    slug: 'normandy-butter-croissant'
  },
  {
    id: 'bl-artisan-loaf',
    name: 'Multi-Grain Artisan Boule',
    category: 'Boulangerie',
    price: 290,
    tag: 'Rustic Loaf',
    desc: 'Stone-ground whole wheat, toasted pumpkin seeds, sunflower seeds, and golden flax seeds with dark caramelized crust.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    slug: 'multi-grain-artisan-boule'
  },
  {
    id: 'bl-baguette',
    name: 'Traditional French Baguette',
    category: 'Boulangerie',
    price: 180,
    tag: 'Boulangerie Classic',
    desc: 'Authentic Parisian baguette with crackling golden crust, delicate cream-colored crumb, and light nutty aroma.',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
    slug: 'traditional-french-baguette'
  },
  {
    id: 'bl-pain-choc',
    name: 'Pain au Chocolat Grand Cru',
    category: 'Boulangerie',
    price: 240,
    tag: 'Double Chocolate',
    desc: 'Flaky buttery viennoiserie pastry folded around two batons of intense 54% Callebaut dark chocolate.',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80',
    slug: 'pain-au-chocolat-grand-cru'
  },
  {
    id: 'bl-danish',
    name: 'Pistachio & Berry Danish Pastry',
    category: 'Boulangerie',
    price: 260,
    tag: 'Fresh Fruit',
    desc: 'Spiral laminated pastry filled with pistachio frangipane cream and topped with fresh raspberries and toasted nuts.',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80',
    slug: 'pistachio-berry-danish-pastry'
  }
];

// 4. GELATO & ARTISANAL CONFECTIONS
const BAKERY_GELATO = [
  {
    id: 'gl-vanilla',
    name: 'Madagascar French Vanilla Gelato',
    category: 'Gelato',
    price: 240,
    tag: 'Slow Churned',
    desc: 'Infused with whole bourbon vanilla pods and whole farm-fresh dairy for an ultra-dense, silky mouthfeel.',
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&q=80',
    slug: 'madagascar-french-vanilla-gelato'
  },
  {
    id: 'gl-mint',
    name: 'Fresh Garden Mint & Dark Cacao Gelato',
    category: 'Gelato',
    price: 260,
    tag: 'Botanical Infusion',
    desc: 'Natural garden mint steeped in organic cream, folded with crunchy fragments of 70% dark Belgian chocolate.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    slug: 'fresh-garden-mint-dark-cacao-gelato'
  },
  {
    id: 'gl-lemon',
    name: 'Sicilian Amalfi Lemon Sorbet',
    category: 'Gelato',
    price: 240,
    tag: 'Dairy Free',
    desc: 'Clean, palate-cleansing sorbet hand-churned with sun-ripened Amalfi lemons and a touch of wild mountain honey.',
    image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=80',
    slug: 'sicilian-amalfi-lemon-sorbet'
  },
  {
    id: 'gl-chocolate',
    name: 'Noir 70% Callebaut Gelato',
    category: 'Gelato',
    price: 260,
    tag: 'Intense Cocoa',
    desc: 'Pure melted Belgian chocolate churned cold into a rich, deep gelato with zero artificial flavorings.',
    image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80',
    slug: 'noir-70-callebaut-gelato'
  },
  {
    id: 'gl-pistachio',
    name: 'Bronte Pistachio Verde Gelato',
    category: 'Gelato',
    price: 290,
    tag: 'Sicilian DOP',
    desc: 'Made exclusively with slow-roasted, pure Sicilian Bronte pistachio paste for an earthy, naturally emerald indulgence.',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=800&q=80',
    slug: 'bronte-pistachio-verde-gelato'
  },
  {
    id: 'gl-berry',
    name: 'Wild Forest Berry Sorbet',
    category: 'Gelato',
    price: 250,
    tag: 'Fruit Sorbet',
    desc: 'Vibrant blend of fresh blueberries, blackberries, and raspberries churned into a velvety, refreshing frozen treat.',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    slug: 'wild-forest-berry-sorbet'
  }
];

export default function BakeryExperiencePage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  const [toastMessage, setToastMessage] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // References for horizontal scrolling of columns
  const cakesRef = useRef(null);
  const dessertsRef = useRef(null);
  const boulangerieRef = useRef(null);
  const gelatoRef = useRef(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      // Smooth scroll to the target column if requested
      const targetEl = document.getElementById(categoryParam);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [categoryParam]);

  const handleScroll = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === 'left' ? -380 : 380,
      behavior: 'smooth'
    });
  };

  const handleQuickAdd = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      base_price: item.price,
      discount_price: item.price,
      image_url: item.image,
      slug: item.slug
    }, 1);
    setToastMessage(`Added ${item.name} to your order!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCategoryFilter = (catKey) => {
    setActiveCategory(catKey);
    if (catKey !== 'all') {
      const el = document.getElementById(catKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF6EE] text-[#160B0D] min-h-screen luxury-cream-texture">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#260D16] text-[#FAF5EE] px-5 py-3 rounded-2xl shadow-2xl border border-[#D8B879] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-[#D8B879]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* 1. CINEMATIC BAKERY HERO SECTION (Direct match to Latte Global Cafe Hero) */}
      <section className="relative min-h-[58vh] sm:min-h-[66vh] flex items-center justify-center bg-[#160B0D] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=2000&q=85"
            alt="Veloura Artisan Bakery"
            className="w-full h-full object-cover opacity-35 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160B0D] via-[#260D16]/75 to-[#160B0D]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(#D8B879_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D8B879]/40 text-[#F6EAD5] text-[11px] font-semibold uppercase tracking-[0.28em]">
            Veloura Pâtisserie & Café
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.08]">
            Artisan Bakery
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
            Freshly baked breads, delicate pastries, layered desserts and signature cakes designed to bring warmth, texture and indulgence to every experience.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleCategoryFilter('cakes')}
              className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F6EAD5] text-[#260D16] hover:bg-white shadow-xl hover:scale-105 transition-all"
            >
              Explore Cakes
            </button>
            <button
              onClick={() => handleCategoryFilter('boulangerie')}
              className="px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-transparent border border-[#D8B879] text-[#F6EAD5] hover:bg-white/10 shadow-lg hover:scale-105 transition-all"
            >
              Artisan Boulangerie
            </button>
          </div>
        </div>
      </section>

      {/* 2. INTRO SECTION (Matching Latte Global Cafe) */}
      <section className="py-14 sm:py-20 leaf-pattern-light border-b border-[#E8DEC8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
            Fresh From The Oven
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#260D16] leading-tight">
            Signature Bakery Collection
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed font-normal max-w-2xl mx-auto">
            A celebration of soft textures, rich flavours and timeless bakery comforts; from buttery pastries and slow-fermented breads to elegant desserts and celebration cakes.
          </p>
        </div>
      </section>

      {/* 3. CATEGORY PILLS BAR (Quick Column Navigation - No Painful Scrolling) */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8DEC8] py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E7D46] mr-2 shrink-0 hidden sm:inline">
            Category Columns:
          </span>
          {[
            { key: 'all', label: 'All Columns' },
            { key: 'cakes', label: 'Cakes & Gateaux' },
            { key: 'desserts', label: 'Desserts & Petit Fours' },
            { key: 'boulangerie', label: 'Boulangerie & Viennoiserie' },
            { key: 'gelato', label: 'Artisanal Gelato' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryFilter(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-[#260D16] text-[#F6EAD5] border border-[#D8B879] shadow-sm'
                  : 'bg-[#FAF6EE] text-[#4A3B34] hover:bg-white hover:text-[#260D16] border border-[#E8DEC8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          COLUMN 1: CAKES (Dark Luxury Section matching Latte Global Cafe)
      ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'cakes') && (
        <section id="cakes" className="py-20 sm:py-28 bg-[#160B0D] text-white relative overflow-hidden border-b border-[#2A1017]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B879]">
                  Column 01 • Haute Pâtisserie
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-white">
                  Cakes
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed">
                  From rich chocolate to Biscoff and seasonal signature flavours, our cakes are designed for celebrations both big and small, with customisation available for special occasions and memorable gatherings.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleScroll(cakesRef, 'left')}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 flex items-center justify-center transition-all"
                  aria-label="Previous cakes"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll(cakesRef, 'right')}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 flex items-center justify-center transition-all"
                  aria-label="Next cakes"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Column Swiper / Scroll */}
            <div
              ref={cakesRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none py-2 select-none"
            >
              {BAKERY_CAKES.map((cake) => (
                <div
                  key={cake.id}
                  className="shrink-0 w-72 sm:w-80 group rounded-3xl overflow-hidden bg-[#240D15] border border-white/10 hover:border-[#D8B879]/60 shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3.8] overflow-hidden bg-black/40">
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#240D15] via-transparent to-black/30" />
                    
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-black/60 backdrop-blur-md text-[#F6EAD5] border border-white/20">
                      {cake.tag}
                    </span>

                    <button
                      onClick={() => setQuickViewProduct({
                        id: cake.id,
                        name: cake.name,
                        base_price: cake.price,
                        discount_price: cake.price,
                        image_url: cake.image,
                        description: cake.desc,
                        rating: cake.rating,
                        is_eggless_available: true
                      })}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:text-[#D8B879] flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#F6EAD5] transition-colors leading-snug">
                          {cake.name}
                        </h4>
                        <span className="text-sm font-bold text-[#D8B879] shrink-0 ml-2">₹{cake.price}</span>
                      </div>
                      <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-normal">
                        {cake.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(cake)}
                        className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                      <Link
                        to={`/product/${cake.slug}`}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white transition"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          COLUMN 2: DESSERTS & PETIT FOURS (Warm Light Section matching Latte Global Cafe)
      ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'desserts') && (
        <section id="desserts" className="py-20 sm:py-28 bg-[#FAF6EE] text-[#160B0D] relative overflow-hidden border-b border-[#E8DEC8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
                  Column 02 • Sweet Indulgences
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#260D16] tracking-tight">
                  Desserts & Petit Fours
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                  The kind of desserts made for slow evenings, extra spoons across the table, and conversations that last longer than planned; from rich tiramisu and cheesecakes to warm chocolate creations and seasonal favourites.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleScroll(dessertsRef, 'left')}
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#260D16] text-[#260D16] hover:text-[#F6EAD5] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Previous desserts"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll(dessertsRef, 'right')}
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#260D16] text-[#260D16] hover:text-[#F6EAD5] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Next desserts"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Column Swiper / Scroll */}
            <div
              ref={dessertsRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none py-2 select-none"
            >
              {BAKERY_DESSERTS.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-72 sm:w-80 group rounded-3xl overflow-hidden bg-white border border-[#E8DEC8] hover:border-[#D8B879] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3.8] overflow-hidden bg-[#F6EAD5]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/90 backdrop-blur-md text-[#260D16] border border-[#E8DEC8]">
                      {item.tag}
                    </span>

                    <button
                      onClick={() => setQuickViewProduct({
                        id: item.id,
                        name: item.name,
                        base_price: item.price,
                        discount_price: item.price,
                        image_url: item.image,
                        description: item.desc,
                        rating: 4.9,
                        is_eggless_available: true
                      })}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#260D16] hover:text-[#D8B879] flex items-center justify-center backdrop-blur-md border border-[#E8DEC8] transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-serif text-lg sm:text-xl font-normal text-[#260D16] group-hover:text-[#9E7D46] transition-colors leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-[#260D16] shrink-0 ml-2">₹{item.price}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#260D16] hover:bg-[#3D1423] text-[#F6EAD5] transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                      <Link
                        to={`/product/${item.slug}`}
                        className="p-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#260D16] transition border border-[#E8DEC8]"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          COLUMN 3: BOULANGERIE (Dark Section matching Latte Global Cafe)
      ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'boulangerie') && (
        <section id="boulangerie" className="py-20 sm:py-28 bg-[#160B0D] text-white relative overflow-hidden border-b border-[#2A1017]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B879]">
                  Column 03 • French Artisanal Bread
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide text-white">
                  Boulangerie & Viennoiserie
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed">
                  From flaky croissants to freshly baked breads, our boulangerie brings together the warmth, aroma, and simple pleasures of traditional baking.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleScroll(boulangerieRef, 'left')}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 flex items-center justify-center transition-all"
                  aria-label="Previous boulangerie"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll(boulangerieRef, 'right')}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 flex items-center justify-center transition-all"
                  aria-label="Next boulangerie"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Column Swiper / Scroll */}
            <div
              ref={boulangerieRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none py-2 select-none"
            >
              {BAKERY_BOULANGERIE.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-72 sm:w-80 group rounded-3xl overflow-hidden bg-[#240D15] border border-white/10 hover:border-[#D8B879]/60 shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3.8] overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#240D15] via-transparent to-black/30" />
                    
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-black/60 backdrop-blur-md text-[#F6EAD5] border border-white/20">
                      {item.tag}
                    </span>

                    <button
                      onClick={() => setQuickViewProduct({
                        id: item.id,
                        name: item.name,
                        base_price: item.price,
                        discount_price: item.price,
                        image_url: item.image,
                        description: item.desc,
                        rating: 4.95,
                        is_eggless_available: true
                      })}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white hover:text-[#D8B879] flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#F6EAD5] transition-colors leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-[#D8B879] shrink-0 ml-2">₹{item.price}</span>
                      </div>
                      <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-[#D8B879] text-white hover:text-[#160B0D] border border-white/20 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                      <Link
                        to={`/product/${item.slug}`}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white transition"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          COLUMN 4: GELATO (Warm Light Section matching Latte Global Cafe)
      ========================================================================= */}
      {(activeCategory === 'all' || activeCategory === 'gelato') && (
        <section id="gelato" className="py-20 sm:py-28 bg-[#FAF6EE] text-[#160B0D] relative overflow-hidden border-b border-[#E8DEC8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Category Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E7D46]">
                  Column 04 • Churned Confections
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#260D16] tracking-tight">
                  Gelato & Sorbets
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 font-normal leading-relaxed">
                  Rich yet refreshing, our gelatos are designed to bring a playful layer of indulgence to the Veloura experience, with flavours that feel both comforting and memorable.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleScroll(gelatoRef, 'left')}
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#260D16] text-[#260D16] hover:text-[#F6EAD5] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Previous gelato"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleScroll(gelatoRef, 'right')}
                  className="w-10 h-10 rounded-full bg-white hover:bg-[#260D16] text-[#260D16] hover:text-[#F6EAD5] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-xs"
                  aria-label="Next gelato"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Column Swiper / Scroll */}
            <div
              ref={gelatoRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none py-2 select-none"
            >
              {BAKERY_GELATO.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-72 sm:w-80 group rounded-3xl overflow-hidden bg-white border border-[#E8DEC8] hover:border-[#D8B879] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3.8] overflow-hidden bg-[#F6EAD5]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/90 backdrop-blur-md text-[#260D16] border border-[#E8DEC8]">
                      {item.tag}
                    </span>

                    <button
                      onClick={() => setQuickViewProduct({
                        id: item.id,
                        name: item.name,
                        base_price: item.price,
                        discount_price: item.price,
                        image_url: item.image,
                        description: item.desc,
                        rating: 4.92,
                        is_eggless_available: true
                      })}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#260D16] hover:text-[#D8B879] flex items-center justify-center backdrop-blur-md border border-[#E8DEC8] transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-serif text-lg sm:text-xl font-normal text-[#260D16] group-hover:text-[#9E7D46] transition-colors leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-[#260D16] shrink-0 ml-2">₹{item.price}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#260D16] hover:bg-[#3D1423] text-[#F6EAD5] transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Order</span>
                      </button>
                      <Link
                        to={`/product/${item.slug}`}
                        className="p-2.5 rounded-full bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#260D16] transition border border-[#E8DEC8]"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 5. BAKERY CONSULTATION CTA (Direct match to Latte Global Cafe CTA) */}
      <section className="py-20 sm:py-28 leaf-pattern-dark text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B879]">
            Bespoke Celebrations & Gateaux
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight">
            Made for Your Moments
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-normal leading-relaxed">
            Custom creations, tiered wedding cakes, and private dessert tables carefully crafted to make every celebration truly unforgettable.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+918882553333"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#F6EAD5] hover:bg-white text-[#260D16] shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#260D16]" />
              <span>Contact Pâtisserie Consultant</span>
            </a>
            <a
              href="/#reservation"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-transparent border border-[#D8B879] text-[#F6EAD5] hover:bg-white/10 shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#D8B879]" />
              <span>Book Salon Table & Tasting</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
