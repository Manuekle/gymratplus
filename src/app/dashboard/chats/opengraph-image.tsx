import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ Chat con Rocco";
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
                    background: "#09090b",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background Pattern */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.1) 0%, transparent 50%)",
                    }}
                />

                {/* Chat Interface Mockup */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: "40px",
                        zIndex: 10,
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "32px",
                        }}
                    >
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #3f3f46, #27272a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            🤖
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    color: "#fafafa",
                                }}
                            >
                                Rocco
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        background: "#22c55e",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: "16px",
                                        color: "#22c55e",
                                    }}
                                >
                                    En línea
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: "20px",
                        }}
                    >
                        {/* User message */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <div
                                style={{
                                    padding: "16px 24px",
                                    borderRadius: "20px",
                                    background: "#fafafa",
                                    color: "#09090b",
                                    fontSize: "18px",
                                    maxWidth: "400px",
                                }}
                            >
                                Dame un plan de entrenamiento 💪
                            </div>
                        </div>

                        {/* Rocco response */}
                        <div
                            style={{
                                display: "flex",
                            }}
                        >
                            <div
                                style={{
                                    padding: "20px 28px",
                                    borderRadius: "20px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "#e4e4e7",
                                    fontSize: "18px",
                                    maxWidth: "500px",
                                    lineHeight: 1.5,
                                }}
                            >
                                ¡Perfecto! 🏋️ Te he generado un plan personalizado de 4 días enfocado en hipertrofia...
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Features */}
                <div
                    style={{
                        width: "400px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "40px",
                        background: "rgba(255,255,255,0.02)",
                        borderLeft: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "56px",
                                fontWeight: 800,
                                color: "#fafafa",
                                letterSpacing: "-0.04em",
                            }}
                        >
                            GymRat+
                        </span>
                        <span
                            style={{
                                fontSize: "20px",
                                color: "#71717a",
                                marginTop: "8px",
                            }}
                        >
                            Coach IA 24/7
                        </span>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                marginTop: "40px",
                            }}
                        >
                            {[
                                "Genera planes al instante",
                                "Tracking nutricional",
                                "Respuestas personalizadas",
                            ].map((text) => (
                                <div
                                    key={text}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            background: "rgba(34,197,94,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#22c55e",
                                            fontSize: "14px",
                                        }}
                                    >
                                        ✓
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "16px",
                                            color: "#a1a1aa",
                                        }}
                                    >
                                        {text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
