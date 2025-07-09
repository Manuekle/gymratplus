import { Suspense } from "react";
import InstructorSearchClient from "./InstructorSearchClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <InstructorSearchClient />
    </Suspense>
  );
}
