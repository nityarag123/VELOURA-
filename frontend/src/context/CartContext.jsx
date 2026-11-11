import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('veloura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('veloura_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('veloura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('veloura_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('veloura_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, options = {}) => {
    const unitPrice = options.unitPrice || product.discount_price || product.base_price;
    const quantity = options.quantity || 1;

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_url,
      slug: product.slug,
      weight: options.weight || (product.weights && product.weights[0]) || '0.5 kg',
      flavour: options.flavour || (product.flavours && product.flavours[0]) || 'Belgian Chocolate',
      is_eggless: options.is_eggless !== undefined ? options.is_eggless : true,
      cake_message: options.cake_message || '',
      unit_price: unitPrice,
      quantity: quantity,
      total_price: unitPrice * quantity,
    };

    // Check if duplicate with same customization exists
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product_id === newItem.product_id &&
        item.weight === newItem.weight &&
        item.flavour === newItem.flavour &&
        item.is_eggless === newItem.is_eggless &&
        item.cake_message === newItem.cake_message
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].total_price = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCartItems(updated);
    } else {
      setCartItems((prev) => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    setCartItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      item.quantity = newQty;
      item.total_price = item.quantity * item.unit_price;
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/apply', {
        code,
        order_amount: subtotal,
      });
      setAppliedCoupon(res.data);
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid coupon code';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const deliveryFee = subtotal === 0 || subtotal >= 500 ? 0 : 50;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryFee,
        totalAmount,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
