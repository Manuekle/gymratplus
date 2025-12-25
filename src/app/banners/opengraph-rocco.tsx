import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Rocco - Tu entrenador IA de GymRat+";
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
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(180deg, #09090b 0%, #18181b 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow Effect Behind Robot */}
                <div
                    style={{
                        position: "absolute",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

                {/* Content Container */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "80px",
                        zIndex: 10,
                    }}
                >
                    {/* Robot Icon Container */}
                    <div
                        style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "40px",
                            background: "linear-gradient(135deg, #1e3a5f 0%, #172554 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "100px",
                            boxShadow: "0 40px 80px -20px rgba(59,130,246,0.3)",
                            border: "1px solid rgba(59,130,246,0.2)",
                        }}
                    >
                        🤖
                    </div>

                    {/* Text Content */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "16px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "20px",
                                    color: "#3b82f6",
                                    fontWeight: 600,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Inteligencia Artificial
                            </span>
                        </div>

                        <h1
                            style={{
                                fontSize: "80px",
                                fontWeight: 800,
                                letterSpacing: "-0.04em",
                                margin: 0,
                                color: "#fafafa",
                            }}
                        >
                            Conoce a Rocco
                        </h1>

                        <p
                            style={{
                                fontSize: "28px",
                                color: "#71717a",
                                marginTop: "16px",
                                maxWidth: "500px",
                                lineHeight: 1.4,
                            }}
                        >
                            Tu entrenador personal disponible 24/7 para ayudarte a alcanzar tus
                            metas
                        </p>

                        {/* Feature Pills */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "32px",
                            }}
                        >
                            {["Planes personalizados", "Tracking nutricional", "Chat 24/7"].map(
                                (feature) => (
                                    <div
                                        key={feature}
                                        style={{
                                            padding: "10px 20px",
                                            borderRadius: "9999px",
                                            background: "rgba(59,130,246,0.1)",
                                            border: "1px solid rgba(59,130,246,0.2)",
                                            fontSize: "16px",
                                            color: "#60a5fa",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {feature}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* GymRat+ Branding */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        right: "60px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <span
                        style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#52525b",
                        }}
                    >
                        GymRat+
                    </span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
