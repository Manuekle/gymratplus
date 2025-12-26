"use client";
import { useTheme as useNextTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons";

export const useTheme = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  return { theme, setTheme, resolvedTheme, systemTheme };
};

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Evita el parpadeo al cargar el tema
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="Toggle theme"
      >
        <div className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isLight = theme === "light";
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9"
      aria-label="Toggle theme"
    >
      <HugeiconsIcon
        icon={Sun02Icon}
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-zinc-900 dark:text-zinc-100 ${
          isLight
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        }`}
        aria-hidden={!isLight}
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-zinc-900 dark:text-zinc-100 ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        }`}
        aria-hidden={!isDark}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
