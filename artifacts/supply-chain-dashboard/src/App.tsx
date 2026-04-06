import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout/Layout";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { FiltersProvider } from "@/contexts/FiltersContext";
import NotFound from "@/pages/not-found";

// Pages
import ExecutiveOverview from "@/pages/dashboard/overview";
import InventoryDashboard from "@/pages/dashboard/inventory";
import LogisticsDashboard from "@/pages/dashboard/logistics";
import ProcurementDashboard from "@/pages/dashboard/procurement";
import ForecastDashboard from "@/pages/dashboard/forecast";
import ProductionDashboard from "@/pages/dashboard/production";
import CostsDashboard from "@/pages/dashboard/costs";
import RisksDashboard from "@/pages/dashboard/risks";
import OrdersDashboard from "@/pages/dashboard/orders";
import SettingsPage from "@/pages/dashboard/settings";
import AIDashboard from "@/pages/dashboard/ai-dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
      staleTime: 15000,
    }
  }
});

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={ExecutiveOverview} />
        <Route path="/inventory" component={InventoryDashboard} />
        <Route path="/logistics" component={LogisticsDashboard} />
        <Route path="/procurement" component={ProcurementDashboard} />
        <Route path="/forecast" component={ForecastDashboard} />
        <Route path="/production" component={ProductionDashboard} />
        <Route path="/costs" component={CostsDashboard} />
        <Route path="/risks" component={RisksDashboard} />
        <Route path="/orders" component={OrdersDashboard} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/ai-dashboard" component={AIDashboard} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nexus-theme">
        <SettingsProvider>
          <FiltersProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Layout>
                  <Router />
                </Layout>
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </FiltersProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
