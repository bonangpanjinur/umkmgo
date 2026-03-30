import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Users, Store, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const token = getToken();
  const { data: stats, isLoading } = useGetAdminStats({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: "compact" }).format(num);

  if (isLoading) return <AdminLayout><div className="animate-pulse h-96 bg-gray-200 rounded-2xl"></div></AdminLayout>;

  const pieData = stats ? [
    { name: 'Free', value: stats.tierDistribution.free },
    { name: 'Pro', value: stats.tierDistribution.pro },
    { name: 'Enterprise', value: stats.tierDistribution.enterprise },
  ] : [];
  const COLORS = ['#9ca3af', '#10b981', '#3b82f6'];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Total Users</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</h3>
        </Card>
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Store className="w-4 h-4"/> Active Stores</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats?.activeUsers.toLocaleString()}</h3>
        </Card>
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4"/> MRR</p>
          <h3 className="text-3xl font-bold text-green-600">{formatIDR(stats?.mrr || 0)}</h3>
        </Card>
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> ARPU</p>
          <h3 className="text-3xl font-bold text-gray-900">{formatIDR(stats?.arpu || 0)}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 rounded-2xl shadow-sm border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">User Signups (30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.signupTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
          <h3 className="text-lg font-bold mb-6">Tier Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                <span className="font-medium text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
        <h3 className="text-lg font-bold mb-4">Top Performing Stores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 font-medium">Store Name</th>
                <th className="pb-3 font-medium">Total Orders</th>
                <th className="pb-3 font-medium">Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topStores?.map((store, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 font-semibold text-gray-900">{store.storeName}</td>
                  <td className="py-4 text-gray-600">{store.orders.toLocaleString()}</td>
                  <td className="py-4 font-bold text-green-600">{formatIDR(store.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
