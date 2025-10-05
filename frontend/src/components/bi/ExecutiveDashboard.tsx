// Executive Dashboard Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, ShoppingCart,
  Target, AlertTriangle, CheckCircle, Clock, Calendar, BarChart3,
  PieChart as PieChartIcon, Activity, Zap, Eye, Download, Share2,
  RefreshCw, Filter, Settings, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface ExecutiveMetric {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
}

interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'achievement' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  actionRequired: boolean;
  dueDate?: string;
  responsible?: string;
}

const ExecutiveDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [metrics, setMetrics] = useState<ExecutiveMetric[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock executive metrics
  const mockMetrics: ExecutiveMetric[] = [
    {
      id: 'revenue',
      title: 'Chiffre d\'Affaires',
      value: 2450000,
      previousValue: 2180000,
      target: 2500000,
      unit: 'MAD',
      format: 'currency',
      trend: 'up',
      changePercent: 12.4,
      status: 'good',
      icon: DollarSign,
      color: '#10b981'
    },
    {
      id: 'profit_margin',
      title: 'Marge Bénéficiaire',
      value: 18.5,
      previousValue: 16.2,
      target: 20.0,
      unit: '%',
      format: 'percentage',
      trend: 'up',
      changePercent: 14.2,
      status: 'good',
      icon: TrendingUp,
      color: '#3b82f6'
    },
    {
      id: 'customer_acquisition',
      title: 'Nouveaux Clients',
      value: 127,
      previousValue: 98,
      target: 150,
      unit: 'clients',
      format: 'number',
      trend: 'up',
      changePercent: 29.6,
      status: 'excellent',
      icon: Users,
      color: '#8b5cf6'
    },
    {
      id: 'inventory_turnover',
      title: 'Rotation Stock',
      value: 6.8,
      previousValue: 7.2,
      target: 8.0,
      unit: 'fois/an',
      format: 'number',
      trend: 'down',
      changePercent: -5.6,
      status: 'warning',
      icon: Package,
      color: '#f59e0b'
    },
    {
      id: 'order_fulfillment',
      title: 'Taux Livraison',
      value: 94.2,
      previousValue: 91.8,
      target: 95.0,
      unit: '%',
      format: 'percentage',
      trend: 'up',
      changePercent: 2.6,
      status: 'good',
      icon: ShoppingCart,
      color: '#06b6d4'
    },
    {
      id: 'customer_satisfaction',
      title: 'Satisfaction Client',
      value: 4.3,
      previousValue: 4.1,
      target: 4.5,
      unit: '/5',
      format: 'number',
      trend: 'up',
      changePercent: 4.9,
      status: 'good',
      icon: Target,
      color: '#ec4899'
    }
  ];

  // Mock business insights
  const mockInsights: BusinessInsight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Expansion Marché Casablanca',
      description: 'Opportunité d\'expansion sur le marché de Casablanca avec un potentiel de +25% de CA',
      impact: 'high',
      priority: 1,
      actionRequired: true,
      dueDate: '2025-01-15',
      responsible: 'Direction Commerciale'
    },
    {
      id: '2',
      type: 'risk',
      title: 'Rupture Stock Produits Phares',
      description: 'Risque de rupture de stock sur 3 produits représentant 40% du CA',
      impact: 'high',
      priority: 2,
      actionRequired: true,
      dueDate: '2024-12-25',
      responsible: 'Direction Logistique'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Objectif Trimestriel Atteint',
      description: 'Dépassement de l\'objectif trimestriel de 8% avec 2 semaines d\'avance',
      impact: 'medium',
      priority: 3,
      actionRequired: false
    },
    {
      id: '4',
      type: 'alert',
      title: 'Délai Paiement Clients',
      description: 'Augmentation du délai moyen de paiement clients de 15 jours',
      impact: 'medium',
      priority: 4,
      actionRequired: true,
      dueDate: '2024-12-30',
      responsible: 'Direction Financière'
    }
  ];

  // Mock chart data
  const revenueData = [
    { month: 'Jan', revenue: 180000, target: 200000, profit: 32400 },
    { month: 'Fév', revenue: 220000, target: 210000, profit: 39600 },
    { month: 'Mar', revenue: 195000, target: 205000, profit: 35100 },
    { month: 'Avr', revenue: 240000, target: 220000, profit: 43200 },
    { month: 'Mai', revenue: 280000, target: 250000, profit: 50400 },
    { month: 'Jun', revenue: 265000, target: 260000, profit: 47700 },
    { month: 'Jul', revenue: 290000, target: 270000, profit: 52200 },
    { month: 'Aoû', revenue: 275000, target: 275000, profit: 49500 },
    { month: 'Sep', revenue: 310000, target: 280000, profit: 55800 },
    { month: 'Oct', revenue: 295000, target: 285000, profit: 53100 },
    { month: 'Nov', revenue: 320000, target: 290000, profit: 57600 },
    { month: 'Déc', revenue: 340000, target: 300000, profit: 61200 }
  ];

  const customerSegmentData = [
    { name: 'Entreprises', value: 45, color: '#8884d8' },
    { name: 'PME', value: 30, color: '#82ca9d' },
    { name: 'Particuliers', value: 20, color: '#ffc658' },
    { name: 'Administrations', value: 5, color: '#ff7300' }
  ];

  const performanceData = [
    { metric: 'Ventes', actual: 85, target: 100 },
    { metric: 'Marge', actual: 92, target: 100 },
    { metric: 'Clients', actual: 78, target: 100 },
    { metric: 'Stock', actual: 88, target: 100 },
    { metric: 'Qualité', actual: 95, target: 100 }
  ];

  useEffect(() => {
    setMetrics(mockMetrics);
    setInsights(mockInsights);
    setIsLoading(false);
  }, []);

  const formatValue = (value: number, format: string, unit: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'achievement': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'alert': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderMetricCard = (metric: ExecutiveMetric) => {
    const IconComponent = metric.icon;
    const TrendIcon = metric.trend === 'up' ? ArrowUpRight : 
                     metric.trend === 'down' ? ArrowDownRight : Activity;

    return (
      <Card key={metric.id} className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                <IconComponent className="h-5 w-5" style={{ color: metric.color }} />
              </div>
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
            </div>
            <Badge className={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatValue(metric.value, metric.format, metric.unit)}
              </span>
              <div className={`flex items-center space-x-1 ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{Math.abs(metric.changePercent)}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Objectif: {formatValue(metric.target, metric.format, metric.unit)}</span>
                <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                    backgroundColor: metric.color
                  }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              vs période précédente: {formatValue(metric.previousValue, metric.format, metric.unit)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInsightCard = (insight: BusinessInsight) => {
    return (
      <Card key={insight.id} className={`border-l-4 ${
        insight.type === 'opportunity' ? 'border-l-green-500' :
        insight.type === 'risk' ? 'border-l-red-500' :
        insight.type === 'achievement' ? 'border-l-blue-500' :
        'border-l-yellow-500'
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getInsightIcon(insight.type)}
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={
                insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {insight.impact}
              </Badge>
              {insight.actionRequired && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Action requise
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
          {(insight.dueDate || insight.responsible) && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              {insight.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Échéance: {new Date(insight.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {insight.responsible && (
                <span>Responsable: {insight.responsible}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Exécutif</h1>
          <p className="text-gray-600">Vue d'ensemble des performances et indicateurs clés</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(renderMetricCard)}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
            <CardDescription>Revenus et profits sur 12 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenus" />
                <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Objectif" />
                <Area dataKey="profit" fill="#ffc658" fillOpacity={0.3} name="Profit" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Segments Clients</CardTitle>
            <CardDescription>Répartition du chiffre d'affaires par segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Globale</CardTitle>
          <CardDescription>Comparaison performance vs objectifs par domaine</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={performanceData}>
              <RadialBar dataKey="actual" cornerRadius={10} fill="#8884d8" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Business</CardTitle>
          <CardDescription>Opportunités, risques et alertes prioritaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map(renderInsightCard)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveDashboard;
