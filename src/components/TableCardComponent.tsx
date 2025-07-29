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
  AVAILABLE: "border-green-400",
  OCCUPIED: "border-orange-400",
  RESERVED: "border-yellow-400",
  CLOSED: "border-zinc-400",
};

const statusChip = {
  AVAILABLE: "bg-green-100 text-green-700 border border-green-300",
  OCCUPIED: "bg-orange-100 text-orange-700 border border-orange-300",
  RESERVED: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  CLOSED: "bg-zinc-100 text-zinc-600 border border-zinc-300",
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
      className={`border-2 ${statusColors[table.status]} hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
      onClick={() => onClick(table)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-[#3E2C1C] flex items-center gap-2">
          <Utensils className="text-[#D35400]" size={20} />
          Mesa {table.tableNumber}
        </CardTitle>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip[table.status]}`}
        >
          {statusLabel[table.status]}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 mt-1 text-sm">
          {table.status === "OCCUPIED" && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <Loader2 size={14} className="animate-spin" /> Pedido em andamento
            </span>
          )}
          {table.status === "AVAILABLE" && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Utensils size={14} /> Livre para novos clientes
            </span>
          )}
          {table.status === "RESERVED" && (
            <span className="flex items-center gap-1 text-yellow-600 font-medium">
              <User size={14} /> Reservada
            </span>
          )}
          {table.status === "CLOSED" && (
            <span className="flex items-center gap-1 text-zinc-500 font-medium">
              <Utensils size={14} /> Encerrada
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
