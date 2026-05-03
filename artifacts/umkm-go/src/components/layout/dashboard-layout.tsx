import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ChefHat,
  Layers,
  Users,
  Wallet,
  Truck,
  Globe,
  Store as StoreIcon,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Utensils,
  BoxesIcon,
  BarChart2,
} from "lucide-react";
import { useAuth, useLogoutAction } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NavSection {
  label: string;
  items: { href: string; label: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/dashboard/pos", label: "Kasir (POS)", icon: ShoppingCart },
      { href: "/dashboard/kds", label: "Dapur (KDS)", icon: ChefHat },
    ],
  },
  {
    label: "Produk & Stok",
    items: [
      { href: "/dashboard/catalog", label: "Katalog Produk", icon: Package },
      { href: "/dashboard/bahan-baku", label: "Bahan Baku", icon: Utensils },
      { href: "/dashboard/stok", label: "Stok & Opname", icon: BoxesIcon },
    ],
  },
  {
    label: "Penjualan",
    items: [
      { href: "/dashboard/orders", label: "Pesanan", icon: Layers },
      { href: "/dashboard/customers", label: "Pelanggan", icon: Users },
      { href: "/dashboard/kurir", label: "Kurir", icon: Truck },
      { href: "/dashboard/marketplace", label: "Marketplace", icon: Globe },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { href: "/dashboard/keuangan", label: "Keuangan", icon: BarChart2 },
      { href: "/dashboard/karyawan", label: "Karyawan", icon: Users },
      { href: "/dashboard/payments", label: "Pembayaran", icon: Wallet },
      { href: "/dashboard/shipping", label: "Pengiriman", icon: Truck },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/dashboard/templates", label: "Tema Toko", icon: StoreIcon },
      { href: "/dashboard/domains", label: "Domain", icon: Globe },
      { href: "/dashboard/seo", label: "SEO", icon: Globe },
      { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
      { href: "/dashboard/billing", label: "Paket & Billing", icon: CreditCard },
      { href: "/dashboard/support", label: "Bantuan", icon: LifeBuoy },
    ],
  },
];

const allItems = navSections.flatMap((s) => s.items);

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: any;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 text-sm
        ${isActive ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogoutAction();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <StoreIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">UMKM Go</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
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

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-foreground truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate capitalize">{user?.tier ?? "Basic"} Plan</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <StoreIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">UMKM Go</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-10 bg-white pt-14 md:hidden flex flex-col overflow-y-auto"
          >
            <div className="p-4 space-y-4 flex-1">
              {navSections.map((section) => (
                <div key={section.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.href}
                        {...item}
                        isActive={location === item.href}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <Button variant="outline" className="w-full text-red-600" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" /> Keluar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
