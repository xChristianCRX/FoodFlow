import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { TableCardComponent } from "./components/TableCardComponent";
import { NewTableDialog } from "./components/NewTableDialog";
import { TableDetailsModalComponent } from "./components/TableDetailsModalComponent";
import { OrderFormComponent } from "./components/OrderFormComponent";

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

interface MenuItem {
    id: string;
    name: string;
    price: number;
    type: "BURGER" | "DRINK" | "PORTION";
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

export default function Tables() {
    const [tables, setTables] = useState<Table[]>([]);
    const [newTableNumber, setNewTableNumber] = useState("");
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderHistory[]>([]);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [additions, setAdditions] = useState<Addition[]>([]);
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [creatingOrderFor, setCreatingOrderFor] = useState<Table | null>(null);
    const [savingOrder, setSavingOrder] = useState(false);

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

    useEffect(() => {
        if (showOrderModal) {
            api.get("/menu").then(res => setMenu(res.data));
            api.get("/addition").then(res => setAdditions(res.data));
            api.get("/person").then(res => setWaiters(res.data));
        }
    }, [showOrderModal]);

    const openOrderModal = (table: Table | null = null) => {
        setCreatingOrderFor(table);
        setShowOrderModal(true);
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setCreatingOrderFor(null);
    };

    const fetchOrderDetails = async (tableNumber: number) => {
        try {
            const res = await api.get(`/orders/active/${tableNumber}`);
            setOrderDetails(Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []));
        } catch (e) {
            setOrderDetails([]);
        }
    };

    const onSubmitOrder = async (data: OrderForm) => {
        if (!creatingOrderFor) return;
        setSavingOrder(true);
        try {
            const payload = {
                tableNumber: { tableNumber: creatingOrderFor.tableNumber },
                tableOrders: data.items.map(item => ({
                    item: { id: item.itemId },
                    additions: item.additions.map(id => ({ id })),
                    waiter: { id: data.waiterId },
                    observations: item.observations,
                })),
            };
            await api.post("/orders", payload);
            toast.success("Pedido criado com sucesso!");

            // Atualiza os detalhes do pedido se estiver adicionando a uma mesa ocupada
            if (creatingOrderFor.status === "OCCUPIED") {
                await fetchOrderDetails(creatingOrderFor.tableNumber);
            }

            closeOrderModal();
            fetchTables();
        } catch (e) {
            toast.error("Erro ao criar pedido");
        } finally {
            setSavingOrder(false);
        }
    };

    const handleTableClick = async (table: Table) => {
        setSelectedTable(table);
        setOrderDetails([]);
        setModalOpen(true);
        if (table.status === "OCCUPIED") {
            setLoadingOrder(true);
            try {
                const res = await api.get(`/orders/active/${table.tableNumber}`);
                const orders = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
                setOrderDetails(orders);
            } catch (e) {
                setOrderDetails([]);
            } finally {
                setLoadingOrder(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-extrabold text-[#3E2C1C] tracking-tight drop-shadow-sm">Mesas do Salão</h1>
                <NewTableDialog
                    newTableNumber={newTableNumber}
                    onTableNumberChange={setNewTableNumber}
                    onCreateTable={handleCreateTable}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {tables.map((table) => (
                    <TableCardComponent
                        key={table.tableNumber}
                        table={table}
                        onClick={handleTableClick}
                    />
                ))}
            </div>

            <TableDetailsModalComponent
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedTable={selectedTable}
                orderDetails={orderDetails}
                loadingOrder={loadingOrder}
                onAddOrder={(table) => openOrderModal(table)}
                onFinishOrder={async () => {
                    if (!selectedTable) return;

                    try {
                        await api.post(`/orders/finish/${selectedTable.tableNumber}`);
                        toast.success("Pedido finalizado e mesa liberada!");
                        setModalOpen(false);
                        setSelectedTable(null);
                        fetchTables();
                    } catch (e) {
                        toast.error("Erro ao finalizar pedido. Tente novamente.");
                    }
                }}
            />

            <OrderFormComponent
                isOpen={showOrderModal}
                onClose={closeOrderModal}
                onSubmit={onSubmitOrder}
                tables={tables}
                menu={menu}
                additions={additions}
                waiters={waiters}
                creatingOrderFor={creatingOrderFor}
                setCreatingOrderFor={setCreatingOrderFor}
                savingOrder={savingOrder}
                mode={creatingOrderFor?.status === "OCCUPIED" ? 'additional' : 'new'}
            />

            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    className="bg-[#D35400] text-white font-bold shadow-lg px-6 py-3 rounded-full text-lg hover:scale-105 hover:bg-[#b43e00]"
                    onClick={() => openOrderModal()}
                    disabled={!tables.some(t => t.status === "AVAILABLE")}
                >
                    + Novo Pedido
                </Button>
            </div>
        </div>
    );
}