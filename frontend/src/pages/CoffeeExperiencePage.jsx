import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Coffee, Sparkles, ChevronLeft, ChevronRight, ArrowRight, 
  Calendar, Flame, Droplets, Compass, Award, CheckCircle2 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const COFFEE_CREATIONS = [
  {
    id: 'cf-affogato',
    name: 'Artisan Affogato',
    category: 'Specialty Brews',
    price: 320,
    desc: 'Double shot hot espresso poured over Madagascar vanilla bean gelato.',
    image: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=800&q=80',
    tag: 'Signature'
  },
  {
    id: 'cf-cortado',
    name: 'Veloura Cortado',
    category: 'Espresso Bar',
    price: 260,
    desc: 'Equal parts rich espresso and silky textured milk in a Gibraltar glass.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    tag: 'Barista Choice'
  },
  {
    id: 'cf-frappe',
    name: 'Belgian Mocha Frappé',
    category: 'Chilled Coffee',
    price: 340,
    desc: 'Cold brew blended with Callebaut chocolate ganache and chantilly cream.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    tag: 'Iced Indulgence'
  },
  {
    id: 'cf-spanish-latte',
    name: 'Spanish Latte',
    category: 'Specialty Latte',
    price: 310,
    desc: 'Espresso sweetened with spiced condensed milk and micro-foamed dairy.',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80',
    tag: 'Sweet Harmony'
  },
  {
    id: 'cf-cranberry',
    name: 'Black Cranberry Cold Brew',
    category: 'Signature Infusion',
    price: 360,
    desc: '18-hour cold brew infused with tart cranberry reduction and citrus twist.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    tag: 'Refreshing'
  },
  {
    id: 'cf-orange',
    name: 'Black Orange Espresso',
    category: 'Signature Infusion',
    price: 360,
    desc: 'Sparkling tonic layered with chilled double espresso and candied blood orange.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    tag: 'Citrus Zest'
  },
  {
    id: 'cf-pourover',
    name: 'Single-Origin Pour Over',
    category: 'Manual Brew',
    price: 380,
    desc: 'Ethiopian Yirgacheffe V60 extraction with floral jasmine and bergamot notes.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    tag: 'Single Origin'
  },
  {
    id: 'cf-macchiato',
    name: 'Salted Caramel Macchiato',
    category: 'Espresso Bar',
    price: 330,
    desc: 'Steamed milk stained with espresso and finished with house salted caramel drizzle.',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80',
    tag: 'Caramel Delight'
  }
];

