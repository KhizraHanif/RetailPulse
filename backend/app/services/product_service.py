from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from redis.exceptions import RedisError

from app.core.redis_client import redis_client
from app.models.inventory_movement import InventoryMovement

def get_all_products(db: Session):
    statement = select(Product)
    result = db.execute(statement)
    return result.scalars().all()


def add_product(db: Session, product: ProductCreate):
    db_product = Product(
        name=product.name,
        sku=product.sku,
        category=product.category,
        price=product.price,
        quantity=product.quantity,
        low_stock_threshold=product.low_stock_threshold 
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
    product.sku = updated_data.sku
    product.category = updated_data.category
    product.price = updated_data.price
    product.quantity = updated_data.quantity
    product.low_stock_threshold = updated_data.low_stock_threshold

    db.commit()
    db.refresh(product)

    return product

# update stock quantity
def update_stock(
    db: Session,
    product_id: int,
    quantity_change: int,
    user_id: int,
    reason: str
):
    product = get_product_by_id(
        db,
        product_id
    )

    if product is None:
        return None

    new_quantity = (
        product.quantity
        + quantity_change
    )

    if new_quantity < 0:
        raise ValueError(
            "Insufficient stock available"
        )

    product.quantity = new_quantity

    movement_type = (
        "restock"
        if quantity_change > 0
        else "adjustment"
    )

    movement = InventoryMovement(
        product_id=product.id,
        user_id=user_id,
        movement_type=movement_type,
        quantity_change=quantity_change,
        reason=reason
    )

    db.add(movement)

    try:
        db.commit()
        db.refresh(product)

    except Exception:
        db.rollback()
        raise

    # Redis is only a cache.
    # A Redis failure should not undo
    # a successful inventory update.
    try:
        redis_client.delete(
            "dashboard:summary"
        )

    except RedisError as error:
        print(
            "Dashboard cache "
            f"invalidation failed: {error}"
        )

    return product

# low stock products are those at or below their threshold
def get_low_stock_products(db: Session):
    # Products at or below their threshold
    statement = select(Product).where(
        Product.quantity <= Product.low_stock_threshold
    )

    result = db.execute(statement)

    return result.scalars().all()


def update_low_stock_threshold(
    db: Session,
    product_id: int,
    threshold: int
):
    product = get_product_by_id(
        db,
        product_id
    )

    if product is None:
        return None

    product.low_stock_threshold = threshold

    db.commit()
    db.refresh(product)

    try:
        redis_client.delete(
            "dashboard:summary"
        )
    except RedisError as error:
        print(
            f"Cache invalidation failed: {error}"
        )

    return product