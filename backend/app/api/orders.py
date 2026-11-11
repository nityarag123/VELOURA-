import random
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.session import get_db
from app.models.models import Order, OrderItem, User
from app.schemas.schemas import OrderCreate, OrderOut
from app.api.auth import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Orders"])

def get_optional_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError):
        return None
    return None

@router.post("", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Generate unique order number: VEL-YYYY-XXXXX
    order_num = f"VEL-2026-{random.randint(10000, 99999)}"

    order = Order(
        order_number=order_num,
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email.lower(),
        customer_phone=order_in.customer_phone,
        delivery_address=order_in.delivery_address,
        city=order_in.city,
        pincode=order_in.pincode,
        delivery_date=order_in.delivery_date,
        delivery_time_slot=order_in.delivery_time_slot,
        cake_message=order_in.cake_message,
        special_instructions=order_in.special_instructions,
        subtotal=order_in.subtotal,
        discount=order_in.discount,
        delivery_fee=order_in.delivery_fee,
        total_amount=order_in.total_amount,
        payment_method=order_in.payment_method,
        payment_status="Paid (Verified)",
        status="Order Placed"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_image=item.product_image,
            weight=item.weight,
            flavour=item.flavour,
            is_eggless=item.is_eggless,
            cake_message=item.cake_message,
            unit_price=item.unit_price,
            quantity=item.quantity,
            total_price=item.total_price
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order

@router.get("/my-orders", response_model=List[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/track/{order_number}", response_model=OrderOut)
def track_order(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found with provided tracking number")
    return order
