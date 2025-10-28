"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

export function TagSelector({
  selectedTags,
  onTagSelect,
  availableTags,
  placeholder = "Select tags...",
  className,
}: {
  selectedTags: string[];
  onTagSelect: (tagIds: string[]) => void;
  availableTags: Tag[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onTagSelect(newSelectedTags);
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0 ? (
              <span className="truncate text-xs">
                {selectedTags.length} seleccionados
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar tags..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No se encontraron tags</CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleTagToggle(tag.id)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{tag.name}</span>
                      {tag.description && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {tag.description}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagId) => {
            const tag = availableTags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge
                key={tagId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => {
                    handleTagToggle(tagId);
                  }}
                  className="ml-1 rounded-full bg-muted p-0.5 hover:bg-muted-foreground/20"
                >
                  <span className="sr-only">Remove tag</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
