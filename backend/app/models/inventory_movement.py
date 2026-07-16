from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Examples: sale, restock, return, adjustment.
    movement_type = Column(
        String(30),
        nullable=False
    )

    # Positive values add stock; negative values remove stock.
    quantity_change = Column(
        Integer,
        nullable=False
    )

    reason = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    product = relationship(
        "Product",
        back_populates="inventory_movements"
    )

    user = relationship(
        "User",
        back_populates="inventory_movements"
    )