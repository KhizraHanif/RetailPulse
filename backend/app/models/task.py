from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class InventoryTask(Base):
    __tablename__ = "inventory_tasks"

    id = Column(Integer, primary_key=True, index=True)

    # Short summary shown in task lists.
    title = Column(String(200), nullable=False)

    # Optional details to help warehouse staff.
    description = Column(String(500))

    # Starts as pending until someone completes it.
    status = Column(String(50), nullable=False, default="pending")

    # Helps group tasks such as warehouse, urgent, supplier, etc.
    category = Column(String(100), nullable=False, default="general")

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())