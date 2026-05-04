import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetDashboardStats, useListOrders } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMemo } from "react";

const AUTH = () => ({ request: { headers: { Authorization: `Bearer ${getToken()}` } } });

function formatIDR(num: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
}

function buildChartData(orders: any[]) {
  const days: Record<string, { name: string; pesanan: number; pendapatan: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("id-ID", { weekday: "short" });
    days[key] = { name: label, pesanan: 0, pendapatan: 0 };
  }
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (days[key]) {
      days[key].pesanan += 1;
      days[key].pendapatan += Number(o.totalAmount ?? 0);
    }
  }
  return Object.values(days);
}

export default function DashboardOverview() {
  const { data: stats, isLoading } = useGetDashboardStats(AUTH());
  const { data: ordersData } = useListOrders({ page: 1, limit: 50 }, AUTH());

  const chartData = useMemo(() => buildChartData(ordersData?.data ?? []), [ordersData]);

  const formatIDRCompact = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", minimumFractionDigits: 0 }).format(num);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-72 bg-gray-200 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const kpis = [
    {
      label: "Total Pengunjung",
      value: (stats?.visitors ?? 0).toLocaleString("id-ID"),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
      trend: null,
    },
    {
      label: "Total Pesanan",
      value: (stats?.orders ?? 0).toLocaleString("id-ID"),
      icon: ShoppingBag,
      color: "text-orange-500",
      bg: "bg-orange-50",
      trend: null,
    },
    {
      label: "Pendapatan",
      value: formatIDR(stats?.revenue ?? 0),
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50",
      trend: null,
    },
    {
      label: "Konversi",
      value: `${stats?.conversionRate ?? 0}%`,
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-50",
      trend: null,
    },
  ];

  const recentOrders = ordersData?.data?.slice(0, 5) ?? [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pantau performa toko Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-5 rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.label}</p>
            <h3 className="text-xl font-bold text-foreground leading-tight">{kpi.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — Pesanan 7 Hari */}
        <Card className="p-5 rounded-2xl shadow-sm border-border/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">Pesanan 7 Hari Terakhir</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Data real dari toko Anda</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                Pesanan
              </span>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  formatter={(val: any, name: string) =>
                    name === "pendapatan" ? [formatIDRCompact(val), "Pendapatan"] : [val, "Pesanan"]
                  }
                />
                <Bar dataKey="pesanan" name="pesanan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-5 rounded-2xl shadow-sm border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Pesanan Terbaru</h3>
            <a href="/dashboard/orders" className="text-xs text-primary font-semibold hover:underline">Lihat semua</a>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-25" />
                <p className="text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{order.buyerName}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className="font-bold text-sm text-green-600 flex-shrink-0">{formatIDRCompact(Number(order.totalAmount))}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
