from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    category: str = Field(default="general", max_length=100)

    # The manager chooses who will complete the task.
    assigned_to_id: int = Field(..., gt=0)

    # Every inventory task must reference a valid product.
    product_id: int = Field(..., gt=0)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=100)
    status: Literal[
    "pending",
    "in_progress",
    "completed"
] | None = None
    assigned_to_id: int | None = Field(default=None, gt=0)
    product_id: int | None = Field(default=None, gt=0)


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    category: str

    created_by_id: int
    assigned_to_id: int
    product_id: int

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True