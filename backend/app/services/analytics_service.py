from datetime import (
    datetime,
    timedelta,
)

from sqlalchemy import (
    Date,
    cast,
    extract,
    func,
    select,
)

from sqlalchemy.orm import Session

from app.models.order import (
    Order,
    OrderItem,
)

from app.models.product import Product


# ---------------------------------------------------------
# Percentage comparison
# ---------------------------------------------------------

def percentage_change(
    current: float,
    previous: float,
) -> float | None:

    # There is no meaningful percentage
    # comparison when the previous value is zero.
    if previous == 0:

        if current == 0:
            return 0.0

        return None

    return round(
        (
            (current - previous)
            / previous
        )
        * 100,
        1,
    )


# ---------------------------------------------------------
# Period metrics
# ---------------------------------------------------------

def get_period_metrics(
    db: Session,
    start_date: datetime,
    end_date: datetime,
):

    revenue = db.scalar(
        select(
            func.sum(
                Order.total_amount
            )
        )
        .where(
            Order.created_at >= start_date,
            Order.created_at < end_date,
            Order.status == "completed",
        )
    ) or 0


    orders = db.scalar(
        select(
            func.count(
                Order.id
            )
        )
        .where(
            Order.created_at >= start_date,
            Order.created_at < end_date,
            Order.status == "completed",
        )
    ) or 0


    units_sold = db.scalar(
        select(
            func.sum(
                OrderItem.quantity
            )
        )
        .join(
            Order,
            Order.id ==
            OrderItem.order_id,
        )
        .where(
            Order.created_at >= start_date,
            Order.created_at < end_date,
            Order.status == "completed",
        )
    ) or 0


    average_order_value = (
        float(revenue) / orders
        if orders
        else 0
    )


    return {
        "revenue":
            float(revenue),

        "orders":
            int(orders),

        "units_sold":
            int(units_sold),

        "average_order_value":
            average_order_value,
    }


# ---------------------------------------------------------
# KPI analytics
# ---------------------------------------------------------

def get_analytics_kpis(
    db: Session,
    days: int,
):

    now = datetime.now()

    current_start = (
        now
        - timedelta(days=days)
    )

    previous_start = (
        current_start
        - timedelta(days=days)
    )


    current = get_period_metrics(
        db=db,
        start_date=current_start,
        end_date=now,
    )


    previous = get_period_metrics(
        db=db,
        start_date=previous_start,
        end_date=current_start,
    )


    return {
        "revenue":
            round(
                current["revenue"],
                2,
            ),

        "revenue_change":
            percentage_change(
                current["revenue"],
                previous["revenue"],
            ),

        "orders":
            current["orders"],

        "orders_change":
            percentage_change(
                current["orders"],
                previous["orders"],
            ),

        "average_order_value":
            round(
                current[
                    "average_order_value"
                ],
                2,
            ),

        "average_order_value_change":
            percentage_change(
                current[
                    "average_order_value"
                ],
                previous[
                    "average_order_value"
                ],
            ),

        "units_sold":
            current["units_sold"],

        "units_sold_change":
            percentage_change(
                current["units_sold"],
                previous["units_sold"],
            ),
    }


# ---------------------------------------------------------
# Revenue trend
# ---------------------------------------------------------

def get_analytics_revenue_trend(
    db: Session,
    days: int,
):

    start_date = (
        datetime.now()
        - timedelta(days=days)
    )


    rows = db.execute(
        select(
            cast(
                Order.created_at,
                Date,
            ).label(
                "date"
            ),

            func.count(
                Order.id
            ).label(
                "orders"
            ),

            func.sum(
                Order.total_amount
            ).label(
                "revenue"
            ),
        )
        .where(
            Order.created_at >= start_date,
            Order.status == "completed",
        )
        .group_by(
            cast(
                Order.created_at,
                Date,
            )
        )
        .order_by(
            cast(
                Order.created_at,
                Date,
            )
        )
    ).all()


    return [
        {
            "date":
                str(
                    row.date
                ),

            "orders":
                int(
                    row.orders
                ),

            "revenue":
                round(
                    float(
                        row.revenue
                    ),
                    2,
                ),
        }

        for row in rows
    ]


# ---------------------------------------------------------
# Sales by category
# ---------------------------------------------------------

