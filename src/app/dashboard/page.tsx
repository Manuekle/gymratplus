import { auth } from "@auth";
import DashboardClient from "./_components/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  // Check if user is Admin
  const isAdminEmail = session?.user?.email === process.env.AUTH_EMAIL;

  return (
    <>
      <DashboardClient />
    </>
  );
}
