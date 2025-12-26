"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Settings01Icon, Activity01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AdminPortal() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          Welcome Back, Admin
        </h1>
        <p className="text-muted-foreground text-lg">
          Choose your destination to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <Link href="/admin" className="group">
          <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HugeiconsIcon
                  icon={Settings01Icon}
                  className="h-6 w-6 text-primary"
                />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>
                Manage users, content, finances, and system settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-medium text-primary group-hover:underline">
                Enter Admin Panel &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard?view=app" className="group">
          <Card className="h-full hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HugeiconsIcon
                  icon={Activity01Icon}
                  className="h-6 w-6 text-emerald-600"
                />
              </div>
              <CardTitle className="text-2xl">App Dashboard</CardTitle>
              <CardDescription>
                Track your personal workouts, nutrition, and goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-medium text-emerald-600 group-hover:underline">
                Enter Dashboard &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="text-xs text-muted-foreground">
        Development Environment Only
      </div>
    </div>
  );
}
