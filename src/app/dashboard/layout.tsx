"use client";

import type React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6 ">
          Mi Dashboard
        </h1>
        <Tabs
          defaultValue="dashboard"
          value={pathname.split("/")[2]}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="dashboard" asChild>
              <Link href="/dashboard/">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger value="profile" asChild>
              <Link href="/dashboard/profile">Perfil</Link>
            </TabsTrigger>
            <TabsTrigger value="health" asChild>
              <Link href="/dashboard/health">Salud</Link>
            </TabsTrigger>
            <TabsTrigger value="workout" asChild>
              <Link href="/dashboard/workout">Entrenamiento</Link>
            </TabsTrigger>
            <TabsTrigger value="nutrition" asChild>
              <Link href="/dashboard/nutrition">Nutrición</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
