import { StepByStepRegistration } from "@/components/step-by-step-registration";

export default function RegisterPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      {/* <h1 className="text-3xl font-bold text-center mb-6">
        Registro de Usuario
      </h1> */}
      <StepByStepRegistration />
    </div>
  );
}
