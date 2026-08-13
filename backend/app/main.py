from fastapi import FastAPI

import app.models

from app.routers import (
    auth,
    dashboard,
    order,
    product,
    task,
    user,
)


app = FastAPI(
    title="RetailPulse API",
    version="1.0.0",
    description="Retail operations, inventory, sales, and analytics API",
)


app.include_router(auth.router)
app.include_router(product.router)
app.include_router(task.router)
app.include_router(user.router)
app.include_router(order.router)
app.include_router(dashboard.router)


@app.get("/")
def home():
    return {
        "message": "RetailPulse Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }