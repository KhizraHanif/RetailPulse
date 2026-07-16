from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.schemas.user import UserResponse, UserRoleUpdate
from app.services.user_service import update_user_role


router = APIRouter(
    prefix="/api/v1/users",
    tags=["User Management"]
)


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse
)
def change_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        updated_user = update_user_role(
            db=db,
            user_id=user_id,
            new_role=role_data.role,
            current_user=current_user
        )

        if updated_user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return updated_user

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