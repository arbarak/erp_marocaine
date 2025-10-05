// Real-time Business Intelligence Dashboard

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart,
  DollarSign, Users, ShoppingCart, Package, AlertTriangle,
  CheckCircle, Clock, Zap, Eye, Settings, RefreshCw,
  Download, Filter, Calendar, Globe, Target, Award
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  format: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'financial' | 'operational' | 'customer' | 'inventory';
  lastUpdated: string;
}

interface RealTimeAlert {
  id: string;
  type: 'threshold_exceeded' | 'anomaly_detected' | 'target_achieved' | 'system_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
  actionRequired: boolean;
}

interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: {
    metrics: { [key: string]: number };
    timeframe: string;
  };
  recommendations: string[];
  priority: number;
  generatedAt: string;
}

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'alert' | 'insight';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: {
    metrics?: string[];
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    timeRange?: string;
    refreshInterval?: number;
  };
  data: any;
  lastUpdated: string;
}

const RealTimeBusinessIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Mock KPI metrics
  const mockKPIMetrics: KPIMetric[] = [
    {
      id: 'revenue_today',
      name: 'Chiffre d\'Affaires Aujourd\'hui',
      value: 125750,
      previousValue: 118200,
      target: 130000,
      unit: '€',
      format: 'currency',
      trend: 'up',
      changePercentage: 6.4,
      status: 'good',
      category: 'financial',
      lastUpdated: '2024-12-20T15:45:00Z'
    },
    {
      id: 'orders_today',
      name: 'Commandes Aujourd\'hui',
      value: 342,
      previousValue: 298,
      target: 350,
      unit: '',
      format: 'number',
      trend: 'up',
      changePercentage: 14.8,
      status: 'excellent',
      category: 'operational',
      lastUpdated: '2024-12-20T15:45:00Z'
    },
    {
      id: 'conversion_rate',
      name: 'Taux de Conversion',
      value: 3.2,
      previousValue: 2.8,
      target: 3.5,
      unit: '%',
      format: 'percentage',
      trend: 'up',
      changePercentage: 14.3,
      status: 'good',
      category: 'customer',
      lastUpdated: '2024-12-20T15:45:00Z'
    },
    {
      id: 'inventory_turnover',
      name: 'Rotation des Stocks',
      value: 2.1,
      previousValue: 2.4,
      target: 2.5,
      unit: 'x',
      format: 'number',
      trend: 'down',
      changePercentage: -12.5,
      status: 'warning',
      category: 'inventory',
      lastUpdated: '2024-12-20T15:45:00Z'
    },
    {
      id: 'customer_satisfaction',
      name: 'Satisfaction Client',
      value: 4.6,
      previousValue: 4.4,
      target: 4.5,
      unit: '/5',
      format: 'number',
      trend: 'up',
      changePercentage: 4.5,
      status: 'excellent',
      category: 'customer',
      lastUpdated: '2024-12-20T15:45:00Z'
    },
    {
      id: 'avg_order_value',
      name: 'Panier Moyen',
      value: 367.5,
      previousValue: 396.8,
      target: 380,
      unit: '€',
      format: 'currency',
      trend: 'down',
      changePercentage: -7.4,
      status: 'warning',
      category: 'financial',
      lastUpdated: '2024-12-20T15:45:00Z'
    }
  ];

  // Mock alerts
  const mockAlerts: RealTimeAlert[] = [
    {
      id: 'alert_1',
      type: 'threshold_exceeded',
      severity: 'high',
      title: 'Stock Critique Atteint',
      description: 'Le produit "Smartphone XYZ" a atteint le seuil critique de stock (5 unités restantes)',
      metric: 'stock_level',
      value: 5,
      threshold: 10,
      timestamp: '2024-12-20T15:30:00Z',
      acknowledged: false,
      actionRequired: true
    },
    {
      id: 'alert_2',
      type: 'anomaly_detected',
      severity: 'medium',
      title: 'Pic de Trafic Détecté',
      description: 'Augmentation inhabituelle du trafic web (+150% par rapport à la normale)',
      metric: 'website_traffic',
      value: 2500,
      threshold: 1000,
      timestamp: '2024-12-20T15:15:00Z',
      acknowledged: true,
      actionRequired: false
    },
    {
      id: 'alert_3',
      type: 'target_achieved',
      severity: 'low',
      title: 'Objectif Mensuel Atteint',
      description: 'L\'objectif de chiffre d\'affaires mensuel a été atteint avec 10 jours d\'avance',
      metric: 'monthly_revenue',
      value: 2500000,
      threshold: 2500000,
      timestamp: '2024-12-20T14:45:00Z',
      acknowledged: true,
      actionRequired: false
    }
  ];

  // Mock insights
  const mockInsights: BusinessInsight[] = [
    {
      id: 'insight_1',
      type: 'opportunity',
      title: 'Opportunité de Cross-selling',
      description: 'Les clients qui achètent des smartphones ont 65% de chance d\'acheter des accessoires dans les 7 jours',
      impact: 'high',
      confidence: 0.87,
      data: {
        metrics: { cross_sell_probability: 0.65, potential_revenue: 45000 },
        timeframe: '7 jours'
      },
      recommendations: [
        'Créer une campagne email ciblée pour les acheteurs de smartphones',
        'Proposer des bundles smartphone + accessoires avec remise',
        'Afficher des recommandations d\'accessoires sur la page produit'
      ],
      priority: 1,
      generatedAt: '2024-12-20T15:00:00Z'
    },
    {
      id: 'insight_2',
      type: 'risk',
      title: 'Risque de Rupture de Stock',
      description: 'Basé sur les tendances actuelles, 12 produits risquent la rupture de stock dans les 5 prochains jours',
      impact: 'critical',
      confidence: 0.92,
      data: {
        metrics: { products_at_risk: 12, potential_lost_sales: 78000 },
        timeframe: '5 jours'
      },
      recommendations: [
        'Déclencher les commandes de réapprovisionnement urgentes',
        'Contacter les fournisseurs pour accélérer les livraisons',
        'Proposer des produits de substitution aux clients'
      ],
      priority: 1,
      generatedAt: '2024-12-20T14:30:00Z'
    },
    {
      id: 'insight_3',
      type: 'trend',
      title: 'Tendance Saisonnière Émergente',
      description: 'Les ventes de produits d\'hiver augmentent de 35% plus tôt que l\'année dernière',
      impact: 'medium',
      confidence: 0.78,
      data: {
        metrics: { growth_rate: 0.35, early_trend_days: 14 },
        timeframe: '2 semaines'
      },
      recommendations: [
        'Augmenter les stocks de produits d\'hiver',
        'Lancer les campagnes marketing saisonnières plus tôt',
        'Ajuster les prévisions de demande'
      ],
      priority: 2,
      generatedAt: '2024-12-20T13:15:00Z'
    }
  ];

  // Mock chart data
  const revenueData = [
    { time: '00:00', revenue: 12500, orders: 45 },
    { time: '04:00', revenue: 8200, orders: 28 },
    { time: '08:00', revenue: 18900, orders: 67 },
    { time: '12:00', revenue: 25400, orders: 89 },
    { time: '16:00', revenue: 31200, orders: 112 },
    { time: '20:00', revenue: 29600, orders: 98 }
  ];

  const categoryData = [
    { name: 'Électronique', value: 45, color: '#3B82F6' },
    { name: 'Vêtements', value: 28, color: '#10B981' },
    { name: 'Maison', value: 18, color: '#F59E0B' },
    { name: 'Livres', value: 9, color: '#EF4444' }
  ];

  useEffect(() => {
    setKpiMetrics(mockKPIMetrics);
    setAlerts(mockAlerts);
    setInsights(mockInsights);
    setIsLoading(false);

    // Simulate real-time updates
    if (autoRefresh) {
      const interval = setInterval(() => {
        setKpiMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * metric.value * 0.02,
          lastUpdated: new Date().toISOString()
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString('fr-FR')} ${unit}`;
      case 'percentage':
        return `${value.toFixed(1)}${unit}`;
      case 'number':
        return `${value.toLocaleString('fr-FR')}${unit}`;
      default:
        return `${value}${unit}`;
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderKPICard = (metric: KPIMetric) => {
    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Clock;
    const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
      <Card key={metric.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status}
              </Badge>
            </div>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatValue(metric.value, metric.format, metric.unit)}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`flex items-center space-x-1 ${trendColor}`}>
                <span>{metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%</span>
              </span>
              <span className="text-gray-500">
                vs {formatValue(metric.previousValue, metric.format, metric.unit)}
              </span>
            </div>
            
            {/* Progress towards target */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Objectif: {formatValue(metric.target, metric.format, metric.unit)}</span>
                <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={(metric.value / metric.target) * 100} 
                className="h-1"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-3">
            Mis à jour: {new Date(metric.lastUpdated).toLocaleTimeString('fr-FR')}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlert = (alert: RealTimeAlert) => {
    const AlertIcon = alert.severity === 'critical' ? AlertTriangle : 
                     alert.severity === 'high' ? AlertTriangle :
                     alert.type === 'target_achieved' ? CheckCircle : Clock;

    return (
      <div key={alert.id} className={`p-4 border rounded-lg ${
        alert.acknowledged ? 'bg-gray-50' : 'bg-white border-l-4 border-l-orange-500'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertIcon className={`h-5 w-5 mt-0.5 ${
              alert.severity === 'critical' ? 'text-red-600' :
              alert.severity === 'high' ? 'text-orange-600' :
              alert.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{alert.title}</h4>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                {alert.actionRequired && (
                  <Badge className="text-red-600 bg-red-50">
                    Action requise
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
              <div className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          {!alert.acknowledged && (
            <Button size="sm" variant="outline">
              Acquitter
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderInsight = (insight: BusinessInsight) => {
    const InsightIcon = insight.type === 'opportunity' ? Target :
                       insight.type === 'risk' ? AlertTriangle :
                       insight.type === 'trend' ? TrendingUp : Award;

    return (
      <Card key={insight.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <InsightIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={getImpactColor(insight.impact)}>
                {insight.impact}
              </Badge>
              <span className="text-xs text-gray-500">
                {(insight.confidence * 100).toFixed(0)}% confiance
              </span>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {Object.entries(insight.data.metrics).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                <div className="font-medium">
                  {typeof value === 'number' && value < 1 ? 
                    `${(value * 100).toFixed(1)}%` : 
                    value.toLocaleString('fr-FR')
                  }
                </div>
              </div>
            ))}
          </div>
          
          {/* Recommendations */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Recommandations:</div>
            <ul className="text-sm text-gray-600 space-y-1">
              {insight.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-xs text-gray-500">
              Généré: {new Date(insight.generatedAt).toLocaleString('fr-FR')}
            </span>
            <Button size="sm" variant="outline">
              Voir Détails
            </Button>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Temps Réel</h1>
          <p className="text-gray-600">Tableau de bord intelligent avec insights automatiques</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh">Actualisation auto:</Label>
            <Switch 
              id="auto-refresh"
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 heure</SelectItem>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiMetrics.slice(0, 6).map(renderKPICard)}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chiffre d'Affaires en Temps Réel</CardTitle>
                <CardDescription>Évolution des ventes aujourd'hui</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? `${value.toLocaleString()} €` : value,
                      name === 'revenue' ? 'CA' : 'Commandes'
                    ]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
                  </RechartsLineChart>
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
                  <RechartsPieChart>
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
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertes Récentes</CardTitle>
                <CardDescription>Notifications importantes nécessitant attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.slice(0, 3).map(renderAlert)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights Prioritaires</CardTitle>
                <CardDescription>Recommandations basées sur l'analyse des données</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.slice(0, 2).map(insight => (
                    <div key={insight.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiMetrics.map(renderKPICard)}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map(renderAlert)}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map(renderInsight)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avancées</CardTitle>
              <CardDescription>Analyses détaillées et prédictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics avancées en cours de développement</p>
                <p className="text-sm">Analyses prédictives et modélisation avancée</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeBusinessIntelligence;
