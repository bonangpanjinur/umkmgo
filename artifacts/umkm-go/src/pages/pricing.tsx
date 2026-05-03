import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, Check, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 99000,
    yearly: 990000,
    trial: 14,
    color: "border-gray-200",
    badge: "",
    features: [
      "1 outlet",
      "Maks 50 produk",
      "POS kasir lengkap",
      "HPP & stok dasar",
      "Storefront publik (path-based)",
      "1 tema gratis kategori",
      "Laporan penjualan dasar",
      "Support via Email",
    ],
    disabled: ["KDS dapur", "Multi-outlet", "Marketplace listing", "Export Excel/PDF", "Domain kustom"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 249000,
    yearly: 2490000,
    trial: 14,
    color: "border-indigo-500",
    badge: "Paling Populer",
    features: [
      "Maks 3 outlet",
      "Maks 300 produk",
      "POS + KDS dapur",
      "HPP lengkap + resep (BoM)",
      "Stok opname + PO supplier",
      "Karyawan & shift (maks 15)",
      "Marketplace listing aktif",
      "Laporan keuangan lengkap",
      "Export Excel & PDF",
      "Subdomain nama.umkmgo.id",
      "1 tema gratis per kategori",
      "Support Email + Chat",
    ],
    disabled: ["Kurir internal", "Custom domain (add-on Rp 50rb/bln)", "Integrasi kurir API (add-on)"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 549000,
    yearly: 5490000,
    trial: 14,
    color: "border-amber-400",
    badge: "Terlengkap",
    features: [
      "Outlet tak terbatas",
      "Produk tak terbatas",
      "Semua fitur Pro +",
      "Kurir internal sendiri",
      "Produk digital (voucher, e-book)",
      "Custom domain gratis",
      "Semua tema dasar gratis",
      "Integrasi kurir API (Biteship)",
      "Laporan AI insight",
      "API akses penuh",
      "SLA 99.9% uptime",
      "Priority support WA + dedikasi",
    ],
    disabled: [],
  },
];

const addons = [
  { name: "Custom Domain", desc: "Hubungkan domain sendiri ke toko", price: "Rp 50.000/bln", tag: "Domain" },
  { name: "Tema Premium", desc: "Desain eksklusif per kategori F&B", price: "Rp 150–350rb/tema", tag: "Tema" },
  { name: "Slot Outlet Ekstra", desc: "+1 outlet untuk paket Pro", price: "Rp 75.000/bln", tag: "Kapasitas" },
  { name: "Integrasi Kurir API", desc: "Real-time ongkir & auto shipment via Biteship", price: "Rp 99.000/bln", tag: "Kurir" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 h-16 flex items-center px-4 sticky top-0 bg-white/80 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
            <Link href="/register"><Button size="sm">Coba Gratis 14 Hari</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            💰 Harga Transparan, Tanpa Biaya Tersembunyi
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pilih Paket yang Tepat</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Mulai gratis 14 hari, tanpa kartu kredit. Batalkan kapan saja. ARPU terjangkau untuk UMKM Indonesia.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 ${plan.color} p-6 ${plan.badge === "Paling Populer" ? "shadow-xl shadow-indigo-100" : ""}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full
                  ${plan.badge === "Paling Populer" ? "bg-indigo-600 text-white" : "bg-amber-400 text-amber-900"}`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-3">
                  <span className="text-4xl font-black text-gray-900">{formatIDR(plan.price)}</span>
                  <span className="text-gray-400 text-sm">/bulan</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  atau {formatIDR(plan.yearly)}/tahun <span className="text-green-600 font-medium">(hemat 2 bln)</span>
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-1">Trial {plan.trial} hari gratis ✓</p>
              </div>

              <Link href="/register">
                <Button className={`w-full mb-6 ${plan.badge === "Paling Populer" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  variant={plan.badge === "Paling Populer" ? "default" : "outline"}>
                  Mulai {plan.name} <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
                {plan.disabled.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="h-4 w-4 flex items-center justify-center flex-shrink-0">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Add-ons */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Add-on Tambahan</h2>
            <p className="text-gray-500 mt-2">Beli fitur terpisah sesuai kebutuhan, tanpa upgrade paket</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((a) => (
              <div key={a.name} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{a.tag}</span>
                <p className="font-bold text-gray-900 mt-3">{a.name}</p>
                <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
                <p className="text-indigo-600 font-bold mt-3">{a.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ada pertanyaan tentang harga?</h2>
          <p className="text-gray-500 mb-4">Baca FAQ kami atau hubungi tim sales untuk mendapatkan penawaran khusus</p>
          <div className="flex gap-3 justify-center">
            <Link href="/faq"><Button variant="outline">Lihat FAQ</Button></Link>
            <Link href="/contact"><Button>Hubungi Sales</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
