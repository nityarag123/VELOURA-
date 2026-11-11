import sqlite3
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.auth_util import hash_password

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "veloura.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        hashed_password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        pincode TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT 1
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        base_price REAL NOT NULL,
        discount_price REAL,
        rating REAL DEFAULT 4.9,
        review_count INTEGER DEFAULT 12,
        image_url TEXT NOT NULL,
        gallery_json TEXT DEFAULT '[]',
        flavours_json TEXT DEFAULT '[]',
        weights_json TEXT DEFAULT '[]',
        is_bestseller BOOLEAN DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_eggless_available BOOLEAN DEFAULT 1,
        in_stock BOOLEAN DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id)
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        city TEXT NOT NULL,
        pincode TEXT NOT NULL,
        delivery_date TEXT NOT NULL,
        delivery_time_slot TEXT NOT NULL,
        cake_message TEXT,
        special_instructions TEXT,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        delivery_fee REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'Online / Card',
        payment_status TEXT DEFAULT 'Paid (Verified)',
        status TEXT DEFAULT 'Order Placed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        product_image TEXT NOT NULL,
        weight TEXT,
        flavour TEXT,
        is_eggless BOOLEAN DEFAULT 1,
        cake_message TEXT,
        unit_price REAL NOT NULL,
        quantity INTEGER DEFAULT 1,
        total_price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER,
        user_name TEXT NOT NULL,
        rating REAL DEFAULT 5.0,
        comment TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_percent REAL NOT NULL,
        max_discount REAL,
        min_order_amount REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1
    )
    ''')

    conn.commit()

    # Check if categories already seeded
    c.execute("SELECT COUNT(*) FROM categories")
    if c.fetchone()[0] == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    c = conn.cursor()
    print("Seeding initial VELOURA luxury bakery catalog...")

    # Users
    admin_pw = hash_password("admin123")
    user_pw = hash_password("user123")
    c.execute('''
        INSERT INTO users (email, full_name, hashed_password, phone, address, city, pincode, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("admin@veloura.com", "VELOURA Master Chef", admin_pw, "+91 98765 43210", "101 Pâtisserie Boulevard", "Mumbai", "400001", 1))

    c.execute('''
        INSERT INTO users (email, full_name, hashed_password, phone, address, city, pincode, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("user@veloura.com", "Aarav Sharma", user_pw, "+91 98123 45678", "Flat 4B, Emerald Heights, Powai", "Mumbai", "400076", 0))

    # Coupons
    coupons = [
        ("VELOURA10", 10.0, 300.0, 499.0, 1),
        ("SWEETDEAL", 15.0, 500.0, 899.0, 1),
        ("FIRSTBITE", 20.0, 400.0, 399.0, 1),
        ("MIDNIGHT", 12.0, 350.0, 699.0, 1)
    ]
    c.executemany('''
        INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, is_active)
        VALUES (?, ?, ?, ?, ?)
    ''', coupons)

    # Categories
    categories = [
        ("Birthday Cakes", "birthday-cakes", "Exquisite artisanal cakes designed to make every birthday celebration unforgettable.", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", 1),
        ("Anniversary Cakes", "anniversary-cakes", "Romantic, elegant floral and tiered creations celebrating your bond of love.", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80", 1),
        ("Chocolate Cakes", "chocolate-cakes", "Pure indulgence with 70% dark Belgian cocoa, silky truffles, and crunchy pralines.", "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80", 1),
        ("Designer & Bento Cakes", "designer-cakes", "Chic Korean minimalist bento cakes and handcrafted sculpted aesthetic cakes.", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80", 1),
        ("Luxury Cupcakes", "cupcakes", "Individual velvet swirls, gold leaf embellishments, and gourmet buttercreams.", "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=600&q=80", 1),
        ("French Pastries & Macarons", "pastries", "Classic Parisian opera slices, mille-feuille, delicate éclairs, and French macarons.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", 1),
        ("Artisan Brownies & Cookies", "brownies-cookies", "Fudgy Belgian walnut brownies and soft-baked gourmet stuffed cookies.", "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80", 1),
        ("Jar Cakes & Trifles", "jar-cakes", "Portable, layered layers of moist sponge, rich ganache, and light mascarpone mousse.", "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80", 1),
        ("Luxury Gift Hampers", "gift-hampers", "Curated velvet-box hampers with artisanal chocolates, dry cakes, and scented blooms.", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80", 1),
        ("Artisanal Coffee & Brews", "coffee-brews", "Handcrafted specialty coffees made from 100% Arabica single-origin estate beans, brewed fresh by master baristas.", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80", 1),
        ("Gourmet Cafe & Savory Bites", "cafe-savory", "Artisanal flaky French croissants, truffle sourdough melts, gourmet quiches, and warm cafe bites.", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80", 1)
    ]
    c.executemany('''
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES (?, ?, ?, ?, ?)
    ''', categories)

    # Fetch Category ID mapping
    c.execute("SELECT id, slug FROM categories")
    cat_map = {row[1]: row[0] for row in c.fetchall()}

    # Products
    products = [
        # Chocolate Cakes
        (
            "Royal Belgian Truffle Gateau",
            "royal-belgian-truffle-gateau",
            "Rich 64% Callebaut dark chocolate layers enveloped in velvety satin ganache and decorated with chocolate ribbons and gold shimmer.",
            cat_map["chocolate-cakes"],
            799.0, 699.0, 4.95, 84,
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Belgian Dark Truffle", "Swiss Milk Chocolate", "Nutella Hazelnut"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            1, 1, 1, 1
        ),
        (
            "Nutella Ferrero Rocher Indulgence",
            "nutella-ferrero-rocher-indulgence",
            "Decadent chocolate sponge layered with pure Italian Nutella, roasted crushed hazelnuts, and crowned with whole Ferrero Rocher truffles.",
            cat_map["chocolate-cakes"],
            899.0, 799.0, 4.90, 52,
            "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Nutella Hazelnut", "Dark Truffle Crunch"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            1, 1, 1, 1
        ),
        # Birthday Cakes
        (
            "Opulent Velvet Raspberry Crown",
            "opulent-velvet-raspberry-crown",
            "Ruby-red crimson velvet sponge paired with luscious Philadelphia cream cheese mousse, infused with organic wild raspberry compote.",
            cat_map["birthday-cakes"],
            849.0, 749.0, 4.92, 67,
            "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Red Velvet Cream Cheese", "Raspberry Mascarpone"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            1, 1, 1, 1
        ),
        (
            "Madagascar Golden Vanilla Confetti",
            "madagascar-golden-vanilla-confetti",
            "Fragrant Bourbon vanilla bean chiffon cake filled with silky white chocolate mousse and hand-painted pastel sprinkles.",
            cat_map["birthday-cakes"],
            699.0, 599.0, 4.85, 41,
            "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Bourbon Vanilla Bean", "Vanilla Strawberry Swirl"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            0, 1, 1, 1
        ),
        # Anniversary Cakes
        (
            "Elysian Rose & 24K Gold Pearl Cake",
            "elysian-rose-gold-pearl-cake",
            "A stunning tiered masterwork adorned with handcrafted sugar peonies, shimmering edible 24K gold leaves, and delicate champagne ganache.",
            cat_map["anniversary-cakes"],
            1299.0, 1149.0, 4.98, 39,
            "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Champagne Rose Vanilla", "Red Velvet Luxury", "Dark Belgian Ganache"]),
            json.dumps(["1.0 kg", "1.5 kg", "2.0 kg", "3.0 kg"]),
            1, 1, 1, 1
        ),
        (
            "Black Forest Gateau Noir",
            "black-forest-gateau-noir",
            "Authentic German Schwarzwälder Kirschtorte with tender cocoa sponge, Kirsch-infused sour cherries, and fresh Chantilly cream flakes.",
            cat_map["anniversary-cakes"],
            749.0, 649.0, 4.88, 48,
            "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Authentic Black Forest Cherry", "Dutch Chocolate Cherry"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            0, 0, 1, 1
        ),
        # Designer & Bento Cakes
        (
            "Pastel Dream Korean Bento Cake",
            "pastel-dream-korean-bento-cake",
            "Cute aesthetic lunchbox cake with minimalist Korean lettering, pastel cloud frosting, and delicate heart piping. Perfect for intimate celebrations.",
            cat_map["designer-cakes"],
            449.0, 399.0, 4.93, 92,
            "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Belgian Chocolate", "Strawberry Shortcake", "Blueberry Cream"]),
            json.dumps(["0.3 kg (Bento)", "0.5 kg"]),
            1, 1, 1, 1
        ),
        (
            "Celestial Galaxy Mirror Glaze Cake",
            "celestial-galaxy-mirror-glaze-cake",
            "A hypnotizing deep violet and cosmic blue high-gloss mirror glaze over French dark chocolate mousse and crunchy feuilletine base.",
            cat_map["designer-cakes"],
            999.0, 899.0, 4.96, 31,
            "https://images.unsplash.com/photo-1518047601542-4505c440a338?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1518047601542-4505c440a338?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Galaxy Chocolate Feuilletine", "Blueberry White Chocolate"]),
            json.dumps(["0.5 kg", "1.0 kg", "1.5 kg"]),
            0, 1, 1, 1
        ),
        # Luxury Cupcakes
        (
            "Veloura Signature 6-Piece Cupcake Box",
            "veloura-signature-6-piece-cupcake-box",
            "An assortment of our most celebrated cupcake flavors: Red Velvet Gold, Triple Chocolate Ganache, Salted Caramel Pecan, and Pistachio Rose.",
            cat_map["cupcakes"],
            549.0, 499.0, 4.89, 55,
            "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Chef Assorted 6 Flavours"]),
            json.dumps(["Set of 6", "Set of 12"]),
            1, 1, 1, 1
        ),
        (
            "Rose Gold Velvet Cupcakes (Box of 4)",
            "rose-gold-velvet-cupcakes-box-4",
            "Fluffy red velvet cupcake sponges crowned with Swiss meringue buttercream, edible rose petals, and dusted with 24K rose gold flakes.",
            cat_map["cupcakes"],
            399.0, 349.0, 4.87, 29,
            "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Rose Velvet Cream Cheese"]),
            json.dumps(["Set of 4", "Set of 8"]),
            0, 0, 1, 1
        ),
        # French Pastries & Macarons
        (
            "Parisian Rainbow Macarons (Gift Box of 12)",
            "parisian-rainbow-macarons-box-12",
            "Authentic Parisian almond flour macarons filled with chocolate ganache, pistachio praline, passion fruit curd, salted butter caramel, and Tahitian vanilla.",
            cat_map["pastries"],
            699.0, 599.0, 4.94, 76,
            "https://images.unsplash.com/photo-1569864321390-34d3f524fb9e?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1569864321390-34d3f524fb9e?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Assorted 6 French Flavours"]),
            json.dumps(["Box of 12", "Box of 24"]),
            1, 1, 1, 1
        ),
        (
            "Classic French Opera Pastry Slice",
            "classic-french-opera-pastry-slice",
            "Traditional Joconde almond sponge soaked in espresso syrup, layered with French coffee buttercream and rich dark chocolate ganache glaze.",
            cat_map["pastries"],
            249.0, 219.0, 4.91, 33,
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Espresso Chocolate Opera"]),
            json.dumps(["Single Slice", "Box of 2", "Box of 4"]),
            0, 0, 1, 1
        ),
        # Artisan Brownies & Cookies
        (
            "Gourmet Fudgy Walnut Brownies (Box of 6)",
            "gourmet-fudgy-walnut-brownies-box-6",
            "Ultra-fudgy, crackly top brownies baked with melted Callebaut 70% dark chocolate and toasted Kashmiri walnuts.",
            cat_map["brownies-cookies"],
            499.0, 429.0, 4.88, 62,
            "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Dark Chocolate Walnut", "Sea Salt Caramel Fudge"]),
            json.dumps(["Box of 6", "Box of 12"]),
            1, 0, 1, 1
        ),
        (
            "NYC Chunky Stuffed Choc-Chip Cookies (Box of 4)",
            "nyc-chunky-stuffed-choc-chip-cookies",
            "Giant 120g New York style soft-baked cookies loaded with Belgian milk chocolate chunks and filled with molten dark chocolate center.",
            cat_map["brownies-cookies"],
            399.0, 349.0, 4.95, 89,
            "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Molten Choc-Chip", "Double Choc Nutella"]),
            json.dumps(["Box of 4", "Box of 8"]),
            1, 1, 1, 1
        ),
        # Jar Cakes & Trifles
        (
            "Red Velvet & Truffle Duet Jar Cakes (Set of 2)",
            "red-velvet-truffle-duet-jar-cakes-set-2",
            "Indulgent glass jar cakes featuring alternating layers of velvety cake crumb, silky cream cheese frosting, and Dutch chocolate ganache.",
            cat_map["jar-cakes"],
            349.0, 299.0, 4.86, 45,
            "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Red Velvet + Dark Truffle"]),
            json.dumps(["Set of 2 (200ml each)", "Set of 4"]),
            1, 0, 1, 1
        ),
        # Gift Hampers
        (
            "The Royal Veloura Grand Celebration Hamper",
            "royal-veloura-grand-celebration-hamper",
            "Our most majestic gift trunk lined with silk: features 1 Bento Belgian Cake, 6 Assorted Parisian Macarons, 4 NYC Cookies, and Artisanal Bonbons.",
            cat_map["gift-hampers"],
            1999.0, 1799.0, 4.99, 27,
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Grand Luxury Selection"]),
            json.dumps(["Deluxe Box", "Imperial Hamper"]),
            1, 1, 1, 1
        ),
        # Artisanal Coffee & Brews
        (
            "Veloura Signature Spanish Latte",
            "veloura-signature-spanish-latte",
            "Our barista signature: double shot of single-origin espresso swirled with condensed milk and creamy textured micro-foam. Rich, velvety, and perfectly balanced.",
            cat_map["coffee-brews"],
            269.0, 229.0, 4.96, 78,
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Whole Milk", "Oat Milk (Plant-Based)", "Almond Milk", "Skimmed Milk"]),
            json.dumps(["Regular (250 ml)", "Large (350 ml)", "Iced Grande (450 ml)"]),
            1, 1, 1, 1
        ),
        (
            "24-Hour Cascara Cold Brew",
            "24-hour-cascara-cold-brew",
            "Slow-steeped for 24 hours using Chikmagalur dark roast beans and cascara coffee cherry infusion. Incredibly smooth with notes of chocolate and dried fruits.",
            cat_map["coffee-brews"],
            249.0, 219.0, 4.92, 64,
            "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Classic Black", "Vanilla Sweet Cream", "Spiced Cinnamon"]),
            json.dumps(["Glass Bottle (300 ml)", "Party Flask (750 ml)"]),
            1, 1, 1, 1
        ),
        (
            "Belgian Dark Mocha Royale",
            "belgian-dark-mocha-royale",
            "Rich espresso combined with molten Callebaut 70% Belgian chocolate ganache, steamed silky milk, and crowned with cocoa nibs.",
            cat_map["coffee-brews"],
            289.0, 249.0, 4.94, 53,
            "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Dark Chocolate 70%", "White Chocolate Mocha", "Hazelnut Mocha"]),
            json.dumps(["Regular (250 ml)", "Large (350 ml)", "Iced Large (450 ml)"]),
            1, 1, 1, 1
        ),
        (
            "Madagascar Vanilla Bean Cappuccino",
            "madagascar-vanilla-cappuccino",
            "Espresso with thick textured foam, infused with real Madagascar bourbon vanilla pods and dusted with Ceylon cinnamon.",
            cat_map["coffee-brews"],
            259.0, 219.0, 4.88, 42,
            "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Standard Roast", "Double Shot Extra Strong"]),
            json.dumps(["Regular (250 ml)", "Large (350 ml)"]),
            0, 1, 1, 1
        ),
        (
            "Caramel Hazelnut Frappe Glace",
            "caramel-hazelnut-frappe-glace",
            "Thick ice-blended coffee frappe swirled with salted butter caramel, roasted hazelnut syrup, and topped with fresh whipped cream.",
            cat_map["coffee-brews"],
            319.0, 279.0, 4.97, 85,
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Salted Caramel", "Roasted Hazelnut", "Mocha Cookie Crunch"]),
            json.dumps(["Grande (400 ml)", "Venti (550 ml)"]),
            1, 1, 1, 1
        ),
        (
            "Single-Origin Ethiopian Pour-Over",
            "ethiopian-single-origin-pour-over",
            "Hand-poured artisan filter coffee showcasing floral jasmine, bergamot, and peach notes. Clean, vibrant, and aromatic.",
            cat_map["coffee-brews"],
            279.0, 239.0, 4.91, 36,
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Light Roast (Citrus & Floral)", "Medium Roast (Chocolate & Plum)"]),
            json.dumps(["Cup (250 ml)", "Carafe to Share (500 ml)"]),
            0, 1, 1, 1
        ),
        # Gourmet Cafe & Savory Bites
        (
            "Truffle Mushroom & Brie Sourdough Panini",
            "truffle-mushroom-brie-sourdough",
            "Crispy grilled sourdough stuffed with garlic-herb roasted portobello mushrooms, French brie, baby spinach, and white truffle glaze.",
            cat_map["cafe-savory"],
            369.0, 329.0, 4.95, 68,
            "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Warm Pressed (Ready to Eat)", "Chilled (Heat at Home)"]),
            json.dumps(["Single Panini", "Panini + Iced Americano Combo"]),
            1, 1, 1, 1
        ),
        (
            "Butter Flaky French Croissant (Set of 2)",
            "butter-flaky-french-croissant",
            "Authentic Parisian croissants made with pure Normandy butter and 27 delicate folded layers. Golden honeycomb crumb and shatteringly crisp crust.",
            cat_map["cafe-savory"],
            279.0, 249.0, 4.93, 77,
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Classic Normandy Butter", "Served with Berry Jam"]),
            json.dumps(["Set of 2", "Box of 4"]),
            1, 1, 1, 1
        ),
        (
            "Almond Frangipane Twice-Baked Croissant",
            "almond-frangipane-croissant",
            "Flaky croissant soaked in orange blossom syrup, filled with rich almond frangipane paste, and blanketed with toasted sliced almonds and powdered sugar.",
            cat_map["cafe-savory"],
            299.0, 269.0, 4.96, 59,
            "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Classic Almond Frangipane", "Chocolate Almond"]),
            json.dumps(["Single Piece", "Pair (2 Pieces)"]),
            1, 1, 1, 1
        ),
        (
            "Pesto Sundried Tomato & Mozzarella Brioche Melt",
            "pesto-mozzarella-brioche-melt",
            "Golden toasted sweet brioche filled with buffalo mozzarella, basil pine nut pesto, sun-dried tomatoes, and balsamic reduction.",
            cat_map["cafe-savory"],
            349.0, 309.0, 4.89, 44,
            "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Toasted Crisp", "Extra Mozzarella Melt"]),
            json.dumps(["Single Melt", "Melt + Cold Brew Combo"]),
            0, 1, 1, 1
        ),
        (
            "Greek Spinach & Feta Artisanal Quiche",
            "spinach-feta-artisanal-quiche",
            "Individual French shortcrust pastry filled with baby spinach, crumbled Greek feta, caramelized onions, and nutmeg-spiced eggless cream custard.",
            cat_map["cafe-savory"],
            319.0, 279.0, 4.91, 38,
            "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Warm & Flaky", "With Petite Herb Salad"]),
            json.dumps(["Individual Tart (4 inch)", "Pair of Tarts"]),
            0, 1, 1, 1
        ),
        (
            "Avocado Everything Bagel with Herb Schmear",
            "avocado-herb-cream-cheese-bagel",
            "Hand-rolled and boiled New York bagel topped with everything seasoning, whipped chive Philadelphia cream cheese, sliced ripe avocado, and chili flakes.",
            cat_map["cafe-savory"],
            339.0, 299.0, 4.95, 71,
            "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80",
            json.dumps(["https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80"]),
            json.dumps(["Whipped Chive Cream Cheese", "Spicy Jalapeno Schmear"]),
            json.dumps(["Single Bagel", "Bagel + Cold Brew Combo"]),
            1, 1, 1, 1
        )
    ]

    c.executemany('''
        INSERT INTO products (
            name, slug, description, category_id, base_price, discount_price, rating, review_count,
            image_url, gallery_json, flavours_json, weights_json, is_bestseller, is_featured, is_eggless_available, in_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', products)

    # Reviews
    c.execute("SELECT id, name FROM products")
    prods = c.fetchall()
    reviews = []
    for pid, pname in prods:
        reviews.append((pid, 2, "Priya Sengupta", 5.0, f"Ordered {pname} for our family celebration. The texture was exceptionally moist and the aroma was divine!"))
        reviews.append((pid, None, "Rohan Varma", 4.9, "Delivered right on time at midnight in immaculate temperature-controlled packaging. Veloura is truly my first choice!"))

    c.executemany('''
        INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    ''', reviews)

    # Seed Sample Order
    c.execute('''
        INSERT INTO orders (
            order_number, user_id, customer_name, customer_email, customer_phone, delivery_address,
            city, pincode, delivery_date, delivery_time_slot, cake_message, special_instructions,
            subtotal, discount, delivery_fee, total_amount, payment_method, payment_status, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        "VEL-2026-89102", 2, "Aarav Sharma", "user@veloura.com", "+91 98123 45678",
        "Flat 4B, Emerald Heights, Powai", "Mumbai", "400076", "2026-11-12",
        "Evening (6 PM - 9 PM)", "Happy Anniversary My Love",
        "Please ring the bell gently and deliver with candle and matchbox.",
        1299.0, 129.9, 0.0, 1169.1, "UPI / Card", "Paid (Verified)", "Baking"
    ))
    order_id = c.lastrowid

    c.execute('''
        INSERT INTO order_items (
            order_id, product_id, product_name, product_image, weight, flavour, is_eggless,
            cake_message, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        order_id, 1, "Royal Belgian Truffle Gateau",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        "1.0 kg", "Belgian Dark Truffle", 1, "Happy Anniversary My Love", 1299.0, 1, 1299.0
    ))

    conn.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    init_db()
