import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nutrición",
  description: "Gestiona tus planes de alimentación y suplementación",
}

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Nutrición</h1>
      {children}
    </div>
  )
}

