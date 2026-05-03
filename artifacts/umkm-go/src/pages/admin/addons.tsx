import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, Plus, Edit, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddOn {
  id: string;
  name: string;
  desc: string;
  type: "monthly" | "onetime" | "yearly";
  price: number;
  active: boolean;
  category: string;
  purchases: number;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const TYPE_LABELS = { monthly: "Per Bulan", onetime: "Sekali Beli", yearly: "Per Tahun" };
const CATEGORIES = ["Domain", "Tema", "Kurir", "Kapasitas", "Fitur"];

const INIT: AddOn[] = [
  { id: "1", name: "Custom Domain", desc: "Hubungkan domain sendiri ke toko", type: "monthly", price: 50000, active: true, category: "Domain", purchases: 143 },
  { id: "2", name: "Tema Premium — Coffee Dark", desc: "Tema eksklusif untuk kedai kopi industrial", type: "onetime", price: 199000, active: true, category: "Tema", purchases: 67 },
  { id: "3", name: "Tema Premium — Bakery Pastel", desc: "Tema elegan untuk toko bakery", type: "onetime", price: 199000, active: true, category: "Tema", purchases: 45 },
  { id: "4", name: "Integrasi Kurir API (Biteship)", desc: "Ongkir real-time + auto create shipment", type: "monthly", price: 99000, active: true, category: "Kurir", purchases: 34 },
  { id: "5", name: "Slot Outlet Ekstra", desc: "Tambah 1 outlet untuk paket Pro", type: "monthly", price: 75000, active: true, category: "Kapasitas", purchases: 28 },
  { id: "6", name: "Slot Karyawan Ekstra (5 orang)", desc: "Tambah kuota 5 karyawan", type: "monthly", price: 49000, active: false, category: "Kapasitas", purchases: 12 },
];

const EMPTY: Omit<AddOn, "id" | "purchases"> = { name: "", desc: "", type: "monthly", price: 0, active: true, category: "Fitur" };

export default function AdminAddonsPage() {
  const { toast } = useToast();
  const [addons, setAddons] = useState(INIT);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<AddOn | null>(null);
  const [form, setForm] = useState<Omit<AddOn, "id" | "purchases">>(EMPTY);

  const totalRevenue = addons.reduce((s, a) => s + a.price * a.purchases, 0);

  const openEdit = (a: AddOn) => {
    setEditItem(a);
    setForm({ name: a.name, desc: a.desc, type: a.type, price: a.price, active: a.active, category: a.category });
    setShowForm(true);
  };

  const save = () => {
    if (editItem) {
      setAddons((prev) => prev.map((a) => a.id === editItem.id ? { ...editItem, ...form } : a));
      toast({ title: "Add-on diperbarui" });
    } else {
      setAddons((prev) => [...prev, { ...form, id: String(Date.now()), purchases: 0 }]);
      toast({ title: "Add-on berhasil ditambahkan" });
    }
    setShowForm(false);
    setEditItem(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Add-on</h1>
            <p className="text-sm text-gray-500">Produk tambahan yang bisa dibeli terpisah dari paket</p>
          </div>
          <Button onClick={() => { setForm(EMPTY); setEditItem(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Tambah Add-on
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg"><Tag className="h-5 w-5 text-indigo-600" /></div>
              <div><p className="text-sm text-gray-500">Total Add-on</p><p className="text-2xl font-bold">{addons.length}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="h-5 w-5 text-green-600" /></div>
              <div><p className="text-sm text-gray-500">Est. Revenue</p><p className="text-xl font-bold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(totalRevenue)}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Tag className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-sm text-gray-500">Total Pembelian</p><p className="text-2xl font-bold">{addons.reduce((s, a) => s + a.purchases, 0)}</p></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Nama Add-on</th>
                <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                <th className="text-left p-4 font-medium text-gray-600">Tipe</th>
                <th className="text-right p-4 font-medium text-gray-600">Harga</th>
                <th className="text-right p-4 font-medium text-gray-600">Terjual</th>
                <th className="text-center p-4 font-medium text-gray-600">Aktif</th>
                <th className="text-center p-4 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {addons.map((a) => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50 ${!a.active ? "opacity-50" : ""}`}>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{a.category}</span></td>
                  <td className="p-4 text-gray-500 text-xs">{TYPE_LABELS[a.type]}</td>
                  <td className="p-4 text-right font-semibold">{formatIDR(a.price)}</td>
                  <td className="p-4 text-right text-gray-600">{a.purchases}</td>
                  <td className="p-4 text-center">
                    <Switch checked={a.active} onCheckedChange={(v) => { setAddons((prev) => prev.map((x) => x.id === a.id ? { ...x, active: v } : x)); }} />
                  </td>
                  <td className="p-4 text-center">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Add-on" : "Tambah Add-on"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nama Add-on *</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Deskripsi</Label><Input className="mt-1" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipe Pembayaran</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Per Bulan</SelectItem>
                    <SelectItem value="yearly">Per Tahun</SelectItem>
                    <SelectItem value="onetime">Sekali Beli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Harga (Rp)</Label><Input className="mt-1" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Aktif / Tersedia</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button disabled={!form.name} onClick={save}>{editItem ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
