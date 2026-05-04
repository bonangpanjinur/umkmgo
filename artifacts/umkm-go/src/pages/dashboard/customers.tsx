import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Search, Users, Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, ShoppingBag, Star, TrendingUp, X,
  QrCode, Clock, Crown, Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });
const AUTH_H = () => ({ Authorization: `Bearer ${getToken()}` });

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}
function formatIDRCompact(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact", minimumFractionDigits: 0,
  }).format(n);
}

// ── Loyalty tiers ──────────────────────────────────────────────────────────────
const TIERS = [
  { name: "Platinum", min: 2_000_000, color: "#7c3aed", bg: "bg-violet-100", text: "text-violet-700", icon: Crown },
  { name: "Gold",     min: 500_000,   color: "#d97706", bg: "bg-amber-100",  text: "text-amber-700",  icon: Star },
  { name: "Silver",   min: 100_000,   color: "#64748b", bg: "bg-slate-100",  text: "text-slate-600",  icon: Award },
  { name: "Bronze",   min: 0,         color: "#92400e", bg: "bg-orange-50",  text: "text-orange-700", icon: ShoppingBag },
];

function getTier(totalSpent: number) {
  return TIERS.find((t) => totalSpent >= t.min) ?? TIERS[3];
}

function nextTier(totalSpent: number) {
  const idx = TIERS.findIndex((t) => totalSpent >= t.min);
  return idx > 0 ? TIERS[idx - 1] : null;
}

function TierBadge({ totalSpent, size = "sm" }: { totalSpent: number; size?: "sm" | "md" }) {
  const tier = getTier(totalSpent);
  const Icon = tier.icon;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${tier.bg} ${tier.text} ${size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-[10px]"}`}>
      <Icon className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} />
      {tier.name}
    </span>
  );
}

// ── Source label ───────────────────────────────────────────────────────────────
function sourceLabel(src: string | null) {
  if (src === "qr_table") return "QR Meja";
  if (src === "pos") return "Kasir";
  if (src === "storefront") return "Online";
  if (src === "whatsapp") return "WhatsApp";
  return "Manual";
}
function sourceBg(src: string | null) {
  if (src === "qr_table") return "bg-indigo-100 text-indigo-700";
  if (src === "pos") return "bg-orange-100 text-orange-700";
  if (src === "storefront") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
}

