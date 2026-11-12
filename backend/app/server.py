import os
import sys
import json
import random
from bottle import Bottle, request, response, run, HTTPResponse, static_file

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import get_connection, init_db
from app.auth_util import hash_password, verify_password, create_jwt_token, decode_jwt_token

app = Bottle()

# ================= CORS & HELPERS =================
@app.hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, Authorization'

@app.route('/<:re:.*>', method='OPTIONS')
def enable_cors_generic_route():
    res = HTTPResponse(status=200)
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    res.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, Authorization'
    return res

def json_response(data, status=200):
    res = HTTPResponse(status=status, body=json.dumps(data))
    res.headers['Content-Type'] = 'application/json'
    return res

def error_response(message, status=400):
    return json_response({"detail": message}, status=status)

def get_json_body():
    try:
        return request.json or {}
    except Exception:
        return {}

def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    payload = decode_jwt_token(token)
    if not payload:
        return None
    user_id = int(payload.get('sub'))
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, email, full_name, phone, address, city, pincode, is_admin, created_at FROM users WHERE id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def require_admin():
    user = get_current_user()
    if not user or not user.get('is_admin'):
        return None
    return user

# ================= HEALTH =================
@app.route('/api/health', method='GET')
def health():
    return json_response({
        "status": "healthy",
        "brand": "VELOURA",
        "tagline": "The art of sweetness",
        "version": "1.0.0"
    })

# ================= AUTH =================
@app.route('/api/auth/register', method='POST')
def register():
    data = get_json_body()
    email = (data.get('email') or '').strip().lower()
    full_name = (data.get('full_name') or '').strip()
    password = data.get('password') or ''
    phone = data.get('phone', '')
    address = data.get('address', '')
    city = data.get('city', '')
    pincode = data.get('pincode', '')

    if not email or not password or not full_name:
        return error_response("Email, password, and full name are required", 400)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (email,))
    if c.fetchone():
        conn.close()
        return error_response("An account with this email already exists", 400)

    hpw = hash_password(password)
    c.execute('''
        INSERT INTO users (email, full_name, hashed_password, phone, address, city, pincode, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    ''', (email, full_name, hpw, phone, address, city, pincode))
    user_id = c.lastrowid
    conn.commit()

    c.execute("SELECT id, email, full_name, phone, address, city, pincode, is_admin, created_at FROM users WHERE id = ?", (user_id,))
    user = dict(c.fetchone())
    conn.close()

    token = create_jwt_token(user_id, is_admin=False)
    return json_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user
    })

@app.route('/api/auth/login', method='POST')
def login():
    data = get_json_body()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    full_name = (data.get('full_name') or '').strip()

    if not email:
        return error_response("Email address is required", 400)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, email, full_name, hashed_password, phone, address, city, pincode, is_admin, created_at FROM users WHERE email = ?", (email,))
    row = c.fetchone()

    # If it is an admin user, password verification is strictly required
    if row and row['is_admin']:
        if not password or not verify_password(password, row['hashed_password']):
            conn.close()
            return error_response("Incorrect admin password", 401)
        user = dict(row)
        del user['hashed_password']
        token = create_jwt_token(user['id'], is_admin=True)
        conn.close()
        return json_response({
            "access_token": token,
            "token_type": "bearer",
            "user": user
        })

    # If customer user: NO PASSWORD NEEDED!
    if row:
        user = dict(row)
        del user['hashed_password']
        token = create_jwt_token(user['id'], is_admin=False)
        conn.close()
        return json_response({
            "access_token": token,
            "token_type": "bearer",
            "user": user
        })
    else:
        # First-time customer: automatically register without password
        name = full_name or email.split('@')[0].capitalize()
        hpw = hash_password("customer_no_password_needed")
        c.execute('''
            INSERT INTO users (email, full_name, hashed_password, is_admin)
            VALUES (?, ?, ?, 0)
        ''', (email, name, hpw))
        user_id = c.lastrowid
        conn.commit()
        c.execute("SELECT id, email, full_name, phone, address, city, pincode, is_admin, created_at FROM users WHERE id = ?", (user_id,))
        user = dict(c.fetchone())
        conn.close()
        token = create_jwt_token(user['id'], is_admin=False)
        return json_response({
            "access_token": token,
            "token_type": "bearer",
            "user": user
        })

