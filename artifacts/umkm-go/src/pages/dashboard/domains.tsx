import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListDomains, useCreateDomain, useVerifyDomain, useDeleteDomain } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Globe, Plus, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  verifying: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  suspended: <XCircle className="h-4 w-4 text-gray-400" />,
};

export default function DomainsPage() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: domains, isLoading, refetch } = useListDomains(AUTH());

  const { mutate: createDomain, isPending: creating } = useCreateDomain({
    mutation: {
      onSuccess: () => {
        toast({ title: "Domain berhasil ditambahkan" });
        refetch();
        setShowAdd(false);
        setNewDomain("");
      },
      onError: () => toast({ title: "Gagal menambahkan domain", variant: "destructive" }),
    },
  });

  const { mutate: verifyDomain, isPending: verifying } = useVerifyDomain({
    mutation: {
      onSuccess: () => {
        toast({ title: "Verifikasi selesai" });
        refetch();
      },
    },
  });

  const { mutate: deleteDomain, isPending: deleting } = useDeleteDomain({
    mutation: {
      onSuccess: () => {
        toast({ title: "Domain dihapus" });
        refetch();
        setDeleteId(null);
      },
    },
  });

  const domainList = domains ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Domain Kustom</h1>
            <p className="text-sm text-gray-500 mt-1">Hubungkan domain Anda sendiri ke toko online</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Domain
          </Button>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Cara menghubungkan domain:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Tambahkan domain Anda di bawah ini</li>
            <li>Salin DNS Target yang diberikan</li>
            <li>Tambahkan record CNAME di panel DNS domain Anda</li>
            <li>Klik tombol Verifikasi setelah DNS sudah diperbarui</li>
          </ol>
        </div>

        {/* Domain List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">Memuat domain...</div>
          ) : domainList.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada domain kustom</p>
              <p className="text-sm text-gray-400 mt-1">Tambahkan domain untuk meningkatkan brand toko Anda</p>
              <Button className="mt-4" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Domain Pertama
              </Button>
            </div>
          ) : (
            domainList.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {STATUS_ICONS[d.status] ?? <Globe className="h-4 w-4 text-gray-400" />}
                    <div>
                      <p className="font-semibold text-gray-900">{d.domain}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {STATUS_LABELS[d.status] ?? d.status} · Ditambahkan{" "}
                        {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true, locale: idLocale })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {d.status !== "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={verifying}
                        onClick={() => verifyDomain({ id: d.id, ...AUTH() })}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Verifikasi
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {d.dnsTarget && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">DNS Target (CNAME)</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-800 flex-1">{d.dnsTarget}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(d.dnsTarget ?? "");
                          toast({ title: "Disalin!" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {d.verificationToken && d.status !== "active" && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Token Verifikasi</p>
                    <code className="text-xs font-mono text-gray-700">{d.verificationToken}</code>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Domain Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Domain Kustom</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nama Domain</Label>
            <Input
              className="mt-1"
              placeholder="toko.namaanda.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Contoh: toko.namaanda.com atau www.namaanda.com</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
            <Button
              disabled={creating || !newDomain.trim()}
              onClick={() => createDomain({ data: { domain: newDomain.trim() }, ...AUTH() })}
            >
              Tambah Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Domain?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Domain ini akan dihapus dan tidak bisa diakses lagi melalui UMKM Go.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleting} onClick={() => deleteId && deleteDomain({ id: deleteId, ...AUTH() })}>
              Hapus Domain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
