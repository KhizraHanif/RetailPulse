from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    created_by_id: int
    status: str
    total_amount: float
    created_at: datetime
    items: list[OrderItemResponse]

    class Config:
        from_attributes = True