from fastapi import FastAPI
from app.routers import product, auth
from app.database.connection import engine, Base
from app.models.product import Product
from app.models.user import User
from app.routers import task


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(product.router)
app.include_router(auth.router)
app.include_router(task.router)

@app.get("/")
def home():
    return {"message": "RetailPulse Backend Running"}