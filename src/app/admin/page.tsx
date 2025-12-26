import { getAdminStats } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  DumbbellIcon,
  UserGroupIcon,
  Activity01Icon,
  Money03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { OverviewCharts } from "./_components/overview-charts";

export default async function AdminDashboardPage() {
  const {
    usersCount,
    exercisesCount,
    activeSessionsCount,
    totalRevenue,
    analyticsData,
  } = await getAdminStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your application content and users.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Revenue</CardTitle>
            <HugeiconsIcon
              icon={Money03Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Users</CardTitle>
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Exercises</CardTitle>
            <HugeiconsIcon
              icon={DumbbellIcon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercisesCount}</div>
            <p className="text-xs text-muted-foreground">Videos in library</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">
              Active Sessions
            </CardTitle>
            <HugeiconsIcon
              icon={Activity01Icon}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Workouts in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <OverviewCharts data={analyticsData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/exercises">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Exercises (Videos)
              </CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Add, edit, or remove exercises and videos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Users</CardTitle>
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground">
                View registered users and details
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/foods">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Foods</CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Nutrition</div>
              <p className="text-xs text-muted-foreground">
                Manage food database and macros
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/emails">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Emails</CardTitle>
              <HugeiconsIcon
                icon={Activity01Icon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Compose</div>
              <p className="text-xs text-muted-foreground">
                Send notifications to users
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/invoices">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Invoices</CardTitle>
              <HugeiconsIcon
                icon={Money03Icon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Revenue</div>
              <p className="text-xs text-muted-foreground">
                Track payments and subscriptions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/workouts">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Workouts</CardTitle>
              <HugeiconsIcon
                icon={DumbbellIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Templates</div>
              <p className="text-xs text-muted-foreground">
                Manage system workout routines
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/instructors">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Instructors</CardTitle>
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="h-4 w-4 text-muted-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Verify</div>
              <p className="text-xs text-muted-foreground">
                Approve instructor applications
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
