"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileSection from "@/components/profile-section"
import HealthMetrics from "@/components/health-metrics"
import TrainingMetrics from "@/components/training-metrics"
import NutritionMetrics from "@/components/nutrition-metrics"

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mi Perfil de Fitness</h1>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="training">Entrenamiento</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <HealthMetrics />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingMetrics />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <NutritionMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

