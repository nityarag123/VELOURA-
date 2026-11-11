import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, 
  Tag, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    deliveryFee,
    totalAmount,
    totalItemCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(code.trim());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Slide-out Drawer Container */}
      <div className="w-full max-w-md bg-[#FFFDF9] h-full shadow-2xl flex flex-col justify-between border-l border-[#F0E6DA] animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F0E6DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#4A1525]" />
            <h3 className="font-serif text-lg font-bold text-[#2D2020]">
              Your Sweet Bag ({totalItemCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF3EB] text-[#4A1525] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#2D2020]">Your bag is empty</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Explore our signature Belgian chocolate cakes, French macarons, and celebratory treats.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                className="mt-5 px-6 py-2.5 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-semibold rounded-full uppercase tracking-wider transition shadow-sm"
              >
                Browse Bakery Menu
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.product_id}-${index}`}
                className="flex gap-3 p-3 bg-white rounded-2xl border border-[#F0E6DA] relative shadow-2xs"
              >
                {/* Thumbnail */}
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-100 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-bold text-[#2D2020] truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.weight} • {item.flavour}
                  </p>
                  {item.cake_message && (
                    <p className="text-[10px] text-[#A62846] italic truncate mt-0.5">
                      "{item.cake_message}"
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs font-bold text-[#4A1525]">
                      ₹{item.total_price}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-[#E5D7CA] rounded-full px-2 py-0.5 bg-[#FAF3EB]">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="text-gray-500 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold text-gray-700 min-w-3 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="text-gray-500 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(index)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer & Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-[#F0E6DA] bg-white space-y-3">
            
            {/* Coupon Code Box */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount_amount})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter promo coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs border border-[#E5D7CA] rounded-xl uppercase tracking-wider focus:outline-none focus:border-[#4A1525]"
                    />
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-[#FAF3EB] hover:bg-[#4A1525] text-[#4A1525] hover:text-white border border-[#EADCCF] rounded-xl text-xs font-semibold transition"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}

                {/* Quick Coupon Chips */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400 font-medium">Popular:</span>
                  <button
                    onClick={() => handleApplyCoupon('VELOURA10')}
                    className="text-[10px] bg-[#FDF2F4] text-[#A62846] font-semibold px-2 py-0.5 rounded-md hover:bg-[#FBE4E8] transition"
                  >
                    VELOURA10 (10% OFF)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('SWEETDEAL')}
                    className="text-[10px] bg-[#FDF2F4] text-[#A62846] font-semibold px-2 py-0.5 rounded-md hover:bg-[#FBE4E8] transition"
                  >
                    SWEETDEAL (15% OFF)
                  </button>
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Express Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#2D2020] pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-[#4A1525] text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
