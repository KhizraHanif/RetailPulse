"""remove temp sku default

Revision ID: 6b605bb8c6d7
Revises: 344d5181e10e
Create Date: 2026-06-14 06:46:27.766716

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b605bb8c6d7'
down_revision: Union[str, Sequence[str], None] = '344d5181e10e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "products",
        "sku",
        server_default=None
    )


def downgrade() -> None:
    op.alter_column(
        "products",
        "sku",
        server_default="TEMP-SKU"
    )
