import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  BarChart3,
  Box,
  Warehouse,
  Truck,
  Users,
  ShoppingCart,
  FileText,
  UserCog,
  Settings,
  Boxes,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Bell,
  Upload,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Products", href: "/products", icon: Box },
  { name: "Inventory", href: "/inventory", icon: Warehouse },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { 
    name: "Orders", 
    icon: ShoppingCart,
    isExpandable: true,
    subItems: [
      { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingBag },
      { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
    ]
  },
  { name: "Returns & Adjustments", href: "/returns", icon: RotateCcw },
  { name: "Payment Management", href: "/payments", icon: CreditCard },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Bulk Upload", href: "/bulk-upload", icon: Upload },
  { name: "Reports", href: "/reports", icon: FileText },
];

const adminNavigation = [
  { name: "User Management", href: "/users", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="w-64 bg-gray-800 shadow-xl border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Boxes className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">InventoryPro</h1>
            <p className="text-sm text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 flex-1">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            
            if (item.isExpandable && item.subItems) {
              const isExpanded = expandedItems.includes(item.name);
              const hasActiveChild = item.subItems.some(subItem => location === subItem.href);
              
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                      hasActiveChild
                        ? "text-blue-400 bg-blue-900/20"
                        : "text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isActive = location === subItem.href;
                        const SubIcon = subItem.icon;
                        
                        return (
                          <Link key={subItem.name} href={subItem.href}>
                            <div
                              className={cn(
                                "flex items-center px-4 py-2 rounded-lg transition-colors text-sm",
                                isActive
                                  ? "text-blue-400 bg-blue-900/20 border-l-4 border-blue-400"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                              )}
                            >
                              <SubIcon className="w-4 h-4 mr-3" />
                              <span>{subItem.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            if (!item.href) return null;
            
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "text-blue-400 bg-blue-900/20 border-l-4 border-blue-400"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Administration
          </p>
          <div className="mt-2 space-y-2">
            {adminNavigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "text-blue-400 bg-blue-900/20 border-l-4 border-blue-400"
                        : "text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <UserCog className="text-gray-300 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200">John Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
