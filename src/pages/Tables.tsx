import { useEffect, useState } from "react";
import { api } from "@/libs/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { PlusCircle } from "lucide-react";

interface Table {
    tableNumber: number;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLOSED";
}

export default function Tables() {
    const [tables, setTables] = useState<Table[]>([]);
    const [newTableNumber, setNewTableNumber] = useState("");

    const fetchTables = async () => {
        try {
            const response = await api.get("/table");
            setTables(response.data);
        } catch (error) {
            toast.error("Erro ao buscar as mesas.");
        }
    };

    const handleCreateTable = async () => {
        try {
            await api.post("/table", { number: parseInt(newTableNumber) });
            toast.success("Mesa criada com sucesso!");
            setNewTableNumber("");
            fetchTables();
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error("Já existe uma mesa com esse número!");
            } else {
                toast.error("Erro ao cadastrar mesa.");
            }
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const statusColors = {
        AVAILABLE: "bg-green-100 border-green-500",
        OCCUPIED: "bg-red-100 border-red-500",
        RESERVED: "bg-yellow-100 border-yellow-500",
        CLOSED: "bg-zinc-200 border-zinc-400",
    };

    const statusLabel = {
        AVAILABLE: "Disponível",
        OCCUPIED: "Ocupada",
        RESERVED: "Reservada",
        CLOSED: "Encerrada",
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Mesas</h1>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex gap-2 hover:cursor-pointer">
                            <PlusCircle size={18} />
                            Nova Mesa
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar nova mesa</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder="Número da mesa"
                                type="number"
                                value={newTableNumber}
                                onChange={(e) => setNewTableNumber(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleCreateTable}
                                disabled={!newTableNumber}
                                className="hover:cursor-pointer"
                            >
                                Adicionar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <Card
                        key={table.tableNumber}
                        className={`border-2 ${statusColors[table.status]} hover:cursor-pointer`}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg">Mesa {table.tableNumber}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${table.status === "AVAILABLE"
                                        ? "bg-green-500 text-white"
                                        : table.status === "OCCUPIED"
                                            ? "bg-red-500 text-white"
                                            : table.status === "RESERVED"
                                                ? "bg-yellow-500 text-white"
                                                : "bg-zinc-500 text-white"
                                    }`}
                            >
                                {statusLabel[table.status]}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}