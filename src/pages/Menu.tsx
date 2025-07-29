import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Plus, UtensilsCrossed, GlassWater, Sandwich, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useForm, useForm as useAdditionForm } from "react-hook-form";
import { z, z as zAddition } from "zod";
import { zodResolver, zodResolver as zodAdditionResolver } from "@hookform/resolvers/zod";
import CurrencyInput from 'react-currency-input-field';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: "BURGUER" | "DRINK" | "APPETIZER";
}

const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    price: z.string().min(1, "Preço é obrigatório"),
    type: z.enum(["BURGUER", "DRINK", "APPETIZER"], {
        errorMap: () => ({ message: "Tipo inválido" }),
    }),
});

type FormData = z.infer<typeof schema>;

const additionSchema = zAddition.object({
    name: zAddition.string().min(1, "Nome é obrigatório"),
    price: zAddition.string().min(1, "Preço é obrigatório"),
});
type AdditionForm = zAddition.infer<typeof additionSchema>;

import { formatPrice } from "@/lib/utils";

export default function Menu() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [open, setOpen] = useState(false);
    const [additions, setAdditions] = useState<{ id: string; name: string; price: number }[]>([]);
    const [openAddition, setOpenAddition] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);

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

    const fetchAdditions = async () => {
        const res = await api.get("/addition");
        setAdditions(res.data);
    };

    useEffect(() => {
        fetchMenu();
        fetchAdditions();
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

    // Edição de item
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        setValue: setValueEdit,
        reset: resetEdit,
        formState: { errors: errorsEdit },
        watch: watchEdit,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const openEditModal = (item: MenuItem) => {
        setEditItem(item);
    };

    // Sempre que editItem mudar, preenche os campos do formulário de edição
    useEffect(() => {
        if (editItem) {
            setValueEdit("id", editItem.id);
            setValueEdit("name", editItem.name);
            setValueEdit("description", editItem.description);
            setValueEdit("price", editItem.price.toFixed(2).replace(".", ","));
            setValueEdit("type", editItem.type);
        } else {
            resetEdit();
        }
    }, [editItem, setValueEdit, resetEdit]);

    const onSubmitEdit = async (data: FormData) => {
        if (!editItem) return;
        const numericPrice = parseFloat(data.price.replace("R$", "").replace(".", "").replace(",", "."));
        console.log(editItem)
        try {
            await api.put("/menu", {
                ...data,
                price: numericPrice,
                id: editItem.id,
            });
            toast.success("Item editado com sucesso!");
            fetchMenu();
            setEditItem(null);
            resetEdit();
        } catch (e) {
            toast.error("Erro ao editar item.");
        }
    };

    // Exclusão de item
    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await api.delete(`/menu/${deleteItem.id}`);
            toast.success("Item excluído com sucesso!");
            fetchMenu();
            setDeleteItem(null);
        } catch (e) {
            toast.error("Erro ao excluir item.");
        }
    };

    // Formulário de adicional
    const {
        register: registerAddition,
        handleSubmit: handleSubmitAddition,
        setValue: setValueAddition,
        watch: watchAddition,
        reset: resetAddition,
        formState: { errors: errorsAddition },
    } = useAdditionForm<AdditionForm>({
        resolver: zodAdditionResolver(additionSchema),
    });

    const onSubmitAddition = async (data: AdditionForm) => {
        const numericPrice = parseFloat(data.price.replace("R$", "").replace(".", "").replace(",", "."));
        try {
            await api.post("/addition", {
                name: data.name,
                price: numericPrice,
            });
            toast.success("Adicional adicionado com sucesso!");
            fetchAdditions();
            setOpenAddition(false);
            resetAddition();
        } catch (e) {
            toast.error("Erro ao adicionar adicional.");
        }
    };

    const categories = {
        BURGUER: { icon: <Sandwich className="text-orange-500" size={28} />, label: "Lanches", bg: "bg-gradient-to-br from-orange-100 to-orange-50" },
        DRINK: { icon: <GlassWater className="text-blue-500" size={28} />, label: "Bebidas", bg: "bg-gradient-to-br from-blue-100 to-blue-50" },
        APPETIZER: { icon: <UtensilsCrossed className="text-green-600" size={28} />, label: "Porções", bg: "bg-gradient-to-br from-green-100 to-green-50" },
    };


    // Filtro, busca e ordenação
    const filteredMenu = menu
        .filter(item => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                item.name.toLowerCase().includes(searchLower);
            const matchesCategory = categoryFilter ? item.type === categoryFilter : true;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => a.type.localeCompare(b.type));

    return (
        <div className="max-w-7xl mx-auto px-2 md:px-8 py-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#D35400] drop-shadow-sm mb-1">Cardápio</h1>
                    <p className="text-zinc-500 text-lg">Gerencie os itens e adicionais do restaurante</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D35400] hover:bg-[#b43e00] shadow-lg px-6 py-3 rounded-full text-lg font-bold cursor-pointer">
                            <Plus className="mr-2" size={20} />
                            Novo Item
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
                                <Label>Descrição</Label>
                                <Input {...register("description")} />
                                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
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
                                        <SelectItem value="BURGUER">Lanche</SelectItem>
                                        <SelectItem value="DRINK">Bebida</SelectItem>
                                        <SelectItem value="APPETIZER">Porção</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                            </div>
                            <Button type="submit" className="bg-[#D35400] hover:bg-[#b43e00] font-bold">
                                Salvar
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Barra de busca e filtro */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <Input
                    placeholder="Buscar item do cardápio..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full md:w-96 border-orange-200 shadow-sm"
                />
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={categoryFilter === null ? "default" : "outline"}
                        className={categoryFilter === null ? "bg-[#D35400] text-white cursor-pointer" : "cursor-pointer"}
                        onClick={() => setCategoryFilter(null)}
                    >
                        Todos
                    </Button>
                    {Object.entries(categories).map(([key, value]) => (
                        <Button
                            key={key}
                            variant={categoryFilter === key ? "default" : "outline"}
                            className={categoryFilter === key ? value.bg + " text-white cursor-pointer" : "cursor-pointer"}
                            onClick={() => setCategoryFilter(key)}
                        >
                            <span className="flex items-center gap-2">{value.icon}{value.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid filtrado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map((item) => {
                        const cat = categories[item.type];
                        if (!cat) {
                            // Categoria desconhecida, renderiza fallback simples
                            return (
                                <div key={item.id} className="rounded-2xl shadow-md border p-0 flex flex-col min-h-[120px] bg-gray-50">
                                    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200/40">
                                        <span className="text-xl font-bold text-zinc-800 tracking-tight">{item.type}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-1">
                                        <span className="text-base text-zinc-700 font-medium">{item.name}</span>
                                        <span className="text-sm text-zinc-500 italic mb-1">{item.description ? item.description : "Sem descrição."}</span>
                                        <span className="font-bold text-orange-700 text-lg">R$ {formatPrice(item.price)}</span>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={item.id} className={`rounded-2xl shadow-md border ${cat.bg} p-0 flex flex-col min-h-[120px]`}>
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-orange-200/40 justify-between">
                                    <div className="flex items-center gap-3">
                                        {cat.icon}
                                        <span className="text-xl font-bold text-zinc-800 tracking-tight">{cat.label}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => openEditModal(item)} title="Editar">
                                            <Pencil className="text-zinc-500" size={18} />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setDeleteItem(item)} title="Excluir">
                                            <Trash2 className="text-red-500" size={18} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-1">
                                    <span className="text-base text-zinc-700 font-medium">{item.name}</span>
                                    <span className="text-sm text-zinc-500 italic mb-1">{item.description ? item.description : "Sem descrição."}</span>
                                    <span className="font-bold text-orange-700 text-lg">R$ {formatPrice(item.price)}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <span className="text-sm text-zinc-400">Nenhum item encontrado.</span>
                )}
            </div>

            {/* Modal de edição - fora do map */}
            <Dialog open={!!editItem} onOpenChange={open => { if (!open) { setEditItem(null); resetEdit(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="flex flex-col gap-4">
                        <div>
                            <Label>Nome</Label>
                            <Input {...registerEdit("name")} />
                            {!!errorsEdit?.name && <p className="text-sm text-red-500">{errorsEdit.name?.message}</p>}
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Input {...registerEdit("description")} />
                            {!!errorsEdit?.description && <p className="text-sm text-red-500">{errorsEdit.description?.message}</p>}
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
                                value={watchEdit("price")}
                                onValueChange={(value) => setValueEdit("price", value ?? "")}
                                className="w-full border border-input rounded-md px-3 py-2 text-sm"
                            />
                            {!!errorsEdit?.price && <p className="text-sm text-red-500">{errorsEdit.price?.message}</p>}
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <Select value={watchEdit("type")} onValueChange={val => setValueEdit("type", val as FormData["type"])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BURGUER">Lanche</SelectItem>
                                    <SelectItem value="DRINK">Bebida</SelectItem>
                                    <SelectItem value="APPETIZER">Porção</SelectItem>
                                </SelectContent>
                            </Select>
                            {!!errorsEdit?.type && <p className="text-sm text-red-500">{errorsEdit.type?.message}</p>}
                        </div>
                        <Button type="submit" className="bg-[#D35400] hover:bg-[#b43e00] font-bold">Salvar</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmação de exclusão - fora do map */}
            <Dialog open={!!deleteItem} onOpenChange={open => { if (!open) setDeleteItem(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Item</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">Tem certeza que deseja excluir o item <b>{deleteItem?.name}</b>?</div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancelar</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Excluir</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Separator className="my-12" />
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#D35400] drop-shadow-sm mb-1">Adicionais</h2>
                    <p className="text-zinc-500 text-base">Gerencie os adicionais disponíveis para os pedidos</p>
                </div>
                <Dialog open={openAddition} onOpenChange={setOpenAddition}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D35400] hover:bg-[#b43e00] shadow-lg px-6 py-3 rounded-full text-lg font-bold">
                            <Plus className="mr-2" size={20} />
                            Novo Adicional
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Adicional</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitAddition(onSubmitAddition)} className="flex flex-col gap-4">
                            <div>
                                <Label>Nome</Label>
                                <Input {...registerAddition("name")} />
                                {errorsAddition.name && <p className="text-sm text-red-500">{errorsAddition.name.message}</p>}
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
                                    value={watchAddition('price')}
                                    onValueChange={(value) => setValueAddition('price', value ?? '')}
                                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                                />
                                {errorsAddition.price && <p className="text-sm text-red-500">{errorsAddition.price.message}</p>}
                            </div>
                            <Button type="submit" className="bg-[#D35400] text-white font-bold">Salvar</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {additions.length > 0 ? (
                    additions.map((addition) => (
                        <div key={addition.id} className="rounded-2xl shadow-md border bg-gradient-to-br from-orange-50 to-orange-100 p-0 flex flex-col min-h-[120px]">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-orange-200/40">
                                <Plus className="text-orange-500" />
                                <span className="text-lg font-bold text-zinc-800 tracking-tight">{addition.name}</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center px-6 py-4">
                                <span className="font-bold text-orange-700 text-lg">R$ {formatPrice(addition.price)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-zinc-400">Nenhum adicional.</span>
                )}
            </div>
        </div>
    );
}
