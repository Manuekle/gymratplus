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

import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "./notifications/notification-bell";
import { useEffect, useState } from "react";
import { WorkoutStreak } from "./workout/workout-streak";
import { HugeiconsIcon } from "@hugeicons/react";
import { Door01Icon } from "@hugeicons/core-free-icons";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b
      ${
        // **Ajuste para efecto Glass sutil**
        scrolled
          ? "bg-background/90 backdrop-blur-lg shadow-md border-border/50" // Más opaco (90) y más desenfoque (lg) cuando se desplaza
          : "bg-background/70 backdrop-blur-md border-transparent" // Menos opaco (70) y menos desenfoque (md) cuando no se desplaza
      }`}
    >
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="ml-auto flex w-full items-center justify-between space-x-4 ">
          <div className="flex flex-row items-center space-x-2 [&>*]:transition-all [&>*]:duration-200 [&>*:hover]:scale-105 [&>*]:active:scale-95">
            <h1 className="text-xl font-semibold tracking-heading transition-colors hover:text-primary">
              GymRat+
            </h1>
          </div>
          <div className="flex flex-row items-center space-x-2">
            {session?.user?.id && (
              <div className="transition-all duration-200 hover:scale-105">
                <WorkoutStreak userId={session.user.id} />
              </div>
            )}
            <NotificationBell />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full transition-all duration-200 hover:bg-accent/50 hover:scale-105 active:scale-95"
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
                // **Ajuste para efecto Glass en el menú**
                className="w-56 border border-border/30 bg-background/80 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden transition-all duration-200 ease-out"
                align="end"
                forceMount
                sideOffset={10} // Ligeramente más separado para resaltar el efecto
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
