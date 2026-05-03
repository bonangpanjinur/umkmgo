import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetPlatformHealth } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Activity, Clock, Database, Server, HardDrive, Zap } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    operational: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Operational" },
    degraded: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Degraded" },
    down: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Down" },
  };
  const s = map[status] || map.operational;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
}

function MetricBar({ value, max = 100, color = "bg-green-500" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : color;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminHealth() {
  const token = getToken();
  const { data, isLoading } = useGetPlatformHealth({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  return (
    <AdminLayout>
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Platform Health Monitor</h2>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" />Uptime</p>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Real-time</span>
          </div>
          {isLoading ? <div className="h-10 bg-gray-100 rounded animate-pulse" /> :
            <p className="text-4xl font-bold text-green-600">{data?.uptime?.toFixed(2)}%</p>}
          <p className="text-xs text-gray-400 mt-1">Last 30 days uptime</p>
        </Card>

        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" />Error Rate</p>
            {!isLoading && (data?.errorRate || 0) > 5 &&
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Alert!</span>}
          </div>
          {isLoading ? <div className="h-10 bg-gray-100 rounded animate-pulse" /> :
            <p className={`text-4xl font-bold ${(data?.errorRate || 0) > 5 ? "text-red-600" : "text-gray-900"}`}>
              {data?.errorRate?.toFixed(2)}%
            </p>}
          <p className="text-xs text-gray-400 mt-1">Alert threshold: &gt;5%</p>
        </Card>

        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" />Avg Response Time</p>
          </div>
          {isLoading ? <div className="h-10 bg-gray-100 rounded animate-pulse" /> :
            <p className={`text-4xl font-bold ${(data?.avgResponseTime || 0) > 500 ? "text-red-600" : "text-gray-900"}`}>
              {data?.avgResponseTime}ms
            </p>}
          <p className="text-xs text-gray-400 mt-1">Target: &lt;500ms</p>
        </Card>
      </div>

      {/* DB & Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <h3 className="text-base font-bold mb-5 flex items-center gap-2"><Database className="w-5 h-5 text-primary" />Database Performance</h3>
          {isLoading ? <div className="h-20 bg-gray-100 rounded animate-pulse" /> : (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-bold">{data?.dbCpu}%</span>
                </div>
                <MetricBar value={data?.dbCpu || 0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-bold">{data?.dbMemory}%</span>
                </div>
                <MetricBar value={data?.dbMemory || 0} color="bg-blue-500" />
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 rounded-2xl bg-white border-gray-200">
          <h3 className="text-base font-bold mb-5 flex items-center gap-2"><HardDrive className="w-5 h-5 text-primary" />Storage Usage</h3>
          {isLoading ? <div className="h-20 bg-gray-100 rounded animate-pulse" /> : (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Used</span>
                <span className="font-bold">{data?.storageUsed} GB / {data?.storageTotal} GB</span>
              </div>
              <MetricBar value={data?.storageUsed || 0} max={data?.storageTotal || 100} color="bg-blue-500" />
              <p className="text-xs text-gray-400 mt-3">
                {((((data?.storageUsed || 0) / (data?.storageTotal || 100)) * 100)).toFixed(1)}% digunakan
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Services Status */}
      <Card className="p-6 rounded-2xl bg-white border-gray-200">
        <h3 className="text-base font-bold mb-5 flex items-center gap-2"><Server className="w-5 h-5 text-primary" />Status Layanan</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.services?.map((svc, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    svc.status === "operational" ? "bg-green-500" :
                    svc.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                  } animate-pulse`} />
                  <span className="font-semibold text-gray-800">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{svc.latency}ms</span>
                  <StatusBadge status={svc.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
