import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, AlertTriangle, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Bahan {
  id: string;
  name: string;
  unit: string;
  stok: number;
  minStok: number;
  hargaSatuan: number;
  supplier: string;
  kategori: string;
  expiredAt?: string;
}

const UNITS = ["kg", "gram", "liter", "ml", "pcs", "dus", "karung", "lusin"];
const KATEGORI = ["Bahan Pokok", "Bumbu", "Daging & Seafood", "Sayuran", "Minuman", "Kemasan", "Lainnya"];

const INIT: Bahan[] = [
  { id: "1", name: "Tepung Terigu", unit: "kg", stok: 25, minStok: 10, hargaSatuan: 12000, supplier: "Toko Sembako Jaya", kategori: "Bahan Pokok" },
  { id: "2", name: "Ayam Broiler", unit: "kg", stok: 8, minStok: 15, hargaSatuan: 35000, supplier: "Pak Budi Poultry", kategori: "Daging & Seafood", expiredAt: "2026-04-03" },
  { id: "3", name: "Minyak Goreng", unit: "liter", stok: 20, minStok: 10, hargaSatuan: 18000, supplier: "Grosir Minyak Makmur", kategori: "Bahan Pokok" },
  { id: "4", name: "Bawang Merah", unit: "kg", stok: 3, minStok: 5, hargaSatuan: 32000, supplier: "Pasar Senen", kategori: "Bumbu" },
  { id: "5", name: "Garam Halus", unit: "kg", stok: 12, minStok: 3, hargaSatuan: 5000, supplier: "Toko Sembako Jaya", kategori: "Bumbu" },
  { id: "6", name: "Cup Plastik 16oz", unit: "pcs", stok: 500, minStok: 200, hargaSatuan: 800, supplier: "CV Plastik Sejati", kategori: "Kemasan" },
];

const EMPTY: Omit<Bahan, "id"> = { name: "", unit: "kg", stok: 0, minStok: 0, hargaSatuan: 0, supplier: "", kategori: "Bahan Pokok" };

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function BahanBakuPage() {
  const { toast } = useToast();
  const [bahans, setBahans] = useState<Bahan[]>(INIT);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Bahan | null>(null);
  const [form, setForm] = useState<Omit<Bahan, "id">>(EMPTY);

  const filtered = bahans.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchKat = kategoriFilter === "all" || b.kategori === kategoriFilter;
    return matchSearch && matchKat;
  });

  const alerts = bahans.filter((b) => b.stok <= b.minStok);
  const totalNilai = bahans.reduce((s, b) => s + b.stok * b.hargaSatuan, 0);

  const openAdd = () => { setForm(EMPTY); setEditItem(null); setShowForm(true); };
  const openEdit = (b: Bahan) => { setForm({ name: b.name, unit: b.unit, stok: b.stok, minStok: b.minStok, hargaSatuan: b.hargaSatuan, supplier: b.supplier, kategori: b.kategori, expiredAt: b.expiredAt }); setEditItem(b); setShowForm(true); };

  const save = () => {
    if (editItem) {
      setBahans((prev) => prev.map((b) => b.id === editItem.id ? { ...editItem, ...form } : b));
      toast({ title: "Bahan baku diperbarui" });
    } else {
      setBahans((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      toast({ title: "Bahan baku ditambahkan" });
    }
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bahan Baku</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola inventaris bahan baku & supplier</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Item</p>
            <p className="text-2xl font-bold text-gray-900">{bahans.length}</p>
          </div>
          <div className={`rounded-xl border p-4 ${alerts.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <p className="text-sm text-gray-500">Stok Kritis</p>
            <p className={`text-2xl font-bold ${alerts.length > 0 ? "text-red-600" : "text-gray-900"}`}>{alerts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Nilai Stok</p>
            <p className="text-lg font-bold text-gray-900">{formatIDR(totalNilai)}</p>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="font-semibold text-red-800 text-sm">Perlu Restock Segera</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.map((b) => (
                <span key={b.id} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {b.name} ({b.stok} {b.unit} / min {b.minStok})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9" placeholder="Cari bahan baku..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400">Belum ada bahan baku</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Nama Bahan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600">Stok</th>
                    <th className="text-left p-4 font-medium text-gray-600">Min. Stok</th>
                    <th className="text-left p-4 font-medium text-gray-600">Harga/Satuan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Supplier</th>
                    <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const isLow = b.stok <= b.minStok;
                    const isExpiringSoon = b.expiredAt && new Date(b.expiredAt) < new Date(Date.now() + 7 * 24 * 3600 * 1000);
                    return (
                      <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isLow ? "bg-red-50/30" : ""}`}>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{b.name}</div>
                          {isExpiringSoon && (
                            <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" /> Exp: {b.expiredAt}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{b.kategori}</td>
                        <td className="p-4">
                          <span className={`font-bold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                            {b.stok} {b.unit}
                          </span>
                          {isLow && <span className="ml-1 text-xs text-red-500">⚠️ Kritis</span>}
                        </td>
                        <td className="p-4 text-gray-500">{b.minStok} {b.unit}</td>
                        <td className="p-4 text-gray-700">{formatIDR(b.hargaSatuan)}</td>
                        <td className="p-4 text-gray-500 text-xs">{b.supplier}</td>
                        <td className="p-4 flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { setBahans((prev) => prev.filter((x) => x.id !== b.id)); toast({ title: "Bahan dihapus" }); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nama Bahan *</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Satuan</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stok Saat Ini</Label>
              <Input className="mt-1" type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Minimum Stok</Label>
              <Input className="mt-1" type="number" value={form.minStok} onChange={(e) => setForm({ ...form, minStok: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Harga per Satuan (Rp)</Label>
              <Input className="mt-1" type="number" value={form.hargaSatuan} onChange={(e) => setForm({ ...form, hargaSatuan: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Tanggal Kadaluarsa</Label>
              <Input className="mt-1" type="date" value={form.expiredAt ?? ""} onChange={(e) => setForm({ ...form, expiredAt: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Supplier</Label>
              <Input className="mt-1" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button disabled={!form.name} onClick={save}>{editItem ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
