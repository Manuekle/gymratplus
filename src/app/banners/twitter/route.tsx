import { ImageResponse } from "next/og";

// export const runtime = "edge";

export const alt = "GymRat+ - Tu coach personal impulsado por IA";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export async function GET() {
    // Fetch Inter font
    const fontData = await fetch(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f4f4f5 100%)",
                position: "relative",
                overflow: "hidden",
                fontFamily: '"Inter", system-ui, sans-serif',
            }}
        >
            {/* Animated Liquid Glass Blobs */}
            <div
                style={{
                    position: "absolute",
                    top: "-100px",
                    left: "-100px",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(228,228,231,0.4) 0%, rgba(212,212,216,0.2) 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "-100px",
                    right: "-100px",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(212,212,216,0.3) 0%, rgba(228,228,231,0.2) 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />

            {/* Glass Grid Pattern */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Content Container */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "80px",
                    zIndex: 10,
                    padding: "0 80px",
                }}
            >
                {/* Robot Icon Container - Glass Card */}
                <div
                    style={{
                        width: "240px",
                        height: "240px",
                        borderRadius: "48px",
                        background: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(40px)",
                        border: "1px solid rgba(228,228,231,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "120px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
                        position: "relative",
                    }}
                >
                    🤖
                    {/* Glow Effect */}
                    <div
                        style={{
                            position: "absolute",
                            inset: "-20px",
                            background: "radial-gradient(circle, rgba(161,161,170,0.15) 0%, transparent 70%)",
                            borderRadius: "60px",
                            filter: "blur(30px)",
                            zIndex: -1,
                        }}
                    />
                </div>

                {/* Text Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "600px",
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 16px",
                            borderRadius: "9999px",
                            background: "rgba(255,255,255,0.6)",
                            backdropFilter: "blur(40px)",
                            border: "1px solid rgba(228,228,231,0.5)",
                            width: "fit-content",
                            marginBottom: "24px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "14px",
                                color: "#52525b",
                                fontWeight: 600,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                            }}
                        >
                            Inteligencia Artificial
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1
                        style={{
                            fontSize: "72px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            margin: 0,
                            background: "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #52525b 100%)",
                            backgroundClip: "text",
                            color: "transparent",
                            lineHeight: 1.1,
                        }}
                    >
                        Conoce a Rocco
                    </h1>

                    {/* Description */}
                    <p
                        style={{
                            fontSize: "20px",
                            color: "#52525b",
                            marginTop: "20px",
                            lineHeight: 1.5,
                            fontWeight: 500,
                        }}
                    >
                        Tu entrenador personal disponible 24/7 para ayudarte a alcanzar tus metas
                    </p>

                    {/* Feature Pills */}
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "32px",
                            flexWrap: "wrap",
                        }}
                    >
                        {["Planes personalizados", "Tracking nutricional", "Chat 24/7"].map(
                            (feature) => (
                                <div
                                    key={feature}
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "9999px",
                                        background: "rgba(255,255,255,0.6)",
                                        backdropFilter: "blur(40px)",
                                        border: "1px solid rgba(228,228,231,0.5)",
                                        fontSize: "14px",
                                        color: "#3f3f46",
                                        fontWeight: 500,
                                    }}
                                >
                                    {feature}
                                </div>
                            ),
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
                    padding: "12px 20px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(228,228,231,0.5)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                }}
            >
                <span
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#18181b",
                        letterSpacing: "-0.04em",
                    }}
                >
                    GymRat+
                </span>
            </div>
        </div>,
        {
            ...size,
            fonts: [
                {
                    name: "Inter",
                    data: fontData,
                    style: "normal",
                    weight: 400,
                },
            ],
        },
    );
}
