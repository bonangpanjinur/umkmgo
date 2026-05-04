import { ReactNode, useState, useEffect, useCallback } from "react";
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
  QrCode,
  Bell,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth, useLogoutAction } from "@/hooks/use-custom-auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderNotifications, NewOrder } from "@/hooks/use-order-notifications";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function buildNavSections(pendingCount: number): NavSection[] {
  return [
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
        {
          href: "/dashboard/orders",
          label: "Pesanan",
          icon: Layers,
          badge: pendingCount,
        },
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
        { href: "/dashboard/qr-tables", label: "QR Code Meja", icon: QrCode },
        { href: "/dashboard/templates", label: "Tema Toko", icon: StoreIcon },
        { href: "/dashboard/domains", label: "Domain", icon: Globe },
        { href: "/dashboard/seo", label: "SEO", icon: Globe },
        { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
        { href: "/dashboard/billing", label: "Paket & Billing", icon: CreditCard },
        { href: "/dashboard/support", label: "Bantuan", icon: LifeBuoy },
      ],
    },
  ];
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  badge,
}: {
  href: string;
  label: string;
  icon: any;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 text-sm
        ${isActive ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-gray-400"}`}
      />
      <span className="truncate flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <motion.span
          key={badge}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
        >
          {badge > 99 ? "99+" : badge}
        </motion.span>
      )}
    </Link>
  );
}

function SidebarContent({
  location,
  user,
  logout,
  onNav,
  pendingCount,
}: {
  location: string;
  user: any;
  logout: () => void;
  onNav?: () => void;
  pendingCount: number;
}) {
  const sections = buildNavSections(pendingCount);
  return (
    <>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={location === item.href}
                  onClick={onNav}
                />
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
            <span className="text-sm font-bold text-foreground truncate">
              {user?.name}
            </span>
            <span className="text-xs text-muted-foreground truncate capitalize">
              {user?.tier ?? "Basic"} Plan
            </span>
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
    </>
  );
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [
      { freq: 523, start: 0, dur: 0.12 },
      { freq: 659, start: 0.14, dur: 0.12 },
      { freq: 784, start: 0.28, dur: 0.18 },
    ];
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.28, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
  } catch {}
}

function OrderAlertBanner({
  orders,
  onDismiss,
  onView,
}: {
  orders: NewOrder[];
  onDismiss: () => void;
  onView: () => void;
}) {
  const qrOrders = orders.filter((o) => o.source === "qr_table");
  const otherOrders = orders.filter((o) => o.source !== "qr_table");

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Bell className="w-4 h-4 text-white fill-white" />
          </motion.div>
          <span className="text-white font-bold text-sm flex-1">
            {orders.length === 1
              ? "Pesanan Baru Masuk!"
              : `${orders.length} Pesanan Baru Masuk!`}
          </span>
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order list */}
        <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
          {qrOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-indigo-50 border border-indigo-100"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {order.buyerName}
                </p>
                <p className="text-xs text-gray-500">
                  {order.tableNumber ? `Meja ${order.tableNumber} · ` : ""}
                  {formatIDR(order.totalAmount)}
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                QR Meja
              </span>
            </div>
          ))}
          {otherOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {order.buyerName}
                </p>
                <p className="text-xs text-gray-500">{formatIDR(order.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 pb-3 pt-1 flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 text-sm text-gray-500 hover:text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={onView}
            className="flex-1 text-sm font-bold text-white bg-primary hover:bg-primary/90 py-2 rounded-xl transition-colors"
          >
            Lihat Pesanan →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useAuth();
  const logout = useLogoutAction();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertOrders, setAlertOrders] = useState<NewOrder[]>([]);
  const { toast } = useToast();

  const isLoggedIn = !!user;
  const { pendingCount, newOrders, clearNewOrders } =
    useOrderNotifications(isLoggedIn);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    if (newOrders.length === 0) return;

    playNotificationSound();
    setAlertOrders(newOrders);
    clearNewOrders();

    // Fallback toast for each order (visible even if banner dismissed quickly)
    newOrders.forEach((order) => {
      const tableInfo = order.tableNumber ? ` · Meja ${order.tableNumber}` : "";
      toast({
        title: `Pesanan Baru${tableInfo}`,
        description: `${order.buyerName} · ${formatIDR(order.totalAmount)}`,
      });
    });
  }, [newOrders]);

  const handleAlertView = useCallback(() => {
    setAlertOrders([]);
    setLocation("/dashboard/orders");
  }, [setLocation]);

  const handleAlertDismiss = useCallback(() => {
    setAlertOrders([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <StoreIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            UMKM Go
          </span>
        </div>
        <SidebarContent
          location={location}
          user={user}
          logout={logout}
          pendingCount={pendingCount}
        />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-3 z-30 gap-2">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          {drawerOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700" />
          )}
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <StoreIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-base text-foreground truncate">
            UMKM Go
          </span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setLocation("/dashboard/orders")}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Pesanan masuk"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <AnimatePresence>
            {pendingCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none"
              >
                {pendingCount > 99 ? "99+" : pendingCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 border border-primary/20">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-20 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-20 w-72 bg-white shadow-2xl flex flex-col pt-14"
            >
              <SidebarContent
                location={location}
                user={user}
                logout={logout}
                onNav={() => setDrawerOpen(false)}
                pendingCount={pendingCount}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Order Alert Banner */}
      <AnimatePresence>
        {alertOrders.length > 0 && (
          <OrderAlertBanner
            orders={alertOrders}
            onDismiss={handleAlertDismiss}
            onView={handleAlertView}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
