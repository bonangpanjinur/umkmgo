import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Store, Smartphone, BarChart, Shield, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-border z-50 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">UMKM Go</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Masuk</Link>
            <Link href="/register">
              <Button className="rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
        <div className="absolute inset-0 z-0">
          {/* landing page hero abstract gradient */}
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Background" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              ✨ Platform #1 untuk UMKM Indonesia
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-8">
              Buat Website Toko <br className="hidden md:block"/> dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">5 Menit</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Jangkau lebih banyak pelanggan, kelola pesanan via WhatsApp, dan tingkatkan penjualan bisnis Anda dengan mudah tanpa perlu keahlian coding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                  Buat Toko Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50">
                  Lihat Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary"/> Gratis Selamanya</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary"/> Tanpa Kartu Kredit</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Fitur Lengkap untuk UMKM</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk berjualan online secara profesional.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Mobile Friendly", desc: "Tampilan toko otomatis menyesuaikan layar HP pelanggan Anda." },
              { icon: Zap, title: "Beli via WhatsApp", desc: "Pesanan langsung masuk ke WhatsApp Anda dengan format rapi." },
              { icon: BarChart, title: "Dashboard Analitik", desc: "Pantau jumlah pengunjung dan pendapatan toko secara real-time." },
              { icon: Globe, title: "Link Toko Khusus", desc: "Dapatkan link umkm.go/toko-anda yang mudah diingat pelanggan." },
              { icon: Store, title: "Katalog Produk", desc: "Kelola produk, harga, dan ketersediaan barang dengan sangat mudah." },
              { icon: Shield, title: "Aman & Cepat", desc: "Server cloud super cepat yang menjamin toko Anda selalu online 24/7." },
            ].map((f, i) => (
              <Card key={i} className="p-8 rounded-2xl border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Pilih Paket Terbaik</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Harga transparan untuk setiap skala bisnis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="p-8 rounded-3xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Pemula</h3>
              <div className="mb-6"><span className="text-4xl font-extrabold">Gratis</span></div>
              <ul className="space-y-4 mb-8">
                {['Maks. 20 Produk', 'Link Toko Standar', 'Order via WhatsApp', 'Statistik Dasar'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl py-6">Pilih Gratis</Button>
            </Card>

            {/* Pro */}
            <Card className="p-8 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/10 relative scale-105 z-10">
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Paling Laris</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Profesional</h3>
              <div className="mb-6"><span className="text-4xl font-extrabold">Rp 49k</span><span className="text-gray-500">/bln</span></div>
              <ul className="space-y-4 mb-8">
                {['Produk Tanpa Batas', 'Tema Premium', 'Analitik Lengkap', 'Hapus Watermark UMKM Go', 'Prioritas Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-xl py-6 shadow-lg shadow-primary/30">Mulai Profesional</Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-8 rounded-3xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6"><span className="text-4xl font-extrabold">Hubungi Kami</span></div>
              <ul className="space-y-4 mb-8">
                {['Semua Fitur Pro', 'Domain Kustom (.com)', 'Integrasi API', 'Dedicated Account Manager'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl py-6">Konsultasi</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Store className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-white">UMKM Go</span>
          </div>
          <p className="text-sm">© 2025 UMKM Go Indonesia. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
