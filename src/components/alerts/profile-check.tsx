"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  experienceLevel?: string;
  interests?: string[];
  profile?: UserProfile;
  createdAt?: string;
  isInstructor?: boolean;
  instructorProfile?: {
    id: string;
    userId: string;
    bio?: string | null;
    curriculum?: string | null;
    pricePerMonth?: number | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    country?: string | null;
    city?: string | null;
    isRemote?: boolean | null;
    specialties?: string[];
    experienceYears?: number;
    status?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  } | null;
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

  const handleRedirect = () => {
    router.push("/onboarding");
  };

  useEffect(() => {
    // Only proceed when session is loaded (not loading)
    if (status !== "loading") {
      setIsLoading(true);

      try {
        // Default to not showing the alert
        let showProfileAlert = false;

        // Check if session exists and has user data
        if (session?.user) {
          const user = session.user;
          const profile = user.profile;

          // Check for required profile fields
          const requiredProfileFields = [
            "gender",
            "birthdate",
            "height",
            "currentWeight",
            "goal",
          ];

          // Check if profile exists and has all required fields
          if (!profile) {
            showProfileAlert = true;
          } else {
            // Check if any required fields are missing or empty
            const missingFields = requiredProfileFields.filter(
              (field) => !profile[field] || profile[field] === ""
            );

            console.log("Profile check debug:", {
              hasProfile: !!profile,
              missingFields,
              profile: {
                gender: profile.gender,
                birthdate: profile.birthdate,
                height: profile.height,
                currentWeight: profile.currentWeight,
                goal: profile.goal,
              },
            });

            // Show alert if any required fields are missing
            showProfileAlert = missingFields.length > 0;
          }
        }

        setShowAlert(showProfileAlert);
      } catch (error) {
        console.error("Error al verificar datos del usuario:", error);
        setShowAlert(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [session, status]);

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
      {/* {isLoading || status === "loading" ? (
        <div className="fixed inset-0 dark:bg-black/80 bg-black/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-white">
              Verificando perfil
            </p>
          </div>
        </div>
      ) : null} */}

      <AlertDialog open={showAlert && !isLoading} onOpenChange={setShowAlert}>
        <AlertDialogContent className="overflow-y-auto pt-8 xl:pt-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold tracking-heading">
              Datos de perfil incompletos
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-normal">
              Para continuar, necesitas completar tu información personal y de
              entrenamiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel
              className="text-xs font-normal"
              onClick={() => router.push("/dashboard/profile")}
            >
              Volver
            </AlertDialogCancel> */}
            <AlertDialogAction
              className="text-xs font-normal"
              onClick={handleRedirect}
            >
              Completar datos ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProfileCheck;
