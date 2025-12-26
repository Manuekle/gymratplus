import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "GymRat+ - Tu Coach de IA Personal";
export const size = {
	width: 1200,
	height: 600,
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

	// Hugeicons-style SVGs
	const RobotIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="48"
			height="48"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Robot Icon</title>
			<rect x="4" y="8" width="16" height="12" rx="4" />
			<path d="M8 4l2-2h4l2 2" />
			<path d="M9 13v2" />
			<path d="M15 13v2" />
			<path d="M8 8v12" />
			<path d="M16 8v12" />
		</svg>
	);

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				backgroundColor: "#09090b",
				padding: "0 80px",
				fontFamily: '"Geist", sans-serif',
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Background Glows */}
			<div
				style={{
					position: "absolute",
					top: "-200px",
					left: "-200px",
					width: "600px",
					height: "600px",
					background:
						"radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
					borderRadius: "50%",
					filter: "blur(80px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					bottom: "-200px",
					right: "-200px",
					width: "800px",
					height: "800px",
					background:
						"radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
					borderRadius: "50%",
					filter: "blur(100px)",
				}}
			/>

			{/* Grid Pattern */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Left Content */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "24px",
					zIndex: 10,
					maxWidth: "600px",
				}}
			>
				{/* Badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "8px 16px",
						borderRadius: "100px",
						background: "rgba(255,255,255,0.05)",
						border: "1px solid rgba(255,255,255,0.1)",
						width: "fit-content",
					}}
				>
					<div
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							background: "#22c55e",
							boxShadow: "0 0 10px #22c55e",
						}}
					/>
					<span
						style={{
							fontSize: "14px",
							fontWeight: 500,
							color: "#d4d4d8",
							letterSpacing: "0.02em",
						}}
					>
						IA ENTRENADOR PERSONAL
					</span>
				</div>

				{/* Heading */}
				<div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
					<h1
						style={{
							fontSize: "64px",
							fontWeight: 800,
							color: "#fff",
							lineHeight: 1.1,
							margin: 0,
							letterSpacing: "-0.02em",
						}}
					>
						Tu mejor versión
					</h1>
					<h1
						style={{
							fontSize: "64px",
							fontWeight: 800,
							color: "#71717a",
							lineHeight: 1.1,
							margin: 0,
							letterSpacing: "-0.02em",
						}}
					>
						empieza aquí.
					</h1>
				</div>

				{/* Description */}
				<p
					style={{
						fontSize: "20px",
						color: "#a1a1aa",
						margin: 0,
						lineHeight: 1.6,
						maxWidth: "480px",
					}}
				>
					Planes de entrenamiento y nutrición personalizados generados instante
					por la IA más avanzada.
				</p>
			</div>

			{/* Right Content - Floating Glass Card */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "400px",
					height: "400px",
					position: "relative",
					zIndex: 10,
				}}
			>
				{/* Glass Card */}
				<div
					style={{
						width: "100%",
						padding: "40px",
						borderRadius: "32px",
						background:
							"linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
						border: "1px solid rgba(255,255,255,0.1)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "30px",
						boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
						backdropFilter: "blur(20px)",
					}}
				>
					{/* Icon Circle */}
					<div
						style={{
							width: "96px",
							height: "96px",
							borderRadius: "24px",
							background: "linear-gradient(135deg, #27272a 0%, #09090b 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "1px solid rgba(255,255,255,0.1)",
							color: "#fff",
						}}
					>
						{RobotIcon}
					</div>

					{/* Chat Bubble */}
					<div
						style={{
							width: "100%",
							padding: "20px",
							borderRadius: "20px",
							background: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.05)",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
							<div
								style={{
									width: "24px",
									height: "4px",
									borderRadius: "10px",
									background: "#52525b",
								}}
							/>
							<div
								style={{
									width: "40px",
									height: "4px",
									borderRadius: "10px",
									background: "#3f3f46",
								}}
							/>
						</div>
						<div
							style={{
								width: "80%",
								height: "4px",
								borderRadius: "10px",
								background: "#3f3f46",
							}}
						/>
						<div
							style={{
								width: "60%",
								height: "4px",
								borderRadius: "10px",
								background: "#3f3f46",
							}}
						/>
					</div>

					{/* Chat Bubble 2 */}
					<div
						style={{
							width: "100%",
							padding: "20px",
							borderRadius: "20px",
							background: "rgba(34,197,94,0.1)",
							border: "1px solid rgba(34,197,94,0.2)",
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						<div
							style={{ fontSize: "14px", fontWeight: 600, color: "#4ade80" }}
						>
							¡Plan listo! 🚀
						</div>
					</div>
				</div>
			</div>

			{/* Logo Bottom */}
			<div
				style={{
					position: "absolute",
					bottom: "40px",
					left: "80px",
					display: "flex",
					alignItems: "center",
					gap: "12px",
					opacity: 0.5,
				}}
			>
				<span style={{ fontSize: "24px" }}>🏋️</span>
				<span
					style={{
						fontSize: "20px",
						fontWeight: 600,
						color: "#fff",
						letterSpacing: "0.05em",
					}}
				>
					GYMRAT+
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
