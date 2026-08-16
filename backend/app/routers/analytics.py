from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.services.analytics_service import (
    get_analytics_overview,
)


router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)


@router.get("/overview")
def analytics_overview(
    days: int = Query(
        default=30,
        ge=7,
        le=365,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in {
        "owner",
        "manager",
    }:
        raise HTTPException(
            status_code=403,
            detail=(
                "Only owners and managers "
                "can view business analytics"
            ),
        )

    return get_analytics_overview(
        db=db,
        days=days,
    )