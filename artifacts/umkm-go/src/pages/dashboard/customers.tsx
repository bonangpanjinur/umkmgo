import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, Users, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(n);
}

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: CustomerForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function CustomersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useListCustomers({ page, limit: 10, search: search || undefined }, AUTH());

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
      },
    },
  });

  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const openEdit = (c: any) => {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone, email: c.email ?? "", address: c.address ?? "", notes: c.notes ?? "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pelanggan</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola data pelanggan toko Anda</p>
          </div>
          <Button onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau nomor HP..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Memuat pelanggan...</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada pelanggan</p>
              <p className="text-sm text-gray-400 mt-1">Tambahkan pelanggan pertama Anda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Nama</th>
                    <th className="text-left p-4 font-medium text-gray-600">Kontak</th>
                    <th className="text-left p-4 font-medium text-gray-600">Pesanan</th>
                    <th className="text-left p-4 font-medium text-gray-600">Total Belanja</th>
                    <th className="text-left p-4 font-medium text-gray-600">Bergabung</th>
                    <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-700">{c.phone}</div>
                        {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                          {c.orderCount}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">{formatIDR(c.totalSpent)}</td>
                      <td className="p-4 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: idLocale })}
                      </td>
                      <td className="p-4 flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
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

      {/* Add/Edit Form */}
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

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Pelanggan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan. Data pelanggan akan dihapus permanen.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleting} onClick={() => deleteId && deleteCustomer({ id: deleteId, ...AUTH() })}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
