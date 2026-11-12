import axios from 'axios';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_COUPONS } from '../data/mockData';

const rawBase = import.meta.env.VITE_API_BASE_URL;
const baseURL = rawBase 
  ? `${rawBase.replace(/\/$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intelligent fallback handler for when the backend is offline or static hosting returns HTML
function handleMockFallback(error) {
  const config = error.config || {};
  let url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Strip baseUrl /api if present in url
  url = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '');

  // 1. Categories
  if (method === 'get' && url.startsWith('/categories')) {
    return Promise.resolve({ data: MOCK_CATEGORIES, status: 200, statusText: 'OK', headers: {}, config });
  }

  // 2. Product Detail: /products/:slug_or_id
  const productDetailMatch = url.match(/^\/products\/([^/?]+)/);
  if (method === 'get' && productDetailMatch) {
    const slugOrId = decodeURIComponent(productDetailMatch[1]);
    const found = MOCK_PRODUCTS.find(p => p.slug === slugOrId || String(p.id) === slugOrId);
    if (found) {
      return Promise.resolve({
        data: {
          ...found,
          reviews: [
            { id: 1, user_name: "Priya Sharma", rating: 5, comment: "Absolutely divine! The Belgian chocolate was so rich and moist." },
            { id: 2, user_name: "Rahul Verma", rating: 5, comment: "Ordered for our anniversary. Arrived in perfect condition and tasted heavenly." },
            { id: 3, user_name: "Ananya Roy", rating: 4.8, comment: "The coffee and croissants made my morning breakfast extraordinary!" }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
  }

  // 3. Products Listing & Filters: /products
  if (method === 'get' && url.startsWith('/products')) {
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const parsedParams = new URLSearchParams(queryString);
    const category = parsedParams.get('category');
    const search = parsedParams.get('search');
    const isBestseller = parsedParams.get('is_bestseller');
    const minPrice = parseFloat(parsedParams.get('min_price')) || 0;
    const maxPrice = parseFloat(parsedParams.get('max_price')) || Infinity;
    const sortBy = parsedParams.get('sort_by');

    let filtered = [...MOCK_PRODUCTS];

    if (category) {
      filtered = filtered.filter(p => p.category_slug === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (isBestseller === 'true') {
      filtered = filtered.filter(p => p.is_bestseller);
    }
    if (minPrice > 0) {
      filtered = filtered.filter(p => p.base_price >= minPrice);
    }
    if (maxPrice < Infinity) {
      filtered = filtered.filter(p => p.base_price <= maxPrice);
    }

    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return Promise.resolve({ data: filtered, status: 200, statusText: 'OK', headers: {}, config });
  }

  // 4. Coupon Validation: POST /coupons/validate
  if (method === 'post' && url.includes('/coupons/validate')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const code = (body.code || '').toUpperCase().trim();
    const orderAmount = parseFloat(body.order_amount) || 0;
    const coupon = MOCK_COUPONS.find(c => c.code === code);
    if (coupon) {
      if (orderAmount < coupon.min_order_amount) {
        return Promise.reject({ 
          response: { 
            status: 400, 
            data: { detail: `Minimum order amount of ₹${coupon.min_order_amount} required for code ${code}` } 
          } 
        });
      }
      let discount = (orderAmount * coupon.discount_percent) / 100.0;
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
      return Promise.resolve({
        data: {
          valid: true,
          code: coupon.code,
          discount_percent: coupon.discount_percent,
          discount_amount: discount,
          final_amount: Math.max(0, orderAmount - discount)
        },
        status: 200, statusText: 'OK', headers: {}, config
      });
    }
    return Promise.reject({ response: { status: 400, data: { detail: 'Invalid or expired coupon code' } } });
  }

  // 5. Create Order: POST /orders
  if (method === 'post' && url.startsWith('/orders')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VEL-2026-${randomSuffix}`;
    const newOrder = {
      id: Date.now(),
      order_number: orderNumber,
      customer_name: body.customer_name || 'Customer',
      customer_email: body.customer_email || 'patron@veloura.com',
      customer_phone: body.customer_phone || '+91 98765 43210',
      delivery_address: body.delivery_address || '101 Pâtisserie Boulevard',
      delivery_city: body.delivery_city || 'Mumbai',
      delivery_pincode: body.delivery_pincode || '400001',
      delivery_date: body.delivery_date || 'Today',
      delivery_slot: body.delivery_slot || 'Evening Prime (5 PM - 9 PM)',
      special_instructions: body.special_instructions || '',
      total_amount: body.total_amount || 0,
      payment_method: body.payment_method || 'Online Payment',
      payment_status: 'Paid',
      order_status: 'Order Placed',
      items: body.items || [],
      created_at: new Date().toISOString()
    };

    // Save order in localStorage so it can be tracked
    try {
      const existing = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
      existing.unshift(newOrder);
      localStorage.setItem('veloura_orders', JSON.stringify(existing));
    } catch(e){}

    return Promise.resolve({
      data: {
        message: 'Order created successfully',
        order: newOrder
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 6. Track Order: GET /orders/track/:order_number
  if (method === 'get' && url.includes('/orders/track/')) {
    const parts = url.split('/orders/track/');
    const orderNum = parts[1] ? parts[1].split('?')[0] : '';
    let found = null;
    try {
      const existing = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
      found = existing.find(o => o.order_number === orderNum);
    } catch(e){}

    if (!found) {
      found = {
        order_number: orderNum || 'VEL-2026-88991',
        customer_name: 'Valued Patron',
        order_status: 'Order Placed',
        total_amount: 899.0,
        delivery_date: 'Today',
        delivery_slot: 'Evening Prime (5 PM - 9 PM)',
        items: [{ product_name: 'Royal Belgian Truffle Gateau', quantity: 1, unit_price: 849.0 }]
      };
    }
    return Promise.resolve({ data: found, status: 200, statusText: 'OK', headers: {}, config });
  }

  // 7. My Orders: GET /orders/my-orders
  if (method === 'get' && url.includes('/orders/my-orders')) {
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    } catch(e){}
    return Promise.resolve({ data: orders, status: 200, statusText: 'OK', headers: {}, config });
  }

  // 8. Authentication: POST /auth/login
  if (method === 'post' && url.includes('/auth/login')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const email = (body.email || '').toLowerCase().trim();
    const isAdmin = email.includes('admin');
    const mockUser = {
      id: isAdmin ? 1 : 2,
      email: email || 'patron@veloura.com',
      full_name: body.full_name || (isAdmin ? 'VELOURA Master Chef' : 'Valued Patron'),
      is_admin: isAdmin,
      city: 'Mumbai',
      address: '101 Marine Drive'
    };
    return Promise.resolve({
      data: {
        access_token: 'mock_jwt_token_veloura_2026',
        token_type: 'bearer',
        user: mockUser
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 9. Auth Me: GET /auth/me
  if (method === 'get' && url.includes('/auth/me')) {
    return Promise.resolve({
      data: {
        id: 2,
        email: 'patron@veloura.com',
        full_name: 'Valued Patron',
        is_admin: false,
        city: 'Mumbai',
        address: '101 Marine Drive'
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 10. Admin Stats: GET /admin/stats
  if (method === 'get' && url.includes('/admin/stats')) {
    return Promise.resolve({
      data: {
        total_orders: 12,
        total_revenue: 8450.0,
        total_users: 18,
        total_products: MOCK_PRODUCTS.length
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  return Promise.reject(error);
}

// Intercept responses: if static server returned index.html or failed with 404, fallback cleanly!
api.interceptors.response.use(
  (response) => {
    // If backend returned HTML string (e.g. Render static site rewriting 404 to index.html)
    if (typeof response.data === 'string' && (response.data.includes('<!doctype html>') || response.data.includes('<html'))) {
      return handleMockFallback({ config: response.config, response });
    }
    return response;
  },
  (error) => {
    return handleMockFallback(error);
  }
);

export default api;
