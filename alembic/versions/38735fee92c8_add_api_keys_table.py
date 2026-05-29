"""add api keys table

Revision ID: 38735fee92c8
Revises: 82102f6483bb
Create Date: 2026-05-29 13:41:38.477695

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38735fee92c8'
down_revision: Union[str, Sequence[str], None] = '82102f6483bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "api_keys",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("api_key", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_api_keys_api_key",
        "api_keys",
        ["api_key"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_api_keys_api_key",
        table_name="api_keys",
    )

    op.drop_table("api_keys")

def upgrade() -> None:
    op.create_table(
        "api_keys",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("api_key", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_api_keys_api_key",
        "api_keys",
        ["api_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_api_keys_api_key",
        table_name="api_keys",
    )

    op.drop_table("api_keys")