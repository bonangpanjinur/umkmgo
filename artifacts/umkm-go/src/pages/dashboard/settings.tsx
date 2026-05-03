import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetMyStore, useUpdateStore } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: store, isLoading } = useGetMyStore({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const updateMutation = useUpdateStore({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/stores/my"] });
        toast({ title: "Pengaturan disimpan" });
      }
    }
  });

  const form = useForm({
    defaultValues: { name: "", description: "", whatsapp: "", logoUrl: "", theme: "modern" as const }
  });

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        description: store.description || "",
        whatsapp: store.whatsapp || "",
        logoUrl: store.logoUrl || "",
        theme: store.theme
      });
    }
  }, [store, form]);

  const onSubmit = (data: any) => {
    if(!store?.slug) return;
    updateMutation.mutate({ slug: store.slug, data });
  };

  const storeUrl = `https://umkm.go/${store?.slug}`;

  if (isLoading) return <DashboardLayout><div className="animate-pulse h-96 bg-gray-200 rounded-2xl"></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Pengaturan Toko</h1>
        <p className="text-muted-foreground mt-1">Ubah informasi publik toko Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 rounded-2xl shadow-sm border-border/50">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Nama Toko</Label>
                <Input className="h-12 rounded-xl" {...form.register("name")} />
              </div>
              
              <div className="space-y-2">
                <Label>Deskripsi Toko</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Ceritakan tentang toko Anda..."
                  {...form.register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label>Nomor WhatsApp</Label>
                <Input type="tel" className="h-12 rounded-xl" {...form.register("whatsapp")} />
                <p className="text-xs text-gray-500">Gunakan format 628xxx atau 8xxx</p>
              </div>

              <div className="space-y-2">
                <Label>URL Logo</Label>
                <Input className="h-12 rounded-xl" {...form.register("logoUrl")} />
              </div>

              <Button type="submit" className="rounded-xl h-12 px-8" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Simpan Perubahan
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-2xl shadow-sm border-border/50 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <h3 className="font-bold text-lg mb-4 text-primary">Toko Anda Online!</h3>
            <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between mb-4 shadow-sm">
              <span className="text-sm font-medium text-gray-700 truncate">{storeUrl}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(storeUrl); toast({title: "Link disalin!"}); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <a href={`/store/${store?.slug}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center h-10 px-4 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
              Lihat Toko <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
