import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, Home } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import api from '../services/api';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockData';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState(() => {
    if (categoryParam) {
      return MOCK_PRODUCTS.filter(p => p.category_slug === categoryParam);
    }
    return MOCK_PRODUCTS;
  });
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchKeyword, setSearchKeyword] = useState(searchParam);
  const [priceRange, setPriceRange] = useState('all');
  const [onlyEggless, setOnlyEggless] = useState(false);
  const [onlyBestsellers, setOnlyBestsellers] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchKeyword(searchParams.get('search') || '');
  }, [searchParams]);

  const filterMock = () => {
    let list = [...MOCK_PRODUCTS];
    if (selectedCategory === 'cakes') {
      list = list.filter((p) => 
        p.category_slug?.includes('cake') || 
        p.category?.slug?.includes('cake') ||
        p.name?.toLowerCase().includes('cake') ||
        p.name?.toLowerCase().includes('gateau')
      );
    } else if (selectedCategory) {
      list = list.filter((p) => p.category_slug === selectedCategory || p.category?.slug === selectedCategory);
    }
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (onlyBestsellers) list = list.filter((p) => p.is_bestseller);
    if (priceRange === 'under-500') list = list.filter((p) => p.base_price < 500);
    else if (priceRange === '500-800') list = list.filter((p) => p.base_price >= 500 && p.base_price <= 800);
    else if (priceRange === '800-1200') list = list.filter((p) => p.base_price >= 800 && p.base_price <= 1200);
    else if (priceRange === 'above-1200') list = list.filter((p) => p.base_price > 1200);
    if (onlyEggless) list = list.filter((p) => p.is_eggless_available);
    if (sortBy === 'price_asc') list.sort((a, b) => a.base_price - b.base_price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.base_price - a.base_price);
    else if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products?sort_by=${sortBy}`;
        if (selectedCategory && selectedCategory !== 'cakes') {
          url += `&category=${selectedCategory}`;
        }
        if (searchKeyword) url += `&search=${encodeURIComponent(searchKeyword)}`;
        if (onlyBestsellers) url += `&is_bestseller=true`;

        if (priceRange === 'under-500') url += `&max_price=499`;
        else if (priceRange === '500-800') url += `&min_price=500&max_price=800`;
        else if (priceRange === '800-1200') url += `&min_price=800&max_price=1200`;
        else if (priceRange === 'above-1200') url += `&min_price=1200`;

        const res = await api.get(url);
        let data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          if (selectedCategory === 'cakes') {
            data = data.filter((p) => 
              p.category_slug?.includes('cake') || 
              p.category?.slug?.includes('cake') ||
              p.name?.toLowerCase().includes('cake') ||
              p.name?.toLowerCase().includes('gateau')
            );
          }
          if (onlyEggless) {
            data = data.filter((p) => p.is_eggless_available);
          }
          setProducts(data);
        } else {
          setProducts(filterMock());
        }
      } catch (err) {
        console.error(err);
        setProducts(filterMock());
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchKeyword, priceRange, onlyEggless, onlyBestsellers, sortBy]);

  const handleCategoryClick = (slug) => {
    const newSlug = selectedCategory === slug ? '' : slug;
    setSelectedCategory(newSlug);
    if (newSlug) {
      searchParams.set('category', newSlug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchKeyword('');
    setPriceRange('all');
    setOnlyEggless(false);
    setOnlyBestsellers(false);
    setSortBy('popular');
    setSearchParams({});
  };

  const activeFilterCount = 
    (selectedCategory ? 1 : 0) + 
    (searchKeyword ? 1 : 0) + 
    (priceRange !== 'all' ? 1 : 0) + 
    (onlyEggless ? 1 : 0) + 
    (onlyBestsellers ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb Home Bar */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 py-2 px-4 bg-white rounded-xl border border-[#EFE8DF] shadow-2xs mb-6">
        <Link to="/" className="hover:text-[#4A1525] flex items-center gap-1 font-bold text-gray-700 transition">
          <Home className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Home</span>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 font-medium">Menu</span>
        <span className="text-gray-300">/</span>
        <span className="text-[#4A1525] font-bold">
          {selectedCategory === 'cakes'
            ? 'Artisanal Cakes & Gateaux'
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
            : searchKeyword
            ? `Search: "${searchKeyword}"`
            : 'All Creations'}
        </span>
      </nav>

      {/* Header & Title */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2020]">
          {selectedCategory === 'cakes'
            ? 'Artisanal Cakes & Gateaux'
            : selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name || 'Artisanal Cakes'
            : searchKeyword
            ? `Search Results for "${searchKeyword}"`
            : 'Artisanal Bakes & Cakes'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Showing {products.length} handcrafted creations with fresh daily delivery.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#F0E6DA] mb-8 shadow-2xs">
        
        {/* Mobile Filter Trigger */}
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF3EB] text-[#4A1525] text-xs font-semibold"
        >
          <Filter className="w-4 h-4" />
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
        </button>

        {/* Active Filter Chips */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EB] text-[#4A1525] text-xs font-medium border border-[#EADCCF]">
              <span>Category: {selectedCategory === 'cakes' ? 'Artisanal Cakes & Gateaux' : (categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory)}</span>
              <button onClick={() => handleCategoryClick(selectedCategory)}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {searchKeyword && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EB] text-[#4A1525] text-xs font-medium border border-[#EADCCF]">
              <span>Query: "{searchKeyword}"</span>
              <button onClick={() => setSearchKeyword('')}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {onlyEggless && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <span>Eggless</span>
              <button onClick={() => setOnlyEggless(false)}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {onlyBestsellers && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#8C6418] text-xs font-medium border border-[#F2DEB0]">
              <span>Bestsellers</span>
              <button onClick={() => setOnlyBestsellers(false)}>
                <X className="w-3 h-3 hover:text-red-600" />
              </button>
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#A62846] font-semibold hover:underline px-2"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-[#2D2020] bg-[#FAF3EB] border border-[#EADCCF] rounded-xl px-3 py-2 focus:outline-none focus:border-[#4A1525]"
          >
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Additions</option>
          </select>
        </div>

      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white p-6 rounded-3xl border border-[#F0E6DA] space-y-6 shadow-2xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-base font-bold text-[#2D2020] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#4A1525]" />
                <span>Refine Selection</span>
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-[#A62846] font-semibold hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Categories
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition word-click ${
                    selectedCategory === ''
                      ? 'bg-[#4A1525] text-white font-bold'
                      : 'text-gray-600 hover:bg-[#FAF3EB]'
                  }`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => handleCategoryClick('cakes')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition word-click flex items-center justify-between ${
                    selectedCategory === 'cakes'
                      ? 'bg-[#4A1525] text-white font-bold'
                      : 'text-gray-600 hover:bg-[#FAF3EB]'
                  }`}
                >
                  <span>🎂 All Cakes & Gateaux</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryClick(c.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition word-click flex items-center justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-[#4A1525] text-white font-bold'
                        : 'text-gray-600 hover:bg-[#FAF3EB]'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Price Range
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-500', label: 'Under ₹500' },
                  { id: '500-800', label: '₹500 - ₹800' },
                  { id: '800-1200', label: '₹800 - ₹1,200' },
                  { id: 'above-1200', label: 'Above ₹1,200' },
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2.5 cursor-pointer text-gray-700">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id)}
                      className="accent-[#4A1525]"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferences Toggles */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-700">100% Eggless Only</span>
                <input
                  type="checkbox"
                  checked={onlyEggless}
                  onChange={(e) => setOnlyEggless(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-gray-700">Bestsellers Only</span>
                <input
                  type="checkbox"
                  checked={onlyBestsellers}
                  onChange={(e) => setOnlyBestsellers(e.target.checked)}
                  className="w-4 h-4 accent-[#4A1525] rounded"
                />
              </label>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-[#F0E6DA] p-8">
              <h3 className="font-serif text-xl font-bold text-[#2D2020]">No bakery creations matched your criteria</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                Try widening your price range, clearing selected filters, or searching for other cake flavors.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 px-6 py-2.5 bg-[#4A1525] text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-sm hover:bg-[#6E1C34] transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
}
