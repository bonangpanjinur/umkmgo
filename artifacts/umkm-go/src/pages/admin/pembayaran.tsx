import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, CheckCircle, XCircle, Clock, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Status = "menunggu" | "disetujui" | "ditolak";

interface Pembayaran {
  id: string;
  tenant: string;
  email: string;
  paket: string;
  jumlah: number;
  metode: string;
  status: Status;
  bukti?: string;
  catatan?: string;
  submittedAt: Date;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: any }> = {
  menunggu: { label: "Menunggu Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  disetujui: { label: "Disetujui", color: "bg-green-100 text-green-700", icon: CheckCircle },
  ditolak: { label: "Ditolak", color: "bg-red-100 text-red-700", icon: XCircle },
};

const INIT: Pembayaran[] = [
  { id: "1", tenant: "Warung Bu Sari", email: "sari@warung.id", paket: "Pro — Rp 249.000/bln", jumlah: 249000, metode: "QRIS", status: "menunggu", bukti: "bukti-transfer-001.jpg", submittedAt: new Date(Date.now() - 2 * 3600 * 1000) },
  { id: "2", tenant: "Kopi Kenangan Jogja", email: "kopijo@gmail.com", paket: "Premium — Rp 549.000/bln", jumlah: 549000, metode: "Transfer BCA", status: "menunggu", bukti: "bukti-bca-002.jpg", submittedAt: new Date(Date.now() - 5 * 3600 * 1000) },
  { id: "3", tenant: "Bakery Manis", email: "bakery@gmail.com", paket: "Basic — Rp 99.000/bln", jumlah: 99000, metode: "QRIS", status: "disetujui", submittedAt: new Date(Date.now() - 24 * 3600 * 1000) },
  { id: "4", tenant: "Geprek Mas Bro", email: "geprek@gmail.com", paket: "Pro — Rp 249.000/bln", jumlah: 249000, metode: "Transfer Mandiri", status: "ditolak", catatan: "Bukti tidak terbaca, harap upload ulang", submittedAt: new Date(Date.now() - 36 * 3600 * 1000) },
  { id: "5", tenant: "Es Teh Indonesia Cabang Depok", email: "esteh@gmail.com", paket: "Custom Domain Add-on — Rp 50.000/bln", jumlah: 50000, metode: "QRIS", status: "menunggu", bukti: "qris-005.jpg", submittedAt: new Date(Date.now() - 30 * 60 * 1000) },
];

export default function PembayaranPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState(INIT);
  const [selected, setSelected] = useState<Pembayaran | null>(null);
  const [catatan, setCatatan] = useState("");

  const approve = () => {
    if (!selected) return;
    setPayments((prev) => prev.map((p) => p.id === selected.id ? { ...p, status: "disetujui" as Status } : p));
    toast({ title: `✅ Pembayaran dari ${selected.tenant} disetujui` });
    setSelected(null);
  };

  const reject = () => {
    if (!selected) return;
    setPayments((prev) => prev.map((p) => p.id === selected.id ? { ...p, status: "ditolak" as Status, catatan } : p));
    toast({ title: `❌ Pembayaran dari ${selected.tenant} ditolak`, variant: "destructive" });
    setSelected(null);
    setCatatan("");
  };

  const pending = payments.filter((p) => p.status === "menunggu");
  const done = payments.filter((p) => p.status !== "menunggu");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approve Pembayaran</h1>
          <p className="text-sm text-gray-500">Verifikasi bukti transfer & aktivasi paket tenant</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{pending.length}</p>
            <p className="text-sm text-yellow-600">Menunggu Review</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{payments.filter((p) => p.status === "disetujui").length}</p>
            <p className="text-sm text-green-600">Disetujui</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(
                payments.filter((p) => p.status === "disetujui").reduce((s, p) => s + p.jumlah, 0)
              )}
            </p>
            <p className="text-sm text-gray-500">Total Terkonfirmasi</p>
          </div>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-3">Menunggu Review ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border-2 border-yellow-200 p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{p.tenant}</p>
                    <p className="text-sm text-gray-500">{p.email}</p>
                    <p className="text-sm text-gray-600 mt-1">{p.paket} · {p.metode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dikirim {formatDistanceToNow(p.submittedAt, { addSuffix: true, locale: idLocale })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-indigo-600 text-lg">{formatIDR(p.jumlah)}</p>
                    <Button size="sm" variant="outline" onClick={() => { setSelected(p); setCatatan(""); }}>
                      <Eye className="h-4 w-4 mr-1" /> Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Riwayat Pembayaran</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">Tenant</th>
                  <th className="text-left p-4 font-medium text-gray-600">Paket</th>
                  <th className="text-right p-4 font-medium text-gray-600">Jumlah</th>
                  <th className="text-center p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {done.map((p) => {
                  const cfg = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4"><p className="font-medium text-gray-900">{p.tenant}</p><p className="text-xs text-gray-400">{p.email}</p></td>
                      <td className="p-4 text-gray-600 text-xs">{p.paket}</td>
                      <td className="p-4 text-right font-semibold">{formatIDR(p.jumlah)}</td>
                      <td className="p-4 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="p-4 text-xs text-gray-400">{formatDistanceToNow(p.submittedAt, { addSuffix: true, locale: idLocale })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Tenant</span><span className="font-semibold">{selected.tenant}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Paket</span><span className="font-medium">{selected.paket}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Jumlah</span><span className="font-bold text-indigo-600">{formatIDR(selected.jumlah)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Metode</span><span>{selected.metode}</span></div>
              </div>
              {selected.bukti && (
                <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Bukti: {selected.bukti}</p>
                    <p className="text-xs mt-1">(Preview gambar tersedia di produksi)</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600">Catatan (opsional, muncul jika ditolak)</label>
                <Textarea className="mt-1" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Alasan penolakan..." />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
              <Button variant="destructive" onClick={reject}>Tolak</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={approve}>
                <CheckCircle className="h-4 w-4 mr-1" /> Setujui & Aktifkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
