import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Package, Download, Loader2, QrCode, ShoppingCart,
  Globe, Utensils, Minus, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AUTH_HEADER = () => ({ Authorization: `Bearer ${getToken()}` });

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    notation: "compact", minimumFractionDigits: 0,
  }).format(n);
}
function formatIDRFull(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

type Period = "7d" | "30d" | "90d" | "month";

function getPeriodDates(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (period === "7d") from.setDate(to.getDate() - 6);
  else if (period === "30d") from.setDate(to.getDate() - 29);
  else if (period === "90d") from.setDate(to.getDate() - 89);
  else { from.setDate(1); }
  from.setHours(0, 0, 0, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function useStoreStats(period: Period) {
  const { from, to } = getPeriodDates(period);
  return useQuery({
    queryKey: ["store-stats", from, to],
    queryFn: async () => {
      const res = await fetch(
        `/api/analytics/store-stats?from=${from}&to=${to}`,
        { headers: AUTH_HEADER() }
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60_000,
  });
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-gray-400">—</span>;
  const isUp = pct >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  qr_table:   { label: "QR Meja",   color: "#6366f1", icon: QrCode },
  pos:        { label: "Kasir",     color: "#f97316", icon: ShoppingCart },
  storefront: { label: "Online",    color: "#22c55e", icon: Globe },
  whatsapp:   { label: "WhatsApp",  color: "#16a34a", icon: Globe },
  manual:     { label: "Manual",    color: "#94a3b8", icon: Utensils },
};

function sourceLabel(src: string) { return SOURCE_CONFIG[src]?.label ?? src; }
function sourceColor(src: string) { return SOURCE_CONFIG[src]?.color ?? "#94a3b8"; }

function exportCSV(daily: any[], topProducts: any[], period: string) {
  const rows: string[] = [
    "Laporan Penjualan UMKM Go",
    `Periode: ${period}`,
    "",
    "=== OMZET HARIAN ===",
    "Tanggal,Omzet,Pesanan",
    ...daily.map((d: any) => `${d.date},${d.revenue},${d.orders}`),
    "",
    "=== PRODUK TERLARIS ===",
    "Produk,Omzet,Terjual",
    ...topProducts.map((p: any) => `"${p.name}",${p.revenue},${p.sold}`),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-umkm-go-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800">
            {typeof p.value === "number" && p.name !== "Pesanan"
              ? formatIDRFull(p.value)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PeakHoursHeatmap({ data }: { data: any[] }) {
  const max = Math.max(...data.map((d) => d.orders), 1);
  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
      {data.map((h) => {
        const intensity = h.orders / max;
        const bg =
          intensity === 0 ? "bg-gray-100 text-gray-300"
          : intensity < 0.3 ? "bg-indigo-100 text-indigo-600"
          : intensity < 0.6 ? "bg-indigo-300 text-indigo-800"
          : intensity < 0.85 ? "bg-indigo-500 text-white"
          : "bg-indigo-700 text-white";
        return (
          <div
            key={h.hour}
            title={`${h.label}: ${h.orders} pesanan${h.revenue > 0 ? ` · ${formatIDRFull(h.revenue)}` : ""}`}
            className={`rounded-lg p-2 text-center cursor-default transition-transform hover:scale-105 ${bg}`}
          >
            <p className="text-[10px] font-bold leading-none">{h.label.slice(0, 5)}</p>
            <p className="text-[11px] font-black mt-0.5">{h.orders}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function KeuanganPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const { data, isLoading } = useStoreStats(period);

  const daily: any[] = data?.daily ?? [];
  const topProducts: any[] = data?.topProducts ?? [];
  const peakHours: any[] = data?.peakHours ?? [];
  const sourceBreakdown: any[] = data?.sourceBreakdown ?? [];
  const totals = data?.totals ?? { revenue: 0, orders: 0, avgOrder: 0 };
  const trends = data?.trends ?? { revenue: null, orders: null };

  const periodLabel = { "7d": "7 Hari", "30d": "30 Hari", "90d": "90 Hari", month: "Bulan Ini" }[period];

  const maxProduct = useMemo(
    () => Math.max(...topProducts.map((p) => p.revenue), 1),
    [topProducts]
  );

  const handleExport = useCallback(() => {
    exportCSV(daily, topProducts, periodLabel);
  }, [daily, topProducts, periodLabel]);

  const kpis = [
    {
      label: "Total Omzet",
      value: formatIDR(totals.revenue),
      trend: trends.revenue,
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Jumlah Pesanan",
      value: totals.orders.toLocaleString("id-ID"),
      trend: trends.orders,
      icon: ShoppingBag,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Rata-rata / Pesanan",
      value: formatIDR(totals.avgOrder),
      trend: null,
      icon: BarChart2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Sumber Terbesar",
      value: sourceBreakdown.length > 0
        ? sourceLabel(sourceBreakdown.sort((a, b) => b.revenue - a.revenue)[0]?.source)
        : "—",
      trend: null,
      icon: QrCode,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
            <p className="text-sm text-gray-500">
              Analitik omzet, produk terlaris, dan jam sibuk — data real dari pesanan masuk
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || daily.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <TrendBadge pct={kpi.trend} />
                </div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
                {kpi.trend !== null && (
                  <p className="text-[10px] text-gray-400 mt-1">vs periode sebelumnya</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="omzet">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="omzet">Grafik Omzet</TabsTrigger>
            <TabsTrigger value="produk">Produk Terlaris</TabsTrigger>
            <TabsTrigger value="jam">Jam Sibuk</TabsTrigger>
            <TabsTrigger value="sumber">Sumber Pesanan</TabsTrigger>
          </TabsList>

          {/* Tab: Grafik Omzet */}
          <TabsContent value="omzet" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Omzet &amp; Jumlah Pesanan Harian</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" />
                    Omzet
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-orange-400 rounded inline-block" />
                    Pesanan
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
              ) : daily.every((d) => d.revenue === 0 && d.orders === 0) ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Belum ada data penjualan untuk periode ini</p>
                    <p className="text-xs mt-1 text-gray-300">Coba pilih rentang waktu yang lebih panjang</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gOmzet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPesanan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="rev"
                      orientation="left"
                      tickFormatter={(v) => formatIDR(v)}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false}
                      width={64}
                    />
                    <YAxis
                      yAxisId="ord"
                      orientation="right"
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false} tickLine={false}
                      width={32}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="rev"
                      type="monotone"
                      dataKey="revenue"
                      name="Omzet"
                      stroke="#6366f1"
                      fill="url(#gOmzet)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Area
                      yAxisId="ord"
                      type="monotone"
                      dataKey="orders"
                      name="Pesanan"
                      stroke="#f97316"
                      fill="url(#gPesanan)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* Tab: Produk Terlaris */}
          <TabsContent value="produk" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">10 Produk Terlaris</h3>
                <p className="text-xs text-gray-400 mt-0.5">Berdasarkan omzet dalam periode {periodLabel}</p>
              </div>
              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Belum ada data produk terjual</p>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  {topProducts.map((p, i) => {
                    const pct = (p.revenue / maxProduct) * 100;
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div key={p.name} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm flex-shrink-0 w-6 text-center">
                              {i < 3 ? medals[i] : <span className="text-gray-400 font-mono text-xs">{i + 1}</span>}
                            </span>
                            <span className="font-medium text-sm text-gray-800 truncate">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 text-right">
                            <span className="text-xs text-gray-400">{p.sold} terjual</span>
                            <span className="font-bold text-sm text-gray-900">{formatIDRFull(p.revenue)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Jam Sibuk */}
          <TabsContent value="jam" className="mt-4">
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Heatmap */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-1">Heatmap Jam Sibuk</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Lebih gelap = lebih banyak pesanan. Hover untuk detail.
                </p>
                {isLoading ? (
                  <div className="h-40 bg-gray-50 animate-pulse rounded-xl" />
                ) : (
                  <PeakHoursHeatmap data={peakHours} />
                )}
                <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400">
                  <div className="flex gap-1">
                    {["bg-gray-100", "bg-indigo-100", "bg-indigo-300", "bg-indigo-500", "bg-indigo-700"].map((c, i) => (
                      <div key={i} className={`w-4 h-3 rounded ${c}`} />
                    ))}
                  </div>
                  <span>Sedikit → Banyak</span>
                </div>
              </div>

              {/* Bar chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Grafik Pesanan / Jam</h3>
                {isLoading ? (
                  <div className="h-56 bg-gray-50 animate-pulse rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 8, fill: "#9ca3af" }}
                        interval={2}
                        axisLine={false} tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: "#9ca3af" }}
                        allowDecimals={false}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        formatter={(v: any) => [`${v} pesanan`, "Pesanan"]}
                        contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                      />
                      <Bar dataKey="orders" name="Pesanan" radius={[3, 3, 0, 0]}>
                        {peakHours.map((h) => {
                          const max = Math.max(...peakHours.map((x) => x.orders), 1);
                          const intensity = h.orders / max;
                          const fill = intensity === 0 ? "#e5e7eb"
                            : intensity < 0.3 ? "#a5b4fc"
                            : intensity < 0.6 ? "#818cf8"
                            : intensity < 0.85 ? "#6366f1"
                            : "#4338ca";
                          return <Cell key={h.hour} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Sumber Pesanan */}
          <TabsContent value="sumber" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Pie chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Distribusi Sumber Pesanan</h3>
                {isLoading ? (
                  <div className="h-56 bg-gray-50 animate-pulse rounded-xl" />
                ) : sourceBreakdown.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <QrCode className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Belum ada data</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={sourceBreakdown}
                          dataKey="orders"
                          nameKey="source"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          label={({ name, percent }) =>
                            `${sourceLabel(name)} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {sourceBreakdown.map((s) => (
                            <Cell key={s.source} fill={sourceColor(s.source)} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any, name: any) => [`${v} pesanan`, sourceLabel(name)]}
                          contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                        />
                        <Legend
                          formatter={(value) => sourceLabel(value)}
                          iconType="circle"
                          iconSize={8}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>

              {/* Source table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Detail per Sumber</h3>
                </div>
                {isLoading ? (
                  <div className="p-5 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : sourceBreakdown.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    Belum ada data
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    {sourceBreakdown
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((s) => {
                        const cfg = SOURCE_CONFIG[s.source];
                        const Icon = cfg?.icon ?? Minus;
                        const total = sourceBreakdown.reduce((sum, x) => sum + x.revenue, 0) || 1;
                        const pct = (s.revenue / total) * 100;
                        return (
                          <div key={s.source}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: sourceColor(s.source) + "20" }}
                                >
                                  <Icon
                                    className="w-3.5 h-3.5"
                                    style={{ color: sourceColor(s.source) }}
                                  />
                                </div>
                                <span className="font-medium text-sm text-gray-800">
                                  {sourceLabel(s.source)}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-gray-900">
                                  {formatIDRFull(s.revenue)}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {s.orders} pesanan
                                </p>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  background: sourceColor(s.source),
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
