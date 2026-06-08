import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="texture min-h-screen text-[#111111] font-sans selection:bg-[#FF6B00] selection:text-white">
      <Sidebar />
      <main className="md:ml-[260px] min-h-screen pt-16 md:pt-0">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
