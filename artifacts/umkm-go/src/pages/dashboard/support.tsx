import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListTickets, useCreateTicket, useGetTicket } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    open: { cls: "bg-blue-100 text-blue-700", icon: <MessageSquare className="w-3 h-3" />, label: "Open" },
    in_progress: { cls: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" />, label: "Diproses" },
    resolved: { cls: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" />, label: "Selesai" },
    closed: { cls: "bg-gray-100 text-gray-600", icon: <XCircle className="w-3 h-3" />, label: "Ditutup" },
  };
  const s = map[status] || map.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    low: "Rendah", medium: "Sedang", high: "Tinggi", critical: "Kritis"
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${map[priority] || map.low}`}>{labels[priority] || priority}</span>;
}

export default function SupportPage() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("low");

  const { data, isLoading } = useListTickets(
    { limit: 50 },
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: ticketDetail } = useGetTicket(
    selectedId ?? "",
    {
      query: { enabled: !!selectedId },
      request: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const createMutation = useCreateTicket({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
        toast({ title: "Tiket berhasil dibuat", description: "Tim kami akan merespons dalam 24 jam." });
        setShowCreate(false);
        setSubject(""); setDescription(""); setPriority("low");
      },
      onError: () => toast({ title: "Gagal membuat tiket", variant: "destructive" }),
    },
  });

  const tickets = data?.data || [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bantuan & Support</h1>
          <p className="text-gray-500 text-sm">Ajukan pertanyaan atau laporkan masalah ke tim kami</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Buat Tiket Baru
        </Button>
      </div>

      {/* No tickets empty state */}
      {!isLoading && tickets.length === 0 && (
        <Card className="p-12 rounded-2xl text-center border-dashed border-2 border-gray-200 bg-gray-50">
          <LifeBuoy className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Tiket</h3>
          <p className="text-gray-500 text-sm mb-6">Punya pertanyaan atau masalah? Kami siap membantu Anda.</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Buat Tiket Pertama
          </Button>
        </Card>
      )}

      {/* Ticket List */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5 rounded-2xl animate-pulse bg-white">
                  <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                </Card>
              ))
            : tickets.map((t) => (
                <Card
                  key={t.id}
                  className="p-5 rounded-2xl bg-white border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate mb-1">{t.subject}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{t.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs text-gray-400">{format(new Date(t.createdAt), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                    {t.status === "resolved" && (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </Card>
              ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Tiket</DialogTitle>
          </DialogHeader>
          {ticketDetail && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">{ticketDetail.subject}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={ticketDetail.status} />
                  <PriorityBadge priority={ticketDetail.priority} />
                  <span className="text-xs text-gray-400">{format(new Date(ticketDetail.createdAt), "dd MMM yyyy, HH:mm")}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{ticketDetail.description}</p>
              </div>
              {ticketDetail.response && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" /> BALASAN TIM SUPPORT
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">{ticketDetail.response}</p>
                  {ticketDetail.resolvedAt && (
                    <p className="text-xs text-gray-400 mt-2">Diselesaikan: {format(new Date(ticketDetail.resolvedAt), "dd MMM yyyy, HH:mm")}</p>
                  )}
                </div>
              )}
              {!ticketDetail.response && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Tiket Anda sedang diproses. Kami akan merespons dalam 24 jam.
                  </p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setSelectedId(null)}>Tutup</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Tiket Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Subjek</label>
              <Input
                placeholder="Jelaskan masalah Anda secara singkat..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Prioritas</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah (pertanyaan umum)</SelectItem>
                  <SelectItem value="medium">Sedang (butuh bantuan)</SelectItem>
                  <SelectItem value="high">Tinggi (menghambat bisnis)</SelectItem>
                  <SelectItem value="critical">Kritis (toko tidak bisa diakses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Deskripsi Detail</label>
              <Textarea
                placeholder="Jelaskan masalah Anda secara detail. Sertakan langkah-langkah yang sudah dilakukan dan error yang muncul (jika ada)..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button
                onClick={() => createMutation.mutate({ data: { subject, description, priority } })}
                disabled={!subject || !description || createMutation.isPending}
              >
                {createMutation.isPending ? "Mengirim..." : "Kirim Tiket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
