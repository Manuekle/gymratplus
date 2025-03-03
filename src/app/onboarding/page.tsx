"use client";

import { useState, useEffect } from "react";
import { CustomSonner } from "@/components/custom-sonner";
import StepOnboarding1 from "@/components/onboarding/step-1";
import StepOnboarding2 from "@/components/onboarding/step-2";

export default function Home() {
  const [currentForm, setCurrentForm] = useState(0);

  // Load current form from localStorage if available
  useEffect(() => {
    const savedForm = localStorage.getItem("currentForm");
    if (savedForm) {
      setCurrentForm(Number.parseInt(savedForm));
    }
  }, []);

  // Update localStorage when form changes
  useEffect(() => {
    localStorage.setItem("currentForm", currentForm.toString());
  }, [currentForm]);

  const goToNextForm = () => {
    setCurrentForm((prev) => prev + 1);
  };
  const forms = [
    <StepOnboarding1 key="profile" onComplete={goToNextForm} />,
    <StepOnboarding2 key="form2" onComplete={goToNextForm} />,
    ,
  ];
  return (
    <main className="flex justify-center items-center min-h-screen p-4 md:p-8">
      {forms[currentForm]}
      <CustomSonner position="top-center" />
    </main>
  );
}
