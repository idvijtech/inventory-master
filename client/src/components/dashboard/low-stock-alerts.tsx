import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export function LowStockAlerts() {
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Low Stock Alerts</CardTitle>
          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
            {lowStockProducts.length} items
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No low stock items</p>
          </div>
        ) : (
          <>
            {lowStockProducts.slice(0, 5).map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    product.currentStock === 0 ? 'bg-red-600' : 'bg-orange-600'
                  }`}>
                    {product.currentStock === 0 ? (
                      <X className="text-white text-sm" />
                    ) : (
                      <AlertTriangle className="text-white text-sm" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    product.currentStock === 0 ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {product.currentStock} left
                  </p>
                  <p className="text-gray-400 text-sm">Min: {product.minStockLevel}</p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-gray-700/30">
              <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
                View All Low Stock Items
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
