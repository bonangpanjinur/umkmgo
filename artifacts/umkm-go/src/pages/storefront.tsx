import { useRoute } from "wouter";
import { useGetStoreBySlug } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle, Store as StoreIcon, Loader2, MapPin, Phone, Star, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type ThemeKey = "coffee" | "fastfood" | "snack" | "bakery" | "warung" | "drinks" | "catering" | "generic";

interface ThemeConfig {
  header: string;
  headerOverlay: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentLight: string;
  bodyBg: string;
  cardBg: string;
  cardBorder: string;
  tagBg: string;
  tagText: string;
  waBtn: string;
  waBtnHover: string;
  emoji: string;
  tagline: string;
  badgePriceBg: string;
  badgePriceText: string;
  sectionTitle: string;
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
  coffee: {
    header: "bg-gradient-to-br from-stone-900 via-amber-950 to-stone-800",
    headerOverlay: "from-stone-900/80 to-transparent",
    accent: "#b45309",
    accentHover: "#92400e",
    accentText: "text-amber-700",
    accentLight: "bg-amber-50 border-amber-100",
    bodyBg: "bg-amber-50",
    cardBg: "bg-white",
    cardBorder: "border-amber-100 hover:border-amber-300",
    tagBg: "bg-amber-100",
    tagText: "text-amber-800",
    waBtn: "bg-amber-800",
    waBtnHover: "hover:bg-amber-900",
    emoji: "☕",
    tagline: "Nikmatkan Setiap Tegukan",
    badgePriceBg: "bg-amber-700",
    badgePriceText: "text-white",
    sectionTitle: "text-stone-800",
  },
  fastfood: {
    header: "bg-gradient-to-br from-red-700 via-red-600 to-orange-500",
    headerOverlay: "from-red-900/60 to-transparent",
    accent: "#dc2626",
    accentHover: "#b91c1c",
    accentText: "text-red-600",
    accentLight: "bg-red-50 border-red-100",
    bodyBg: "bg-gray-50",
    cardBg: "bg-white",
    cardBorder: "border-red-100 hover:border-red-300",
    tagBg: "bg-red-100",
    tagText: "text-red-700",
    waBtn: "bg-red-600",
    waBtnHover: "hover:bg-red-700",
    emoji: "🍗",
    tagline: "Cepat, Lezat, Kenyang!",
    badgePriceBg: "bg-red-600",
    badgePriceText: "text-white",
    sectionTitle: "text-gray-900",
  },
  snack: {
    header: "bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500",
    headerOverlay: "from-orange-600/40 to-transparent",
    accent: "#ea580c",
    accentHover: "#c2410c",
    accentText: "text-orange-600",
    accentLight: "bg-orange-50 border-orange-100",
    bodyBg: "bg-yellow-50",
    cardBg: "bg-white",
    cardBorder: "border-orange-100 hover:border-orange-300",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    waBtn: "bg-orange-500",
    waBtnHover: "hover:bg-orange-600",
    emoji: "🍟",
    tagline: "Camilan Favorit Keluarga!",
    badgePriceBg: "bg-orange-500",
    badgePriceText: "text-white",
    sectionTitle: "text-gray-900",
  },
  bakery: {
    header: "bg-gradient-to-br from-pink-300 via-rose-200 to-pink-400",
    headerOverlay: "from-rose-800/30 to-transparent",
    accent: "#be185d",
    accentHover: "#9d174d",
    accentText: "text-rose-600",
    accentLight: "bg-rose-50 border-rose-100",
    bodyBg: "bg-pink-50",
    cardBg: "bg-white",
    cardBorder: "border-rose-100 hover:border-rose-300",
    tagBg: "bg-rose-100",
    tagText: "text-rose-700",
    waBtn: "bg-rose-600",
    waBtnHover: "hover:bg-rose-700",
    emoji: "🥐",
    tagline: "Roti & Kue Artisanal Terbaik",
    badgePriceBg: "bg-rose-500",
    badgePriceText: "text-white",
    sectionTitle: "text-rose-900",
  },
  warung: {
    header: "bg-gradient-to-br from-green-900 via-teal-800 to-green-800",
    headerOverlay: "from-green-900/70 to-transparent",
    accent: "#15803d",
    accentHover: "#166534",
    accentText: "text-green-700",
    accentLight: "bg-green-50 border-green-100",
    bodyBg: "bg-green-50",
    cardBg: "bg-white",
    cardBorder: "border-green-100 hover:border-green-300",
    tagBg: "bg-green-100",
    tagText: "text-green-800",
    waBtn: "bg-green-700",
    waBtnHover: "hover:bg-green-800",
    emoji: "🍱",
    tagline: "Masakan Rumahan, Cita Rasa Nusantara",
    badgePriceBg: "bg-green-700",
    badgePriceText: "text-white",
    sectionTitle: "text-green-900",
  },
  drinks: {
    header: "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600",
    headerOverlay: "from-purple-900/60 to-transparent",
    accent: "#7c3aed",
    accentHover: "#6d28d9",
    accentText: "text-purple-600",
    accentLight: "bg-purple-50 border-purple-100",
    bodyBg: "bg-purple-50",
    cardBg: "bg-white",
    cardBorder: "border-purple-100 hover:border-purple-300",
    tagBg: "bg-purple-100",
    tagText: "text-purple-700",
    waBtn: "bg-purple-600",
    waBtnHover: "hover:bg-purple-700",
    emoji: "🧋",
    tagline: "Segar, Hits, Kekinian!",
    badgePriceBg: "bg-purple-600",
    badgePriceText: "text-white",
    sectionTitle: "text-purple-900",
  },
  catering: {
    header: "bg-gradient-to-br from-teal-700 via-cyan-600 to-teal-600",
    headerOverlay: "from-teal-900/60 to-transparent",
    accent: "#0d9488",
    accentHover: "#0f766e",
    accentText: "text-teal-600",
    accentLight: "bg-teal-50 border-teal-100",
    bodyBg: "bg-teal-50",
    cardBg: "bg-white",
    cardBorder: "border-teal-100 hover:border-teal-300",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    waBtn: "bg-teal-600",
    waBtnHover: "hover:bg-teal-700",
    emoji: "🥗",
    tagline: "Sehat, Bergizi, Lezat",
    badgePriceBg: "bg-teal-600",
    badgePriceText: "text-white",
    sectionTitle: "text-teal-900",
  },
  generic: {
    header: "bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-500",
    headerOverlay: "from-indigo-900/60 to-transparent",
    accent: "#4f46e5",
    accentHover: "#4338ca",
    accentText: "text-indigo-600",
    accentLight: "bg-indigo-50 border-indigo-100",
    bodyBg: "bg-gray-50",
    cardBg: "bg-white",
    cardBorder: "border-gray-100 hover:border-indigo-200",
    tagBg: "bg-indigo-100",
    tagText: "text-indigo-700",
    waBtn: "bg-indigo-600",
    waBtnHover: "hover:bg-indigo-700",
    emoji: "🍽️",
    tagline: "Menu Pilihan Terbaik untuk Anda",
    badgePriceBg: "bg-indigo-600",
    badgePriceText: "text-white",
    sectionTitle: "text-gray-900",
  },
};

