"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap } from "lucide-react"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

interface ExtendedSession {
  user: Session["user"] & {
    role?: "student" | "instructor"
  }
}

interface RoleSwitcherProps {
  onRoleChange: (role: "student" | "instructor") => void
}

export function RoleSwitcher({ onRoleChange }: RoleSwitcherProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [currentRole, setCurrentRole] = useState<"student" | "instructor">("student")

  // Check if user is instructor based on session data
  const isUserInstructor = session?.user?.role === "instructor"

  const handleRoleChange = (role: "student" | "instructor") => {
    setCurrentRole(role)
    onRoleChange(role)
  }

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Button
        variant={currentRole === "student" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleRoleChange("student")}
        className="gap-2 relative"
        disabled={isUserInstructor && currentRole === "instructor"}
      >
        <Users className="h-4 w-4" />
        Estudiante
        {currentRole === "student" && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
            Activo
          </Badge>
        )}
      </Button>
      <Button
        variant={currentRole === "instructor" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleRoleChange("instructor")}
        className="gap-2 relative"
        disabled={!isUserInstructor}
      >
        <GraduationCap className="h-4 w-4" />
        Instructor
        {currentRole === "instructor" && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
            Activo
          </Badge>
        )}
      </Button>
      {isUserInstructor && (
        <Badge variant="outline" className="ml-2">
          Instructor verificado
        </Badge>
      )}
      <Button
        variant={currentRole === "student" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleRoleChange("student")}
        className="gap-2 relative"
      >
        <Users className="h-4 w-4" />
        Estudiante
        {currentRole === "student" && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
            Activo
          </Badge>
        )}
      </Button>
      <Button
        variant={currentRole === "instructor" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleRoleChange("instructor")}
        className="gap-2 relative"
      >
        <GraduationCap className="h-4 w-4" />
        Instructor
        {currentRole === "instructor" && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
            Activo
          </Badge>
        )}
      </Button>
    </div>
  )
}