def get_category_sales(
    db: Session,
    days: int,
):

    start_date = (
        datetime.now()
        - timedelta(days=days)
    )


    rows = db.execute(
        select(
            Product.category,

            func.sum(
                OrderItem.quantity
            ).label(
                "units_sold"
            ),

            func.sum(
                OrderItem.line_total
            ).label(
                "revenue"
            ),
        )
        .join(
            OrderItem,
            OrderItem.product_id ==
            Product.id,
        )
        .join(
            Order,
            Order.id ==
            OrderItem.order_id,
        )
        .where(
            Order.created_at >= start_date,
            Order.status == "completed",
        )
        .group_by(
            Product.category
        )
        .order_by(
            func.sum(
                OrderItem.line_total
            ).desc()
        )
    ).all()


    return [
        {
            "category":
                row.category,

            "units_sold":
                int(
                    row.units_sold
                ),

            "revenue":
                round(
                    float(
                        row.revenue
                    ),
                    2,
                ),
        }

        for row in rows
    ]


# ---------------------------------------------------------
# Product performance
# ---------------------------------------------------------

def get_analytics_top_products(
    db: Session,
    days: int,
    limit: int = 5,
):

    start_date = (
        datetime.now()
        - timedelta(days=days)
    )


    rows = db.execute(
        select(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
            Product.low_stock_threshold,

            func.sum(
                OrderItem.quantity
            ).label(
                "units_sold"
            ),

            func.sum(
                OrderItem.line_total
            ).label(
                "revenue"
            ),
        )
        .join(
            OrderItem,
            OrderItem.product_id ==
            Product.id,
        )
        .join(
            Order,
            Order.id ==
            OrderItem.order_id,
        )
        .where(
            Order.created_at >= start_date,
            Order.status == "completed",
        )
        .group_by(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity,
            Product.low_stock_threshold,
        )
        .order_by(
            func.sum(
                OrderItem.line_total
            ).desc()
        )
        .limit(
            limit
        )
    ).all()


    return [
        {
            "product_id":
                row.id,

            "name":
                row.name,

            "sku":
                row.sku,

            "units_sold":
                int(
                    row.units_sold
                ),

            "revenue":
                round(
                    float(
                        row.revenue
                    ),
                    2,
                ),

            "quantity":
                row.quantity,

            "low_stock_threshold":
                row.low_stock_threshold,
        }

        for row in rows
    ]


# ---------------------------------------------------------
# Sales by weekday
# ---------------------------------------------------------

def get_weekday_sales(
    db: Session,
    days: int,
):

    start_date = (
        datetime.now()
        - timedelta(days=days)
    )


    rows = db.execute(
        select(
            extract(
                "dow",
                Order.created_at,
            ).label(
                "weekday"
            ),

            func.count(
                Order.id
            ).label(
                "orders"
            ),

            func.sum(
                Order.total_amount
            ).label(
                "revenue"
            ),
        )
        .where(
            Order.created_at >= start_date,
            Order.status == "completed",
        )
        .group_by(
            extract(
                "dow",
                Order.created_at,
            )
        )
    ).all()


    weekday_names = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    }


    sales_by_day = {
        day_number: {
            "weekday":
                weekday_names[
                    day_number
                ],

            "orders":
                0,

            "revenue":
                0.0,
        }

        for day_number
        in range(7)
    }


    for row in rows:

        day_number = int(
            row.weekday
        )

        sales_by_day[
            day_number
        ] = {
            "weekday":
                weekday_names[
                    day_number
                ],

            "orders":
                int(
                    row.orders
                ),

            "revenue":
                round(
                    float(
                        row.revenue
                    ),
                    2,
                ),
        }


    # PostgreSQL uses:
    # 0 = Sunday
    # 1 = Monday
    # ...
    # 6 = Saturday
    #
    # Display Monday → Sunday.

    display_order = [
        1,
        2,
        3,
        4,
        5,
        6,
        0,
    ]


    return [
        sales_by_day[
            day_number
        ]

        for day_number
        in display_order
    ]


# ---------------------------------------------------------
# Business signals
# ---------------------------------------------------------

