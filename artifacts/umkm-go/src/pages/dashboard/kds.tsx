import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, CheckCircle, Bell, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "new" | "preparing" | "ready";

interface KDSOrder {
  id: string;
  table: string;
  type: string;
  items: { name: string; qty: number; notes?: string }[];
  status: OrderStatus;
  time: Date;
}

const MOCK_ORDERS: KDSOrder[] = [
  {
    id: "ORD-001",
    table: "A3",
    type: "Dine-in",
    items: [
      { name: "Ayam Bakar", qty: 2, notes: "Pedas banget" },
      { name: "Es Teh Manis", qty: 2 },
      { name: "Nasi Putih", qty: 2 },
    ],
    status: "new",
    time: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "ORD-002",
    table: "B1",
    type: "Dine-in",
    items: [
      { name: "Mie Goreng Spesial", qty: 1 },
      { name: "Jus Alpukat", qty: 1, notes: "Gula sedikit" },
    ],
    status: "preparing",
    time: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: "ORD-003",
    table: "Takeaway",
    type: "Bawa Pulang",
    items: [
      { name: "Paket Ayam Geprek", qty: 3 },
      { name: "Teh Botol", qty: 3 },
    ],
    status: "preparing",
    time: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: "ORD-004",
    table: "C2",
    type: "Dine-in",
    items: [
      { name: "Soto Ayam", qty: 2 },
      { name: "Kerupuk", qty: 2 },
    ],
    status: "ready",
    time: new Date(Date.now() - 18 * 60 * 1000),
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; next: OrderStatus | null; nextLabel: string }> = {
  new: { label: "Pesanan Baru", color: "text-red-700", bg: "bg-red-50 border-red-300", next: "preparing", nextLabel: "Mulai Buat" },
  preparing: { label: "Sedang Dibuat", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300", next: "ready", nextLabel: "Siap Disajikan" },
  ready: { label: "Siap Disajikan", color: "text-green-700", bg: "bg-green-50 border-green-300", next: null, nextLabel: "" },
};

function elapsedTime(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Baru saja";
  return `${mins} menit lalu`;
}

function OrderCard({ order, onStatusChange }: { order: KDSOrder; onStatusChange: (id: string, status: OrderStatus) => void }) {
  const [elapsed, setElapsed] = useState(elapsedTime(order.time));
  const cfg = STATUS_CONFIG[order.status];
  const mins = Math.floor((Date.now() - order.time.getTime()) / 60000);
  const isLate = mins > 15;

  useEffect(() => {
    const t = setInterval(() => setElapsed(elapsedTime(order.time)), 30000);
    return () => clearInterval(t);
  }, [order.time]);

  return (
    <div className={`rounded-2xl border-2 p-4 ${cfg.bg} ${isLate && order.status !== "ready" ? "ring-2 ring-red-400 ring-offset-2" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{order.table}</span>
            <span className="text-xs text-gray-500 font-medium">{order.type}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className={`h-3 w-3 ${isLate ? "text-red-500" : "text-gray-400"}`} />
            <span className={`text-xs ${isLate && order.status !== "ready" ? "text-red-600 font-semibold" : "text-gray-400"}`}>
              {elapsed} {isLate && order.status !== "ready" ? "⚠️" : ""}
            </span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.color} ${order.status === "new" ? "bg-red-100" : order.status === "preparing" ? "bg-yellow-100" : "bg-green-100"}`}>
          {cfg.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="bg-white/70 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{item.name}</span>
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">×{item.qty}</span>
            </div>
            {item.notes && (
              <p className="text-xs text-orange-600 mt-0.5 font-medium">📝 {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {cfg.next && (
        <Button
          className={`w-full font-bold ${order.status === "new" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
          onClick={() => onStatusChange(order.id, cfg.next!)}
        >
          {order.status === "ready" ? <CheckCircle className="h-4 w-4 mr-2" /> : <ChefHat className="h-4 w-4 mr-2" />}
          {cfg.nextLabel}
        </Button>
      )}
      {order.status === "ready" && (
        <div className="flex items-center justify-center gap-2 py-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-bold">Siap Disajikan!</span>
        </div>
      )}
    </div>
  );
}

export default function KDSPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<KDSOrder[]>(MOCK_ORDERS);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    const labels: Record<OrderStatus, string> = { new: "Baru", preparing: "Diproses", ready: "Siap" };
    toast({ title: `Pesanan diperbarui ke: ${labels[newStatus]}` });
  };

  const counts = {
    new: orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dapur (KDS)</h1>
            <p className="text-sm text-gray-500">Kitchen Display System — antrian pesanan real-time</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Pesanan diperbarui" })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pesanan Baru", count: counts.new, color: "bg-red-100 text-red-700 border-red-200", status: "new" as OrderStatus },
            { label: "Sedang Dibuat", count: counts.preparing, color: "bg-yellow-100 text-yellow-700 border-yellow-200", status: "preparing" as OrderStatus },
            { label: "Siap Saji", count: counts.ready, color: "bg-green-100 text-green-700 border-green-200", status: "ready" as OrderStatus },
          ].map((s) => (
            <button
              key={s.status}
              onClick={() => setFilter(filter === s.status ? "all" : s.status)}
              className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${s.color} ${filter === s.status ? "ring-2 ring-offset-1 ring-current" : ""}`}
            >
              <p className="text-3xl font-black">{s.count}</p>
              <p className="text-xs mt-1">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Order Grid */}
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ChefHat className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Tidak ada pesanan</p>
            <p className="text-gray-300 text-sm mt-1">Pesanan baru akan muncul di sini secara otomatis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
