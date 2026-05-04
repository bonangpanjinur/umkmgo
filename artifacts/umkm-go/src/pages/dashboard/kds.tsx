import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useListOrders, useUpdateOrder } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

type KDSStatus = "new" | "preparing" | "ready";

interface KDSOrder {
  id: string;
  table: string;
  type: string;
  items: { name: string; qty: number; notes?: string }[];
  status: KDSStatus;
  time: Date;
  apiStatus: string;
}

const STATUS_CONFIG: Record<KDSStatus, {
  label: string;
  color: string;
  bg: string;
  next: KDSStatus | null;
  nextLabel: string;
  nextApiStatus: string;
}> = {
  new: { label: "Pesanan Baru", color: "text-red-700", bg: "bg-red-50 border-red-300", next: "preparing", nextLabel: "Mulai Buat", nextApiStatus: "processing" },
  preparing: { label: "Sedang Dibuat", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300", next: "ready", nextLabel: "Siap Disajikan", nextApiStatus: "shipped" },
  ready: { label: "Siap Disajikan", color: "text-green-700", bg: "bg-green-50 border-green-300", next: null, nextLabel: "", nextApiStatus: "" },
};

function apiStatusToKDS(status: string): KDSStatus {
  if (status === "processing") return "preparing";
  if (status === "shipped") return "ready";
  return "new";
}

function elapsedTime(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  return `${Math.floor(mins / 60)} jam lalu`;
}

function parseItems(items: any): { name: string; qty: number; notes?: string }[] {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try { return JSON.parse(items); } catch { return []; }
}

function parseNotes(notes?: string | null): string {
  return notes || "";
}

function getTableFromNotes(notes?: string | null, source?: string | null): string {
  if (notes?.includes("Meja:")) {
    const match = notes.match(/Meja:\s*([^\s|]+)/);
    if (match) return match[1];
  }
  if (source === "pos") return "Kasir";
  return "Online";
}

function getTypeFromNotes(notes?: string | null): string {
  if (notes?.toLowerCase().includes("makan di sini") || notes?.includes("Meja:")) return "Dine-in";
  if (notes?.toLowerCase().includes("bawa pulang")) return "Bawa Pulang";
  if (notes?.toLowerCase().includes("antar")) return "Delivery";
  return "—";
}

function OrderCard({ order, onStatusChange, isUpdating }: {
  order: KDSOrder;
  onStatusChange: (id: string, kdsStatus: KDSStatus, apiStatus: string) => void;
  isUpdating: boolean;
}) {
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
          <p className="text-xs text-gray-400 mt-0.5 font-mono">#{order.id.slice(-6).toUpperCase()}</p>
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
          onClick={() => onStatusChange(order.id, cfg.next!, cfg.nextApiStatus)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ChefHat className="h-4 w-4 mr-2" />}
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
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | KDSStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useListOrders(
    { limit: 50 },
    { request: AUTH().request, query: { refetchInterval: 15000, queryKey: ["/api/orders", "kds"] } }
  );

  const updateOrderMutation = useUpdateOrder(AUTH());

  const allOrders = (data?.data ?? [])
    .filter((o) => ["pending", "processing", "shipped"].includes(o.status))
    .map((o): KDSOrder => ({
      id: o.id,
      table: getTableFromNotes(o.notes, o.source),
      type: getTypeFromNotes(o.notes),
      items: parseItems(o.items),
      status: apiStatusToKDS(o.status),
      time: new Date(o.createdAt),
      apiStatus: o.status,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const handleStatusChange = async (id: string, kdsStatus: KDSStatus, apiStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderMutation.mutateAsync({ id, data: { status: apiStatus as any } });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      const labels: Record<KDSStatus, string> = { new: "Baru", preparing: "Diproses", ready: "Siap Disajikan" };
      toast({ title: `✅ Pesanan diperbarui ke: ${labels[kdsStatus]}` });
    } catch {
      toast({ title: "Gagal memperbarui pesanan", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    new: allOrders.filter((o) => o.status === "new").length,
    preparing: allOrders.filter((o) => o.status === "preparing").length,
    ready: allOrders.filter((o) => o.status === "ready").length,
  };

  const visible = filter === "all" ? allOrders : allOrders.filter((o) => o.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dapur (KDS)</h1>
            <p className="text-sm text-gray-500">Kitchen Display System — antrian pesanan real-time</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pesanan Baru", count: counts.new, color: "bg-red-100 text-red-700 border-red-200", status: "new" as KDSStatus },
            { label: "Sedang Dibuat", count: counts.preparing, color: "bg-yellow-100 text-yellow-700 border-yellow-200", status: "preparing" as KDSStatus },
            { label: "Siap Saji", count: counts.ready, color: "bg-green-100 text-green-700 border-green-200", status: "ready" as KDSStatus },
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

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Memuat pesanan...</p>
          </div>
        )}

        {/* Order Grid */}
        {!isLoading && visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <ChefHat className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">
              {allOrders.length === 0 ? "Belum ada pesanan masuk" : "Tidak ada pesanan dengan filter ini"}
            </p>
            <p className="text-gray-300 text-sm mt-1">Pesanan baru dari kasir akan muncul di sini secara otomatis</p>
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                isUpdating={updatingId === order.id}
              />
            ))}
          </div>
        )}

        {/* Auto-refresh notice */}
        <p className="text-xs text-gray-400 text-center">
          Halaman otomatis diperbarui setiap 15 detik
        </p>
      </div>
    </DashboardLayout>
  );
}
