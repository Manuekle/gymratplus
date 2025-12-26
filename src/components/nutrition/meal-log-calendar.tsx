"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { MealLogList } from "@/components/nutrition/meal-log-list";

type MealLog = {
  id: string;
  mealType: string;
  consumedAt: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string | null;
  customName: string | null;
  food: {
    id: string;
    name: string;
    serving: number;
  } | null;
  recipe: {
    id: string;
    name: string;
    servings: number;
  } | null;
};

interface MealLogCalendarProps {
  onMealDeleted?: () => void;
}

export function MealLogCalendar({ onMealDeleted }: MealLogCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesWithMeals, setDatesWithMeals] = useState<Date[]>([]);

  // Cargar los logs del mes actual y los de la fecha seleccionada
  useEffect(() => {
    const loadData = async () => {
      await fetchMealLogsForMonth(currentMonth);
      await fetchMealLogsForDate(selectedDate);
    };

    loadData();
  }, [currentMonth, selectedDate]);

  const fetchMealLogsForMonth = async (date: Date) => {
    setLoading(true);
    try {
      // Formatear fechas para la API
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");

      const response = await fetch(
        `/api/meal-logs?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) {
        throw new Error("Error al cargar los registros de comidas");
      }

      const data = (await response.json()) as MealLog[]; // Added type assertion
      console.log(data);

      // Extraer fechas únicas con comidas y asegurar que estén en la zona horaria local
      const dates = [
        ...new Set(
          data.map((log: MealLog) => {
            // Crear una nueva fecha en la zona horaria local
            const logDate = new Date(log.consumedAt);
            return new Date(
              logDate.getFullYear(),
              logDate.getMonth(),
              logDate.getDate(),
            );
          }),
        ),
      ];

      setDatesWithMeals(dates);
    } catch (error) {
      console.error("Error fetching meal logs for month:", error);
      // toast({
      //   title: "Error",
      //   description: "No se pudieron cargar los registros de comidas",
      //   variant: "destructive",
      // });
      toast.error("Error", {
        description: "No se pudieron cargar los registros de comidas",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMealLogsForDate = async (date: Date) => {
    setLoading(true);
    try {
      // Crear una copia de la fecha para no modificar la original
      const dateCopy = new Date(date);
      // Asegurarnos de que la fecha esté en formato YYYY-MM-DD
      const formattedDate = dateCopy.toISOString().split("T")[0];

      const response = await fetch(`/api/meal-logs?date=${formattedDate}`);

      if (!response.ok) {
        throw new Error("Error al cargar los registros de comidas");
      }

      const data = await response.json();

      // Ordenar los logs por hora
      const sortedData = [...data].sort((a: MealLog, b: MealLog) => {
        const dateA = new Date(a.consumedAt);
        const dateB = new Date(b.consumedAt);
        return dateA.getTime() - dateB.getTime();
      });

      setMealLogs(sortedData);
    } catch (error) {
      console.error("Error fetching meal logs for date:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los registros de comidas",
      });
      setMealLogs([]); // Asegurarse de que no hay datos antiguos mostrándose
    } finally {
      setLoading(false);
    }
  };

  // const nextMonth = () => {
  //   setCurrentMonth(addMonths(currentMonth, 1));
  // };

  // const prevMonth = () => {
  //   setCurrentMonth(subMonths(currentMonth, 1));
  // };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const onMealLogDeleted = (id: string) => {
    setMealLogs(mealLogs.filter((log) => log.id !== id));
    toast.success("Comida eliminada");

    // Call the onMealDeleted callback if provided
    if (onMealDeleted) {
      onMealDeleted();
    }

    // Check if we need to update the calendar
    const remainingLogsForDate = mealLogs.filter(
      (log) =>
        log.id !== id && isSameDay(new Date(log.consumedAt), selectedDate),
    );

    if (remainingLogsForDate.length === 0) {
      // No more logs for this date, update the calendar
      setDatesWithMeals(
        datesWithMeals.filter((date) => !isSameDay(date, selectedDate)),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-80">
          {/* <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader> */}
          <CardContent className="px-4 flex justify-center items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md"
              locale={es}
              modifiers={{
                hasMeal: datesWithMeals,
              }}
              modifiersStyles={{
                hasMeal: {
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  fontWeight: "bold",
                  color: "hsl(var(--primary))",
                  borderRadius: "100%",
                  border: "1px solid hsl(var(--primary) / 0.5)",
                },
              }}
            />
            {/* <div className="mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div> */}
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold  tracking-heading">
                Comidas del{" "}
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </CardTitle>
              <CardDescription className="text-xs">
                Registro de todas las comidas consumidas en esta fecha
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <MealLogList
                mealLogs={mealLogs}
                loading={loading}
                onMealLogDeleted={onMealLogDeleted}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
