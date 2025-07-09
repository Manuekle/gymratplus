import { ArrowRight01Icon, CheckmarkCircle01Icon } from "hugeicons-react";
import { Button } from "../ui/button";

export default function UpcomingEvents() {
  const today = new Date();
  const dayNames: string[] = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const todayFormatted = `${dayNames[today.getDay()]}, ${today.getDate()} de ${monthNames[today.getMonth()]}`;

  const events = [
    {
      title: "Entrenamiento de Piernas",
      time: "07:00 - 08:15",
      type: "workout",
      completed: false,
    },
    {
      title: "Desayuno proteico",
      time: "08:30",
      type: "meal",
      completed: true,
    },
    {
      title: "Almuerzo: Pollo con verduras",
      time: "13:00",
      type: "meal",
      completed: false,
    },
    {
      title: "Clase de Yoga",
      time: "18:30 - 19:30",
      type: "workout",
      completed: false,
    },
  ];

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {/* <Calendar className="h-5 w-5 text-blue-500" /> */}
          <h2 className="text-lg font-semibold ">Eventos Próximos</h2>
        </div>
        <Button className="text-xs text-muted-foreground flex items-center gap-1">
          Ver calendario <ArrowRight01Icon className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {todayFormatted}
        </h3>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg flex items-center justify-between ${
              event.completed ? "border rounded-lg" : "border rounded-lg"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-10 rounded-full ${
                  event.type === "workout" ? "bg-blue-500" : "bg-green-500"
                }`}
              ></div>
              <div>
                <p
                  className={`font-medium ${
                    event.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {event.title}
                </p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
            {event.completed ? (
              <CheckmarkCircle01Icon className="h-5 w-5 " />
            ) : (
              <Button className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200">
                {event.type === "workout" ? "Iniciar" : "Completar"}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Próximos días</h3>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((day) => {
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + day);
            return (
              <div
                key={day}
                className="flex-1 text-center p-2 rounded-lg border"
              >
                <p className="text-xs text-muted-foreground">
                  {dayNames[futureDate.getDay()]?.slice(0, 3) ?? 'Día'}
                </p>
                <p className="text-lg font-semibold ">{futureDate.getDate()}</p>
                <div className="mt-1 flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