const COFFEE_VARIETIES = [
  {
    title: 'Espresso',
    subtitle: 'Bold, concentrated, and rich in character.',
    desc: 'Extracted at 9 bars of pressure for 28 seconds, yielding a thick golden crema with dark cacao undertones.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Manual Brew',
    subtitle: 'Silky, smooth, and perfectly balanced.',
    desc: 'V60, Chemex, and Aeropress single-cup extractions that celebrate subtle origin characteristics and floral acidity.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Cold Brew',
    subtitle: 'Light foam, deep aroma, and refined texture.',
    desc: 'Steeped cold for 18 hours using single-origin coarse grounds, producing zero astringency and natural chocolate sweetness.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Nutraceutical',
    subtitle: 'Slow brewed, refreshing, and naturally restorative.',
    desc: 'Antioxidant-dense functional roasts infused with organic adaptogens, ashwagandha, and clean botanical essences.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  }
];

export default function CoffeeExperiencePage() {
  const { addToCart } = useCart();
  const sliderRef = useRef(null);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    let animId;
    const step = () => {
      if (!isSliderPaused && el) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 1.2;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isSliderPaused]);

  const handleSlide = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === 'left' ? -340 : 340,
      behavior: 'smooth'
    });
  };

  const handleQuickAdd = (coffee) => {
    addToCart({
      id: coffee.id,
      name: coffee.name,
      base_price: coffee.price,
      discount_price: coffee.price,
      image_url: coffee.image,
      slug: coffee.id
    }, 1);
    setToastMessage(`Added ${coffee.name} to order!`);
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

      {/* 1. CINEMATIC HERO SECTION (Direct match to Latte Global Cafe Hero) */}
      <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center bg-[#15050A] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=2000&q=85"
            alt="Veloura Specialty Coffee Roastery"
            className="w-full h-full object-cover opacity-35 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15050A] via-[#2A0B13]/70 to-[#15050A]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:26px_26px] opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20 space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FFDFB3] text-xs font-semibold uppercase tracking-[0.25em]">
            Veloura Coffee Experience
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.1]">
            From Bean to Cup
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
            Every cup at Veloura begins with a story — from carefully selected single-origin beans to the final precision pour served fresh in your cup.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#journey"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-xl hover:scale-105 transition-all"
            >
              Discover The Journey
            </a>
            <Link
              to="/products?category=coffee-brews"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-lg hover:scale-105 transition-all"
            >
              Order Roastery Beans
            </Link>
          </div>
        </div>
      </section>

      {/* 2. INTRO PHILOSOPHY SECTION */}
      <section className="py-20 sm:py-24 leaf-pattern-light border-b border-[#EFE8DF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
            Our Coffee Story
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#3D121A] leading-tight">
            Every Coffee Bean Has a Journey
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
            At Veloura, we aspire to bring these evolving global coffee tastes to emerging India — thoughtfully blending international specialty coffee culture with local warmth and hospitality. Through carefully curated single-origin roasts, precision extraction techniques, and an immersive café sanctuary, Veloura celebrates coffee not merely as a drink, but as an art, a conversation, and a daily ritual.
          </p>
        </div>
      </section>

      {/* 3. 4-CHAPTER STORY JOURNEY (Full-Bleed Panels matching Latte Global Cafe) */}
      <section id="journey" className="relative space-y-0 text-white">
        
        {/* Chapter 01: Sourcing */}
        <div className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=80"
            alt="Chapter 01 - Sourcing"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-[#C5A059] bg-white/10 backdrop-blur-md border border-[#C5A059]/30">
              Chapter 01
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-wider text-white">
              Sourcing
            </h3>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-normal leading-relaxed">
              Every cup begins with carefully selected single-origin Arabica beans, cultivated in shade-grown estates and chosen for their vibrant natural aroma, complex terroir, and distinct chocolate-fruity character.
            </p>
          </div>
        </div>

        {/* Chapter 02: Harvesting */}
        <div className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=1600&q=80"
            alt="Chapter 02 - Harvesting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-[#C5A059] bg-white/10 backdrop-blur-md border border-[#C5A059]/30">
              Chapter 02
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-wider text-white">
              Harvesting
            </h3>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-normal leading-relaxed">
              Hand-picked at peak ripeness, only deep red cherries pass our selective sorting. They carry the natural sugars and delicate floral notes that define the signature taste profile of every Veloura cup.
            </p>
          </div>
        </div>

        {/* Chapter 03: Roasting */}
        <div className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80"
            alt="Chapter 03 - Roasting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-[#C5A059] bg-white/10 backdrop-blur-md border border-[#C5A059]/30">
              Chapter 03
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-wider text-white">
              Roasting
            </h3>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-normal leading-relaxed">
              Heat, airflow, and microscopic precision. Our master roasters coax out caramelized sweetness, delicate honey undertones, and round balanced acidity in micro-batches under 15 kilograms.
            </p>
          </div>
        </div>

        {/* Chapter 04: Brewing & Served */}
        <div className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1600&q=80"
            alt="Chapter 04 - Brewing & Served"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80" />
          <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.25em] uppercase text-[#C5A059] bg-white/10 backdrop-blur-md border border-[#C5A059]/30">
              Chapter 04
            </span>
            <h3 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-wider text-white">
              Brewing & Served
            </h3>
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-normal leading-relaxed">
              Crafted with care and served fresh, the journey reaches your cup with unmatched warmth, velvety micro-foam, and comforting aroma that invites you to pause and savor.
            </p>
          </div>
        </div>

      </section>

      {/* 4. SPECIALTY COFFEE AUTO-SLIDER (Matching Latte Global Cafe Mid-Slider) */}
      <section className="py-20 sm:py-28 bg-[#2A0B13] text-[#FAF5EE] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
              Specialty Bar
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-[0.14em] uppercase text-white">
              Signature Coffee Creations
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-normal">
              Precision brewed daily by certified Q-graders using 100% Arabica roasts.
            </p>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <button
              onClick={() => handleSlide('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1D060D]/90 text-white border border-white/20 flex items-center justify-center hover:border-[#C5A059] shadow-xl transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSlide('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1D060D]/90 text-white border border-white/20 flex items-center justify-center hover:border-[#C5A059] shadow-xl transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={sliderRef}
              className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-4 px-2 select-none"
            >
              {COFFEE_CREATIONS.concat(COFFEE_CREATIONS).map((coffee, i) => (
                <div
                  key={`${coffee.id}-${i}`}
                  className="shrink-0 w-64 sm:w-72 lg:w-80 group rounded-3xl overflow-hidden aspect-[3/4.2] relative bg-[#1D060D] border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#C5A059]/60"
                >
                  <img
                    src={coffee.image}
                    alt={coffee.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160408]/95 via-[#160408]/40 to-transparent" />

                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-black/50 backdrop-blur-md text-[#FFDFB3] border border-white/20">
                      {coffee.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-5 z-10 text-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg sm:text-xl font-normal uppercase tracking-wider text-white group-hover:text-[#F8E7C5] transition-colors">
                        {coffee.name}
                      </h4>
                      <span className="text-sm font-bold text-[#C5A059]">₹{coffee.price}</span>
                    </div>
                    <p className="text-xs text-white/75 line-clamp-2 leading-relaxed">
                      {coffee.desc}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleQuickAdd(coffee)}
                        className="w-full py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 hover:bg-[#C5A059] text-white hover:text-[#1D060D] border border-white/20 transition-all shadow-sm"
                      >
                        Quick Add to Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. DARK STATEMENT SECTION (Direct from Latte Global Cafe) */}
      <section className="py-20 sm:py-28 leaf-pattern-dark text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">
            Crafted for Every Moment
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight">
            From origin to aroma, every cup carries the craft.
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-normal leading-relaxed">
            At Veloura, coffee is an immersive experience of care, comfort, and lively conversation.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/#reservation"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-cream shadow-xl hover:scale-105 transition-all"
            >
              Reserve Your Table
            </a>
            <Link
              to="/products?category=coffee-brews"
              className="px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider btn-outline-light shadow-xl hover:scale-105 transition-all"
            >
              Shop Single Origins
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SIGNATURE COFFEE VARIETIES GRID (Direct match to Latte Global Cafe 4 Varieties) */}
      <section className="py-20 sm:py-28 luxury-cream-texture border-t border-[#C4B19F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8C6D4C]">
              Signature Roasts
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#3D121A] tracking-tight">
              Crafted for Every Preference
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-normal">
              From bold espresso classics to smooth cold infusions, every cup is brewed to match the moment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {COFFEE_VARIETIES.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 border border-[#EFE8DF] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-video bg-[#FAF5EE]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-[#3D121A]">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#8C6D4C]">
                      {item.subtitle}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#F4EFEA] mt-6">
                  <Link
                    to="/products?category=coffee-brews"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D121A] group-hover:text-[#C5A059] transition-colors"
                  >
                    <span>View Coffee Blends</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
