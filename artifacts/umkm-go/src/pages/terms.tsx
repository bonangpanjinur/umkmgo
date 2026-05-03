import { Link } from "wouter";
import { Store } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 h-16 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <Link href="/privacy" className="text-sm text-indigo-600 hover:underline">Kebijakan Privasi</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Syarat & Ketentuan Layanan</h1>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 1 Januari 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          {[
            {
              title: "1. Penerimaan Syarat",
              content: "Dengan mendaftar dan menggunakan layanan UMKM Go, Anda menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju, harap hentikan penggunaan layanan kami. Syarat ini berlaku untuk semua pengguna termasuk pemilik toko (tenant), karyawan, dan pelanggan marketplace.",
            },
            {
              title: "2. Deskripsi Layanan",
              content: "UMKM Go adalah platform SaaS multi-tenant yang menyediakan: (a) sistem POS kasir untuk bisnis F&B; (b) manajemen stok dan HPP; (c) marketplace publik untuk toko UMKM; (d) storefront per toko dengan tema kustom; (e) laporan dan analitik bisnis. Kami berhak mengubah, menambah, atau menghentikan fitur dengan pemberitahuan sebelumnya.",
            },
            {
              title: "3. Akun dan Keamanan",
              content: "Anda bertanggung jawab atas keamanan akun dan kata sandi Anda. Satu akun email hanya boleh digunakan oleh satu entitas bisnis. Anda wajib memberikan informasi yang akurat saat mendaftar. Kami berhak menangguhkan akun yang terindikasi menyalahgunakan layanan atau melanggar syarat ini.",
            },
            {
              title: "4. Paket Langganan & Pembayaran",
              content: "Layanan tersedia dalam paket berbayar (Basic, Pro, Premium) dengan trial 14 hari gratis. Pembayaran dilakukan via QRIS atau transfer bank dengan konfirmasi manual oleh admin. Kami tidak menyimpan data kartu kredit. Tidak ada pengembalian dana (refund) kecuali ditetapkan lain. Setelah masa grace period 3 hari, akun yang tidak membayar akan dibatasi ke mode read-only.",
            },
            {
              title: "5. Data dan Privasi",
              content: "Data transaksi dan inventaris Anda adalah milik Anda. Kami tidak menjual data Anda ke pihak ketiga. Anda dapat mengekspor data kapan saja. Dengan menggunakan layanan, Anda mengizinkan kami memproses data untuk keperluan operasional platform (backup, analitik agregat anonim, keamanan). Lihat Kebijakan Privasi untuk detail lebih lanjut.",
            },
            {
              title: "6. Konten Pengguna",
              content: "Anda bertanggung jawab atas konten yang diunggah (foto produk, deskripsi, informasi toko). Dilarang mengunggah konten ilegal, menyesatkan, atau melanggar hak pihak lain. Kami berhak menghapus konten yang melanggar kebijakan tanpa pemberitahuan. Produk yang dijual di marketplace harus legal dan sesuai regulasi Indonesia.",
            },
            {
              title: "7. Batasan Tanggung Jawab",
              content: "UMKM Go menyediakan layanan 'apa adanya'. Kami tidak menjamin layanan bebas gangguan 100% (kecuali paket Premium dengan SLA 99.9%). Kami tidak bertanggung jawab atas kerugian bisnis yang diakibatkan oleh gangguan layanan, kecuali yang disebabkan oleh kelalaian kami yang terbukti.",
            },
            {
              title: "8. Perubahan Syarat",
              content: "Kami dapat memperbarui syarat ini dengan pemberitahuan 30 hari sebelumnya via email. Penggunaan layanan setelah tanggal efektif perubahan dianggap sebagai penerimaan syarat baru.",
            },
            {
              title: "9. Hukum yang Berlaku",
              content: "Syarat ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah terlebih dahulu, dan jika gagal, melalui Pengadilan Negeri Jakarta Selatan.",
            },
            {
              title: "10. Hubungi Kami",
              content: "Pertanyaan tentang syarat ini dapat dikirim ke: legal@umkmgo.id atau melalui halaman Kontak kami.",
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
