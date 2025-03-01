import { SidebarLayout } from "@/components/sidebar-layout";
// import { Navbar } from "@/components/navbar";
// import DashboardHeader from "@/components/dashboard/dashboard-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <SidebarLayout />
        <SidebarTrigger className="ml-3 mt-3" />
        <main className="flex-1 overflow-auto p-8 pt-16">
          {/* <Navbar /> */}
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
