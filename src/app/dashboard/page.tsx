import { auth } from "@auth";
import DashboardClient from "./_components/dashboard-client";
import { AdminPortal } from "./_components/admin-portal";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const session = await auth();

  // Check if user is Admin
  const isAdminEmail = session?.user?.email === process.env.AUTH_EMAIL;
  const showPortal = isAdminEmail && searchParams?.view !== "app";

  if (showPortal) {
    return <AdminPortal />;
  }

  return <DashboardClient />;
}