function getThemeKey(categoryName?: string | null): ThemeKey {
  if (!categoryName) return "generic";
  const l = categoryName.toLowerCase();
  if (l.includes("kopi") || l.includes("coffee") || l.includes("kedai kopi")) return "coffee";
  if (l.includes("ayam") || l.includes("fast food") || l.includes("geprek") || l.includes("burger") || l.includes("fried")) return "fastfood";
  if (l.includes("snack") || l.includes("cemilan") || l.includes("frozen")) return "snack";
  if (l.includes("bakery") || l.includes("pastry") || l.includes("dessert") || l.includes("kue") || l.includes("roti")) return "bakery";
  if (l.includes("warung") || l.includes("rumah makan") || l.includes("nasi")) return "warung";
  if (l.includes("minuman") || l.includes("boba") || l.includes("juice") || l.includes("kekinian") || l.includes("drink")) return "drinks";
  if (l.includes("catering") || l.includes("meal") || l.includes("healthy") || l.includes("sehat") || l.includes("diet")) return "catering";
  return "generic";
}

function formatIDR(num: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
}

export default function Storefront() {
  const [, params] = useRoute("/store/:slug");
  const slug = params?.slug || "";
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);

  const { data: store, isLoading, error } = useGetStoreBySlug(slug);

  const themeKey = getThemeKey(store?.categoryName);
  const t = THEMES[themeKey];

  const addToCart = (product: any) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      if (ex) return prev.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const orderViaWhatsApp = () => {
    if (!store?.whatsapp) return;
    const wa = store.whatsapp.startsWith("0") ? "62" + store.whatsapp.slice(1) : store.whatsapp;
    const items = cart.map((c) => `• ${c.name} x${c.qty} = ${formatIDR(c.price * c.qty)}`).join("\n");
    const text = encodeURIComponent(
      `Halo ${store.name}! 👋\n\nSaya ingin memesan:\n${items}\n\n*Total: ${formatIDR(cartTotal)}*\n\nMohon konfirmasinya 🙏`
    );
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  };

  const handleBuySingle = (productName: string) => {
    if (!store?.whatsapp) return alert("Toko belum mengatur nomor WhatsApp");
    const wa = store.whatsapp.startsWith("0") ? "62" + store.whatsapp.slice(1) : store.whatsapp;
    const text = encodeURIComponent(`Halo ${store.name}, saya ingin memesan: *${productName}*`);
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat toko...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <StoreIcon className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Toko Tidak Ditemukan</h1>
        <p className="text-gray-500 max-w-xs">Mungkin link salah atau toko telah dihapus. Coba cek kembali URL-nya.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bodyBg} pb-28`}>
      {/* Hero Header */}
      <div className={`${t.header} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)`
        }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-16">
          {/* Theme Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-white/80 text-sm font-medium">{store.categoryName || "F&B"}</span>
          </div>

          {/* Store Identity */}
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-1.5 shadow-2xl flex-shrink-0">
              <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{t.emoji}</span>
                )}
              </div>
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{store.name}</h1>
              <p className="text-white/70 text-sm mt-1 italic">"{t.tagline}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Info Strip */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 mb-6">
        <div className={`${t.cardBg} rounded-2xl shadow-lg border ${t.cardBorder} p-4`}>
          {store.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{store.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {store.whatsapp && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {store.whatsapp}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Buka Setiap Hari
            </span>
            <span className="flex items-center gap-1.5 font-medium" style={{ color: t.accent }}>
              <Star className="w-3.5 h-3.5 fill-current" />
              {store.products?.length || 0} produk tersedia
            </span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${t.sectionTitle} flex items-center gap-2`}>
            <ShoppingBag className="w-5 h-5" style={{ color: t.accent }} />
            Daftar Menu
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: t.accent }}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount} item · {formatIDR(cartTotal)}
            </button>
          )}
        </div>

        {!store.products || store.products.length === 0 ? (
          <div className={`text-center py-16 ${t.cardBg} rounded-2xl border-2 border-dashed ${t.cardBorder}`}>
            <span className="text-5xl">{t.emoji}</span>
            <p className="text-gray-500 mt-3">Toko ini belum menambahkan produk.</p>
            <p className="text-gray-400 text-sm">Silakan hubungi toko untuk info lebih lanjut.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {store.products.map((product, idx) => {
              const inCart = cart.find((c) => c.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <div className={`${t.cardBg} rounded-2xl border-2 ${t.cardBorder} overflow-hidden transition-all hover:shadow-lg flex flex-col h-full relative`}>
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {t.emoji}
                        </div>
                      )}
                      {inCart && (
                        <div
                          className="absolute top-2 right-2 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg"
                          style={{ backgroundColor: t.accent }}
                        >
                          {inCart.qty}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 gap-1">
                        <span
                          className={`text-sm font-bold ${t.badgePriceBg} ${t.badgePriceText} px-2 py-0.5 rounded-lg`}
                        >
                          {formatIDR(Number(product.price))}
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-full text-white text-lg flex items-center justify-center shadow-md transition-transform active:scale-90"
                          style={{ backgroundColor: t.accent }}
                          aria-label="Tambah ke keranjang"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Order Bar */}
      {store.whatsapp && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            {cart.length > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setCartOpen(true)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all`}
                  style={{ borderColor: t.accent, color: t.accent }}
                >
                  Lihat Keranjang ({cartCount})
                </button>
                <button
                  onClick={orderViaWhatsApp}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${t.waBtn} ${t.waBtnHover}`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan via WhatsApp
                </button>
              </div>
            ) : (
              <button
                onClick={() => store.whatsapp && handleBuySingle("menu pilihan saya")}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${t.waBtn} ${t.waBtnHover}`}
              >
                <MessageCircle className="w-5 h-5" />
                Tanya & Pesan via WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Keranjang Pesanan</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatIDR(item.price)} / item</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setCart((prev) => prev.map((c) => c.id === item.id ? { ...c, qty: c.qty - 1 } : c).filter((c) => c.qty > 0))}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold"
                    >−</button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button
                      onClick={() => setCart((prev) => prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))}
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold"
                      style={{ backgroundColor: t.accent }}
                    >+</button>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-20 text-right flex-shrink-0">{formatIDR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className={`p-5 border-t border-gray-100 ${t.accentLight} rounded-b-3xl sm:rounded-b-2xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">Total Pesanan</span>
                <span className="text-xl font-extrabold" style={{ color: t.accent }}>{formatIDR(cartTotal)}</span>
              </div>
              <button
                onClick={() => { setCartOpen(false); orderViaWhatsApp(); }}
                className={`w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${t.waBtn} ${t.waBtnHover}`}
              >
                <MessageCircle className="w-5 h-5" />
                Pesan via WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
