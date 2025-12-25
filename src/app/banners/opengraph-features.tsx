import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Características";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "60px",
                    background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background Gradient Orbs */}
                <div
                    style={{
                        position: "absolute",
                        top: "-100px",
                        right: "-100px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-100px",
                        left: "-100px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "48px",
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #3f3f46, #27272a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "24px",
                            }}
                        >
                            🏋️
                        </div>
                        <span
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                color: "#fafafa",
                            }}
                        >
                            GymRat+
                        </span>
                    </div>
                    <span
                        style={{
                            fontSize: "18px",
                            color: "#71717a",
                            fontWeight: 500,
                        }}
                    >
                        Características
                    </span>
                </div>

                {/* Features Grid */}
                <div
                    style={{
                        display: "flex",
                        flex: 1,
                        gap: "24px",
                        zIndex: 10,
                    }}
                >
                    {[
                        {
                            emoji: "🤖",
                            title: "Rocco AI",
                            desc: "Coach personal 24/7",
                            color: "rgba(59,130,246,0.15)",
                            border: "rgba(59,130,246,0.2)",
                        },
                        {
                            emoji: "🍎",
                            title: "Nutrición",
                            desc: "Tracking inteligente",
                            color: "rgba(34,197,94,0.15)",
                            border: "rgba(34,197,94,0.2)",
                        },
                        {
                            emoji: "💪",
                            title: "Entrenamientos",
                            desc: "Rutinas personalizadas",
                            color: "rgba(168,85,247,0.15)",
                            border: "rgba(168,85,247,0.2)",
                        },
                        {
                            emoji: "📊",
                            title: "Progreso",
                            desc: "Analíticas detalladas",
                            color: "rgba(251,146,60,0.15)",
                            border: "rgba(251,146,60,0.2)",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "32px",
                                borderRadius: "24px",
                                background: feature.color,
                                border: `1px solid ${feature.border}`,
                            }}
                        >
                            <span style={{ fontSize: "64px", marginBottom: "24px" }}>
                                {feature.emoji}
                            </span>
                            <span
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#fafafa",
                                    marginBottom: "8px",
                                }}
                            >
                                {feature.title}
                            </span>
                            <span
                                style={{
                                    fontSize: "18px",
                                    color: "#a1a1aa",
                                    textAlign: "center",
                                }}
                            >
                                {feature.desc}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom tagline */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "32px",
                        zIndex: 10,
                    }}
                >
                    <span
                        style={{
                            fontSize: "20px",
                            color: "#52525b",
                            fontWeight: 500,
                        }}
                    >
                        Todo lo que necesitas para transformar tu cuerpo
                    </span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
