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
import Storefront from "@/pages/storefront";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
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

// Fallback empty pages for completeness
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm border m-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-500 mt-2">This module is part of the system but simplified for this demo.</p>
    </div>
  );
}
const Billing = () => {
  const user = getUser();
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-6">Billing & Subscription</h1>
      <div className="p-8 bg-white rounded-2xl shadow-sm border">
        <p className="text-gray-500 mb-2">Current Plan</p>
        <h2 className="text-4xl font-bold uppercase text-primary mb-6">{user?.tier || 'Free'}</h2>
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold">Upgrade Plan</button>
      </div>
    </div>
  );
};

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
      <Route path="/dashboard/billing"><AuthRoute component={Billing} /></Route>
      <Route path="/dashboard/support"><AuthRoute component={() => <PlaceholderPage title="User Support Tickets" />} /></Route>

      {/* Admin Routes */}
      <Route path="/admin"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/dashboard"><AuthRoute component={AdminDashboard} adminOnly /></Route>
      <Route path="/admin/users"><AuthRoute component={AdminUsers} adminOnly /></Route>
      <Route path="/admin/revenue"><AuthRoute component={() => <PlaceholderPage title="Admin Revenue Dashboard" />} adminOnly /></Route>
      <Route path="/admin/health"><AuthRoute component={() => <PlaceholderPage title="Platform Health Monitor" />} adminOnly /></Route>
      <Route path="/admin/tickets"><AuthRoute component={() => <PlaceholderPage title="Support Tickets (Admin)" />} adminOnly /></Route>
      <Route path="/admin/logs"><AuthRoute component={() => <PlaceholderPage title="Audit Logs" />} adminOnly /></Route>
      <Route path="/admin/flags"><AuthRoute component={() => <PlaceholderPage title="Feature Flags Manager" />} adminOnly /></Route>

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
