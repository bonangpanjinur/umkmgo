import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  QrCode,
  ShoppingCart,
  Truck,
  Utensils,
  Bell,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useListOrders, useUpdateOrder } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const AUTH = () => ({
  request: { headers: { Authorization: `Bearer ${getToken()}` } },
});

const POLL_INTERVAL = 10_000;
const WARN_MINS = 10;
const LATE_MINS = 15;

type KDSStatus = "new" | "preparing" | "ready";

interface KDSOrder {
  id: string;
  tableNumber: string | null;
  source: string | null;
  buyerName: string;
  items: { name: string; quantity: number; qty?: number; notes?: string }[];
  status: KDSStatus;
  time: Date;
  notes: string | null;
}

const COLUMN_CONFIG: Record<
  KDSStatus,
  {
    label: string;
    icon: any;
    headerBg: string;
    cardBg: string;
    cardBorder: string;
    badgeColor: string;
    badgeBg: string;
    actionLabel: string;
    actionClass: string;
    nextStatus: KDSStatus | null;
    nextApiStatus: string;
  }
> = {
  new: {
    label: "Pesanan Baru",
    icon: Bell,
    headerBg: "bg-red-500",
    cardBg: "bg-red-50",
    cardBorder: "border-red-200",
    badgeColor: "text-red-700",
    badgeBg: "bg-red-100",
    actionLabel: "Mulai Masak",
    actionClass: "bg-amber-500 hover:bg-amber-600 text-white",
    nextStatus: "preparing",
    nextApiStatus: "processing",
  },
  preparing: {
    label: "Sedang Dimasak",
    icon: ChefHat,
    headerBg: "bg-amber-500",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    badgeColor: "text-amber-700",
    badgeBg: "bg-amber-100",
    actionLabel: "Siap Antar",
    actionClass: "bg-green-500 hover:bg-green-600 text-white",
    nextStatus: "ready",
    nextApiStatus: "shipped",
  },
  ready: {
    label: "Siap Disajikan",
    icon: CheckCircle2,
    headerBg: "bg-green-500",
    cardBg: "bg-green-50",
    cardBorder: "border-green-200",
    badgeColor: "text-green-700",
    badgeBg: "bg-green-100",
    actionLabel: "Selesai",
    actionClass: "bg-gray-700 hover:bg-gray-800 text-white",
    nextStatus: null,
    nextApiStatus: "completed",
  },
};

function apiStatusToKDS(status: string): KDSStatus {
  if (status === "processing") return "preparing";
  if (status === "shipped") return "ready";
  return "new";
}

function parseItems(items: any) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try {
    return JSON.parse(items);
  } catch {
    return [];
  }
}

function getSourceLabel(source: string | null, tableNumber: string | null) {
  if (source === "qr_table" || tableNumber) return "QR Meja";
  if (source === "pos") return "Kasir";
  if (source === "storefront") return "Online";
  if (source === "whatsapp") return "WhatsApp";
  return "Manual";
}

function getSourceIcon(source: string | null, tableNumber: string | null) {
  if (source === "qr_table" || tableNumber) return QrCode;
  if (source === "pos") return ShoppingCart;
  if (source === "whatsapp" || source === "storefront") return Truck;
  return Utensils;
}

