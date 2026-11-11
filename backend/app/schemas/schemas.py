from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: str
    is_featured: bool = True

class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    rating: float
    comment: str

class ReviewOut(BaseModel):
    id: int
    product_id: int
    user_name: str
    rating: float
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    category_id: int
    base_price: float
    discount_price: Optional[float] = None
    rating: float = 4.9
    review_count: int = 12
    image_url: str
    gallery_json: str = "[]"
    flavours_json: str = "[]"
    weights_json: str = "[]"
    is_bestseller: bool = False
    is_featured: bool = False
    is_eggless_available: bool = True
    in_stock: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    base_price: Optional[float] = None
    discount_price: Optional[float] = None
    image_url: Optional[str] = None
    gallery_json: Optional[str] = None
    flavours_json: Optional[str] = None
    weights_json: Optional[str] = None
    is_bestseller: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_eggless_available: Optional[bool] = None
    in_stock: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    category: Optional[CategoryOut] = None
    reviews: List[ReviewOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_image: str
    weight: Optional[str] = None
    flavour: Optional[str] = None
    is_eggless: bool = True
    cake_message: Optional[str] = None
    unit_price: float
    quantity: int = 1
    total_price: float

class OrderItemOut(OrderItemCreate):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    delivery_address: str
    city: str
    pincode: str
    delivery_date: str
    delivery_time_slot: str
    cake_message: Optional[str] = None
    special_instructions: Optional[str] = None
    subtotal: float
    discount: float = 0.0
    delivery_fee: float = 0.0
    total_amount: float
    payment_method: str = "Online / Card"
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str
    city: str
    pincode: str
    delivery_date: str
    delivery_time_slot: str
    cake_message: Optional[str] = None
    special_instructions: Optional[str] = None
    subtotal: float
    discount: float
    delivery_fee: float
    total_amount: float
    payment_method: str
    payment_status: str
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

# Coupon Schemas
class CouponValidate(BaseModel):
    code: str
    order_amount: float

class CouponOut(BaseModel):
    code: str
    discount_percent: float
    max_discount: Optional[float] = None
    min_order_amount: float
    is_active: bool

# Dashboard Stats
class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    total_products: int
    recent_orders: List[OrderOut]
