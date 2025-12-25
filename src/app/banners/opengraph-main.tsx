import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - La plataforma de fitness con IA";
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
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#09090b",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Large Gradient Circle */}
                <div
                    style={{
                        position: "absolute",
                        width: "1000px",
                        height: "1000px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(39,39,42,0.6) 0%, rgba(24,24,27,0.3) 40%, transparent 70%)",
                        filter: "blur(40px)",
                    }}
                />

                {/* Accent Lines */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "800px",
                        height: "800px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.05)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "600px",
                        height: "600px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.03)",
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
                    {/* Icon */}
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, #3f3f46, #27272a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "32px",
                            fontSize: "40px",
                            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                        }}
                    >
                        🏋️
                    </div>

                    {/* Brand */}
                    <h1
                        style={{
                            fontSize: "96px",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            margin: 0,
                            color: "#fafafa",
                        }}
                    >
                        GymRat+
                    </h1>

                    {/* Tagline */}
                    <p
                        style={{
                            fontSize: "28px",
                            color: "#71717a",
                            marginTop: "16px",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Tu coach personal impulsado por IA
                    </p>

                    {/* Stats Row */}
                    <div
                        style={{
                            display: "flex",
                            gap: "48px",
                            marginTop: "48px",
                        }}
                    >
                        {[
                            { value: "10K+", label: "Usuarios" },
                            { value: "50K+", label: "Entrenamientos" },
                            { value: "24/7", label: "IA Disponible" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "36px",
                                        fontWeight: 700,
                                        color: "#a1a1aa",
                                    }}
                                >
                                    {stat.value}
                                </span>
                                <span
                                    style={{
                                        fontSize: "16px",
                                        color: "#52525b",
                                        marginTop: "4px",
                                    }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
