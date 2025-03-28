"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icons } from "../icons";

// Define the profile type based on your session structure with index signature
interface UserProfile {
  id: string;
  userId: string;
  gender: string;
  phone: string;
  birthdate: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: string;
  goal: string;
  bodyFatPercentage: string;
  muscleMass: string;
  metabolicRate: number;
  dailyActivity: string;
  trainingFrequency: number;
  preferredWorkoutTime: string;
  dietaryPreference: string;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  waterIntake: number;
  notificationsActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | boolean | undefined; // Add index signature
}

// Define the user type based on your session structure
interface User {
  name: string;
  email: string;
  image: string;
  id: string;
  experienceLevel: string;
  profile: UserProfile;
}

// Define the session type
interface CustomSession {
  user: User;
  expires: string;
}

const ProfileCheck = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  useEffect(() => {
    // Only proceed when session is loaded (not loading)
    if (status !== "loading") {
      setIsLoading(true);

      try {
        let showProfileAlert = true;

        // Check if session exists and has user data with profile
        if (session?.user?.profile) {
          const profile = session.user.profile;

          // Define required fields to check
          const requiredFields = [
            "gender",
            "birthdate",
            "height",
            "currentWeight",
            "targetWeight",
            "activityLevel",
            "goal",
            "bodyFatPercentage",
            "muscleMass",
            "dailyActivity",
            "trainingFrequency",
            "preferredWorkoutTime",
            "dietaryPreference",
          ];

          // Check if any required fields are missing or empty
          showProfileAlert = requiredFields.some(
            (field) =>
              !profile[field] ||
              profile[field] === "" ||
              (typeof profile[field] === "number" &&
                isNaN(profile[field] as number))
          );
        }

        // Show alert if profile data is incomplete
        setShowAlert(showProfileAlert);
      } catch (error) {
        console.error("Error al verificar datos del usuario:", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [session, status]);

  const handleRedirect = () => {
    router.push("/onboarding");
  };

  // Avoid mounting the component on the onboarding page to prevent loops
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOnboardingPage = window.location.pathname.includes("/onboarding");
      if (isOnboardingPage) {
        setShowAlert(false);
      }
    }
  }, []);

  // If we're on the onboarding page, don't show anything
  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/onboarding")
  ) {
    return null;
  }

  return (
    <>
      {isLoading || status === "loading" ? (
        <div className="fixed inset-0 dark:bg-black/80 bg-black/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <Icons.spinner className="h-12 w-12 text-white animate-spin" />
            <p className="text-md md:text-lg font-bold tracking-tighter text-white">
              Verificando perfil
            </p>
          </div>
        </div>
      ) : null}

      <AlertDialog open={showAlert && !isLoading} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-tighter">
              Datos de perfil incompletos
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm tracking-tight">
              Para continuar, necesitas completar tu información personal y de
              entrenamiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-xs"
              onClick={() => router.push("/dashboard/profile")}
            >
              Volver
            </AlertDialogCancel>
            <AlertDialogAction className="text-xs" onClick={handleRedirect}>
              Completar datos ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileCheck;
