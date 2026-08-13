from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.inventory_movement import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate
from app.tasks.inventory_tasks import process_low_stock_alert
from app.core.redis_client import redis_client


def create_order(
    db: Session,
    order_data: OrderCreate,
    current_user: User
):
    # Only sales-related roles can create orders.
    if current_user.role not in {"cashier", "manager", "owner"}:
        raise PermissionError(
            "You do not have permission to create orders"
        )

    # Keep each product unique within one order.
    product_ids = [
        item.product_id
        for item in order_data.items
    ]

    if len(product_ids) != len(set(product_ids)):
        raise ValueError(
            "Each product can appear only once in an order"
        )

    # Fetch all requested products in one query.
    products = db.execute(
        select(Product).where(
            Product.id.in_(product_ids)
        )
    ).scalars().all()

    products_by_id = {
        product.id: product
        for product in products
    }

    # Validate products and stock before modifying anything.
    for requested_item in order_data.items:
        product = products_by_id.get(
            requested_item.product_id
        )

        if product is None:
            raise ValueError(
                f"Product {requested_item.product_id} not found"
            )

        if product.quantity < requested_item.quantity:
            raise ValueError(
                f"Insufficient stock for {product.name}"
            )

    # Create the order first so we can use its ID
    # when creating related records.
    new_order = Order(
        created_by_id=current_user.id,
        status="completed",
        total_amount=0
    )

    db.add(new_order)

    # Flush sends the INSERT without committing the transaction.
    # This gives us new_order.id.
    db.flush()

    total_amount = 0.0

    for requested_item in order_data.items:
        product = products_by_id[
            requested_item.product_id
        ]

        unit_price = product.price
        line_total = (
            unit_price * requested_item.quantity
        )

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=requested_item.quantity,
            unit_price=unit_price,
            line_total=line_total
        )

        db.add(order_item)

        # Reduce current inventory.
        product.quantity -= requested_item.quantity

        # Record why the inventory changed.
        movement = InventoryMovement(
            product_id=product.id,
            user_id=current_user.id,
            movement_type="sale",
            quantity_change=-requested_item.quantity,
            reason=f"Order #{new_order.id}"
        )

        db.add(movement)

        total_amount += line_total

    new_order.total_amount = total_amount

    try:
        # Order, items, stock changes and movements
        # are committed together.
        db.commit()

    except Exception:
        db.rollback()
        raise


    # Invalidate cached dashboard summary because the order changed
    # revenue, order count, stock levels and possibly low-stock count.
    deleted = redis_client.delete("dashboard:summary")
    print(f"CACHE INVALIDATION: deleted={deleted}")
    
    # Only publish background jobs after the DB commit succeeds.
    for requested_item in order_data.items:
        product = products_by_id[
            requested_item.product_id
        ]

        if product.quantity <= product.low_stock_threshold:
            process_low_stock_alert.delay(
                product.id,
                product.name,
                product.quantity,
                product.low_stock_threshold
            )

    # Load the order items before returning the API response.

    result = db.execute(
        select(Order)
        .options(
            selectinload(Order.items)
        )
        .where(
            Order.id == new_order.id
        )
    )

    return result.scalar_one()



# TODO: Production hardening — implement the Transactional Outbox Pattern.
# Currently the database transaction commits before the Celery task is
# published to RabbitMQ. If RabbitMQ is unavailable after db.commit(),
# the order will be saved but the low-stock event could be lost.
# Later, store the event in an outbox table within the same DB transaction
# and publish unprocessed outbox events to RabbitMQ with retry support.clea