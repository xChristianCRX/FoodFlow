import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { formatPrice } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SearchableSelect } from "./SearchableSelect";
import { MultiSelectWithSearch } from "./MultiSelectWithSearch";

interface Table {
    tableNumber: number;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLOSED";
}

interface MenuItem {
    id: string;
    name: string;
    price: number;
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
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<OrderForm>({
        resolver: zodResolver(orderSchema),
        defaultValues: { items: [], waiterId: "" },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-50% bg-[#fff8f0] rounded-xl shadow-lg border border-[#f5d7b5]">
                <DialogHeader className="bg-[#D35400] text-white rounded-t-xl p-4">
                    <DialogTitle className="text-center text-xl font-bold">
                        🍔 Novo Pedido
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-6 max-h-[calc(100vh-220px)] overflow-y-auto p-4 overflow-x-hidden"
                >
                    {/* Mesa */}
                    <div>
                        <Label className="text-[#6b3e1f] font-semibold">Mesa</Label>
                        {mode === "new" ? (
                            <Select
                                value={creatingOrderFor?.tableNumber?.toString() || ""}
                                onValueChange={(val) => {
                                    const table = tables.find((t) => t.tableNumber.toString() === val);
                                    setCreatingOrderFor(table || null);
                                }}
                            >
                                <SelectTrigger className="bg-white border border-[#f5d7b5] rounded-md shadow-sm">
                                    <SelectValue placeholder="Selecione a mesa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tables
                                        .filter((t) => t.status === "AVAILABLE")
                                        .map((t) => (
                                            <SelectItem key={t.tableNumber} value={t.tableNumber.toString()}>
                                                Mesa {t.tableNumber}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-10 px-3 rounded-md border border-input bg-white flex items-center shadow-sm">
                                Mesa {creatingOrderFor?.tableNumber}
                            </div>
                        )}
                    </div>

                    {/* Garçom */}
                    <div>
                        <Label className="text-[#6b3e1f] font-semibold">Garçom</Label>
                        <Controller
                            control={control}
                            name="waiterId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-white border border-[#f5d7b5] rounded-md shadow-sm">
                                        <SelectValue placeholder="Selecione o garçom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {waiters.map((w) => (
                                            <SelectItem key={w.id} value={w.id}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.waiterId && (
                            <span className="text-red-500 text-xs">{errors.waiterId.message}</span>
                        )}
                    </div>

                    {/* Itens do Pedido */}
                    <div className="flex flex-col gap-4">
                        <Label className="text-[#6b3e1f] font-semibold">Itens do Pedido</Label>
                        {fields.map((field, idx) => (
                            <div
                                key={field.id}
                                className="border border-[#f5d7b5] p-4 rounded-lg bg-[#fff3e0] shadow-sm space-y-3 relative"
                            >
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(idx)}
                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                        &times;
                                    </Button>
                                    <Controller
                                        control={control}
                                        name={`items.${idx}.itemId`}
                                        render={({ field }) => (
                                            <div className="flex-1">
                                                <SearchableSelect
                                                    options={menu.map(m => ({ value: m.id, label: `${m.name} - R$ ${formatPrice(m.price)}` }))}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Selecione o item"
                                                />
                                            </div>
                                        )}
                                    />

                                </div>

                                <Controller
                                    control={control}
                                    name={`items.${idx}.additions`}
                                    render={({ field }) => (
                                        <MultiSelectWithSearch
                                            options={additions.map((a) => ({
                                                value: a.id,
                                                label: `${a.name} (+R$ ${formatPrice(a.price)})`,
                                            }))}
                                            values={field.value}
                                            onChange={field.onChange}
                                            placeholder="Selecione acréscimos (opcional)"
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name={`items.${idx}.observations`}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Observações (opcional)"
                                            className="bg-white border border-[#f5d7b5] rounded-md shadow-sm"
                                        />
                                    )}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                append({ itemId: "", additions: [], observations: "" })
                            }
                            className="border-[#D35400] text-[#D35400] hover:bg-[#D35400] hover:text-white transition"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                        </Button>
                        {errors.items && (
                            <span className="text-red-500 text-xs">{errors.items.message}</span>
                        )}
                    </div>

                    {/* Rodapé */}
                    <DialogFooter className="m-auto">
                        <Button
                            type="submit"
                            className="bg-[#D35400] hover:bg-[#b74300] text-white font-bold px-6 py-2 rounded-lg shadow-md"
                            disabled={savingOrder}
                        >
                            {savingOrder && <Loader2 className="animate-spin mr-2" size={18} />}
                            Salvar Pedido
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    );
}
