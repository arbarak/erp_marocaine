// Advanced Business Intelligence Dashboard

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Target, Zap, Brain, 
  Filter, Download, Share2, Settings, Play, Pause, RefreshCw,
  Calendar, Clock, Users, DollarSign, Package, ShoppingCart,
  AlertTriangle, CheckCircle, Info, Eye, Edit, Trash2
} from 'lucide-react';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: string;
  description: string;
  formula: string;
  thresholds: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: Widget[];
  filters: DashboardFilter[];
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface Widget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'metric' | 'gauge';
  title: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  dataSource: string;
  query: string;
  filters: string[];
  position: { x: number; y: number; width: number; height: number };
  config: any;
}

interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number';
  options?: string[];
  defaultValue?: any;
  required: boolean;
}

interface PredictiveInsight {
  id: string;
  type: 'forecast' | 'anomaly' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  data: any[];
  actionable: boolean;
  recommendations: string[];
  createdAt: string;
}

const AdvancedBusinessIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDashboard, setSelectedDashboard] = useState<string>('executive');
  const [timeRange, setTimeRange] = useState('30d');
  const [isRealTime, setIsRealTime] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockKPIs: KPIMetric[] = [
    {
      id: '1',
      name: 'Chiffre d\'Affaires',
      value: 2450000,
      target: 2500000,
      unit: 'MAD',
      trend: 'up',
      change: 12.5,
      category: 'Financier',
      description: 'Chiffre d\'affaires total sur la période',
      formula: 'SUM(invoices.total_amount)',
      thresholds: { excellent: 2500000, good: 2000000, warning: 1500000, critical: 1000000 }
    },
    {
      id: '2',
      name: 'Marge Brute',
      value: 35.8,
      target: 40.0,
      unit: '%',
      trend: 'down',
      change: -2.1,
      category: 'Financier',
      description: 'Marge brute moyenne',
      formula: '(Revenue - COGS) / Revenue * 100',
      thresholds: { excellent: 40, good: 35, warning: 30, critical: 25 }
    },
    {
      id: '3',
      name: 'Commandes Actives',
      value: 156,
      target: 150,
      unit: 'commandes',
      trend: 'up',
      change: 8.3,
      category: 'Opérationnel',
      description: 'Nombre de commandes en cours',
      formula: 'COUNT(orders WHERE status = "active")',
      thresholds: { excellent: 200, good: 150, warning: 100, critical: 50 }
    },
    {
      id: '4',
      name: 'Satisfaction Client',
      value: 4.2,
      target: 4.5,
      unit: '/5',
      trend: 'stable',
      change: 0.1,
      category: 'Client',
      description: 'Note moyenne de satisfaction',
      formula: 'AVG(customer_feedback.rating)',
      thresholds: { excellent: 4.5, good: 4.0, warning: 3.5, critical: 3.0 }
    }
  ];

  const mockInsights: PredictiveInsight[] = [
    {
      id: '1',
      type: 'forecast',
      title: 'Prévision des Ventes Q1 2025',
      description: 'Les ventes devraient augmenter de 15% au premier trimestre',
      confidence: 87,
      impact: 'high',
      category: 'Ventes',
      data: [],
      actionable: true,
      recommendations: [
        'Augmenter le stock des produits populaires',
        'Préparer une campagne marketing ciblée',
        'Former l\'équipe commerciale'
      ],
      createdAt: '2024-12-20T10:00:00Z'
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Anomalie Détectée - Retours Produits',
      description: 'Augmentation inhabituelle des retours pour la catégorie Électronique',
      confidence: 92,
      impact: 'medium',
      category: 'Qualité',
      data: [],
      actionable: true,
      recommendations: [
        'Vérifier la qualité des derniers lots',
        'Contacter les fournisseurs',
        'Analyser les commentaires clients'
      ],
      createdAt: '2024-12-20T09:30:00Z'
    }
  ];

  const salesData = [
    { month: 'Jan', ventes: 180000, objectif: 200000, margebrute: 32 },
    { month: 'Fév', ventes: 220000, objectif: 210000, margebrute: 35 },
    { month: 'Mar', ventes: 195000, objectif: 205000, margebrute: 33 },
    { month: 'Avr', ventes: 240000, objectif: 220000, margebrute: 38 },
    { month: 'Mai', ventes: 280000, objectif: 250000, margebrute: 40 },
    { month: 'Jun', ventes: 265000, objectif: 260000, margebrute: 37 }
  ];

  const categoryData = [
    { name: 'Électronique', value: 35, color: '#8884d8' },
    { name: 'Vêtements', value: 25, color: '#82ca9d' },
    { name: 'Maison', value: 20, color: '#ffc658' },
    { name: 'Sport', value: 15, color: '#ff7300' },
    { name: 'Autres', value: 5, color: '#00ff00' }
  ];

  useEffect(() => {
    setKpiMetrics(mockKPIs);
    setInsights(mockInsights);
    setIsLoading(false);
  }, []);

  const getKPIStatus = (kpi: KPIMetric) => {
    const percentage = (kpi.value / kpi.target) * 100;
    if (percentage >= 100) return 'excellent';
    if (percentage >= 90) return 'good';
    if (percentage >= 75) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'MAD') {
      return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
      }).format(value);
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const renderKPICard = (kpi: KPIMetric) => {
    const status = getKPIStatus(kpi);
    const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Activity;

    return (
      <Card key={kpi.id} className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{kpi.name}</CardTitle>
            <Badge className={getStatusColor(status)}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatValue(kpi.value, kpi.unit)}</span>
              <div className={`flex items-center space-x-1 ${
                kpi.trend === 'up' ? 'text-green-600' : 
                kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{Math.abs(kpi.change)}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Objectif: {formatValue(kpi.target, kpi.unit)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  status === 'excellent' ? 'bg-green-500' :
                  status === 'good' ? 'bg-blue-500' :
                  status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInsightCard = (insight: PredictiveInsight) => {
    const IconComponent = insight.type === 'forecast' ? TrendingUp :
                         insight.type === 'anomaly' ? AlertTriangle :
                         insight.type === 'trend' ? Activity : Brain;

    return (
      <Card key={insight.id} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{insight.confidence}% confiance</Badge>
              <Badge className={
                insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {insight.impact}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
          {insight.actionable && insight.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-800">Recommandations:</h4>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
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
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Avancée</h1>
          <p className="text-gray-600">Tableaux de bord intelligents et analyses prédictives</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="realtime">Temps réel</Label>
            <Switch
              id="realtime"
              checked={isRealTime}
              onCheckedChange={setIsRealTime}
            />
          </div>
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="builder">Constructeur</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiMetrics.map(renderKPICard)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Ventes</CardTitle>
                <CardDescription>Ventes vs Objectifs sur 6 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ventes" fill="#8884d8" name="Ventes" />
                    <Bar dataKey="objectif" fill="#82ca9d" name="Objectif" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>Ventes par catégorie de produits</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map(renderInsightCard)}
          </div>
        </TabsContent>

        {/* Other tabs content would be implemented here */}
      </Tabs>
    </div>
  );
};

export default AdvancedBusinessIntelligence;
