from pydantic import BaseModel, Field
from datetime import datetime


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    sku: str = Field(..., min_length=2, max_length=50)
    category: str = Field(default="Uncategorized", max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)


class ProductUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    sku: str = Field(..., min_length=2, max_length=50)
    category: str = Field(default="Uncategorized", max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)

       # Positive value adds stock,
   
# Negative value reduces stock, zero means no change

class StockUpdate(BaseModel):
    quantity_change: int = Field(..., ne=0)





class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    price: float
    quantity: int
    low_stock_threshold: int
    created_at: datetime | None
    updated_at: datetime | None




    class Config:
        from_attributes = True