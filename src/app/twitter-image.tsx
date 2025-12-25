import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Tu entrenador personal con IA";
export const size = {
    width: 1200,
    height: 600,
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
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "60px 80px",
                    background: "linear-gradient(145deg, #09090b 0%, #18181b 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background Elements */}
                <div
                    style={{
                        position: "absolute",
                        top: "-200px",
                        right: "-200px",
                        width: "600px",
                        height: "600px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(63,63,70,0.4) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-150px",
                        left: "-100px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(82,82,91,0.3) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

                {/* Left Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 10,
                        maxWidth: "600px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "24px",
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
                                letterSpacing: "-0.02em",
                            }}
                        >
                            GymRat+
                        </span>
                    </div>

                    <h1
                        style={{
                            fontSize: "64px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                            margin: 0,
                            background: "linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        Transforma tu cuerpo
                    </h1>

                    <p
                        style={{
                            fontSize: "24px",
                            color: "#71717a",
                            marginTop: "16px",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Coach personal con IA • Planes personalizados • Tracking nutricional
                    </p>
                </div>

                {/* Right: Feature Card */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        padding: "32px",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        zIndex: 10,
                    }}
                >
                    {[
                        { emoji: "🤖", text: "Rocco AI Coach" },
                        { emoji: "📊", text: "Tracking inteligente" },
                        { emoji: "🎯", text: "Metas personalizadas" },
                        { emoji: "💪", text: "Resultados reales" },
                    ].map((item) => (
                        <div
                            key={item.text}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                padding: "16px 24px",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.02)",
                            }}
                        >
                            <span style={{ fontSize: "28px" }}>{item.emoji}</span>
                            <span
                                style={{
                                    fontSize: "20px",
                                    color: "#d4d4d8",
                                    fontWeight: 500,
                                }}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
