import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListProducts, useCreateProduct, useDeleteProduct, Product } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreVertical, Edit, Trash2, PackageOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";

const productSchema = z.object({
  name: z.string().min(2, "Nama wajib diisi"),
  price: z.coerce.number().min(1, "Harga wajib diisi"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true)
});

export default function Catalog() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: productsData, isLoading } = useListProducts(
    { search, limit: 100 }, 
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const createMutation = useCreateProduct({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        setIsAddOpen(false);
        form.reset();
        toast({ title: "Produk ditambahkan" });
      }
    }
  });

  const deleteMutation = useDeleteProduct({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        toast({ title: "Produk dihapus" });
      }
    }
  });

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, description: "", imageUrl: "", isAvailable: true }
  });

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    createMutation.mutate({ data });
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Katalog Produk</h1>
          <p className="text-muted-foreground mt-1">Kelola barang jualan di toko Anda.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input placeholder="Kopi Susu Gula Aren" className="rounded-xl" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input type="number" placeholder="18000" className="rounded-xl" {...form.register("price")} />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input placeholder="Campuran espresso dan gula aren murni" className="rounded-xl" {...form.register("description")} />
              </div>
              <div className="space-y-2">
                <Label>URL Gambar (Opsional)</Label>
                <Input placeholder="https://..." className="rounded-xl" {...form.register("imageUrl")} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Tersedia (Ready Stock)</Label>
                <Switch 
                  checked={form.watch("isAvailable")} 
                  onCheckedChange={(c) => form.setValue("isAvailable", c)} 
                />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-4" disabled={createMutation.isPending}>Simpan Produk</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 mb-6 rounded-2xl shadow-sm border-border/50 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Cari produk..." 
          className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : productsData?.data?.length === 0 ? (
        <div className="text-center py-20">
          <img src={`${import.meta.env.BASE_URL}images/illustration-empty.png`} alt="Empty" className="w-48 h-48 mx-auto opacity-50 mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Produk</h3>
          <p className="text-gray-500 mb-6">Mulai tambahkan produk pertama Anda untuk dijual.</p>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> Tambah Produk Pertama</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData?.data?.map((product: Product) => (
            <Card key={product.id} className="overflow-hidden rounded-2xl border-border/50 hover:shadow-xl transition-all group flex flex-col">
              <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <PackageOpen className="w-16 h-16 text-gray-300" />
                )}
                {!product.isAvailable && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Habis</div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => toast({title: "Edit belum tersedia di demo ini"})}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => {
                        if(confirm("Yakin hapus produk ini?")) deleteMutation.mutate({ id: product.id });
                      }}><Trash2 className="w-4 h-4 mr-2" /> Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-primary font-extrabold text-lg mt-auto">{formatIDR(product.price)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
