import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Table {
    tableNumber: number;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLOSED";
}

interface MenuItem {
    id: string;
    name: string;
    price: number;
    type: "BURGER" | "DRINK" | "PORTION";
}

interface Addition {
    id: string;
    name: string;
    price: number;
}

interface Waiter {
    id: string;
    name: string;
}

const orderItemSchema = z.object({
    itemId: z.string().min(1, "Selecione um item"),
    additions: z.array(z.string()),
    observations: z.string().optional(),
});

const orderSchema = z.object({
    waiterId: z.string().min(1, "Selecione o garçom"),
    items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item"),
});

type OrderForm = z.infer<typeof orderSchema>;

interface OrderFormComponentProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: OrderForm) => Promise<void>;
    tables: Table[];
    menu: MenuItem[];
    additions: Addition[];
    waiters: Waiter[];
    creatingOrderFor: Table | null;
    setCreatingOrderFor: (table: Table | null) => void;
    savingOrder: boolean;
    mode: 'new' | 'additional';
}

export function OrderFormComponent({
    isOpen,
    onClose,
    onSubmit,
    tables,
    menu,
    additions,
    waiters,
    creatingOrderFor,
    setCreatingOrderFor,
    savingOrder,
    mode
}: OrderFormComponentProps) {
    const [searchMenu, setSearchMenu] = useState("");
    const [searchAdditions, setSearchAdditions] = useState("");
    const [selectedItemType, setSelectedItemType] = useState<"BURGER" | "DRINK" | "PORTION" | "ALL">("ALL");

    const filteredMenu = menu.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchMenu.toLowerCase());
        const matchesType = selectedItemType === "ALL" || item.type === selectedItemType;
        return matchesSearch && matchesType;
    });

    const filteredAdditions = additions.filter(addition =>
        addition.name.toLowerCase().includes(searchAdditions.toLowerCase())
    );

    const itemTypeLabels = {
        ALL: "Todos",
        BURGER: "Lanches",
        DRINK: "Bebidas",
        PORTION: "Porções"
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<OrderForm>({
        resolver: zodResolver(orderSchema),
        defaultValues: { items: [{ itemId: "", additions: [], observations: "" }], waiterId: "" },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo Pedido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <div>
                        <Label>Mesa</Label>
                        {mode === 'new' ? (
                            <Select
                                value={creatingOrderFor?.tableNumber?.toString() || ""}
                                onValueChange={val => {
                                    const table = tables.find(t => t.tableNumber.toString() === val);
                                    setCreatingOrderFor(table || null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a mesa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tables
                                        .filter(t => t.status === "AVAILABLE")
                                        .map(t => (
                                            <SelectItem key={t.tableNumber} value={t.tableNumber.toString()}>
                                                Mesa {t.tableNumber}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-10 px-3 rounded-md border border-input bg-background flex items-center">
                                Mesa {creatingOrderFor?.tableNumber}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label>Garçom</Label>
                        <Controller
                            control={control}
                            name="waiterId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o garçom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {waiters.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.waiterId && <span className="text-red-500 text-xs">{errors.waiterId.message}</span>}
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label>Itens do Pedido</Label>
                        {fields.map((field, idx) => (
                            <div key={field.id} className="border rounded-lg p-4 bg-orange-50/60 flex flex-col gap-2 relative">
                                <div className="flex gap-2 items-center">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Buscar item..."
                                                value={searchMenu}
                                                onChange={(e) => setSearchMenu(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Select
                                                value={selectedItemType}
                                                onValueChange={(value) => setSelectedItemType(value as "BURGER" | "DRINK" | "PORTION" | "ALL")}>
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(itemTypeLabels).map(([type, label]) => (
                                                        <SelectItem key={type} value={type}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Controller
                                            control={control}
                                            name={`items.${idx}.itemId`}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredMenu.map(m => (
                                                            <SelectItem key={m.id} value={m.id}>
                                                                {m.name} - R$ {formatPrice(m.price)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(idx)} className="ml-2">
                                        <span className="sr-only">Remover</span>×
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Input
                                        placeholder="Buscar adicionais..."
                                        value={searchAdditions}
                                        onChange={(e) => setSearchAdditions(e.target.value)}
                                        className="w-full"
                                    />
                                    <Controller
                                        control={control}
                                        name={`items.${idx}.additions`}
                                        render={({ field: additionsField }) => (
                                            <div className="flex flex-wrap gap-2">
                                                {filteredAdditions.map(a => (
                                                    <label key={a.id} className="flex items-center gap-1 text-sm bg-white border rounded px-2 py-1">
                                                        <input
                                                            type="checkbox"
                                                            value={a.id}
                                                            checked={additionsField.value.includes(a.id)}
                                                            onChange={e => {
                                                                if (e.target.checked) {
                                                                    additionsField.onChange([...additionsField.value, a.id]);
                                                                } else {
                                                                    additionsField.onChange(additionsField.value.filter((id: string) => id !== a.id));
                                                                }
                                                            }}
                                                        />
                                                        {a.name} (+R$ {formatPrice(a.price)})
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>
                                <Controller
                                    control={control}
                                    name={`items.${idx}.observations`}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Observações (opcional)" />
                                    )}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            onClick={() => append({ itemId: "", additions: [], observations: "" })}
                            className="bg-[#D35400] text-white font-bold"
                        >
                            Adicionar Item
                        </Button>
                        {errors.items && <span className="text-red-500 text-xs">{errors.items.message}</span>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-[#D35400] text-white font-bold" disabled={savingOrder}>
                            {savingOrder ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            Salvar Pedido
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
