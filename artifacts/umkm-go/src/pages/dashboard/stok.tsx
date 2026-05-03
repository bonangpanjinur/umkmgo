import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoxesIcon, Plus, Minus, ClipboardList, AlertTriangle, ArrowUpDown, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

interface StokItem {
  id: string;
  name: string;
  unit: string;
  stok: number;
  minStok: number;
  kategori: string;
}

interface StokHistory {
  id: string;
  itemName: string;
  jenis: "masuk" | "keluar" | "opname";
  jumlah: number;
  note: string;
  waktu: string;
}

const ITEMS: StokItem[] = [
  { id: "1", name: "Tepung Terigu", unit: "kg", stok: 25, minStok: 10, kategori: "Bahan Pokok" },
  { id: "2", name: "Ayam Broiler", unit: "kg", stok: 8, minStok: 15, kategori: "Daging" },
  { id: "3", name: "Minyak Goreng", unit: "liter", stok: 20, minStok: 10, kategori: "Bahan Pokok" },
  { id: "4", name: "Bawang Merah", unit: "kg", stok: 3, minStok: 5, kategori: "Bumbu" },
  { id: "5", name: "Cup Plastik 16oz", unit: "pcs", stok: 500, minStok: 200, kategori: "Kemasan" },
];

const HISTORY: StokHistory[] = [
  { id: "1", itemName: "Tepung Terigu", jenis: "masuk", jumlah: 10, note: "Restock dari Toko Jaya", waktu: "2026-03-31 08:00" },
  { id: "2", itemName: "Ayam Broiler", jenis: "keluar", jumlah: 5, note: "Produksi hari ini", waktu: "2026-03-31 10:30" },
  { id: "3", itemName: "Minyak Goreng", jenis: "opname", jumlah: 20, note: "Opname rutin Senin", waktu: "2026-03-31 12:00" },
  { id: "4", itemName: "Bawang Merah", jenis: "keluar", jumlah: 2, note: "Produksi", waktu: "2026-03-30 09:00" },
];