@app.route('/api/auth/me', method='GET')
def me():
    user = get_current_user()
    if not user:
        return error_response("Not authenticated", 401)
    return json_response(user)

@app.route('/api/auth/profile', method='PUT')
def update_profile():
    user = get_current_user()
    if not user:
        return error_response("Not authenticated", 401)

    data = get_json_body()
    full_name = data.get('full_name', user['full_name'])
    phone = data.get('phone', user['phone'])
    address = data.get('address', user['address'])
    city = data.get('city', user['city'])
    pincode = data.get('pincode', user['pincode'])

    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE users SET full_name = ?, phone = ?, address = ?, city = ?, pincode = ?
        WHERE id = ?
    ''', (full_name, phone, address, city, pincode, user['id']))
    conn.commit()

    c.execute("SELECT id, email, full_name, phone, address, city, pincode, is_admin, created_at FROM users WHERE id = ?", (user['id'],))
    updated_user = dict(c.fetchone())
    conn.close()

    return json_response(updated_user)

# ================= CATEGORIES & PRODUCTS =================
@app.route('/api/categories', method='GET')
def get_categories():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM categories ORDER BY id ASC")
    cats = [dict(row) for row in c.fetchall()]
    conn.close()
    return json_response(cats)

@app.route('/api/products', method='GET')
def get_products():
    category = request.query.get('category')
    search = request.query.get('search')
    min_price = request.query.get('min_price')
    max_price = request.query.get('max_price')
    is_bestseller = request.query.get('is_bestseller')
    is_featured = request.query.get('is_featured')
    sort_by = request.query.get('sort_by', 'popular')

    conn = get_connection()
    c = conn.cursor()

    sql = '''
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    '''
    params = []

    if category:
        sql += " AND (c.slug = ? OR c.name LIKE ? OR p.category_id = ?)"
        params.extend([category, f"%{category}%", category if category.isdigit() else -1])

    if search:
        sql += " AND (p.name LIKE ? OR p.description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    if min_price:
        try:
            sql += " AND p.base_price >= ?"
            params.append(float(min_price))
        except ValueError:
            pass

    if max_price:
        try:
            sql += " AND p.base_price <= ?"
            params.append(float(max_price))
        except ValueError:
            pass

    if is_bestseller in ['1', 'true', 'True']:
        sql += " AND p.is_bestseller = 1"

    if is_featured in ['1', 'true', 'True']:
        sql += " AND p.is_featured = 1"

    # Sorting
    if sort_by == 'price_asc':
        sql += " ORDER BY p.base_price ASC"
    elif sort_by == 'price_desc':
        sql += " ORDER BY p.base_price DESC"
    elif sort_by == 'rating':
        sql += " ORDER BY p.rating DESC"
    elif sort_by == 'newest':
        sql += " ORDER BY p.created_at DESC"
    else:  # popular
        sql += " ORDER BY p.review_count DESC, p.rating DESC"

    c.execute(sql, params)
    rows = c.fetchall()

    products = []
    for row in rows:
        p = dict(row)
        p['category'] = {"id": p['category_id'], "name": p['category_name'], "slug": p['category_slug']}
        p['is_bestseller'] = bool(p['is_bestseller'])
        p['is_featured'] = bool(p['is_featured'])
        p['is_eggless_available'] = bool(p['is_eggless_available'])
        p['in_stock'] = bool(p['in_stock'])
        try:
            p['gallery'] = json.loads(p['gallery_json'])
        except Exception:
            p['gallery'] = []
        try:
            p['flavours'] = json.loads(p['flavours_json'])
        except Exception:
            p['flavours'] = []
        try:
            p['weights'] = json.loads(p['weights_json'])
        except Exception:
            p['weights'] = []
        products.append(p)

    conn.close()
    return json_response(products)

@app.route('/api/products/<id_or_slug>', method='GET')
def get_product_detail(id_or_slug):
    conn = get_connection()
    c = conn.cursor()

    if id_or_slug.isdigit():
        c.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ''', (int(id_or_slug),))
    else:
        c.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.slug = ?
        ''', (id_or_slug,))

    row = c.fetchone()
    if not row:
        conn.close()
        return error_response("Product not found", 404)

    p = dict(row)
    p['category'] = {"id": p['category_id'], "name": p['category_name'], "slug": p['category_slug']}
    p['is_bestseller'] = bool(p['is_bestseller'])
    p['is_featured'] = bool(p['is_featured'])
    p['is_eggless_available'] = bool(p['is_eggless_available'])
    p['in_stock'] = bool(p['in_stock'])
    try:
        p['gallery'] = json.loads(p['gallery_json'])
    except Exception:
        p['gallery'] = []
    try:
        p['flavours'] = json.loads(p['flavours_json'])
    except Exception:
        p['flavours'] = []
    try:
        p['weights'] = json.loads(p['weights_json'])
    except Exception:
        p['weights'] = []

    # Fetch reviews
    c.execute("SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY id DESC", (p['id'],))
    p['reviews'] = [dict(r) for r in c.fetchall()]

    conn.close()
    return json_response(p)

# ================= ORDERS & TRACKING =================
@app.route('/api/orders', method='POST')
def create_order():
    data = get_json_body()
    items = data.get('items', [])
    if not items:
        return error_response("Order must contain at least one item", 400)

    user = get_current_user()
    user_id = user['id'] if user else None

    order_number = f"VEL-2026-{random.randint(10000, 99999)}"

    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO orders (
            order_number, user_id, customer_name, customer_email, customer_phone,
            delivery_address, city, pincode, delivery_date, delivery_time_slot,
            cake_message, special_instructions, subtotal, discount, delivery_fee,
            total_amount, payment_method, payment_status, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        order_number,
        user_id,
        data.get('customer_name', 'Guest'),
        (data.get('customer_email') or 'guest@veloura.com').lower(),
        data.get('customer_phone', ''),
        data.get('delivery_address', ''),
        data.get('city', ''),
        data.get('pincode', ''),
        data.get('delivery_date', 'Today'),
        data.get('delivery_time_slot', 'Evening (6 PM - 9 PM)'),
        data.get('cake_message', ''),
        data.get('special_instructions', ''),
        float(data.get('subtotal', 0)),
        float(data.get('discount', 0)),
        float(data.get('delivery_fee', 0)),
        float(data.get('total_amount', 0)),
        data.get('payment_method', 'Online / Card'),
        'Paid (Verified)',
        'Order Placed'
    ))
    order_id = c.lastrowid

    for it in items:
        c.execute('''
            INSERT INTO order_items (
                order_id, product_id, product_name, product_image, weight, flavour,
                is_eggless, cake_message, unit_price, quantity, total_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order_id,
            it.get('product_id'),
            it.get('product_name', 'Veloura Treat'),
            it.get('product_image', ''),
            it.get('weight', '0.5 kg'),
            it.get('flavour', 'Belgian Chocolate'),
            1 if it.get('is_eggless', True) else 0,
            it.get('cake_message', ''),
            float(it.get('unit_price', 0)),
            int(it.get('quantity', 1)),
            float(it.get('total_price', 0))
        ))

    conn.commit()

    # Retrieve full created order
    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = dict(c.fetchone())
    c.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    order_row['items'] = [dict(it) for it in c.fetchall()]
    conn.close()

    return json_response(order_row, 201)

