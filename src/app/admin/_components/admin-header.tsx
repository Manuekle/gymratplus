import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AdminHeader() {
    return (
        <header className="border-b bg-background sticky top-0 z-10 w-full">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                            Back to App
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <Link href="/admin" className="font-bold text-lg tracking-tight">
                        GymRat+ Admin
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                        Development Env
                    </span>
                </div>
            </div>
        </header>
    );
}
