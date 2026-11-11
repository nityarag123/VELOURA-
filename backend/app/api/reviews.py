from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Review, Product, User
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.api.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Reviews"])

@router.post("/{product_id}/reviews", response_model=ReviewOut)
def add_product_review(
    product_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        product_id=product.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)

    # Recalculate average product rating
    product.review_count += 1
    reviews = db.query(Review).filter(Review.product_id == product.id).all()
    total_rating = sum(r.rating for r in reviews) + review_in.rating
    product.rating = round(total_rating / (len(reviews) + 1), 2)

    db.commit()
    db.refresh(review)
    return review
