from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models

from app.routers import (
    auth,
    dashboard,
    order,
    product,
    task,
    user,
    analytics
)



app = FastAPI(
    title="RetailPulse API",
    version="1.0.0",
    description="Retail operations, inventory, sales, and analytics API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(product.router)
app.include_router(task.router)
app.include_router(user.router)
app.include_router(order.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


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