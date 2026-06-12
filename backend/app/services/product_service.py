from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

def get_all_products(db: Session):
    statement = select(Product)
    result = db.execute(statement)
    return result.scalars().all()


def add_product(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        price=product.price,
        quantity=product.quantity
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


def get_product_by_id(db: Session, product_id: int):
    statement = select(Product).where(Product.id == product_id)
    result = db.execute(statement)
    return result.scalars().first()


def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id)

    if product is None:
        return False

    db.delete(product)
    db.commit()

    return True


def update_product(db: Session, product_id: int, updated_data: ProductUpdate):
    product = get_product_by_id(db, product_id)

    if product is None:
        return None

    product.name = updated_data.name
    product.price = updated_data.price
    product.quantity = updated_data.quantity

    db.commit()
    db.refresh(product)

    return product