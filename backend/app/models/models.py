from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=False)
    is_featured = Column(Boolean, default=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    base_price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=12)
    image_url = Column(Text, nullable=False)
    gallery_json = Column(Text, default="[]")
    flavours_json = Column(Text, default="[]")
    weights_json = Column(Text, default="[]")
    is_bestseller = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    is_eggless_available = Column(Boolean, default=True)
    in_stock = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    delivery_address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    delivery_date = Column(String(50), nullable=False)
    delivery_time_slot = Column(String(100), nullable=False)
    cake_message = Column(String(255), nullable=True)
    special_instructions = Column(Text, nullable=True)
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Online / Card")
    payment_status = Column(String(50), default="Paid")
    status = Column(String(50), default="Order Placed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    product_image = Column(Text, nullable=False)
    weight = Column(String(50), nullable=True)
    flavour = Column(String(100), nullable=True)
    is_eggless = Column(Boolean, default=True)
    cake_message = Column(String(255), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), nullable=False)
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    max_discount = Column(Float, nullable=True)
    min_order_amount = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
