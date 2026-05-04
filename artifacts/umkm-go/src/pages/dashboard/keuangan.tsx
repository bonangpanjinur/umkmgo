import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState, useMemo } from "react";
import { useListOrders, useListProducts } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Package, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", minimumFractionDigits: 0 }).format(n);
}

function formatIDRFull(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const PIE_COLORS = ["#6366f1", "#a5b4fc"];
const HPP_RATIO = 0.4; // assumed 40% COGS ratio

function getDateRange(period: string) {
  const end = new Date();
  const start = new Date();
  if (period === "7d") start.setDate(end.getDate() - 6);
  else if (period === "30d") start.setDate(end.getDate() - 29);
  else {
    start.setDate(1);
  }
  return { start, end };
}

function buildDailyData(orders: any[], period: string) {
  const { start } = getDateRange(period);
  const days = Math.ceil((Date.now() - start.getTime()) / 86400000) + 1;
  const map: Record<string, { tgl: string; omzet: number; hpp: number; profit: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    map[key] = { tgl: label, omzet: 0, hpp: 0, profit: 0 };
  }

  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (map[key]) {
      const amount = Number(o.totalAmount ?? 0);
      map[key].omzet += amount;
      map[key].hpp += amount * HPP_RATIO;
      map[key].profit += amount * (1 - HPP_RATIO);
    }
  }
  return Object.values(map);
}

function buildPeakHours(orders: any[]) {
  const hours: Record<number, number> = {};
  for (let h = 6; h <= 22; h++) hours[h] = 0;
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const h = new Date(o.createdAt).getHours();
    if (hours[h] !== undefined) hours[h]++;
  }
  return Object.entries(hours).map(([h, trx]) => ({
    jam: `${h.padStart ? h : String(h).padStart(2, "0")}:00`,
    trx,
  }));
}

function buildTopProducts(orders: any[]) {
  const map: Record<string, { name: string; omzet: number; terjual: number }> = {};
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const items: any[] = o.items ?? [];
    for (const item of items) {
      const name = item.name ?? item.productName ?? "Produk";
      if (!map[name]) map[name] = { name, omzet: 0, terjual: 0 };
      map[name].omzet += Number(item.price ?? 0) * Number(item.quantity ?? 1);
      map[name].terjual += Number(item.quantity ?? 1);
    }
  }
  return Object.values(map)
    .sort((a, b) => b.omzet - a.omzet)
    .slice(0, 10)
    .map((p) => ({ ...p, margin: 60 }));
}

function buildPaymentPie(orders: any[]) {
  let qris = 0, tunai = 0;
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const n = (o.notes ?? "").toLowerCase();
    if (n.includes("qris")) qris++;
    else tunai++;
  }
  const total = qris + tunai || 1;
  return [
    { name: "QRIS", value: Math.round((qris / total) * 100) },
    { name: "Tunai", value: Math.round((tunai / total) * 100) },
  ];
}

export default function KeuanganPage() {
  const [period, setPeriod] = useState("7d");

  const { data: ordersData, isLoading } = useListOrders({ page: 1, limit: 200 }, AUTH());
  const orders = ordersData?.data ?? [];

  const daily = useMemo(() => buildDailyData(orders, period), [orders, period]);
  const peakHours = useMemo(() => buildPeakHours(orders), [orders]);
  const topProduk = useMemo(() => buildTopProducts(orders), [orders]);
  const paymentPie = useMemo(() => buildPaymentPie(orders), [orders]);

  const totalOmzet = daily.reduce((s, d) => s + d.omzet, 0);
  const totalHPP = daily.reduce((s, d) => s + d.hpp, 0);
  const totalProfit = daily.reduce((s, d) => s + d.profit, 0);
  const marginPct = totalOmzet > 0 ? ((totalProfit / totalOmzet) * 100).toFixed(1) : "0.0";
  const foodCostPct = totalOmzet > 0 ? ((totalHPP / totalOmzet) * 100).toFixed(1) : "0.0";

  // Build kas entries from real orders
  const kasEntries = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled").slice(0, 20);
    return validOrders.map((o) => ({
      id: o.id,
      jenis: "masuk",
      kategori: "Penjualan",
      jumlah: Number(o.totalAmount ?? 0),
      catatan: `${o.buyerName} · ${o.notes ?? ""}`.trim(),
      waktu: new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    }));
  }, [orders]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Keuangan</h1>
            <p className="text-sm text-gray-500">Laporan laba, HPP, dan analitik keuangan</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="30d">30 Hari</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Omzet", value: formatIDR(totalOmzet), icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Laba Kotor", value: formatIDR(totalProfit), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
              { label: "Est. HPP (40%)", value: formatIDR(totalHPP), icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Margin", value: `${marginPct}%`, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="laporan">
          <TabsList>
            <TabsTrigger value="laporan">Laporan Penjualan</TabsTrigger>
            <TabsTrigger value="peak">Peak Hour</TabsTrigger>
            <TabsTrigger value="produk">Per Produk</TabsTrigger>
            <TabsTrigger value="kas">Kas Masuk</TabsTrigger>
          </TabsList>

          <TabsContent value="laporan">
            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
              <h3 className="font-semibold text-gray-800 mb-4">Omzet vs Laba</h3>
              {isLoading ? (
                <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
              ) : daily.every((d) => d.omzet === 0) ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Belum ada data penjualan untuk periode ini</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={daily}>
                    <defs>
                      <linearGradient id="omzet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="tgl" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => formatIDRFull(v)} />
                    <Area type="monotone" dataKey="omzet" name="Omzet" stroke="#6366f1" fill="url(#omzet)" strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" name="Laba" stroke="#22c55e" fill="url(#profit)" strokeWidth={2} />
                    <Area type="monotone" dataKey="hpp" name="Est. HPP" stroke="#f97316" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="peak">
            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Analisis Jam Sibuk</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jam" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [`${v} transaksi`]} />
                    <Bar dataKey="trx" name="Transaksi" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={paymentPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {paymentPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {paymentPie.map((p, i) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        {p.name}
                      </div>
                      <span className="font-bold">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="produk">
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mt-4">
              {topProduk.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Belum ada data produk terjual</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-600">Produk</th>
                      <th className="text-right p-4 font-medium text-gray-600">Omzet</th>
                      <th className="text-right p-4 font-medium text-gray-600">Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProduk.map((p, i) => (
                      <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">
                          <span className="text-gray-400 mr-2">#{i + 1}</span>{p.name}
                        </td>
                        <td className="p-4 text-right font-semibold">{formatIDR(p.omzet)}</td>
                        <td className="p-4 text-right text-gray-600">{p.terjual} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kas">
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mt-4">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Kas Masuk dari Penjualan</h3>
              </div>
              {kasEntries.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Belum ada transaksi kas</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-600">Jenis</th>
                      <th className="text-left p-4 font-medium text-gray-600">Catatan</th>
                      <th className="text-right p-4 font-medium text-gray-600">Jumlah</th>
                      <th className="text-left p-4 font-medium text-gray-600">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kasEntries.map((k) => (
                      <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Masuk
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-xs max-w-[200px] truncate">{k.catatan || "Penjualan"}</td>
                        <td className="p-4 text-right font-semibold text-green-600">+{formatIDR(k.jumlah)}</td>
                        <td className="p-4 text-xs text-gray-400">{k.waktu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
