export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10" role="status" aria-label="Loading">
          <span className="absolute inset-0 rounded-full border-2 border-[#FFE3CF]" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#FF6B00]" />
        </div>
        <span className="text-[13px] font-medium tracking-tight text-[#8792A2]">Loading…</span>
      </div>
    </div>
  );
}
