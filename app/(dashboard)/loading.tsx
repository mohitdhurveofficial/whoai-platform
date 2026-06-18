export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-52 rounded-lg bg-[#EEE8E2]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-[#EEE8E2] bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-[#EEE8E2] bg-white" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-xl border border-[#EEE8E2] bg-white" />
        <div className="h-56 rounded-xl border border-[#EEE8E2] bg-white" />
      </div>
    </div>
  );
}
