import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function AutoScrollCarousel({
  id,
  title,
  subtitle,
  items = [],
  theme = 'dark',
  autoScrollSpeed = 1.2,
}) {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const isDark = theme === 'dark';

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId;
    const step = () => {
      if (!isPaused && !isDragging && el) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += autoScrollSpeed;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isDragging, autoScrollSpeed]);

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 340;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section
      id={id}
      className={`py-16 sm:py-24 relative overflow-hidden transition-colors ${
        isDark ? 'bg-[#2A0B13] text-[#FAF5EE]' : 'bg-[#FAF6EE] text-[#2D2020] luxury-cream-texture border-y border-[#EAE2D5]'
      }`}
    >
      <div
        className={`absolute inset-0 pointer-events-none opacity-20 ${
          isDark
            ? 'bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px]'
            : 'bg-[radial-gradient(#8C6D4C_0.8px,transparent_0.8px)] [background-size:20px_20px]'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <h2
            className={`font-serif text-3xl sm:text-5xl font-normal tracking-[0.18em] uppercase ${
              isDark ? 'text-[#FAF5EE]' : 'text-[#3D121A]'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-normal ${
                isDark ? 'text-[#E8DCCB]/85' : 'text-gray-600'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="relative group/carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setIsDragging(false);
          }}
        >
          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous items"
            className={`absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isDark
                ? 'bg-[#1D060D]/80 hover:bg-[#3D121A] text-[#FAF5EE] border border-white/20 hover:border-[#C5A059]'
                : 'bg-white/90 hover:bg-white text-[#3D121A] border border-[#E8DEC8] hover:border-[#C5A059]'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            aria-label="Next items"
            className={`absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isDark
                ? 'bg-[#1D060D]/80 hover:bg-[#3D121A] text-[#FAF5EE] border border-white/20 hover:border-[#C5A059]'
                : 'bg-white/90 hover:bg-white text-[#3D121A] border border-[#E8DEC8] hover:border-[#C5A059]'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-4 px-2 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
          >
            {items.concat(items).map((item, idx) => (
              <Link
                key={`${item.title}-${idx}`}
                to={item.link || '/products'}
                className="shrink-0 w-64 sm:w-72 lg:w-80 group/card block text-left"
              >
                <div
                  className={`relative rounded-3xl overflow-hidden aspect-[3/4.2] shadow-xl border transition-all duration-500 group-hover/card:-translate-y-1.5 group-hover/card:shadow-2xl ${
                    isDark
                      ? 'border-white/10 bg-[#1D060D] group-hover/card:border-[#C5A059]/60'
                      : 'border-[#EAE2D5] bg-white group-hover/card:border-[#C5A059]'
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable="false"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-108"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#160408]/95 via-[#160408]/35 to-transparent pointer-events-none" />

                  {item.tag && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-black/40 backdrop-blur-md text-[#FFDFB3] border border-white/20">
                        {item.tag}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 text-white space-y-1">
                    <h3 className="font-serif text-lg sm:text-xl font-normal tracking-[0.14em] uppercase text-[#FAF5EE] group-hover/card:text-[#F8E7C5] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    {item.desc && (
                      <p className="text-[11px] text-white/75 font-normal line-clamp-1">
                        {item.desc}
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-[#D4AF37] opacity-0 group-hover/card:opacity-100 transition-all transform translate-y-1 group-hover/card:translate-y-0">
                      <span className="text-[10px] uppercase tracking-wider font-semibold">View Creation</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
