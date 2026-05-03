import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Pencil, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
}

const initialPlans = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    interval: "bulan",
    active: true,
    subscribers: 1234,
    features: ["1 toko", "Maks 10 produk", "Subdomain UMKM Go", "Laporan dasar"],
    color: "border-gray-200",
    badge: "",
  },
  {
    id: "starter",
    name: "Starter",
    price: 49000,
    interval: "bulan",
    active: true,
    subscribers: 487,
    features: ["1 toko", "Maks 50 produk", "Domain kustom", "Laporan lengkap", "Chat support"],
    color: "border-blue-300",
    badge: "",
  },
  {
    id: "bisnis",
    name: "Bisnis",
    price: 149000,
    interval: "bulan",
    active: true,
    subscribers: 231,
    features: ["3 toko", "Produk tak terbatas", "Domain kustom", "Analitik lanjutan", "Prioritas support", "WhatsApp blast"],
    color: "border-indigo-400",
    badge: "Populer",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499000,
    interval: "bulan",
    active: true,
    subscribers: 42,
    features: ["Toko tak terbatas", "API akses penuh", "SLA 99.9%", "Account manager", "Laporan custom"],
    color: "border-amber-400",
    badge: "Premium",
  },
];

export default function AdminPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState(initialPlans);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [editPrice, setEditPrice] = useState("");

  const totalSubs = plans.reduce((s, p) => s + p.subscribers, 0);
  const totalMRR = plans.reduce((s, p) => s + p.price * p.subscribers, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Paket</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola paket langganan dan harga platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">{totalSubs.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">MRR Estimasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(totalMRR)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paket Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{plans.filter((p) => p.active).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl border-2 ${plan.color} p-5`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    {plan.badge && (
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {plan.price === 0 ? "Gratis" : formatIDR(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/{plan.interval}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={plan.active} onCheckedChange={(v) => setPlans(plans.map((p) => p.id === plan.id ? { ...p, active: v } : p))} />
                  <Button size="sm" variant="ghost" onClick={() => { setEditPlan(plan); setEditPrice(String(plan.price)); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>{plan.subscribers.toLocaleString("id-ID")} pelanggan</span>
                <span>MRR: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(plan.price * plan.subscribers)}</span>
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Price Dialog */}
      {editPlan && (
        <Dialog open onOpenChange={() => setEditPlan(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Paket {editPlan.name}</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Harga (Rp/bulan)</Label>
              <Input
                className="mt-1"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPlan(null)}>Batal</Button>
              <Button onClick={() => {
                setPlans(plans.map((p) => p.id === editPlan.id ? { ...p, price: Number(editPrice) } : p));
                toast({ title: `Harga paket ${editPlan.name} diperbarui` });
                setEditPlan(null);
              }}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
