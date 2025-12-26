import { auth } from "@auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    process.env.NODE_ENV !== "development" ||
    !session?.user?.email ||
    session.user.email !== process.env.AUTH_EMAIL
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/5">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
