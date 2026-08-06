"""
Plan request-quota enforcement.

The organization's plan (plans.json) grants a monthly request allowance. This
module reserves against that allowance with the same atomic conditional-UPDATE
pattern the budget engine uses: the guard lives in the WHERE clause, so N
concurrent requests can't all read the same pre-increment counter and blow past
the limit together.

Deliberately NOT a kill switch. A budget breach means an agent is burning real
money and pausing it is a safety action; exhausting a plan quota just means the
customer has outgrown their tier. Pausing there would require a manual resume to
undo a billing event, so quota rejections are stateless — the customer upgrades,
or waits for the counter to reset on the 1st.
"""
import logging
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("whoai.entitlements.quota")

# Reason code returned to the caller and written to the activity log.
PLAN_REQUEST_QUOTA_EXCEEDED = "PLAN_REQUEST_QUOTA_EXCEEDED"


async def reserve_request_quota(
    db: AsyncSession,
    org_id: str,
    quota: Optional[int],
) -> bool:
    """Consume one request from the org's monthly allowance.

    Returns False only when a finite quota is already exhausted. Unlimited plans
    (`quota is None`) still increment the counter — the number is what the
    billing UI reports and what usage-based Enterprise contracts are trued up
    against, so it has to be accurate even where nothing blocks on it.
    """
    if quota is None:
        await db.execute(
            text(
                '''
                UPDATE "Organization"
                SET "currentMonthlyRequests" = "currentMonthlyRequests" + 1
                WHERE id = :id
                '''
            ),
            {"id": org_id},
        )
        return True

    result = await db.execute(
        text(
            '''
            UPDATE "Organization"
            SET "currentMonthlyRequests" = "currentMonthlyRequests" + 1
            WHERE id = :id
              AND "currentMonthlyRequests" + 1 <= :quota
            '''
        ),
        {"id": org_id, "quota": quota},
    )
    return result.rowcount > 0


async def release_request_quota(db: AsyncSession, org_id: str) -> None:
    """Hand a reserved request back after the request failed to complete.

    Mirrors release_*_budget: a customer should not burn plan quota on a request
    that never reached a provider. Clamped at zero so a double release can't
    hand back allowance that was never consumed.
    """
    await db.execute(
        text(
            '''
            UPDATE "Organization"
            SET "currentMonthlyRequests" = CASE
                WHEN "currentMonthlyRequests" - 1 < 0 THEN 0
                ELSE "currentMonthlyRequests" - 1 END
            WHERE id = :id
            '''
        ),
        {"id": org_id},
    )
