import json
from sqlalchemy.orm import Session
from app.models.models import User, Category, Product, Review, Coupon, Order, OrderItem
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Check if data already exists
    if db.query(Category).first():
        return

    print("Seeding initial VELOURA bakery data...")

    # 1. Seed Users
    admin_user = User(
        email="admin@veloura.com",
        full_name="VELOURA Master Chef",
        hashed_password=get_password_hash("admin123"),
        phone="+91 98765 43210",
        address="101 Pâtisserie Boulevard, Marine Lines",
        city="Mumbai",
        pincode="400001",
        is_admin=True
    )
    test_user = User(
        email="user@veloura.com",
        full_name="Aarav Sharma",
        hashed_password=get_password_hash("user123"),
        phone="+91 98123 45678",
        address="Flat 4B, Emerald Heights, Powai",
        city="Mumbai",
        pincode="400076",
        is_admin=False
    )
    db.add(admin_user)
    db.add(test_user)
    db.commit()

    # 2. Seed Coupons
    coupons = [
        Coupon(code="VELOURA10", discount_percent=10.0, max_discount=300.0, min_order_amount=499.0, is_active=True),
        Coupon(code="SWEETDEAL", discount_percent=15.0, max_discount=500.0, min_order_amount=899.0, is_active=True),
        Coupon(code="FIRSTBITE", discount_percent=20.0, max_discount=400.0, min_order_amount=399.0, is_active=True),
        Coupon(code="MIDNIGHT", discount_percent=12.0, max_discount=350.0, min_order_amount=699.0, is_active=True),
    ]
    for c in coupons:
        db.add(c)
    db.commit()

    # 3. Seed Categories
    categories_data = [
        {
            "name": "Birthday Cakes",
            "slug": "birthday-cakes",
            "description": "Exquisite artisanal cakes designed to make every birthday celebration unforgettable.",
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Anniversary Cakes",
            "slug": "anniversary-cakes",
            "description": "Romantic, elegant floral and tiered creations celebrating your bond of love.",
            "image_url": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Chocolate Cakes",
            "slug": "chocolate-cakes",
            "description": "Pure indulgence with 70% dark Belgian cocoa, silky truffles, and crunchy pralines.",
            "image_url": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Designer & Bento Cakes",
            "slug": "designer-cakes",
            "description": "Chic Korean minimalist bento cakes and handcrafted sculpted aesthetic cakes.",
            "image_url": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Luxury Cupcakes",
            "slug": "cupcakes",
            "description": "Individual velvet swirls, gold leaf embellishments, and gourmet buttercreams.",
            "image_url": "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "French Pastries & Macarons",
            "slug": "pastries",
            "description": "Classic Parisian opera slices, mille-feuille, delicate éclairs, and French macarons.",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Artisan Brownies & Cookies",
            "slug": "brownies-cookies",
            "description": "Fudgy Belgian walnut brownies and soft-baked gourmet stuffed cookies.",
            "image_url": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Jar Cakes & Trifles",
            "slug": "jar-cakes",
            "description": "Portable, layered layers of moist sponge, rich ganache, and light mascarpone mousse.",
            "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        },
        {
            "name": "Luxury Gift Hampers",
            "slug": "gift-hampers",
            "description": "Curated velvet-box hampers with artisanal chocolates, dry cakes, and scented blooms.",
            "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
            "is_featured": True
        }
    ]

    cat_map = {}
    for cdata in categories_data:
        category = Category(**cdata)
        db.add(category)
        db.commit()
        cat_map[category.slug] = category.id

    # 4. Seed 20+ Products
    products_data = [
        # Chocolate Cakes
        {
            "name": "Royal Belgian Truffle Gateau",
            "slug": "royal-belgian-truffle-gateau",
            "description": "Rich 64% Callebaut dark chocolate layers enveloped in velvety satin ganache and decorated with chocolate ribbons and gold shimmer.",
            "category_id": cat_map["chocolate-cakes"],
            "base_price": 799.0,
            "discount_price": 699.0,
            "rating": 4.95,
            "review_count": 84,
            "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Belgian Dark Truffle", "Swiss Milk Chocolate", "Nutella Hazelnut"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Nutella Ferrero Rocher Indulgence",
            "slug": "nutella-ferrero-rocher-indulgence",
            "description": "Decadent chocolate sponge layered with pure Italian Nutella, roasted crushed hazelnuts, and crowned with whole Ferrero Rocher truffles.",
            "category_id": cat_map["chocolate-cakes"],
            "base_price": 899.0,
            "discount_price": 799.0,
            "rating": 4.9,
            "review_count": 52,
            "image_url": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Nutella Hazelnut", "Dark Truffle Crunch"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        # Birthday Cakes
        {
            "name": "Opulent Velvet Raspberry Crown",
            "slug": "opulent-velvet-raspberry-crown",
            "description": "Ruby-red crimson velvet sponge paired with luscious Philadelphia cream cheese mousse, infused with organic wild raspberry compote.",
            "category_id": cat_map["birthday-cakes"],
            "base_price": 849.0,
            "discount_price": 749.0,
            "rating": 4.92,
            "review_count": 67,
            "image_url": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Red Velvet Cream Cheese", "Raspberry Mascarpone"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Madagascar Golden Vanilla Confetti",
            "slug": "madagascar-golden-vanilla-confetti",
            "description": "Fragrant Bourbon vanilla bean chiffon cake filled with silky white chocolate mousse and hand-painted pastel sprinkles.",
            "category_id": cat_map["birthday-cakes"],
            "base_price": 699.0,
            "discount_price": 599.0,
            "rating": 4.85,
            "review_count": 41,
            "image_url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Bourbon Vanilla Bean", "Vanilla Strawberry Swirl"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            "is_bestseller": False,
            "is_featured": True,
            "is_eggless_available": True
        },
        # Anniversary Cakes
        {
            "name": "Elysian Rose & 24K Gold Pearl Cake",
            "slug": "elysian-rose-gold-pearl-cake",
            "description": "A stunning tiered masterwork adorned with handcrafted sugar peonies, shimmering edible 24K gold leaves, and delicate champagne ganache.",
            "category_id": cat_map["anniversary-cakes"],
            "base_price": 1299.0,
            "discount_price": 1149.0,
            "rating": 4.98,
            "review_count": 39,
            "image_url": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Champagne Rose Vanilla", "Red Velvet Luxury", "Dark Belgian Ganache"]),
            "weights_json": json.dumps(["1.0 kg", "1.5 kg", "2.0 kg", "3.0 kg"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Black Forest Gateau Noir",
            "slug": "black-forest-gateau-noir",
            "description": "Authentic German Schwarzwälder Kirschtorte with tender cocoa sponge, Kirsch-infused sour cherries, and fresh Chantilly cream flakes.",
            "category_id": cat_map["anniversary-cakes"],
            "base_price": 749.0,
            "discount_price": 649.0,
            "rating": 4.88,
            "review_count": 48,
            "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Authentic Black Forest Cherry", "Dutch Chocolate Cherry"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg", "2.0 kg"]),
            "is_bestseller": False,
            "is_featured": False,
            "is_eggless_available": True
        },
        # Designer & Bento Cakes
        {
            "name": "Pastel Dream Korean Bento Cake",
            "slug": "pastel-dream-korean-bento-cake",
            "description": "Cute aesthetic lunchbox cake with minimalist Korean lettering, pastel cloud frosting, and delicate heart piping. Perfect for intimate celebrations.",
            "category_id": cat_map["designer-cakes"],
            "base_price": 449.0,
            "discount_price": 399.0,
            "rating": 4.93,
            "review_count": 92,
            "image_url": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Belgian Chocolate", "Strawberry Shortcake", "Blueberry Cream"]),
            "weights_json": json.dumps(["0.3 kg (Bento)", "0.5 kg"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Celestial Galaxy Mirror Glaze Cake",
            "slug": "celestial-galaxy-mirror-glaze-cake",
            "description": "A hypnotizing deep violet and cosmic blue high-gloss mirror glaze over French dark chocolate mousse and crunchy feuilletine base.",
            "category_id": cat_map["designer-cakes"],
            "base_price": 999.0,
            "discount_price": 899.0,
            "rating": 4.96,
            "review_count": 31,
            "image_url": "https://images.unsplash.com/photo-1518047601542-4505c440a338?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1518047601542-4505c440a338?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Galaxy Chocolate Feuilletine", "Blueberry White Chocolate"]),
            "weights_json": json.dumps(["0.5 kg", "1.0 kg", "1.5 kg"]),
            "is_bestseller": False,
            "is_featured": True,
            "is_eggless_available": True
        },
        # Luxury Cupcakes
        {
            "name": "Veloura Signature 6-Piece Cupcake Box",
            "slug": "veloura-signature-6-piece-cupcake-box",
            "description": "An assortment of our most celebrated cupcake flavors: Red Velvet Gold, Triple Chocolate Ganache, Salted Caramel Pecan, and Pistachio Rose.",
            "category_id": cat_map["cupcakes"],
            "base_price": 549.0,
            "discount_price": 499.0,
            "rating": 4.89,
            "review_count": 55,
            "image_url": "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Chef Assorted 6 Flavours"]),
            "weights_json": json.dumps(["Set of 6", "Set of 12"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Rose Gold Velvet Cupcakes (Box of 4)",
            "slug": "rose-gold-velvet-cupcakes-box-4",
            "description": "Fluffy red velvet cupcake sponges crowned with Swiss meringue buttercream, edible rose petals, and dusted with 24K rose gold flakes.",
            "category_id": cat_map["cupcakes"],
            "base_price": 399.0,
            "discount_price": 349.0,
            "rating": 4.87,
            "review_count": 29,
            "image_url": "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Rose Velvet Cream Cheese"]),
            "weights_json": json.dumps(["Set of 4", "Set of 8"]),
            "is_bestseller": False,
            "is_featured": False,
            "is_eggless_available": True
        },
        # French Pastries & Macarons
        {
            "name": "Parisian Rainbow Macarons (Gift Box of 12)",
            "slug": "parisian-rainbow-macarons-box-12",
            "description": "Authentic Parisian almond flour macarons filled with chocolate ganache, pistachio praline, passion fruit curd, salted butter caramel, and Tahitian vanilla.",
            "category_id": cat_map["pastries"],
            "base_price": 699.0,
            "discount_price": 599.0,
            "rating": 4.94,
            "review_count": 76,
            "image_url": "https://images.unsplash.com/photo-1569864321390-34d3f524fb9e?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1569864321390-34d3f524fb9e?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Assorted 6 French Flavours"]),
            "weights_json": json.dumps(["Box of 12", "Box of 24"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        {
            "name": "Classic French Opera Pastry Slice",
            "slug": "classic-french-opera-pastry-slice",
            "description": "Traditional Joconde almond sponge soaked in espresso syrup, layered with French coffee buttercream and rich dark chocolate ganache glaze.",
            "category_id": cat_map["pastries"],
            "base_price": 249.0,
            "discount_price": 219.0,
            "rating": 4.91,
            "review_count": 33,
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Espresso Chocolate Opera"]),
            "weights_json": json.dumps(["Single Slice", "Box of 2", "Box of 4"]),
            "is_bestseller": False,
            "is_featured": False,
            "is_eggless_available": True
        },
        # Artisan Brownies & Cookies
        {
            "name": "Gourmet Fudgy Walnut Brownies (Box of 6)",
            "slug": "gourmet-fudgy-walnut-brownies-box-6",
            "description": "Ultra-fudgy, crackly top brownies baked with melted Callebaut 70% dark chocolate and toasted Kashmiri walnuts.",
            "category_id": cat_map["brownies-cookies"],
            "base_price": 499.0,
            "discount_price": 429.0,
            "rating": 4.88,
            "review_count": 62,
            "image_url": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Dark Chocolate Walnut", "Sea Salt Caramel Fudge"]),
            "weights_json": json.dumps(["Box of 6", "Box of 12"]),
            "is_bestseller": True,
            "is_featured": False,
            "is_eggless_available": True
        },
        {
            "name": "NYC Chunky Stuffed Choc-Chip Cookies (Box of 4)",
            "slug": "nyc-chunky-stuffed-choc-chip-cookies",
            "description": "Giant 120g New York style soft-baked cookies loaded with Belgian milk chocolate chunks and filled with molten dark chocolate center.",
            "category_id": cat_map["brownies-cookies"],
            "base_price": 399.0,
            "discount_price": 349.0,
            "rating": 4.95,
            "review_count": 89,
            "image_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Molten Choc-Chip", "Double Choc Nutella"]),
            "weights_json": json.dumps(["Box of 4", "Box of 8"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        },
        # Jar Cakes & Trifles
        {
            "name": "Red Velvet & Truffle Duet Jar Cakes (Set of 2)",
            "slug": "red-velvet-truffle-duet-jar-cakes-set-2",
            "description": "Indulgent glass jar cakes featuring alternating layers of velvety cake crumb, silky cream cheese frosting, and Dutch chocolate ganache.",
            "category_id": cat_map["jar-cakes"],
            "base_price": 349.0,
            "discount_price": 299.0,
            "rating": 4.86,
            "review_count": 45,
            "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Red Velvet + Dark Truffle"]),
            "weights_json": json.dumps(["Set of 2 (200ml each)", "Set of 4"]),
            "is_bestseller": True,
            "is_featured": False,
            "is_eggless_available": True
        },
        # Gift Hampers
        {
            "name": "The Royal Veloura Grand Celebration Hamper",
            "slug": "royal-veloura-grand-celebration-hamper",
            "description": "Our most majestic gift trunk lined with silk: features 1 Bento Belgian Cake, 6 Assorted Parisian Macarons, 4 NYC Cookies, and Artisanal Bonbons.",
            "category_id": cat_map["gift-hampers"],
            "base_price": 1999.0,
            "discount_price": 1799.0,
            "rating": 4.99,
            "review_count": 27,
            "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
            "gallery_json": json.dumps([
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
            ]),
            "flavours_json": json.dumps(["Grand Luxury Selection"]),
            "weights_json": json.dumps(["Deluxe Box", "Imperial Hamper"]),
            "is_bestseller": True,
            "is_featured": True,
            "is_eggless_available": True
        }
    ]

    for pdata in products_data:
        prod = Product(**pdata)
        db.add(prod)
        db.commit()

        # Add sample reviews
        r1 = Review(
            product_id=prod.id,
            user_id=test_user.id,
            user_name="Priya Sengupta",
            rating=5.0,
            comment=f"Ordered {prod.name} for our family celebration. The texture was exceptionally moist and the Belgian cocoa aroma was divine!"
        )
        r2 = Review(
            product_id=prod.id,
            user_id=None,
            user_name="Rohan Varma",
            rating=4.9,
            comment="Delivered right on time at midnight in immaculate temperature-controlled packaging. Veloura is truly my first choice now!"
        )
        db.add(r1)
        db.add(r2)

    db.commit()

    # 5. Seed a Sample Order for test_user so Order History is populated
    sample_order = Order(
        order_number="VEL-2026-89102",
        user_id=test_user.id,
        customer_name="Aarav Sharma",
        customer_email="user@veloura.com",
        customer_phone="+91 98123 45678",
        delivery_address="Flat 4B, Emerald Heights, Powai",
        city="Mumbai",
        pincode="400076",
        delivery_date="2026-11-12",
        delivery_time_slot="Evening (6 PM - 9 PM)",
        cake_message="Happy Anniversary My Love",
        special_instructions="Please ring the bell gently and deliver with candle and matchbox.",
        subtotal=1299.0,
        discount=129.9,
        delivery_fee=0.0,
        total_amount=1169.1,
        payment_method="UPI / Card",
        payment_status="Paid (Verified)",
        status="Baking"
    )
    db.add(sample_order)
    db.commit()

    sample_item = OrderItem(
        order_id=sample_order.id,
        product_id=1,
        product_name="Royal Belgian Truffle Gateau",
        product_image="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        weight="1.0 kg",
        flavour="Belgian Dark Truffle",
        is_eggless=True,
        cake_message="Happy Anniversary My Love",
        unit_price=1299.0,
        quantity=1,
        total_price=1299.0
    )
    db.add(sample_item)
    db.commit()

    print("VELOURA bakery database successfully populated with luxury catalog!")
