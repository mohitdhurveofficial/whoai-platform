"use client";

export default function ApprovalActions({
  approvalId,
}: {
  approvalId: number;
}) {
  async function update(status: string) {
    await fetch(
      `https://whoai-api.onrender.com/api/v1/approvals/${approvalId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          approved_by: "mohit",
        }),
      }
    );

    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => update("approved")}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Approve
      </button>

      <button
        onClick={() => update("rejected")}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Reject
      </button>
    </div>
  );
}