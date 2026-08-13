# RetailPulse

RetailPulse is a retail operations and inventory management application built with FastAPI and PostgreSQL.

The backend currently supports authentication, role-based access control, product and inventory management, sales order processing, inventory audit history, low-stock background tasks, and cached dashboard summaries.

The project is being developed incrementally using an Agile/Scrum workflow, with a React analytics dashboard and production deployment planned in later stages.

## Current Architecture

```text
                         RetailPulse
                              |
                         FastAPI API
                              |
          +-------------------+-------------------+
          |                   |                   |
      PostgreSQL            Redis              Celery
          |                   |                   |
   Application Data     Dashboard Cache           |
                                                  |
                                              RabbitMQ
```

### PostgreSQL
Stores persistent application data including:

- users
- products
- inventory tasks
- orders
- order items
- inventory movements

### Redis
Caches dashboard summary data to reduce repeated aggregate queries against PostgreSQL.

The cache is invalidated when an order changes sales or inventory data.

### RabbitMQ + Celery
Handles background work outside the HTTP request cycle.

The current background workflow processes low-stock events after successful order transactions.

---

## Tech Stack

### Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication
- bcrypt

### Background Processing

- Celery
- RabbitMQ

### Caching

- Redis

### Infrastructure

- Docker
- Docker Compose

### Frontend — In Progress

- React
- Tailwind CSS
- Chart.js

### Planned Deployment

- GitHub Actions
- AWS

---

## Features

### Authentication and Authorization

- User registration
- User login
- Password hashing
- JWT access tokens
- Protected API routes
- Role-based access control
- User roles for retail operations

### Product and Inventory Management

- Create, read, update, and delete products
- SKU support
- Product categories
- Stock quantity tracking
- Low-stock thresholds
- Inventory adjustments
- Inventory movement history
- Inventory task assignment

### Sales and Orders

- Create sales orders
- Multiple order items per order
- Product validation before checkout
- Stock availability validation
- Automatic stock reduction
- Order total calculation
- Inventory movement creation for sales
- Transaction rollback on database failure

### Background Tasks

- RabbitMQ message broker
- Celery worker running through Docker
- Low-stock task triggered after successful sales
- Background task execution separated from API requests

### Dashboard

Current dashboard summary API provides:

- total products
- total stock
- low-stock product count
- total orders
- total revenue

Dashboard summaries are cached in Redis with a time-to-live (TTL).

When an order is created, the existing dashboard cache is invalidated so the next request retrieves fresh values from PostgreSQL.

---

## Order Processing Flow

```text
Create Order Request
        |
        v
Authenticate User
        |
        v
Check User Role
        |
        v
Validate Products
        |
        v
Validate Available Stock
        |
        v
Create Order + Order Items
        |
        v
Reduce Product Stock
        |
        v
Record Inventory Movements
        |
        v
Commit PostgreSQL Transaction
        |
        +----------------------+
        |                      |
        v                      v
Invalidate Redis       Check Low-Stock
Dashboard Cache              Threshold
                               |
                               v
                            Celery
                               |
                               v
                           RabbitMQ
                               |
                               v
                         Celery Worker
```

---

## Dashboard Caching

RetailPulse uses a cache-aside approach for dashboard summaries.

```text
Dashboard Request
       |
       v
     Redis
     /   \
   HIT   MISS
    |      |
 Return  PostgreSQL
           |
           v
      Calculate Summary
           |
           v
       Store in Redis
           |
           v
         Return
```

This avoids repeating the same aggregate database queries for every dashboard request.

---

## Database Migrations

Database schema changes are managed with Alembic.

Apply all migrations with:

```bash
alembic upgrade head
```

Check the current migration:

```bash
alembic current
```

The application does not create database tables automatically at startup. Schema changes should be made through Alembic migrations.

---

## Project Structure

```text
RetailPulse/
│
├── docker-compose.yml
├── README.md
│
└── backend/
    │
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic.ini
    ├── alembic/
    │
    └── app/
        ├── main.py
        ├── core/
        ├── database/
        ├── models/
        ├── routers/
        ├── schemas/
        ├── services/
        └── tasks/
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/KhizraHanif/RetailPulse.git
cd RetailPulse
```

### 2. Create the backend virtual environment

```bash
cd backend
python -m venv venv
```

On Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create:

```text
backend/.env
```

Configure the required database, authentication, RabbitMQ, and Redis settings.

Do not commit `.env` to source control.

### 5. Apply database migrations

```bash
alembic upgrade head
```

### 6. Start infrastructure services

From the project root:

```bash
docker compose --env-file backend/.env up -d
```

This starts the current containerized infrastructure:

- RabbitMQ
- Redis
- Celery worker

### 7. Start FastAPI

From `backend/`:

```bash
python -m uvicorn app.main:app --reload
```

### 8. Open the API documentation

Once the backend is running, open the `/docs` endpoint in your browser.

The Swagger interface can be used to test authentication, products, inventory tasks, orders, and dashboard endpoints.

---

## Development Roadmap

| Stage | Focus | Status |
|---|---|---|
| Backend Foundation | FastAPI, PostgreSQL, SQLAlchemy, Alembic | Complete |
| Authentication | JWT authentication and role-based access | Complete |
| Inventory | Products, stock tracking, tasks, movements | Complete |
| Sales | Orders, order items, stock updates | Complete |
| Background Processing | RabbitMQ and Celery | Complete |
| Caching | Redis dashboard caching and invalidation | Complete |
| Analytics API | Sales and inventory analytics | In Progress |
| Frontend | React analytics dashboard | Planned |
| AI Analytics Assistant | LangChain natural-language retail analytics | Planned |
| Testing | Automated backend and integration tests | Planned |
| CI/CD | GitHub Actions | Planned |
| Deployment | Production deployment | Planned |

---

## Planned Next Steps

The next development stage will focus on:

- sales and revenue analytics
- top-selling product metrics
- inventory analytics
- dashboard chart endpoints
- React dashboard integration
- automated testing
- CI/CD
- production deployment

---
## AI Analytics Assistant — Planned

RetailPulse will include a natural-language analytics interface for querying
sales and inventory data.

The assistant will allow users to ask questions such as:

- Which products generated the most revenue this month?
- Which products are currently below their stock threshold?
- What were the best-selling products this week?
- How have sales changed compared with the previous period?
- Which products should be prioritized for restocking?

The assistant will use LangChain to connect the language model with controlled
application tools and retail data while keeping PostgreSQL as the source of
truth.

## Project Management

Development is tracked using Jira with work divided into incremental backend, frontend, testing, and deployment stages.

![Jira Timeline](docs/jira-timeline.png)

---

## Author

**Khizra Hanif**

MSc Computer Science  
University of Victoria
