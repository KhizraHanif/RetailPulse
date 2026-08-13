from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_top_products,
    get_revenue_trend,
    get_recent_movements,
    get_low_stock_products,
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)

@router.get("/top-products")
def top_products(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_top_products(
        db=db,
        limit=limit
    )


@router.get("/revenue-trend")
def revenue_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_revenue_trend(
        db=db,
        days=days
    )
@router.get("/recent-movements")
def recent_movements(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_recent_movements(
        db=db,
        limit=limit
    )
@router.get("/low-stock")
def low_stock_products(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_low_stock_products(
        db=db,
        limit=limit
    )
@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_dashboard_summary(db)