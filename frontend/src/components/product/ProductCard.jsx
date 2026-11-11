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
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* Product Image Box */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF9F9]">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* FSSAI Green Vegetarian / Eggless Square Dot in Top-Left */}
        {product.is_eggless_available && (
          <div 
            className="absolute top-2.5 left-2.5 w-4 h-4 rounded-xs border-1.5 border-emerald-600 bg-white flex items-center justify-center shadow-xs"
            title="100% Vegetarian / Eggless"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
        )}

        {/* Bestseller Tag */}
        {product.is_bestseller && (
          <span className="absolute top-2.5 right-2.5 bg-[#FF6B6B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Best Seller
          </span>
        )}
      </div>

      {/* Content Details (Matching Bakingo screenshot) */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#E31837] transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Price & Wishlist Row */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-gray-900">
                ₹{product.discount_price || product.base_price}
              </span>
              {product.discount_price && (
                <span className="text-[11px] text-gray-400 line-through">
                  ₹{product.base_price}
                </span>
              )}
            </div>

            {/* Wishlist Heart Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product);
              }}
              className={`p-1 text-gray-400 hover:text-[#E31837] transition ${
                isFavorited ? 'text-[#E31837]' : ''
              }`}
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-gray-700">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              {product.rating} <Star className="w-3 h-3 fill-current text-emerald-600 inline" />
            </span>
            <span className="text-gray-400 font-normal">
              ({product.review_count > 50 ? `${(product.review_count / 10).toFixed(1)}K` : product.review_count} Reviews)
            </span>
          </div>
        </div>

        {/* Quick Add Button on Hover */}
        <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onQuickView) onQuickView(product);
            }}
            className="text-[11px] font-semibold text-gray-500 hover:text-black underline"
          >
            Customise
          </button>

          <button
            onClick={handleQuickAdd}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-2xs ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-red-50 text-[#E31837] hover:bg-[#E31837] hover:text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
