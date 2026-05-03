import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, Package, Clock, CheckCircle, Phone, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StatusKurir = "menunggu" | "dijemput" | "diantar" | "selesai" | "gagal";

interface Pengiriman {
  id: string;
  orderId: string;
  pembeli: string;
  alamat: string;
  kurir: string;
  status: StatusKurir;
  ekspedisi: string;
  noResi?: string;
  ongkir: number;
  waktu: string;
}

const STATUS_CONFIG: Record<StatusKurir, { label: string; color: string }> = {
  menunggu: { label: "Menunggu Pickup", color: "bg-yellow-100 text-yellow-700" },
  dijemput: { label: "Dijemput Kurir", color: "bg-blue-100 text-blue-700" },
  diantar: { label: "Sedang Diantar", color: "bg-purple-100 text-purple-700" },
  selesai: { label: "Terkirim", color: "bg-green-100 text-green-700" },
  gagal: { label: "Gagal Kirim", color: "bg-red-100 text-red-700" },
};

const EKSPEDISI = ["Kurir Internal", "JNE", "J&T Express", "SiCepat", "AnterAja", "Pos Indonesia", "GoSend", "GrabExpress"];

const MOCK: Pengiriman[] = [
  { id: "1", orderId: "ORD-001", pembeli: "Ibu Sari", alamat: "Jl. Merdeka No. 10, Jakarta Selatan", kurir: "Budi Kurir", status: "diantar", ekspedisi: "Kurir Internal", ongkir: 15000, waktu: "31 Mar 10:30" },
  { id: "2", orderId: "ORD-002", pembeli: "Bapak Joko", alamat: "Jl. Pahlawan No. 5, Depok", kurir: "", status: "menunggu", ekspedisi: "JNE", noResi: "JNE1234567890", ongkir: 18000, waktu: "31 Mar 11:00" },
  { id: "3", orderId: "ORD-003", pembeli: "Dewi A.", alamat: "Jl. Sudirman Blok A3, Tangerang", kurir: "Ahmad Kurir", status: "selesai", ekspedisi: "Kurir Internal", ongkir: 12000, waktu: "30 Mar 15:00" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function KurirPage() {
  const { toast } = useToast();
  const [pengiriman, setPengiriman] = useState(MOCK);
  const [showResi, setShowResi] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noResi, setNoResi] = useState("");
  const [ekspedisi, setEkspedisi] = useState("JNE");

  const updateStatus = (id: string, status: StatusKurir) => {
    setPengiriman((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    toast({ title: `Status pengiriman diperbarui` });
  };

  const saveResi = () => {
    setPengiriman((prev) => prev.map((p) => p.id === selectedId ? { ...p, noResi, ekspedisi, status: "dijemput" } : p));
    toast({ title: "No. resi disimpan" });
    setShowResi(false);
  };

  const stats = {
    menunggu: pengiriman.filter((p) => p.status === "menunggu").length,
    proses: pengiriman.filter((p) => p.status === "dijemput" || p.status === "diantar").length,
    selesai: pengiriman.filter((p) => p.status === "selesai").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kurir & Pengiriman</h1>
            <p className="text-sm text-gray-500">Kelola pengiriman internal dan resi ekspedisi</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.menunggu}</p>
            <p className="text-sm text-yellow-600">Menunggu</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.proses}</p>
            <p className="text-sm text-blue-600">Dalam Proses</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.selesai}</p>
            <p className="text-sm text-green-600">Selesai</p>
          </div>
        </div>

        {/* Pengiriman List */}
        <div className="space-y-3">
          {pengiriman.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{p.orderId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[p.status].color}`}>
                      {STATUS_CONFIG[p.status].label}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{p.ekspedisi}</span>
                  </div>
                  <p className="font-medium text-gray-800">{p.pembeli}</p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-500">{p.alamat}</p>
                  </div>
                  {p.noResi && (
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-mono text-gray-600">Resi: {p.noResi}</span>
                    </div>
                  )}
                  {p.kurir && (
                    <div className="flex items-center gap-2 mt-1">
                      <Truck className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">Kurir: {p.kurir}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold text-indigo-600">{formatIDR(p.ongkir)}</p>
                  <p className="text-xs text-gray-400">{p.waktu}</p>
                  <div className="flex gap-2">
                    {p.status === "menunggu" && !p.noResi && (
                      <Button size="sm" variant="outline" onClick={() => { setSelectedId(p.id); setEkspedisi(p.ekspedisi); setNoResi(""); setShowResi(true); }}>
                        <Plus className="h-3.5 w-3.5 mr-1" />Input Resi
                      </Button>
                    )}
                    {p.status === "menunggu" && (
                      <Button size="sm" onClick={() => updateStatus(p.id, "diantar")}>
                        <Truck className="h-3.5 w-3.5 mr-1" />Berangkat
                      </Button>
                    )}
                    {p.status === "diantar" && (
                      <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => updateStatus(p.id, "selesai")}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Selesai
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <p className="font-semibold mb-1">Integrasi Kurir Otomatis (Roadmap)</p>
          <p className="text-indigo-700">Integrasi real-time dengan JNE, J&T, SiCepat via Biteship API tersedia di paket Premium. Saat ini input resi manual.</p>
        </div>
      </div>

      {/* Resi Dialog */}
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
            <Button disabled={!noResi} onClick={saveResi}>Simpan Resi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
