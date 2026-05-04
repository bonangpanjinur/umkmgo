import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Building2, CheckCircle, Lock, Loader2 } from "lucide-react";
import { useListOrders } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

const methods = [
  {
    id: "qris",
    name: "QRIS",
    desc: "Terima pembayaran dari semua e-wallet dan mobile banking via satu QR code",
    icon: Smartphone,
    active: true,
    badge: "Populer",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "transfer",
    name: "Transfer Bank",
    desc: "BCA, Mandiri, BNI, BRI — pelanggan transfer manual ke rekening Anda",
    icon: Building2,
    active: true,
    badge: null,
    badgeColor: "",
  },
  {
    id: "cod",
    name: "Bayar di Tempat (COD)",
    desc: "Pelanggan membayar saat barang tiba",
    icon: CreditCard,
    active: false,
    badge: "Segera Hadir",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function detectMethod(notes?: string | null): string {
  if (!notes) return "Transfer Bank";
  const n = notes.toLowerCase();
  if (n.includes("qris")) return "QRIS";
  if (n.includes("tunai")) return "Tunai";
  return "Transfer Bank";
}

function mapPaymentStatus(status: string, paymentStatus?: string | null): { label: string; cls: string } {
  if (paymentStatus === "paid" || status === "completed") return { label: "Berhasil", cls: "bg-green-100 text-green-700" };
  if (status === "cancelled") return { label: "Dibatalkan", cls: "bg-red-100 text-red-700" };
  return { label: "Menunggu", cls: "bg-yellow-100 text-yellow-700" };
}

export default function PaymentsPage() {
  const { data, isLoading } = useListOrders({ page: 1, limit: 20 }, AUTH());
  const orders = data?.data ?? [];

  const totalRevenue = orders
    .filter((o) => o.status === "completed" || o.paymentStatus === "paid")
    .reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola metode pembayaran dan riwayat transaksi</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Transaksi Berhasil</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "completed" || o.paymentStatus === "paid").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Pendapatan</p>
            <p className="text-lg font-bold text-gray-900">{formatIDR(totalRevenue)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Metode Pembayaran</h2>
          <div className="grid gap-4">
            {methods.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <m.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    {m.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.badgeColor}`}>{m.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{m.desc}</p>
                </div>
                <div>
                  {m.active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Aktif
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Lock className="h-4 w-4" />
                      Tidak Aktif
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions from real orders */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Transaksi Terbaru</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Memuat transaksi...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-600">ID</th>
                      <th className="text-left p-4 font-medium text-gray-600">Pembeli</th>
                      <th className="text-left p-4 font-medium text-gray-600">Metode</th>
                      <th className="text-left p-4 font-medium text-gray-600">Jumlah</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const pStatus = mapPaymentStatus(o.status, o.paymentStatus);
                      return (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 font-mono text-xs text-gray-500">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="p-4 font-medium text-gray-900">{o.buyerName}</td>
                          <td className="p-4 text-gray-600">{detectMethod(o.notes)}</td>
                          <td className="p-4 font-semibold">{formatIDR(Number(o.totalAmount))}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pStatus.cls}`}>
                              {pStatus.label}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 text-xs">
                            {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
