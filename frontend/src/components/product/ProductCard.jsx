import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, {
      weight: product.weights?.[0] || '0.5 kg',
      flavour: product.flavours?.[0] || 'Belgian Chocolate',
      is_eggless: true,
      quantity: 1,
      unitPrice: product.discount_price || product.base_price
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#EAE3D5] hover:border-[#D8B879] hover:shadow-[0_16px_40px_rgba(38,13,22,0.09)] transition-all duration-500 flex flex-col justify-between">
      
      {/* Product Image Box with subtle zoom */}
      <div className="relative aspect-4/3 sm:aspect-square overflow-hidden bg-[#D8C7B5]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* FSSAI Green Vegetarian / Eggless Square Dot in Top-Left */}
        {product.is_eggless_available && (
          <div 
            className="absolute top-3 left-3 w-4 h-4 rounded-xs border border-emerald-600 bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs"
            title="100% Vegetarian / Eggless"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          </div>
        )}

        {/* Signature Bestseller Badge */}
        {product.is_bestseller && (
          <span className="absolute top-3 right-3 bg-[#260D16]/90 backdrop-blur-md text-[#D8B879] border border-[#D8B879]/50 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-xs">
            Signature
          </span>
        )}

        {/* Quick View Floating Button on Hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onQuickView) onQuickView(product);
          }}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#260D16] text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-[#260D16] hover:text-[#D8B879]"
        >
          Quick View
        </button>
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category Tag */}
          <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#9E7D46] font-bold block mb-1">
            {product.category?.name || 'Artisan Gateau'}
          </span>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#160B0D] group-hover:text-[#260D16] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-gray-500">
            <span className="text-[#9E7D46] font-bold flex items-center gap-0.5">
              {product.rating} <Star className="w-3 h-3 fill-[#D8B879] text-[#D8B879] inline" />
            </span>
            <span className="text-gray-400 font-normal">
              • {product.review_count > 50 ? `${(product.review_count / 10).toFixed(1)}K` : product.review_count} reviews
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base sm:text-lg text-[#260D16]">
              ₹{product.discount_price || product.base_price}
            </span>
            {product.discount_price && (
              <span className="text-[11px] text-gray-400 line-through">
                ₹{product.base_price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist Heart Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product);
              }}
              className={`p-1.5 rounded-full hover:bg-[#D8C7B5] text-gray-400 hover:text-[#260D16] transition ${
                isFavorited ? 'text-[#260D16]' : ''
              }`}
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#260D16] text-[#260D16]' : ''}`} />
            </button>

            {/* Quick Add Button */}
            <button
              onClick={handleQuickAdd}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                addedAnimation
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#260D16] text-[#FAF5EE] hover:bg-[#3D121A] active:scale-95'
              }`}
              title="Add to shopping bag"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D8B879]" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

