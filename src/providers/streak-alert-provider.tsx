import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { StreakAlert } from "@/components/workout/streak-alert";
import { StreakRiskAlert } from "@/components/workout/streak-risk-alert";

interface StreakAlertContextType {
  showStreakAlert: (streak: number) => void;
  showStreakRiskAlert: (streak: number, allowedRestDays: number) => void;
}

const StreakAlertContext = createContext<StreakAlertContextType | undefined>(
  undefined,
);

interface StreakAlertProviderProps {
  children: ReactNode;
}

export function StreakAlertProvider({ children }: StreakAlertProviderProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [allowedRestDays, setAllowedRestDays] = useState(0);

  const showStreakAlert = useCallback((streak: number) => {
    setCurrentStreak(streak);
    setShowAlert(true);
  }, []);

  const showStreakRiskAlert = useCallback(
    (streak: number, allowedRestDays: number) => {
      setCurrentStreak(streak);
      setAllowedRestDays(allowedRestDays);
      setShowRiskAlert(true);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setShowAlert(false);
  }, []);

  const handleCloseRisk = useCallback(() => {
    setShowRiskAlert(false);
  }, []);

  return (
    <StreakAlertContext.Provider
      value={{ showStreakAlert, showStreakRiskAlert }}
    >
      {children}
      <StreakAlert
        streak={currentStreak}
        show={showAlert}
        onClose={handleClose}
      />
      <StreakRiskAlert
        streak={currentStreak}
        allowedRestDays={allowedRestDays}
        show={showRiskAlert}
        onClose={handleCloseRisk}
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
