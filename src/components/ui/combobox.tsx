import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxItem {
    value: string;
    label: string;
    group?: string;
    price?: number;
}

interface ComboboxProps {
    items: ComboboxItem[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyMessage?: string;
    className?: string;
    groups?: string[];
}

export function Combobox({
    items,
    value,
    onValueChange,
    placeholder = "Selecione um item...",
    emptyMessage = "Nenhum item encontrado.",
    className,
    groups
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    const groupedItems = React.useMemo(() => {
        if (!groups) return { undefined: items };

        return items.reduce((acc, item) => {
            const group = item.group || "undefined";
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {} as Record<string, ComboboxItem[]>);
    }, [items, groups]);

    const selectedItem = items.find((item) => item.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedItem ? (
                        <span>
                            {selectedItem.label}
                            {selectedItem.price &&
                                <span className="ml-2 text-muted-foreground">
                                    R$ {selectedItem.price.toFixed(2)}
                                </span>
                            }
                        </span>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Pesquisar item..." />
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    {Object.entries(groupedItems).map(([group, items]) => (
                        <CommandGroup key={group} heading={group !== "undefined" ? group : undefined}>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={() => {
                                        onValueChange(item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="flex-1">{item.label}</span>
                                    {item.price && (
                                        <span className="text-muted-foreground">
                                            R$ {item.price.toFixed(2)}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
