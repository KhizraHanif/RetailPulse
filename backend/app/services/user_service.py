from sqlalchemy import select
from sqlalchemy.orm import Session
from app.schemas.user import (
    StaffUserCreate,
    UserCreate,
)
from app.models.user import User
from app.core.security import hash_password, verify_password


def get_user_by_email(db: Session, email: str):
    statement = select(User).where(User.email == email)
    result = db.execute(statement)
    return result.scalars().first()


def create_user(db: Session, user_data: UserCreate):
    hashed_password = hash_password(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

def update_user_role(
    db: Session,
    user_id: int,
    new_role: str,
    current_user: User
):
    # Role management is restricted to store owners.
    if current_user.role != "owner":
        raise PermissionError(
            "Only owners can change user roles"
        )

    user = db.get(User, user_id)

    if user is None:
        return None

    # Prevent an owner from accidentally removing their own access.
    if user.id == current_user.id and new_role != "owner":
        raise ValueError(
            "You cannot remove your own owner role"
        )

    user.role = new_role

    db.commit()
    db.refresh(user)

    return user
def create_initial_owner(
    db: Session,
    user_data: UserCreate
):
    # Registration is only used to bootstrap
    # the very first RetailPulse account.
    existing_user = db.execute(
        select(User.id).limit(1)
    ).scalar_one_or_none()

    if existing_user is not None:
        raise ValueError(
            "Initial owner has already been created"
        )

    hashed_password = hash_password(
        user_data.password
    )

    owner = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role="owner"
    )

    db.add(owner)
    db.commit()
    db.refresh(owner)

    return owner

def create_staff_user(
    db: Session,
    user_data: StaffUserCreate,
    current_user: User
):
    if current_user.role != "owner":
        raise PermissionError(
            "Only owners can create users"
        )

    existing_user = get_user_by_email(
        db,
        user_data.email
    )

    if existing_user:
        raise ValueError(
            "Email already registered"
        )

    hashed_password = hash_password(
        user_data.password
    )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
def get_assignable_users(
    db: Session,
    current_user: User
):
    if current_user.role not in {
        "owner",
        "manager",
    }:
        raise PermissionError(
            "You do not have permission "
            "to view assignable users"
        )

    statement = (
        select(User)
        .where(
            User.role == "warehouse_staff"
        )
        .order_by(User.name)
    )

    result = db.execute(statement)

    return result.scalars().all()

def get_all_users(
    db: Session,
    current_user: User
):
    if current_user.role != "owner":
        raise PermissionError(
            "Only owners can view all users"
        )

    statement = (
        select(User)
        .order_by(User.name)
    )

    result = db.execute(statement)

    return result.scalars().all()