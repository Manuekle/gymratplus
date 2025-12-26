import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, EquipmentGym01Icon } from "@hugeicons/core-free-icons";

const locations = [
  {
    id: "gym",
    name: "Gimnasio",
    description:
      "Acceso completo a máquinas, pesas libres y equipamiento profesional",
    icon: (
      <HugeiconsIcon
        icon={EquipmentGym01Icon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
  {
    id: "home",
    name: "Casa",
    description:
      "Entrenamiento adaptado para realizar con mancuernas o peso corporal",
    icon: (
      <HugeiconsIcon
        icon={Home01Icon}
        size={18}
        className="text-muted-foreground"
      />
    ),
  },
];

interface StepLocationProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepLocation({ value, onChange }: StepLocationProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <DialogHeader className="space-y-1.5 md:space-y-2">
        <DialogTitle className="text-2xl font-semibold tracking-heading">
          ¿Dónde vas a entrenar?
        </DialogTitle>
        <DialogDescription className="text-xs md:text-xs text-muted-foreground">
          Adaptaremos los ejercicios según el equipamiento disponible
        </DialogDescription>
      </DialogHeader>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid gap-2 md:gap-3"
      >
        {locations.map((location) => (
          <Label
            key={location.id}
            htmlFor={location.id}
            className="cursor-pointer"
          >
            <RadioGroupItem
              value={location.id}
              id={location.id}
              className="peer sr-only"
            />
            <div className="w-full rounded-lg border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-zinc-100 dark:peer-data-[state=checked]:bg-zinc-800 hover:border-border transition-all">
              <div className="flex items-center p-2.5 md:p-3.5 gap-2.5 md:gap-3.5">
                <div className="flex-shrink-0 p-1.5 md:p-2 rounded-full border border-border/50 peer-data-[state=checked]:border-0 peer-data-[state=checked]:bg-transparent bg-background transition-all">
                  <div className="w-4 h-4 md:w-[18px] md:h-[18px] flex items-center justify-center text-muted-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {location.icon}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h3 className="text-xs font-medium leading-tight text-foreground peer-data-[state=checked]:text-black dark:peer-data-[state=checked]:text-white transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-xs md:text-xs text-muted-foreground peer-data-[state=checked]:text-black/70 dark:peer-data-[state=checked]:text-white/80 leading-tight line-clamp-2 transition-colors">
                    {location.description}
                  </p>
                </div>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
