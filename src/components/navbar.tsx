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
import {
  Door01Icon,
  // Notification03Icon,
  // Settings01Icon,
} from "hugeicons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "./ui/badge";
import { NotificationBell } from "./notifications/notification-bell";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="ml-auto flex w-full items-center justify-between space-x-4 ">
          <div className="flex flex-row items-center space-x-2">
            <h1 className="text-2xl font-bold">GymRat+</h1>
            <Badge variant="outline">Beta</Badge>
          </div>
          <div className="flex flex-row items-center space-x-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
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
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
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
                <ThemeToggle />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  <Door01Icon className="mr-2 h-4 w-4" />
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
