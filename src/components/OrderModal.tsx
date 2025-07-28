import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, X } from "lucide-react";
import type { OrderForm } from "@/schemas/orderForm";
import { orderFormSchema } from "@/schemas/orderForm";

interface MenuItem {
    id: string;
    name: string;
    price: number;
    type: string;
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

interface OrderModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: OrderForm) => void;
    menu: MenuItem[];
    additions: Addition[];
    waiters: Waiter[];
    saving: boolean;
}

export function OrderModal({
    open,
    onClose,
    onSubmit,
    menu,
    additions,
    waiters,
    saving
}: OrderModalProps) {
    const { control, handleSubmit, formState: { errors } } = useForm<OrderForm>({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            waiterId: "",
            items: [{ itemId: "", additions: [], observations: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Criar Pedido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Garçom</Label>
                        <Select
                            onValueChange={(value) => control._formValues.waiterId = value}
                            value={control._formValues.waiterId}
                        >
                            <SelectTrigger>
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
                        {errors.waiterId && (
                            <span className="text-sm text-red-500">{errors.waiterId.message}</span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Itens do Pedido</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ itemId: "", additions: [], observations: "" })}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="relative p-4 border rounded-lg bg-orange-50/60">
                                <div className="absolute right-2 top-2">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 h-auto"
                                            onClick={() => remove(index)}
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label>Item</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                control._formValues.items[index].itemId = value;
                                            }}
                                            value={control._formValues.items[index].itemId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {menu.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.name} - R$ {item.price.toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.items?.[index]?.itemId && (
                                            <span className="text-sm text-red-500">
                                                {errors.items[index]?.itemId?.message}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Adicionais</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                const currentAdditions = control._formValues.items[index].additions || [];
                                                control._formValues.items[index].additions = [
                                                    ...currentAdditions,
                                                    value
                                                ];
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione os adicionais" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {additions.map((addition) => (
                                                    <SelectItem key={addition.id} value={addition.id}>
                                                        {addition.name} - R$ {addition.price.toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Observações</Label>
                                        <Input
                                            placeholder="Observações do pedido..."
                                            {...control.register(`items.${index}.observations`)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            className="bg-[#D35400] text-white font-bold"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Criar Pedido"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
