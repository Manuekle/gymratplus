"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

const banners = [
    {
        title: "Banner Principal",
        description: "Imagen optimizada para compartir en redes sociales como Facebook, LinkedIn y WhatsApp.",
        url: "/banners/opengraph",
        size: "1200×630",
        usage: "Social Media",
    },
    {
        title: "Twitter Card",
        description: "Diseño específico para Twitter destacando al asistente IA.",
        url: "/banners/twitter",
        size: "1200×630",
        usage: "Twitter",
    },
    {
        title: "Características",
        description: "Grid visual mostrando las funcionalidades principales de la plataforma.",
        url: "/banners/features",
        size: "1200×630",
        usage: "Marketing",
    },
];

export default function BannersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-zinc-200/40 to-zinc-300/20 dark:from-zinc-800/40 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-tl from-zinc-300/30 to-zinc-200/20 dark:from-zinc-700/30 dark:to-zinc-800/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-gradient-to-tr from-zinc-200/30 to-zinc-300/20 dark:from-zinc-800/30 dark:to-zinc-700/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Glass Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-12"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver al inicio
                    </Link>

                    {/* Content */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-[-0.04em]">
                                Banners & Assets
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-2xl">
                                Colección de imágenes generadas dinámicamente para compartir en redes sociales y materiales de marketing.
                            </p>
                        </div>

                        <div className="grid gap-12">
                            {banners.map((banner) => (
                                <div
                                    key={banner.url}
                                    className="group space-y-6"
                                >
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-semibold tracking-[-0.02em] flex items-center gap-3">
                                            {banner.title}
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-700">
                                                {banner.usage}
                                            </span>
                                        </h2>
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            {banner.description}
                                        </p>
                                    </div>

                                    {/* Banner Preview */}
                                    <div className="relative aspect-[1200/630] w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100 dark:bg-zinc-900 transition-transform duration-500 group-hover:scale-[1.01]">
                                        <Image
                                            src={banner.url}
                                            alt={banner.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <a
                                            href={banner.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            Ver imagen original
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}${banner.url}`);
                                            }}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
                                        >
                                            Copiar enlace
                                        </button>
                                    </div>

                                    {/* Usage Code */}
                                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                                        <p className="text-xs font-mono text-zinc-500 break-all">
                                            {`${window.location.origin}${banner.url}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
