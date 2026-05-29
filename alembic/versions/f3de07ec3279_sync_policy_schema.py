"""sync policy schema

Revision ID: f3de07ec3279
Revises: c9237327705c
Create Date: 2026-05-29 04:11:10.006404

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3de07ec3279'
down_revision: Union[str, Sequence[str], None] = 'c9237327705c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
