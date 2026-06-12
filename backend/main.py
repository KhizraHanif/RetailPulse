from fastapi import FastAPI
from pydantic import BaseModel

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