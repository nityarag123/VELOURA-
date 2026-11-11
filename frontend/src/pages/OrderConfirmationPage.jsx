import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, ChefHat, Truck, PackageCheck, 
  MapPin, Calendar, ShoppingBag, ArrowRight, Printer 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const ORDER_STEPS = [
  { status: 'Order Placed', label: 'Order Placed', icon: ShoppingBag, desc: 'Your celebration order has been received' },
  { status: 'Confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Artisan bakery verified ingredients & slot' },
  { status: 'Baking', label: 'Baking in Oven', icon: ChefHat, desc: 'Fresh sponge baking with pure Belgian chocolate' },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Chilled delivery van heading to your doorstep' },
  { status: 'Delivered', label: 'Delivered', icon: PackageCheck, desc: 'Delivered fresh and ready for sweet memories' }
];

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/track/${orderNumber}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Order not found</h2>
        <Link to="/" className="text-xs text-[#A62846] underline mt-2 inline-block">Return to Homepage</Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex(
    (s) => s.status.toLowerCase() === (order.status || 'Order Placed').toLowerCase()
  );
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0E6DA] text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2020]">
          Thank You, {order.customer_name}!
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Your order has been forwarded to our master pâtissiers. A confirmation has been sent to <strong>{order.customer_email}</strong>.
        </p>

        <div className="inline-block p-3 rounded-2xl bg-[#FAF3EB] border border-[#EADCCF] text-xs">
          <span className="text-gray-500">Tracking Reference: </span>
          <span className="font-bold text-[#4A1525] text-sm tracking-wider font-mono">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Live Order Status Progression */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0E6DA] space-y-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2D2020]">Live Order Tracking</h3>
            <p className="text-xs text-gray-400">Current Status: <strong className="text-[#4A1525]">{order.status}</strong></p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Steps Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-[#4A1525] text-white ring-4 ring-[#4A1525]/20 scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className={`text-xs font-bold ${isCompleted ? 'text-[#2D2020]' : 'text-gray-400'}`}>
                  {step.label}
                </h4>
                <p className="text-[10px] text-gray-400 max-w-[130px] leading-tight hidden sm:block">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delivery Details */}
        <div className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-4 shadow-2xs">
          <h3 className="font-serif text-base font-bold text-[#2D2020] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4A1525]" />
            <span>Delivery Destination</span>
          </h3>

          <div className="space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-[#2D2020]">{order.customer_name}</p>
            <p>{order.delivery_address}</p>
            <p>{order.city} - {order.pincode}</p>
            <p className="text-gray-400">Phone: {order.customer_phone}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-[#4A1525]" />
              <span>Date: <strong>{order.delivery_date}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Clock className="w-3.5 h-3.5 text-[#4A1525]" />
              <span>Slot: <strong>{order.delivery_time_slot}</strong></span>
            </div>
            {order.cake_message && (
              <div className="pt-2 text-xs text-[#A62846] italic">
                Plaque: "{order.cake_message}"
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-6 bg-white rounded-3xl border border-[#F0E6DA] space-y-4 shadow-2xs">
          <h3 className="font-serif text-base font-bold text-[#2D2020] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#4A1525]" />
            <span>Ordered Delights</span>
          </h3>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex gap-3 text-xs">
                <img
                  src={it.product_image}
                  alt={it.product_name}
                  className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-[#2D2020] truncate">{it.product_name}</h5>
                  <p className="text-[10px] text-gray-400">{it.weight} • Qty: {it.quantity}</p>
                  <span className="font-bold text-[#4A1525]">₹{it.total_price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount Savings</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#2D2020] pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <span className="text-[#4A1525]">₹{order.total_amount}</span>
            </div>
            <p className="text-[10px] text-gray-400 pt-1">
              Payment via {order.payment_method} ({order.payment_status})
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-bold uppercase tracking-wider rounded-full transition shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
