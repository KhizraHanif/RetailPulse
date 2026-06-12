from fastapi import FastAPI
from app.routers import product
from app.database.connection import engine, Base
from app.models.product import Product

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(product.router)

@app.get("/")
def home():
    return {"message": "RetailPulse Backend Running"}