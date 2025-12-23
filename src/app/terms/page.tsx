import Link from "next/link";

export default function TermsPage() {
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
            className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-12"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al inicio
          </Link>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-[-0.04em]">
                Términos de Servicio
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Última actualización:{" "}
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-10 text-zinc-700 dark:text-zinc-300">
              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  1. Aceptación de Términos
                </h2>
                <p className="leading-relaxed">
                  Al acceder y usar GymRat+, aceptas estar sujeto a estos
                  Términos de Servicio y todas las leyes y regulaciones
                  aplicables. Si no estás de acuerdo con alguno de estos
                  términos, no uses nuestro servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  2. Descripción del Servicio
                </h2>
                <p className="mb-4 leading-relaxed">
                  GymRat+ es una plataforma que conecta entrenadores y atletas
                  para proporcionar:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Planes de entrenamiento personalizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Seguimiento de nutrición y macronutrientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>
                      Herramientas de comunicación entre entrenadores y clientes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Análisis de progreso y métricas</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  3. Registro y Cuenta
                </h2>
                <p className="mb-4 leading-relaxed">
                  Para usar GymRat+, debes:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>
                      Ser mayor de 18 años o tener consentimiento parental
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Proporcionar información precisa y actualizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Mantener la seguridad de tu cuenta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>
                      Notificarnos inmediatamente sobre cualquier uso no
                      autorizado
                    </span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  4. Uso Aceptable
                </h2>
                <p className="mb-4 leading-relaxed">No está permitido:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Usar el servicio para actividades ilegales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Compartir contenido ofensivo o inapropiado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Intentar acceder a cuentas de otros usuarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Interferir con el funcionamiento del servicio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                      •
                    </span>
                    <span>Hacer ingeniería inversa de la plataforma</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  5. Suscripciones y Pagos
                </h2>
                <p className="leading-relaxed">
                  Las suscripciones se renuevan automáticamente. Puedes cancelar
                  en cualquier momento desde tu perfil. Los reembolsos se
                  procesan según nuestra política de reembolsos de 30 días.
                </p>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  6. Limitación de Responsabilidad
                </h2>
                <p className="leading-relaxed">
                  GymRat+ proporciona herramientas de fitness, pero no sustituye
                  el consejo médico profesional. Consulta con un profesional de
                  la salud antes de comenzar cualquier programa de ejercicio o
                  dieta.
                </p>
              </section>

              <section>
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  7. Modificaciones
                </h2>
                <p className="leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en
                  cualquier momento. Los cambios significativos serán
                  notificados con al menos 30 días de anticipación.
                </p>
              </section>

              <section className="pt-8 border-t border-zinc-300 dark:border-zinc-700">
                <h2 className="text-2xl tracking-[-0.02em] font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                  8. Contacto
                </h2>
                <p className="mb-3 leading-relaxed">
                  Para consultas sobre estos términos, contáctanos en:
                </p>
                <a
                  href="mailto:legal@gymratplus.com"
                  className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  legal@gymratplus.com
                </a>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
