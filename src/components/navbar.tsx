"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "@/components/layout/theme/theme-toggle";
import { NotificationBell } from "./notifications/notification-bell";
import { useEffect, useState } from "react";
import { WorkoutStreak } from "./workout/workout-streak";
import { HugeiconsIcon } from "@hugeicons/react";
import { Door01Icon, BubbleChatIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useChatUnreadCount } from "@/hooks/use-chat-unread-count";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const { unreadCount } = useChatUnreadCount();

  useEffect(() => {
    const handleScroll = () => {
      // Usar un valor de desplazamiento más pequeño si quieres que el efecto se active antes
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out border-b
      ${
        scrolled
          ? "bg-background/90 backdrop-blur-lg border-border/50"
          : "bg-background/70 backdrop-blur-md border-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="ml-auto flex w-full items-center justify-between space-x-4 ">
          <div className="flex flex-row items-center space-x-2">
            <h1 className="text-xl font-semibold tracking-[-0.04em] transition-colors duration-200 hover:text-primary">
              GymRat+
            </h1>
          </div>
          <div className="flex flex-row items-center space-x-2">
            {session?.user?.id && (
              <div>
                <WorkoutStreak userId={session.user.id} />
              </div>
            )}
            <Link href="/dashboard/chat">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/chats">
              <Button variant="ghost" size="icon" className="relative">
                <HugeiconsIcon icon={BubbleChatIcon} className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    className={cn(
                      "absolute -top-1 -right-1 px-1 py-0 text-[8px] min-w-[18px] min-h-[18px] flex items-center justify-center font-semibold",
                    )}
                  >
                    {unreadCount > 9 ? "+9" : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Mensajes</span>
              </Button>
            </Link>
            <NotificationBell />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full transition-colors duration-200 hover:bg-accent/50"
                >
                  {(session?.user?.image && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user.image} alt="@username" />
                      <AvatarFallback className="text-xs">
                        {session?.user?.name
                          ?.split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )) || (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {session?.user?.name
                          ?.split(" ")
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 border border-border/30 bg-background/80 backdrop-blur-lg rounded-xl overflow-hidden transition-opacity duration-200 ease-in-out"
                align="end"
                forceMount
                sideOffset={10}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>
                  <Settings01Icon className="mr-2 h-4 w-4" />
                  <span>Ajustes</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                >
                  <HugeiconsIcon icon={Door01Icon} className="mr-2 h-4 w-4" />
                  <span className="text-xs">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
