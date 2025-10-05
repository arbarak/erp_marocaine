import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, AlertTriangle, CheckCircle, Clock, Target,
  FileText, Download, Calendar, Package
} from 'lucide-react';
import PurchaseAnalytics from './PurchaseAnalytics';
import PurchaseReports from './PurchaseReports';

interface DashboardMetrics {
  total_orders: number;
  total_value: number;
  avg_order_value: number;
  pending_orders: number;
  overdue_orders: number;
  on_time_delivery_rate: number;
  active_suppliers: number;
  compliance_score: number;
  monthly_growth: number;
  cost_savings: number;
}

interface QuickStats {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'order_created' | 'order_approved' | 'order_delivered' | 'supplier_added';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

const PurchaseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - replace with actual API calls
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_orders: 1247,
    total_value: 2847650.00,
    avg_order_value: 2284.50,
    pending_orders: 23,
    overdue_orders: 5,
    on_time_delivery_rate: 87.5,
    active_suppliers: 45,
    compliance_score: 94.2,
    monthly_growth: 12.5,
    cost_savings: 125670.00
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'order_created',
      title: 'New Purchase Order Created',
      description: 'PO-2024-1234 for TechnoMaroc SARL - 15,600 MAD',
      timestamp: '2024-10-03T10:30:00Z',
      status: 'info'
    },
    {
      id: '2',
      type: 'order_approved',
      title: 'Purchase Order Approved',
      description: 'PO-2024-1233 approved by Manager - 8,900 MAD',
      timestamp: '2024-10-03T09:15:00Z',
      status: 'success'
    },
    {
      id: '3',
      type: 'order_delivered',
      title: 'Order Delivered',
      description: 'PO-2024-1230 delivered on time from Atlas Distribution',
      timestamp: '2024-10-03T08:45:00Z',
      status: 'success'
    },
    {
      id: '4',
      type: 'supplier_added',
      title: 'New Supplier Added',
      description: 'Casablanca Tech Solutions added to supplier list',
      timestamp: '2024-10-02T16:20:00Z',
      status: 'info'
    }
  ]);

  const quickStats: QuickStats[] = [
    {
      title: 'Total Orders',
      value: metrics.total_orders.toLocaleString(),
      change: 8.2,
      trend: 'up',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Total Value',
      value: new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(metrics.total_value),
      change: metrics.monthly_growth,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: metrics.pending_orders.toString(),
      change: -15.3,
      trend: 'down',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-yellow-600'
    },
    {
      title: 'On-Time Delivery',
      value: `${metrics.on_time_delivery_rate}%`,
      change: 3.1,
      trend: 'up',
      icon: <Target className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  ];

  const monthlyTrends = [
    { month: 'Jan', orders: 98, value: 224560, suppliers: 38 },
    { month: 'Feb', orders: 105, value: 241230, suppliers: 40 },
    { month: 'Mar', orders: 112, value: 258940, suppliers: 42 },
    { month: 'Apr', orders: 108, value: 247680, suppliers: 43 },
    { month: 'May', orders: 115, value: 265430, suppliers: 44 },
    { month: 'Jun', orders: 122, value: 281560, suppliers: 45 }
  ];

  const supplierPerformance = [
    { name: 'TechnoMaroc SARL', orders: 89, value: 456780, rating: 4.8 },
    { name: 'Atlas Distribution', orders: 76, value: 398450, rating: 4.6 },
    { name: 'Casablanca Supplies', orders: 92, value: 387650, rating: 4.5 },
    { name: 'Rabat Electronics', orders: 65, value: 298340, rating: 4.3 },
    { name: 'Marrakech Parts', orders: 58, value: 267890, rating: 4.2 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_created': return <Package className="h-4 w-4 text-blue-600" />;
      case 'order_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'order_delivered': return <Target className="h-4 w-4 text-purple-600" />;
      case 'supplier_added': return <Users className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'info': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of purchasing operations and performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTimeRange('7d')}>
            7 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange('30d')}>
            30 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange('90d')}>
            90 Days
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={stat.color}>{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : stat.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    ) : null}
                    <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                      {Math.abs(stat.change)}% from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Purchase Trends</CardTitle>
                <CardDescription>Order volume and value over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'value' ? formatCurrency(Number(value)) : value,
                      name === 'value' ? 'Total Value' : name === 'orders' ? 'Orders' : 'Suppliers'
                    ]} />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers Performance</CardTitle>
                <CardDescription>Best performing suppliers by order value</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={supplierPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical metrics for purchase operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className="text-sm text-gray-600">{metrics.compliance_score}%</span>
                    </div>
                    <Progress value={metrics.compliance_score} className="mb-1" />
                    <p className="text-xs text-gray-500">Excellent compliance performance</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">On-Time Delivery Rate</span>
                      <span className="text-sm text-gray-600">{metrics.on_time_delivery_rate}%</span>
                    </div>
                    <Progress value={metrics.on_time_delivery_rate} className="mb-1" />
                    <p className="text-xs text-gray-500">Above industry average</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cost Savings (YTD)</span>
                      <span className="text-sm text-gray-600">{formatCurrency(metrics.cost_savings)}</span>
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      15.2% improvement from last year
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Suppliers</span>
                      <span className="text-sm text-gray-600">{metrics.active_suppliers}</span>
                    </div>
                    <div className="flex items-center text-xs text-blue-600">
                      <Users className="h-3 w-3 mr-1" />
                      3 new suppliers this month
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Alerts & Notifications</h4>
                  <div className="space-y-2">
                    {metrics.overdue_orders > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">
                          {metrics.overdue_orders} orders are overdue and require attention
                        </span>
                      </div>
                    )}
                    {metrics.pending_orders > 20 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          {metrics.pending_orders} orders pending approval
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        All suppliers have updated compliance documentation
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest purchase operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={`p-3 rounded-lg border ${getStatusColor(activity.status)}`}>
                      <div className="flex items-start gap-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <PurchaseAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <PurchaseReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseDashboard;