@app.route('/api/orders/my-orders', method='GET')
def my_orders():
    user = get_current_user()
    if not user:
        return error_response("Authentication required", 401)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user['id'],))
    orders = [dict(r) for r in c.fetchall()]

    for o in orders:
        c.execute("SELECT * FROM order_items WHERE order_id = ?", (o['id'],))
        o['items'] = [dict(it) for it in c.fetchall()]

    conn.close()
    return json_response(orders)

@app.route('/api/orders/track/<order_number>', method='GET')
def track_order(order_number):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE order_number = ?", (order_number.strip(),))
    row = c.fetchone()
    if not row:
        conn.close()
        return error_response("Order not found with provided tracking number", 404)

    order = dict(row)
    c.execute("SELECT * FROM order_items WHERE order_id = ?", (order['id'],))
    order['items'] = [dict(it) for it in c.fetchall()]
    conn.close()
    return json_response(order)

# ================= COUPONS =================
@app.route('/api/coupons', method='GET')
def list_coupons():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM coupons WHERE is_active = 1")
    coupons = [dict(r) for r in c.fetchall()]
    conn.close()
    return json_response(coupons)

@app.route('/api/coupons/apply', method='POST')
def apply_coupon():
    data = get_json_body()
    code = (data.get('code') or '').strip().upper()
    order_amount = float(data.get('order_amount', 0))

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (code,))
    coupon = c.fetchone()
    conn.close()

    if not coupon:
        return error_response("Invalid or expired coupon code", 400)

    coupon = dict(coupon)
    if order_amount < coupon['min_order_amount']:
        return error_response(f"This coupon requires a minimum order amount of ₹{int(coupon['min_order_amount'])}", 400)

    discount = (order_amount * coupon['discount_percent']) / 100.0
    if coupon['max_discount'] and discount > coupon['max_discount']:
        discount = coupon['max_discount']

    return json_response({
        "valid": True,
        "code": coupon['code'],
        "discount_amount": round(discount, 2),
        "discount_percent": coupon['discount_percent'],
        "message": f"Coupon {coupon['code']} applied successfully! You saved ₹{round(discount, 2)}"
    })

