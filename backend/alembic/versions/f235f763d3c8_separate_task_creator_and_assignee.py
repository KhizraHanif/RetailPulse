"""separate task creator and assignee

Revision ID: f235f763d3c8
Revises: 32a5e14bd191
Create Date: 2026-07-15 18:55:50.426727

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f235f763d3c8"
down_revision: Union[str, Sequence[str], None] = "32a5e14bd191"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new relationship columns as nullable first.
    op.add_column(
        "inventory_tasks",
        sa.Column("created_by_id", sa.Integer(), nullable=True)
    )

    op.add_column(
        "inventory_tasks",
        sa.Column("assigned_to_id", sa.Integer(), nullable=True)
    )

    # Preserve the previous task owner when upgrading an existing database.
    op.execute(
        """
        UPDATE inventory_tasks
        SET created_by_id = user_id,
            assigned_to_id = user_id
        WHERE created_by_id IS NULL
           OR assigned_to_id IS NULL
        """
    )

    # The new relationships are required after existing rows are backfilled.
    op.alter_column(
        "inventory_tasks",
        "created_by_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    op.alter_column(
        "inventory_tasks",
        "assigned_to_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    op.create_index(
        "ix_inventory_tasks_created_by_id",
        "inventory_tasks",
        ["created_by_id"],
        unique=False
    )

    op.create_index(
        "ix_inventory_tasks_assigned_to_id",
        "inventory_tasks",
        ["assigned_to_id"],
        unique=False
    )

    op.create_foreign_key(
        "fk_inventory_tasks_created_by_id",
        "inventory_tasks",
        "users",
        ["created_by_id"],
        ["id"]
    )

    op.create_foreign_key(
        "fk_inventory_tasks_assigned_to_id",
        "inventory_tasks",
        "users",
        ["assigned_to_id"],
        ["id"]
    )

    # Remove the old single-owner relationship after the data is preserved.
    op.drop_constraint(
        "fk_inventory_tasks_user_id",
        "inventory_tasks",
        type_="foreignkey"
    )

    op.drop_index(
        "ix_inventory_tasks_user_id",
        table_name="inventory_tasks"
    )

    op.drop_column(
        "inventory_tasks",
        "user_id"
    )


def downgrade() -> None:
    # Restore the previous single-owner column.
    op.add_column(
        "inventory_tasks",
        sa.Column("user_id", sa.Integer(), nullable=True)
    )

    # Use the task creator as the previous owner.
    op.execute(
        """
        UPDATE inventory_tasks
        SET user_id = created_by_id
        WHERE user_id IS NULL
        """
    )

    op.alter_column(
        "inventory_tasks",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    op.create_index(
        "ix_inventory_tasks_user_id",
        "inventory_tasks",
        ["user_id"],
        unique=False
    )

    op.create_foreign_key(
        "fk_inventory_tasks_user_id",
        "inventory_tasks",
        "users",
        ["user_id"],
        ["id"]
    )

    op.drop_constraint(
        "fk_inventory_tasks_assigned_to_id",
        "inventory_tasks",
        type_="foreignkey"
    )

    op.drop_constraint(
        "fk_inventory_tasks_created_by_id",
        "inventory_tasks",
        type_="foreignkey"
    )

    op.drop_index(
        "ix_inventory_tasks_assigned_to_id",
        table_name="inventory_tasks"
    )

    op.drop_index(
        "ix_inventory_tasks_created_by_id",
        table_name="inventory_tasks"
    )

    op.drop_column(
        "inventory_tasks",
        "assigned_to_id"
    )

    op.drop_column(
        "inventory_tasks",
        "created_by_id"
    )