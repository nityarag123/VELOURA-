from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import Order, Product, User, Category
from app.schemas.schemas import (
    DashboardStats, OrderOut, OrderStatusUpdate, ProductCreate, ProductUpdate, ProductOut
)
from app.api.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_orders = db.query(Order).count()
    revenue_sum = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_customers = db.query(User).filter(User.is_admin == False).count()
    total_products = db.query(Product).count()

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return {
        "total_orders": total_orders,
        "total_revenue": round(revenue_sum, 2),
        "total_customers": total_customers,
        "total_products": total_products,
        "recent_orders": recent_orders
    }

@router.get("/orders", response_model=List[OrderOut])
def get_all_orders(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.put("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

@router.post("/products", response_model=ProductOut)
def create_product(
    prod_in: ProductCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Product).filter(Product.slug == prod_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    product = Product(**prod_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    prod_update: ProductUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = prod_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully"}
