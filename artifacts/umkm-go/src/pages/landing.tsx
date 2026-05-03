import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, ShoppingCart, ChefHat, Package,
  BarChart2, Globe, Store, Smartphone, Users, Star, Zap, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: ShoppingCart, title: "Kasir POS F&B", desc: "Dine-in, takeaway, delivery. QRIS + tunai. Cetak struk. KDS dapur real-time.", color: "bg-indigo-50 text-indigo-600" },
  { icon: Package, title: "HPP & Stok Otomatis", desc: "Resep per menu, HPP moving average, stok opname, alert kadaluarsa.", color: "bg-orange-50 text-orange-600" },
  { icon: BarChart2, title: "Laporan Keuangan", desc: "Laba kotor, peak hour, profitabilitas per produk. Export Excel & PDF.", color: "bg-green-50 text-green-600" },
  { icon: Globe, title: "Marketplace & Storefront", desc: "Toko publik otomatis. 8 tema kategori F&B. Domain kustom. SEO siap.", color: "bg-purple-50 text-purple-600" },
  { icon: Users, title: "Karyawan & Shift", desc: "Multi-role: kasir, dapur, gudang, kurir. Absensi PIN. Rekap gaji.", color: "bg-blue-50 text-blue-600" },
  { icon: Smartphone, title: "PWA Offline Mode", desc: "Instal di HP. POS tetap jalan saat wifi mati — kritikal di foodcourt.", color: "bg-teal-50 text-teal-600" },
];

const categories = [
  { icon: "☕", name: "Coffee Shop", desc: "Earthy tones, menu by section" },
  { icon: "🍗", name: "Ayam & Fast Food", desc: "Bold, paket hemat, CTA sticky" },
  { icon: "🍟", name: "Snack & Frozen", desc: "Playful, grid rapat, badge viral" },
  { icon: "🥐", name: "Bakery & Dessert", desc: "Pastel elegan, magazine layout" },
  { icon: "🍱", name: "Warung Makan", desc: "Homey, halal mark, prasmanan" },
  { icon: "🧋", name: "Boba & Juice Bar", desc: "Vibrant, topping builder, sugar level" },
  { icon: "🥗", name: "Catering & Healthy", desc: "Clean, nutrisi info, meal plan" },
  { icon: "🍽️", name: "Umum F&B", desc: "Fallback netral, semua jenis usaha" },
];

const testimonials = [
  { name: "Ibu Sari", store: "Warung Bu Sari, Jakarta", text: "Sejak pakai UMKM Go, omzet naik 30%. Sekarang bisa lihat mana menu paling laku tiap hari dari HP.", stars: 5, emoji: "🍱" },
  { name: "Mas Budi", store: "Kopi Gunung Emas, Bandung", text: "HPP-nya akurat banget. Akhirnya tau menu mana yang rugi dan mana yang untung. Game changer!", stars: 5, emoji: "☕" },
  { name: "Mbak Rina", store: "Snack Viral, Bekasi", text: "POS offline-nya gokil. Waktu wifi mati di bazar tetap bisa transaksi. Ga ada pesaing yang punya ini.", stars: 5, emoji: "🍟" },
];

