from fastapi import FastAPI
from app.routers import product, auth
from app.database.connection import engine, Base
from app.models.product import Product
from app.models.user import User
from app.routers import task, user, order


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(product.router)
app.include_router(auth.router)
app.include_router(task.router)
app.include_router(user.router)
app.include_router(order.router)

@app.get("/")
def home():
    return {"message": "RetailPulse Backend Running"}