import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateStore, useListCategories } from "@workspace/api-client-react";
import { getToken, getUser, setUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, ArrowRight, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

const storeSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  slug: z.string().min(3, "URL toko minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  categoryId: z.string().min(1, "Pilih kategori bisnis Anda"),
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
  logoUrl: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const token = getToken();
  
  // Fetch categories using generated hook - pass headers manually if needed
  const { data: categories, isLoading: catsLoading } = useListCategories({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });
  
  const createMutation = useCreateStore({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "", slug: "", categoryId: "", whatsapp: "", logoUrl: "" },
    mode: "onChange"
  });

  // Auto-generate slug from name
  const storeName = form.watch("name");
  useEffect(() => {
    if (step === 1 && storeName) {
      const generated = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      form.setValue("slug", generated);
    }
  }, [storeName, step, form]);

  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await form.trigger(["name", "slug"]);
    if (step === 2) valid = await form.trigger(["categoryId"]);
    if (step === 3) valid = await form.trigger(["whatsapp"]);
    
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = (data: StoreFormData) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        setStep(5); // Success step
        // Update user local state to hasStore = true
        const u = getUser();
        if(u) setUser({ ...u, hasStore: true });
      },
      onError: (err: any) => {
        toast({ title: "Gagal membuat toko", description: err.message, variant: "destructive" });
      }
    });
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Toko Berhasil Dibuat!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">Selamat, <b>{form.getValues("name")}</b> sekarang sudah online. Mari mulai tambahkan produk pertama Anda.</p>
          <Button size="lg" className="w-full rounded-xl h-14 text-lg" onClick={() => setLocation("/dashboard")}>
            Ke Dashboard Toko
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-20 bg-white border-b border-border flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl">Setup Toko</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
              <span>Langkah {step} dari 4</span>
              <span>{(step / 4) * 100}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>
          </div>

          <Card className="p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 bg-white overflow-hidden relative">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Siapa nama toko Anda?</h2>
                    <p className="text-gray-600">Nama ini akan tampil di website Anda.</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Toko</Label>
                        <Input autoFocus placeholder="Cth: Kopi Kenangan" className="h-14 text-lg rounded-xl" {...form.register("name")} />
                        {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Link Website</Label>
                        <div className="flex shadow-sm rounded-xl overflow-hidden border focus-within:ring-2 ring-primary/20">
                          <span className="inline-flex items-center px-4 bg-gray-50 text-gray-500 font-medium">umkm.go/</span>
                          <Input className="border-0 focus-visible:ring-0 rounded-none h-14 text-lg bg-white" {...form.register("slug")} />
                        </div>
                        {form.formState.errors.slug && <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Apa kategori bisnis Anda?</h2>
                    <p className="text-gray-600">Membantu kami menyesuaikan tampilan toko Anda.</p>
                    
                    {catsLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                        {categories?.map((cat) => {
                          const isSelected = form.watch("categoryId") === cat.id;
                          return (
                            <div 
                              key={cat.id}
                              onClick={() => form.setValue("categoryId", cat.id, { shouldValidate: true })}
                              className={`
                                cursor-pointer p-4 rounded-2xl border-2 transition-all text-center
                                ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                              `}
                            >
                              <span className="text-3xl block mb-2">{cat.icon}</span>
                              <span className="font-semibold text-sm">{cat.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {form.formState.errors.categoryId && <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Nomor WhatsApp Toko</h2>
                    <p className="text-gray-600">Pesanan dari pembeli akan dikirim langsung ke nomor ini.</p>
                    
                    <div className="space-y-2">
                      <Label>Nomor WhatsApp</Label>
                      <div className="flex shadow-sm rounded-xl overflow-hidden border focus-within:ring-2 ring-primary/20">
                        <span className="inline-flex items-center px-4 bg-gray-50 text-gray-700 font-bold border-r">+62</span>
                        <Input type="tel" autoFocus placeholder="81234567890" className="border-0 focus-visible:ring-0 rounded-none h-14 text-lg bg-white" {...form.register("whatsapp")} />
                      </div>
                      {form.formState.errors.whatsapp && <p className="text-sm text-red-500">{form.formState.errors.whatsapp.message}</p>}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Logo Toko (Opsional)</h2>
                    <p className="text-gray-600">Bisa ditambahkan nanti melalui dashboard.</p>
                    
                    <div className="space-y-2">
                      <Label>URL Logo Image</Label>
                      <div className="flex gap-2">
                        <Input placeholder="https://example.com/logo.png" className="h-14 rounded-xl" {...form.register("logoUrl")} />
                      </div>
                    </div>
                    {form.watch("logoUrl") && (
                      <div className="mt-4 w-24 h-24 border rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={form.watch("logoUrl")} alt="Logo Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>

              <div className="mt-10 flex gap-4">
                {step > 1 && (
                  <Button type="button" variant="outline" className="h-14 px-8 rounded-xl" onClick={() => setStep(s => s - 1)}>
                    Kembali
                  </Button>
                )}
                {step < 4 ? (
                  <Button type="button" className="h-14 px-8 rounded-xl flex-1 text-lg shadow-lg shadow-primary/25" onClick={nextStep}>
                    Lanjut <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="h-14 px-8 rounded-xl flex-1 text-lg shadow-lg shadow-primary/25" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    Selesai & Buat Toko
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
