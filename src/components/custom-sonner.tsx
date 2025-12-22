"use client";

import { Inter } from "next/font/google";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

const CustomSonner = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={`toaster group ${inter.className}`}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-white/80 dark:!bg-black/80 !backdrop-blur-xl !border-zinc-200/50 dark:!border-white/10 !shadow-lg !rounded-xl transition-all duration-300 hover:!shadow-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground",
          cancelButton:
            "group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { CustomSonner };
