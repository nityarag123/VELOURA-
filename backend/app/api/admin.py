from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from app.database.session import get_db
from app.models.models import Order, Product, User, Category, Reservation, ReservationItem
from app.schemas.schemas import (
    DashboardStats, OrderOut, OrderStatusUpdate, ProductCreate, ProductUpdate, ProductOut,
    CategoryCreate, CategoryUpdate, CategoryOut,
    ReservationCreate, ReservationUpdate, ReservationOut,
    ReservationItemCreate, ReservationItemOut,
    CustomerOut, CustomerDetailOut
)
from app.api.auth import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

# ================= DASHBOARD OVERVIEW =================
@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_orders = db.query(Order).count()
    revenue_sum = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_customers = db.query(User).filter(User.is_admin == False).count()
    total_products = db.query(Product).count()
    total_categories = db.query(Category).count()
    total_reservations = db.query(Reservation).count()

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
    recent_reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).limit(10).all()

    return {
        "total_orders": total_orders,
        "total_revenue": round(revenue_sum, 2),
        "total_customers": total_customers,
        "total_products": total_products,
        "total_categories": total_categories,
        "total_reservations": total_reservations,
        "recent_orders": recent_orders,
        "recent_reservations": recent_reservations
    }

# ================= CATEGORY MANAGEMENT =================
@router.get("/categories", response_model=List[CategoryOut])
def get_all_categories(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Category).order_by(Category.id.asc()).all()

@router.post("/categories", response_model=CategoryOut)
def create_category(
    cat_in: CategoryCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(
        (Category.name == cat_in.name) | (Category.slug == cat_in.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name or slug already exists")

    category = Category(**cat_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/categories/{cat_id}", response_model=CategoryOut)
def update_category(
    cat_id: int,
    cat_update: CategoryUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = cat_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(category, field, val)

    db.commit()
    db.refresh(category)
    return category

@router.delete("/categories/{cat_id}")
def delete_category(
    cat_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == cat_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    products_count = db.query(Product).filter(Product.category_id == cat_id).count()
    if products_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category: {products_count} product(s) are currently assigned to it. Please reassign or delete them first."
        )

    db.delete(category)
    db.commit()
    return {"message": f"Category '{category.name}' deleted successfully"}

# ================= PRODUCT MANAGEMENT =================
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

# ================= ORDER MANAGEMENT =================
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

# ================= TABLE RESERVATIONS & ATTACHED DISHES =================
@router.get("/reservations", response_model=List[ReservationOut])
def get_all_reservations(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Reservation).order_by(Reservation.created_at.desc()).all()

@router.post("/reservations", response_model=ReservationOut)
def admin_create_reservation(
    res_in: ReservationCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    res_data = res_in.model_dump()
    if not res_data.get("token"):
        res_data["token"] = f"VL-{uuid.uuid4().hex[:6].upper()}"

    reservation = Reservation(**res_data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.put("/reservations/{res_id}/status", response_model=ReservationOut)
def update_reservation_status(
    res_id: int,
    status_update: OrderStatusUpdate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    reservation = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    reservation.status = status_update.status
    db.commit()
    db.refresh(reservation)
    return reservation

@router.delete("/reservations/{res_id}")
def delete_reservation(
    res_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    reservation = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    db.delete(reservation)
    db.commit()
    return {"message": "Reservation deleted successfully"}

# Attach specific menu items to reservation
@router.post("/reservations/{res_id}/items", response_model=ReservationItemOut)
def attach_dish_to_reservation(
    res_id: int,
    item_in: ReservationItemCreate,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    reservation = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    total_price = round(item_in.unit_price * item_in.quantity, 2)
    res_item = ReservationItem(
        reservation_id=res_id,
        product_id=item_in.product_id,
        product_name=item_in.product_name,
        unit_price=item_in.unit_price,
        quantity=item_in.quantity,
        total_price=total_price,
        notes=item_in.notes
    )
    db.add(res_item)

    # Sync summary text string on reservation
    existing_items = db.query(ReservationItem).filter(ReservationItem.reservation_id == res_id).all()
    summary_list = [f"{it.product_name} (x{it.quantity})" for it in existing_items] + [f"{item_in.product_name} (x{item_in.quantity})"]
    reservation.pre_ordered_items = ", ".join(summary_list)

    db.commit()
    db.refresh(res_item)
    return res_item

@router.delete("/reservations/{res_id}/items/{item_id}")
def remove_dish_from_reservation(
    res_id: int,
    item_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(ReservationItem).filter(
        ReservationItem.id == item_id,
        ReservationItem.reservation_id == res_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Reservation item not found")

    db.delete(item)

    remaining_items = db.query(ReservationItem).filter(
        ReservationItem.reservation_id == res_id,
        ReservationItem.id != item_id
    ).all()
    reservation = db.query(Reservation).filter(Reservation.id == res_id).first()
    if reservation:
        reservation.pre_ordered_items = ", ".join([f"{it.product_name} (x{it.quantity})" for it in remaining_items])

    db.commit()
    return {"message": "Menu item removed from reservation successfully"}

# ================= CUSTOMER DIRECTORY =================
@router.get("/customers", response_model=List[CustomerOut])
def get_customers(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customers = db.query(User).filter(User.is_admin == False).order_by(User.created_at.desc()).all()
    result = []
    for c in customers:
        user_orders = db.query(Order).filter((Order.user_id == c.id) | (Order.customer_email == c.email)).all()
        spent = sum(o.total_amount for o in user_orders)
        result.append({
            "id": c.id,
            "email": c.email,
            "full_name": c.full_name,
            "phone": c.phone,
            "address": c.address,
            "city": c.city,
            "pincode": c.pincode,
            "created_at": c.created_at,
            "total_orders": len(user_orders),
            "total_spent": round(spent, 2)
        })
    return result

@router.get("/customers/{user_id}", response_model=CustomerDetailOut)
def get_customer_detail(
    user_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    customer = db.query(User).filter(User.id == user_id, User.is_admin == False).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    orders = db.query(Order).filter((Order.user_id == customer.id) | (Order.customer_email == customer.email)).order_by(Order.created_at.desc()).all()
    reservations = db.query(Reservation).filter((Reservation.guest_email == customer.email) | (Reservation.guest_phone == customer.phone)).order_by(Reservation.created_at.desc()).all()
    spent = sum(o.total_amount for o in orders)

    return {
        "id": customer.id,
        "email": customer.email,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "address": customer.address,
        "city": customer.city,
        "pincode": customer.pincode,
        "created_at": customer.created_at,
        "total_orders": len(orders),
        "total_spent": round(spent, 2),
        "orders": orders,
        "reservations": reservations
    }

# ================= ADMIN SECURITY =================
class AdminChangePassword(BaseModel):
    current_password: str
    new_password: str

@router.put("/change-password")
def change_admin_password(
    data: AdminChangePassword,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from app.core.security import verify_password, get_password_hash
    if not verify_password(data.current_password, admin_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current admin password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    admin_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Admin password updated successfully! Please use your new password next time."}
