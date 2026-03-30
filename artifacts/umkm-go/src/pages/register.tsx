import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { useRegisterAuth } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function Register() {
  const registerMutation = useRegisterAuth();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">UMKM Go</span>
          </div>
          
          <h2 className="text-3xl font-display font-bold tracking-tight text-gray-900 mb-2">Buat Akun Baru</h2>
          <p className="text-gray-600 mb-8">Mulai perjalanan digital bisnis Anda sekarang.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="Budi Santoso" className="h-12 rounded-xl" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" className="h-12 rounded-xl" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Minimal 6 karakter" className="h-12 rounded-xl" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/25" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Daftar Sekarang
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun? <Link href="/login" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gray-900 items-center justify-center relative overflow-hidden">
        {/* landing page abstract dashboard interface */}
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop" alt="Dashboard" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 max-w-lg text-center px-8 text-white">
          <h3 className="text-4xl font-display font-bold mb-6">Bergabung dengan Ribuan UMKM Sukses</h3>
          <p className="text-gray-300 text-lg">Mulai berjualan online dalam hitungan menit dan saksikan bisnis Anda berkembang.</p>
        </div>
      </div>
    </div>
  );
}
