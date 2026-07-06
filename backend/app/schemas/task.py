from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    # Short title shown in the task list.
    title: str = Field(..., min_length=3, max_length=200)

    # Additional information for warehouse staff.
    description: str | None = None

    # Optional grouping such as warehouse, supplier or urgent.
    category: str = "general"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    category: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True