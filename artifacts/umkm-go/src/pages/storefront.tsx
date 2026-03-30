import { useRoute } from "wouter";
import { useGetStoreBySlug } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle, Store as StoreIcon, Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Storefront() {
  const [, params] = useRoute("/store/:slug");
  const slug = params?.slug || "";

  const { data: store, isLoading, error } = useGetStoreBySlug(slug);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  const handleBuy = (productName: string) => {
    if (!store?.whatsapp) return alert("Toko belum mengatur nomor WhatsApp");
    const wa = store.whatsapp.startsWith('0') ? '62' + store.whatsapp.slice(1) : store.whatsapp;
    const text = encodeURIComponent(`Halo ${store.name}, saya ingin memesan produk: *${productName}*`);
    window.open(`https://wa.me/${wa}?text=${text}`, '_blank');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  
  if (error || !store) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <StoreIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Toko Tidak Ditemukan</h1>
      <p className="text-gray-500">Mungkin link salah atau toko telah dihapus.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Cover & Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/80 to-teal-400 w-full"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <StoreIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">{store.name}</h1>
              <p className="text-primary font-medium text-sm mt-1">{store.categoryName}</p>
            </div>
          </div>
          {store.description && (
            <p className="text-gray-600 leading-relaxed max-w-2xl">{store.description}</p>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" /> Daftar Produk
        </h2>

        {store.products?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Toko ini belum menambahkan produk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {store.products?.map((product, idx) => (
              <motion.div key={product.id} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay: idx*0.05}}>
                <Card className="overflow-hidden rounded-2xl border-border/50 hover:shadow-lg transition-all h-full flex flex-col bg-white">
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrl ? (
                       <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">Habis</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug mb-1 line-clamp-2">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-500 line-clamp-1 mb-2">{product.description}</p>}
                    <p className="text-primary font-extrabold text-base sm:text-lg mt-auto mb-3">{formatIDR(product.price)}</p>
                    
                    <Button 
                      onClick={() => handleBuy(product.name)}
                      disabled={!product.isAvailable}
                      className="w-full rounded-xl gap-2 font-semibold shadow-md shadow-green-500/20 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Beli</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating WA Button (Mobile primarily) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => handleBuy("Halo, saya ingin bertanya-tanya dulu.")}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
