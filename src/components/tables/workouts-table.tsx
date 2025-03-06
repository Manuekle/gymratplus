"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DataTable,
  TableSkeleton,
  createSortableColumn,
  createDateColumn,
  createActionsColumn,
} from "@/components/ui/data-table";

import { EyeIcon, WasteIcon } from "hugeicons-react";

interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Datos de ejemplo

export default function WorkoutsTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const fetchWorkouts = async () => {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        // setWorkouts(data);
        const timer = setTimeout(() => {
          setWorkouts(data);
          setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    fetchWorkouts();
  }, [session]);

  // Funciones para manejar acciones
  const handleViewDetails = (workout: Workout) => {
    console.log(`Ver detalles de ${workout.name}`);
    router.push(`/dashboard/workout/${workout.id}`);
    // alert(`Navegando a los detalles de la tienda: ${workout.name}`);
  };

  // const handleEdit = (workout: Workout) => {
  //   console.log(`Editar ${workout.name}`);
  //   alert(`Editando tienda: ${workout.name}`);
  // };

  const handleDelete = (workout: Workout) => {
    console.log(`Eliminar ${workout.name}`);
    // alert(`¿Estás seguro de que deseas eliminar la tienda: ${workout.name}?`);
  };

  const columns = [
    createDateColumn<Workout>("createdAt", "Fecha", "dd MMM yyyy HH:mm"),
    createSortableColumn<Workout>("name", "Nombre"),
    createSortableColumn<Workout>("description", "Descripción"),
    createActionsColumn<Workout>("", [
      {
        label: "Ver detalles",
        icon: EyeIcon,
        onClick: handleViewDetails,
      },
      {
        label: "Eliminar",
        icon: WasteIcon,
        onClick: handleDelete,
      },
    ]),
  ];

  return (
    <div>
      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <DataTable
          columns={columns}
          data={workouts}
          filterColumn="name"
          defaultPageSize={10}
        />
      )}
    </div>
  );
}
