import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Edit, UserCheck, UserX, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Role = "kasir" | "dapur" | "gudang" | "kurir" | "manager";
type StatusKaryawan = "aktif" | "cuti" | "nonaktif";

interface Karyawan {
  id: string;
  nama: string;
  role: Role;
  telepon: string;
  email: string;
  status: StatusKaryawan;
  bergabung: string;
  pin: string;
  gajiPokok: number;
}

const ROLE_LABELS: Record<Role, string> = {
  kasir: "Kasir",
  dapur: "Staff Dapur",
  gudang: "Staff Gudang",
  kurir: "Kurir",
  manager: "Manager",
};

const ROLE_COLORS: Record<Role, string> = {
  kasir: "bg-blue-100 text-blue-700",
  dapur: "bg-orange-100 text-orange-700",
  gudang: "bg-green-100 text-green-700",
  kurir: "bg-purple-100 text-purple-700",
  manager: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<StatusKaryawan, string> = {
  aktif: "bg-green-100 text-green-700",
  cuti: "bg-yellow-100 text-yellow-700",
  nonaktif: "bg-gray-100 text-gray-600",
};

const INIT: Karyawan[] = [
  { id: "1", nama: "Budi Santoso", role: "kasir", telepon: "08111222333", email: "budi@warung.com", status: "aktif", bergabung: "2025-01-15", pin: "1234", gajiPokok: 2500000 },
  { id: "2", nama: "Siti Rahayu", role: "dapur", telepon: "08222333444", email: "siti@warung.com", status: "aktif", bergabung: "2025-02-01", pin: "5678", gajiPokok: 2200000 },
  { id: "3", nama: "Ahmad Fauzi", role: "gudang", telepon: "08333444555", email: "ahmad@warung.com", status: "aktif", bergabung: "2025-03-10", pin: "9012", gajiPokok: 2000000 },
  { id: "4", nama: "Dewi Lestari", role: "kasir", telepon: "08444555666", email: "dewi@warung.com", status: "cuti", bergabung: "2025-01-20", pin: "3456", gajiPokok: 2500000 },
];

const SHIFTS = [
  { nama: "Pagi", jam: "06:00 – 14:00", karyawan: ["Budi Santoso", "Siti Rahayu"] },
  { nama: "Siang", jam: "14:00 – 22:00", karyawan: ["Ahmad Fauzi", "Dewi Lestari"] },
  { nama: "Malam", jam: "22:00 – 06:00", karyawan: [] },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const EMPTY: Omit<Karyawan, "id"> = { nama: "", role: "kasir", telepon: "", email: "", status: "aktif", bergabung: "", pin: "", gajiPokok: 2000000 };

export default function KaryawanPage() {
  const { toast } = useToast();
  const [karyawans, setKaryawans] = useState(INIT);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Karyawan | null>(null);
  const [form, setForm] = useState<Omit<Karyawan, "id">>(EMPTY);
  const [search, setSearch] = useState("");

  const filtered = karyawans.filter((k) => k.nama.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (k: Karyawan) => {
    setEditItem(k);
    setForm({ nama: k.nama, role: k.role, telepon: k.telepon, email: k.email, status: k.status, bergabung: k.bergabung, pin: k.pin, gajiPokok: k.gajiPokok });
    setShowForm(true);
  };

  const save = () => {
    if (editItem) {
      setKaryawans((prev) => prev.map((k) => k.id === editItem.id ? { ...editItem, ...form } : k));
      toast({ title: "Data karyawan diperbarui" });
    } else {
      setKaryawans((prev) => [...prev, { ...form, id: String(Date.now()) }]);
      toast({ title: "Karyawan berhasil ditambahkan" });
    }
    setShowForm(false);
  };

  const stats = {
    total: karyawans.length,
    aktif: karyawans.filter((k) => k.status === "aktif").length,
    totalGaji: karyawans.filter((k) => k.status === "aktif").reduce((s, k) => s + k.gajiPokok, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Karyawan</h1>
            <p className="text-sm text-gray-500">Kelola tim, shift, dan penggajian</p>
          </div>
          <Button onClick={() => { setForm(EMPTY); setEditItem(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Karyawan</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Aktif Bekerja</p>
            <p className="text-2xl font-bold text-green-600">{stats.aktif}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Gaji/Bulan</p>
            <p className="text-lg font-bold text-gray-900">{formatIDR(stats.totalGaji)}</p>
          </div>
        </div>

        <Tabs defaultValue="daftar">
          <TabsList>
            <TabsTrigger value="daftar">Daftar Karyawan</TabsTrigger>
            <TabsTrigger value="shift">Jadwal Shift</TabsTrigger>
          </TabsList>

          <TabsContent value="daftar">
            <div className="mt-4 space-y-3">
              <div className="relative max-w-xs">
                <Input placeholder="Cari karyawan..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">Belum ada karyawan</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-600">Nama</th>
                        <th className="text-left p-4 font-medium text-gray-600">Role</th>
                        <th className="text-left p-4 font-medium text-gray-600">Kontak</th>
                        <th className="text-left p-4 font-medium text-gray-600">Gaji Pokok</th>
                        <th className="text-left p-4 font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 font-medium text-gray-600">PIN POS</th>
                        <th className="text-left p-4 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((k) => (
                        <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {k.nama.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{k.nama}</p>
                                <p className="text-xs text-gray-400">Bergabung: {k.bergabung}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[k.role]}`}>
                              {ROLE_LABELS[k.role]}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{k.telepon}</td>
                          <td className="p-4 font-medium">{formatIDR(k.gajiPokok)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[k.status]}`}>
                              {k.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-gray-600">****</td>
                          <td className="p-4">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(k)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shift">
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {SHIFTS.map((s) => (
                <div key={s.nama} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="font-bold text-gray-900">Shift {s.nama}</p>
                      <p className="text-xs text-gray-400">{s.jam}</p>
                    </div>
                  </div>
                  {s.karyawan.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Tidak ada karyawan terjadwal</p>
                  ) : (
                    <div className="space-y-2">
                      {s.karyawan.map((nama) => (
                        <div key={nama} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {nama.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{nama}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input className="mt-1" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: StatusKaryawan) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nomor HP</Label>
              <Input className="mt-1" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Gaji Pokok (Rp)</Label>
              <Input className="mt-1" type="number" value={form.gajiPokok} onChange={(e) => setForm({ ...form, gajiPokok: Number(e.target.value) })} />
            </div>
            <div>
              <Label>PIN POS (4 digit)</Label>
              <Input className="mt-1" type="password" maxLength={4} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
            </div>
            <div>
              <Label>Tanggal Bergabung</Label>
              <Input className="mt-1" type="date" value={form.bergabung} onChange={(e) => setForm({ ...form, bergabung: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            <Button disabled={!form.nama} onClick={save}>{editItem ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
