import { AdminLayout } from "@/components/layout/admin-layout";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, ArrowUpRight } from "lucide-react";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(n);
}

const MRR_DATA = [
  { bulan: "Okt", mrr: 28000000, churn: 1200000, new_mrr: 3500000 },
  { bulan: "Nov", mrr: 32000000, churn: 980000, new_mrr: 4800000 },
  { bulan: "Des", mrr: 37000000, churn: 1100000, new_mrr: 6200000 },
  { bulan: "Jan", mrr: 44000000, churn: 1300000, new_mrr: 8500000 },
  { bulan: "Feb", mrr: 52000000, churn: 1500000, new_mrr: 9800000 },
  { bulan: "Mar", mrr: 61000000, churn: 1800000, new_mrr: 11200000 },
];

const TENANT_GROWTH = [
  { bulan: "Okt", basic: 580, pro: 220, premium: 78 },
  { bulan: "Nov", basic: 650, pro: 255, premium: 95 },
  { bulan: "Des", basic: 720, pro: 298, premium: 115 },
  { bulan: "Jan", basic: 810, pro: 340, premium: 138 },
  { bulan: "Feb", basic: 920, pro: 390, premium: 165 },
  { bulan: "Mar", basic: 1050, pro: 450, premium: 198 },
];

const ARPU_DATA = [
  { bulan: "Okt", arpu: 165000 },
  { bulan: "Nov", arpu: 172000 },
  { bulan: "Des", arpu: 183000 },
  { bulan: "Jan", arpu: 195000 },
  { bulan: "Feb", arpu: 208000 },
  { bulan: "Mar", arpu: 220000 },
];

const TOP_PLANS = [
  { name: "Gratis", tenants: 1050, pct: 61, color: "bg-gray-400" },
  { name: "Basic (Rp 99rb)", tenants: 450, pct: 26, color: "bg-blue-400" },
  { name: "Pro (Rp 249rb)", tenants: 168, pct: 10, color: "bg-indigo-500" },
  { name: "Premium (Rp 549rb)", tenants: 30, pct: 2, color: "bg-amber-500" },
];

const latestMRR = MRR_DATA[MRR_DATA.length - 1];
const prevMRR = MRR_DATA[MRR_DATA.length - 2];
const mrrGrowth = (((latestMRR.mrr - prevMRR.mrr) / prevMRR.mrr) * 100).toFixed(1);
const totalTenants = TENANT_GROWTH[TENANT_GROWTH.length - 1];
const totalActive = totalTenants.basic + totalTenants.pro + totalTenants.premium;

const kpis = [
  { label: "MRR", value: formatIDR(latestMRR.mrr), trend: `+${mrrGrowth}%`, up: true, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { label: "Total Tenant Aktif", value: totalActive.toLocaleString("id-ID"), trend: "+12%", up: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "ARPU", value: formatIDR(ARPU_DATA[ARPU_DATA.length - 1].arpu), trend: "+5.8%", up: true, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Churn Rate", value: "2.9%", trend: "-0.3%", up: false, icon: Activity, color: "text-red-500", bg: "bg-red-50" },
];

export default function MetrikPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metrik Platform</h1>
          <p className="text-sm text-gray-500">MRR, pertumbuhan tenant, ARPU, dan churn</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${k.bg}`}><k.icon className={`h-5 w-5 ${k.color}`} /></div>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${k.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {k.trend}
                </span>
              </div>
              <p className="text-sm text-gray-500">{k.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{k.value}</p>
            </div>
          ))}
        </div>

        {/* MRR Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">MRR Growth (6 Bulan Terakhir)</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly Recurring Revenue dalam IDR</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MRR_DATA}>
              <defs>
                <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => formatIDR(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatIDR(v)} />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="#6366f1" fill="url(#mrr)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="new_mrr" name="New MRR" stroke="#22c55e" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Tenant Growth */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Pertumbuhan Tenant per Paket</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TENANT_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="basic" name="Basic" fill="#94a3b8" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pro" name="Pro" fill="#6366f1" stackId="a" />
                <Bar dataKey="premium" name="Premium" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Distribusi Paket (Saat Ini)</h3>
            <div className="space-y-3">
              {TOP_PLANS.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="font-semibold">{p.tenants.toLocaleString("id-ID")} ({p.pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ARPU trend */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">ARPU Trend (6 Bulan)</h4>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={ARPU_DATA}>
                  <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => formatIDR(v)} />
                  <Line type="monotone" dataKey="arpu" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
