import { auth } from "@auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session?.user?.email ||
    session.user.email !== process.env.AUTH_EMAIL
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-foreground">
      {/* Sidebar - Desktop */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="container mx-auto px-6 py-8 md:px-8 md:py-10 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
