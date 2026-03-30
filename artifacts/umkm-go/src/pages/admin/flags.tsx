import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListFeatureFlags, useUpdateFeatureFlag, useCreateFeatureFlag } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Flag, Plus, Zap } from "lucide-react";
import { format } from "date-fns";

export default function AdminFlags() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState("all");
  const [newDesc, setNewDesc] = useState("");

  const { data: flags, isLoading } = useListFeatureFlags({
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const updateMutation = useUpdateFeatureFlag({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/flags"] });
        toast({ title: "Feature flag diperbarui" });
      },
    },
  });

  const createMutation = useCreateFeatureFlag({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/flags"] });
        toast({ title: "Feature flag dibuat" });
        setShowCreate(false);
        setNewName(""); setNewTier("all"); setNewDesc("");
      },
    },
  });

  const handleToggle = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { status: !currentStatus } });
  };

  const handleRollout = (id: string, val: number) => {
    updateMutation.mutate({ id, data: { rolloutPercent: val } });
  };

  const TIER_COLORS: Record<string, string> = {
    all: "bg-gray-100 text-gray-700",
    free: "bg-green-100 text-green-700",
    pro: "bg-blue-100 text-blue-700",
    enterprise: "bg-purple-100 text-purple-700",
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Flag className="w-4 h-4 text-primary" />Total Flags</p>
          <p className="text-3xl font-bold">{flags?.length || 0}</p>
        </Card>
        <Card className="p-5 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" />Active Flags</p>
          <p className="text-3xl font-bold text-green-600">{flags?.filter(f => f.status).length || 0}</p>
        </Card>
        <Card className="p-5 rounded-2xl bg-white border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Inactive Flags</p>
          <p className="text-3xl font-bold text-gray-400">{flags?.filter(f => !f.status).length || 0}</p>
        </Card>
      </div>

      {/* Flag Cards */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6 rounded-2xl bg-white border-gray-200 animate-pulse">
                <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </Card>
            ))
          : flags?.map((flag) => (
              <Card key={flag.id} className="p-6 rounded-2xl bg-white border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-gray-900 font-mono">{flag.name}</h3>
                      {flag.tier && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${TIER_COLORS[flag.tier] || TIER_COLORS.all}`}>
                          {flag.tier}
                        </span>
                      )}
                    </div>
                    {flag.description && (
                      <p className="text-sm text-gray-500">{flag.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Dibuat: {format(new Date(flag.createdAt), "dd MMM yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-sm font-semibold ${flag.status ? "text-green-600" : "text-gray-400"}`}>
                      {flag.status ? "ON" : "OFF"}
                    </span>
                    <Switch
                      checked={flag.status}
                      onCheckedChange={() => handleToggle(flag.id, flag.status)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>

                {/* Rollout Slider */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Rollout</span>
                    <span className="text-sm font-bold text-primary">{flag.rolloutPercent}%</span>
                  </div>
                  <Slider
                    defaultValue={[flag.rolloutPercent]}
                    max={100}
                    step={5}
                    onValueCommit={(val) => handleRollout(flag.id, val[0])}
                    disabled={!flag.status || updateMutation.isPending}
                    className={!flag.status ? "opacity-40" : ""}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      {/* Create Flag Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Feature Flag Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nama Flag (snake_case)</label>
              <Input
                placeholder="contoh: email_campaigns"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Target Tier</label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tier</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Deskripsi</label>
              <Input
                placeholder="Deskripsi singkat fitur ini..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
              <Button
                onClick={() => createMutation.mutate({ data: { name: newName, tier: newTier, description: newDesc } })}
                disabled={!newName || createMutation.isPending}
              >
                {createMutation.isPending ? "Membuat..." : "Buat Flag"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
