import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetMyStore, useListProducts } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Smartphone, Receipt, X, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

type OrderType = "dine-in" | "takeaway" | "delivery";
type PaymentMethod = "cash" | "qris";

const ORDER_TYPES: { value: OrderType; label: string; icon: string }[] = [
  { value: "dine-in", label: "Makan di Sini", icon: "🍽️" },
  { value: "takeaway", label: "Bawa Pulang", icon: "🛍️" },
  { value: "delivery", label: "Antar", icon: "🚚" },
];

const TAX_RATE = 0.1;
const SERVICE_CHARGE = 0.05;

export default function POSPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [includeTax, setIncludeTax] = useState(true);
  const [includeService, setIncludeService] = useState(false);

  const { data: store } = useGetMyStore(AUTH());
  const { data: productsData } = useListProducts({ limit: 100 }, AUTH());

  const products = productsData?.data ?? [];
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = includeTax ? subtotal * TAX_RATE : 0;
  const service = includeService ? subtotal * SERVICE_CHARGE : 0;
  const total = subtotal + tax + service;
  const change = paymentMethod === "cash" ? Math.max(0, Number(cashInput.replace(/\D/g, "")) - total) : 0;

  const addToCart = (p: any) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === p.id);
      if (ex) return prev.map((c) => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: Number(p.price), qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const processPayment = () => {
    if (paymentMethod === "cash" && Number(cashInput.replace(/\D/g, "")) < total) {
      toast({ title: "Uang kurang", variant: "destructive" });
      return;
    }
    const order = {
      items: cart,
      orderType,
      tableNumber,
      subtotal,
      tax,
      service,
      total,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? Number(cashInput.replace(/\D/g, "")) : total,
      change,
      timestamp: new Date().toLocaleString("id-ID"),
      storeName: store?.name ?? "Toko",
    };
    setLastOrder(order);
    setShowPayment(false);
    setShowReceipt(true);
    setCart([]);
    setTableNumber("");
    setCashInput("");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Order Type */}
          <div className="flex gap-2 mb-3">
            {ORDER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setOrderType(t.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all
                  ${orderType === t.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {orderType === "dine-in" && (
            <div className="mb-3">
              <Input
                placeholder="Nomor meja (cth: A1, B3)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="text-center font-semibold"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Utensils className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Tidak ada produk. Tambah menu di Katalog Produk terlebih dahulu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((p) => {
                  const inCart = cart.find((c) => c.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`relative bg-white rounded-xl border-2 p-3 text-left hover:shadow-md transition-all active:scale-95
                        ${inCart ? "border-primary" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      {inCart && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                          {inCart.qty}
                        </div>
                      )}
                      <div className="w-full h-20 rounded-lg bg-gray-100 mb-2 overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                      <p className="text-primary font-bold text-sm mt-0.5">{formatIDR(Number(p.price))}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:w-80 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              {orderType === "dine-in" && tableNumber
                ? `Meja ${tableNumber}`
                : ORDER_TYPES.find((t) => t.value === orderType)?.label}
            </h2>
            <span className="text-sm text-gray-400">{cart.reduce((s, c) => s + c.qty, 0)} item</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 py-12">
                <ShoppingBag className="h-12 w-12 mb-3" />
                <p className="text-sm">Pilih menu dari katalog</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 flex-1 line-clamp-1">{item.name}</p>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20"
                      >
                        <Plus className="h-3 w-3 text-primary" />
                      </button>
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{formatIDR(item.price * item.qty)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            {/* Toggles */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setIncludeTax(!includeTax)}
                className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all ${includeTax ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-400"}`}
              >
                PB1 10%
              </button>
              <button
                onClick={() => setIncludeService(!includeService)}
                className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all ${includeService ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-400"}`}
              >
                Service 5%
              </button>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {includeTax && <div className="flex justify-between text-sm text-gray-500"><span>PB1 (10%)</span><span>{formatIDR(tax)}</span></div>}
            {includeService && <div className="flex justify-between text-sm text-gray-500"><span>Service (5%)</span><span>{formatIDR(service)}</span></div>}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>TOTAL</span>
              <span className="text-primary">{formatIDR(total)}</span>
            </div>
            <Button
              className="w-full h-12 text-base font-bold mt-2"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Bayar Sekarang
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pembayaran — {formatIDR(total)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-gray-200"}`}
              >
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold">Tunai</span>
              </button>
              <button
                onClick={() => setPaymentMethod("qris")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "qris" ? "border-primary bg-primary/5" : "border-gray-200"}`}
              >
                <Smartphone className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold">QRIS</span>
              </button>
            </div>

            {paymentMethod === "cash" ? (
              <div>
                <label className="text-sm text-gray-600 block mb-1">Uang Diterima</label>
                <Input
                  className="text-xl font-bold text-center h-14"
                  placeholder="0"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value.replace(/\D/g, ""))}
                />
                {Number(cashInput) >= total && (
                  <div className="mt-2 bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Kembalian</p>
                    <p className="text-2xl font-bold text-green-600">{formatIDR(change)}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[20000, 50000, 100000, 50000, 100000, 200000].map((n, i) => (
                    <button
                      key={i}
                      onClick={() => setCashInput(String(n))}
                      className="py-2 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {formatIDR(n)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-xl mx-auto flex items-center justify-center">
                  <Smartphone className="h-12 w-12 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mt-3">Tampilkan QR kepada pelanggan</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatIDR(total)}</p>
              </div>
            )}

            <Button className="w-full h-12 text-base font-bold" onClick={processPayment}>
              ✓ Konfirmasi Pembayaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {lastOrder && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Struk Pembayaran
              </DialogTitle>
            </DialogHeader>
            <div className="font-mono text-sm space-y-1 bg-gray-50 rounded-xl p-4">
              <p className="text-center font-bold text-base">{lastOrder.storeName}</p>
              <p className="text-center text-xs text-gray-400">{lastOrder.timestamp}</p>
              <p className="text-center text-xs text-gray-400">{lastOrder.orderType === "dine-in" ? `Meja: ${lastOrder.tableNumber}` : ORDER_TYPES.find((t) => t.value === lastOrder.orderType)?.label}</p>
              <div className="border-t border-dashed border-gray-300 my-2" />
              {lastOrder.items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.qty}</span>
                  <span>{formatIDR(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 my-2" />
              <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(lastOrder.subtotal)}</span></div>
              {lastOrder.tax > 0 && <div className="flex justify-between"><span>PB1</span><span>{formatIDR(lastOrder.tax)}</span></div>}
              {lastOrder.service > 0 && <div className="flex justify-between"><span>Service</span><span>{formatIDR(lastOrder.service)}</span></div>}
              <div className="flex justify-between font-bold border-t border-dashed border-gray-300 pt-1 mt-1"><span>TOTAL</span><span>{formatIDR(lastOrder.total)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Bayar ({lastOrder.paymentMethod === "cash" ? "Tunai" : "QRIS"})</span><span>{formatIDR(lastOrder.cashReceived)}</span></div>
              {lastOrder.change > 0 && <div className="flex justify-between"><span>Kembali</span><span>{formatIDR(lastOrder.change)}</span></div>}
              <div className="border-t border-dashed border-gray-300 my-2" />
              <p className="text-center text-xs text-gray-400">Terima kasih telah berbelanja!</p>
              <p className="text-center text-xs text-gray-400">Powered by UMKM Go</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setShowReceipt(false); setLastOrder(null); }}>Tutup</Button>
              <Button onClick={() => window.print()}>Cetak</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
