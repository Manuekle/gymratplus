
/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

declare interface configType {
	static darkMode: any[];

	static content: any[];

	static theme: {
	static container: {
		static center: boolean;

		static padding: string;

		static screens: {		};
	};

	static extend: {
		static colors: {
			static border: string;

			static input: string;

			static ring: string;

			static background: string;

			static foreground: string;

			static primary: {
				static DEFAULT: string;

				static foreground: string;
			};

			static secondary: {
				static DEFAULT: string;

				static foreground: string;
			};

			static destructive: {
				static DEFAULT: string;

				static foreground: string;
			};

			static muted: {
				static DEFAULT: string;

				static foreground: string;
			};

			static accent: {
				static DEFAULT: string;

				static foreground: string;
			};

			static popover: {
				static DEFAULT: string;

				static foreground: string;
			};

			static card: {
				static DEFAULT: string;

				static foreground: string;
			};

			static fitness: {
				static primary: string;

				static secondary: string;

				static accent: string;

				static light: string;

				static dark: string;
			};
		};

		static borderRadius: {
			static lg: string;

			static md: string;

			static sm: string;
		};

		static keyframes: {		};

		static animation: {		};
	};
	};

	static plugins: any[];
}
