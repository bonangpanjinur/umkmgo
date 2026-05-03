import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { getToken, getUser } from "@/lib/auth";

// Public Pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Storefront from "@/pages/storefront";
import MarketplacePage from "@/pages/marketplace";
import TrackPage from "@/pages/track";
import PricingPage from "@/pages/pricing";
import FeaturesPage from "@/pages/features";
import FAQPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";

// Onboarding
import Onboarding from "@/pages/onboarding";

// Dashboard Pages
import DashboardOverview from "@/pages/dashboard/index";
import POSPage from "@/pages/dashboard/pos";
import KDSPage from "@/pages/dashboard/kds";
import Catalog from "@/pages/dashboard/catalog";
import BahanBakuPage from "@/pages/dashboard/bahan-baku";
import StokPage from "@/pages/dashboard/stok";
import OrdersPage from "@/pages/dashboard/orders";
import CustomersPage from "@/pages/dashboard/customers";
import KurirPage from "@/pages/dashboard/kurir";
import MarketplaceListingPage from "@/pages/dashboard/marketplace-listing";
import KeuanganPage from "@/pages/dashboard/keuangan";
import KaryawanPage from "@/pages/dashboard/karyawan";
import PaymentsPage from "@/pages/dashboard/payments";
import ShippingPage from "@/pages/dashboard/shipping";
import TemplatesPage from "@/pages/dashboard/templates";
import DomainsPage from "@/pages/dashboard/domains";
import SeoPage from "@/pages/dashboard/seo";
import Settings from "@/pages/dashboard/settings";
import BillingPage from "@/pages/dashboard/billing";
import SupportPage from "@/pages/dashboard/support";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMetrik from "@/pages/admin/metrik";
import AdminUsers from "@/pages/admin/users";
import AdminRevenue from "@/pages/admin/revenue";
import AdminHealth from "@/pages/admin/health";
import AdminTickets from "@/pages/admin/tickets";
import AdminLogs from "@/pages/admin/logs";
import AdminFlags from "@/pages/admin/flags";
import AdminPlans from "@/pages/admin/plans";
import AdminAddons from "@/pages/admin/addons";
import AdminPembayaran from "@/pages/admin/pembayaran";
import AdminTemplates from "@/pages/admin/templates";
import AdminDomains from "@/pages/admin/domains";
import AdminKategori from "@/pages/admin/kategori";
import AdminMarketplace from "@/pages/admin/marketplace-mod";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function AuthRoute({ component: Component, adminOnly = false }: { component: any; adminOnly?: boolean }) {
  const [, setLocation] = useLocation();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!token || !user) {
      setLocation("/login");
      return;
    }
    if (adminOnly && user.role !== "admin" && user.role !== "super_admin") {
      setLocation("/dashboard");
    }
  }, [token, user, setLocation, adminOnly]);

  if (!token || !user) return null;
  if (adminOnly && user.role !== "admin" && user.role !== "super_admin") return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/track" component={TrackPage} />
      <Route path="/track/:id" component={TrackPage} />
      <Route path="/store/:slug" component={Storefront} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />

      {/* Onboarding */}
      <Route path="/onboarding"><AuthRoute component={Onboarding} /></Route>

      {/* Dashboard — Tenant */}
      <Route path="/dashboard"><AuthRoute component={DashboardOverview} /></Route>
      <Route path="/dashboard/pos"><AuthRoute component={POSPage} /></Route>
      <Route path="/dashboard/kds"><AuthRoute component={KDSPage} /></Route>
      <Route path="/dashboard/catalog"><AuthRoute component={Catalog} /></Route>
      <Route path="/dashboard/bahan-baku"><AuthRoute component={BahanBakuPage} /></Route>
      <Route path="/dashboard/stok"><AuthRoute component={StokPage} /></Route>
      <Route path="/dashboard/orders"><AuthRoute component={OrdersPage} /></Route>
      <Route path="/dashboard/customers"><AuthRoute component={CustomersPage} /></Route>
      <Route path="/dashboard/kurir"><AuthRoute component={KurirPage} /></Route>
      <Route path="/dashboard/marketplace"><AuthRoute component={MarketplaceListingPage} /></Route>
      <Route path="/dashboard/keuangan"><AuthRoute component={KeuanganPage} /></Route>
      <Route path="/dashboard/karyawan"><AuthRoute component={KaryawanPage} /></Route>
      <Route path="/dashboard/payments"><AuthRoute component={PaymentsPage} /></Route>
      <Route path="/dashboard/shipping"><AuthRoute component={ShippingPage} /></Route>
      <Route path="/dashboard/templates"><AuthRoute component={TemplatesPage} /></Route>
      <Route path="/dashboard/domains"><AuthRoute component={DomainsPage} /></Route>
      <Route path="/dashboard/seo"><AuthRoute component={SeoPage} /></Route>
      <Route path="/dashboard/settings"><AuthRoute component={Settings} /></Route>
      <Route path="/dashboard/billing"><AuthRoute component={BillingPage} /></Route>
      <Route path="/dashboard/support"><AuthRoute component={SupportPage} /></Route>

      {/* Admin */}
      <Route path="/admin"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/dashboard"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/metrik"><AuthRoute component={AdminMetrik} adminOnly /></Route>
      <Route path="/admin/users"><AuthRoute component={AdminUsers} adminOnly /></Route>
      <Route path="/admin/revenue"><AuthRoute component={AdminRevenue} adminOnly /></Route>
      <Route path="/admin/health"><AuthRoute component={AdminHealth} adminOnly /></Route>
      <Route path="/admin/tickets"><AuthRoute component={AdminTickets} adminOnly /></Route>
      <Route path="/admin/logs"><AuthRoute component={AdminLogs} adminOnly /></Route>
      <Route path="/admin/flags"><AuthRoute component={AdminFlags} adminOnly /></Route>
      <Route path="/admin/plans"><AuthRoute component={AdminPlans} adminOnly /></Route>
      <Route path="/admin/addons"><AuthRoute component={AdminAddons} adminOnly /></Route>
      <Route path="/admin/pembayaran"><AuthRoute component={AdminPembayaran} adminOnly /></Route>
      <Route path="/admin/templates"><AuthRoute component={AdminTemplates} adminOnly /></Route>
      <Route path="/admin/domains"><AuthRoute component={AdminDomains} adminOnly /></Route>
      <Route path="/admin/kategori"><AuthRoute component={AdminKategori} adminOnly /></Route>
      <Route path="/admin/marketplace"><AuthRoute component={AdminMarketplace} adminOnly /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
