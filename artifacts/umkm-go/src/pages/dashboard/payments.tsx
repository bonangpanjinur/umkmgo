import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, CheckCircle, Lock } from "lucide-react";

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

const transactions = [
  { id: "TRX001", buyer: "Ibu Sari", method: "QRIS", amount: 125000, status: "Berhasil", date: "2026-03-31" },
  { id: "TRX002", buyer: "Bapak Joko", method: "Transfer BCA", amount: 89000, status: "Berhasil", date: "2026-03-30" },
  { id: "TRX003", buyer: "Rina K.", method: "QRIS", amount: 45000, status: "Menunggu", date: "2026-03-30" },
  { id: "TRX004", buyer: "Dewi A.", method: "Transfer Mandiri", amount: 230000, status: "Berhasil", date: "2026-03-29" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
}

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola metode pembayaran dan riwayat transaksi</p>
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

        {/* Recent Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Transaksi Terbaru</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-mono text-xs text-gray-500">{t.id}</td>
                      <td className="p-4 font-medium text-gray-900">{t.buyer}</td>
                      <td className="p-4 text-gray-600">{t.method}</td>
                      <td className="p-4 font-semibold">{formatIDR(t.amount)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === "Berhasil" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
