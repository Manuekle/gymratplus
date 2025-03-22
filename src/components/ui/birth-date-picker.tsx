"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BirthdayCakeIcon } from "hugeicons-react";

interface BirthDatePickerProps {
  value: Date | string | undefined;
  onValueChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

export function BirthDatePicker({
  value,
  onValueChange,
  label = "Fecha de nacimiento",
  placeholder = "Seleccione una fecha",
}: BirthDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Convert value to Date object for internal use - use useMemo to avoid recalculation on every render
  const dateValue = useMemo(() => {
    if (value instanceof Date) {
      return value;
    } else if (typeof value === "string" && value) {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : undefined;
    }
    return undefined;
  }, [value]);

  // State for calendar view - initialize only once
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    if (dateValue) {
      return new Date(dateValue);
    }
    // Default to 30 years ago
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 30);
    return defaultDate;
  });

  // Update calendar date when value changes, but not on every render
  useEffect(() => {
    if (dateValue) {
      setCalendarDate(new Date(dateValue));
    }
  }, [value]); // Depend on value, not dateValue

  // Generate years for dropdown (100 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Months for dropdown
  const months = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" },
  ];

  const handleYearChange = (yearStr: string): void => {
    const year = Number.parseInt(yearStr, 10);
    const newDate = new Date(calendarDate);
    newDate.setFullYear(year);
    setCalendarDate(newDate);
  };

  const handleMonthChange = (monthStr: string): void => {
    const month = Number.parseInt(monthStr, 10);
    const newDate = new Date(calendarDate);
    newDate.setMonth(month);
    setCalendarDate(newDate);
  };

  // Handle calendar selection - always return a string (empty string if no date)
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onValueChange(date.toISOString());
    } else {
      onValueChange("");
    }
    setIsCalendarOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs md:text-sm" htmlFor="birthdate">
        {label}
      </Label>

      <div className="flex flex-col">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="birthdate"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal text-xs md:text-sm",
                !value && "text-muted-foreground"
              )}
            >
              <BirthdayCakeIcon className="mr-2 h-4 w-4" />
              {dateValue ? (
                format(dateValue, "d 'de' MMMM 'de' yyyy", { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center mb-2 gap-2">
                <Select
                  value={calendarDate.getMonth().toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[140px] text-xs md:text-sm">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem
                        className="text-xs md:text-sm"
                        key={month.value}
                        value={month.value}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={calendarDate.getFullYear().toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="w-[100px] text-xs md:text-sm">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {years.map((year) => (
                      <SelectItem
                        className="text-xs md:text-sm"
                        key={year}
                        value={year.toString()}
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={handleSelect}
                month={calendarDate}
                onMonthChange={setCalendarDate}
                initialFocus
                locale={es}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
