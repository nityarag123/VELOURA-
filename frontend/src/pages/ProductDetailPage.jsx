import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingBag, Truck, ShieldCheck, 
  Clock, Check, MapPin, Calendar, Sparkles, MessageSquarePlus, AlertCircle, Home
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';
import { MOCK_PRODUCTS } from '../data/mockData';

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Slot (9:00 AM - 1:00 PM)', fee: 0 },
  { id: 'afternoon', label: 'Afternoon Slot (1:00 PM - 5:00 PM)', fee: 0 },
  { id: 'evening', label: 'Evening Prime (6:00 PM - 9:00 PM)', fee: 0 },
  { id: 'midnight', label: 'Midnight Surprise (11:00 PM - 12:00 AM)', fee: 150 }
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Customization choices
  const [selectedWeight, setSelectedWeight] = useState('0.5 kg');
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Delivery options
  const [pincode, setPincode] = useState('400001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Added animation state
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data && res.data.name) {
          setProduct(res.data);
          setActiveImage(res.data.image_url);
          if (res.data.weights?.length) setSelectedWeight(res.data.weights[0]);
          if (res.data.flavours?.length) setSelectedFlavour(res.data.flavours[0]);

          const relRes = await api.get(`/products?category=${res.data.category?.slug || ''}`);
          if (Array.isArray(relRes.data) && relRes.data.length > 0) {
            setRelatedProducts(relRes.data.filter((p) => p.id !== res.data.id).slice(0, 4));
          } else {
            setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.category_slug === (res.data.category?.slug || res.data.category_slug) && p.id !== res.data.id).slice(0, 4));
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching product', err);
      }

      // Robust fallback directly from MOCK_PRODUCTS
      const fallbackProd = MOCK_PRODUCTS.find(p => p.slug === slug || String(p.id) === slug);
      if (fallbackProd) {
        setProduct({
          ...fallbackProd,
          category: { name: fallbackProd.category_name, slug: fallbackProd.category_slug },
          weights: fallbackProd.weight_options || ['0.5 kg', '1.0 kg', '1.5 kg', '2.0 kg'],
          flavours: fallbackProd.flavour_options || ['Belgian Dark Truffle', 'Swiss Milk Chocolate'],
          reviews: [
            { id: 1, user_name: "Priya Sharma", rating: 5, comment: "Absolutely divine! The Belgian chocolate was so rich and moist." },
            { id: 2, user_name: "Rahul Verma", rating: 5, comment: "Ordered for our anniversary. Arrived in perfect condition and tasted heavenly." }
          ]
        });
        setActiveImage(fallbackProd.image_url);
        if (fallbackProd.weight_options?.length) setSelectedWeight(fallbackProd.weight_options[0]);
        if (fallbackProd.flavour_options?.length) setSelectedFlavour(fallbackProd.flavour_options[0]);
        setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.category_slug === fallbackProd.category_slug && p.id !== fallbackProd.id).slice(0, 4));
      }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500 font-medium tracking-wider">Preparing gourmet details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="text-xs text-[#A62846] underline mt-2 inline-block">
          Return to Bakery Menu
        </Link>
      </div>
    );
  }

  // Price Calculation
  const baseRate = product.discount_price || product.base_price;
  let multiplier = 1.0;
  if (selectedWeight.includes('1.0 kg') || selectedWeight.includes('1 kg')) multiplier = 1.85;
  else if (selectedWeight.includes('1.5 kg')) multiplier = 2.7;
  else if (selectedWeight.includes('2.0 kg') || selectedWeight.includes('2 kg')) multiplier = 3.5;
  else if (selectedWeight.includes('12') || selectedWeight.includes('Deluxe') || selectedWeight.includes('Box of 4') || selectedWeight.includes('Box of 12')) multiplier = 1.9;
  else if (selectedWeight.includes('Large') || selectedWeight.includes('Pair') || selectedWeight.includes('Combo')) multiplier = 1.35;
  else if (selectedWeight.includes('Flask') || selectedWeight.includes('Venti') || selectedWeight.includes('Carafe')) multiplier = 1.8;

  const unitPrice = Math.round(baseRate * multiplier);
  const totalPrice = unitPrice * quantity;
  const isFavorited = isInWishlist(product.id);
  const isDrink = product.category?.slug === 'coffee-brews';
  const isCafe = product.category?.slug === 'cafe-savory';
  const isDrinkOrCafe = isDrink || isCafe;

  const handleAddToCart = () => {
    addToCart(product, {
      weight: selectedWeight,
      flavour: selectedFlavour,
      is_eggless: isEggless,
      cake_message: cakeMessage,
      quantity: quantity,
      unitPrice: unitPrice,
      delivery_date: deliveryDate,
      delivery_slot: selectedSlot.label
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, {
      weight: selectedWeight,
      flavour: selectedFlavour,
      is_eggless: isEggless,
      cake_message: cakeMessage,
      quantity: quantity,
      unitPrice: unitPrice,
      delivery_date: deliveryDate,
      delivery_slot: selectedSlot.label
    });
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewSuccess('');
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setProduct((prev) => ({
        ...prev,
        reviews: [res.data, ...(prev.reviews || [])],
        review_count: prev.review_count + 1
      }));
      setReviewComment('');
      setReviewSuccess('Thank you! Your verified review has been published.');
      setTimeout(() => setShowReviewForm(false), 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
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
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-[#4A1525] font-medium text-gray-600 transition">
          {product.category?.name || 'Catalog'}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-[#4A1525] font-bold truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#FAF3EB] border border-[#F0E6DA] shadow-sm">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_bestseller && (
              <span className="absolute top-4 left-4 bg-[#E6C387] text-[#2D0C16] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Bestseller
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition shadow-md ${
                isFavorited ? 'bg-[#A62846] text-white' : 'bg-white text-gray-600 hover:text-[#A62846]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-[#4A1525] ring-2 ring-[#4A1525]/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Luxury Highlights Box */}
          <div className="p-5 rounded-2xl bg-[#FAF3EB] border border-[#EFE5DB] grid grid-cols-3 gap-3 text-center text-xs">
            <div className="space-y-1">
              <Clock className="w-5 h-5 mx-auto text-[#4A1525]" />
              <p className="font-bold text-[#2D2020]">2-Hour Delivery</p>
              <p className="text-[10px] text-gray-500">Express available</p>
            </div>
            <div className="space-y-1 border-x border-[#EADCCF]">
              <Sparkles className="w-5 h-5 mx-auto text-[#D4AF37]" />
              <p className="font-bold text-[#2D2020]">100% Belgian</p>
              <p className="text-[10px] text-gray-500">Callebaut cocoa</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600" />
              <p className="font-bold text-[#2D2020]">Freshness Lock</p>
              <p className="text-[10px] text-gray-500">Zero preservatives</p>
            </div>
          </div>
        </div>

        {/* Right: Customization & Buy Options */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#A62846]">
              {product.category?.name || 'Veloura Pâtisserie'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2020] mt-1">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex items-center gap-1 bg-[#FFF8E7] text-[#8C6418] px-2.5 py-1 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-gray-500 underline cursor-pointer">
                {product.review_count} Verified Customer Reviews
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-3xl font-extrabold text-[#4A1525]">₹{unitPrice}</span>
              {product.discount_price && (
                <span className="text-base text-gray-400 line-through">
                  ₹{Math.round(product.base_price * multiplier)}
                </span>
              )}
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Inclusive of all taxes
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-4 border-t border-[#F0E6DA] space-y-5">
            
            {/* Weight / Size Selector */}
            {product.weights && product.weights.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {isDrink ? '1. Select Cup Size / Volume' : isCafe ? '1. Select Portion / Combo' : '1. Select Size / Weight'}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-4 py-2 text-xs font-semibold rounded-2xl border transition ${
                        selectedWeight === w
                          ? 'bg-[#4A1525] text-white border-[#4A1525] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavour Options */}
            {product.flavours && product.flavours.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {isDrink ? '2. Choose Milk / Roast Profile' : isCafe ? '2. Choose Preparation Style' : '2. Choose Flavour Profile'}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.flavours.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavour(f)}
                      className={`px-4 py-2 text-xs font-semibold rounded-2xl border transition ${
                        selectedFlavour === f
                          ? 'bg-[#FAF3EB] text-[#4A1525] border-[#4A1525] font-bold'
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF3EB] border border-[#EFE5DB]">
              <div>
                <p className="text-xs font-bold text-[#2D2020]">
                  {isDrink ? '100% Plant & Dairy Handcrafted' : '100% Eggless Preparation'}
                </p>
                <p className="text-[10px] text-gray-500">
                  {isDrink ? 'Crafted with premium beans and choice of dairy or plant milk' : 'Baked without eggs using pure artisanal ingredients'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEggless(!isEggless)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                {isDrinkOrCafe ? '3. Barista & Chef Special Instructions' : '3. Message on Cake (Free Chocolate Plaque)'}
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder={isDrink ? 'e.g. Extra hot, oat milk, less sugar' : isCafe ? 'e.g. Well toasted, serve warm, no onions' : 'e.g. Happy 25th Anniversary Mom & Dad'}
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] bg-white"
              />
              <span className="text-[10px] text-gray-400 block mt-1">Maximum 40 characters</span>
            </div>

            {/* Delivery Date & Time Slot Selector */}
            <div className="p-4 rounded-2xl border border-[#F0E6DA] bg-white space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                4. Select Delivery Date & Time Slot
              </label>

              {/* Date Options */}
              <div className="grid grid-cols-3 gap-2">
                {['Today', 'Tomorrow', 'Day After'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeliveryDate(d)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      deliveryDate === d
                        ? 'bg-[#4A1525] text-white border-[#4A1525]'
                        : 'bg-[#FAF3EB] text-gray-700 border-[#EADCCF]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-1.5 pt-1">
                {TIME_SLOTS.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedSlot.id === slot.id
                        ? 'border-[#4A1525] bg-[#FDF2F4] text-[#4A1525] font-semibold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timeSlot"
                        checked={selectedSlot.id === slot.id}
                        onChange={() => setSelectedSlot(slot)}
                        className="accent-[#4A1525]"
                      />
                      <span>{slot.label}</span>
                    </div>
                    <span>{slot.fee === 0 ? <strong className="text-emerald-700">FREE</strong> : `+₹${slot.fee}`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="pt-4 border-t border-[#F0E6DA] space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase">Quantity:</span>
                <div className="flex items-center border border-[#E5D7CA] rounded-full px-3 py-1 bg-[#FAF3EB]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-black font-bold px-1"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-[#2D2020] px-3">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 hover:text-black font-bold px-1"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm font-bold text-[#4A1525] ml-auto">
                  Total: ₹{totalPrice}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAF3EB] hover:bg-[#F5EAD9] text-[#4A1525] border border-[#EADCCF]'
                  }`}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{added ? 'Added to Bag' : 'Add to Bag'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 bg-[#4A1525] hover:bg-[#6E1C34] text-white rounded-full text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Order Now • ₹{totalPrice}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Customer Reviews & Feedback Section */}
      <section className="bg-white rounded-3xl border border-[#F0E6DA] p-6 sm:p-10 space-y-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#2D2020]">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Authentic feedback from verified celebration buyers.
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF3EB] text-[#4A1525] hover:bg-[#4A1525] hover:text-white border border-[#EADCCF] text-xs font-bold uppercase tracking-wider transition"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Review Form Drawer */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-[#FAF3EB] border border-[#EFE5DB] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A1525]">
              Share Your Sweet Experience
            </h4>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-[#D4AF37]"
                  >
                    <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Review</label>
              <textarea
                required
                rows={3}
                placeholder="How was the taste, packaging, and delivery experience?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5D7CA] rounded-xl focus:outline-none focus:border-[#4A1525] bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-2 bg-[#4A1525] hover:bg-[#6E1C34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
            >
              {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF3EB]/50 border border-[#F0E6DA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D2020]">{rev.user_name}</span>
                  <div className="flex text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(rev.rating) ? 'fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Verified Purchase • {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">No customer reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </section>

      {/* Related Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-[#2D2020]">
              You May Also Love
            </h3>
            <Link to="/products" className="text-xs text-[#A62846] font-bold hover:underline">
              View All Bakes →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
