import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import DashboardBootstrap from "./DashboardBootstrap";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <DashboardBootstrap />
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative">
          <Sidebar />
        </div>

        <main className="ml-[100px] flex-1 overflow-y-auto bg-white px-4 py-1 sm:px-6">
          <div className="mx-auto w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}