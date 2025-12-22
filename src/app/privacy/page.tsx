import Link from "next/link";

export default function PrivacyPage() {
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
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-12"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al inicio
                    </Link>

                    {/* Content */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                                Política de Privacidad
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-500">
                                Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-10 text-zinc-700 dark:text-zinc-300">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">1. Información que Recopilamos</h2>
                                <p className="mb-4 leading-relaxed">
                                    En GymRat+, recopilamos la siguiente información:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Información de perfil (nombre, email, foto)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Datos de fitness y salud (peso, altura, objetivos)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Información de uso de la aplicación</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Datos de pago procesados de forma segura</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">2. Uso de la Información</h2>
                                <p className="mb-4 leading-relaxed">
                                    Utilizamos tu información para:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Proporcionar y mejorar nuestros servicios</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Personalizar tu experiencia de entrenamiento</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Comunicarnos contigo sobre tu cuenta</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Procesar pagos y transacciones</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">3. Protección de Datos</h2>
                                <p className="leading-relaxed">
                                    Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, alteración, divulgación o destrucción.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">4. Compartir Información</h2>
                                <p className="mb-4 leading-relaxed">
                                    No vendemos tu información personal. Compartimos datos solo cuando:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Es necesario para proporcionar el servicio (ej. con tu entrenador)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Lo requiere la ley</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Has dado tu consentimiento explícito</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">5. Tus Derechos</h2>
                                <p className="mb-4 leading-relaxed">
                                    Tienes derecho a:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Acceder a tus datos personales</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Corregir información inexacta</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Solicitar la eliminación de tus datos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Exportar tu información</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                        <span>Revocar el consentimiento en cualquier momento</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-zinc-300 dark:border-zinc-700">
                                <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">6. Contacto</h2>
                                <p className="mb-3 leading-relaxed">
                                    Para cualquier consulta sobre privacidad, contáctanos en:
                                </p>
                                <a
                                    href="mailto:privacy@gymratplus.com"
                                    className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    privacy@gymratplus.com
                                </a>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
