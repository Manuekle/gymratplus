import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { StreakAlert } from "@/components/workout/streak-alert";

interface StreakAlertContextType {
  showStreakAlert: (streak: number) => void;
}

const StreakAlertContext = createContext<StreakAlertContextType | undefined>(
  undefined
);

interface StreakAlertProviderProps {
  children: ReactNode;
}

export function StreakAlertProvider({ children }: StreakAlertProviderProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  const showStreakAlert = useCallback((streak: number) => {
    setCurrentStreak(streak);
    setShowAlert(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  return (
    <StreakAlertContext.Provider value={{ showStreakAlert }}>
      {children}
      <StreakAlert
        streak={currentStreak}
        show={showAlert}
        onClose={handleClose}
      />
    </StreakAlertContext.Provider>
  );
}

export function useStreakAlert() {
  const context = useContext(StreakAlertContext);
  if (context === undefined) {
    throw new Error("useStreakAlert must be used within a StreakAlertProvider");
  }
  return context;
}
