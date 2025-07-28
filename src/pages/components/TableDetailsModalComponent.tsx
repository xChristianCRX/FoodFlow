import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, List, Loader2, User, Utensils, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";

interface Table {
    tableNumber: number;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLOSED";
}

interface TableOrder {
    id: string;
    item: { name: string; price: number };
    additions: { id: string; name: string; price: number }[];
    waiter: { name: string };
    observations: string;
}

interface OrderHistory {
    id: string;
    tableOrders: TableOrder[];
    createdAt: string;
}

interface TableDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTable: Table | null;
    orderDetails: OrderHistory[];
    loadingOrder: boolean;
    onAddOrder: (table: Table) => void;
    onFinishOrder: () => Promise<void>;
}

const statusLabel = {
    AVAILABLE: "Disponível",
    OCCUPIED: "Ocupada",
    RESERVED: "Reservada",
    CLOSED: "Encerrada",
};

const calculateOrderTotal = (order: TableOrder) => {
    const itemPrice = order.item.price;
    const additionsTotal = order.additions.reduce((sum, addition) => sum + addition.price, 0);
    return itemPrice + additionsTotal;
};

const calculateHistoryTotal = (orderHistory: OrderHistory) => {
    return orderHistory.tableOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
};

const calculateTotalOrders = (orderHistories: OrderHistory[]) => {
    return orderHistories.reduce((sum, history) => sum + calculateHistoryTotal(history), 0);
};

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) {
        return 'Agora';
    }

    try {
        const date = parseISO(dateStr);
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
        console.error('Erro ao formatar data:', dateStr, e);
        return 'Agora';
    }
};

export function TableDetailsModalComponent({
    isOpen,
    onClose,
    selectedTable,
    orderDetails,
    loadingOrder,
    onAddOrder,
    onFinishOrder
}: TableDetailsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedTable ? (
                            <span>
                                <Utensils className="inline mr-2 text-orange-500" />
                                Mesa <span className="font-bold">{selectedTable.tableNumber}</span> - {statusLabel[selectedTable.status]}
                            </span>
                        ) : (
                            "Detalhes da Mesa"
                        )}
                    </DialogTitle>
                </DialogHeader>
                <Separator className="my-2" />
                {selectedTable?.status === "OCCUPIED" ? (
                    loadingOrder ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="animate-spin text-orange-500 mb-2" size={32} />
                            <span className="text-orange-500 font-medium">Carregando pedidos ativos...</span>
                        </div>
                    ) : orderDetails && orderDetails.length > 0 ? (
                        <div className="space-y-8">
                            <div className="space-y-6">
                                {/* Resumo do total */}
                                <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-100">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-orange-900">Total da Mesa</span>
                                            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                {orderDetails.length} {orderDetails.length === 1 ? 'pedido' : 'pedidos'}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-orange-700">
                                            R$ {formatPrice(calculateTotalOrders(orderDetails))}
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex gap-4">
                                    <Button
                                        className="bg-[#D35400] text-white font-bold flex-1 py-6"
                                        onClick={() => onAddOrder(selectedTable)}
                                    >
                                        + Adicionar Pedido
                                    </Button>
                                    <Button
                                        className="bg-green-700 text-white font-bold flex-1 py-6"
                                        onClick={onFinishOrder}
                                    >
                                        Finalizar Pedido
                                    </Button>
                                </div>
                            </div>
                            {orderDetails.map((orderHistory) => (
                                <div key={orderHistory.id} className="space-y-4 border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-bold flex items-center gap-2">
                                                <List className="text-orange-500" />Itens do Pedido
                                            </h2>
                                            <div className="text-lg font-bold text-orange-700">
                                                Total: R$ {formatPrice(calculateHistoryTotal(orderHistory))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600 bg-orange-50/50 px-3 py-1.5 rounded-md">
                                            <Clock size={14} className="text-orange-500" />
                                            <span>
                                                {orderHistory.createdAt
                                                    ? `Pedido feito em ${formatDateTime(orderHistory.createdAt)}`
                                                    : "Pedido em andamento"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {orderHistory.tableOrders.map((order) => (
                                            <div key={order.id} className="rounded-lg border p-4 bg-orange-50/60 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-orange-900">{order.item.name}</span>
                                                    <span className="text-orange-700 font-bold">
                                                        R$ {formatPrice(order.item.price)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-zinc-700 mb-2">
                                                    <User className="text-zinc-500" size={16} />
                                                    Garçom: <span className="font-semibold text-orange-700">{order.waiter?.name || "-"}</span>
                                                </div>
                                                {order.additions.length > 0 && (
                                                    <div className="border-t border-orange-100 pt-2 mt-2">
                                                        <div className="text-sm text-zinc-700 font-medium mb-1">Adicionais:</div>
                                                        <div className="space-y-1 pl-4">
                                                            {order.additions.map(addition => (
                                                                <div key={addition.id} className="text-sm flex justify-between">
                                                                    <span className="text-zinc-600">{addition.name}</span>
                                                                    <span className="text-orange-600">+ R$ {formatPrice(addition.price)}</span>
                                                                </div>
                                                            ))}
                                                            <div className="border-t border-orange-100 pt-1 mt-1">
                                                                <div className="text-sm font-medium flex justify-between">
                                                                    <span>Total do item:</span>
                                                                    <span className="text-orange-700">R$ {formatPrice(calculateOrderTotal(order))}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {order.observations && (
                                                    <div className="text-xs text-zinc-500 italic mt-2 border-t border-orange-100 pt-2">
                                                        Obs: {order.observations}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                            <AlertCircle className="mb-2" size={32} />
                            <span>Nenhum pedido ativo encontrado para esta mesa.</span>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                        <Utensils size={32} className="mb-2" />
                        <span>Esta mesa está {statusLabel[selectedTable?.status || "AVAILABLE"]?.toLowerCase()}.</span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