const plans = [
  { name: "Basic", price: "99rb", period: "/bulan", features: ["1 outlet", "50 produk", "POS lengkap", "Storefront publik"], color: "border-gray-200", cta: "Mulai Basic" },
  { name: "Pro", price: "249rb", period: "/bulan", features: ["3 outlet", "KDS dapur", "Marketplace listing", "Laporan lengkap"], color: "border-indigo-500 shadow-xl shadow-indigo-100", badge: "Populer", cta: "Mulai Pro" },
  { name: "Premium", price: "549rb", period: "/bulan", features: ["Outlet tak terbatas", "Kurir internal", "Custom domain gratis", "AI insight"], color: "border-amber-400", cta: "Mulai Premium" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">UMKM Go</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/features" className="hover:text-indigo-600 transition-colors">Fitur</Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Harga</Link>
            <Link href="/marketplace" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
            <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block">Masuk</Link>
            <Link href="/register">
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                Coba Gratis 14 Hari <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-indigo-200">
                <Zap className="w-4 h-4" /> Platform POS F&B #1 untuk UMKM Indonesia
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                Kasir, Stok, Laporan &<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Toko Online
                </span>{" "}dalam 1 App
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
                Sistem POS F&B lengkap dengan HPP otomatis, KDS dapur, marketplace publik, dan 8 tema toko per kategori bisnis. Trial 14 hari, tanpa kartu kredit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-base rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
                    Mulai Gratis Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-2">
                    Lihat Marketplace 🍽️
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-400 mt-4">Sudah dipakai 2.000+ warung & resto di seluruh Indonesia</p>
            </motion.div>
          </div>

          {/* Demo badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {["☕ Coffee Shop", "🍗 Warung Ayam", "🍱 Warung Makan", "🥐 Bakery", "🧋 Boba & Juice", "🥗 Catering"].map((cat) => (
              <span key={cat} className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {cat}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "2.000+", label: "Toko Aktif" },
            { val: "500rb+", label: "Transaksi/Bulan" },
            { val: "8", label: "Tema Kategori F&B" },
            { val: "99.9%", label: "Uptime SLA" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black">{s.val}</p>
              <p className="text-indigo-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Semua yang Dibutuhkan Bisnis F&B Anda
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Dari kasir hingga dapur, stok, keuangan, dan storefront publik — semua satu platform</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`p-3 rounded-xl ${f.color.split(" ")[0]} w-fit mb-4`}>
                  <f.icon className={`h-6 w-6 ${f.color.split(" ")[1]}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/features">
              <Button variant="outline" size="lg" className="rounded-full">
                Lihat Semua Fitur <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8 Kategori Tema */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-amber-200">
              🎨 Tema Unik per Kategori
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Storefront yang Terasa "Dibuat Khusus"
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Bukan satu template generic. Setiap kategori F&B punya tema yang dirancang khusus sesuai karakter bisnisnya.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <span className="text-4xl block mb-3">{c.icon}</span>
                <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="rounded-full">
                Lihat Toko di Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kenapa UMKM Go Beda dari Kompetitor?</h2>
            <p className="text-gray-500">Yang sering jadi keluhan pengguna Moka, Pawoon, Olsera, dan Majoo</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 font-semibold text-gray-600">Fitur</th>
                  <th className="text-center p-4 font-bold text-indigo-600">UMKM Go</th>
                  <th className="text-center p-4 font-medium text-gray-400">Kompetitor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["HPP akurat (BoM + yield + waste)", true, false],
                  ["Marketplace publik built-in", true, false],
                  ["Tema per kategori F&B (8 kategori)", true, false],
                  ["POS offline mode (PWA)", true, false],
                  ["KDS dapur real-time", true, "sebagian"],
                  ["Custom domain untuk toko", true, "berbayar mahal"],
                  ["Harga transparan Bahasa Indonesia", true, false],
                  ["Support WhatsApp", true, "sebagian"],
                ].map(([label, umkm, comp]) => (
                  <tr key={label as string} className="border-b border-gray-50">
                    <td className="p-4 text-gray-700">{label}</td>
                    <td className="p-4 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-gray-400 text-xs">
                      {comp === false ? "✗" : typeof comp === "string" ? comp : "✓"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Kata Mereka yang Sudah Pakai</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.store}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Harga Terjangkau, Transparan</h2>
            <p className="text-gray-500">Trial 14 hari gratis di semua paket. Tidak perlu kartu kredit.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl border-2 ${p.color} p-6 bg-white relative`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {p.badge}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                <div className="my-3">
                  <span className="text-3xl font-black">Rp {p.price}</span>
                  <span className="text-gray-400 text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full" variant={p.badge ? "default" : "outline"}>{p.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/pricing" className="text-indigo-600 hover:underline text-sm font-medium">
              Lihat perbandingan lengkap semua paket →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mulai Gratis Sekarang</h2>
          <p className="text-indigo-200 text-lg mb-8">
            Bergabung dengan 2.000+ UMKM F&B Indonesia. Setup dalam 5 menit, tanpa kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-base rounded-full font-bold">
                Buat Akun Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-base rounded-full text-white border-2 border-white/30 hover:bg-white/10">
                Hubungi Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">UMKM Go</span>
            </div>
            <p className="text-sm leading-relaxed">Platform POS & marketplace untuk UMKM F&B Indonesia.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Produk</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white transition-colors">Fitur</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Harga</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Perusahaan</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Lacak Pesanan</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3 text-sm">Legal</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© 2026 UMKM Go. Dibuat dengan ❤️ untuk UMKM Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
