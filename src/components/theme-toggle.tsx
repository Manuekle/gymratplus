"use client";

import { useTheme } from "next-themes";
import { Moon02Icon, Sun02Icon } from "hugeicons-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenuItem
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun02Icon className="mr-2 h-4 w-4" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon02Icon className="mr-2 h-4 w-4" />
          <span>Modo Oscuro</span>
        </>
      )}
    </DropdownMenuItem>
  );
}
