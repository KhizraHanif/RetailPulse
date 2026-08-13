"""initial database schema

Revision ID: 9220dde7a739
Revises:
Create Date: 2026-06-14 04:53:21.650347

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9220dde7a739"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Base user table used by authentication.
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email")
    )

    op.create_index(
        "ix_users_id",
        "users",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True
    )

    # Initial product table.
    # Later migrations add SKU, category, thresholds and audit timestamps.
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_products_id",
        "products",
        ["id"],
        unique=False
    )

    # Initial task table.
    # Later migrations add ownership and product relationships.
    op.create_table(
        "inventory_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
            server_default="pending"
        ),
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=False,
            server_default="general"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=True
        ),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_inventory_tasks_id",
        "inventory_tasks",
        ["id"],
        unique=False
    )


def downgrade() -> None:
    # Drop child/business tables before their parent tables.
    op.drop_index(
        "ix_inventory_tasks_id",
        table_name="inventory_tasks"
    )
    op.drop_table("inventory_tasks")

    op.drop_index(
        "ix_products_id",
        table_name="products"
    )
    op.drop_table("products")

    op.drop_index(
        "ix_users_email",
        table_name="users"
    )

    op.drop_index(
        "ix_users_id",
        table_name="users"
    )
    op.drop_table("users")