// ── Customer detail hook ───────────────────────────────────────────────────────
function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: ["customer-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}`, { headers: AUTH_H() });
      if (!res.ok) throw new Error("Failed to fetch customer detail");
      return res.json() as Promise<{
        customer: any;
        orders: any[];
        favoriteProduct: { name: string; count: number } | null;
      }>;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── Customer detail drawer ─────────────────────────────────────────────────────
function CustomerDrawer({
  customerId,
  onClose,
  onEdit,
}: {
  customerId: string | null;
  onClose: () => void;
  onEdit: (c: any) => void;
}) {
  const { data, isLoading } = useCustomerDetail(customerId);

  const customer = data?.customer;
  const orders = data?.orders ?? [];
  const favoriteProduct = data?.favoriteProduct;

  const tier = customer ? getTier(Number(customer.totalSpent)) : null;
  const next = customer ? nextTier(Number(customer.totalSpent)) : null;
  const progress = customer && next
    ? Math.min(100, ((Number(customer.totalSpent) - getTier(Number(customer.totalSpent)).min) /
        (next.min - getTier(Number(customer.totalSpent)).min)) * 100)
    : 100;

  return (
    <AnimatePresence>
      {customerId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Detail Pelanggan</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : !customer ? (
                <div className="p-6 text-center text-gray-400">Data tidak ditemukan</div>
              ) : (
                <div className="p-5 space-y-5">
                  {/* Profile */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl flex-shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{customer.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{customer.phone}</p>
                      <div className="mt-1.5">
                        <TierBadge totalSpent={Number(customer.totalSpent)} size="sm" />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onEdit(customer)}>
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </div>

                  {/* Tier progress */}
                  {next && tier && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Progress ke {next.name}</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {formatIDR(next.min - Number(customer.totalSpent))} lagi
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: tier.color }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                        <span>{tier.name}</span>
                        <span>{next.name}</span>
                      </div>
                    </div>
                  )}
                  {!next && (
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <p className="text-xs text-violet-700 font-medium">Pelanggan Platinum — Tier tertinggi!</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Belanja", value: formatIDRCompact(Number(customer.totalSpent)), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Pesanan", value: String(customer.orderCount), icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
                      { label: "Terakhir", value: customer.lastOrderAt
                          ? formatDistanceToNow(new Date(customer.lastOrderAt), { locale: idLocale, addSuffix: false })
                          : "—",
                        icon: Clock, color: "text-green-600", bg: "bg-green-50" },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
                        <s.icon className={`w-4 h-4 ${s.color} mb-1.5`} />
                        <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
                        <p className="font-bold text-sm text-gray-900 mt-0.5 leading-tight">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Contact + favorite */}
                  <div className="space-y-2">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {customer.email}
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        {customer.address}
                      </div>
                    )}
                    {customer.notes && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-gray-400 flex-shrink-0">📝</span>
                        {customer.notes}
                      </div>
                    )}
                    {favoriteProduct && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-gray-500">Produk favorit:</span>
                        <span className="font-semibold text-gray-800">{favoriteProduct.name}</span>
                        <span className="text-xs text-gray-400">({favoriteProduct.count}×)</span>
                      </div>
                    )}
                  </div>

                  {/* Order history */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      Riwayat Pesanan
                      <span className="text-xs font-normal text-gray-400">({orders.length})</span>
                    </h4>
                    {orders.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Belum ada pesanan</p>
                    ) : (
                      <div className="space-y-2">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-gray-900">
                                    {formatIDR(Number(order.totalAmount))}
                                  </span>
                                  {order.tableNumber && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                      <QrCode className="w-2.5 h-2.5" />
                                      Meja {order.tableNumber}
                                    </span>
                                  )}
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sourceBg(order.source)}`}>
                                    {sourceLabel(order.source)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                                {Array.isArray(order.items) && order.items.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {order.items.map((it: any) => `${it.name} ×${it.quantity ?? 1}`).join(", ")}
                                  </p>
                                )}
                              </div>
                              <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                order.status === "completed" ? "bg-green-100 text-green-700"
                                : order.status === "pending" ? "bg-yellow-100 text-yellow-700"
                                : order.status === "cancelled" ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                              }`}>
                                {order.status === "completed" ? "Selesai"
                                  : order.status === "pending" ? "Pending"
                                  : order.status === "processing" ? "Diproses"
                                  : order.status === "shipped" ? "Siap Antar"
                                  : order.status === "cancelled" ? "Batal"
                                  : order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Form types ─────────────────────────────────────────────────────────────────
interface CustomerForm {
  name: string; phone: string; email: string; address: string; notes: string;
}
const EMPTY_FORM: CustomerForm = { name: "", phone: "", email: "", address: "", notes: "" };

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useListCustomers(
    { page, limit: 15, search: search || undefined, sort } as any,
    AUTH()
  );

  const { mutate: createCustomer, isPending: creating } = useCreateCustomer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pelanggan berhasil ditambahkan" });
        refetch();
        setShowForm(false);
        setForm(EMPTY_FORM);
      },
      onError: () => toast({ title: "Gagal menambahkan pelanggan", variant: "destructive" }),
    },
  });

  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pelanggan diperbarui" });
        refetch();
        setEditCustomer(null);
      },
      onError: () => toast({ title: "Gagal memperbarui pelanggan", variant: "destructive" }),
    },
  });

  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer({
    mutation: {
      onSuccess: () => {
        toast({ title: "Pelanggan dihapus" });
        refetch();
        setDeleteId(null);
        if (selectedId === deleteId) setSelectedId(null);
      },
    },
  });

  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const stats = (data as any)?.stats;
  const totalPages = Math.max(1, Math.ceil(total / 15));

  const openEdit = useCallback((c: any) => {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone, email: c.email ?? "", address: c.address ?? "", notes: c.notes ?? "" });
    setSelectedId(null);
  }, []);

  const topSpender = customers.length > 0
    ? [...customers].sort((a, b) => Number(b.totalSpent) - Number(a.totalSpent))[0]
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pelanggan</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Otomatis tersimpan setiap ada pesanan masuk · klik pelanggan untuk riwayat belanja
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Manual
          </Button>
        </div>

        {/* Summary stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Pelanggan", value: (stats.totalCustomers ?? 0).toLocaleString("id-ID"), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Total Omzet", value: formatIDRCompact(Number(stats.totalRevenue ?? 0)), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Rata-rata Belanja", value: formatIDRCompact(Number(stats.avgSpent ?? 0)), icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Pelanggan Terloyal", value: topSpender?.name?.split(" ")[0] ?? "—", icon: Crown, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="font-bold text-gray-900 text-base mt-0.5 truncate">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama atau nomor HP..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Pesanan Terbaru</SelectItem>
              <SelectItem value="spent">Pengeluaran Terbesar</SelectItem>
              <SelectItem value="orders">Pesanan Terbanyak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Users className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada pelanggan</p>
            <p className="text-sm text-gray-400 mt-1">
              Pelanggan akan muncul otomatis setiap ada pesanan masuk dari QR meja atau toko online
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.map((c) => {
              const tier = getTier(Number(c.totalSpent));
              const TierIcon = tier.icon;
              const isSelected = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(isSelected ? null : c.id)}
                  className={`text-left bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                    isSelected ? "border-indigo-400 shadow-md shadow-indigo-100" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-lg"
                      style={{ background: tier.color + "20", color: tier.color }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-gray-900 truncate leading-tight">{c.name}</p>
                        <span className={`flex-shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>
                          <TierIcon className="w-2.5 h-2.5" />
                          {tier.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{c.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400">Total Belanja</p>
                      <p className="text-sm font-bold text-gray-900">{formatIDRCompact(Number(c.totalSpent))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Pesanan</p>
                      <p className="text-sm font-bold text-gray-900">{c.orderCount}×</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-400">
                      {c.lastOrderAt
                        ? formatDistanceToNow(new Date(c.lastOrderAt), { addSuffix: true, locale: idLocale })
                        : "Belum pernah pesan"}
                    </p>
                    <div className="flex gap-1">
                      <span
                        onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{total} pelanggan · Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <CustomerDrawer
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
      />

      {/* Add/Edit dialog */}
      <Dialog open={showForm || !!editCustomer} onOpenChange={() => { setShowForm(false); setEditCustomer(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCustomer ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nama *</Label>
                <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Nomor HP *</Label>
                <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Alamat</Label>
              <Textarea className="mt-1" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>Catatan</Label>
              <Textarea className="mt-1" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditCustomer(null); }}>Batal</Button>
            <Button
              disabled={creating || updating || !form.name || !form.phone}
              onClick={() => {
                if (editCustomer) {
                  updateCustomer({ id: editCustomer.id, data: form, ...AUTH() });
                } else {
                  createCustomer({ data: form, ...AUTH() });
                }
              }}
            >
              {editCustomer ? "Simpan Perubahan" : "Tambah Pelanggan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Pelanggan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Data pelanggan akan dihapus permanen. Riwayat pesanan tetap tersimpan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => deleteId && deleteCustomer({ id: deleteId, ...AUTH() })}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
