import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const salesData = [
  { name: "Mon", sales: 12000 },
  { name: "Tue", sales: 19000 },
  { name: "Wed", sales: 15000 },
  { name: "Thu", sales: 25000 },
  { name: "Fri", sales: 22000 },
  { name: "Sat", sales: 30000 },
  { name: "Sun", sales: 28000 },
];

export function SalesChart() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">Sales Overview</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">7D</Button>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">30D</Button>
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
