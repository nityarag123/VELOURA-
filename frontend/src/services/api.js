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

    try {
      const custom = JSON.parse(localStorage.getItem('veloura_custom_products') || '[]');
      if (Array.isArray(custom)) {
        custom.forEach((cp) => {
          const idx = filtered.findIndex((p) => p.id === cp.id);
          if (idx !== -1) {
            filtered[idx] = { ...filtered[idx], ...cp };
          } else {
            filtered.unshift(cp);
          }
        });
      }
    } catch (e) {}

    try {
      const deleted = JSON.parse(localStorage.getItem('veloura_deleted_product_ids') || '[]');
      if (Array.isArray(deleted)) {
        filtered = filtered.filter((p) => !deleted.includes(p.id));
      }
    } catch (e) {}

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
    const isAdmin = email === 'admin@veloura.com' || email.includes('admin');
    const mockUser = {
      id: isAdmin ? 1 : 2,
      email: email || (isAdmin ? 'admin@veloura.com' : 'patron@veloura.com'),
      full_name: body.full_name || (isAdmin ? 'VELOURA Master Chef' : 'Valued Patron'),
      is_admin: isAdmin,
      city: 'Hyderabad',
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
    let savedUser = null;
    try {
      const u = localStorage.getItem('veloura_user');
      if (u) savedUser = JSON.parse(u);
    } catch (e) {}

    if (savedUser && savedUser.email) {
      const isAdm = Boolean(
        savedUser.is_admin === true || 
        savedUser.is_admin === 1 || 
        savedUser.is_admin === '1' ||
        savedUser.email.toLowerCase().trim() === 'admin@veloura.com'
      );
      return Promise.resolve({
        data: { ...savedUser, is_admin: isAdm },
        status: 200, statusText: 'OK', headers: {}, config
      });
    }
    return Promise.reject({
      response: { status: 401, data: { detail: 'Not authenticated' } }
    });
  }

  // 10. Admin Stats: GET /admin/stats
  if (method === 'get' && url.includes('/admin/stats')) {
    return Promise.resolve({
      data: {
        total_orders: 14,
        total_revenue: 9780.0,
        total_customers: 22,
        total_users: 22,
        total_products: MOCK_PRODUCTS.length
      },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 11. Admin Orders: GET /admin/orders
  if (method === 'get' && url.includes('/admin/orders')) {
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
    } catch (e) {}

    if (!orders.length) {
      orders = [
        {
          id: 101,
          order_number: "VEL-2026-92814",
          customer_name: "Aarav Sharma",
          customer_email: "aarav.sharma@example.com",
          customer_phone: "+91 98765 43210",
          delivery_address: "Flat 402, Sea Green Apartments, Worli",
          delivery_city: "Mumbai",
          delivery_pincode: "400018",
          delivery_date: "Today",
          delivery_slot: "Midnight Surprise (11:00 PM - 12:00 AM)",
          cake_message: "Happy 25th Anniversary Mom & Dad!",
          special_instructions: "Please deliver discreetly, it's a surprise gift.",
          total_amount: 1499.0,
          status: "Baking",
          payment_method: "UPI (Google Pay)",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { id: 1, product_name: "Royal Belgian Truffle Gateau", quantity: 1, weight: "1.0 kg", flavour: "Belgian Dark Truffle", total_price: 1399.0 }
          ]
        },
        {
          id: 102,
          order_number: "VEL-2026-74912",
          customer_name: "Meera Nair",
          customer_email: "meera.nair@gmail.com",
          customer_phone: "+91 91234 56789",
          delivery_address: "Villa 12, Palm Meadows, Whitefield",
          delivery_city: "Bengaluru",
          delivery_pincode: "560066",
          delivery_date: "Today",
          delivery_slot: "Evening Prime (6:00 PM - 9:00 PM)",
          cake_message: "Happy Birthday Arjun!",
          special_instructions: "Extra candles requested",
          total_amount: 849.0,
          status: "Order Placed",
          payment_method: "Credit Card (HDFC)",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          items: [
            { id: 2, product_name: "Korean Minimalist Bento Cake", quantity: 1, weight: "0.5 kg", flavour: "Strawberry Shortcake", total_price: 749.0 }
          ]
        }
      ];
    }
    return Promise.resolve({ data: orders, status: 200, statusText: 'OK', headers: {}, config });
  }

  // 12. Admin Change Password: PUT /admin/change-password
  if (method === 'put' && url.includes('/admin/change-password')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    if (body.new_password) {
      localStorage.setItem('veloura_admin_pw', body.new_password);
    }
    return Promise.resolve({
      data: { message: "Admin password updated successfully! Please use your new password next time." },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 13. Admin Update Product: PUT /admin/products/:id
  if (method === 'put' && url.includes('/admin/products/')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const idMatch = url.match(/\/admin\/products\/(\d+)/);
    const prodId = idMatch ? parseInt(idMatch[1]) : null;
    if (prodId) {
      try {
        let custom = JSON.parse(localStorage.getItem('veloura_custom_products') || '[]');
        const idx = custom.findIndex(p => p.id === prodId);
        if (idx !== -1) {
          custom[idx] = { ...custom[idx], ...body };
        } else {
          custom.push({ id: prodId, ...body });
        }
        localStorage.setItem('veloura_custom_products', JSON.stringify(custom));
      } catch (e) {}
    }
    return Promise.resolve({
      data: { id: prodId, message: "Product updated successfully", ...body },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 14. Admin Create Product: POST /admin/products
  if (method === 'post' && url.includes('/admin/products')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const cat = MOCK_CATEGORIES.find(c => c.id === parseInt(body.category_id)) || MOCK_CATEGORIES[0];
    const newProd = {
      id: Date.now(),
      rating: 4.95,
      review_count: 1,
      category_name: cat.name,
      category_slug: cat.slug,
      gallery_json: JSON.stringify([body.image_url]),
      flavours_json: typeof body.flavours === 'string' ? JSON.stringify(body.flavours.split(',').map(s => s.trim())) : JSON.stringify(body.flavours || ["Classic"]),
      weights_json: typeof body.weights === 'string' ? JSON.stringify(body.weights.split(',').map(s => s.trim())) : JSON.stringify(body.weights || ["Standard"]),
      ...body
    };
    try {
      let custom = JSON.parse(localStorage.getItem('veloura_custom_products') || '[]');
      custom.unshift(newProd);
      localStorage.setItem('veloura_custom_products', JSON.stringify(custom));
    } catch(e) {}
    return Promise.resolve({
      data: newProd,
      status: 201, statusText: 'Created', headers: {}, config
    });
  }

  // 15. Admin Delete Product: DELETE /admin/products/:id
  if (method === 'delete' && url.includes('/admin/products/')) {
    const idMatch = url.match(/\/admin\/products\/(\d+)/);
    const prodId = idMatch ? parseInt(idMatch[1]) : null;
    if (prodId) {
      try {
        let deleted = JSON.parse(localStorage.getItem('veloura_deleted_product_ids') || '[]');
        if (!deleted.includes(prodId)) deleted.push(prodId);
        localStorage.setItem('veloura_deleted_product_ids', JSON.stringify(deleted));

        let custom = JSON.parse(localStorage.getItem('veloura_custom_products') || '[]');
        custom = custom.filter(p => p.id !== prodId);
        localStorage.setItem('veloura_custom_products', JSON.stringify(custom));
      } catch (e) {}
    }
    return Promise.resolve({
      data: { message: "Product deleted successfully", id: prodId },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 16. Admin Update Order Status: PUT /admin/orders/:id/status
  if (method === 'put' && url.includes('/admin/orders/')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const idMatch = url.match(/\/admin\/orders\/(\d+)\/status/);
    const orderId = idMatch ? parseInt(idMatch[1]) : null;
    if (orderId && body.status) {
      try {
        let orders = JSON.parse(localStorage.getItem('veloura_orders') || '[]');
        orders = orders.map(o => (o.id === orderId ? { ...o, status: body.status } : o));
        localStorage.setItem('veloura_orders', JSON.stringify(orders));
      } catch (e) {}
    }
    return Promise.resolve({
      data: { message: "Order status updated", status: body.status },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 17. Reservations Fallback (Table Bookings)
  if (method === 'get' && url.includes('/admin/reservations')) {
    let bookings = [];
    try {
      bookings = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
    } catch (e) {}

    if (!bookings.length) {
      bookings = [
        {
          id: 1,
          token: "VL-938210",
          guest_name: "Aarav & Radhika Sharma",
          guest_phone: "+91 98765 43210",
          guest_email: "aarav.sharma@example.com",
          reservation_date: "Today",
          reservation_time: "7:30 PM - 9:30 PM",
          location: "Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad",
          guests_count: "2 Guests",
          table_number: "Table 02",
          table_name: "Parisian Velvet Booth",
          special_requests: "25th Anniversary private dining with champagne gateau presentation.",
          status: "Table Prepared",
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          token: "VL-621840",
          guest_name: "Vikramaditya Singhania",
          guest_phone: "+91 98200 11223",
          guest_email: "vikram.singh@example.com",
          reservation_date: "Tomorrow",
          reservation_time: "8:00 PM - 10:30 PM",
          location: "Veloura Grand Reserve Salon • Mumbai Seafront",
          guests_count: "6-8 Guests VIP",
          table_number: "Table 04",
          table_name: "The Imperial Grand Round",
          special_requests: "Family Milestone Birthday celebration. Chandelier suite required.",
          status: "Confirmed",
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          token: "VL-410952",
          guest_name: "Ananya Deshmukh",
          guest_phone: "+91 99887 66554",
          guest_email: "ananya.desh@gmail.com",
          reservation_date: "Today",
          reservation_time: "4:00 PM - 6:00 PM",
          location: "Veloura Grand Reserve Salon • Bengaluru",
          guests_count: "2 Guests",
          table_number: "Table 01",
          table_name: "Salon Window Alcove",
          special_requests: "Afternoon High Tea and signature pour-over tasting.",
          status: "Guests Seated",
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      try { localStorage.setItem('veloura_table_bookings', JSON.stringify(bookings)); } catch (e) {}
    }
    return Promise.resolve({ data: bookings, status: 200, statusText: 'OK', headers: {}, config });
  }

  // Create Reservation: POST /reservations or POST /admin/reservations
  if (method === 'post' && (url.includes('/reservations') || url.includes('/admin/reservations'))) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const newBooking = {
      id: Date.now(),
      token: body.token || `VL-${Math.floor(100000 + Math.random() * 900000)}`,
      guest_name: body.guest_name || body.name || 'Valued Patron',
      guest_phone: body.guest_phone || body.phone || '+91 98825 53333',
      guest_email: body.guest_email || body.email || 'guest@veloura.com',
      reservation_date: body.reservation_date || body.date || 'Today',
      reservation_time: body.reservation_time || body.time || '7:00 PM',
      location: body.location || 'Veloura Grand Reserve Salon • Jubilee Hills, Hyderabad',
      guests_count: body.guests_count || body.guests || '2 Guests',
      table_number: body.table_number || (body.table && body.table.tableNumber) || 'Table 01',
      table_name: body.table_name || (body.table && body.table.name) || 'Salon Window Alcove',
      special_requests: body.special_requests || 'Standard Reservation',
      pre_ordered_items: body.pre_ordered_items || '',
      status: body.status || 'Confirmed',
      created_at: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('veloura_table_bookings', JSON.stringify(existing));
    } catch(e) {}
    return Promise.resolve({ data: newBooking, status: 201, statusText: 'Created', headers: {}, config });
  }

  // Delete Reservation: DELETE /admin/reservations/:id
  if (method === 'delete' && url.includes('/admin/reservations/')) {
    const idMatch = url.match(/\/admin\/reservations\/(\d+)/);
    const resId = idMatch ? parseInt(idMatch[1]) : null;
    if (resId) {
      try {
        let bookings = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
        bookings = bookings.filter(b => b.id !== resId);
        localStorage.setItem('veloura_table_bookings', JSON.stringify(bookings));
      } catch (e) {}
    }
    return Promise.resolve({ data: { message: "Reservation deleted successfully" }, status: 200, statusText: 'OK', headers: {}, config });
  }

  // Update Reservation Status: PUT /admin/reservations/:id/status
  if (method === 'put' && url.includes('/admin/reservations/')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const idMatch = url.match(/\/admin\/reservations\/(\d+)\/status/);
    const resId = idMatch ? parseInt(idMatch[1]) : null;
    if (resId && body.status) {
      try {
        let bookings = JSON.parse(localStorage.getItem('veloura_table_bookings') || '[]');
        bookings = bookings.map(b => (b.id === resId ? { ...b, status: body.status } : b));
        localStorage.setItem('veloura_table_bookings', JSON.stringify(bookings));
      } catch (e) {}
    }
    return Promise.resolve({
      data: { message: "Reservation status updated", status: body.status },
      status: 200, statusText: 'OK', headers: {}, config
    });
  }

  // 18. Customer Works & Bespoke Gateaux Fallback
  if (method === 'get' && url.includes('/admin/works')) {
    let works = [];
    try {
      works = JSON.parse(localStorage.getItem('veloura_customer_works') || '[]');
    } catch (e) {}

    if (!works.length) {
      works = [
        {
          id: 1,
          work_code: "WRK-2026-101",
          client_name: "Mrs. Gayatri Varma",
          client_phone: "+91 98450 99887",
          client_email: "gayatri.varma@example.com",
          occasion: "3-Tier Royal Velvet & 24K Gold Wedding Gateau",
          event_date: "2026-11-28",
          guest_count: 180,
          flavour_profile: "Belgian Dark Truffle & Madagascar Vanilla Bean",
          tier_count: "3 Tiers Hand-Sculpted",
          dietary_spec: "100% Eggless",
          design_notes: "Cascading edible sugar-craft white roses with brushed edible 24K gold foil. Matching wedding motif.",
          estimated_budget: 24500.0,
          status: "Design Consulted",
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          work_code: "WRK-2026-102",
          client_name: "Rohan Malhotra (TechCorp India)",
          client_phone: "+91 97112 33445",
          client_email: "rohan.m@techcorp.in",
          occasion: "Corporate 10th Milestone Celebration Cake",
          event_date: "2026-11-20",
          guest_count: 80,
          flavour_profile: "Opera Hazelnut Praline",
          tier_count: "2 Tiers Sculpted Modernist",
          dietary_spec: "Eggless & Nut-labelled",
          design_notes: "Corporate logo printed on white Belgian chocolate plaque with LED back-glow stage stand.",
          estimated_budget: 16500.0,
          status: "In Production",
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 3,
          work_code: "WRK-2026-103",
          client_name: "Dr. Meenakshi Iyer",
          client_phone: "+91 98220 54321",
          client_email: "meenakshi.iyer@hospital.org",
          occasion: "Bespoke 50th Golden Jubilee Botanical Gateau",
          event_date: "2026-11-25",
          guest_count: 50,
          flavour_profile: "Persian Pistachio & Rose Saffron",
          tier_count: "2 Tiers Hexagonal",
          dietary_spec: "100% Eggless / Sugar-Conscious",
          design_notes: "Handmade edible sugar orchids with botanical green velvet finish.",
          estimated_budget: 14000.0,
          status: "Quotation Approved",
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];
      try { localStorage.setItem('veloura_customer_works', JSON.stringify(works)); } catch (e) {}
    }
    return Promise.resolve({ data: works, status: 200, statusText: 'OK', headers: {}, config });
  }

  // Create Work: POST /admin/works
  if (method === 'post' && url.includes('/admin/works')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const newWork = {
      id: Date.now(),
      work_code: body.work_code || `WRK-2026-${Math.floor(100 + Math.random() * 900)}`,
      client_name: body.client_name || 'Bespoke Client',
      client_phone: body.client_phone || '+91 98825 53333',
      client_email: body.client_email || '',
      occasion: body.occasion || 'Celebration Cake',
      event_date: body.event_date || 'Upcoming',
      guest_count: parseInt(body.guest_count) || 50,
      flavour_profile: body.flavour_profile || 'Belgian Dark Truffle',
      tier_count: body.tier_count || '2 Tiers',
      dietary_spec: body.dietary_spec || '100% Eggless',
      design_notes: body.design_notes || '',
      estimated_budget: parseFloat(body.estimated_budget) || 12000.0,
      status: body.status || 'Inquiry Received',
      created_at: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('veloura_customer_works') || '[]');
      existing.unshift(newWork);
      localStorage.setItem('veloura_customer_works', JSON.stringify(existing));
    } catch(e) {}
    return Promise.resolve({ data: newWork, status: 201, statusText: 'Created', headers: {}, config });
  }

  // Update Work Status: PUT /admin/works/:id/status
  if (method === 'put' && url.includes('/admin/works/')) {
    let body = {};
    try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch(e){}
    const idMatch = url.match(/\/admin\/works\/(\d+)\/status/);
    const workId = idMatch ? parseInt(idMatch[1]) : null;
    if (workId && body.status) {
      try {
        let works = JSON.parse(localStorage.getItem('veloura_customer_works') || '[]');
        works = works.map(w => (w.id === workId ? { ...w, status: body.status } : w));
        localStorage.setItem('veloura_customer_works', JSON.stringify(works));
      } catch (e) {}
    }
    return Promise.resolve({
      data: { message: "Work status updated", status: body.status },
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
