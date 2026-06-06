import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Sidebar />

      <main className="md:ml-[260px] min-h-screen">
        {children}
      </main>
    </div>
  );
}