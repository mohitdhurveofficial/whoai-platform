"""add policy v2 columns

Revision ID: 82102f6483bb
Revises: f3de07ec3279
Create Date: 2026-05-29 04:21:39.000570

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82102f6483bb'
down_revision: Union[str, Sequence[str], None] = 'f3de07ec3279'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass
def upgrade():

    op.add_column(
        "policies",
        sa.Column("agent", sa.String(), nullable=True)
    )

    op.add_column(
        "policies",
        sa.Column("action", sa.String(), nullable=True)
    )

    op.add_column(
        "policies",
        sa.Column("resource", sa.String(), nullable=True)
    )

    op.add_column(
        "policies",
        sa.Column("condition", sa.String(), nullable=True)
    )

    op.add_column(
        "policies",
        sa.Column("effect", sa.String(), nullable=True)
    )

    op.add_column(
        "policies",
        sa.Column("risk_level", sa.String(), nullable=True)
    )

def downgrade() -> None:
    """Downgrade schema."""
    pass
def downgrade():

    op.drop_column("policies", "risk_level")
    op.drop_column("policies", "effect")
    op.drop_column("policies", "condition")
    op.drop_column("policies", "resource")
    op.drop_column("policies", "action")
    op.drop_column("policies", "agent")