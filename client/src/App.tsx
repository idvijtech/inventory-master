import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Inventory from "@/pages/inventory";
import Suppliers from "@/pages/suppliers";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import PurchaseOrders from "@/pages/purchase-orders";
import SalesOrders from "@/pages/sales-orders";
import Returns from "@/pages/returns";
import Payments from "@/pages/payments";
import Notifications from "@/pages/notifications";
import BulkUpload from "@/pages/bulk-upload";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/customers" component={Customers} />
      <Route path="/orders" component={Orders} />
      <Route path="/purchase-orders" component={PurchaseOrders} />
      <Route path="/sales-orders" component={SalesOrders} />
      <Route path="/returns" component={Returns} />
      <Route path="/payments" component={Payments} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/bulk-upload" component={BulkUpload} />
      <Route path="/reports" component={Reports} />
      <Route path="/users" component={Users} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
