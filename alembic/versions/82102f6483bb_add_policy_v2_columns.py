"""add policy v2 columns"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "82102f6483bb"
down_revision: Union[str, Sequence[str], None] = "f3de07ec3279"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass