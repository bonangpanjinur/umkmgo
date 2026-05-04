import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListOrders, useUpdateOrder, useGetMyStore } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, ShoppingCart, Eye, ChevronLeft, ChevronRight, QrCode, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { printReceipt } from "@/lib/print-receipt";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Belum Bayar",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  qr_table: { label: "QR Meja", color: "bg-indigo-100 text-indigo-700" },
  storefront: { label: "Online", color: "bg-blue-100 text-blue-700" },
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-700" },
  manual: { label: "Manual", color: "bg-gray-100 text-gray-600" },
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(n);
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: storeData } = useGetMyStore(AUTH());
  const store = storeData as any;

  const handlePrint = useCallback((order: any) => {
    printReceipt(
      {
        name: store?.name ?? "Toko",
        description: store?.description,
        whatsapp: store?.whatsapp,
        logoUrl: store?.logoUrl,
        address: store?.address,
      },
      {
        id: order.id,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        tableNumber: order.tableNumber,
        source: order.source,
        items: order.items ?? [],
        totalAmount: order.totalAmount,
        notes: order.notes,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      }
    );
  }, [store]);

  const { data, isLoading, refetch } = useListOrders(
    {
      page,
      limit: 10,
      ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
    },
    AUTH()
  );

  const { mutate: updateOrder, isPending: updating } = useUpdateOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pesanan diperbarui" });
        refetch();
        setSelectedOrder(null);
      },
    },
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const filtered = search
    ? orders.filter(
        (o) =>
          o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          (o.tableNumber && String(o.tableNumber).includes(search))
      )
    : orders;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola pesanan dari pelanggan Anda</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs font-semibold text-yellow-700">{pendingCount} menunggu</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShoppingCart className="h-4 w-4" />
              <span>{total} total pesanan</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, ID pesanan, atau nomor meja..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="shipped">Dikirim</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Memuat pesanan...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada pesanan</p>
              <p className="text-sm text-gray-400 mt-1">Pesanan dari pelanggan akan muncul di sini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">ID Pesanan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Pembeli</th>
                    <th className="text-left p-4 font-medium text-gray-600">Meja</th>
                    <th className="text-left p-4 font-medium text-gray-600">Total</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Sumber</th>
                    <th className="text-left p-4 font-medium text-gray-600">Waktu</th>
                    <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const src = SOURCE_LABELS[order.source] ?? SOURCE_LABELS.manual;
                    return (
                      <tr key={order.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${order.status === "pending" ? "bg-yellow-50/30" : ""}`}>
                        <td className="p-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{order.buyerName}</div>
                          <div className="text-xs text-gray-400">{order.buyerPhone}</div>
                        </td>
                        <td className="p-4">
                          {order.tableNumber ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                                {order.tableNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-gray-900">{formatIDR(order.totalAmount)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${src.color}`}>
                            {src.label}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: idLocale })}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)} title="Lihat detail">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handlePrint(order)} title="Cetak struk">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedOrder && (
        <Dialog open onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Detail Pesanan
                {selectedOrder.tableNumber && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    <QrCode className="w-3 h-3" />
                    Meja {selectedOrder.tableNumber}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Source badge */}
              {selectedOrder.source && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sumber:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_LABELS[selectedOrder.source]?.color ?? "bg-gray-100 text-gray-600"}`}>
                    {SOURCE_LABELS[selectedOrder.source]?.label ?? selectedOrder.source}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Pembeli</p>
                  <p className="font-medium">{selectedOrder.buyerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Telepon</p>
                  <p className="font-medium">{selectedOrder.buyerPhone}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-gray-500">Nomor Meja</p>
                    <p className="font-bold text-indigo-600">Meja {selectedOrder.tableNumber}</p>
                  </div>
                )}
                {selectedOrder.buyerAddress && (
                  <div className={selectedOrder.tableNumber ? "" : "col-span-2"}>
                    <p className="text-gray-500">Alamat</p>
                    <p className="font-medium">{selectedOrder.buyerAddress}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Catatan</p>
                    <p className="font-medium text-orange-700 bg-orange-50 rounded-lg px-3 py-2 text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Item Pesanan</p>
                <div className="space-y-2">
                  {(selectedOrder.items ?? []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 rounded p-2">
                      <span>{item.name} ×{item.quantity ?? item.qty ?? 1}</span>
                      <span className="font-medium">{formatIDR(item.price * (item.quantity ?? item.qty ?? 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatIDR(selectedOrder.totalAmount)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Status Pesanan</label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => setSelectedOrder({ ...selectedOrder, status: val })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status Bayar</label>
                  <Select
                    value={selectedOrder.paymentStatus}
                    onValueChange={(val) => setSelectedOrder({ ...selectedOrder, paymentStatus: val })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 sm:mr-auto"
                onClick={() => handlePrint(selectedOrder)}
              >
                <Printer className="h-4 w-4" />
                Cetak Struk
              </Button>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Batal</Button>
              <Button
                disabled={updating}
                onClick={() =>
                  updateOrder({
                    id: selectedOrder.id,
                    data: { status: selectedOrder.status, paymentStatus: selectedOrder.paymentStatus },
                    ...AUTH(),
                  })
                }
              >
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
