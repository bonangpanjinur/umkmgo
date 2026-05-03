import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Users, ShoppingBag, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for chart since API only returns stat totals
const mockChartData = [
  { name: 'Senin', visitors: 400, sales: 240 },
  { name: 'Selasa', visitors: 300, sales: 139 },
  { name: 'Rabu', visitors: 520, sales: 380 },
  { name: 'Kamis', visitors: 450, sales: 430 },
  { name: 'Jumat', visitors: 600, sales: 480 },
  { name: 'Sabtu', visitors: 800, sales: 600 },
  { name: 'Minggu', visitors: 950, sales: 700 },
];

export default function DashboardOverview() {
  const token = getToken();
  const { data: stats, isLoading } = useGetDashboardStats({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (isLoading) return <DashboardLayout><div className="animate-pulse flex flex-col gap-6"><div className="h-32 bg-gray-200 rounded-2xl"></div></div></DashboardLayout>;

  const kpis = [
    { label: "Total Pengunjung", value: stats?.visitors || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Pesanan", value: stats?.orders || 0, icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Pendapatan", value: formatIDR(stats?.revenue || 0), icon: DollarSign, color: "text-green-500", bg: "bg-green-50" },
    { label: "Konversi", value: `${stats?.conversionRate || 0}%`, icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pantau performa toko Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl shadow-sm border-border/50 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Statistik Pengunjung 7 Hari Terakhir</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Pesanan Terbaru</h3>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada pesanan</div>
            ) : (
              stats?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.productName}</p>
                      <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-green-600">{formatIDR(order.amount)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
