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

import { Delete01Icon, EyeIcon, WasteIcon } from "hugeicons-react";

interface Nutrition {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Datos de ejemplo

export default function NutritionsTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [nutrition, setNutrition] = useState<Nutrition[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const fetchNutritions = async () => {
      const res = await fetch("/api/nutrition-plans");
      if (res.ok) {
        const data = await res.json();
        // setnutritions(data);
        console.log(data);
        const timer = setTimeout(() => {
          setNutrition(data);
          setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    fetchNutritions();
  }, [session]);

  // Funciones para manejar acciones
  const handleViewDetails = (nutrition: Nutrition) => {
    console.log(`Ver detalles de ${nutrition.name}`);
    router.push(`/dashboard/nutrition/plans/${nutrition.id}`);
    // alert(`Navegando a los detalles de la tienda: ${workout.name}`);
  };

  // const handleEdit = (workout: Workout) => {
  //   console.log(`Editar ${workout.name}`);
  //   alert(`Editando tienda: ${workout.name}`);
  // };

  const handleDelete = (nutrition: Nutrition) => {
    console.log(`Eliminar ${nutrition.name}`);
    // alert(`¿Estás seguro de que deseas eliminar la tienda: ${workout.name}?`);
  };

  const columns = [
    createDateColumn<Nutrition>("createdAt", "Fecha", "dd MMM yyyy HH:mm"),
    createSortableColumn<Nutrition>("name", "Nombre"),
    // createSortableColumn<Workout>("description", "Descripción"),
    createActionsColumn<Nutrition>("", [
      {
        label: "Ver plan",
        icon: EyeIcon,
        onClick: handleViewDetails,
      },
      {
        label: "Eliminar",
        icon: Delete01Icon,
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
          data={nutrition}
          filterColumn="name"
          defaultPageSize={10}
        />
      )}
    </div>
  );
}
