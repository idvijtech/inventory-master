import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Notification } from "@shared/schema";
import { formatDate, formatDateTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, CheckCircle, AlertTriangle, Info, XCircle, Package, DollarSign, Calendar, Search, MarkAsUnread } from "lucide-react";

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const filteredNotifications = notifications?.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'unread') return matchesSearch && !notification.isRead;
    if (selectedTab === 'read') return matchesSearch && notification.isRead;
    return matchesSearch && notification.type === selectedTab;
  }) || [];

  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low_stock': return <Package className="h-5 w-5 text-orange-500" />;
      case 'expiry_alert': return <Calendar className="h-5 w-5 text-red-500" />;
      case 'order_update': return <Package className="h-5 w-5 text-blue-500" />;
      case 'payment_due': return <DollarSign className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'opacity-60' : '';
    switch (type) {
      case 'info': return `bg-blue-50 border-blue-200 ${opacity}`;
      case 'warning': return `bg-yellow-50 border-yellow-200 ${opacity}`;
      case 'error': return `bg-red-50 border-red-200 ${opacity}`;
      case 'success': return `bg-green-50 border-green-200 ${opacity}`;
      case 'low_stock': return `bg-orange-50 border-orange-200 ${opacity}`;
      case 'expiry_alert': return `bg-red-50 border-red-200 ${opacity}`;
      case 'order_update': return `bg-blue-50 border-blue-200 ${opacity}`;
      case 'payment_due': return `bg-yellow-50 border-yellow-200 ${opacity}`;
      default: return `bg-gray-50 border-gray-200 ${opacity}`;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Low Stock';
      case 'expiry_alert': return 'Expiry Alert';
      case 'order_update': return 'Order Update';
      case 'payment_due': return 'Payment Due';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications Center</h1>
          <p className="text-muted-foreground">
            Stay updated with system alerts, inventory notifications, and important updates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Badge variant="secondary" className="px-3 py-1">
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      {/* Notification Settings Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Inventory Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="low-stock">Low Stock Alerts</Label>
                  <Switch id="low-stock" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiry">Expiry Notifications</Label>
                  <Switch id="expiry" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="stock-movements">Stock Movements</Label>
                  <Switch id="stock-movements" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Order & Payment Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-updates">Order Status Updates</Label>
                  <Switch id="order-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-due">Payment Due Reminders</Label>
                  <Switch id="payment-due" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-alerts">System Alerts</Label>
                  <Switch id="system-alerts" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                View and manage your system notifications
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
              <TabsTrigger value="expiry_alert">Expiry</TabsTrigger>
              <TabsTrigger value="order_update">Orders</TabsTrigger>
              <TabsTrigger value="payment_due">Payments</TabsTrigger>
              <TabsTrigger value="info">System</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              {notificationsLoading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {selectedTab === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "No notifications match your current filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification: Notification) => (
                    <Card 
                      key={notification.id} 
                      className={`${getNotificationColor(notification.type, notification.isRead)} ${
                        !notification.isRead ? 'ring-2 ring-blue-200' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.type)}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatDateTime(notification.createdAt)}
                                </span>
                                {!notification.isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                    disabled={markAsReadMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm ${!notification.isRead ? 'text-gray-900' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                            {notification.actionUrl && (
                              <div className="mt-3">
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}