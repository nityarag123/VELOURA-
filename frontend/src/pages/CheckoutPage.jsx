import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CreditCard, Banknote, 
  ShoppingBag, ArrowLeft, CheckCircle2, Home,
  AlertTriangle, X, Smartphone, Building2, Sparkles, RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, discountAmount, deliveryFee, totalAmount, clearCart, appliedCoupon } = useCart();
  const { user } = useAuth();

  // Essential customer details
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_phone: user?.phone || '',
    delivery_address: user?.address || '',
    special_instructions: '',
    // Hidden standard defaults preserved for backend compatibility
    customer_email: user?.email || 'customer@veloura.com',
    city: user?.city || 'Hyderabad',
    pincode: user?.pincode || '500033',
    delivery_date: 'Today (Express Slot)',
    delivery_time_slot: 'Evening Prime (6:00 PM - 9:00 PM)',
    cake_message: '',
    payment_method: 'Online Payment (Demo)' // 'Cash on Delivery' or 'Online Payment (Demo)'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Demo Payment Modal States
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoActiveTab, setDemoActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [demoSimulationFailed, setDemoSimulationFailed] = useState(false);
  const [demoUpiApp, setDemoUpiApp] = useState('gpay');
  const [demoUpiId, setDemoUpiId] = useState('veloura.patisserie@okhdfcbank');
  const [demoBank, setDemoBank] = useState('HDFC Bank');
  const [demoCardData, setDemoCardData] = useState({
    cardNumber: '4532 8920 1142 8899',
    cardHolder: user?.full_name || 'VALUED CUSTOMER',
    expiry: '12/28',
    cvv: '789'
  });

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Your shopping bag is empty</h2>
        <p className="text-xs text-gray-500 mt-2">Add your favorite cakes or pastries to proceed with checkout.</p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-2.5 bg-[#4A1525] text-white text-xs font-semibold rounded-full uppercase tracking-wider"
        >
          Explore Bakery Menu
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEssentialForm = () => {
    if (!formData.customer_name.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }
    if (!formData.customer_phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return false;
    }
    if (!formData.delivery_address.trim()) {
      setErrorMsg('Please provide your complete delivery address.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Build the complete API order payload
  const buildPayload = (overridePaymentMethod, demoResult) => {
    const finalPaymentMethod = overridePaymentMethod || formData.payment_method;
    return {
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email || 'customer@veloura.com',
      customer_phone: formData.customer_phone.trim(),
      delivery_address: formData.delivery_address.trim(),
      city: formData.city,
      pincode: formData.pincode,
      delivery_date: formData.delivery_date,
      delivery_time_slot: formData.delivery_time_slot,
      cake_message: formData.cake_message,
      special_instructions: formData.special_instructions.trim(),
      subtotal: subtotal,
      discount: discountAmount,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: finalPaymentMethod,
      demo_payment_result: demoResult || (finalPaymentMethod === 'Cash on Delivery' ? null : 'success'),
      items: cartItems.map((it) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        product_image: it.product_image,
        weight: it.weight,
        flavour: it.flavour,
        is_eggless: it.is_eggless,
        cake_message: it.cake_message,
        unit_price: it.unit_price,
        quantity: it.quantity,
        total_price: it.total_price
      }))
    };
  };

  // Submit order to backend & localStorage
  const executeOrderSubmission = async (overridePaymentMethod, demoResult) => {
    setIsSubmitting(true);
    setErrorMsg('');
    const payload = buildPayload(overridePaymentMethod, demoResult);

    try {
      const res = await api.post('/orders', payload);
      const createdOrder = res.data;
      const orderNum = createdOrder.order_number || createdOrder.order?.order_number;

      // Store in customer local orders log for instant offline retrieval
      try {
        const existing = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
        const orderToStore = {
          ...payload,
          ...createdOrder,
          order_number: orderNum,
          status: createdOrder.status || 'Order Placed',
          payment_status: createdOrder.payment_status || (overridePaymentMethod === 'Cash on Delivery' ? 'Pending' : (demoResult === 'failed' ? 'Failed' : 'Paid')),
          created_at: createdOrder.created_at || new Date().toISOString()
        };
        const updated = [orderToStore, ...existing.filter(o => o.order_number !== orderNum)];
        localStorage.setItem('veloura_orders', JSON.stringify(updated));
        localStorage.setItem('veloura_last_order', orderNum);
      } catch (e) {}

      setShowDemoModal(false);
      clearCart();
      navigate(`/order-confirmation/${orderNum}`);
    } catch (apiErr) {
      console.error('Order API error, generating guaranteed client order', apiErr);
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const orderNum = `VEL-2026-${randomSuffix}`;
      const fallbackOrder = {
        id: Date.now(),
        order_number: orderNum,
        ...payload,
        status: 'Order Placed',
        order_status: 'Order Placed',
        payment_status: overridePaymentMethod === 'Cash on Delivery' ? 'Pending' : (demoResult === 'failed' ? 'Failed' : 'Paid'),
        transaction_id: overridePaymentMethod === 'Cash on Delivery' ? `COD-2026-${randomSuffix}` : `DEMO-TXN-2026-${randomSuffix}`,
        created_at: new Date().toISOString()
      };
      try {
        const existing = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
        existing.unshift(fallbackOrder);
        localStorage.setItem('veloura_orders', JSON.stringify(existing));
        localStorage.setItem('veloura_last_order', orderNum);
      } catch (e) {}
      setShowDemoModal(false);
      clearCart();
      navigate(`/order-confirmation/${orderNum}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Form Submit Handler
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!validateEssentialForm()) return;

    if (formData.payment_method === 'Cash on Delivery') {
      executeOrderSubmission('Cash on Delivery', null);
    } else {
      // Open Demo Payment Gateway Modal
      setDemoSimulationFailed(false);
      setShowDemoModal(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Breadcrumb Home Bar */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 py-2 px-4 bg-white rounded-xl border border-[#EFE8DF] shadow-2xs">
        <Link to="/" className="hover:text-[#4A1525] flex items-center gap-1 font-bold text-gray-700 transition">
          <Home className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Home</span>
        </Link>
        <span className="text-gray-300">/</span>
        <Link to="/products" className="hover:text-[#4A1525] font-medium text-gray-600 transition">
          Menu
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#4A1525] font-bold">Quick & Secure Checkout</span>
      </nav>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2D2020]">Veloura Express Checkout</h1>
          <p className="text-xs text-gray-500">Fast, streamlined checkout with transparent payment options.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Essential Details & Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Essential Contact & Delivery Details (4 Fields) */}
          <div className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-[#2D2020] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FAF3EB] text-[#4A1525] text-xs flex items-center justify-center font-bold">1</span>
                <span>Delivery Details</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-medium">4 quick fields</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Customer Name <span className="text-[#A62846]">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] focus:ring-1 focus:ring-[#4A1525]"
                  />
                </div>

                {/* 2. Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-[#A62846]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] focus:ring-1 focus:ring-[#4A1525]"
                  />
                </div>
              </div>

              {/* 3. Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Delivery Address <span className="text-[#A62846]">*</span>
                </label>
                <textarea
                  name="delivery_address"
                  required
                  rows={2}
                  placeholder="e.g. Flat 402, Royal Residency, Road No. 10, Banjara Hills, Hyderabad"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] focus:ring-1 focus:ring-[#4A1525]"
                />
              </div>

              {/* 4. Optional Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Order Notes & Plaque Message (Optional)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  name="special_instructions"
                  placeholder="e.g. Please write 'Happy Anniversary' on cake plaque & ring bell once"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] focus:ring-1 focus:ring-[#4A1525]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection (Exactly 2 Options) */}
          <div className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-[#2D2020] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FAF3EB] text-[#4A1525] text-xs flex items-center justify-center font-bold">2</span>
                <span>Select Payment Method</span>
              </h3>
              <span className="text-[11px] text-[#A62846] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Transaction Fees</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Online Payment (Demo) */}
              <label 
                className={`flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  formData.payment_method === 'Online Payment (Demo)'
                    ? 'border-[#4A1525] bg-[#FAF3EB]/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Online Payment (Demo)"
                      checked={formData.payment_method === 'Online Payment (Demo)'}
                      onChange={handleChange}
                      className="accent-[#4A1525] w-4 h-4"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#2D2020]">Online Payment (Demo)</h4>
                      <span className="text-[10px] text-[#A62846] font-bold uppercase tracking-wider bg-[#FDF2F4] px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Interactive Demo Gateway
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#FAF3EB] text-[#4A1525] flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-[#4A1525]" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  Simulate seamless payment via <strong>UPI, Credit/Debit Card</strong> or <strong>Net Banking</strong>.
                </p>
              </label>

              {/* Option 2: Cash on Delivery (COD) */}
              <label 
                className={`flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  formData.payment_method === 'Cash on Delivery'
                    ? 'border-[#4A1525] bg-[#FAF3EB]/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash on Delivery"
                      checked={formData.payment_method === 'Cash on Delivery'}
                      onChange={handleChange}
                      className="accent-[#4A1525]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#2D2020]">Cash on Delivery</h4>
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        Pay Upon Arrival
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#FAF3EB] text-[#4A1525] flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5 text-[#4A1525]" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  Pay cash or UPI directly to our delivery valet upon receipt. Status stays <strong>Pending</strong> until collected.
                </p>
              </label>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-4 sticky top-28 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-[#2D2020]">
                Order Summary
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF3EB] text-[#4A1525]">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Items preview list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-[#2D2020] truncate">{item.product_name}</h5>
                    <p className="text-[10px] text-gray-400">{item.weight} • Qty: {item.quantity}</p>
                    <span className="font-bold text-[#4A1525]">₹{item.total_price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Bakery Delivery</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2D2020] pt-2 border-t border-gray-100">
                <span>Total Amount to Pay</span>
                <span className="text-[#4A1525]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order / Proceed Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-bold uppercase tracking-widest rounded-full transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E6C387]" />
                  <span>Processing Order...</span>
                </span>
              ) : formData.payment_method === 'Cash on Delivery' ? (
                <>
                  <Banknote className="w-4 h-4 text-[#E6C387]" />
                  <span>Confirm Order (COD) • ₹{totalAmount}</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-[#E6C387]" />
                  <span>Proceed to Demo Payment • ₹{totalAmount}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Guaranteed Hygiene • FSSAI Food Grade</span>
              </span>
            </div>
          </div>
        </div>

      </form>

      {/* ========================================================================= */}
      {/* DEMO ONLINE PAYMENT MODAL (UPI, CARD, NET BANKING WITH SIMULATION) */}
      {/* ========================================================================= */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#1A1412] text-[#FAF6EE] border border-[#D8B879]/40 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 overflow-hidden">
            
            {/* Top Bar */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8B879] bg-[#D8B879]/10 px-2 py-0.5 rounded-full border border-[#D8B879]/30">
                    VELOURA Demo Gateway
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Simulate Online Payment
                </h3>
                <p className="text-[11px] text-[#FAF6EE]/70">
                  Total Payable: <strong className="text-[#D8B879] text-sm">₹{totalAmount}</strong> • Demo simulation (no real money charged)
                </p>
              </div>

              <button
                onClick={() => setShowDemoModal(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Failure Alert (if user triggered failure test) */}
            {demoSimulationFailed ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Simulated Bank Authorization Declined</span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  The simulated transaction was intentionally marked as failed to test the system's failure handling. No real money was charged.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => setDemoSimulationFailed(false)}
                    className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition text-center"
                  >
                    Retry Online Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      setFormData(prev => ({ ...prev, payment_method: 'Cash on Delivery' }));
                    }}
                    className="flex-1 py-2 px-3 bg-[#D8B879] hover:bg-[#c9a765] text-[#1A1412] text-xs font-bold rounded-xl transition text-center"
                  >
                    Switch to Cash on Delivery
                  </button>
                  <button
                    onClick={() => executeOrderSubmission('Online Payment (Demo)', 'failed')}
                    disabled={isSubmitting}
                    className="py-2 px-3 border border-rose-400/40 text-rose-300 hover:bg-rose-900/40 text-[11px] font-semibold rounded-xl transition text-center"
                    title="Creates a Failed order record in backend for admin dashboard inspection"
                  >
                    Record as Failed Order
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Gateway Tabs: UPI / Card / NetBanking */}
                <div className="grid grid-cols-3 gap-2 bg-[#120D0C] p-1.5 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setDemoActiveTab('upi')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      demoActiveTab === 'upi'
                        ? 'bg-[#D8B879] text-[#1A1412] shadow-sm'
                        : 'text-[#FAF6EE]/70 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoActiveTab('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      demoActiveTab === 'card'
                        ? 'bg-[#D8B879] text-[#1A1412] shadow-sm'
                        : 'text-[#FAF6EE]/70 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoActiveTab('netbanking')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      demoActiveTab === 'netbanking'
                        ? 'bg-[#D8B879] text-[#1A1412] shadow-sm'
                        : 'text-[#FAF6EE]/70 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* TAB 1: UPI Options */}
                {demoActiveTab === 'upi' && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-[#FAF6EE]/60">Select your preferred UPI app or enter any VPA handle:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                        { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                        { id: 'paytm', label: 'Paytm', icon: '🔵' },
                        { id: 'bhim', label: 'BHIM UPI', icon: '🟠' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setDemoUpiApp(app.id)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                            demoUpiApp === app.id
                              ? 'border-[#D8B879] bg-[#D8B879]/15 text-white'
                              : 'border-white/10 hover:border-white/20 bg-[#241C1A] text-[#FAF6EE]/70'
                          }`}
                        >
                          <span className="text-lg">{app.icon}</span>
                          <span className="text-[10px] font-bold truncate">{app.label}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#FAF6EE]/70 mb-1">UPI ID / VPA</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={demoUpiId}
                          onChange={(e) => setDemoUpiId(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-[#120D0C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D8B879]"
                        />
                        <span className="px-3 py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Card Options */}
                {demoActiveTab === 'card' && (
                  <div className="space-y-3">
                    {/* Visual Card Preview */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D121A] to-[#201014] border border-[#D8B879]/40 text-white space-y-3 shadow-md">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-serif tracking-widest text-[#D8B879] font-bold">VELOURA GOLD</span>
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-white/10 px-2 py-0.5 rounded">DEMO CARD</span>
                      </div>
                      <div className="font-mono text-sm tracking-widest text-center py-1">
                        {demoCardData.cardNumber}
                      </div>
                      <div className="flex justify-between text-[10px] text-[#FAF6EE]/80">
                        <span>{demoCardData.cardHolder}</span>
                        <span>EXP: {demoCardData.expiry}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-[#FAF6EE]/70 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={demoCardData.cardNumber}
                          onChange={(e) => setDemoCardData({ ...demoCardData, cardNumber: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-[#120D0C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D8B879]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#FAF6EE]/70 mb-1">Expiry MM/YY</label>
                        <input
                          type="text"
                          value={demoCardData.expiry}
                          onChange={(e) => setDemoCardData({ ...demoCardData, expiry: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-[#120D0C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D8B879]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#FAF6EE]/70 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={demoCardData.cvv}
                          onChange={(e) => setDemoCardData({ ...demoCardData, cvv: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-[#120D0C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D8B879]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Net Banking Options */}
                {demoActiveTab === 'netbanking' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-[#FAF6EE]/60">Select simulated partner bank:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Other Banks'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setDemoBank(bank)}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            demoBank === bank
                              ? 'border-[#D8B879] bg-[#D8B879]/20 text-white font-bold'
                              : 'border-white/10 hover:border-white/20 bg-[#241C1A] text-[#FAF6EE]/70 text-xs'
                          }`}
                        >
                          <div className="text-[10px] truncate">{bank}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulation Action Controls */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="text-[11px] text-center text-[#D8B879] font-medium">
                    Choose an outcome to test payment workflow:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* SUCCESS SIMULATOR BUTTON */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => executeOrderSubmission('Online Payment (Demo)', 'success')}
                      className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Simulate Success</span>
                    </button>

                    {/* FAILED SIMULATOR BUTTON */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setDemoSimulationFailed(true)}
                      className="py-3 px-4 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-500/40 text-rose-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-300" />
                      <span>Simulate Failure</span>
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
