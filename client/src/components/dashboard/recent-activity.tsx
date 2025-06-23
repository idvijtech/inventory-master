import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, AlertTriangle, Truck } from "lucide-react";

const recentActivities = [
  {
    id: 1,
    type: "stock_in",
    message: "New stock added:",
    item: "iPhone 13 Pro",
    detail: "+50 units • 2 hours ago",
    icon: Plus,
    iconBg: "bg-green-600"
  },
  {
    id: 2,
    type: "sale",
    message: "Sales order completed:",
    item: "#SO-2024-0156",
    detail: "$2,340 • 3 hours ago",
    icon: ShoppingCart,
    iconBg: "bg-blue-600"
  },
  {
    id: 3,
    type: "alert",
    message: "Low stock alert:",
    item: "Samsung Galaxy Tab",
    detail: "2 units remaining • 5 hours ago",
    icon: AlertTriangle,
    iconBg: "bg-orange-600"
  },
  {
    id: 4,
    type: "purchase",
    message: "Purchase order received:",
    item: "Apple Supplies Co.",
    detail: "PO-2024-0089 • 6 hours ago",
    icon: Truck,
    iconBg: "bg-purple-600"
  }
];

export function RecentActivity() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-4 border-b border-gray-700">
              <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className="text-white text-xs" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  {activity.message} <span className="font-medium">{activity.item}</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">{activity.detail}</p>
              </div>
            </div>
          );
        })}
        <div className="p-4 bg-gray-700/30">
          <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
