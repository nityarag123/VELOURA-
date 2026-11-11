from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.database.seed_data import seed_database
from app.models.models import Product, User, Category, Order

Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)

products_count = db.query(Product).count()
users_count = db.query(User).count()
categories_count = db.query(Category).count()
orders_count = db.query(Order).count()

print(f"Categories: {categories_count}")
print(f"Products: {products_count}")
print(f"Users: {users_count}")
print(f"Orders: {orders_count}")
print("Backend verification SUCCESS!")
