import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DaySelectButtonProps {
  days: string[];
  value: string;
  onChange: (value: string) => void;
}

export function DaySelectButton({
  days,
  value,
  onChange,
}: DaySelectButtonProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] text-xs md:text-sm">
        <SelectValue placeholder="Seleccionar día" />
      </SelectTrigger>
      <SelectContent>
        {days.map((day) => (
          <SelectItem className="text-xs md:text-sm" key={day} value={day}>
            {day}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
