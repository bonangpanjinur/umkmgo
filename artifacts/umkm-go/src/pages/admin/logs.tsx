import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAuditLogs } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  suspend_user: { label: "Suspend User", color: "text-red-600" },
  unsuspend_user: { label: "Unsuspend User", color: "text-green-600" },
  update_flag: { label: "Update Flag", color: "text-blue-600" },
  create_flag: { label: "Create Flag", color: "text-purple-600" },
  update_ticket: { label: "Update Ticket", color: "text-yellow-600" },
  login: { label: "Admin Login", color: "text-gray-600" },
};

export default function AdminLogs() {
  const token = getToken();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const limit = 20;

  const { data, isLoading } = useGetAuditLogs(
    { page, limit, actor: search || undefined, action: actionFilter === "all" ? undefined : actionFilter },
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Audit Logs</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari berdasarkan email admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Filter Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="suspend_user">Suspend User</SelectItem>
            <SelectItem value="unsuspend_user">Unsuspend User</SelectItem>
            <SelectItem value="update_flag">Update Flag</SelectItem>
            <SelectItem value="update_ticket">Update Ticket</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card className="bg-white rounded-2xl border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500">Waktu</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Admin</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Aksi</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Resource</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-gray-500">Belum ada audit log</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionInfo = ACTION_MAP[log.action] || { label: log.action, color: "text-gray-700" };
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{log.actor}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${actionInfo.color}`}>{actionInfo.label}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                          {log.resourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.status === "success" ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Sukses
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold text-xs">
                            <XCircle className="w-4 h-4" /> Gagal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{log.details || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} dari {total} log
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-3">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
