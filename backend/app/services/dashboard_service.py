import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.redis_client import redis_client
from app.models.order import Order
from app.models.product import Product


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