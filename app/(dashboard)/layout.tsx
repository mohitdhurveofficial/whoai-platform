import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAF7F3] overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <main className="flex-1 overflow-y-auto w-full relative pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}