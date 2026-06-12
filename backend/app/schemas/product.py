from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True