# ================= REVIEWS =================
@app.route('/api/products/<product_id:int>/reviews', method='POST')
def add_review(product_id):
    user = get_current_user()
    data = get_json_body()
    rating = float(data.get('rating', 5.0))
    comment = (data.get('comment') or '').strip()

    if not comment:
        return error_response("Review comment cannot be empty", 400)

    user_name = user['full_name'] if user else (data.get('user_name') or 'Verified Veloura Patron')
    user_id = user['id'] if user else None

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, review_count, rating FROM products WHERE id = ?", (product_id,))
    prod = c.fetchone()
    if not prod:
        conn.close()
        return error_response("Product not found", 404)

    c.execute('''
        INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    ''', (product_id, user_id, user_name, rating, comment))
    review_id = c.lastrowid

    # Update product rating & count
    c.execute("SELECT rating FROM reviews WHERE product_id = ?", (product_id,))
    all_ratings = [r[0] for r in c.fetchall()]
    new_avg = round(sum(all_ratings) / len(all_ratings), 2)
    new_count = len(all_ratings)

    c.execute("UPDATE products SET rating = ?, review_count = ? WHERE id = ?", (new_avg, new_count, product_id))
    conn.commit()

    c.execute("SELECT * FROM reviews WHERE id = ?", (review_id,))
    review_row = dict(c.fetchone())
    conn.close()

    return json_response(review_row, 201)

# ================= ADMIN DASHBOARD =================
@app.route('/api/admin/stats', method='GET')
def admin_stats():
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM orders")
    total_orders = c.fetchone()[0]

    c.execute("SELECT SUM(total_amount) FROM orders")
    rev = c.fetchone()[0]
    total_revenue = round(rev, 2) if rev else 0.0

    c.execute("SELECT COUNT(*) FROM users WHERE is_admin = 0")
    total_customers = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM products")
    total_products = c.fetchone()[0]

    c.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10")
    recent_orders = [dict(r) for r in c.fetchall()]
    for o in recent_orders:
        c.execute("SELECT * FROM order_items WHERE order_id = ?", (o['id'],))
        o['items'] = [dict(it) for it in c.fetchall()]

    conn.close()

    return json_response({
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "total_products": total_products,
        "recent_orders": recent_orders
    })

@app.route('/api/admin/orders', method='GET')
def admin_orders():
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders ORDER BY created_at DESC")
    orders = [dict(r) for r in c.fetchall()]
    for o in orders:
        c.execute("SELECT * FROM order_items WHERE order_id = ?", (o['id'],))
        o['items'] = [dict(it) for it in c.fetchall()]

    conn.close()
    return json_response(orders)

@app.route('/api/admin/orders/<order_id:int>/status', method='PUT')
def update_order_status(order_id):
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    data = get_json_body()
    status = data.get('status')
    if not status:
        return error_response("Status is required", 400)

    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()

    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return error_response("Order not found", 404)

    order = dict(row)
    c.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    order['items'] = [dict(it) for it in c.fetchall()]
    conn.close()

    return json_response(order)

