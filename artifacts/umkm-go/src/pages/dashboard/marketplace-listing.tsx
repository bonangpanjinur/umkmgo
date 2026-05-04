import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Eye, Star, ShoppingBag, TrendingUp, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetMyStore, useListOrders, useGetDashboardStats } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

export default function MarketplaceListingPage() {
  const { toast } = useToast();
  const { data: store } = useGetMyStore(AUTH());
  const { data: ordersData } = useListOrders({ page: 1, limit: 200 }, AUTH());
  const { data: stats } = useGetDashboardStats(AUTH());

  const [listed, setListed] = useState(true);
  const [tagline, setTagline] = useState("Makanan rumahan lezat dan terjangkau");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? "08123456789");
  const [jamBuka, setJamBuka] = useState("07:00 – 22:00");
  const [halal, setHalal] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [minOrder, setMinOrder] = useState("50000");

  const slug = store?.slug ?? "toko-saya";
  const storeUrl = `${window.location.origin}/store/${slug}`;

  const totalOrders = ordersData?.data?.length ?? 0;
  const completedOrders = ordersData?.data?.filter((o) => o.status === "completed").length ?? 0;
  const conversionRate = stats?.conversionRate ?? 0;
  const visitors = stats?.visitors ?? 0;

  const kpis = [
    { label: "Total Tayangan", value: visitors.toLocaleString("id-ID"), icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pesanan Masuk", value: String(totalOrders), icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pesanan Selesai", value: String(completedOrders), icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Konversi", value: `${conversionRate}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Listing Marketplace</h1>
            <p className="text-sm text-gray-500">Kelola tampilan toko di marketplace publik UMKM Go</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Tampil di Marketplace</span>
            <Switch checked={listed} onCheckedChange={setListed} />
          </div>
        </div>

        {/* Store URL */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">URL Toko Publik</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
            <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-mono text-gray-700 flex-1 truncate">{storeUrl}</span>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(storeUrl); toast({ title: "URL disalin!" }); }}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.open(storeUrl, "_blank")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats from real data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`p-2 w-fit rounded-lg ${s.bg} mb-3`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Info Toko */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Informasi Toko di Marketplace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tagline / Deskripsi Singkat</Label>
              <Input className="mt-1" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={80} />
              <p className="text-xs text-gray-400 mt-0.5">{tagline.length}/80 karakter</p>
            </div>
            <div>
              <Label>WhatsApp Order</Label>
              <Input className="mt-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="08xxx" />
            </div>
            <div>
              <Label>Jam Operasional</Label>
              <Input className="mt-1" value={jamBuka} onChange={(e) => setJamBuka(e.target.value)} placeholder="07:00 – 22:00" />
            </div>
            <div>
              <Label>Minimum Order (Rp)</Label>
              <Input className="mt-1" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={halal} onCheckedChange={setHalal} />
              <span className="text-sm text-gray-700">🥩 Halal Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={delivery} onCheckedChange={setDelivery} />
              <span className="text-sm text-gray-700">🚚 Layanan Antar</span>
            </div>
          </div>
          <Button onClick={() => toast({ title: "Informasi toko disimpan" })}>Simpan Perubahan</Button>
        </div>

        {!listed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <p className="font-semibold">Toko Anda tidak tampil di marketplace</p>
            <p className="mt-0.5">Aktifkan toggle di atas agar toko Anda bisa ditemukan oleh pelanggan baru di marketplace publik UMKM Go.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
