"""add task ownership relationships

Revision ID: 32a5e14bd191
Revises: 835000b344eb
Create Date: 2026-07-15 18:33:23.157256

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32a5e14bd191'
down_revision: Union[str, Sequence[str], None] = '835000b344eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns as nullable so existing rows do not fail.
    op.add_column(
        "inventory_tasks",
        sa.Column("user_id", sa.Integer(), nullable=True)
    )

    op.add_column(
        "inventory_tasks",
        sa.Column("product_id", sa.Integer(), nullable=True)
    )

    # Assign the existing task to user 1 and Wireless Mouse.
    op.execute(
        """
        UPDATE inventory_tasks
        SET user_id = 1,
            product_id = 9
        WHERE user_id IS NULL
           OR product_id IS NULL
        """
    )

    # Make relationships required after the data is backfilled.
    op.alter_column(
        "inventory_tasks",
        "user_id",
        nullable=False
    )

    op.alter_column(
        "inventory_tasks",
        "product_id",
        nullable=False
    )

    op.create_foreign_key(
        "fk_inventory_tasks_user_id",
        "inventory_tasks",
        "users",
        ["user_id"],
        ["id"]
    )

    op.create_foreign_key(
        "fk_inventory_tasks_product_id",
        "inventory_tasks",
        "products",
        ["product_id"],
        ["id"]
    )

    op.create_index(
        "ix_inventory_tasks_user_id",
        "inventory_tasks",
        ["user_id"]
    )

    op.create_index(
        "ix_inventory_tasks_product_id",
        "inventory_tasks",
        ["product_id"]
    )


def downgrade() -> None:
    op.drop_index(
        "ix_inventory_tasks_product_id",
        table_name="inventory_tasks"
    )

    op.drop_index(
        "ix_inventory_tasks_user_id",
        table_name="inventory_tasks"
    )

    op.drop_constraint(
        "fk_inventory_tasks_product_id",
        "inventory_tasks",
        type_="foreignkey"
    )

    op.drop_constraint(
        "fk_inventory_tasks_user_id",
        "inventory_tasks",
        type_="foreignkey"
    )

    op.drop_column("inventory_tasks", "product_id")
    op.drop_column("inventory_tasks", "user_id")
