import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { useLoginAuth } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Store, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const loginMutation = useLoginAuth();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">UMKM Go</span>
          </div>
          
          <h2 className="text-3xl font-display font-bold tracking-tight text-gray-900 mb-2">Selamat Datang</h2>
          <p className="text-gray-600 mb-8">Masuk ke akun Anda untuk mengelola toko.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@email.com" className="h-12 rounded-xl" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Lupa password?</a>
              </div>
              <Input id="password" type="password" placeholder="••••••••" className="h-12 rounded-xl" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/25" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Masuk
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun? <Link href="/register" className="font-semibold text-primary hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>

      {/* Right side illustration */}
      <div className="hidden lg:flex flex-1 bg-accent items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="relative z-10 max-w-lg text-center px-8">
          {/* landing page abstract shop illustration */}
          <img src={`${import.meta.env.BASE_URL}images/illustration-shop.png`} alt="Shop Illustration" className="w-full h-auto drop-shadow-2xl hover:-translate-y-4 transition-transform duration-500" />
          <h3 className="mt-12 text-2xl font-display font-bold text-gray-900">Kelola Toko Lebih Mudah</h3>
          <p className="mt-4 text-gray-600 text-lg">Platform all-in-one untuk kembangkan bisnis UMKM Anda menuju digital.</p>
        </div>
      </div>
    </div>
  );
}
