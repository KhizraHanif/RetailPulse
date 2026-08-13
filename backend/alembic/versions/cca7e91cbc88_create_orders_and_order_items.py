"""create orders and order items

Revision ID: cca7e91cbc88
Revises: f235f763d3c8
Create Date: 2026-07-15 21:59:47.594623

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cca7e91cbc88"
down_revision: Union[str, Sequence[str], None] = "f235f763d3c8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Stores each completed sale recorded by an employee.
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="completed"
        ),
        sa.Column(
            "total_amount",
            sa.Float(),
            nullable=False,
            server_default="0"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"]
        ),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_orders_id",
        "orders",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_orders_created_by_id",
        "orders",
        ["created_by_id"],
        unique=False
    )

    # Each row represents one product line inside an order.
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.Column("line_total", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.id"],
            ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"]
        ),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_order_items_id",
        "order_items",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_order_items_order_id",
        "order_items",
        ["order_id"],
        unique=False
    )

    op.create_index(
        "ix_order_items_product_id",
        "order_items",
        ["product_id"],
        unique=False
    )


def downgrade() -> None:
    # Child table must be removed before orders because of the FK.
    op.drop_index(
        "ix_order_items_product_id",
        table_name="order_items"
    )

    op.drop_index(
        "ix_order_items_order_id",
        table_name="order_items"
    )

    op.drop_index(
        "ix_order_items_id",
        table_name="order_items"
    )

    op.drop_table("order_items")

    op.drop_index(
        "ix_orders_created_by_id",
        table_name="orders"
    )

    op.drop_index(
        "ix_orders_id",
        table_name="orders"
    )

    op.drop_table("orders")