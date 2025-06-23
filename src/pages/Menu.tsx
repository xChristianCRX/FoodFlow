import { useEffect, useState } from "react";
import { api } from "@/libs/axios";
import { Plus, UtensilsCrossed, GlassWater, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from 'react-currency-input-field';

interface MenuItem {
    id: string;
    name: string;
    price: number;
    type: "BURGER" | "DRINK" | "APPETIZER";
}

const schema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    price: z.string().min(1, "Preço é obrigatório"),
    type: z.enum(["BURGER", "DRINK", "APPETIZER"], {
        errorMap: () => ({ message: "Tipo inválido" }),
    }),
});

type FormData = z.infer<typeof schema>;

export default function Menu() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const fetchMenu = async () => {
        const res = await api.get("/menu");
        setMenu(res.data);
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const onSubmit = async (data: FormData) => {
        const numericPrice = parseFloat(data.price.replace("R$", "").replace(".", "").replace(",", "."));

        try {
            await api.post("/menu", {
                ...data,
                price: numericPrice,
            });

            toast.success("Item adicionado com sucesso!");
            fetchMenu();
            setOpen(false);
            reset();
        } catch (e) {
            toast.error("Erro ao adicionar item.");
            console.error(e);
        }
    };

    const categories = {
        BURGER: { icon: <Sandwich />, label: "Burgers" },
        DRINK: { icon: <GlassWater />, label: "Drinks" },
        APPETIZER: { icon: <UtensilsCrossed />, label: "Appetizers" },
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#3E2C1C]">Cardápio</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D35400] hover:bg-[#b43e00]">
                            <Plus className="mr-2" size={18} />
                            Adicionar Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Item ao Cardápio</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <div>
                                <Label>Nome</Label>
                                <Input {...register("name")} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>

                            <div>
                                <Label>Preço</Label>
                                <CurrencyInput
                                    name="price"
                                    placeholder="R$ 0,00"
                                    decimalsLimit={2}
                                    decimalSeparator=","
                                    groupSeparator="."
                                    prefix="R$ "
                                    allowNegativeValue={false}
                                    value={watch('price')}
                                    onValueChange={(value) => setValue('price', value ?? '')}
                                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                                />
                                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                            </div>

                            <div>
                                <Label>Tipo</Label>
                                <Select onValueChange={(val) => setValue("type", val as FormData["type"])}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BURGER">Burger</SelectItem>
                                        <SelectItem value="DRINK">Drink</SelectItem>
                                        <SelectItem value="APPETIZER">Appetizer</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                            </div>

                            <Button type="submit" className="bg-[#D35400] hover:bg-[#b43e00]">
                                Salvar
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {Object.entries(categories).map(([key, value]) => {
                    const items = menu.filter((item) => item.type === key);
                    return (
                        <Card key={key}>
                            <CardHeader className="flex flex-row items-center gap-3">
                                {value.icon}
                                <CardTitle>{value.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <div key={item.id} className="flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="font-semibold">R$ {item.price.toFixed(2)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">Nenhum item.</span>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
