import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Clock, Store, ChevronRight, Coffee, Utensils } from "lucide-react";

const KATEGORIS = [
  { id: "all", label: "Semua", icon: "🍽️" },
  { id: "coffee", label: "Coffee Shop", icon: "☕" },
  { id: "fastfood", label: "Ayam & Fast Food", icon: "🍗" },
  { id: "snack", label: "Snack & Cemilan", icon: "🍟" },
  { id: "bakery", label: "Bakery & Dessert", icon: "🥐" },
  { id: "warung", label: "Warung Makan", icon: "🍱" },
  { id: "drinks", label: "Minuman Kekinian", icon: "🧋" },
  { id: "catering", label: "Catering & Healthy", icon: "🥗" },
];

const STORES = [
  { id: "1", slug: "warung-bu-sari", name: "Warung Bu Sari", tagline: "Masakan rumahan lezat dan terjangkau", kategori: "warung", kota: "Jakarta Selatan", rating: 4.8, reviews: 124, produk: 24, minOrder: 30000, jamBuka: "07:00 – 21:00", halal: true, delivery: true, img: "🍱" },
  { id: "2", slug: "kopi-gunung-emas", name: "Kopi Gunung Emas", tagline: "Specialty coffee & manual brew dari petani lokal", kategori: "coffee", kota: "Bandung", rating: 4.9, reviews: 89, produk: 18, minOrder: 25000, jamBuka: "08:00 – 22:00", halal: true, delivery: true, img: "☕" },
  { id: "3", slug: "geprek-mas-bro", name: "Geprek Mas Bro", tagline: "Ayam geprek level pedas 1–10, anti mainstream", kategori: "fastfood", kota: "Yogyakarta", rating: 4.7, reviews: 203, produk: 15, minOrder: 20000, jamBuka: "10:00 – 23:00", halal: true, delivery: true, img: "🍗" },
  { id: "4", slug: "sweet-bun-bakery", name: "Sweet Bun Bakery", tagline: "Artisan bread & pastry homemade fresh daily", kategori: "bakery", kota: "Surabaya", rating: 4.6, reviews: 67, produk: 32, minOrder: 50000, jamBuka: "07:00 – 18:00", halal: true, delivery: false, img: "🥐" },
  { id: "5", slug: "boba-time-jogja", name: "Boba Time Jogja", tagline: "Minuman kekinian dengan topping lengkap pilihan", kategori: "drinks", kota: "Yogyakarta", rating: 4.5, reviews: 156, produk: 28, minOrder: 15000, jamBuka: "10:00 – 22:00", halal: true, delivery: true, img: "🧋" },
  { id: "6", slug: "snack-viral-rina", name: "Snack Viral Rina", tagline: "Cemilan kekinian frozen food siap goreng", kategori: "snack", kota: "Bekasi", rating: 4.4, reviews: 45, produk: 20, minOrder: 50000, jamBuka: "09:00 – 20:00", halal: true, delivery: true, img: "🍟" },
  { id: "7", slug: "catering-sehat-ibna", name: "Catering Sehat Ibna", tagline: "Meal prep sehat harian, protein tinggi, kalori terkontrol", kategori: "catering", kota: "Jakarta Barat", rating: 4.8, reviews: 38, produk: 12, minOrder: 150000, jamBuka: "08:00 – 17:00", halal: true, delivery: true, img: "🥗" },
  { id: "8", slug: "warung-sederhana", name: "Warung Sederhana", tagline: "Masakan rumahan sederhana tapi memanjakan lidah", kategori: "warung", kota: "Depok", rating: 4.3, reviews: 29, produk: 4, minOrder: 25000, jamBuka: "08:00 – 20:00", halal: true, delivery: false, img: "🍱" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const filtered = STORES
    .filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.tagline.toLowerCase().includes(search.toLowerCase()) ||
        s.kota.toLowerCase().includes(search.toLowerCase());
      const matchKat = kategori === "all" || s.kategori === kategori;
      return matchSearch && matchKat;
    })
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : b.reviews - a.reviews);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">UMKM Go</span>
          </Link>
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-10"
              placeholder="Cari toko, produk, atau kota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">Dasbor</Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">Marketplace UMKM F&B Indonesia</h1>
          <p className="text-indigo-200">Temukan ribuan warung & resto lokal terbaik di kotamu</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-indigo-200">
            <span>🏪 {STORES.length}+ Toko Aktif</span>
            <span>🍽️ Ribuan Menu</span>
            <span>🚚 Pengiriman Tersedia</span>
            <span>✅ Terverifikasi Halal</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {KATEGORIS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKategori(k.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                ${kategori === k.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200"}`}
            >
              <span>{k.icon}</span>
              {k.label}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length} toko ditemukan</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600"
          >
            <option value="rating">Urut: Rating Tertinggi</option>
            <option value="reviews">Urut: Paling Banyak Ulasan</option>
          </select>
        </div>

        {/* Store Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Tidak ada toko ditemukan</p>
            <p className="text-gray-300 text-sm mt-1">Coba ubah kata kunci atau kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((store) => (
              <Link key={store.id} href={`/store/${store.slug}`}>
                <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group">
                  {/* Hero */}
                  <div className="h-36 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-5xl relative">
                    {store.img}
                    {store.halal && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">HALAL</span>
                    )}
                    {store.delivery && (
                      <span className="absolute top-2 right-2 bg-white text-indigo-600 text-xs font-bold px-1.5 py-0.5 rounded border border-indigo-100">🚚 Antar</span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{store.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{store.tagline}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{store.kota}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{store.jamBuka}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-800">{store.rating}</span>
                        <span className="text-xs text-gray-400">({store.reviews})</span>
                      </div>
                      <div className="text-xs text-gray-400">Min. {formatIDR(store.minOrder)}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
