import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { TableCardComponent } from "../components/TableCardComponent";
import { NewTableDialog } from "../components/NewTableDialog";
import { TableDetailsModalComponent } from "../components/TableDetailsModalComponent";
import { OrderFormComponent } from "../components/OrderFormComponent";
import { Utensils } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const response = await api.get("/table");
      setTables(response.data);
    } catch {
      toast.error("Erro ao buscar as mesas.");
    } finally {
      setLoading(false);
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
      api.get("/menu").then((res) => setMenu(res.data));
      api.get("/addition").then((res) => setAdditions(res.data));
      api.get("/person").then((res) => setWaiters(res.data));
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
      setOrderDetails(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
    } catch {
      setOrderDetails([]);
    }
  };

  const onSubmitOrder = async (data: OrderForm) => {
    if (!creatingOrderFor) return;
    setSavingOrder(true);
    try {
      const payload = {
        tableNumber: { tableNumber: creatingOrderFor.tableNumber },
        tableOrders: data.items.map((item) => ({
          item: { id: item.itemId },
          additions: item.additions.map((id) => ({ id })),
          waiter: { id: data.waiterId },
          observations: item.observations,
        })),
      };
      await api.post("/orders", payload);
      toast.success("Pedido criado com sucesso!");

      if (creatingOrderFor.status === "OCCUPIED") {
        await fetchOrderDetails(creatingOrderFor.tableNumber);
      }

      closeOrderModal();
      fetchTables();
    } catch {
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
        const orders = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        setOrderDetails(orders);
      } catch {
        setOrderDetails([]);
      } finally {
        setLoadingOrder(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <Utensils size={28} className="text-[#D35400]" />
          <h1 className="text-3xl font-bold text-[#3E2C1C]">Mesas do Salão</h1>
        </div>
        <NewTableDialog
          newTableNumber={newTableNumber}
          onTableNumberChange={setNewTableNumber}
          onCreateTable={handleCreateTable}
        />
      </div>

      {/* GRID DE MESAS */}
      {loading ? (
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {tables.map((table) => (
            <TableCardComponent key={table.tableNumber} table={table} onClick={handleTableClick} />
          ))}
        </div>
      )}

      {/* MODAIS */}
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
          } catch {
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
        mode={creatingOrderFor?.status === "OCCUPIED" ? "additional" : "new"}
      />

      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2">
        <Button
          className="bg-[#D35400] text-white shadow-xl w-14 h-14 rounded-full hover:scale-110 transition"
          onClick={() => openOrderModal()}
          disabled={!tables.some((t) => t.status === "AVAILABLE")}
        >
          +
        </Button>
        <span className="text-xs text-[#3E2C1C] font-medium">Novo Pedido</span>
      </div>
    </div>
  );
}
