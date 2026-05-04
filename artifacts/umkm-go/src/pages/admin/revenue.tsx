import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminRevenue } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { DollarSign, TrendingUp, CreditCard, ShoppingCart } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";

const formatIDR = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(num);

export default function AdminRevenue() {
  const token = getToken();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data, isLoading } = useGetAdminRevenue(
    { period },
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const TIER_COLORS = ["#9ca3af", "#10b981", "#8b5cf6"];
  const tierData = data
    ? [
        { name: "Free", value: data.byTier.free },
        { name: "Pro", value: data.byTier.pro },
        { name: "Enterprise", value: data.byTier.enterprise },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Monitoring Revenue</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Minggu Ini</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
            <SelectItem value="year">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4" />Total Revenue</p>
          {isLoading ? <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" /> :
            <p className="text-3xl font-bold text-gray-900">{formatIDR(data?.totalRevenue || 0)}</p>}
        </Card>
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4" />MRR</p>
          {isLoading ? <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" /> :
            <div>
              <p className="text-3xl font-bold text-green-600">{formatIDR(data?.mrr || 0)}</p>
              <p className="text-xs text-green-600 mt-1">+{data?.mrrGrowth?.toFixed(1)}% vs bulan lalu</p>
            </div>}
        </Card>
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2 mb-1"><CreditCard className="w-4 h-4" />Payment Success Rate</p>
          {isLoading ? <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" /> :
            <p className="text-3xl font-bold text-blue-600">{data?.paymentSuccessRate?.toFixed(1)}%</p>}
        </Card>
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 flex items-center gap-2 mb-1"><ShoppingCart className="w-4 h-4" />Avg Order Value</p>
          {isLoading ? <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-1" /> :
            <p className="text-3xl font-bold text-gray-900">{formatIDR(data?.avgOrderValue || 0)}</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card className="p-6 rounded-2xl bg-white border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
          {isLoading ? <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> :
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trend || []}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => formatIDR(v)} width={80} />
                  <Tooltip formatter={(v: number) => [formatIDR(v), "Revenue"]} contentStyle={{ borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>}
        </Card>

        {/* By Tier Pie */}
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <h3 className="text-lg font-bold mb-4">Revenue by Tier</h3>
          {isLoading ? <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> :
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {tierData.map((_, i) => <Cell key={i} fill={TIER_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatIDR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {tierData.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[i] }} />
                      <span className="text-gray-600">{t.name}</span>
                    </div>
                    <span className="font-semibold">{formatIDR(t.value)}</span>
                  </div>
                ))}
              </div>
            </>}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6 rounded-2xl bg-white border-gray-200">
        <h3 className="text-lg font-bold mb-4">Transaksi Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 font-semibold">ID Transaksi</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Jumlah</th>
                <th className="pb-3 font-semibold">Tier</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={6} className="py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : data?.recentTransactions?.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-gray-500">{tx.id}</td>
                      <td className="py-3 font-medium text-gray-800">{tx.userEmail}</td>
                      <td className="py-3 font-bold text-gray-900">{formatIDR(tx.amount)}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase
                          ${tx.tier === "pro" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {tx.tier}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${tx.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tx.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{format(new Date(tx.date), "dd MMM yyyy")}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
