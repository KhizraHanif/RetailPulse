from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime
)
from datetime import datetime, timezone

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    sku = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False,
        default="Uncategorized"
    )

    price = Column(
        Float,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=0
    )

    low_stock_threshold = Column(
        Integer,
        nullable=False,
        default=5
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )