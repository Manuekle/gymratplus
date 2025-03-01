// import { SidebarLayout } from "@/components/sidebar-layout";
// import { Navbar } from "@/components/navbar";
// import DashboardHeader from "@/components/dashboard/dashboard-header";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* <SidebarProvider> */}
      {/* <SidebarLayout /> */}
      {/* <SidebarTrigger className="ml-3 mt-3" /> */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      {/* </SidebarProvider> */}
    </div>
  );
}
