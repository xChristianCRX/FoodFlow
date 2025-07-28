import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface MenuItem { id: string; name: string; price: number; type: string; }
interface Addition { id: string; name: string; price: number; }
interface Waiter { id: string; name: string; }

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

interface OrderModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: OrderForm) => Promise<void>;
    menu: MenuItem[];
    additions: Addition[];
    waiters: Waiter[];
    saving: boolean;
}

export function OrderModal({ open, onClose, onSubmit, menu, additions, waiters, saving }: OrderModalProps) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<OrderForm>({
        resolver: zodResolver(orderSchema),
        defaultValues: { items: [{ itemId: "", additions: [], observations: "" }], waiterId: "" },
    });
    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo Pedido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
                                    <Controller
                                        control={control}
                                        name={`items.${idx}.itemId`}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o item" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {menu.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name} - R$ {m.price.toFixed(2)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(idx)} className="ml-2"><span className="sr-only">Remover</span>×</Button>
                                </div>
                                <Controller
                                    control={control}
                                    name={`items.${idx}.additions`}
                                    render={({ field: additionsField }) => (
                                        <div className="flex flex-wrap gap-2">
                                            {additions.map(a => (
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
                                                    {a.name} (+R$ {a.price.toFixed(2)})
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name={`items.${idx}.observations`}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="Observações (opcional)" />
                                    )}
                                />
                            </div>
                        ))}
                        <Button type="button" onClick={() => append({ itemId: "", additions: [], observations: "" })} className="bg-[#D35400] text-white font-bold">Adicionar Item</Button>
                        {errors.items && <span className="text-red-500 text-xs">{errors.items.message}</span>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-[#D35400] text-white font-bold" disabled={saving}>
                            {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            Salvar Pedido
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
