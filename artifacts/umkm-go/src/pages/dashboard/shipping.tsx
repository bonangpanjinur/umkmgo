import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Truck, Package, MapPin, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const couriers = [
  { id: "jne", name: "JNE", desc: "Pengiriman reguler dan ekspres ke seluruh Indonesia", active: true },
  { id: "jnt", name: "J&T Express", desc: "Layanan pengiriman cepat 1-2 hari", active: true },
  { id: "sicepat", name: "SiCepat", desc: "Pengiriman kilat dan hemat", active: false },
  { id: "pos", name: "Pos Indonesia", desc: "Layanan pengiriman pemerintah ke seluruh pelosok", active: false },
  { id: "shopee", name: "Shopee Express", desc: "Pengiriman terintegrasi Shopee", active: false },
  { id: "gosend", name: "GoSend", desc: "Pengiriman same-day dalam kota", active: true },
];

export default function ShippingPage() {
  const { toast } = useToast();
  const [activeCouriers, setActiveCouriers] = useState(
    Object.fromEntries(couriers.map((c) => [c.id, c.active]))
  );
  const [origin, setOrigin] = useState("Jakarta Selatan, DKI Jakarta");
  const [freeThreshold, setFreeThreshold] = useState("200000");

  const toggle = (id: string) => {
    setActiveCouriers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengiriman</h1>
          <p className="text-sm text-gray-500 mt-1">Atur kurir dan lokasi pengiriman toko Anda</p>
        </div>

        {/* Origin */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Lokasi Asal Pengiriman</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Kota/Kabupaten Asal</label>
              <Input className="mt-1" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Ongkos Gratis Minimum (Rp)</label>
              <Input
                className="mt-1"
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                placeholder="0 = tidak ada gratis ongkir"
              />
              <p className="text-xs text-gray-400 mt-1">
                Pelanggan mendapat gratis ongkir jika belanja di atas nominal ini
              </p>
            </div>
            <Button onClick={() => toast({ title: "Pengaturan disimpan" })}>Simpan Pengaturan</Button>
          </div>
        </div>

        {/* Couriers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Kurir yang Tersedia</h2>
          </div>
          <div className="space-y-3">
            {couriers.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-gray-100">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={activeCouriers[c.id]}
                  onCheckedChange={() => toggle(c.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-sm text-indigo-800">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            Integrasi ongkos kirim real-time menggunakan Rajaongkir API. Tarif dihitung otomatis berdasarkan berat produk
            dan jarak pengiriman. Fitur ini tersedia di paket Bisnis ke atas.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
