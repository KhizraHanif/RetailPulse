"""create inventory movements table

Revision ID: 8fa1311a998f
Revises: cca7e91cbc88
Create Date: 2026-07-15 23:06:15.463977

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8fa1311a998f"
down_revision: Union[str, Sequence[str], None] = "cca7e91cbc88"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "inventory_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("movement_type", sa.String(length=30), nullable=False),
        sa.Column("quantity_change", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"]
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"]
        ),
        sa.PrimaryKeyConstraint("id")
    )

    op.create_index(
        "ix_inventory_movements_id",
        "inventory_movements",
        ["id"],
        unique=False
    )

    op.create_index(
        "ix_inventory_movements_product_id",
        "inventory_movements",
        ["product_id"],
        unique=False
    )

    op.create_index(
        "ix_inventory_movements_user_id",
        "inventory_movements",
        ["user_id"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index(
        "ix_inventory_movements_user_id",
        table_name="inventory_movements"
    )

    op.drop_index(
        "ix_inventory_movements_product_id",
        table_name="inventory_movements"
    )

    op.drop_index(
        "ix_inventory_movements_id",
        table_name="inventory_movements"
    )

    op.drop_table("inventory_movements")