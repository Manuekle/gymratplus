"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import {
    DumbbellIcon,
    UserGroupIcon,
    Activity01Icon,
    ArrowLeft01Icon,
    DashboardSquare01Icon,
    OrganicFoodIcon,
    Mail01Icon,
    Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const sidebarItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: DashboardSquare01Icon,
    },
    {
        title: "Usuarios",
        href: "/admin/users",
        icon: UserGroupIcon,
    },
    {
        title: "Ejercicios",
        href: "/admin/exercises",
        icon: DumbbellIcon,
    },
    {
        title: "Rutinas",
        href: "/admin/workouts",
        icon: Activity01Icon,
    },
    {
        title: "Alimentos",
        href: "/admin/foods",
        icon: OrganicFoodIcon,
    },
    {
        title: "Instructores",
        href: "/admin/instructors",
        icon: UserGroupIcon, // Reusing UserGroup for now, specific icon if available
    },
    {
        title: "Correos",
        href: "/admin/emails",
        icon: Mail01Icon,
    },
    {
        title: "Facturas",
        href: "/admin/invoices",
        icon: Invoice01Icon,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex flex-col w-64 border-r bg-background/50 backdrop-blur-xl h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    GymRat+ Admin
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Panel de Control</p>
            </div>

            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground mb-4 px-2">
                    Menu Principal
                </div>
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1",
                                    isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                                    !isActive && "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <HugeiconsIcon icon={item.icon} className="h-4 w-4" />
                                {item.title}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t bg-background/20">
                <Link href="/dashboard">
                    <Button variant="outline" className="w-full gap-2 border-dashed">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                        Volver a la App
                    </Button>
                </Link>
            </div>
        </div>
    );
}
