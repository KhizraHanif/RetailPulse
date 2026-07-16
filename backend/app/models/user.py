from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    role = Column(String(50), nullable=False, default="warehouse_staff")
    # Tasks created by this user.
    created_tasks = relationship(
     "InventoryTask",
     foreign_keys="InventoryTask.created_by_id",
     back_populates="created_by"
    )

# Tasks assigned to this user.
    assigned_tasks = relationship(
     "InventoryTask",
     foreign_keys="InventoryTask.assigned_to_id",
      back_populates="assigned_to"
    )

    # Orders created by this user.
    orders = relationship(
     "Order",
     back_populates="created_by"
    )

    inventory_movements = relationship(
    "InventoryMovement",
    back_populates="user"
)