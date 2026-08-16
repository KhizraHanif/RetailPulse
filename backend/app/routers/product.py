from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockUpdate,
    ThresholdUpdate,
)
from app.services.product_service import (
    get_all_products,
    add_product,
    get_product_by_id,
    delete_product,
    update_product,
    update_stock as update_product_stock_service,
    get_low_stock_products as get_low_stock_products_service,
    update_low_stock_threshold,
)


router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"]
)


@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_all_products(db)


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return add_product(db, product)


@router.get("/low-stock", response_model=list[ProductResponse])
def get_low_stock_inventory(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_low_stock_products_service(db)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = get_product_by_id(db, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    updated_product = update_product(db, product_id, product)

    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return updated_product


@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    deleted = delete_product(db, product_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}


@router.patch(
    "/{product_id}/stock",
    response_model=ProductResponse
)
def update_product_stock(
    product_id: int,
    stock_update: StockUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):
    try:
        updated_product = (
            update_product_stock_service(
                db=db,
                product_id=product_id,
                quantity_change=(
                    stock_update.quantity_change
                ),
                user_id=current_user.id,
                reason=stock_update.reason
            )
        )

        if updated_product is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return updated_product

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.patch(
    "/{product_id}/threshold",
    response_model=ProductResponse
)
def update_threshold(
    product_id: int,
    threshold_update: ThresholdUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = update_low_stock_threshold(
        db=db,
        product_id=product_id,
        threshold=threshold_update.low_stock_threshold
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product