export default function StokPage() {
  const { toast } = useToast();
  const [items, setItems] = useState(ITEMS);
  const [history, setHistory] = useState(HISTORY);
  const [showAdj, setShowAdj] = useState(false);
  const [adjItem, setAdjItem] = useState<StokItem | null>(null);
  const [adjType, setAdjType] = useState<"masuk" | "keluar" | "opname">("masuk");
  const [adjJumlah, setAdjJumlah] = useState("");
  const [adjNote, setAdjNote] = useState("");
  const [showOpname, setShowOpname] = useState(false);
  const [opnameData, setOpnameData] = useState<Record<string, string>>({});

  const openAdj = (item: StokItem, type: "masuk" | "keluar") => {
    setAdjItem(item);
    setAdjType(type);
    setAdjJumlah("");
    setAdjNote("");
    setShowAdj(true);
  };

  const saveAdj = () => {
    const jumlah = Number(adjJumlah);
    if (!jumlah || !adjItem) return;
    setItems((prev) => prev.map((i) => i.id === adjItem.id ? {
      ...i,
      stok: adjType === "masuk" ? i.stok + jumlah : adjType === "keluar" ? Math.max(0, i.stok - jumlah) : jumlah,
    } : i));
    setHistory((prev) => [{
      id: String(Date.now()),
      itemName: adjItem.name,
      jenis: adjType,
      jumlah,
      note: adjNote,
      waktu: new Date().toLocaleString("id-ID"),
    }, ...prev]);
    toast({ title: `Stok ${adjItem.name} diperbarui` });
    setShowAdj(false);
  };

  const saveOpname = () => {
    setItems((prev) => prev.map((i) => {
      const val = opnameData[i.id];
      if (val !== undefined && val !== "") {
        const actual = Number(val);
        const diff = actual - i.stok;
        if (diff !== 0) {
          setHistory((h) => [{
            id: String(Date.now()) + i.id,
            itemName: i.name,
            jenis: "opname",
            jumlah: actual,
            note: `Selisih: ${diff > 0 ? "+" : ""}${diff} ${i.unit}`,
            waktu: new Date().toLocaleString("id-ID"),
          }, ...h]);
        }
        return { ...i, stok: actual };
      }
      return i;
    }));
    toast({ title: "Opname stok berhasil disimpan" });
    setShowOpname(false);
    setOpnameData({});
  };

  const lowStock = items.filter((i) => i.stok <= i.minStok);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Stok & Opname</h1>
            <p className="text-sm text-gray-500">Pantau stok dan lakukan opname berkala</p>
          </div>
          <Button onClick={() => { setOpnameData({}); setShowOpname(true); }}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Opname Sekarang
          </Button>
        </div>

        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm mb-1">⚠️ Stok Kritis — Perlu Restock</p>
              <div className="flex flex-wrap gap-2">
                {lowStock.map((i) => (
                  <span key={i.id} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                    {i.name}: {i.stok}/{i.minStok} {i.unit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="stok">
          <TabsList>
            <TabsTrigger value="stok">Stok Saat Ini</TabsTrigger>
            <TabsTrigger value="riwayat">Riwayat Pergerakan</TabsTrigger>
          </TabsList>

          <TabsContent value="stok">
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Bahan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-center p-4 font-medium text-gray-600">Stok Saat Ini</th>
                    <th className="text-center p-4 font-medium text-gray-600">Min Stok</th>
                    <th className="text-center p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLow = item.stok <= item.minStok;
                    const pct = Math.min(100, (item.stok / item.minStok) * 100);
                    return (
                      <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isLow ? "bg-red-50/20" : ""}`}>
                        <td className="p-4 font-medium text-gray-900">{item.name}</td>
                        <td className="p-4 text-gray-400 text-xs">{item.kategori}</td>
                        <td className="p-4 text-center">
                          <div>
                            <span className={`font-bold text-base ${isLow ? "text-red-600" : "text-gray-900"}`}>
                              {item.stok}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">{item.unit}</span>
                          </div>
                          <div className="w-24 mx-auto h-1.5 bg-gray-200 rounded-full mt-1">
                            <div className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-green-400"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="p-4 text-center text-gray-500 text-sm">{item.minStok} {item.unit}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => openAdj(item, "masuk")}>
                              <Plus className="h-3.5 w-3.5 mr-1" /> Masuk
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => openAdj(item, "keluar")}>
                              <Minus className="h-3.5 w-3.5 mr-1" /> Keluar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="riwayat">
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Bahan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Jenis</th>
                    <th className="text-left p-4 font-medium text-gray-600">Jumlah</th>
                    <th className="text-left p-4 font-medium text-gray-600">Catatan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{h.itemName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          h.jenis === "masuk" ? "bg-green-100 text-green-700" :
                          h.jenis === "keluar" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {h.jenis === "masuk" ? "Masuk" : h.jenis === "keluar" ? "Keluar" : "Opname"}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{h.jumlah}</td>
                      <td className="p-4 text-gray-500 text-xs">{h.note}</td>
                      <td className="p-4 text-gray-400 text-xs">{h.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Adjustment Dialog */}
      <Dialog open={showAdj} onOpenChange={setShowAdj}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {adjType === "masuk" ? "Stok Masuk" : "Stok Keluar"} — {adjItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Jumlah ({adjItem?.unit})</Label>
              <Input className="mt-1 text-lg font-bold text-center" type="number" value={adjJumlah} onChange={(e) => setAdjJumlah(e.target.value)} />
            </div>
            <div>
              <Label>Catatan</Label>
              <Textarea className="mt-1" rows={2} value={adjNote} onChange={(e) => setAdjNote(e.target.value)} placeholder="Contoh: Restock dari supplier..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdj(false)}>Batal</Button>
            <Button disabled={!adjJumlah} onClick={saveAdj}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opname Dialog */}
      <Dialog open={showOpname} onOpenChange={setShowOpname}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stok Opname</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-500">Masukkan jumlah stok aktual untuk setiap bahan (kosongkan jika tidak berubah)</p>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Sistem: {item.stok} {item.unit}</p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder={String(item.stok)}
                    value={opnameData[item.id] ?? ""}
                    onChange={(e) => setOpnameData((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="text-center"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpname(false)}>Batal</Button>
            <Button onClick={saveOpname}>Simpan Opname</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
