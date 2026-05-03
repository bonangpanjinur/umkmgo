import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    category: "Umum",
    items: [
      { q: "Apa itu UMKM Go?", a: "UMKM Go adalah platform SaaS POS (Point of Sale) dan marketplace untuk bisnis F&B Indonesia. Kami menyediakan kasir digital, manajemen stok & HPP, KDS dapur, laporan keuangan, dan storefront publik — semua dalam satu aplikasi." },
      { q: "Apakah ada trial gratis?", a: "Ya! Semua paket (Basic, Pro, Premium) dapat dicoba gratis selama 14 hari tanpa kartu kredit. Setelah 14 hari, Anda bisa pilih paket berbayar atau akun akan dibatasi ke fitur dasar." },
      { q: "Apakah UMKM Go cocok untuk warung kecil?", a: "Sangat cocok! Paket Basic mulai Rp 99.000/bulan sudah mencakup POS kasir lengkap, stok, dan storefront publik. Banyak warung kecil yang memulai dari sini dan berkembang ke paket lebih tinggi." },
    ],
  },
  {
    category: "Paket & Harga",
    items: [
      { q: "Apa perbedaan paket Basic, Pro, dan Premium?", a: "Basic: 1 outlet, 50 produk, POS & stok dasar. Pro: 3 outlet, 300 produk, KDS, marketplace, laporan lengkap. Premium: tidak terbatas, kurir internal, custom domain, integrasi kurir API, AI insight. Lihat halaman Harga untuk detail lengkap." },
      { q: "Bisa bayar tahunan? Ada diskon?", a: "Ya! Pembayaran tahunan menghemat 2 bulan (hemat ~16%). Basic: Rp 990.000/tahun, Pro: Rp 2.490.000/tahun, Premium: Rp 5.490.000/tahun." },
      { q: "Bagaimana cara membayar langganan?", a: "MVP saat ini: QRIS statis atau transfer bank, lalu upload bukti untuk disetujui admin. Roadmap: integrasi Midtrans/Xendit untuk pembayaran otomatis dan recurring." },
      { q: "Apa itu add-on? Berbeda dengan paket?", a: "Add-on adalah fitur tambahan yang bisa dibeli terpisah tanpa upgrade paket. Contoh: custom domain (Rp 50.000/bln), tema premium (Rp 150-350rb/tema), slot outlet ekstra, integrasi kurir API." },
    ],
  },
  {
    category: "Fitur Produk",
    items: [
      { q: "Apa itu KDS (Kitchen Display System)?", a: "KDS adalah layar antrian pesanan untuk dapur. Kasir input order → langsung muncul di layar dapur dengan status Baru, Sedang Dibuat, Siap Saji. Tersedia di paket Pro dan Premium." },
      { q: "Apakah bisa pakai QRIS untuk pembayaran pelanggan?", a: "Ya! Kasir bisa upload QR statis per outlet. Pelanggan scan dan bayar, kasir konfirmasi pembayaran. Roadmap: QRIS dinamis dengan auto-settlement." },
      { q: "Bagaimana cara connect domain sendiri?", a: "Di paket Premium atau dengan add-on domain: masukkan nama domain Anda, salin DNS Target yang diberikan, buat CNAME record di provider domain Anda, lalu klik Verifikasi. SSL akan aktif otomatis." },
      { q: "Apakah bisa pakai offline saat internet mati?", a: "Fitur PWA offline tersedia untuk POS — transaksi tetap berjalan, data tersimpan lokal, dan sync otomatis saat internet kembali. Ini sangat penting untuk operasional di mall dan foodcourt." },
    ],
  },
  {
    category: "Teknis & Data",
    items: [
      { q: "Apakah data saya aman?", a: "Data tenant disimpan terpisah dengan row-level security. Backup harian otomatis. Export data self-service kapan saja. Kami tidak pernah menjual atau membagi data tenant ke pihak ketiga." },
      { q: "Berapa banyak produk yang bisa ditambahkan?", a: "Tergantung paket: Basic maks 50 produk, Pro maks 300 produk, Premium tidak terbatas. Setiap produk mendukung varian, harga, foto, HPP per resep, dan toggle aktif/nonaktif." },
      { q: "Apakah bisa diakses dari HP?", a: "Ya! UMKM Go adalah Progressive Web App (PWA) yang bisa diinstal di HP Android dan iOS. Tampilan responsif dan mobile-first, cocok untuk kasir yang pakai tablet atau smartphone." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-indigo-600 transition-colors"
      >
        <span className="font-medium text-gray-900">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-indigo-500" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />}
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 h-16 flex items-center px-4 sticky top-0 bg-white/90 backdrop-blur z-20">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/pricing"><Button variant="ghost" size="sm">Harga</Button></Link>
            <Link href="/contact"><Button size="sm" variant="outline">Hubungi Kami</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pertanyaan Umum</h1>
          <p className="text-gray-500 text-lg">Tidak menemukan jawaban? <Link href="/contact" className="text-indigo-600 hover:underline">Hubungi kami</Link></p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-bold text-gray-900 mb-2 pb-2 border-b border-gray-200">{section.category}</h2>
              <div className="bg-white rounded-xl border border-gray-100 px-5 divide-y divide-gray-50">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Masih ada pertanyaan?</h2>
          <p className="text-gray-500 mb-4">Tim kami siap membantu via WhatsApp atau email</p>
          <div className="flex gap-3 justify-center">
            <Link href="/contact"><Button>Hubungi Kami</Button></Link>
            <Link href="/register"><Button variant="outline">Coba Gratis</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
