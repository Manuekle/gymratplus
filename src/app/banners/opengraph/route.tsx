import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Plataforma Inteligente de Fitness con IA";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export async function GET() {
	// Fetch Geist fonts
	const geistRegular = await fetch(
		new URL(
			"https://fonts.gstatic.com/s/geist/v4/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf",
		),
	).then((res) => res.arrayBuffer());

	const geistBold = await fetch(
		new URL(
			"https://fonts.gstatic.com/s/geist/v4/gyBhhwUxId8gMGYQMKR3pzfaWI_RHOQ4nQ.ttf",
		),
	).then((res) => res.arrayBuffer());

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
					"linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f4f4f5 100%)",
				position: "relative",
				overflow: "hidden",
				fontFamily: '"Geist", sans-serif',
				padding: "60px",
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
					background:
						"radial-gradient(circle, rgba(228,228,231,0.4) 0%, rgba(212,212,216,0.2) 70%)",
					borderRadius: "50%",
					filter: "blur(60px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: "80px",
					right: "-100px",
					width: "400px",
					height: "400px",
					background:
						"radial-gradient(circle, rgba(212,212,216,0.3) 0%, rgba(228,228,231,0.2) 70%)",
					borderRadius: "50%",
					filter: "blur(60px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "-100px",
					left: "33%",
					width: "400px",
					height: "400px",
					background:
						"radial-gradient(circle, rgba(228,228,231,0.3) 0%, rgba(212,212,216,0.2) 70%)",
					borderRadius: "50%",
					filter: "blur(60px)",
				}}
			/>

			{/* Glass Grid Pattern */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					zIndex: 10,
					textAlign: "center",
				}}
			>
				{/* Glass Badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "6px 14px",
						borderRadius: "9999px",
						background: "rgba(255,255,255,0.4)",
						backdropFilter: "blur(40px)",
						border: "1px solid rgba(228,228,231,0.5)",
						marginBottom: "32px",
					}}
				>
					<div
						style={{
							width: "6px",
							height: "6px",
							borderRadius: "50%",
							background: "linear-gradient(135deg, #52525b, #a1a1aa)",
						}}
					/>
					<span
						style={{
							fontSize: "12px",
							fontWeight: 500,
							letterSpacing: "-0.02em",
							color: "#3f3f46",
						}}
					>
						Plataforma inteligente de fitness
					</span>
				</div>

				{/* Main Heading */}
				<h1
					style={{
						fontSize: "72px",
						fontWeight: 800,
						letterSpacing: "-0.04em",
						margin: 0,
						marginBottom: "12px",
						background:
							"linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #52525b 100%)",
						backgroundClip: "text",
						color: "transparent",
						lineHeight: 1,
					}}
				>
					Transforma
				</h1>
				<h2
					style={{
						fontSize: "72px",
						fontWeight: 800,
						letterSpacing: "-0.04em",
						margin: 0,
						color: "#27272a",
						lineHeight: 1,
					}}
				>
					tu cuerpo
				</h2>

				{/* Tagline */}
				<p
					style={{
						fontSize: "18px",
						color: "#52525b",
						marginTop: "20px",
						letterSpacing: "-0.01em",
						fontWeight: 500,
						maxWidth: "700px",
					}}
				>
					Tu coach personal impulsado por IA, disponible 24/7
				</p>
			</div>

			{/* Logo Badge Bottom Right */}
			<div
				style={{
					position: "absolute",
					bottom: "30px",
					right: "40px",
					display: "flex",
					alignItems: "center",
					gap: "10px",
					padding: "10px 16px",
					borderRadius: "14px",
					background: "rgba(255,255,255,0.6)",
					backdropFilter: "blur(40px)",
					border: "1px solid rgba(228,228,231,0.5)",
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
					name: "Geist",
					data: geistRegular,
					style: "normal",
					weight: 400,
				},
				{
					name: "Geist",
					data: geistBold,
					style: "normal",
					weight: 800,
				},
			],
		},
	);
}
