import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Layout, Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templates = [
  {
    id: "modern",
    name: "Modern",
    desc: "Bersih dan minimalis, cocok untuk fashion dan lifestyle",
    color: "from-indigo-400 to-purple-500",
    free: true,
    active: true,
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Tampilan klasik elegan untuk semua jenis toko",
    color: "from-amber-400 to-orange-500",
    free: true,
    active: false,
  },
  {
    id: "fresh",
    name: "Fresh",
    desc: "Cocok untuk toko makanan, minuman, dan produk segar",
    color: "from-green-400 to-teal-500",
    free: true,
    active: false,
  },
  {
    id: "bold",
    name: "Bold",
    desc: "Kontras tinggi dan impactful untuk toko elektronik",
    color: "from-gray-700 to-gray-900",
    free: false,
    active: false,
  },
  {
    id: "warm",
    name: "Warm",
    desc: "Nuansa hangat untuk produk handmade dan kerajinan",
    color: "from-rose-400 to-pink-500",
    free: false,
    active: false,
  },
  {
    id: "pro",
    name: "Professional",
    desc: "Tampilan premium untuk jasa dan konsultan",
    color: "from-blue-600 to-cyan-500",
    free: false,
    active: false,
  },
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [active, setActive] = useState("modern");

  const apply = (id: string, free: boolean) => {
    if (!free) {
      toast({ title: "Upgrade diperlukan", description: "Template ini hanya tersedia di paket Bisnis ke atas." });
      return;
    }
    setActive(id);
    toast({ title: "Template berhasil diterapkan!" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Toko</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih tampilan storefront yang sesuai brand Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                active === t.id ? "border-indigo-500 shadow-md" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Preview */}
              <div className={`h-36 bg-gradient-to-br ${t.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Layout className="h-10 w-10 text-white/60" />
                </div>
                {!t.free && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Bisnis
                  </div>
                )}
                {active === t.id && (
                  <div className="absolute top-2 left-2 bg-white text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Aktif
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  variant={active === t.id ? "secondary" : "default"}
                  disabled={active === t.id}
                  onClick={() => apply(t.id, t.free)}
                >
                  {active === t.id ? "Sedang Digunakan" : t.free ? "Terapkan" : "Upgrade untuk Pakai"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
