from fastapi import FastAPI
from pydantic import BaseModel
from app.routers import product, auth, task, user

app = FastAPI()

# Temporary in-memory database
products = []

# Product structure
class Product(BaseModel):
    name: str
    price: float
    quantity: int

@app.get("/")
def home():
    return {"message": "RetailPulse Backend Running"}

# Get all products
@app.get("/products")
def get_products():
    return products

# Add new product
@app.post("/products")
def create_product(product: Product):
    products.append(product)
    return {
        "message": "Product added successfully",
        "product": product
    }

# Include routers
app.include_router(product.router)
app.include_router(auth.router)
app.include_router(task.router)
app.include_router(user.router)
