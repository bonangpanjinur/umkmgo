import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Kategori {
  id: string;
  name: string;
  desc: string;
  icon: string;
  theme: string;
  active: boolean;
  tenants: number;
}

const INIT: Kategori[] = [
  { id: "1", name: "Coffee Shop / Kedai Kopi", desc: "Hangat, earthy tones, menu espresso/manual brew/signature", icon: "☕", theme: "coffee", active: true, tenants: 287 },
  { id: "2", name: "Resto Ayam / Fast Food", desc: "Bold, kontras tinggi, foto combo meal besar, highlight paket hemat", icon: "🍗", theme: "fastfood", active: true, tenants: 312 },
  { id: "3", name: "Snack / Cemilan / Frozen Food", desc: "Playful, bright, grid produk rapat, badge Best Seller / Frozen", icon: "🍟", theme: "snack", active: true, tenants: 198 },
  { id: "4", name: "Bakery / Pastry / Dessert", desc: "Elegan, soft pastel, fokus visual produk, layout magazine", icon: "🥐", theme: "bakery", active: true, tenants: 145 },
  { id: "5", name: "Warung Makan / Rumah Makan", desc: "Homey, motif tradisional ringan, menu prasmanan, info halal", icon: "🍱", theme: "warung", active: true, tenants: 423 },
  { id: "6", name: "Minuman Kekinian / Boba / Juice", desc: "Vibrant gradient, animasi ringan, builder topping, level gula/es", icon: "🧋", theme: "drinks", active: true, tenants: 267 },
  { id: "7", name: "Catering / Meal Prep / Healthy", desc: "Clean, infografis nutrisi (kcal, protein), paket mingguan", icon: "🥗", theme: "catering", active: true, tenants: 89 },
  { id: "8", name: "Umum / Generic F&B", desc: "Fallback netral untuk yang belum cocok kategori manapun", icon: "🍽️", theme: "generic", active: true, tenants: 497 },
];

const EMPTY: Omit<Kategori, "id" | "tenants"> = { name: "", desc: "", icon: "🍽️", theme: "", active: true };

export default function KategoriPage() {
  const { toast } = useToast();
  const [kategoris, setKategoris] = useState(INIT);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Kategori | null>(null);
  const [form, setForm] = useState<Omit<Kategori, "id" | "tenants">>(EMPTY);

  const openEdit = (k: Kategori) => {
    setEditItem(k);
    setForm({ name: k.name, desc: k.desc, icon: k.icon, theme: k.theme, active: k.active });
    setShowForm(true);
  };

  const save = () => {
    if (editItem) {
      setKategoris((prev) => prev.map((k) => k.id === editItem.id ? { ...editItem, ...form } : k));
      toast({ title: "Kategori diperbarui" });
    } else {
      setKategoris((prev) => [...prev, { ...form, id: String(Date.now()), tenants: 0 }]);
      toast({ title: "Kategori ditambahkan" });
    }
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kategori Bisnis</h1>
            <p className="text-sm text-gray-500">8 kategori F&B default — setiap kategori punya tema toko unik</p>
          </div>
          <Button onClick={() => { setForm(EMPTY); setEditItem(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kategoris.map((k) => (
            <div key={k.id} className={`bg-white rounded-xl border-2 ${k.active ? "border-gray-200" : "border-gray-100 opacity-60"} p-5`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{k.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{k.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{k.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full font-mono">theme: {k.theme}</span>
                      <span className="flex items-center gap-1"><Store className="h-3 w-3" />{k.tenants} toko</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={k.active} onCheckedChange={(v) => setKategoris((prev) => prev.map((x) => x.id === k.id ? { ...x, active: v } : x))} />
                  <Button size="sm" variant="ghost" onClick={() => openEdit(k)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Ikon</Label>
                <Input className="mt-1 text-xl text-center" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} />
              </div>
              <div className="col-span-3">
                <Label>Nama Kategori *</Label>
                <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Deskripsi (panduan tema)</Label>
              <Textarea className="mt-1" rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            </div>
            <div>
              <Label>Theme Key (unik, lowercase, tanpa spasi)</Label>
              <Input className="mt-1 font-mono" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value.toLowerCase().replace(/\s/g, "_") })} placeholder="cth: coffee_shop" />
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Aktif (tampil di pilihan toko)</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button disabled={!form.name || !form.theme} onClick={save}>{editItem ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
