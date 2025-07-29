import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectWithSearchProps {
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectWithSearch({ options, values, onChange, placeholder }: MultiSelectWithSearchProps) {
  const [open, setOpen] = useState(false);

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const removeValue = (val: string) => {
    onChange(values.filter(v => v !== val));
  };

  const selectedLabels = options
    .filter(opt => values.includes(opt.value))
    .map(opt => ({ value: opt.value, label: opt.label }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            open && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map(sel => (
                <span
                  key={sel.value}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  {sel.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(sel.value);
                    }}
                    className="hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder || "Selecione"}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Pesquisar acréscimos..." />
          <CommandEmpty>Nenhum acréscimo encontrado.</CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => toggleValue(option.value)}
                className="cursor-pointer"
              >
                <Check
                  className={cn("mr-2 h-4 w-4", values.includes(option.value) ? "opacity-100" : "opacity-0")}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
