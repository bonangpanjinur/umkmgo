import { useRoute, useSearch } from "wouter";
import { useGetStoreBySlug } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle, Store as StoreIcon, Loader2, Phone, Star, Clock, Search, SlidersHorizontal, X, Share2, Copy, Check, ExternalLink, QrCode, ChevronRight, Minus, Plus, Trash2, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";

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

type SortOption = "default" | "price-asc" | "price-desc";

type CartItem = { id: string; name: string; price: number; qty: number };

type CheckoutStep = "cart" | "form" | "success";

interface CheckoutModalProps {
  cart: CartItem[];
  cartTotal: number;
  slug: string;
  storeName: string;
  tableNumber: string | null;
  whatsapp: string | null | undefined;
  theme: ThemeConfig;
  onClose: () => void;
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

function CheckoutModal({
  cart,
  cartTotal,
  slug,
  storeName,
  tableNumber,
  whatsapp,
  theme: t,
  onClose,
  onQtyChange,
  onRemove,
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  const submitOrder = async () => {
    if (!name.trim()) { setError("Nama wajib diisi"); return; }
    if (!phone.trim()) { setError("Nomor HP wajib diisi"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: name.trim(),
          buyerPhone: phone.trim(),
          tableNumber: tableNumber || undefined,
          items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.qty })),
          totalAmount: cartTotal,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Gagal mengirim pesanan");
        return;
      }
      const data = await res.json();
      setOrderId(data.id);
      setStep("success");
    } catch {
      setError("Gagal terhubung ke server, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const orderViaWhatsApp = () => {
    if (!whatsapp) return;
    const wa = whatsapp.startsWith("0") ? "62" + whatsapp.slice(1) : whatsapp;
    const items = cart.map((c) => `• ${c.name} x${c.qty} = ${formatIDR(c.price * c.qty)}`).join("\n");
    const tableInfo = tableNumber ? `\n🪑 *Meja ${tableNumber}*` : "";
    const text = encodeURIComponent(
      `Halo ${storeName}! 👋${tableInfo}\n\nSaya ingin memesan:\n${items}\n\n*Total: ${formatIDR(cartTotal)}*\n\nMohon konfirmasinya 🙏`
    );
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={step !== "success" ? onClose : undefined} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        {step !== "success" && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {step === "form" && (
                <button onClick={() => setStep("cart")} className="text-gray-400 hover:text-gray-600 mr-1">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              )}
              <h2 className="text-lg font-bold text-gray-900">
                {step === "cart" ? "Keranjang Pesanan" : "Data Pemesan"}
              </h2>
              {tableNumber && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: t.accent }}
                >
                  Meja {tableNumber}
                </span>
              )}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Step: Cart */}
        {step === "cart" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatIDR(item.price)} / item</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onQtyChange(item.id, -1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                    <button
                      onClick={() => onQtyChange(item.id, 1)}
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center transition-colors"
                      style={{ backgroundColor: t.accent }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[64px]">
                    <p className="text-sm font-bold text-gray-900">{formatIDR(item.price * item.qty)}</p>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-xl font-extrabold" style={{ color: t.accent }}>{formatIDR(cartTotal)}</span>
              </div>
              <button
                onClick={() => setStep("form")}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: t.accent }}
              >
                Pesan Sekarang →
              </button>
              {whatsapp && (
                <button
                  onClick={orderViaWhatsApp}
                  className="w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 border-2"
                  style={{ color: t.accent, borderColor: t.accent + "40" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan via WhatsApp
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Order summary */}
              <div className="rounded-2xl p-3 space-y-1.5" style={{ backgroundColor: t.accent + "0f" }}>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} ×{item.qty}</span>
                    <span className="font-semibold text-gray-900">{formatIDR(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200 mt-1">
                  <span style={{ color: t.accent }}>Total</span>
                  <span style={{ color: t.accent }}>{formatIDR(cartTotal)}</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nama Pemesan *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-current transition-colors"
                    style={{ "--tw-ring-color": t.accent } as any}
                    onFocus={(e) => e.target.style.borderColor = t.accent}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nomor HP *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors"
                    onFocus={(e) => e.target.style.borderColor = t.accent}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                <textarea
                  placeholder="Contoh: tidak pakai pedas, es terpisah..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none transition-colors resize-none"
                  onFocus={(e) => e.target.style.borderColor = t.accent}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-gray-100">
              <button
                onClick={submitOrder}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: t.accent }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? "Mengirim Pesanan..." : "Konfirmasi Pesanan"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: t.accent + "18" }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: t.accent }} />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Pesanan Masuk! 🎉</h2>
            <p className="text-gray-500 text-sm mb-3">
              Terima kasih <strong>{name}</strong>! Pesanan kamu sudah diterima.
            </p>
            {tableNumber && (
              <div
                className="px-4 py-2 rounded-2xl text-sm font-bold mb-4"
                style={{ backgroundColor: t.accent + "15", color: t.accent }}
              >
                🪑 Akan diantar ke Meja {tableNumber}
              </div>
            )}
            <p className="text-xs text-gray-400 mb-6 font-mono">#{orderId.slice(0, 8).toUpperCase()}</p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl text-white font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.accent }}
            >
              Tutup
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Storefront() {
  const [, params] = useRoute("/store/:slug");
  const slug = params?.slug || "";
  const search = useSearch();
  const tableNumber = new URLSearchParams(search).get("table");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: store, isLoading, error } = useGetStoreBySlug(slug);

  const themeKey = getThemeKey(store?.categoryName);
  const t = THEMES[themeKey];

  const priceRange = useMemo(() => {
    if (!store?.products || store.products.length === 0) return { min: 0, max: 0 };
    const prices = store.products.map((p) => Number(p.price));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [store?.products]);

  const filteredProducts = useMemo(() => {
    if (!store?.products) return [];
    let list = [...store.products];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    const minVal = priceMin !== "" ? Number(priceMin) : null;
    const maxVal = priceMax !== "" ? Number(priceMax) : null;
    if (minVal !== null && !isNaN(minVal)) {
      list = list.filter((p) => Number(p.price) >= minVal);
    }
    if (maxVal !== null && !isNaN(maxVal)) {
      list = list.filter((p) => Number(p.price) <= maxVal);
    }

    if (sortBy === "price-asc") {
      list = list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      list = list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [store?.products, searchQuery, priceMin, priceMax, sortBy]);

  const hasActiveFilter = searchQuery.trim() !== "" || priceMin !== "" || priceMax !== "" || sortBy !== "default";

  const clearFilters = () => {
    setSearchQuery("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("default");
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      if (ex) return prev.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const handleBuySingle = (productName: string) => {
    if (!store?.whatsapp) return alert("Toko belum mengatur nomor WhatsApp");
    const wa = store.whatsapp.startsWith("0") ? "62" + store.whatsapp.slice(1) : store.whatsapp;
    const text = encodeURIComponent(`Halo ${store.name}, saya ingin memesan: *${productName}*`);
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  };

  const storeUrl = `${window.location.origin}/store/${slug}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = storeUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [storeUrl]);

  const shareViaWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Cek toko *${store?.name}* di sini! 🛍️\n${storeUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [store?.name, storeUrl]);

  const shareViaX = useCallback(() => {
    const text = encodeURIComponent(`Cek toko ${store?.name}! 🛍️ ${storeUrl}`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  }, [store?.name, storeUrl]);

  const shareNative = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: store?.name || "Toko Online", text: `Cek toko ${store?.name} di UMKM Go!`, url: storeUrl });
        return;
      } catch {}
    }
    setShareOpen(true);
  }, [store?.name, storeUrl]);

  const handleCheckoutClose = () => {
    setCartOpen(false);
    setCart([]);
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
      {/* Checkout Modal */}
      <AnimatePresence>
        {cartOpen && cart.length > 0 && (
          <CheckoutModal
            cart={cart}
            cartTotal={cartTotal}
            slug={slug}
            storeName={store.name}
            tableNumber={tableNumber}
            whatsapp={store.whatsapp}
            theme={t}
            onClose={handleCheckoutClose}
            onQtyChange={changeQty}
            onRemove={removeFromCart}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShareOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Bagikan Toko</h3>
                <button onClick={() => setShareOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
                <p className="flex-1 text-xs text-gray-500 truncate font-mono">{storeUrl}</p>
                <button onClick={copyLink} className="flex items-center gap-1 text-xs font-semibold" style={{ color: t.accent }}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin!" : "Salin"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={shareViaWhatsApp} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold">
                  <MessageCircle className="w-4 h-4" />WhatsApp
                </button>
                <button onClick={shareViaX} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold">
                  <ExternalLink className="w-4 h-4" />Twitter/X
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className={`${t.header} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)`
        }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-white/80 text-sm font-medium">{store.categoryName || "F&B"}</span>
            </div>
            <button
              onClick={shareNative}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </div>
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

      {/* Table Number Banner */}
      {tableNumber && (
        <div className="max-w-4xl mx-auto px-4 mt-3 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
            style={{ backgroundColor: t.accent + "18", border: `1.5px solid ${t.accent}33` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow"
              style={{ backgroundColor: t.accent }}
            >
              {tableNumber}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: t.accent }}>Meja {tableNumber}</p>
              <p className="text-xs text-gray-500">Pilih menu & pesan langsung — pesanan diantar ke meja ini</p>
            </div>
            <QrCode className="w-5 h-5 flex-shrink-0" style={{ color: t.accent + "80" }} />
          </motion.div>
        </div>
      )}

      {/* Store Info Strip */}
      <div className={`max-w-4xl mx-auto px-4 ${tableNumber ? "mt-3" : "-mt-6"} relative z-10 mb-6`}>
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
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
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

        {/* Search & Filter Bar */}
        {store.products && store.products.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm bg-white focus:outline-none transition-colors ${
                    searchQuery ? "border-current" : "border-gray-200 focus:border-gray-300"
                  }`}
                  style={searchQuery ? { borderColor: t.accent } : {}}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  filterOpen || (priceMin !== "" || priceMax !== "" || sortBy !== "default")
                    ? "text-white border-current"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
                style={
                  filterOpen || (priceMin !== "" || priceMax !== "" || sortBy !== "default")
                    ? { backgroundColor: t.accent, borderColor: t.accent }
                    : {}
                }
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {(priceMin !== "" || priceMax !== "" || sortBy !== "default") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`${t.cardBg} border-2 rounded-2xl p-4 space-y-4`} style={{ borderColor: t.accent + "33" }}>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rentang Harga</p>
                      {priceRange.min !== priceRange.max && (
                        <p className="text-xs text-gray-400 mb-2">{formatIDR(priceRange.min)} — {formatIDR(priceRange.max)}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Min</span>
                          <input type="number" placeholder={String(priceRange.min)} value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400 bg-gray-50" min={0} />
                        </div>
                        <span className="text-gray-300 font-bold">—</span>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Max</span>
                          <input type="number" placeholder={String(priceRange.max)} value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400 bg-gray-50" min={0} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Urutkan</p>
                      <div className="flex gap-2 flex-wrap">
                        {(["default", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
                          <button key={opt} onClick={() => setSortBy(opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${sortBy === opt ? "text-white" : "border-gray-200 text-gray-600"}`}
                            style={sortBy === opt ? { backgroundColor: t.accent, borderColor: t.accent } : {}}>
                            {opt === "default" ? "Default" : opt === "price-asc" ? "Harga Terendah" : "Harga Tertinggi"}
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasActiveFilter && (
                      <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-3.5 h-3.5" />Reset semua filter
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasActiveFilter && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Menampilkan {filteredProducts.length} dari {store.products?.length || 0} produk</span>
                <button onClick={clearFilters} className="text-xs underline" style={{ color: t.accent }}>Reset</button>
              </div>
            )}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((product, idx) => {
              const inCart = cart.find((c) => c.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`${t.cardBg} rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${t.cardBorder}`}
                >
                  {/* Image area */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-30">{t.emoji}</span>
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${t.badgePriceBg} ${t.badgePriceText}`}>
                      {formatIDR(Number(product.price))}
                    </div>
                    {inCart && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                        <span className="text-[10px] font-extrabold" style={{ color: t.accent }}>{inCart.qty}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 leading-tight mb-0.5 line-clamp-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-1"
                      style={{ backgroundColor: t.accent }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {inCart ? "Tambah Lagi" : "Tambah"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-3 z-40"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full max-w-md mx-auto flex items-center justify-between px-5 py-4 rounded-2xl text-white shadow-2xl transition-all active:scale-[0.98]"
              style={{ backgroundColor: t.accent }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">
                  {cartCount}
                </div>
                <span className="font-semibold text-sm">Lihat Pesanan</span>
              </div>
              <span className="font-extrabold">{formatIDR(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
