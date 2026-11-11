from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Coupon
from app.schemas.schemas import CouponValidate, CouponOut

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.get("", response_model=List[CouponOut])
def get_active_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.is_active == True).all()

@router.post("/apply")
def apply_coupon(payload: CouponValidate, db: Session = Depends(get_db)):
    code_upper = payload.code.strip().upper()
    coupon = db.query(Coupon).filter(Coupon.code == code_upper, Coupon.is_active == True).first()

    if not coupon:
        raise HTTPException(status_code=400, detail="Invalid or expired coupon code")

    if payload.order_amount < coupon.min_order_amount:
        raise HTTPException(
            status_code=400,
            detail=f"This coupon requires a minimum order amount of ₹{int(coupon.min_order_amount)}"
        )

    # Calculate discount
    discount = (payload.order_amount * coupon.discount_percent) / 100.0
    if coupon.max_discount and discount > coupon.max_discount:
        discount = coupon.max_discount

    return {
        "valid": True,
        "code": coupon.code,
        "discount_amount": round(discount, 2),
        "discount_percent": coupon.discount_percent,
        "message": f"Coupon {coupon.code} applied successfully! You saved ₹{round(discount, 2)}"
    }
