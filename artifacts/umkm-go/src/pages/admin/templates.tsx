import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Layout, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialTemplates = [
  { id: "modern", name: "Modern", tier: "free", uses: 892, active: true, color: "from-indigo-400 to-purple-500" },
  { id: "classic", name: "Classic", tier: "free", uses: 456, active: true, color: "from-amber-400 to-orange-500" },
  { id: "fresh", name: "Fresh", tier: "free", uses: 312, active: true, color: "from-green-400 to-teal-500" },
  { id: "bold", name: "Bold", tier: "bisnis", uses: 178, active: true, color: "from-gray-700 to-gray-900" },
  { id: "warm", name: "Warm", tier: "bisnis", uses: 134, active: true, color: "from-rose-400 to-pink-500" },
  { id: "pro", name: "Professional", tier: "bisnis", uses: 67, active: false, color: "from-blue-600 to-cyan-500" },
];

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  starter: "Starter",
  bisnis: "Bisnis",
  enterprise: "Enterprise",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  bisnis: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-amber-100 text-amber-700",
};

export default function AdminTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);

  const toggle = (id: string, val: boolean) => {
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, active: val } : t));
    toast({ title: `Template ${val ? "diaktifkan" : "dinonaktifkan"}` });
  };

  const totalUses = templates.reduce((s, t) => s + t.uses, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Template</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola template storefront yang tersedia untuk pengguna</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50">
              <Layout className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Template</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Penggunaan</p>
              <p className="text-2xl font-bold text-gray-900">{totalUses.toLocaleString("id-ID")}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Template Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{templates.filter((t) => t.active).length}</p>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${!t.active ? "opacity-60" : ""}`}>
              <div className={`h-28 bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                <Layout className="h-8 w-8 text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[t.tier]}`}>
                      {TIER_LABELS[t.tier]}
                    </span>
                  </div>
                  <Switch checked={t.active} onCheckedChange={(v) => toggle(t.id, v)} />
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{t.uses.toLocaleString("id-ID")} pengguna</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
