import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { getToken, getUser } from "@/lib/auth";

// Pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import DashboardOverview from "@/pages/dashboard/index";
import Catalog from "@/pages/dashboard/catalog";
import Settings from "@/pages/dashboard/settings";
import BillingPage from "@/pages/dashboard/billing";
import SupportPage from "@/pages/dashboard/support";
import Storefront from "@/pages/storefront";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminRevenue from "@/pages/admin/revenue";
import AdminHealth from "@/pages/admin/health";
import AdminTickets from "@/pages/admin/tickets";
import AdminLogs from "@/pages/admin/logs";
import AdminFlags from "@/pages/admin/flags";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Auth Guard Component
function AuthRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
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
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/store/:slug" component={Storefront} />
      
      {/* Protected User Routes */}
      <Route path="/onboarding"><AuthRoute component={Onboarding} /></Route>
      <Route path="/dashboard"><AuthRoute component={DashboardOverview} /></Route>
      <Route path="/dashboard/catalog"><AuthRoute component={Catalog} /></Route>
      <Route path="/dashboard/settings"><AuthRoute component={Settings} /></Route>
      <Route path="/dashboard/billing"><AuthRoute component={BillingPage} /></Route>
      <Route path="/dashboard/support"><AuthRoute component={SupportPage} /></Route>

      {/* Admin Routes */}
      <Route path="/admin"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/dashboard"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/users"><AuthRoute component={AdminUsers} adminOnly /></Route>
      <Route path="/admin/revenue"><AuthRoute component={AdminRevenue} adminOnly /></Route>
      <Route path="/admin/health"><AuthRoute component={AdminHealth} adminOnly /></Route>
      <Route path="/admin/tickets"><AuthRoute component={AdminTickets} adminOnly /></Route>
      <Route path="/admin/logs"><AuthRoute component={AdminLogs} adminOnly /></Route>
      <Route path="/admin/flags"><AuthRoute component={AdminFlags} adminOnly /></Route>

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