@app.route('/api/admin/products', method='POST')
def admin_add_product():
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    data = get_json_body()
    name = (data.get('name') or '').strip()
    slug = (data.get('slug') or name.lower().replace(' ', '-')).strip()
    description = (data.get('description') or '').strip()
    category_id = int(data.get('category_id', 1))
    base_price = float(data.get('base_price', 499.0))
    discount_price = float(data.get('discount_price')) if data.get('discount_price') else None
    image_url = data.get('image_url') or 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    gallery_json = json.dumps(data.get('gallery', [image_url]))
    flavours_json = json.dumps(data.get('flavours', ["Classic Truffle", "Red Velvet"]))
    weights_json = json.dumps(data.get('weights', ["0.5 kg", "1.0 kg", "1.5 kg"]))
    is_bestseller = 1 if data.get('is_bestseller') else 0
    is_featured = 1 if data.get('is_featured') else 0
    is_eggless_available = 1 if data.get('is_eggless_available', True) else 0

    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO products (
            name, slug, description, category_id, base_price, discount_price, rating, review_count,
            image_url, gallery_json, flavours_json, weights_json, is_bestseller, is_featured, is_eggless_available, in_stock
        ) VALUES (?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (name, slug, description, category_id, base_price, discount_price, image_url, gallery_json, flavours_json, weights_json, is_bestseller, is_featured, is_eggless_available))
    prod_id = c.lastrowid
    conn.commit()

    c.execute("SELECT * FROM products WHERE id = ?", (prod_id,))
    prod = dict(c.fetchone())
    conn.close()

    return json_response(prod, 201)

@app.route('/api/admin/products/<product_id:int>', method='PUT')
def admin_update_product(product_id):
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    data = get_json_body()
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    if not c.fetchone():
        conn.close()
        return error_response("Product not found", 404)

    fields = []
    params = []
    for k in ['name', 'description', 'category_id', 'base_price', 'discount_price', 'image_url', 'is_bestseller', 'is_featured', 'is_eggless_available', 'in_stock']:
        if k in data:
            fields.append(f"{k} = ?")
            params.append(data[k])

    if fields:
        params.append(product_id)
        c.execute(f"UPDATE products SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()

    c.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    updated = dict(c.fetchone())
    conn.close()

    return json_response(updated)

@app.route('/api/admin/products/<product_id:int>', method='DELETE')
def admin_delete_product(product_id):
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM products WHERE id = ?", (product_id,))
    c.execute("DELETE FROM reviews WHERE product_id = ?", (product_id,))
    conn.commit()
    conn.close()

    return json_response({"message": "Product removed successfully"})

@app.route('/api/admin/change-password', method='PUT')
def admin_change_password():
    admin = require_admin()
    if not admin:
        return error_response("Admin access required", 403)

    data = get_json_body()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return error_response("Both current password and new password are required", 400)

    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters long", 400)

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT hashed_password FROM users WHERE id = ?", (admin['id'],))
    row = c.fetchone()
    if not row or not verify_password(current_password, row['hashed_password']):
        conn.close()
        return error_response("Current password is incorrect", 400)

    new_hpw = hash_password(new_password)
    c.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (new_hpw, admin['id']))
    conn.commit()
    conn.close()

    return json_response({"message": "Admin password updated successfully! Please use your new password next time."})

# ================= STATIC FRONTEND SERVING (For Unified Deployment) =================
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'frontend', 'dist'))

@app.route('/')
def serve_index():
    index_file = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.exists(index_file):
        return static_file('index.html', root=FRONTEND_DIST)
    return json_response({"status": "healthy", "service": "VELOURA Bakery API", "version": "1.0.0"})

@app.route('/assets/<filename:path>')
def serve_assets(filename):
    assets_dir = os.path.join(FRONTEND_DIST, 'assets')
    if os.path.exists(os.path.join(assets_dir, filename)):
        return static_file(filename, root=assets_dir)
    return HTTPResponse(status=404)

@app.route('/<path:path>')
def serve_spa_fallback(path):
    # Don't intercept API routes with HTML
    if path.startswith('api/'):
        return HTTPResponse(status=404, body=json.dumps({"detail": "Not found"}), headers={'Content-Type': 'application/json'})
    # Check if direct static file exists in dist
    if os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return static_file(path, root=FRONTEND_DIST)
    # SPA Fallback for React Router
    index_file = os.path.join(FRONTEND_DIST, 'index.html')
    if os.path.exists(index_file):
        return static_file('index.html', root=FRONTEND_DIST)
    return HTTPResponse(status=404)

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8000))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f"Starting VELOURA Bakery API server on http://{host}:{port}...")
    run(app, host=host, port=port, server='wsgiref')
