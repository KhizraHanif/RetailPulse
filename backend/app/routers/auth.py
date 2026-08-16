from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import get_user_by_email, create_user
from app.schemas.user import UserLogin
from app.core.security import (
    create_access_token,
    get_current_user,
)
from app.services.user_service import (
    authenticate_user,
    create_initial_owner,
)
#JWT (JSON Web Token) is a signed token used to identify a user without storing session data on the server.

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)



@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user=Depends(get_current_user)
):
    return current_user

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_initial_owner(
            db=db,
            user_data=user_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=403,
            detail=str(error)
        )

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        form_data.username,
        form_data.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }