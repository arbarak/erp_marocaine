import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Calendar, AlertTriangle, CheckCircle, 
  Target, Award, FileText, Clock
} from 'lucide-react';

interface PurchaseOverview {
  period: {
    start_date: string;
    end_date: string;
  };
  overview: {
    total_orders: number;
    total_value: number;
    average_order_value: number;
    on_time_delivery_rate: number;
  };
  status_distribution: Array<{
    state: string;
    count: number;
    value: number;
  }>;
  monthly_trends: Array<{
    month: string;
    orders_count: number;
    total_value: number;
    avg_value: number;
  }>;
  top_suppliers: Array<{
    supplier_name: string;
    supplier_code: string;
    total_orders: number;
    total_value: number;
    avg_order_value: number;
  }>;
}

interface SupplierPerformance {
  period: {
    start_date: string;
    end_date: string;
  };
  supplier_performance: Array<{
    supplier_id: string;
    supplier_name: string;
    supplier_code: string;
    total_orders: number;
    total_value: number;
    avg_order_value: number;
    avg_lead_time_days: number;
    on_time_deliveries: number;
    late_deliveries: number;
    cancelled_orders: number;
    on_time_rate: number;
    cancellation_rate: number;
  }>;
}

interface CategoryAnalysis {
  period: {
    start_date: string;
    end_date: string;
  };
  category_analysis: Array<{
    category_name: string;
    total_quantity: number;
    total_value: number;
    avg_unit_price: number;
    order_count: number;
    supplier_count: number;
  }>;
}

interface CostSavings {
  period: {
    start_date: string;
    end_date: string;
  };
  cost_savings: {
    total_rfqs_analyzed: number;
    total_potential_savings: number;
    avg_savings_per_rfq: number;
    rfq_details: Array<{
      rfq_id: string;
      rfq_reference: string;
      quotation_count: number;
      min_price: number;
      max_price: number;
      potential_savings: number;
      savings_percentage: number;
    }>;
  };
}

interface PurchaseForecast {
  historical_data: Array<{
    month: string;
    orders_count: number;
    total_value: number;
  }>;
  forecast: Array<{
    month: string;
    forecasted_value: number;
    confidence_level: number;
  }>;
  insights: {
    avg_monthly_value: number;
    growth_rate: number;
    trend: string;
  };
}

interface ComplianceReport {
  period: {
    start_date: string;
    end_date: string;
  };
  compliance_metrics: {
    total_orders: number;
    approval_compliance: {
      approved_orders: number;
      approval_rate: number;
    };
    documentation_compliance: {
      documented_orders: number;
      documentation_rate: number;
    };
    delivery_tracking: {
      delivered_orders: number;
      delivery_confirmation_rate: number;
    };
    large_order_approval: {
      large_orders_count: number;
      large_orders_approved: number;
      large_order_approval_rate: number;
    };
    supplier_compliance: {
      total_active_suppliers: number;
      compliant_suppliers: number;
      supplier_compliance_rate: number;
    };
  };
  recommendations: string[];
}

const PurchaseAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [overviewData, setOverviewData] = useState<PurchaseOverview | null>(null);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis | null>(null);
  const [costSavings, setCostSavings] = useState<CostSavings | null>(null);
  const [forecast, setForecast] = useState<PurchaseForecast | null>(null);
  const [compliance, setCompliance] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      setOverviewData({
        period: dateRange,
        overview: {
          total_orders: 1247,
          total_value: 2847650.00,
          average_order_value: 2284.50,
          on_time_delivery_rate: 87.5
        },
        status_distribution: [
          { state: 'DELIVERED', count: 892, value: 2045320.00 },
          { state: 'PENDING', count: 156, value: 356780.00 },
          { state: 'CANCELLED', count: 89, value: 203450.00 },
          { state: 'DRAFT', count: 110, value: 242100.00 }
        ],
        monthly_trends: [
          { month: '2024-01', orders_count: 98, total_value: 224560.00, avg_value: 2291.43 },
          { month: '2024-02', orders_count: 105, total_value: 241230.00, avg_value: 2297.43 },
          { month: '2024-03', orders_count: 112, total_value: 258940.00, avg_value: 2312.32 },
          { month: '2024-04', orders_count: 108, total_value: 247680.00, avg_value: 2293.33 },
          { month: '2024-05', orders_count: 115, total_value: 265430.00, avg_value: 2308.09 },
          { month: '2024-06', orders_count: 122, total_value: 281560.00, avg_value: 2307.87 }
        ],
        top_suppliers: [
          { supplier_name: 'TechnoMaroc SARL', supplier_code: 'TM001', total_orders: 89, total_value: 456780.00, avg_order_value: 5131.24 },
          { supplier_name: 'Atlas Distribution', supplier_code: 'AD002', total_orders: 76, total_value: 398450.00, avg_order_value: 5242.76 },
          { supplier_name: 'Casablanca Supplies', supplier_code: 'CS003', total_orders: 92, total_value: 387650.00, avg_order_value: 4213.59 }
        ]
      });

      setSupplierPerformance({
        period: dateRange,
        supplier_performance: [
          {
            supplier_id: '1',
            supplier_name: 'TechnoMaroc SARL',
            supplier_code: 'TM001',
            total_orders: 89,
            total_value: 456780.00,
            avg_order_value: 5131.24,
            avg_lead_time_days: 12.5,
            on_time_deliveries: 78,
            late_deliveries: 8,
            cancelled_orders: 3,
            on_time_rate: 87.6,
            cancellation_rate: 3.4
          },
          {
            supplier_id: '2',
            supplier_name: 'Atlas Distribution',
            supplier_code: 'AD002',
            total_orders: 76,
            total_value: 398450.00,
            avg_order_value: 5242.76,
            avg_lead_time_days: 15.2,
            on_time_deliveries: 65,
            late_deliveries: 9,
            cancelled_orders: 2,
            on_time_rate: 85.5,
            cancellation_rate: 2.6
          }
        ]
      });

      setCategoryAnalysis({
        period: dateRange,
        category_analysis: [
          {
            category_name: 'Electronics',
            total_quantity: 1250,
            total_value: 875600.00,
            avg_unit_price: 700.48,
            order_count: 156,
            supplier_count: 12
          },
          {
            category_name: 'Office Supplies',
            total_quantity: 3450,
            total_value: 234580.00,
            avg_unit_price: 67.98,
            order_count: 89,
            supplier_count: 8
          }
        ]
      });

      setCostSavings({
        period: dateRange,
        cost_savings: {
          total_rfqs_analyzed: 45,
          total_potential_savings: 125670.00,
          avg_savings_per_rfq: 2792.67,
          rfq_details: [
            {
              rfq_id: '1',
              rfq_reference: 'RFQ-2024-001',
              quotation_count: 4,
              min_price: 15600.00,
              max_price: 18900.00,
              potential_savings: 3300.00,
              savings_percentage: 17.46
            }
          ]
        }
      });

      setCompliance({
        period: dateRange,
        compliance_metrics: {
          total_orders: 1247,
          approval_compliance: {
            approved_orders: 1189,
            approval_rate: 95.35
          },
          documentation_compliance: {
            documented_orders: 1098,
            documentation_rate: 88.05
          },
          delivery_tracking: {
            delivered_orders: 892,
            delivery_confirmation_rate: 71.53
          },
          large_order_approval: {
            large_orders_count: 234,
            large_orders_approved: 228,
            large_order_approval_rate: 97.44
          },
          supplier_compliance: {
            total_active_suppliers: 45,
            compliant_suppliers: 42,
            supplier_compliance_rate: 93.33
          }
        },
        recommendations: [
          'Improve documentation practices - add detailed notes and justifications for purchases',
          'Enhance delivery tracking - ensure all deliveries are properly confirmed'
        ]
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'DRAFT': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Analytics & Reporting</h1>
          <p className="text-gray-600">Comprehensive insights into purchasing performance and trends</p>
        </div>
        
        <div className="flex gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <Button onClick={loadAnalyticsData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="savings">Cost Savings</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overviewData && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData.overview.total_orders.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData.period.start_date} to {overviewData.period.end_date}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(overviewData.overview.total_value)}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg: {formatCurrency(overviewData.overview.average_order_value)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData.overview.on_time_delivery_rate}%</div>
                    <Progress value={overviewData.overview.on_time_delivery_rate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData.top_suppliers.length}</div>
                    <p className="text-xs text-muted-foreground">Top performing suppliers</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Purchase Trends</CardTitle>
                    <CardDescription>Order volume and value over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={overviewData.monthly_trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [
                          name === 'total_value' ? formatCurrency(Number(value)) : value,
                          name === 'total_value' ? 'Total Value' : 'Orders Count'
                        ]} />
                        <Legend />
                        <Area type="monotone" dataKey="total_value" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="orders_count" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                    <CardDescription>Current status of all orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={overviewData.status_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ state, count }) => `${state}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {overviewData.status_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Suppliers Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Suppliers by Value</CardTitle>
                  <CardDescription>Best performing suppliers in the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Supplier</th>
                          <th className="text-left p-2">Code</th>
                          <th className="text-right p-2">Orders</th>
                          <th className="text-right p-2">Total Value</th>
                          <th className="text-right p-2">Avg Order Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overviewData.top_suppliers.map((supplier, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{supplier.supplier_name}</td>
                            <td className="p-2">
                              <Badge variant="outline">{supplier.supplier_code}</Badge>
                            </td>
                            <td className="p-2 text-right">{supplier.total_orders}</td>
                            <td className="p-2 text-right">{formatCurrency(supplier.total_value)}</td>
                            <td className="p-2 text-right">{formatCurrency(supplier.avg_order_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          {supplierPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance Analysis</CardTitle>
                <CardDescription>Detailed performance metrics for all suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Supplier</th>
                        <th className="text-right p-2">Orders</th>
                        <th className="text-right p-2">Total Value</th>
                        <th className="text-right p-2">Avg Lead Time</th>
                        <th className="text-right p-2">On-Time Rate</th>
                        <th className="text-right p-2">Cancellation Rate</th>
                        <th className="text-center p-2">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierPerformance.supplier_performance.map((supplier, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{supplier.supplier_name}</div>
                              <div className="text-sm text-gray-500">{supplier.supplier_code}</div>
                            </div>
                          </td>
                          <td className="p-2 text-right">{supplier.total_orders}</td>
                          <td className="p-2 text-right">{formatCurrency(supplier.total_value)}</td>
                          <td className="p-2 text-right">{supplier.avg_lead_time_days.toFixed(1)} days</td>
                          <td className={`p-2 text-right font-medium ${getPerformanceColor(supplier.on_time_rate)}`}>
                            {supplier.on_time_rate.toFixed(1)}%
                          </td>
                          <td className={`p-2 text-right font-medium ${getPerformanceColor(100 - supplier.cancellation_rate)}`}>
                            {supplier.cancellation_rate.toFixed(1)}%
                          </td>
                          <td className="p-2 text-center">
                            {supplier.on_time_rate >= 90 && supplier.cancellation_rate <= 5 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : supplier.on_time_rate >= 75 && supplier.cancellation_rate <= 10 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {categoryAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Purchase analysis by product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={categoryAnalysis.category_analysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category_name" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'total_value' ? formatCurrency(Number(value)) : value,
                        name === 'total_value' ? 'Total Value' : name
                      ]} />
                      <Legend />
                      <Bar dataKey="total_value" fill="#8884d8" />
                      <Bar dataKey="order_count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>Detailed breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Category</th>
                          <th className="text-right p-2">Total Quantity</th>
                          <th className="text-right p-2">Total Value</th>
                          <th className="text-right p-2">Avg Unit Price</th>
                          <th className="text-right p-2">Orders</th>
                          <th className="text-right p-2">Suppliers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryAnalysis.category_analysis.map((category, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{category.category_name}</td>
                            <td className="p-2 text-right">{category.total_quantity.toLocaleString()}</td>
                            <td className="p-2 text-right">{formatCurrency(category.total_value)}</td>
                            <td className="p-2 text-right">{formatCurrency(category.avg_unit_price)}</td>
                            <td className="p-2 text-right">{category.order_count}</td>
                            <td className="p-2 text-right">{category.supplier_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {compliance && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{compliance.compliance_metrics.approval_compliance.approval_rate.toFixed(1)}%</div>
                    <Progress value={compliance.compliance_metrics.approval_compliance.approval_rate} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {compliance.compliance_metrics.approval_compliance.approved_orders} of {compliance.compliance_metrics.total_orders} orders approved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{compliance.compliance_metrics.documentation_compliance.documentation_rate.toFixed(1)}%</div>
                    <Progress value={compliance.compliance_metrics.documentation_compliance.documentation_rate} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {compliance.compliance_metrics.documentation_compliance.documented_orders} orders properly documented
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supplier Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{compliance.compliance_metrics.supplier_compliance.supplier_compliance_rate.toFixed(1)}%</div>
                    <Progress value={compliance.compliance_metrics.supplier_compliance.supplier_compliance_rate} className="mb-2" />
                    <p className="text-sm text-gray-600">
                      {compliance.compliance_metrics.supplier_compliance.compliant_suppliers} of {compliance.compliance_metrics.supplier_compliance.total_active_suppliers} suppliers compliant
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Recommendations</CardTitle>
                  <CardDescription>Actions to improve compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compliance.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseAnalytics;