def build_signals(
    kpis: dict,
    category_sales: list,
    top_products: list,
    weekday_sales: list,
):

    signals = []


    # -----------------------------------------------------
    # Revenue signal
    # -----------------------------------------------------

    revenue_change = (
        kpis[
            "revenue_change"
        ]
    )


    if revenue_change is None:

        signals.append({
            "type":
                "info",

            "title":
                "New sales activity",

            "message":
                (
                    "There is no sales data "
                    "from the previous period "
                    "for comparison."
                ),
        })


    elif revenue_change > 0:

        signals.append({
            "type":
                "positive",

            "title":
                "Revenue increased",

            "message":
                (
                    f"Revenue is up "
                    f"{revenue_change}% "
                    f"compared with the "
                    f"previous period."
                ),
        })


    elif revenue_change < 0:

        signals.append({
            "type":
                "negative",

            "title":
                "Revenue declined",

            "message":
                (
                    f"Revenue is down "
                    f"{abs(revenue_change)}% "
                    f"compared with the "
                    f"previous period."
                ),
        })


    else:

        signals.append({
            "type":
                "info",

            "title":
                "Revenue unchanged",

            "message":
                (
                    "Revenue is unchanged "
                    "compared with the "
                    "previous period."
                ),
        })


    # -----------------------------------------------------
    # Leading category
    # -----------------------------------------------------

    if category_sales:

        top_category = (
            category_sales[0]
        )


        signals.append({
            "type":
                "info",

            "title":
                "Leading category",

            "message":
                (
                    f"{top_category['category']} "
                    f"generated the most "
                    f"revenue at "
                    f"${top_category['revenue']:.2f}."
                ),
        })


    # -----------------------------------------------------
    # Top product + restock risk
    # -----------------------------------------------------

    if top_products:

        best_product = (
            top_products[0]
        )


        signals.append({
            "type":
                "info",

            "title":
                "Top product",

            "message":
                (
                    f"{best_product['name']} "
                    f"generated "
                    f"${best_product['revenue']:.2f} "
                    f"from "
                    f"{best_product['units_sold']} "
                    f"units sold."
                ),
        })


        low_stock_seller = next(
            (
                product

                for product
                in top_products

                if (
                    product[
                        "quantity"
                    ]
                    <=
                    product[
                        "low_stock_threshold"
                    ]
                )
            ),

            None,
        )


        if low_stock_seller:

            signals.append({
                "type":
                    "warning",

                "title":
                    "Restock priority",

                "message":
                    (
                        f"{low_stock_seller['name']} "
                        f"is a top-selling product "
                        f"but only has "
                        f"{low_stock_seller['quantity']} "
                        f"units remaining."
                    ),
            })


    # -----------------------------------------------------
    # Strongest sales day
    # -----------------------------------------------------

    if weekday_sales:

        best_day = max(
            weekday_sales,

            key=lambda day:
                day["revenue"],
        )


        if (
            best_day[
                "revenue"
            ]
            > 0
        ):

            signals.append({
                "type":
                    "info",

                "title":
                    "Strongest sales day",

                "message":
                    (
                        f"{best_day['weekday']} "
                        f"generated the highest "
                        f"weekday revenue at "
                        f"${best_day['revenue']:.2f}."
                    ),
            })


    return signals


# ---------------------------------------------------------
# Complete analytics response
# ---------------------------------------------------------

def get_analytics_overview(
    db: Session,
    days: int,
):

    kpis = get_analytics_kpis(
        db=db,
        days=days,
    )


    revenue_trend = (
        get_analytics_revenue_trend(
            db=db,
            days=days,
        )
    )


    category_sales = (
        get_category_sales(
            db=db,
            days=days,
        )
    )


    top_products = (
        get_analytics_top_products(
            db=db,
            days=days,
            limit=5,
        )
    )


    weekday_sales = (
        get_weekday_sales(
            db=db,
            days=days,
        )
    )


    signals = build_signals(
        kpis=kpis,
        category_sales=category_sales,
        top_products=top_products,
        weekday_sales=weekday_sales,
    )


    return {
        "period": {
            "days":
                days,
        },

        "kpis":
            kpis,

        "revenue_trend":
            revenue_trend,

        "category_sales":
            category_sales,

        "top_products":
            top_products,

        "weekday_sales":
            weekday_sales,

        "signals":
            signals,
    }