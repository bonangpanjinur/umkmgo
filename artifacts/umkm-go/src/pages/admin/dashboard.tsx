import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Users, Store, DollarSign, TrendingUp, ArrowUpRight, Percent } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(num);

const TIER_COLORS = ["#9ca3af", "#10b981", "#8b5cf6"];

const STAT_CARDS = (stats: any) => [
  {
    label: "Total Pengguna",
    value: (stats?.totalUsers ?? 0).toLocaleString("id-ID"),
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    sub: `${(stats?.activeUsers ?? 0).toLocaleString("id-ID")} aktif`,
    subColor: "text-green-600",
  },
  {
    label: "Toko Aktif",
    value: (stats?.activeUsers ?? 0).toLocaleString("id-ID"),
    icon: Store,
    color: "text-blue-600",
    bg: "bg-blue-50",
    sub: "Toko terdaftar",
    subColor: "text-blue-500",
  },
  {
    label: "MRR",
    value: formatIDR(stats?.mrr ?? 0),
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    sub: "Monthly Recurring Revenue",
    subColor: "text-emerald-500",
  },
  {
    label: "ARPU",
    value: formatIDR(stats?.arpu ?? 0),
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    sub: "Rata-rata per pengguna",
    subColor: "text-violet-500",
  },
  {
    label: "Konversi",
    value: `${stats?.conversionRate ?? 0}%`,
    icon: Percent,
    color: "text-orange-600",
    bg: "bg-orange-50",
    sub: "Free → Berbayar",
    subColor: "text-orange-500",
  },
  {
    label: "Churn Rate",
    value: `${stats?.churnRate ?? 0}%`,
    icon: ArrowUpRight,
    color: "text-red-600",
    bg: "bg-red-50",
    sub: "Bulan ini",
    subColor: "text-red-500",
  },
];

export default function AdminDashboard() {
  const token = getToken();
  const { data: stats, isLoading } = useGetAdminStats({
    request: { headers: { Authorization: `Bearer ${token}` } },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  const pieData = stats
    ? [
        { name: "Free", value: stats.tierDistribution.free },
        { name: "Pro", value: stats.tierDistribution.pro },
        { name: "Enterprise", value: stats.tierDistribution.enterprise },
      ]
    : [];

  const statCards = STAT_CARDS(stats);

  return (
    <AdminLayout>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Super Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gambaran keseluruhan platform UMKM Go per {format(new Date(), "d MMMM yyyy", { locale: localeId })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4 rounded-2xl shadow-sm border-gray-200 bg-white">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-400 mb-0.5">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{card.value}</p>
            <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Signup Trend */}
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200 bg-white lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 mb-1">Tren Pendaftaran Pengguna</h3>
          <p className="text-xs text-gray-400 mb-5">7 hari terakhir</p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.signupTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  dy={10}
                  tickFormatter={(v) => format(new Date(v), "dd/MM")}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                  labelFormatter={(v) => format(new Date(v), "d MMMM yyyy", { locale: localeId })}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Pendaftar"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tier Distribution */}
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200 bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-1">Distribusi Tier</h3>
          <p className="text-xs text-gray-400 mb-4">Komposisi pengguna saat ini</p>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[index] }} />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{entry.value.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Stores Table */}
      <Card className="p-6 rounded-2xl shadow-sm border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Top Toko Berperforma</h3>
            <p className="text-xs text-gray-400 mt-0.5">Berdasarkan pendapatan tertinggi</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs">
                <th className="pb-3 font-semibold">#</th>
                <th className="pb-3 font-semibold">Nama Toko</th>
                <th className="pb-3 font-semibold">Total Pesanan</th>
                <th className="pb-3 font-semibold">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topStores?.map((store, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-gray-900">{store.storeName}</span>
                  </td>
                  <td className="py-3.5 text-gray-500">{(store.orders ?? 0).toLocaleString("id-ID")} pesanan</td>
                  <td className="py-3.5 font-bold text-emerald-600">{formatIDR(store.revenue ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
