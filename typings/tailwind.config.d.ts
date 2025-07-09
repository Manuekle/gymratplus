/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

declare interface configType {
  darkMode: any[];

  content: any[];

  theme: {
    container: {
      center: boolean;

      padding: string;

      screens: {};
    };

    extend: {
      colors: {
        border: string;

        input: string;

        ring: string;

        background: string;

        foreground: string;

        primary: {
          DEFAULT: string;

          foreground: string;
        };

        secondary: {
          DEFAULT: string;

          foreground: string;
        };

        destructive: {
          DEFAULT: string;

          foreground: string;
        };

        muted: {
          DEFAULT: string;

          foreground: string;
        };

        accent: {
          DEFAULT: string;

          foreground: string;
        };

        popover: {
          DEFAULT: string;

          foreground: string;
        };

        card: {
          DEFAULT: string;

          foreground: string;
        };

        fitness: {
          primary: string;

          secondary: string;

          accent: string;

          light: string;

          dark: string;
        };
      };

      borderRadius: {
        lg: string;

        md: string;

        sm: string;
      };

      keyframes: {};

      animation: {};
    };
  };

  plugins: any[];
}
