import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Package, TrendingUp, TrendingDown, DollarSign, 
  Calculator, RefreshCw, Download, Filter,
  Warehouse, MapPin, Calendar, AlertTriangle
} from 'lucide-react';

interface ValuationSummary {
  total_value: number;
  total_items: number;
  method: string;
  valuations: ValuationItem[];
}

interface ValuationItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  location_name: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  method: string;
}

interface ValuationComparison {
  product_name: string;
  warehouse_name: string;
  location_name: string;
  quantity: number;
  methods: {
    [key: string]: {
      method_name: string;
      unit_cost: number;
      total_value: number;
    };
  };
}

interface ValuationAnalytics {
  summary: {
    total_value: number;
    total_records: number;
    unique_products: number;
    unique_warehouses: number;
  };
  method_distribution: Array<{
    valuation_method: string;
    count: number;
    total_value: number;
  }>;
  top_products: Array<{
    product__name: string;
    product__internal_reference: string;
    total_value: number;
    avg_unit_cost: number;
  }>;
  warehouse_distribution: Array<{
    warehouse__name: string;
    total_value: number;
    product_count: number;
  }>;
}

const StockValuationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('WEIGHTED_AVG');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Mock data - replace with actual API calls
  const [valuationSummary, setValuationSummary] = useState<ValuationSummary>({
    total_value: 2847650.00,
    total_items: 1247,
    method: 'WEIGHTED_AVG',
    valuations: [
      {
        product_id: '1',
        product_name: 'Laptop Dell Inspiron 15',
        product_sku: 'LAP-DELL-001',
        warehouse_name: 'Main Warehouse',
        location_name: 'A-01-01',
        quantity: 25,
        unit_cost: 4500.00,
        total_value: 112500.00,
        method: 'WEIGHTED_AVG'
      },
      {
        product_id: '2',
        product_name: 'Office Chair Ergonomic',
        product_sku: 'CHR-ERG-001',
        warehouse_name: 'Main Warehouse',
        location_name: 'B-02-03',
        quantity: 150,
        unit_cost: 850.00,
        total_value: 127500.00,
        method: 'WEIGHTED_AVG'
      },
      {
        product_id: '3',
        product_name: 'Printer HP LaserJet',
        product_sku: 'PRT-HP-001',
        warehouse_name: 'Secondary Warehouse',
        location_name: 'C-01-05',
        quantity: 45,
        unit_cost: 1200.00,
        total_value: 54000.00,
        method: 'WEIGHTED_AVG'
      }
    ]
  });

  const [analytics, setAnalytics] = useState<ValuationAnalytics>({
    summary: {
      total_value: 2847650.00,
      total_records: 1247,
      unique_products: 456,
      unique_warehouses: 3
    },
    method_distribution: [
      { valuation_method: 'WEIGHTED_AVG', count: 850, total_value: 1950000.00 },
      { valuation_method: 'FIFO', count: 250, total_value: 650000.00 },
      { valuation_method: 'STANDARD', count: 147, total_value: 247650.00 }
    ],
    top_products: [
      {
        product__name: 'Laptop Dell Inspiron 15',
        product__internal_reference: 'LAP-DELL-001',
        total_value: 450000.00,
        avg_unit_cost: 4500.00
      },
      {
        product__name: 'Server HP ProLiant',
        product__internal_reference: 'SRV-HP-001',
        total_value: 380000.00,
        avg_unit_cost: 19000.00
      },
      {
        product__name: 'Office Chair Ergonomic',
        product__internal_reference: 'CHR-ERG-001',
        total_value: 255000.00,
        avg_unit_cost: 850.00
      }
    ],
    warehouse_distribution: [
      {
        warehouse__name: 'Main Warehouse',
        total_value: 1650000.00,
        product_count: 285
      },
      {
        warehouse__name: 'Secondary Warehouse',
        total_value: 890000.00,
        product_count: 156
      },
      {
        warehouse__name: 'Distribution Center',
        total_value: 307650.00,
        product_count: 89
      }
    ]
  });

  const valuationMethods = [
    { value: 'WEIGHTED_AVG', label: 'Weighted Average' },
    { value: 'FIFO', label: 'First In, First Out (FIFO)' },
    { value: 'LIFO', label: 'Last In, First Out (LIFO)' },
    { value: 'STANDARD', label: 'Standard Cost' },
    { value: 'MOVING_AVG', label: 'Moving Average' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'WEIGHTED_AVG': 'bg-blue-100 text-blue-800',
      'FIFO': 'bg-green-100 text-green-800',
      'LIFO': 'bg-purple-100 text-purple-800',
      'STANDARD': 'bg-orange-100 text-orange-800',
      'MOVING_AVG': 'bg-pink-100 text-pink-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleRevaluation = async () => {
    setLoading(true);
    try {
      // API call to revalue inventory
      console.log('Revaluing inventory with method:', selectedMethod);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Refresh data after revaluation
    } catch (error) {
      console.error('Revaluation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Valuation</h1>
          <p className="text-gray-600">Comprehensive inventory valuation and cost analysis</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {valuationMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRevaluation} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Revaluing...' : 'Revalue'}
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Method Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(valuationSummary.total_value)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">8.2% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{valuationSummary.total_items.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Across {analytics.summary.unique_warehouses} warehouses</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.unique_products}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Active SKUs in inventory</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valuation Method</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  <Badge className={getMethodColor(selectedMethod)}>
                    {valuationMethods.find(m => m.value === selectedMethod)?.label}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <span>Current calculation method</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Value Distribution</CardTitle>
                <CardDescription>Inventory value by warehouse location</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.warehouse_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ warehouse__name, total_value }) =>
                        `${warehouse__name}: ${formatCurrency(total_value)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_value"
                    >
                      {analytics.warehouse_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products by Value</CardTitle>
                <CardDescription>Highest valued products in inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.top_products} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product__internal_reference" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total_value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Valuation Table */}
          <Card>
            <CardHeader>
              <CardTitle>Current Stock Valuations</CardTitle>
              <CardDescription>Detailed breakdown of inventory valuations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Product</th>
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-right p-2">Quantity</th>
                      <th className="text-right p-2">Unit Cost</th>
                      <th className="text-right p-2">Total Value</th>
                      <th className="text-center p-2">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuationSummary.valuations.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.product_name}</td>
                        <td className="p-2 text-gray-600">{item.product_sku}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Warehouse className="h-3 w-3" />
                            {item.warehouse_name}
                            <MapPin className="h-3 w-3 ml-1" />
                            {item.location_name}
                          </div>
                        </td>
                        <td className="p-2 text-right">{item.quantity.toLocaleString()}</td>
                        <td className="p-2 text-right">{formatCurrency(item.unit_cost)}</td>
                        <td className="p-2 text-right font-medium">{formatCurrency(item.total_value)}</td>
                        <td className="p-2 text-center">
                          <Badge className={getMethodColor(item.method)} variant="secondary">
                            {item.method}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valuation Method Comparison</CardTitle>
              <CardDescription>Compare different valuation methods for the same inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-select">Select Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Laptop Dell Inspiron 15</SelectItem>
                        <SelectItem value="2">Office Chair Ergonomic</SelectItem>
                        <SelectItem value="3">Printer HP LaserJet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="warehouse-select">Select Warehouse</Label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Main Warehouse</SelectItem>
                        <SelectItem value="2">Secondary Warehouse</SelectItem>
                        <SelectItem value="3">Distribution Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedProduct && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Valuation Comparison Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {valuationMethods.map((method) => (
                        <Card key={method.value} className="border-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{method.label}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Unit Cost:</span>
                                <span className="font-medium">{formatCurrency(4500 + Math.random() * 500)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Value:</span>
                                <span className="font-bold">{formatCurrency(112500 + Math.random() * 25000)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Variance:</span>
                                <span className={`font-medium ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                                  {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 10).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Method Usage Distribution</CardTitle>
                <CardDescription>Distribution of valuation methods across inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.method_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="valuation_method" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total_value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valuation Accuracy Metrics</CardTitle>
                <CardDescription>Key performance indicators for valuation accuracy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span className="text-sm text-gray-600">94.2%</span>
                  </div>
                  <Progress value={94.2} className="mb-1" />
                  <p className="text-xs text-gray-500">Percentage of items with complete cost data</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Valuation Consistency</span>
                    <span className="text-sm text-gray-600">87.8%</span>
                  </div>
                  <Progress value={87.8} className="mb-1" />
                  <p className="text-xs text-gray-500">Consistency across different methods</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Update Frequency</span>
                    <span className="text-sm text-gray-600">91.5%</span>
                  </div>
                  <Progress value={91.5} className="mb-1" />
                  <p className="text-xs text-gray-500">Timely updates to valuation records</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Consider standardizing valuation method for better consistency
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Schedule monthly revaluation for high-turnover items
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valuation History</CardTitle>
              <CardDescription>Historical valuation trends and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input type="date" id="start-date" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input type="date" id="end-date" />
                  </div>
                  <div className="flex items-end">
                    <Button>Filter</Button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={[
                    { date: '2024-01', value: 2650000 },
                    { date: '2024-02', value: 2720000 },
                    { date: '2024-03', value: 2680000 },
                    { date: '2024-04', value: 2750000 },
                    { date: '2024-05', value: 2820000 },
                    { date: '2024-06', value: 2847650 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockValuationDashboard;
