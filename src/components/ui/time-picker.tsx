// components/TimePicker.tsx
import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("00");
  const [selectedMinute, setSelectedMinute] = useState("00");

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":");
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    const time = `${selectedHour}:${selectedMinute}`;
    onChange(time);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          className="text-xs md:text-sm"
          value={`${selectedHour}:${selectedMinute}`}
          readOnly
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex space-x-2">
          <Select value={selectedHour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue className="text-xs md:text-sm" placeholder="Hora" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) =>
                i.toString().padStart(2, "0"),
              ).map((hour) => (
                <SelectItem
                  className="text-xs md:text-sm"
                  key={hour}
                  value={hour}
                >
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMinute} onValueChange={handleMinuteChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue
                className="text-xs md:text-sm"
                placeholder="Minuto"
              />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) =>
                i.toString().padStart(2, "0"),
              ).map((minute) => (
                <SelectItem
                  className="text-xs md:text-sm"
                  key={minute}
                  value={minute}
                >
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="text-xs w-full mt-4"
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
