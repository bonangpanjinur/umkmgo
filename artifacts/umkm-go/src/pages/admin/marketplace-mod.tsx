import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Store, Eye, CheckCircle, XCircle, AlertTriangle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StoreStatus = "aktif" | "ditangguhkan" | "menunggu_review" | "diblokir";

interface StoreItem {
  id: string;
  name: string;
  owner: string;
  email: string;
  kategori: string;
  status: StoreStatus;
  rating: number;
  produk: number;
  laporan: number;
  bergabung: string;
}

const STATUS_CONFIG: Record<StoreStatus, { label: string; color: string }> = {
  aktif: { label: "Aktif", color: "bg-green-100 text-green-700" },
  ditangguhkan: { label: "Ditangguhkan", color: "bg-yellow-100 text-yellow-700" },
  menunggu_review: { label: "Review", color: "bg-blue-100 text-blue-700" },
  diblokir: { label: "Diblokir", color: "bg-red-100 text-red-700" },
};

const STORES: StoreItem[] = [
  { id: "1", name: "Warung Bu Sari", owner: "Sari Dewi", email: "sari@gmail.com", kategori: "Warung Makan", status: "aktif", rating: 4.8, produk: 24, laporan: 0, bergabung: "Jan 2026" },
  { id: "2", name: "Kopi Gunung Emas", owner: "Budi Santoso", email: "budi@gmail.com", kategori: "Coffee Shop", status: "aktif", rating: 4.6, produk: 18, laporan: 0, bergabung: "Feb 2026" },
  { id: "3", name: "Snack Viral 2026", owner: "Rina K.", email: "rina@gmail.com", kategori: "Snack / Cemilan", status: "menunggu_review", rating: 0, produk: 5, laporan: 2, bergabung: "Mar 2026" },
  { id: "4", name: "Bakso Super Palsu", owner: "Unknown", email: "spam@bot.com", kategori: "Umum", status: "ditangguhkan", rating: 1.2, produk: 100, laporan: 15, bergabung: "Mar 2026" },
  { id: "5", name: "Es Teh Manis Ori", owner: "Ahmad F.", email: "ahmad@gmail.com", kategori: "Minuman Kekinian", status: "aktif", rating: 4.9, produk: 12, laporan: 0, bergabung: "Feb 2026" },
];

export default function AdminMarketplacePage() {
  const { toast } = useToast();
  const [stores, setStores] = useState(STORES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [catatan, setCatatan] = useState("");

  const filtered = stores.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: StoreStatus) => {
    setStores((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    toast({ title: `Status toko diperbarui ke: ${STATUS_CONFIG[status].label}` });
    setSelected(null);
  };

  const stats = {
    aktif: stores.filter((s) => s.status === "aktif").length,
    review: stores.filter((s) => s.status === "menunggu_review").length,
    laporan: stores.reduce((sum, s) => sum + s.laporan, 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderasi Marketplace</h1>
          <p className="text-sm text-gray-500">Pantau dan moderasi toko yang listing di marketplace publik</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.aktif}</p>
            <p className="text-sm text-green-600">Toko Aktif</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.review}</p>
            <p className="text-sm text-blue-600">Menunggu Review</p>
          </div>
          <div className={`${stats.laporan > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"} border rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${stats.laporan > 0 ? "text-red-700" : "text-gray-900"}`}>{stats.laporan}</p>
            <p className={`text-sm ${stats.laporan > 0 ? "text-red-600" : "text-gray-500"}`}>Total Laporan</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9" placeholder="Cari nama toko atau pemilik..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Toko</th>
                <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                <th className="text-center p-4 font-medium text-gray-600">Produk</th>
                <th className="text-center p-4 font-medium text-gray-600">Rating</th>
                <th className="text-center p-4 font-medium text-gray-600">Laporan</th>
                <th className="text-center p-4 font-medium text-gray-600">Status</th>
                <th className="text-center p-4 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.owner} · {s.email}</p>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{s.kategori}</td>
                  <td className="p-4 text-center">{s.produk}</td>
                  <td className="p-4 text-center">
                    {s.rating > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{s.rating}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-center">
                    {s.laporan > 0 ? <span className="text-red-600 font-bold">{s.laporan} ⚠️</span> : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[s.status].color}`}>
                      {STATUS_CONFIG[s.status].label}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(s); setCatatan(""); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Moderasi Toko — {selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Pemilik</span><span className="font-medium">{selected.owner}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Kategori</span><span>{selected.kategori}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Produk</span><span>{selected.produk} item</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Laporan</span><span className={selected.laporan > 0 ? "text-red-600 font-bold" : ""}>{selected.laporan}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span></div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Catatan Internal (opsional)</label>
                <Textarea className="mt-1" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
              {selected.status !== "aktif" && <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selected.id, "aktif")}><CheckCircle className="h-4 w-4 mr-1" />Aktifkan</Button>}
              {selected.status === "aktif" && <Button variant="outline" onClick={() => updateStatus(selected.id, "ditangguhkan")}><AlertTriangle className="h-4 w-4 mr-1" />Tangguhkan</Button>}
              {selected.status !== "diblokir" && <Button variant="destructive" onClick={() => updateStatus(selected.id, "diblokir")}><XCircle className="h-4 w-4 mr-1" />Blokir</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
