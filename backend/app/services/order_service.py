from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate
from app.models.inventory_movement import InventoryMovement


def create_order(
    db: Session,
    order_data: OrderCreate,
    current_user: User
):
    # Cashiers, managers, and owners can record sales.
    if current_user.role not in {"cashier", "manager", "owner"}:
        raise PermissionError(
            "You do not have permission to create orders"
        )

    # Prevent the same product from appearing twice in one request.
    product_ids = [item.product_id for item in order_data.items]

    if len(product_ids) != len(set(product_ids)):
        raise ValueError(
            "Each product can appear only once in an order"
        )

    products = db.execute(
        select(Product).where(Product.id.in_(product_ids))
    ).scalars().all()

    products_by_id = {
        product.id: product
        for product in products
    }

    # Validate every product and its available stock before changing data.
    for requested_item in order_data.items:
        product = products_by_id.get(requested_item.product_id)

        if product is None:
            raise ValueError(
                f"Product {requested_item.product_id} not found"
            )

        if product.quantity < requested_item.quantity:
            raise ValueError(
                f"Insufficient stock for {product.name}"
            )

    new_order = Order(
        created_by_id=current_user.id,
        status="completed",
        total_amount=0
    )

    db.add(new_order)
    db.flush()

    total_amount = 0.0

    for requested_item in order_data.items:
        product = products_by_id[requested_item.product_id]

        unit_price = product.price
        line_total = unit_price * requested_item.quantity

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=requested_item.quantity,
            unit_price=unit_price,
            line_total=line_total
        )

        db.add(order_item)

        # Stock is reduced only after all items passed validation.
        product.quantity -= requested_item.quantity

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
        db.commit()
    except Exception:
        db.rollback()
        raise

    # Load items before returning the response.
    result = db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == new_order.id)
    )

    return result.scalar_one()