import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListAdminDomains } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Globe, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

const STATUS_LABELS: Record<string, string> = {
  pending_dns: "Menunggu DNS",
  verifying: "Memverifikasi",
  active: "Aktif",
  failed: "Gagal",
  suspended: "Ditangguhkan",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending_dns: <Clock className="h-4 w-4 text-yellow-500" />,
  verifying: <RefreshCw className="h-4 w-4 text-blue-500" />,
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  suspended: <XCircle className="h-4 w-4 text-gray-400" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending_dns: "bg-yellow-100 text-yellow-700",
  verifying: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  suspended: "bg-gray-100 text-gray-600",
};

export default function AdminDomainsPage() {
  const [search, setSearch] = useState("");
  const { data: domains, isLoading } = useListAdminDomains(AUTH());

  const domainList = domains ?? [];
  const filtered = search
    ? domainList.filter((d) => d.domain.toLowerCase().includes(search.toLowerCase()))
    : domainList;

  const stats = {
    total: domainList.length,
    active: domainList.filter((d) => d.status === "active").length,
    pending: domainList.filter((d) => d.status === "pending_dns" || d.status === "verifying").length,
    failed: domainList.filter((d) => d.status === "failed").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Domain</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau semua domain kustom pengguna</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Domain", val: stats.total, color: "text-gray-900" },
            { label: "Aktif", val: stats.active, color: "text-green-600" },
            { label: "Menunggu", val: stats.pending, color: "text-yellow-600" },
            { label: "Gagal", val: stats.failed, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Cari domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Memuat domain...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada domain ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Domain</th>
                    <th className="text-left p-4 font-medium text-gray-600">Toko</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">DNS Target</th>
                    <th className="text-left p-4 font-medium text-gray-600">Ditambahkan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {STATUS_ICONS[d.status] ?? <Globe className="h-4 w-4 text-gray-400" />}
                          <span className="font-medium text-gray-900">{d.domain}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-xs font-mono">{d.storeId.slice(0, 8)}...</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[d.status] ?? d.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-500">{d.dnsTarget ?? "-"}</td>
                      <td className="p-4 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true, locale: idLocale })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
