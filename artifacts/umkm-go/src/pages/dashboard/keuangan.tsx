import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(n);
}

const DAILY = [
  { tgl: "25 Mar", omzet: 1850000, hpp: 740000, profit: 1110000 },
  { tgl: "26 Mar", omzet: 2100000, hpp: 840000, profit: 1260000 },
  { tgl: "27 Mar", omzet: 1650000, hpp: 660000, profit: 990000 },
  { tgl: "28 Mar", omzet: 2450000, hpp: 980000, profit: 1470000 },
  { tgl: "29 Mar", omzet: 2200000, hpp: 880000, profit: 1320000 },
  { tgl: "30 Mar", omzet: 2800000, hpp: 1120000, profit: 1680000 },
  { tgl: "31 Mar", omzet: 3100000, hpp: 1240000, profit: 1860000 },
];

const PEAK_HOURS = [
  { jam: "06:00", trx: 5 }, { jam: "07:00", trx: 18 }, { jam: "08:00", trx: 32 },
  { jam: "09:00", trx: 25 }, { jam: "10:00", trx: 15 }, { jam: "11:00", trx: 28 },
  { jam: "12:00", trx: 55 }, { jam: "13:00", trx: 42 }, { jam: "14:00", trx: 20 },
  { jam: "15:00", trx: 18 }, { jam: "16:00", trx: 22 }, { jam: "17:00", trx: 35 },
  { jam: "18:00", trx: 48 }, { jam: "19:00", trx: 60 }, { jam: "20:00", trx: 45 },
  { jam: "21:00", trx: 30 }, { jam: "22:00", trx: 15 },
];

const PEMBAYARAN_PIE = [
  { name: "QRIS", value: 58 },
  { name: "Tunai", value: 42 },
];
const PIE_COLORS = ["#6366f1", "#a5b4fc"];

const TOP_PRODUK = [
  { name: "Ayam Bakar Spesial", omzet: 4200000, terjual: 840, margin: 62 },
  { name: "Es Teh Manis", omzet: 1500000, terjual: 3000, margin: 80 },
  { name: "Nasi Goreng", omzet: 3100000, terjual: 620, margin: 58 },
  { name: "Soto Ayam", omzet: 2800000, terjual: 560, margin: 55 },
  { name: "Jus Alpukat", omzet: 1800000, terjual: 360, margin: 72 },
];

const KAS = [
  { id: "1", jenis: "masuk", kategori: "Penjualan", jumlah: 3100000, catatan: "Total penjualan hari ini", waktu: "31 Mar 22:00" },
  { id: "2", jenis: "keluar", kategori: "Bahan Baku", jumlah: 850000, catatan: "Restock bahan baku", waktu: "31 Mar 08:00" },
  { id: "3", jenis: "keluar", kategori: "Gaji", jumlah: 250000, catatan: "Uang makan karyawan", waktu: "31 Mar 12:00" },
  { id: "4", jenis: "keluar", kategori: "Operasional", jumlah: 150000, catatan: "Gas LPG", waktu: "30 Mar 07:00" },
  { id: "5", jenis: "masuk", kategori: "Penjualan", jumlah: 2800000, catatan: "Total penjualan kemarin", waktu: "30 Mar 22:00" },
];

export default function KeuanganPage() {
  const [period, setPeriod] = useState("7d");

  const totalOmzet = DAILY.reduce((s, d) => s + d.omzet, 0);
  const totalHPP = DAILY.reduce((s, d) => s + d.hpp, 0);
  const totalProfit = DAILY.reduce((s, d) => s + d.profit, 0);
  const marginPct = ((totalProfit / totalOmzet) * 100).toFixed(1);
  const foodCostPct = ((totalHPP / totalOmzet) * 100).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keuangan</h1>
            <p className="text-sm text-gray-500">Laporan laba, HPP, dan analitik keuangan</p>
          </div>
          <div className="flex gap-2">
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

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Omzet", value: formatIDR(totalOmzet), icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+12%" },
            { label: "Laba Kotor", value: formatIDR(totalProfit), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", trend: "+8%" },
            { label: "HPP", value: formatIDR(totalHPP), icon: Package, color: "text-orange-600", bg: "bg-orange-50", trend: `${foodCostPct}%` },
            { label: "Margin", value: `${marginPct}%`, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50", trend: "+2%" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{kpi.trend}</span>
              </div>
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="laporan">
          <TabsList>
            <TabsTrigger value="laporan">Laporan Penjualan</TabsTrigger>
            <TabsTrigger value="peak">Peak Hour</TabsTrigger>
            <TabsTrigger value="produk">Per Produk</TabsTrigger>
            <TabsTrigger value="kas">Kas Masuk/Keluar</TabsTrigger>
          </TabsList>

          <TabsContent value="laporan">
            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
              <h3 className="font-semibold text-gray-800 mb-4">Omzet vs HPP vs Laba</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={DAILY}>
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
                  <XAxis dataKey="tgl" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatIDR(v)} />
                  <Area type="monotone" dataKey="omzet" name="Omzet" stroke="#6366f1" fill="url(#omzet)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" name="Laba" stroke="#22c55e" fill="url(#profit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hpp" name="HPP" stroke="#f97316" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="peak">
            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Analisis Jam Sibuk (Peak Hour)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={PEAK_HOURS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jam" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="trx" name="Transaksi" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={PEMBAYARAN_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {PEMBAYARAN_PIE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {PEMBAYARAN_PIE.map((p, i) => (
                    <div key={p.name} className="flex justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />{p.name}</div>
                      <span className="font-bold">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="produk">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Produk</th>
                    <th className="text-right p-4 font-medium text-gray-600">Omzet</th>
                    <th className="text-right p-4 font-medium text-gray-600">Terjual</th>
                    <th className="text-right p-4 font-medium text-gray-600">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUK.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        <span className="text-gray-400 mr-2">#{i + 1}</span>{p.name}
                      </td>
                      <td className="p-4 text-right font-semibold">{formatIDR(p.omzet)}</td>
                      <td className="p-4 text-right text-gray-600">{p.terjual} pcs</td>
                      <td className="p-4 text-right">
                        <span className={`font-bold ${p.margin >= 60 ? "text-green-600" : "text-orange-600"}`}>{p.margin}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="kas">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Kas Masuk & Keluar</h3>
                <Button size="sm">+ Catat Kas</Button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">Jenis</th>
                    <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600">Catatan</th>
                    <th className="text-right p-4 font-medium text-gray-600">Jumlah</th>
                    <th className="text-left p-4 font-medium text-gray-600">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {KAS.map((k) => (
                    <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.jenis === "masuk" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {k.jenis === "masuk" ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-xs">{k.kategori}</td>
                      <td className="p-4 text-gray-600 text-xs">{k.catatan}</td>
                      <td className={`p-4 text-right font-semibold ${k.jenis === "masuk" ? "text-green-600" : "text-red-600"}`}>
                        {k.jenis === "masuk" ? "+" : "-"}{formatIDR(k.jumlah)}
                      </td>
                      <td className="p-4 text-xs text-gray-400">{k.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
