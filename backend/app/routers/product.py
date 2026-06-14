from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user

from app.schemas.product import ProductCreate,ProductUpdate, ProductResponse
from app.services.product_service import (
    get_all_products,
    add_product,
    get_product_by_id,
    delete_product,
    update_product
)
from app.database.session import get_db



router = APIRouter()

@router.get("/products", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    print(current_user)
    return get_all_products(db)


@router.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    
    return add_product(db, product)


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), current_user  = Depends(get_current_user)):
    current_user = Depends(get_current_user)
    product = get_product_by_id(db, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)

):
    updated_product = update_product(db, product_id, product)

    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return updated_product


@router.delete("/products/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db), current_user  = Depends(get_current_user)):
    deleted = delete_product(db, product_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted successfully"}