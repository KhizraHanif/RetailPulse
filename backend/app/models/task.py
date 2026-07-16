from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class InventoryTask(Base):
    __tablename__ = "inventory_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500))
    status = Column(String(50), nullable=False, default="pending")
    category = Column(String(100), nullable=False, default="general")

    # Employee or manager who created the task.
    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Employee responsible for completing the task.
    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Product connected to the warehouse task.
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    created_at = Column(DateTime, server_default=func.now())

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    created_by = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_tasks"
    )

    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        back_populates="assigned_tasks"
    )

    product = relationship(
        "Product",
        back_populates="tasks"
    )

