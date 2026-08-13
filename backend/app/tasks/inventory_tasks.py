from app.core.celery_app import celery_app


@celery_app.task
def process_low_stock_alert(
    product_id: int,
    product_name: str,
    quantity: int,
    threshold: int
):
    print(
        f"LOW STOCK ALERT | "
        f"Product: {product_name} | "
        f"ID: {product_id} | "
        f"Quantity: {quantity} | "
        f"Threshold: {threshold}"
    )