import { MainLayout } from "@/components/layout/main-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { InventoryChart } from "@/components/dashboard/inventory-chart";
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Welcome back, manage your inventory efficiently">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Welcome back, manage your inventory efficiently">
      <SummaryCards stats={stats || { totalProducts: 0, lowStockItems: 0, todaySales: 0, expiringSoon: 0 }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <InventoryChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LowStockAlerts />
        <RecentActivity />
      </div>

      <QuickActions />
    </MainLayout>
  );
}
