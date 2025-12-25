import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Transforma tu cuerpo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Gradient Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(63,63,70,0.6) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(82,82,91,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
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
          background:
            "radial-gradient(circle, rgba(39,39,42,0.4) 0%, transparent 60%)",
          filter: "blur(100px)",
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {/* Logo Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            padding: "16px 32px",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a1a1aa, #71717a)",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: "#a1a1aa",
              letterSpacing: "-0.02em",
            }}
          >
            Plataforma inteligente de fitness
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: "120px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            textAlign: "center",
            margin: 0,
            background:
              "linear-gradient(135deg, #fafafa 0%, #a1a1aa 50%, #71717a 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          GymRat+
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#71717a",
            letterSpacing: "-0.02em",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          Transforma tu cuerpo con IA
        </p>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {["🤖 Coach IA", "📊 Tracking", "🏋️ Planes"].map((feature) => (
            <div
              key={feature}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "18px",
                color: "#d4d4d8",
                fontWeight: 500,
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100px",
          background: "linear-gradient(to top, rgba(9,9,11,0.8), transparent)",
        }}
      />
    </div>,
    {
      ...size,
    },
  );
}
