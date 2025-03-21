// types.ts
export type Exercise = {
  name: string;
  notes?: string;
  sets: number;
  reps: number;
  restTime: number;
};

export type Day = {
  day: string;
  exercises: Exercise[]; // Asegurar que sea un array de objetos Exercise
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[]; // Cambiar de string[] a Exercise[]
  description: string;
  type: string;
  days: Day[];
};
