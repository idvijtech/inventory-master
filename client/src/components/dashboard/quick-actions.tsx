import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Warehouse, BarChart } from "lucide-react";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, navigate] = useLocation();

  const actions = [
    {
      label: "Add Product",
      icon: Plus,
      color: "text-blue-400",
      action: () => navigate("/products")
    },
    {
      label: "Create Order",
      icon: ShoppingCart,
      color: "text-green-400",
      action: () => navigate("/orders")
    },
    {
      label: "Stock Adjustment",
      icon: Warehouse,
      color: "text-orange-400",
      action: () => navigate("/inventory")
    },
    {
      label: "Generate Report",
      icon: BarChart,
      color: "text-purple-400",
      action: () => navigate("/reports")
    }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.label}
                variant="ghost"
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 h-auto"
                onClick={action.action}
              >
                <Icon className={`${action.color} text-2xl mb-2`} />
                <span className="text-white text-sm font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
