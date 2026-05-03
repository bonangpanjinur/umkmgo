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
  ShieldAlert,
  Package,
  Globe,
  Layout,
  CreditCard,
  Store,
  Tag,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { useAuth, useLogoutAction } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavSection {
  label: string;
  items: { href: string; label: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    label: "Platform",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/metrik", label: "Metrik & MRR", icon: TrendingUp },
      { href: "/admin/users", label: "Pengguna", icon: Users },
    ],
  },
  {
    label: "Monetisasi",
    items: [
      { href: "/admin/plans", label: "Paket Langganan", icon: Package },
      { href: "/admin/addons", label: "Add-on", icon: Tag },
      { href: "/admin/pembayaran", label: "Approve Bayar", icon: CreditCard },
      { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/admin/templates", label: "Template Tema", icon: Layout },
      { href: "/admin/kategori", label: "Kategori Bisnis", icon: Store },
      { href: "/admin/domains", label: "Domain", icon: Globe },
      { href: "/admin/marketplace", label: "Moderasi Toko", icon: Store },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/tickets", label: "Tiket Support", icon: TicketIcon },
      { href: "/admin/logs", label: "Audit Log", icon: FileText },
      { href: "/admin/flags", label: "Feature Flags", icon: Flag },
      { href: "/admin/health", label: "Platform Health", icon: Activity },
    ],
  },
];

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: any; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-150 text-sm
        ${isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogoutAction();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = location.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-sidebar fixed inset-y-0 z-10 text-sidebar-foreground">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">Admin Panel</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} {...item} isActive={location === item.href} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{user?.name}</span>
              <span className="text-xs text-gray-400">Super Admin</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10 text-xs"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-10 bg-sidebar pt-14 md:hidden flex flex-col overflow-y-auto"
          >
            <div className="p-4 space-y-4 flex-1">
              {navSections.map((section) => (
                <div key={section.label}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink key={item.href} {...item} isActive={location === item.href} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 md:ml-60 min-h-screen">
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-bold text-gray-900 capitalize">{pageTitle}</h1>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Admin Mode
          </span>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
