import { Link } from "wouter";
import { Store, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 h-16 flex items-center px-4">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-xl">UMKM Go</span>
          </Link>
          <Link href="/terms" className="text-sm text-indigo-600 hover:underline">Syarat & Ketentuan</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Terakhir diperbarui: 1 Januari 2026</p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8 text-sm text-indigo-800">
          <p className="font-semibold mb-1">Komitmen Kami</p>
          <p>Data Anda adalah milik Anda. Kami tidak menjual, menyewakan, atau membagikan data pribadi Anda ke pihak ketiga untuk tujuan komersial. Kebijakan ini menjelaskan secara transparan bagaimana kami mengumpulkan dan menggunakan data.</p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: "1. Data yang Kami Kumpulkan",
              content: [
                "Data Akun: nama, email, nomor telepon, nama bisnis, NPWP (opsional).",
                "Data Bisnis: produk, harga, stok, resep, HPP, data karyawan yang Anda masukkan.",
                "Data Transaksi: pesanan, pembayaran, laporan penjualan — untuk operasional POS dan marketplace.",
                "Data Teknis: alamat IP, browser, perangkat, log akses — untuk keamanan dan debugging.",
                "Data Marketplace: ulasan, rating, foto produk yang ditampilkan publik.",
              ],
            },
            {
              title: "2. Bagaimana Kami Menggunakan Data",
              content: [
                "Menyediakan dan mengoperasikan layanan UMKM Go.",
                "Mengirim notifikasi penting terkait akun (invoice, perubahan paket, keamanan).",
                "Backup harian untuk pemulihan bencana.",
                "Analitik agregat & anonim untuk peningkatan produk (tidak dapat diidentifikasi ke akun spesifik).",
                "Mematuhi kewajiban hukum di Indonesia.",
              ],
            },
            {
              title: "3. Penyimpanan & Keamanan Data",
              content: [
                "Data disimpan di server yang berlokasi di Indonesia atau Asia Tenggara.",
                "Enkripsi data saat transit (TLS 1.3) dan saat diam (AES-256).",
                "Row-Level Security (RLS) memastikan data antar tenant terisolasi.",
                "Akses data dibatasi hanya untuk karyawan yang membutuhkan untuk operasional.",
                "Backup harian dengan retensi 30 hari.",
              ],
            },
            {
              title: "4. Berbagi Data dengan Pihak Ketiga",
              content: [
                "Kami TIDAK menjual data Anda ke pihak ketiga.",
                "Penyedia infrastruktur (hosting, database) terikat perjanjian kerahasiaan.",
                "Payment gateway (untuk proses pembayaran) hanya menerima data minimal yang diperlukan.",
                "Jika diminta oleh otoritas hukum Indonesia dengan surat resmi yang sah.",
              ],
            },
            {
              title: "5. Hak Anda atas Data",
              content: [
                "Akses: Anda bisa melihat semua data yang kami miliki tentang Anda.",
                "Ekspor: Unduh semua data bisnis Anda kapan saja dalam format CSV/Excel.",
                "Koreksi: Perbarui data pribadi dan bisnis Anda kapan saja melalui pengaturan.",
                "Hapus: Minta penghapusan akun dan data — kami akan proses dalam 30 hari.",
                "Portabilitas: Data diekspor dalam format standar yang dapat dibaca aplikasi lain.",
              ],
            },
            {
              title: "6. Cookie & Pelacakan",
              content: [
                "Cookie sesi: untuk menjaga status login Anda.",
                "Cookie preferensi: menyimpan pengaturan tampilan.",
                "Kami tidak menggunakan cookie pelacakan iklan pihak ketiga.",
                "Anda bisa menolak cookie non-esensial melalui pengaturan browser.",
              ],
            },
            {
              title: "7. Data Anak-anak",
              content: [
                "Layanan kami tidak ditujukan untuk anak-anak di bawah 18 tahun.",
                "Jika Anda menemukan data anak yang tidak disengaja, segera hubungi kami di privacy@umkmgo.id.",
              ],
            },
            {
              title: "8. Perubahan Kebijakan",
              content: [
                "Perubahan material akan diberitahukan via email 30 hari sebelum berlaku.",
                "Versi sebelumnya tersedia di halaman ini.",
                "Penggunaan layanan setelah tanggal efektif = penerimaan kebijakan baru.",
              ],
            },
            {
              title: "9. Hubungi Kami tentang Privasi",
              content: [
                "Email: privacy@umkmgo.id",
                "Respon dalam 5 hari kerja untuk permintaan terkait data pribadi.",
                "Formulir kontak: /contact",
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.content.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed">
                    <span className="text-indigo-400 mt-1.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
