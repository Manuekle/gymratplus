import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "OG Banners Preview | GymRat+",
    description: "Vista previa de los banners OpenGraph y Twitter de GymRat+",
    robots: "noindex, nofollow",
};

const banners = [
    {
        title: "OpenGraph Banner",
        description: "Banner principal para Facebook, LinkedIn, WhatsApp y otras redes sociales",
        url: "/banners/opengraph",
        size: "1200×630",
        usage: "OpenGraph (Facebook, LinkedIn, WhatsApp)",
    },
    {
        title: "Twitter Banner",
        description: "Banner optimizado para Twitter con Rocco, el entrenador IA",
        url: "/banners/twitter",
        size: "1200×630",
        usage: "Twitter Cards",
    },
];

export default function BannersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <Link
                        href="/"
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
                    >
                        ← Volver al inicio
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                        OG Banners Preview
                    </h1>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Vista previa de los banners OpenGraph y Twitter de GymRat+ con diseño liquid glass
                    </p>
                </div>

                {/* Banners Grid */}
                <div className="grid gap-8">
                    {banners.map((banner) => (
                        <div
                            key={banner.url}
                            className="space-y-4 p-6 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl"
                        >
                            {/* Banner Info */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">{banner.title}</h2>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                        {banner.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono">
                                            {banner.size}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
                                            {banner.usage}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Image */}
                            <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
                                <Image
                                    src={banner.url}
                                    alt={banner.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <a
                                    href={banner.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs px-4 py-2 rounded-lg backdrop-blur-xl bg-zinc-900/90 dark:bg-zinc-100/90 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
                                >
                                    Abrir en nueva pestaña
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}${banner.url}`
                                        );
                                    }}
                                    className="text-xs px-4 py-2 rounded-lg backdrop-blur-xl bg-white/60 dark:bg-black/60 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-white/80 dark:hover:bg-black/80 transition-colors font-medium"
                                >
                                    Copiar URL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Usage Instructions */}
                <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl space-y-6">
                    <h3 className="text-2xl font-bold tracking-tight">Cómo usar estos banners</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                OpenGraph (Facebook, LinkedIn, WhatsApp)
                            </h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                Agrega en el metadata de tu página:
                            </p>
                            <pre className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-x-auto text-xs font-mono border border-zinc-200 dark:border-zinc-800">
                                {`<meta property="og:image" content="https://gymratplus.com/banners/opengraph" />`}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                Twitter
                            </h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                Agrega en el metadata de tu página:
                            </p>
                            <pre className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-x-auto text-xs font-mono border border-zinc-200 dark:border-zinc-800">
                                {`<meta name="twitter:image" content="https://gymratplus.com/banners/twitter" />`}
                            </pre>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            💡 <strong>Tip:</strong> Estos banners usan el diseño "liquid glass" de la página principal
                            con gradientes sutiles, blur effects y el estilo visual de GymRat+.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
