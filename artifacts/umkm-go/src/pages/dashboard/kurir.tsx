import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Truck, MapPin, Package, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useListOrders, useUpdateOrder } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQueryClient } from "@tanstack/react-query";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

type StatusKurir = "menunggu" | "diantar" | "selesai";

interface ResiMap {
  [orderId: string]: { noResi: string; ekspedisi: string };
}

const STATUS_CONFIG: Record<StatusKurir, { label: string; color: string }> = {
  menunggu: { label: "Menunggu Pickup", color: "bg-yellow-100 text-yellow-700" },
  diantar: { label: "Sedang Diantar", color: "bg-blue-100 text-blue-700" },
  selesai: { label: "Terkirim", color: "bg-green-100 text-green-700" },
};

const EKSPEDISI = ["Kurir Internal", "JNE", "J&T Express", "SiCepat", "AnterAja", "Pos Indonesia", "GoSend", "GrabExpress"];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function orderToStatus(apiStatus: string): StatusKurir {
  if (apiStatus === "shipped") return "diantar";
  if (apiStatus === "completed") return "selesai";
  return "menunggu";
}

export default function KurirPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showResi, setShowResi] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noResi, setNoResi] = useState("");
  const [ekspedisi, setEkspedisi] = useState("Kurir Internal");
  const [resiMap, setResiMap] = useLocalStorage<ResiMap>("umkm_kurir_resi", {});

  const { data, isLoading, refetch } = useListOrders(
    { page: 1, limit: 50 },
    AUTH()
  );

  const { mutate: updateOrder } = useUpdateOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Status pengiriman diperbarui" });
        refetch();
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      },
      onError: () => toast({ title: "Gagal memperbarui", variant: "destructive" }),
    },
  });

  // Show only delivery orders (not dine-in) that are pending/processing/shipped
  const deliveryOrders = useMemo(() => {
    const orders = data?.data ?? [];
    return orders.filter((o) => {
      const notes = (o.notes ?? "").toLowerCase();
      const source = (o.source ?? "").toLowerCase();
      const isDineIn = notes.includes("makan di sini") || notes.startsWith("meja");
      return !isDineIn && o.status !== "cancelled";
    });
  }, [data]);

  const stats = {
    menunggu: deliveryOrders.filter((o) => o.status === "pending" || o.status === "processing").length,
    proses: deliveryOrders.filter((o) => o.status === "shipped").length,
    selesai: deliveryOrders.filter((o) => o.status === "completed").length,
  };

  const saveResi = () => {
    if (!selectedId) return;
    setResiMap((prev) => ({ ...prev, [selectedId]: { noResi, ekspedisi } }));
    updateOrder({ id: selectedId, data: { status: "shipped" as any } });
    setShowResi(false);
    setNoResi("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kurir & Pengiriman</h1>
          <p className="text-sm text-gray-500">Kelola pengiriman berdasarkan pesanan aktif</p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.menunggu}</p>
            <p className="text-sm text-yellow-600">Menunggu</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.proses}</p>
            <p className="text-sm text-blue-600">Dalam Pengiriman</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.selesai}</p>
            <p className="text-sm text-green-600">Selesai</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : deliveryOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Belum ada pesanan pengiriman aktif</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveryOrders.map((order) => {
              const status = orderToStatus(order.status);
              const resiInfo = resiMap[order.id];
              const items: any[] = order.items ?? [];
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900 font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[status].color}`}>
                          {STATUS_CONFIG[status].label}
                        </span>
                        {resiInfo && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{resiInfo.ekspedisi}</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">{order.buyerName}</p>
                      {order.buyerPhone && (
                        <p className="text-sm text-gray-400 mt-0.5">📞 {order.buyerPhone}</p>
                      )}
                      {order.notes && (
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-500">{order.notes}</p>
                        </div>
                      )}
                      {resiInfo?.noResi && (
                        <div className="flex items-center gap-2 mt-1">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-mono text-gray-600">Resi: {resiInfo.noResi}</span>
                        </div>
                      )}
                      {items.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{items.map((i) => `${i.name} x${i.quantity ?? i.qty ?? 1}`).join(", ")}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-indigo-600">{formatIDR(Number(order.totalAmount))}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      <div className="flex gap-2">
                        {(order.status === "pending" || order.status === "processing") && !resiInfo && (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedId(order.id); setNoResi(""); setShowResi(true); }}>
                            <Plus className="h-3.5 w-3.5 mr-1" />Input Resi
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "processing") && (
                          <Button size="sm" onClick={() => updateOrder({ id: order.id, data: { status: "shipped" as any } })}>
                            <Truck className="h-3.5 w-3.5 mr-1" />Kirim
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => updateOrder({ id: order.id, data: { status: "completed" as any } })}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <p className="font-semibold mb-1">Integrasi Kurir Otomatis (Roadmap)</p>
          <p className="text-indigo-700">Integrasi real-time dengan JNE, J&T, SiCepat via Biteship API tersedia di paket Premium.</p>
        </div>
      </div>

      <Dialog open={showResi} onOpenChange={setShowResi}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Input Nomor Resi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Ekspedisi</Label>
              <Select value={ekspedisi} onValueChange={setEkspedisi}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{EKSPEDISI.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nomor Resi</Label>
              <Input className="mt-1 font-mono" value={noResi} onChange={(e) => setNoResi(e.target.value)} placeholder="Cth: JNE1234567890" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResi(false)}>Batal</Button>
            <Button disabled={!noResi} onClick={saveResi}>Simpan & Kirim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
