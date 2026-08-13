import json

from sqlalchemy import func, select, cast, Date

from sqlalchemy.orm import Session
from app.core.redis_client import redis_client
from app.models.order import Order
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.inventory_movement import InventoryMovement


CACHE_KEY = "dashboard:summary"
CACHE_TTL_SECONDS = 60


def get_dashboard_summary(db: Session):

    # 1. Try Redis first.
    cached_summary = redis_client.get(CACHE_KEY)

    if cached_summary:
        print("CACHE HIT: dashboard summary")
        return json.loads(cached_summary)

    print("CACHE MISS: querying PostgreSQL")

    # 2. Redis did not have the result, so query PostgreSQL.
    total_products = db.scalar(
        select(func.count(Product.id))
    ) or 0

    total_stock = db.scalar(
        select(func.sum(Product.quantity))
    ) or 0

    low_stock_products = db.scalar(
        select(func.count(Product.id)).where(
            Product.quantity <= Product.low_stock_threshold
        )
    ) or 0

    total_orders = db.scalar(
        select(func.count(Order.id))
    ) or 0

    total_revenue = db.scalar(
        select(func.sum(Order.total_amount))
    ) or 0.0

    summary = {
        "total_products": total_products,
        "total_stock": total_stock,
        "low_stock_products": low_stock_products,
        "total_orders": total_orders,
        "total_revenue": round(float(total_revenue), 2),
    }


    # 3. Store the calculated result in Redis for 60 seconds.
    redis_client.setex(
        CACHE_KEY,
        CACHE_TTL_SECONDS,
        json.dumps(summary)
    )

    return summary

def get_top_products(
    db: Session,
    limit: int = 5
):
    rows = db.execute(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.line_total).label("revenue")
        )
        .join(
            OrderItem,
            OrderItem.product_id == Product.id
        )
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(OrderItem.quantity).desc()
        )
        .limit(limit)
    ).all()

    return [
        {
            "product_id": row.id,
            "name": row.name,
            "units_sold": int(row.units_sold),
            "revenue": round(float(row.revenue), 2)
        }
        for row in rows
    ]  

def get_revenue_trend(
    db: Session,
    days: int = 7
):
    rows = db.execute(
        select(
            cast(Order.created_at, Date).label("date"),
            func.count(Order.id).label("orders"),
            func.sum(Order.total_amount).label("revenue")
        )
        .group_by(
            cast(Order.created_at, Date)
        )
        .order_by(
            cast(Order.created_at, Date)
        )
        .limit(days)
    ).all()

    return [
        {
            "date": str(row.date),
            "orders": int(row.orders),
            "revenue": round(float(row.revenue), 2)
        }
        for row in rows
    ]
def get_recent_movements(
    db: Session,
    limit: int = 10
):
    rows = db.execute(
        select(
            InventoryMovement.id,
            InventoryMovement.movement_type,
            InventoryMovement.quantity_change,
            InventoryMovement.reason,
            InventoryMovement.created_at,
            Product.id.label("product_id"),
            Product.name.label("product_name"),
        )
        .join(
            Product,
            Product.id == InventoryMovement.product_id
        )
        .order_by(
            InventoryMovement.created_at.desc()
        )
        .limit(limit)
    ).all()

    return [
        {
            "id": row.id,
            "product_id": row.product_id,
            "product_name": row.product_name,
            "movement_type": row.movement_type,
            "quantity_change": row.quantity_change,
            "reason": row.reason,
            "created_at": row.created_at,
        }
        for row in rows
    ]


def get_low_stock_products(
    db: Session,
    limit: int = 10
):
    rows = db.execute(
        select(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
            Product.low_stock_threshold,
        )
        .where(
            Product.quantity <= Product.low_stock_threshold
        )
        .order_by(
            Product.quantity.asc()
        )
        .limit(limit)
    ).all()

    return [
        {
            "product_id": row.id,
            "name": row.name,
            "sku": row.sku,
            "quantity": row.quantity,
            "low_stock_threshold": row.low_stock_threshold,
        }
        for row in rows
    ]
# what if recode in database get changed during the info in cache redis then redis will have old info how to cope with this?