function ElapsedTimer({ time }: { time: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () =>
      setElapsed(Math.floor((Date.now() - time.getTime()) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [time]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isWarn = mins >= WARN_MINS;
  const isLate = mins >= LATE_MINS;

  const label =
    mins === 0
      ? `${secs}d`
      : `${mins}m ${secs.toString().padStart(2, "0")}d`;

  return (
    <span
      className={`text-xs font-mono font-bold tabular-nums ${
        isLate
          ? "text-red-600"
          : isWarn
          ? "text-amber-600"
          : "text-gray-400"
      }`}
    >
      {label}
      {isLate ? " ⚠️" : ""}
    </span>
  );
}

function CountdownBar({ interval, lastRefresh }: { interval: number; lastRefresh: number }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - lastRefresh;
      const pct = Math.max(0, 100 - (elapsed / interval) * 100);
      setProgress(pct);
    };
    update();
    const t = setInterval(update, 200);
    return () => clearInterval(t);
  }, [interval, lastRefresh]);

  return (
    <div className="h-1 bg-gray-100 rounded-full overflow-hidden w-32">
      <div
        className="h-full bg-primary transition-all duration-200 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function OrderCard({
  order,
  onAction,
  isUpdating,
  isFullscreen,
}: {
  order: KDSOrder;
  onAction: (id: string, nextApiStatus: string) => void;
  isUpdating: boolean;
  isFullscreen: boolean;
}) {
  const cfg = COLUMN_CONFIG[order.status];
  const mins = Math.floor((Date.now() - order.time.getTime()) / 60000);
  const isLate = mins >= LATE_MINS && order.status !== "ready";
  const SourceIcon = getSourceIcon(order.source, order.tableNumber);
  const sourceLabel = getSourceLabel(order.source, order.tableNumber);
  const isQR = order.source === "qr_table" || !!order.tableNumber;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -12 }}
      transition={{ duration: 0.22 }}
      className={`rounded-2xl border-2 ${cfg.cardBg} ${cfg.cardBorder} ${
        isLate ? "ring-2 ring-red-400 ring-offset-2 animate-pulse" : ""
      } overflow-hidden`}
    >
      {/* Card header */}
      <div className={`px-4 pt-4 pb-3 ${isFullscreen ? "px-5 pt-5" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Table / source */}
            <div className="flex items-center gap-2 flex-wrap">
              {order.tableNumber ? (
                <span className={`text-2xl font-black text-gray-900 ${isFullscreen ? "text-3xl" : ""}`}>
                  Meja {order.tableNumber}
                </span>
              ) : (
                <span className={`text-lg font-bold text-gray-700 ${isFullscreen ? "text-xl" : ""}`}>
                  {sourceLabel}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isQR
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <SourceIcon className="w-3 h-3" />
                {sourceLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {order.buyerName}
            </p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              #{order.id.slice(-6).toUpperCase()}
            </p>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Clock className={`w-3 h-3 ${isLate ? "text-red-500" : "text-gray-400"}`} />
              <ElapsedTimer time={order.time} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`mx-4 border-t ${cfg.cardBorder}`} />

      {/* Items */}
      <div className={`px-4 py-3 space-y-2 ${isFullscreen ? "px-5 py-4 space-y-2.5" : ""}`}>
        {order.items.map((item, i) => {
          const qty = item.quantity ?? item.qty ?? 1;
          return (
            <div
              key={i}
              className="flex items-start justify-between gap-3 bg-white/70 rounded-xl px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-gray-900 leading-tight ${isFullscreen ? "text-base" : "text-sm"}`}>
                  {item.name}
                </p>
                {item.notes && (
                  <p className="text-xs text-orange-600 mt-0.5">
                    📝 {item.notes}
                  </p>
                )}
              </div>
              <span
                className={`flex-shrink-0 font-black text-white rounded-full flex items-center justify-center ${
                  isFullscreen
                    ? "w-8 h-8 text-base bg-gray-800"
                    : "w-6 h-6 text-xs bg-gray-800"
                }`}
              >
                {qty}
              </span>
            </div>
          );
        })}

        {order.notes && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <p className="text-xs text-orange-700 font-medium">
              📋 {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className={`px-4 pb-4 ${isFullscreen ? "px-5 pb-5" : ""}`}>
        {order.status === "ready" ? (
          <button
            onClick={() => onAction(order.id, cfg.nextApiStatus)}
            disabled={isUpdating}
            className={`w-full ${isFullscreen ? "py-3 text-base" : "py-2.5 text-sm"} rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${cfg.actionClass}`}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Tandai Selesai
          </button>
        ) : (
          <button
            onClick={() => onAction(order.id, cfg.nextApiStatus)}
            disabled={isUpdating}
            className={`w-full ${isFullscreen ? "py-3 text-base" : "py-2.5 text-sm"} rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${cfg.actionClass}`}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : cfg.nextStatus === "preparing" ? (
              <ChefHat className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {cfg.actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function KDSColumn({
  status,
  orders,
  onAction,
  updatingId,
  isFullscreen,
}: {
  status: KDSStatus;
  orders: KDSOrder[];
  onAction: (id: string, nextApiStatus: string) => void;
  updatingId: string | null;
  isFullscreen: boolean;
}) {
  const cfg = COLUMN_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div
        className={`${cfg.headerBg} text-white rounded-t-2xl px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-bold text-sm">{cfg.label}</span>
        </div>
        <span className="bg-white/20 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className={`flex-1 bg-gray-100/60 rounded-b-2xl p-3 space-y-3 overflow-y-auto ${
          isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[240px] max-h-[calc(100vh-260px)]"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-gray-300"
            >
              <Icon className="w-10 h-10 mb-2" />
              <p className="text-xs font-medium">Tidak ada pesanan</p>
            </motion.div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={onAction}
                isUpdating={updatingId === order.id}
                isFullscreen={isFullscreen}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KDSPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastRefreshRef = useRef(Date.now());
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const { data, isLoading, refetch } = useListOrders(
    { limit: 100 },
    {
      request: AUTH().request,
      query: {
        refetchInterval: POLL_INTERVAL,
        queryKey: ["/api/orders", "kds"],
        refetchIntervalInBackground: false,
        staleTime: 5000,
      },
    }
  );

  useEffect(() => {
    const t = setInterval(() => {
      lastRefreshRef.current = Date.now();
      setLastRefresh(Date.now());
    }, POLL_INTERVAL);
    return () => clearInterval(t);
  }, []);

  const updateOrderMutation = useUpdateOrder(AUTH());

  const allOrders: KDSOrder[] = (data?.data ?? [])
    .filter((o) =>
      ["pending", "processing", "shipped"].includes(o.status)
    )
    .map((o) => ({
      id: o.id,
      tableNumber: (o as any).tableNumber ?? null,
      source: (o as any).source ?? null,
      buyerName: o.buyerName,
      items: parseItems(o.items),
      status: apiStatusToKDS(o.status),
      time: new Date(o.createdAt),
      notes: o.notes ?? null,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const byStatus: Record<KDSStatus, KDSOrder[]> = {
    new: allOrders.filter((o) => o.status === "new"),
    preparing: allOrders.filter((o) => o.status === "preparing"),
    ready: allOrders.filter((o) => o.status === "ready"),
  };

  const handleAction = useCallback(
    async (id: string, nextApiStatus: string) => {
      setUpdatingId(id);
      try {
        await updateOrderMutation.mutateAsync({
          id,
          data: { status: nextApiStatus as any },
        });
        await queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

        const label =
          nextApiStatus === "processing"
            ? "Sedang dimasak"
            : nextApiStatus === "shipped"
            ? "Siap disajikan"
            : "Selesai";
        toast({ title: `✅ ${label}` });
      } catch {
        toast({
          title: "Gagal memperbarui pesanan",
          variant: "destructive",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [updateOrderMutation, queryClient, toast]
  );

  const handleRefresh = useCallback(() => {
    refetch();
    setLastRefresh(Date.now());
  }, [refetch]);

  const totalActive = allOrders.length;

  return (
    <DashboardLayout>
      <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-gray-100 p-4 overflow-auto" : ""}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-gray-900 ${isFullscreen ? "text-3xl" : "text-xl md:text-2xl"}`}>
                Dapur (KDS)
              </h1>
              {totalActive > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {totalActive} aktif
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Kitchen Display System — antrian pesanan real-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown bar */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CountdownBar interval={POLL_INTERVAL} lastRefresh={lastRefresh} />
              <span>auto-refresh</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar layar penuh" : "Layar penuh (untuk monitor dapur)"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && allOrders.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Memuat pesanan...</p>
            </div>
          </div>
        ) : (
          /* Kanban columns */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["new", "preparing", "ready"] as KDSStatus[]).map((status) => (
              <KDSColumn
                key={status}
                status={status}
                orders={byStatus[status]}
                onAction={handleAction}
                updatingId={updatingId}
                isFullscreen={isFullscreen}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && totalActive === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <ChefHat className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-semibold">
              Dapur bersih!
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Pesanan baru akan muncul otomatis di sini
            </p>
          </div>
        )}

        {!isFullscreen && (
          <p className="text-xs text-gray-400 text-center pb-2">
            Diperbarui otomatis setiap {POLL_INTERVAL / 1000} detik ·{" "}
            <button
              onClick={() => setIsFullscreen(true)}
              className="underline underline-offset-2 hover:text-gray-600"
            >
              Buka layar penuh untuk monitor dapur
            </button>
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
