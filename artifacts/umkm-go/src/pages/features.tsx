import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, ShoppingCart, ChefHat, Package, BarChart2, Users, Globe, Truck, Zap, Shield, Smartphone, Coffee } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: ShoppingCart,
    title: "POS Kasir F&B",
    desc: "Dine-in (nomor meja), takeaway, delivery. Varian, topping, modifier. Split bill, diskon, voucher. Pajak PB1 + service charge.",
    color: "bg-indigo-50 text-indigo-600",
    tag: "Inti",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display (KDS)",
    desc: "Antrian order real-time untuk dapur. Status per pesanan — Baru, Sedang Diproses, Siap Saji. Alert pesanan terlambat.",
    color: "bg-orange-50 text-orange-600",
    tag: "F&B",
  },
  {
    icon: Package,
    title: "HPP & Resep (BoM)",
    desc: "Resep per menu dengan bahan baku. HPP otomatis (moving average/FIFO). Margin markup view. Yield & waste factor.",
    color: "bg-green-50 text-green-600",
    tag: "F&B",
  },
  {
    icon: Package,
    title: "Stok & Opname",
    desc: "Multi-outlet stock management. PO ke supplier. Opname terjadwal. Alert stok minimum & kadaluarsa kritis untuk F&B.",
    color: "bg-red-50 text-red-600",
    tag: "Stok",
  },
  {
    icon: BarChart2,
    title: "Keuangan & Laporan",
    desc: "Kas masuk/keluar. Laporan laba kotor (omzet - HPP). Peak hour analysis. Profitabilitas per produk/kasir/jam. Export Excel/PDF.",
    color: "bg-purple-50 text-purple-600",
    tag: "Bisnis",
  },
  {
    icon: Users,
    title: "Karyawan & Shift",
    desc: "Data karyawan, role, shift, absensi via PIN di POS. Komisi & tip. Rekap gaji. Log aktivitas per kasir.",
    color: "bg-blue-50 text-blue-600",
    tag: "Tim",
  },
  {
    icon: Globe,
    title: "Marketplace Publik",
    desc: "Storefront publik per toko. Katalog + search + lokasi. Produk fisik & digital. Checkout pelanggan langsung.",
    color: "bg-teal-50 text-teal-600",
    tag: "Growth",
  },
  {
    icon: Coffee,
    title: "Tema per Kategori F&B",
    desc: "8 kategori bisnis: Coffee Shop, Warung, Bakery, Boba, Catering, dll. Setiap kategori punya tema khusus yang bisa dikustom.",
    color: "bg-amber-50 text-amber-600",
    tag: "Branding",
  },
  {
    icon: Globe,
    title: "Domain Kustom",
    desc: "Hubungkan domain Anda sendiri (namatoko.com). SSL otomatis. DNS CNAME setup mudah. Atau pakai subdomain gratis.",
    color: "bg-cyan-50 text-cyan-600",
    tag: "Domain",
  },
  {
    icon: Truck,
    title: "Kurir Internal & Ekspedisi",
    desc: "Akun kurir internal. Assign manual, update status + foto. Input resi JNE/J&T/SiCepat manual. Roadmap: integrasi Biteship.",
    color: "bg-emerald-50 text-emerald-600",
    tag: "Pengiriman",
  },
  {
    icon: Smartphone,
    title: "PWA & Mode Offline",
    desc: "App bisa diinstal di HP. Mode offline untuk POS — tetap bisa transaksi saat wifi putus. Sync otomatis saat online.",
    color: "bg-slate-50 text-slate-600",
    tag: "Mobile",
  },
  {
    icon: Shield,
    title: "Super Admin Control",
    desc: "Full kontrol feature flags, paket, limit, harga. Approve pembayaran QRIS. Moderasi toko. Metrik MRR & churn.",
    color: "bg-rose-50 text-rose-600",
    tag: "Admin",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 h-16 flex items-center px-4 sticky top-0 bg-white/90 backdrop-blur z-20">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/pricing"><Button variant="ghost" size="sm">Harga</Button></Link>
            <Link href="/register"><Button size="sm">Mulai Gratis</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            🚀 Fitur Lengkap untuk UMKM F&B Indonesia
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Semua yang Dibutuhkan<br />Bisnis F&B Anda
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Dari POS kasir hingga manajemen stok, keuangan, dan marketplace publik — semua dalam satu platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${f.color.split(" ")[0]}`}>
                  <f.icon className={`h-6 w-6 ${f.color.split(" ")[1]}`} />
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.tag}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison vs competitor */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Kenapa UMKM Go Beda?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "HPP Akurat", desc: "BoM + yield + waste — bukan sekadar stok sederhana seperti kompetitor" },
              { title: "Marketplace Built-in", desc: "Toko langsung punya storefront publik tanpa bikin website sendiri" },
              { title: "Tema per Kategori", desc: "Bukan template generic — tema khusus sesuai jenis usaha F&B" },
              { title: "Mode Offline", desc: "POS tetap jalan saat wifi mati — kritikal di mall & foodcourt" },
            ].map((p) => (
              <div key={p.title} className="bg-white rounded-xl p-4 shadow-sm">
                <Zap className="h-5 w-5 text-indigo-500 mb-2" />
                <p className="font-bold text-gray-900">{p.title}</p>
                <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Siap mencoba semua fitur ini?</h2>
          <p className="text-gray-500 mb-6">Trial 14 hari gratis, tidak perlu kartu kredit</p>
          <Link href="/register">
            <Button size="lg" className="h-12 px-8">
              Mulai Trial Gratis <Zap className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
