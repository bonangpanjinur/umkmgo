import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListAdminUsers, useSuspendUser, useUnsuspendUser } from "@workspace/api-client-react";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, ShieldAlert, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminUsers() {
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useListAdminUsers(
    { search, limit: 50 },
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const suspendMutation = useSuspendUser({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "User suspended" });
      }
    }
  });

  const unsuspendMutation = useUnsuspendUser({
    request: { headers: { Authorization: `Bearer ${token}` } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        toast({ title: "User unsuspended" });
      }
    }
  });

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: "compact" }).format(num);

  return (
    <AdminLayout>
      <Card className="p-4 mb-6 rounded-xl shadow-sm border-gray-200 flex items-center gap-3 bg-white">
        <Search className="w-5 h-5 text-gray-400" />
        <Input 
          placeholder="Search users by name, email, or store..." 
          className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card className="rounded-2xl shadow-sm border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Store</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">GMV</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Loading...</td></tr>
              ) : data?.data?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-700">{u.storeName || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase
                      ${u.tier === 'pro' ? 'bg-blue-100 text-blue-700' : 
                        u.tier === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status === 'active' ? <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> : <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatIDR(u.revenue)}</td>
                  <td className="px-6 py-4 text-gray-500">{format(new Date(u.joinDate), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {u.status === 'active' ? (
                          <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => {
                            if(confirm("Suspend this user?")) suspendMutation.mutate({ id: u.id });
                          }}>
                            <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600 cursor-pointer" onClick={() => unsuspendMutation.mutate({ id: u.id })}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Unsuspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
