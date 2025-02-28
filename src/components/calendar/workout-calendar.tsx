"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddEventForm } from "@/components/calendar/add-event-form";

const localizer = momentLocalizer(moment);

// Tipo para los eventos del calendario
interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  workoutId?: string;
  color?: string;
}

export default function WorkoutCalendar() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Entrenamiento de Pecho",
      start: new Date(2023, 10, 10, 10, 0),
      end: new Date(2023, 10, 10, 11, 30),
      color: "#e11d48",
      workoutId: "workout-1",
    },
    {
      id: "2",
      title: "Entrenamiento de Piernas",
      start: new Date(2023, 10, 12, 14, 0),
      end: new Date(2023, 10, 12, 15, 30),
      color: "#8b5cf6",
      workoutId: "workout-2",
    },
    {
      id: "3",
      title: "Cardio",
      start: new Date(2023, 10, 14, 9, 0),
      end: new Date(2023, 10, 14, 10, 0),
      color: "#3b82f6",
      workoutId: "workout-3",
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsAddEventOpen(true);
  };

  const handleAddEvent = (newEvent: Omit<Event, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setEvents([...events, { id, ...newEvent }]);
    setIsAddEventOpen(false);
  };

  // Personalización del evento en el calendario
  const eventStyleGetter = (event: Event) => {
    const style = {
      backgroundColor: event.color || "#3b82f6",
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style,
    };
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Calendario de entrenamientos</CardTitle>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Añadir Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir nuevo evento</DialogTitle>
            </DialogHeader>
            <AddEventForm
              initialDate={selectedDate}
              onSubmit={handleAddEvent}
              onCancel={() => setIsAddEventOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
            defaultView="week"
          />
        </div>
      </CardContent>

      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                <strong>Inicio:</strong>{" "}
                {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")}
              </p>
              <p>
                <strong>Fin:</strong>{" "}
                {moment(selectedEvent.end).format("DD/MM/YYYY HH:mm")}
              </p>
              {selectedEvent.workoutId && (
                <p className="mt-4">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    variant="outline"
                  >
                    Ver detalles del entrenamiento
                  </Button>
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
