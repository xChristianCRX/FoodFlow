import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";

const createUserSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    username: z.string().min(1, "Usuário é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    role: z.enum(["ADMIN", "CASHIER", "WAITER"]),
});
const editUserSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    username: z.string().min(1, "Usuário é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "CASHIER", "WAITER"]),
});

type UserForm = {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: "ADMIN" | "CASHIER" | "WAITER";
};

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role: "ADMIN" | "CASHIER" | "WAITER";
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        const res = await api.get("/person");
        console.log(res.data);
        setUsers(res.data);
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (open && !editUser) {
            reset({
                name: "",
                username: "",
                email: "",
                password: "",
                role: undefined,
            });
            setRoleValue(undefined);
        }
    }, [open, editUser]);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<UserForm>({
        resolver: zodResolver(editUser ? editUserSchema : createUserSchema),
    });

    const [roleValue, setRoleValue] = useState<"ADMIN" | "CASHIER" | "WAITER" | undefined>(undefined);
    useEffect(() => {
        if (open) {
            setRoleValue(editUser ? editUser.role : undefined);
        }
    }, [open, editUser]);

    const onSubmit = async (data: UserForm) => {
        try {
            if (editUser) {
                const payload = {
                    ...data,
                    id: editUser.id,
                };
                // Se senha estiver vazia, não envie para o backend
                if (!payload.password) {
                    delete payload.password;
                }
                await api.put("/person", payload);
                toast.success("Usuário atualizado com sucesso!");
            } else {
                await api.post("/person", {
                    ...data,
                    role: data.role,
                });
                toast.success("Usuário cadastrado com sucesso!");
            }
            fetchUsers();
            setOpen(false);
            setEditUser(null);
            reset();
        } catch (e: any) {
            if (e.response?.status === 409) {
                toast.error("Usuário ou e-mail já existente!");
            } else {
                toast.error(editUser ? "Erro ao atualizar usuário." : "Erro ao cadastrar usuário.");
            }
        }
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        setOpen(true);
        reset({
            name: user.name,
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
        });
        setRoleValue(user.role);
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            await api.delete(`/person/${deleteUser.id}`);
            toast.success("Usuário removido com sucesso!");
            fetchUsers();
        } catch {
            toast.error("Erro ao remover usuário.");
        }
        setDeleteUser(null);
    };

    const roleLabel = {
        ADMIN: "Administrador",
        CASHIER: "Caixa",
        WAITER: "Garçom",
    };

    // Filtro de busca
    const filteredUsers = users.filter(user => {
        const searchLower = search.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            roleLabel[user.role].toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-2 md:px-8 py-8">
            {/* Barra de ações fixa */}
            <div className="sticky top-0 z-20 backdrop-blur-md pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-orange-100">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#D35400] drop-shadow-sm mb-1">Usuários</h1>
                    <p className="text-zinc-500 text-lg">Gerencie os usuários do sistema</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <Input
                        placeholder="Buscar por nome, usuário, e-mail ou papel..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-80 border-orange-200 shadow-sm"
                    />
                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditUser(null); reset(); } }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#D35400] hover:bg-[#b43e00] shadow-lg px-6 py-3 rounded-full text-lg font-bold">
                                <Plus className="mr-2" size={20} />
                                Novo Usuário
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editUser ? "Editar Usuário" : "Cadastrar Usuário"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                <div>
                                    <Label>Nome</Label>
                                    <Input {...register("name")} />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <Label>Usuário</Label>
                                    <Input {...register("username")} />
                                    {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                                </div>
                                <div>
                                    <Label>E-mail</Label>
                                    <Input {...register("email")} />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <Label>Senha {editUser && <span className="text-xs text-zinc-500">(deixe em branco para não alterar)</span>}</Label>
                                    <Input type="password" {...register("password")} />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                                </div>
                                <div>
                                    <Label>Papel</Label>
                                    <Select
                                        value={roleValue}
                                        onValueChange={val => {
                                            setRoleValue(val as UserForm["role"]);
                                            setValue("role", val as UserForm["role"]);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o papel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="CASHIER">Caixa</SelectItem>
                                            <SelectItem value="WAITER">Garçom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                                </div>
                                <Button type="submit" className="bg-[#D35400] text-white font-bold">Salvar</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                {/* Diálogo de confirmação de remoção */}
                <Dialog open={!!deleteUser} onOpenChange={v => { if (!v) setDeleteUser(null); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remover Usuário</DialogTitle>
                        </DialogHeader>
                        <p>Tem certeza que deseja remover o usuário <b>{deleteUser?.name}</b>?</p>
                        <div className="flex gap-2 justify-end mt-4">
                            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancelar</Button>
                            <Button className="bg-red-600 text-white" onClick={handleDelete}>Remover</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            {/* Grid de usuários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="rounded-2xl shadow-md border bg-gradient-to-br from-orange-50 to-orange-100 p-0 flex flex-col min-h-[160px]">
                            <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-orange-200/40">
                                <div>
                                    <span className="text-lg font-bold text-zinc-800 tracking-tight block mb-1">{user.name}</span>
                                    <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full font-semibold uppercase">{roleLabel[user.role]}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(user)} title="Editar">
                                        <Pencil size={18} />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setDeleteUser(user)} title="Remover">
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-1">
                                <span className="text-sm text-zinc-700">Usuário: <span className="font-semibold">{user.username}</span></span>
                                <span className="text-sm text-zinc-700">E-mail: <span className="font-semibold">{user.email}</span></span>
                            </div>
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-zinc-400">Nenhum usuário cadastrado.</span>
                )}
            </div>
        </div>
    );
} 