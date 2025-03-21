import { Inter } from "next/font/google";
import { Toaster as Sonner } from "sonner";
// At the top of the file, import the Inter font

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

type ToasterProps = React.ComponentProps<typeof Sonner>;

const CustomSonner = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className={`toaster group ${inter.className}`}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { CustomSonner };
