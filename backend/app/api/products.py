from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database.session import get_db
from app.models.models import Product, Category
from app.schemas.schemas import ProductOut, CategoryOut

router = APIRouter(tags=["Products & Categories"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id.asc()).all()

@router.get("/products", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_bestseller: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    sort_by: Optional[str] = Query("popular", description="popular, price_asc, price_desc, rating, newest"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    # Category filter
    if category:
        cat_obj = db.query(Category).filter(
            or_(Category.slug == category, Category.name.ilike(f"%{category}%"))
        ).first()
        if cat_obj:
            query = query.filter(Product.category_id == cat_obj.id)
        elif category.isdigit():
            query = query.filter(Product.category_id == int(category))

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    # Price range filter
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)

    # Bestseller & Featured
    if is_bestseller is not None:
        query = query.filter(Product.is_bestseller == is_bestseller)
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Product.base_price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.base_price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else:  # popular
        query = query.order_by(desc(Product.review_count), desc(Product.rating))

    return query.all()

@router.get("/products/{id_or_slug}", response_model=ProductOut)
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        prod = db.query(Product).filter(Product.id == int(id_or_slug)).first()
    else:
        prod = db.query(Product).filter(Product.slug == id_or_slug).first()

    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod
