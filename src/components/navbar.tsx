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

import { WorkoutStreak } from "./workout/workout-streak";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  UserIcon,
  HeartAddIcon,
  HandGripIcon,
  Apple01Icon,
  UserGroupIcon,
  UserMultipleIcon,
  BubbleChatIcon,
  Door01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useChatUnreadCount } from "@/hooks/use-chat-unread-count";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { unreadCount } = useChatUnreadCount();
  const isInstructor =
    session?.user?.isInstructor ||
    session?.user?.subscriptionTier === "INSTRUCTOR";

  const navItems = [
    {
      href: "/dashboard",
      icon: Home01Icon,
      label: "Inicio",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/profile",
      icon: UserIcon,
      label: "Perfil",
      active: pathname.startsWith("/dashboard/profile"),
    },
    {
      href: "/dashboard/health",
      icon: HeartAddIcon,
      label: "Salud",
      active: pathname.startsWith("/dashboard/health"),
    },
    {
      href: "/dashboard/workout",
      icon: HandGripIcon,
      label: "Entreno",
      active: pathname.startsWith("/dashboard/workout"),
    },
    {
      href: "/dashboard/nutrition",
      icon: Apple01Icon,
      label: "Comida",
      active: pathname.startsWith("/dashboard/nutrition"),
    },
    {
      href: "/dashboard/chats",
      icon: BubbleChatIcon,
      label: "Chat",
      active: pathname.startsWith("/dashboard/chats"),
      isChat: true,
    },
    {
      href: "/dashboard/friends",
      icon: UserMultipleIcon,
      label: "Amigos",
      active: pathname.startsWith("/dashboard/friends"),
    },
    !isInstructor && {
      href: "/dashboard/instructors",
      icon: UserGroupIcon,
      label: "Instructores",
      active: pathname.startsWith("/dashboard/instructors"),
    },
    isInstructor && {
      href: "/dashboard/students",
      icon: UserGroupIcon,
      label: "Alumnos",
      active: pathname.startsWith("/dashboard/students"),
    },
  ].filter(Boolean) as {
    href: string;
    icon: any;
    label: string;
    active: boolean;
    isChat?: boolean;
  }[];

  const currentPage =
    navItems.find((item) => item.active)?.label || "Dashboard";

  return (
    <div className="w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-background h-14 relative z-50 transition-colors">
      <div className="flex items-center px-4 container mx-auto h-full">
        <div className="flex w-full items-center justify-between h-full">
          {/* Main Navigation (Hamburger Menu - Universal) */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 mt-2 p-2 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden"
              >
                {navItems.map(({ href, icon: Icon, label, active, isChat }) => (
                  <DropdownMenuItem
                    key={href}
                    asChild
                    className="p-0 mb-1 last:mb-0"
                  >
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-4 px-3.5 py-2.5 text-xs transition-all duration-200 rounded-xl",
                        active
                          ? "bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40",
                      )}
                    >
                      <HugeiconsIcon icon={Icon} className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                      {isChat && unreadCount > 0 && (
                        <Badge className="ml-auto px-1.5 py-0 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-none font-medium">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-xs font-medium tracking-[-0.04em] text-zinc-800 dark:text-zinc-200">
              {currentPage}
            </span>
          </div>

          {/* Right Utils (Compact Toolset) */}
          <div className="flex items-center justify-end gap-2 ml-auto">
            {session?.user?.id && <WorkoutStreak userId={session.user.id} />}
            <NotificationBell />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors p-0 overflow-hidden"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="text-xs font-normal uppercase">
                      {session?.user?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-2 p-2 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl overflow-hidden"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal p-2.5">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-medium text-zinc-950 dark:text-white leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-zinc-500 leading-none">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200/20 dark:bg-zinc-800/50 my-1" />
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="m-0.5 p-2 text-destructive focus:text-destructive focus:bg-destructive/5 transition-all duration-200 cursor-pointer rounded-lg flex items-center"
                >
                  <HugeiconsIcon
                    icon={Door01Icon}
                    className="mr-2 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
