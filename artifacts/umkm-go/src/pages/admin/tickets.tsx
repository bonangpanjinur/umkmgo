import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListTickets, useGetTicket, useUpdateTicket } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${map[priority] || map.low}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    open: { cls: "bg-blue-100 text-blue-700", icon: <MessageSquare className="w-3 h-3" /> },
    in_progress: { cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
    resolved: { cls: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    closed: { cls: "bg-gray-100 text-gray-600", icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] || map.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${s.cls}`}>
      {s.icon} {status.replace("_", " ")}
    </span>
  );
}

export default function AdminTickets() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("in_progress");

  const { data, isLoading } = useListTickets(
    {
      status: statusFilter === "all" ? undefined : statusFilter as any,
      priority: priorityFilter === "all" ? undefined : priorityFilter as any,
      limit: 50,
    },
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: ticket } = useGetTicket(
    selectedId ?? "",
    {
      query: { enabled: !!selectedId },
      request: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const updateMutation = useUpdateTicket({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        toast({ title: "Tiket diperbarui" });
        setSelectedId(null);
        setResponse("");
      },
    },
  });

  const handleUpdate = () => {
    if (!selectedId) return;
    updateMutation.mutate({
      id: selectedId,
      data: { status: newStatus as any, response: response || undefined },
    });
  };

  const tickets = data?.data || [];

  return (
    <AdminLayout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Support Tickets</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Filter Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 text-sm text-gray-500 items-center ml-auto">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <span>{tickets.filter(t => t.status === "open").length} tiket belum ditangani</span>
        </div>
      </div>

      {/* Tickets Table */}
      <Card className="bg-white rounded-2xl border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500">Subject</th>
                <th className="px-6 py-4 font-semibold text-gray-500">User</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Prioritas</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500">Tanggal</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Tidak ada tiket yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 truncate max-w-xs">{t.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.userEmail}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4 text-gray-500">{format(new Date(t.createdAt), "dd MMM yyyy")}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedId(t.id);
                          setNewStatus(t.status);
                          setResponse(t.response || "");
                        }}
                      >
                        Tangani
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Tiket</DialogTitle>
          </DialogHeader>
          {ticket && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <p className="text-sm text-gray-500 mb-3">Dari: {ticket.userEmail} · {format(new Date(ticket.createdAt), "dd MMM yyyy, HH:mm")}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
              </div>

              {ticket.response && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-2">BALASAN ADMIN</p>
                  <p className="text-sm text-gray-700">{ticket.response}</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Balasan ke User</label>
                  <Textarea
                    placeholder="Tulis balasan untuk user..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedId(null)}>Batal</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Menyimpan..." : "Simpan & Kirim"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
