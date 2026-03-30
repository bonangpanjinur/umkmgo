import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Zap, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Gratis Selamanya",
    description: "Untuk UMKM yang baru mulai online",
    icon: Sparkles,
    color: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    features: [
      "1 toko online",
      "Hingga 10 produk",
      "Subdomain UMKM Go",
      "Tombol WhatsApp",
      "Tema basic (1 pilihan)",
      "Statistik dasar",
    ],
    cta: "Paket Aktif",
    ctaDisabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 99000,
    priceLabel: "Rp 99.000 / bulan",
    description: "Untuk UMKM yang ingin berkembang lebih cepat",
    icon: Zap,
    color: "border-primary ring-2 ring-primary/20",
    badgeColor: "bg-primary/10 text-primary",
    popular: true,
    features: [
      "Semua fitur Free",
      "Produk tidak terbatas",
      "2 tema premium",
      "Custom domain (.com, .id)",
      "Analytics lengkap",
      "Prioritas support",
      "Bulk import produk (CSV)",
      "Laporan penjualan",
    ],
    cta: "Upgrade ke Pro",
    ctaDisabled: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499000,
    priceLabel: "Rp 499.000 / bulan",
    description: "Untuk bisnis besar dengan kebutuhan khusus",
    icon: Building2,
    color: "border-purple-300",
    badgeColor: "bg-purple-100 text-purple-700",
    features: [
      "Semua fitur Pro",
      "Multi-toko (hingga 5 toko)",
      "API akses",
      "Dedicated support",
      "White-label opsi",
      "Email marketing",
      "Advanced analytics + export",
      "SLA 99.9% uptime",
    ],
    cta: "Hubungi Sales",
    ctaDisabled: false,
  },
];

export default function BillingPage() {
  const user = getUser();
  const currentTier = user?.tier || "free";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Billing & Subscription</h1>
        <p className="text-gray-500">Kelola paket langganan Anda</p>
      </div>

      {/* Current Plan Banner */}
      <Card className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-green-50 border-primary/30 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-primary mb-1">Paket Aktif Saat Ini</p>
            <h2 className="text-3xl font-bold text-gray-900 uppercase">{currentTier}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentTier === "free" ? "Anda menggunakan paket gratis" :
               currentTier === "pro" ? "Rp 99.000/bulan · Diperpanjang otomatis" :
               "Rp 499.000/bulan · Diperpanjang otomatis"}
            </p>
          </div>
          {currentTier === "free" && (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">Tingkatkan untuk fitur lebih banyak</p>
              <Button className="bg-primary hover:bg-primary/90">Upgrade Sekarang</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Plans */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Paket</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isActive = currentTier === plan.id;
          return (
            <Card key={plan.id} className={`p-6 rounded-2xl relative flex flex-col ${plan.color} ${isActive ? "shadow-md" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">PALING POPULER</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.badgeColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  {isActive && <span className="text-xs text-primary font-semibold">Paket Aktif</span>}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">{plan.priceLabel}</p>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${isActive ? "variant-outline" : plan.id === "pro" ? "" : "bg-gray-900 hover:bg-gray-800"}`}
                variant={isActive ? "outline" : "default"}
                disabled={isActive}
              >
                {isActive ? "Paket Aktif" : plan.cta}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Invoice History placeholder */}
      <Card className="p-6 rounded-2xl bg-white border-gray-200">
        <h3 className="text-base font-bold text-gray-900 mb-4">Riwayat Pembayaran</h3>
        {currentTier === "free" ? (
          <div className="py-8 text-center text-gray-400">
            <p className="text-sm">Belum ada riwayat pembayaran</p>
            <p className="text-xs mt-1">Upgrade ke Pro atau Enterprise untuk mulai berlangganan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">Paket {currentTier === "pro" ? "Pro" : "Enterprise"}</p>
                  <p className="text-xs text-gray-500">{new Date(Date.now() - i * 30 * 86400000).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{currentTier === "pro" ? "Rp 99.000" : "Rp 499.000"}</p>
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">Berhasil</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
