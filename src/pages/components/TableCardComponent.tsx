import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Utensils } from "lucide-react";

interface Table {
    tableNumber: number;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLOSED";
}

interface TableCardProps {
    table: Table;
    onClick: (table: Table) => void;
}

const statusColors = {
    AVAILABLE: "bg-gradient-to-br from-green-200 to-green-100 border-green-500",
    OCCUPIED: "bg-gradient-to-br from-orange-200 to-orange-100 border-orange-500",
    RESERVED: "bg-gradient-to-br from-yellow-200 to-yellow-100 border-yellow-500",
    CLOSED: "bg-gradient-to-br from-zinc-200 to-zinc-100 border-zinc-400",
};

const statusLabel = {
    AVAILABLE: "Disponível",
    OCCUPIED: "Ocupada",
    RESERVED: "Reservada",
    CLOSED: "Encerrada",
};

export function TableCardComponent({ table, onClick }: TableCardProps) {
    return (
        <Card
            className={`border-2 ${statusColors[table.status]} hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer relative group`}
            onClick={() => onClick(table)}
        >
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-[#3E2C1C] flex items-center gap-2">
                    <Utensils className="text-orange-500" />
                    {table.tableNumber}
                </CardTitle>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${table.status === "AVAILABLE"
                        ? "bg-green-500 text-white"
                        : table.status === "OCCUPIED"
                            ? "bg-orange-500 text-white"
                            : table.status === "RESERVED"
                                ? "bg-yellow-500 text-white"
                                : "bg-zinc-500 text-white"
                    }`}>
                    {statusLabel[table.status]}
                </span>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    {table.status === "OCCUPIED" && (
                        <span className="text-sm text-orange-700 font-medium flex items-center gap-1 animate-pulse">
                            <Loader2 size={16} className="animate-spin" /> Pedido em andamento
                        </span>
                    )}
                    {table.status === "AVAILABLE" && (
                        <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                            <Utensils size={16} /> Livre para novos clientes
                        </span>
                    )}
                    {table.status === "RESERVED" && (
                        <span className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                            <User size={16} /> Reservada
                        </span>
                    )}
                    {table.status === "CLOSED" && (
                        <span className="text-sm text-zinc-500 font-medium flex items-center gap-1">
                            <Utensils size={16} /> Encerrada
                        </span>
                    )}
                </div>
            </CardContent>
            <div className="absolute inset-0 rounded-xl border-4 border-transparent group-hover:border-orange-400 transition-all pointer-events-none"></div>
        </Card>
    );
}
