import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Globe, Share2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SeoPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "Warung Sederhana — Makanan Rumahan Lezat",
    description: "Pesan makanan rumahan lezat dan segar dari Warung Sederhana. Tersedia aneka menu pilihan dengan harga terjangkau. Gratis ongkir minimum pembelian Rp 50.000.",
    keywords: "warung makan, makanan rumahan, catering, pesan antar makanan",
    ogTitle: "",
    ogDesc: "",
    robotsTxt: "index, follow",
    sitemapEnabled: true,
  });

  const charCount = form.description.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO & Visibilitas</h1>
          <p className="text-sm text-gray-500 mt-1">Optimalkan toko agar mudah ditemukan di mesin pencari</p>
        </div>

        {/* Meta Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Meta Tags</h2>
          </div>

          <div>
            <Label>Judul Halaman (Title Tag)</Label>
            <Input
              className="mt-1"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={60}
            />
            <p className="text-xs text-gray-400 mt-1">{form.title.length}/60 karakter — Ideal: 50-60 karakter</p>
          </div>

          <div>
            <Label>Deskripsi Meta</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={160}
            />
            <p className={`text-xs mt-1 ${charCount > 160 ? "text-red-500" : charCount > 120 ? "text-green-600" : "text-gray-400"}`}>
              {charCount}/160 karakter — Ideal: 120-160 karakter
            </p>
          </div>

          <div>
            <Label>Kata Kunci (Keywords)</Label>
            <Input
              className="mt-1"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="pisahkan dengan koma"
            />
            <p className="text-xs text-gray-400 mt-1">Pisahkan setiap kata kunci dengan koma</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Pratinjau di Google</h2>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-400 mb-1">warungnya.umkmgo.id</p>
            <p className="text-blue-600 text-lg font-medium leading-tight hover:underline cursor-pointer">
              {form.title || "Judul Halaman"}
            </p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {form.description || "Deskripsi meta akan muncul di sini..."}
            </p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Open Graph (Media Sosial)</h2>
          </div>
          <div>
            <Label>Judul OG (opsional)</Label>
            <Input
              className="mt-1"
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              placeholder="Sama dengan Title Tag jika kosong"
            />
          </div>
          <div>
            <Label>Deskripsi OG (opsional)</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={form.ogDesc}
              onChange={(e) => setForm({ ...form, ogDesc: e.target.value })}
              placeholder="Sama dengan Meta Description jika kosong"
            />
          </div>
        </div>

        {/* Technical */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">Teknis SEO</h2>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-800 text-sm">Sitemap XML</p>
              <p className="text-xs text-gray-400">Sitemap otomatis tersedia di /sitemap.xml</p>
            </div>
            <span className="text-green-600 font-medium text-sm">Aktif</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <div>
              <p className="font-medium text-gray-800 text-sm">Robots.txt</p>
              <p className="text-xs text-gray-400">Panduan untuk crawler mesin pencari</p>
            </div>
            <span className="text-sm text-gray-600 font-mono">{form.robotsTxt}</span>
          </div>
        </div>

        <Button onClick={() => toast({ title: "Pengaturan SEO disimpan" })}>Simpan Pengaturan SEO</Button>
      </div>
    </DashboardLayout>
  );
}
