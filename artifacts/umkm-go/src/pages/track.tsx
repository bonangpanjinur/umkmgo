import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Search, Package, CheckCircle, Truck, Clock, MapPin, ChevronRight } from "lucide-react";

const MOCK_ORDER = {
  id: "ORD-20260331-001",
  store: "Warung Bu Sari",
  buyer: "Bapak Joko",
  items: [{ name: "Ayam Bakar Spesial", qty: 2, price: 25000 }, { name: "Es Teh Manis", qty: 2, price: 5000 }],
  total: 60000,
  status: "diantar",
  ekspedisi: "Kurir Internal",
  kurir: "Budi (081234)",
  alamat: "Jl. Merdeka No. 10, Jakarta Selatan",
  estimasi: "30–45 menit",
  steps: [
    { label: "Pesanan Diterima", time: "10:05", done: true },
    { label: "Sedang Diproses Dapur", time: "10:08", done: true },
    { label: "Pesanan Siap", time: "10:22", done: true },
    { label: "Kurir Menjemput", time: "10:28", done: true },
    { label: "Sedang Diantar", time: "10:35", done: true },
    { label: "Terkirim", time: "—", done: false },
  ],
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function TrackPage({ params }: { params?: { id?: string } }) {
  const [orderId, setOrderId] = useState(params?.id ?? "");
  const [searched, setSearched] = useState(!!params?.id);
  const [order, setOrder] = useState(params?.id ? MOCK_ORDER : null);

  const handleSearch = () => {
    if (!orderId.trim()) return;
    setSearched(true);
    if (orderId.toUpperCase().includes("ORD") || orderId === MOCK_ORDER.id) {
      setOrder(MOCK_ORDER);
    } else {
      setOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/marketplace" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">UMKM Go</span>
          </Link>
          <span className="text-sm text-gray-500">Lacak Pesanan</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
          <p className="text-gray-500 mt-1">Masukkan nomor pesanan untuk melihat status pengiriman</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9 h-12 text-base"
                placeholder="Cth: ORD-20260331-001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="h-12 px-6" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Lacak
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Nomor pesanan ada di struk atau email konfirmasi pesanan Anda</p>
        </div>

        {/* Result */}
        {searched && !order && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Pesanan tidak ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Pastikan nomor pesanan benar. Coba: ORD-20260331-001</p>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-900">{order.store}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Pesanan: {order.id}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Sedang Diantar 🚚
                </span>
              </div>

              <div className="space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>{item.name} ×{item.qty}</span>
                    <span>{formatIDR(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>{formatIDR(order.total)}</span>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{order.alamat}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{order.kurir} · Est. {order.estimasi}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Status Pengiriman</h3>
              <div className="relative">
                {order.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {/* Line */}
                    {i < order.steps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${step.done ? "bg-indigo-300" : "bg-gray-200"}`} style={{ height: "calc(100% - 1.5rem)" }} />
                    )}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 ${step.done ? "bg-indigo-600" : "bg-gray-200"}`}>
                      {step.done ? <CheckCircle className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`font-medium text-sm ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
