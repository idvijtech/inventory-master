import { Card, CardContent } from "@/components/ui/card";
import { Boxes, AlertTriangle, DollarSign, Clock, TrendingUp, ShoppingBag, ShoppingCart, Truck, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  todaySales: number;
  expiringSoon: number;
}

interface SummaryCardsProps {
  stats: DashboardStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  // Fetch separated order data
  const { data: purchaseOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: salesOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/sales-orders"],
  });

  // Calculate metrics
  const pendingPurchaseOrders = Array.isArray(purchaseOrders) 
    ? purchaseOrders.filter((order: any) => order.status === 'pending').length 
    : 0;
  const completedSalesOrders = Array.isArray(salesOrders) 
    ? salesOrders.filter((order: any) => order.status === 'completed').length 
    : 0;
  const totalRevenue = Array.isArray(salesOrders)
    ? salesOrders
        .filter((order: any) => order.status === 'completed')
        .reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0)
    : 0;

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Boxes,
      iconBg: "bg-blue-600",
      change: "+12% from last month",
      changeIcon: TrendingUp,
      changeColor: "text-green-400"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      iconBg: stats.lowStockItems > 0 ? "bg-red-600" : "bg-gray-600",
      change: stats.lowStockItems > 0 ? "Requires attention" : "All items in stock",
      changeIcon: AlertTriangle,
      changeColor: stats.lowStockItems > 0 ? "text-red-400" : "text-green-400"
    },
    {
      title: "Purchase Orders",
      value: Array.isArray(purchaseOrders) ? purchaseOrders.length.toString() : "0",
      icon: ShoppingBag,
      iconBg: "bg-blue-600",
      change: `${pendingPurchaseOrders} pending`,
      changeIcon: Truck,
      changeColor: pendingPurchaseOrders > 0 ? "text-yellow-400" : "text-green-400"
    },
    {
      title: "Sales Orders",
      value: Array.isArray(salesOrders) ? salesOrders.length.toString() : "0",
      icon: ShoppingCart,
      iconBg: "bg-green-600",
      change: `${completedSalesOrders} completed`,
      changeIcon: Users,
      changeColor: "text-green-400"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconBg: "bg-emerald-600",
      change: "From completed orders",
      changeIcon: TrendingUp,
      changeColor: "text-green-400"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon.toString(),
      icon: Clock,
      iconBg: stats.expiringSoon > 0 ? "bg-red-600" : "bg-gray-600",
      change: stats.expiringSoon > 0 ? "Within 7 days" : "No items expiring",
      changeIcon: Clock,
      changeColor: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const ChangeIcon = card.changeIcon;
        
        return (
          <Card key={card.title} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className={`text-sm mt-2 flex items-center ${card.changeColor}`}>
                    <ChangeIcon className="w-4 h-4 mr-1" />
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
