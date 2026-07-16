from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import create_order


router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"]
)


@router.post("/", response_model=OrderResponse)
def create_order_endpoint(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        return create_order(
            db=db,
            order_data=order_data,
            current_user=current_user
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )