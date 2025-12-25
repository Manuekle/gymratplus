import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Empieza gratis";
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
                    justifyContent: "center",
                    background: "#09090b",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Large Gradient Background */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(34,197,94,0.1) 0%, transparent 60%)",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 10,
                    }}
                >
                    {/* Promo Badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "12px 24px",
                            borderRadius: "9999px",
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            marginBottom: "32px",
                        }}
                    >
                        <span style={{ fontSize: "20px" }}>✨</span>
                        <span
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "#22c55e",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            EMPIEZA GRATIS HOY
                        </span>
                    </div>

                    {/* Main Text */}
                    <h1
                        style={{
                            fontSize: "72px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            margin: 0,
                            textAlign: "center",
                            background: "linear-gradient(135deg, #fafafa 0%, #a1a1aa 100%)",
                            backgroundClip: "text",
                            color: "transparent",
                            lineHeight: 1.1,
                        }}
                    >
                        Transforma tu cuerpo
                        <br />
                        con inteligencia artificial
                    </h1>

                    <p
                        style={{
                            fontSize: "24px",
                            color: "#71717a",
                            marginTop: "24px",
                            textAlign: "center",
                        }}
                    >
                        Coach IA • Planes personalizados • Resultados garantizados
                    </p>

                    {/* CTA Button */}
                    <div
                        style={{
                            display: "flex",
                            marginTop: "40px",
                            padding: "20px 48px",
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            boxShadow: "0 20px 40px -10px rgba(34,197,94,0.4)",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "24px",
                                fontWeight: 700,
                                color: "#fff",
                            }}
                        >
                            Comenzar ahora →
                        </span>
                    </div>

                    {/* Brand */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "48px",
                        }}
                    >
                        <span style={{ fontSize: "32px" }}>🏋️</span>
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
            </div>
        ),
        {
            ...size,
        }
    );
}
