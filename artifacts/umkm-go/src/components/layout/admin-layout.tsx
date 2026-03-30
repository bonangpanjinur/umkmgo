import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Activity, 
  Ticket as TicketIcon, 
  FileText,
  Flag,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { useAuth, useLogoutAction } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogoutAction();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
    { href: "/admin/health", label: "Platform Health", icon: Activity },
    { href: "/admin/tickets", label: "Support Tickets", icon: TicketIcon },
    { href: "/admin/logs", label: "Audit Logs", icon: FileText },
    { href: "/admin/flags", label: "Feature Flags", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col fixed inset-y-0 z-10 text-sidebar-foreground">
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/50">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">Admin Panel</span>
        </div>
        
        <div className="px-3 py-6 flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
                  ${isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-gray-400 hover:bg-sidebar-accent/50 hover:text-white"}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-primary text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{user?.name}</span>
              <span className="text-xs text-gray-400">{user?.role}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-sidebar-accent" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-display font-bold text-xl text-gray-900 capitalize">
            {location.split("/").pop()?.replace("-", " ") || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Admin Mode Active
            </span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
