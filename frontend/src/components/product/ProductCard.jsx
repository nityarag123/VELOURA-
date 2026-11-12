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
    <div className="group relative bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#EFE8DF] hover:border-[#C5A059]/60 hover:shadow-[0_12px_30px_rgba(74,21,37,0.08)] transition-all duration-300 flex flex-col">
      
      {/* Product Image Box */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF6F0]">
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
            className="absolute top-3 left-3 w-4 h-4 rounded-xs border border-emerald-600 bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-xs"
            title="100% Vegetarian / Eggless"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          </div>
        )}

        {/* Bestseller Tag */}
        {product.is_bestseller && (
          <span className="absolute top-3 right-3 bg-[#C5A059] text-[#1F0A10] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Signature
          </span>
        )}
      </div>

      {/* Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D2020] group-hover:text-[#4A1525] transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Price & Wishlist Row */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-[#3D121A]">
                ₹{product.discount_price || product.base_price}
              </span>
              {product.discount_price && (
                <span className="text-[11px] text-[#A68890] line-through">
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
              className={`p-1 text-gray-400 hover:text-[#4A1525] transition ${
                isFavorited ? 'text-[#4A1525]' : ''
              }`}
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#4A1525] text-[#4A1525]' : ''}`} />
            </button>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-gray-600">
            <span className="text-[#8C6D4C] font-bold flex items-center gap-0.5">
              {product.rating} <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059] inline" />
            </span>
            <span className="text-gray-400 font-normal">
              ({product.review_count > 50 ? `${(product.review_count / 10).toFixed(1)}K` : product.review_count} Reviews)
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="pt-3 mt-2.5 border-t border-[#F4EFEA] flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onQuickView) onQuickView(product);
            }}
            className="text-[11px] font-medium text-[#8C6D4C] hover:text-[#3D121A] hover:underline"
          >
            Customise
          </button>

          <button
            onClick={handleQuickAdd}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-2xs ${
              addedAnimation
                ? 'bg-emerald-700 text-white'
                : 'bg-[#FAF5EE] text-[#4A1525] border border-[#E8DEC8] hover:bg-[#4A1525] hover:text-white'
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

