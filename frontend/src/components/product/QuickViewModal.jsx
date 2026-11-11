import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedWeight, setSelectedWeight] = useState(
    product?.weights?.[0] || '0.5 kg'
  );
  const [selectedFlavour, setSelectedFlavour] = useState(
    product?.flavours?.[0] || 'Belgian Dark Truffle'
  );
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState('');
  const [activeImage, setActiveImage] = useState(product?.image_url);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  // Calculate dynamic price based on weight
  const baseRate = product.discount_price || product.base_price;
  let multiplier = 1.0;
  if (selectedWeight.includes('1.0 kg') || selectedWeight.includes('1 kg')) multiplier = 1.85;
  else if (selectedWeight.includes('1.5 kg')) multiplier = 2.7;
  else if (selectedWeight.includes('2.0 kg') || selectedWeight.includes('2 kg')) multiplier = 3.5;
  else if (selectedWeight.includes('12') || selectedWeight.includes('Deluxe') || selectedWeight.includes('Box of 4') || selectedWeight.includes('Box of 12')) multiplier = 1.9;
  else if (selectedWeight.includes('Large') || selectedWeight.includes('Pair') || selectedWeight.includes('Combo')) multiplier = 1.35;
  else if (selectedWeight.includes('Flask') || selectedWeight.includes('Venti') || selectedWeight.includes('Carafe')) multiplier = 1.8;

  const currentPrice = Math.round(baseRate * multiplier);
  const isDrink = product.category?.slug === 'coffee-brews';
  const isCafe = product.category?.slug === 'cafe-savory';
  const isDrinkOrCafe = isDrink || isCafe;

  const handleAdd = () => {
    addToCart(product, {
      weight: selectedWeight,
      flavour: selectedFlavour,
      is_eggless: isEggless,
      cake_message: cakeMessage,
      quantity: 1,
      unitPrice: currentPrice,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#F0E6DA] relative max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-black flex items-center justify-center transition shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Box */}
        <div className="md:w-1/2 p-6 bg-[#FAF3EB] flex flex-col justify-between">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-[#4A1525]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Customization Details Box */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#A62846]">
                {product.category?.name || 'Veloura Exclusive'}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-1.5 rounded-full transition ${isFavorited ? 'text-[#A62846]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2D2020] leading-tight">
              {product.name}
            </h2>

            {/* Rating & Pricing */}
            <div className="flex items-center gap-3 my-2.5">
              <div className="flex items-center gap-1 bg-[#FFF8E7] text-[#8C6418] px-2 py-0.5 rounded-md text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-gray-400">({product.review_count} verified reviews)</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-extrabold text-[#4A1525]">₹{currentPrice}</span>
              {product.discount_price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{Math.round(product.base_price * multiplier)}
                </span>
              )}
            </div>

            {/* Weight / Size Selector */}
            {product.weights && product.weights.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isDrink ? 'Cup Size / Volume' : isCafe ? 'Portion / Combo' : 'Select Size / Weight'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                        selectedWeight === w
                          ? 'bg-[#4A1525] text-white border-[#4A1525]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavour Selector */}
            {product.flavours && product.flavours.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {isDrink ? 'Milk / Roast Preference' : isCafe ? 'Preparation Style' : 'Select Flavour'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.flavours.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavour(f)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                        selectedFlavour === f
                          ? 'bg-[#FAF3EB] text-[#4A1525] border-[#4A1525]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eggless Option Toggle */}
            <div className="mb-4 flex items-center justify-between p-2.5 rounded-xl bg-[#FAF3EB] border border-[#EFE5DB]">
              <span className="text-xs font-semibold text-[#2D2020]">
                {isDrink ? '100% Plant & Dairy Handcrafted' : '100% Eggless Preparation'}
              </span>
              <button
                type="button"
                onClick={() => setIsEggless(!isEggless)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isEggless ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    isEggless ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Custom Instructions / Message */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {isDrinkOrCafe ? 'Barista & Chef Instructions' : 'Message on Cake (Free Edible Plaque)'}
              </label>
              <input
                type="text"
                maxLength={30}
                placeholder={isDrink ? 'e.g. Extra hot, oat milk, less sugar' : isCafe ? 'e.g. Well toasted, serve warm' : 'e.g. Happy Birthday Sahil!'}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleAdd}
              className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#4A1525] hover:bg-[#6E1C34] text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag • ₹{currentPrice}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
