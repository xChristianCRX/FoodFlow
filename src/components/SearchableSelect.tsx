import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(o => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selectedOption ? selectedOption.label : placeholder || "Selecione"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Pesquisar..." />
          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
