import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListAdminUsers, useSuspendUser, useUnsuspendUser } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, MoreHorizontal, ShieldAlert, CheckCircle2, CrownIcon, Loader2, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const AUTH_HEADERS = () => ({ Authorization: `Bearer ${getToken()}` });

const TIER_LABELS: Record<string, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  pro: "bg-emerald-100 text-emerald-700",
  enterprise: "bg-violet-100 text-violet-700",
};

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(num);

async function changeTier(userId: string, tier: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${userId}/tier`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...AUTH_HEADERS() },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) throw new Error("Gagal mengubah tier");
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [tierDialogUser, setTierDialogUser] = useState<{ id: string; name: string; tier: string } | null>(null);
  const [selectedTier, setSelectedTier] = useState("free");
  const [isTierChanging, setIsTierChanging] = useState(false);

  const { data, isLoading } = useListAdminUsers(
    {
      search: search || undefined,
      tier: filterTier !== "all" ? (filterTier as any) : undefined,
      status: filterStatus !== "all" ? (filterStatus as any) : undefined,
      limit: 50,
    },
    { request: { headers: AUTH_HEADERS() } }
  );

  const suspendMutation = useSuspendUser({
    request: { headers: AUTH_HEADERS() },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "✅ Pengguna telah disuspend" });
      },
      onError: () => toast({ title: "Gagal suspend pengguna", variant: "destructive" }),
    },
  });

  const unsuspendMutation = useUnsuspendUser({
    request: { headers: AUTH_HEADERS() },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "✅ Pengguna telah diaktifkan kembali" });
      },
      onError: () => toast({ title: "Gagal mengaktifkan pengguna", variant: "destructive" }),
    },
  });

  const handleTierChange = async () => {
    if (!tierDialogUser) return;
    setIsTierChanging(true);
    try {
      await changeTier(tierDialogUser.id, selectedTier);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: `✅ Tier ${tierDialogUser.name} berhasil diubah ke ${TIER_LABELS[selectedTier]}` });
      setTierDialogUser(null);
    } catch {
      toast({ title: "Gagal mengubah tier", variant: "destructive" });
    } finally {
      setIsTierChanging(false);
    }
  };

  const openTierDialog = (u: { id: string; name: string; tier: string }) => {
    setTierDialogUser(u);
    setSelectedTier(u.tier);
  };

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total.toLocaleString("id-ID")} pengguna terdaftar</p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 mb-4 rounded-xl shadow-sm border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder="Cari nama, email, atau nama toko..."
              className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tier</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="suspended">Tersuspend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-2xl shadow-sm border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Pengguna</th>
                <th className="px-5 py-3.5 font-semibold">Toko</th>
                <th className="px-5 py-3.5 font-semibold">Tier</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">GMV</th>
                <th className="px-5 py-3.5 font-semibold">Bergabung</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Memuat data pengguna...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada pengguna yang cocok</p>
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{u.name}</div>
                        <div className="text-xs text-gray-400 truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-700">{u.storeName || <span className="text-gray-300">—</span>}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${TIER_COLORS[u.tier] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.tier === "enterprise" && <CrownIcon className="w-3 h-3" />}
                      {TIER_LABELS[u.tier] ?? u.tier}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                      {u.status === "active" ? "Aktif" : "Tersuspend"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700">{formatIDR(u.revenue ?? 0)}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {format(new Date(u.joinDate), "d MMM yyyy", { locale: localeId })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openTierDialog({ id: u.id, name: u.name, tier: u.tier })}
                        >
                          <CrownIcon className="w-4 h-4 mr-2 text-indigo-500" /> Ubah Tier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === "active" ? (
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => {
                              if (confirm(`Suspend pengguna ${u.name}?`)) {
                                suspendMutation.mutate({ id: u.id });
                              }
                            }}
                          >
                            <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600 cursor-pointer"
                            onClick={() => unsuspendMutation.mutate({ id: u.id })}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Aktifkan Kembali
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && users.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
            Menampilkan {users.length} dari {total.toLocaleString("id-ID")} pengguna
          </div>
        )}
      </Card>

      {/* Tier Change Dialog */}
      <Dialog open={!!tierDialogUser} onOpenChange={(open) => !open && setTierDialogUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Tier Pengguna</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-gray-500">
              Mengubah tier untuk: <span className="font-semibold text-gray-900">{tierDialogUser?.name}</span>
            </p>
            <div className="space-y-2">
              {(["free", "pro", "enterprise"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTier === tier
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TIER_COLORS[tier]}`}>
                    {tier === "enterprise" ? <CrownIcon className="w-4 h-4" /> : <span className="text-xs font-bold">{tier[0].toUpperCase()}</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{TIER_LABELS[tier]}</p>
                    <p className="text-xs text-gray-400">
                      {tier === "free" ? "Gratis selamanya" : tier === "pro" ? "Rp 99.000/bulan" : "Rp 499.000/bulan"}
                    </p>
                  </div>
                  {selectedTier === tier && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTierDialogUser(null)} disabled={isTierChanging}>
              Batal
            </Button>
            <Button onClick={handleTierChange} disabled={isTierChanging || selectedTier === tierDialogUser?.tier}>
              {isTierChanging ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
