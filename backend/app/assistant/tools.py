from dataclasses import dataclass
from datetime import datetime

from langchain.tools import (
    ToolRuntime,
    tool,
)

from sqlalchemy import (
    func,
    select,
)
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.user import User

from app.services.analytics_service import (
    get_analytics_overview,
    get_analytics_top_products,
)

from app.services.dashboard_service import (
    get_low_stock_products,
)

from app.services.task_service import (
    get_all_tasks,
)


@dataclass
class AssistantContext:
    db: Session
    current_user: User


# ---------------------------------------------------------
# Business performance
# ---------------------------------------------------------

@tool
def get_business_summary(
    days: int,
    runtime: ToolRuntime[
        AssistantContext
    ],
) -> dict:
    """
    Get RetailPulse sales and business performance
    for a requested number of recent days.

    The number of days is flexible and is NOT
    limited to 7, 30, 90, or 365.

    Examples:
    - 14 days
    - 45 days
    - 180 days
    - 730 days

    Use get_full_business_history instead when
    the user explicitly asks for all-time data.
    """

    return get_analytics_overview(
        db=runtime.context.db,
        days=days,
    )


# ---------------------------------------------------------
# Restock decision support
# ---------------------------------------------------------

@tool
def get_restock_priorities(
    days: int,
    runtime: ToolRuntime[
        AssistantContext
    ],
) -> list[dict]:
    """
    Find products that should be considered for
    restocking using current inventory and sales
    performance over a requested number of days.

    Current inventory status is combined with
    recent product sales.

    The sales period can be any appropriate number
    of days requested by the user.

    Important inventory meanings:

    - out_of_stock:
      current quantity is exactly 0

    - low_stock:
      quantity is greater than 0 but is equal to
      or below the low-stock threshold

    - healthy:
      quantity is above the low-stock threshold

    units_below_threshold means how many units the
    product is below its configured threshold.
    It does NOT represent units remaining.
    """

    db = runtime.context.db


    # Current low-stock inventory
    low_stock_products = (
        get_low_stock_products(
            db=db,
            limit=50,
        )
    )


    # Sales performance for requested period
    product_sales = (
        get_analytics_top_products(
            db=db,
            days=days,
            limit=50,
        )
    )


    # Make sales data easy to match
    # with inventory data by product ID.
    sales_by_product = {
        product["product_id"]:
            product

        for product
        in product_sales
    }


    priorities = []


    for product in low_stock_products:

        sales = sales_by_product.get(
            product["product_id"]
        )


        quantity = (
            product["quantity"]
        )

        threshold = (
            product[
                "low_stock_threshold"
            ]
        )


        # Explicit status so the model does
        # not have to infer inventory meaning.
        if quantity == 0:
            stock_status = (
                "out_of_stock"
            )

        elif quantity <= threshold:
            stock_status = (
                "low_stock"
            )

        else:
            stock_status = (
                "healthy"
            )


        priorities.append({
            "product_id":
                product["product_id"],

            "name":
                product["name"],

            "sku":
                product["sku"],

            "quantity":
                quantity,

            "low_stock_threshold":
                threshold,

            "stock_status":
                stock_status,

            "units_below_threshold":
                max(
                    threshold
                    - quantity,
                    0,
                ),

            "units_sold":
                (
                    sales["units_sold"]
                    if sales
                    else 0
                ),

            "revenue":
                (
                    sales["revenue"]
                    if sales
                    else 0.0
                ),
        })


    # Prioritize products with actual recent
    # sales activity first.
    #
    # If sales are equal, products further
    # below their threshold come first.
    priorities.sort(
        key=lambda item: (
            item["units_sold"],
            item[
                "units_below_threshold"
            ],
        ),
        reverse=True,
    )


    return priorities


# ---------------------------------------------------------
# Operational / warehouse summary
# ---------------------------------------------------------

@tool
def get_operations_summary(
    runtime: ToolRuntime[
        AssistantContext
    ],
) -> dict:
    """
    Get the current warehouse task and
    operational workload summary.

    Use this for questions about:
    - pending tasks
    - in-progress tasks
    - completed tasks
    - current warehouse workload

    This represents current operational state,
    so no historical sales period is required.
    """

    tasks = get_all_tasks(
        db=runtime.context.db,
        current_user=(
            runtime.context.current_user
        ),
    )


    pending = 0
    in_progress = 0
    completed = 0


    for task in tasks:

        if task.status == "pending":
            pending += 1

        elif (
            task.status
            == "in_progress"
        ):
            in_progress += 1

        elif (
            task.status
            == "completed"
        ):
            completed += 1


    return {
        "total_tasks":
            len(tasks),

        "pending":
            pending,

        "in_progress":
            in_progress,

        "completed":
            completed,
    }


# ---------------------------------------------------------
# Full business history
# ---------------------------------------------------------

@tool
def get_full_business_history(
    runtime: ToolRuntime[
        AssistantContext
    ],
) -> dict:
    """
    Get business analytics across all available
    completed-order history in RetailPulse.

    Use this when the user asks about:

    - entire history
    - all-time performance
    - lifetime sales
    - all recorded sales data

    Do not use an arbitrary number of days when
    the user explicitly asks for all-time data.
    """

    db = runtime.context.db


    earliest_order = db.scalar(
        select(
            func.min(
                Order.created_at
            )
        )
        .where(
            Order.status
            == "completed"
        )
    )


    if earliest_order is None:

        return {
            "message":
                (
                    "There are no completed "
                    "orders in RetailPulse."
                )
        }


    # Calculate the number of days between
    # the first completed order and today.
    days = max(
        (
            datetime.now()
            - earliest_order
        ).days + 1,
        1,
    )


    overview = (
        get_analytics_overview(
            db=db,
            days=days,
        )
    )


    # Explicitly tell the model that this
    # response represents all available history.
    overview[
        "analysis_scope"
    ] = {
        "type":
            "all_time",

        "from":
            earliest_order
            .date()
            .isoformat(),

        "to":
            datetime.now()
            .date()
            .isoformat(),
    }


    return overview