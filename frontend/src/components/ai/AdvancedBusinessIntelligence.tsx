import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  Download,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Activity,
  Zap,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  PieChart,
  LineChart,
  AreaChart,
  Layers,
  Database,
  Cpu,
  Settings,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils'
import { ResponsiveContainer, LineChart as RechartsLineChart, AreaChart as RechartsAreaChart, BarChart, PieChart as RechartsPieChart, ScatterChart, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line, Cell, Scatter } from 'recharts'

interface BIDashboard {
  id: string
  name: string
  description: string
  category: 'executive' | 'sales' | 'finance' | 'operations' | 'marketing' | 'custom'
  widgets: BIWidget[]
  filters: DashboardFilter[]
  refreshInterval: number
  lastUpdated: string
  isPublic: boolean
  createdBy: string
}

interface BIWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'map' | 'gauge' | 'text' | 'ai_insight'
  title: string
  description?: string
  position: { x: number; y: number; width: number; height: number }
  config: WidgetConfig
  data: any[]
  aiPowered: boolean
  refreshRate: number
}

interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'composed'
  dataSource: string
  metrics: string[]
  dimensions: string[]
  filters?: Record<string, any>
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  timeRange?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
}

interface DashboardFilter {
  id: string
  name: string
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text'
  options?: { value: string; label: string }[]
  defaultValue?: any
  appliedValue?: any
}

interface AIInsight {
  id: string
  type: 'trend' | 'anomaly' | 'forecast' | 'correlation' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: string
  data: any
  timestamp: string
  actionable: boolean
  actions?: string[]
}

interface PredictiveAnalysis {
  id: string
  name: string
  type: 'sales_forecast' | 'demand_prediction' | 'churn_analysis' | 'price_optimization' | 'market_analysis'
  model: string
  accuracy: number
  predictions: PredictionResult[]
  confidence: number
  lastUpdated: string
  nextUpdate: string
}

interface PredictionResult {
  period: string
  predicted: number
  actual?: number
  confidence: number
  factors: string[]
  variance?: number
}

export function AdvancedBusinessIntelligence() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'dashboards' | 'insights' | 'predictions' | 'analytics' | 'builder'>('dashboards')
  const [biDashboards, setBIDashboards] = useState<BIDashboard[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [predictiveAnalyses, setPredictiveAnalyses] = useState<PredictiveAnalysis[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<BIDashboard | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [showDashboardDialog, setShowDashboardDialog] = useState(false)
  const [showInsightDialog, setShowInsightDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Mock data initialization
  useEffect(() => {
    const mockDashboards: BIDashboard[] = [
      {
        id: '1',
        name: 'Tableau de bord exécutif',
        description: 'Vue d\'ensemble des KPIs critiques pour la direction',
        category: 'executive',
        widgets: [
          {
            id: 'w1',
            type: 'kpi',
            title: 'Chiffre d\'affaires mensuel',
            position: { x: 0, y: 0, width: 3, height: 2 },
            config: {
              dataSource: 'sales',
              metrics: ['revenue'],
              dimensions: ['month'],
              timeRange: 'current_month'
            },
            data: [{ value: 285000, change: 12.5, target: 300000 }],
            aiPowered: true,
            refreshRate: 300
          },
          {
            id: 'w2',
            type: 'chart',
            title: 'Tendance des ventes',
            position: { x: 3, y: 0, width: 6, height: 4 },
            config: {
              chartType: 'line',
              dataSource: 'sales',
              metrics: ['revenue', 'orders'],
              dimensions: ['date'],
              timeRange: 'last_6_months',
              colors: ['#3B82F6', '#10B981']
            },
            data: [
              { date: 'Jan', revenue: 240000, orders: 156 },
              { date: 'Fév', revenue: 265000, orders: 178 },
              { date: 'Mar', revenue: 285000, orders: 192 },
              { date: 'Avr', revenue: 275000, orders: 185 },
              { date: 'Mai', revenue: 295000, orders: 201 },
              { date: 'Jun', revenue: 315000, orders: 218 }
            ],
            aiPowered: false,
            refreshRate: 600
          }
        ],
        filters: [
          {
            id: 'date_range',
            name: 'Période',
            type: 'date',
            defaultValue: 'last_30_days'
          },
          {
            id: 'region',
            name: 'Région',
            type: 'select',
            options: [
              { value: 'all', label: 'Toutes les régions' },
              { value: 'casablanca', label: 'Casablanca' },
              { value: 'rabat', label: 'Rabat' },
              { value: 'marrakech', label: 'Marrakech' }
            ],
            defaultValue: 'all'
          }
        ],
        refreshInterval: 300,
        lastUpdated: '2024-01-20T11:30:00Z',
        isPublic: false,
        createdBy: 'admin'
      },
      {
        id: '2',
        name: 'Analytics des ventes',
        description: 'Analyse détaillée des performances commerciales',
        category: 'sales',
        widgets: [
          {
            id: 'w3',
            type: 'chart',
            title: 'Répartition des ventes par produit',
            position: { x: 0, y: 0, width: 6, height: 4 },
            config: {
              chartType: 'pie',
              dataSource: 'sales',
              metrics: ['revenue'],
              dimensions: ['product_category'],
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            },
            data: [
              { name: 'Électronique', value: 35, color: '#3B82F6' },
              { name: 'Vêtements', value: 28, color: '#10B981' },
              { name: 'Maison', value: 20, color: '#F59E0B' },
              { name: 'Sports', value: 12, color: '#EF4444' },
              { name: 'Livres', value: 5, color: '#8B5CF6' }
            ],
            aiPowered: true,
            refreshRate: 900
          }
        ],
        filters: [],
        refreshInterval: 600,
        lastUpdated: '2024-01-20T10:45:00Z',
        isPublic: true,
        createdBy: 'sales_manager'
      }
    ]

    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Croissance accélérée des ventes mobiles',
        description: 'Les ventes via mobile ont augmenté de 45% ce mois-ci, dépassant les ventes desktop pour la première fois',
        confidence: 94,
        impact: 'high',
        category: 'sales',
        data: {
          mobile_sales: 156000,
          desktop_sales: 142000,
          growth_rate: 45,
          trend_duration: '3 months'
        },
        timestamp: '2024-01-20T09:30:00Z',
        actionable: true,
        actions: [
          'Optimiser l\'expérience mobile',
          'Investir dans le marketing mobile',
          'Améliorer le checkout mobile'
        ]
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Pic inhabituel des retours produits',
        description: 'Le taux de retour pour la catégorie "Électronique" a augmenté de 300% cette semaine',
        confidence: 87,
        impact: 'critical',
        category: 'operations',
        data: {
          normal_return_rate: 2.5,
          current_return_rate: 10.2,
          affected_products: ['Smartphone X', 'Tablet Pro', 'Headphones Elite'],
          potential_causes: ['Défaut de fabrication', 'Description incorrecte', 'Problème de livraison']
        },
        timestamp: '2024-01-20T08:15:00Z',
        actionable: true,
        actions: [
          'Enquête qualité urgente',
          'Contact fournisseur',
          'Suspension temporaire des ventes'
        ]
      },
      {
        id: '3',
        type: 'forecast',
        title: 'Prévision de demande élevée',
        description: 'La demande pour les produits de jardinage devrait augmenter de 60% le mois prochain',
        confidence: 82,
        impact: 'medium',
        category: 'inventory',
        data: {
          predicted_increase: 60,
          affected_categories: ['Outils de jardinage', 'Plantes', 'Engrais'],
          seasonal_factor: 'Printemps',
          recommended_stock_increase: 40
        },
        timestamp: '2024-01-19T16:20:00Z',
        actionable: true,
        actions: [
          'Augmenter les commandes fournisseurs',
          'Préparer campagne marketing',
          'Optimiser l\'espace de stockage'
        ]
      }
    ]

    const mockPredictions: PredictiveAnalysis[] = [
      {
        id: '1',
        name: 'Prévision des ventes Q2',
        type: 'sales_forecast',
        model: 'ARIMA + ML Ensemble',
        accuracy: 89.5,
        predictions: [
          {
            period: 'Avril 2024',
            predicted: 320000,
            confidence: 87,
            factors: ['Saisonnalité', 'Tendance historique', 'Campagne marketing']
          },
          {
            period: 'Mai 2024',
            predicted: 335000,
            confidence: 84,
            factors: ['Croissance tendancielle', 'Nouveau produit', 'Expansion géographique']
          },
          {
            period: 'Juin 2024',
            predicted: 345000,
            confidence: 81,
            factors: ['Effet saisonnier', 'Fidélisation client', 'Optimisation prix']
          }
        ],
        confidence: 84,
        lastUpdated: '2024-01-20T07:00:00Z',
        nextUpdate: '2024-01-21T07:00:00Z'
      },
      {
        id: '2',
        name: 'Analyse de churn client',
        type: 'churn_analysis',
        model: 'XGBoost Classification',
        accuracy: 92.3,
        predictions: [
          {
            period: 'Février 2024',
            predicted: 45,
            confidence: 91,
            factors: ['Inactivité récente', 'Baisse des achats', 'Support tickets']
          }
        ],
        confidence: 91,
        lastUpdated: '2024-01-19T20:00:00Z',
        nextUpdate: '2024-01-20T20:00:00Z'
      }
    ]

    setBIDashboards(mockDashboards)
    setAIInsights(mockInsights)
    setPredictiveAnalyses(mockPredictions)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive':
        return <Target className="h-4 w-4 text-purple-500" />
      case 'sales':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'finance':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'operations':
        return <Activity className="h-4 w-4 text-orange-500" />
      case 'marketing':
        return <TrendingUp className="h-4 w-4 text-pink-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'forecast':
        return <Brain className="h-4 w-4 text-purple-500" />
      case 'correlation':
        return <Layers className="h-4 w-4 text-green-500" />
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <Badge variant="error">Critique</Badge>
      case 'high':
        return <Badge variant="warning">Élevé</Badge>
      case 'medium':
        return <Badge variant="info">Moyen</Badge>
      default:
        return <Badge variant="neutral">Faible</Badge>
    }
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'kpi':
        return <Target className="h-4 w-4" />
      case 'chart':
        return <BarChart3 className="h-4 w-4" />
      case 'table':
        return <Database className="h-4 w-4" />
      case 'map':
        return <Globe className="h-4 w-4" />
      case 'gauge':
        return <Activity className="h-4 w-4" />
      case 'ai_insight':
        return <Brain className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const handleViewDashboard = (dashboard: BIDashboard) => {
    setSelectedDashboard(dashboard)
    setShowDashboardDialog(true)
  }

  const handleViewInsight = (insight: AIInsight) => {
    setSelectedInsight(insight)
    setShowInsightDialog(true)
  }

  const biMetrics = useMemo(() => {
    const totalDashboards = biDashboards.length
    const publicDashboards = biDashboards.filter(d => d.isPublic).length
    const totalWidgets = biDashboards.reduce((acc, d) => acc + d.widgets.length, 0)
    const aiPoweredWidgets = biDashboards.reduce((acc, d) => acc + d.widgets.filter(w => w.aiPowered).length, 0)
    const criticalInsights = aiInsights.filter(i => i.impact === 'critical').length
    const averageAccuracy = predictiveAnalyses.reduce((acc, p) => acc + p.accuracy, 0) / predictiveAnalyses.length

    return {
      totalDashboards,
      publicDashboards,
      totalWidgets,
      aiPoweredWidgets,
      criticalInsights,
      averageAccuracy
    }
  }, [biDashboards, aiInsights, predictiveAnalyses])

  // Sample data for overview charts
  const usageData = [
    { name: 'Lun', views: 245, interactions: 89 },
    { name: 'Mar', views: 312, interactions: 124 },
    { name: 'Mer', views: 289, interactions: 98 },
    { name: 'Jeu', views: 356, interactions: 145 },
    { name: 'Ven', views: 298, interactions: 112 },
    { name: 'Sam', views: 187, interactions: 67 },
    { name: 'Dim', views: 156, interactions: 45 },
  ]

  const insightDistribution = [
    { name: 'Tendances', value: aiInsights.filter(i => i.type === 'trend').length, color: '#3B82F6' },
    { name: 'Anomalies', value: aiInsights.filter(i => i.type === 'anomaly').length, color: '#EF4444' },
    { name: 'Prévisions', value: aiInsights.filter(i => i.type === 'forecast').length, color: '#8B5CF6' },
    { name: 'Corrélations', value: aiInsights.filter(i => i.type === 'correlation').length, color: '#10B981' },
    { name: 'Recommandations', value: aiInsights.filter(i => i.type === 'recommendation').length, color: '#F59E0B' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Business Intelligence Avancée
          </h1>
          <p className="text-muted-foreground">
            Tableaux de bord intelligents et analytics prédictives
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            Assistant BI
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau tableau
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'dashboards', label: 'Tableaux de bord', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'insights', label: 'Insights IA', icon: <Brain className="h-4 w-4" /> },
          { id: 'predictions', label: 'Prédictions', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
          { id: 'builder', label: 'Constructeur', icon: <Settings className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboards Tab */}
      {activeTab === 'dashboards' && (
        <div className="space-y-6">
          {/* BI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-info/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold">Tableaux</h3>
                  <p className="text-2xl font-bold text-info">{biMetrics.totalDashboards}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{biMetrics.publicDashboards} publics</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Layers className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Widgets</h3>
                  <p className="text-2xl font-bold text-success">{biMetrics.totalWidgets}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{biMetrics.aiPoweredWidgets} avec IA</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Brain className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Insights IA</h3>
                  <p className="text-2xl font-bold text-warning">{aiInsights.length}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{biMetrics.criticalInsights} critiques</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple/10 rounded-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Précision</h3>
                  <p className="text-2xl font-bold text-purple-500">{biMetrics.averageAccuracy.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Modèles prédictifs</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange/10 rounded-lg">
                  <Eye className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Vues</h3>
                  <p className="text-2xl font-bold text-orange-500">2.1K</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Cette semaine</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald/10 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Utilisateurs</h3>
                  <p className="text-2xl font-bold text-emerald-500">45</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Actifs</p>
            </Card>
          </div>

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Utilisation des tableaux de bord
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsAreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Vues" />
                  <Area type="monotone" dataKey="interactions" stackId="1" stroke="#10B981" fill="#10B981" name="Interactions" />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribution des insights
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart data={insightDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {insightDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {insightDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Dashboards List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {biDashboards.map((dashboard) => (
              <Card key={dashboard.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(dashboard.category)}
                    <div>
                      <h4 className="font-semibold mb-1">{dashboard.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {dashboard.category} • {dashboard.widgets.length} widgets
                      </p>
                    </div>
                  </div>
                  {dashboard.isPublic && (
                    <Badge variant="info" className="text-xs">Public</Badge>
                  )}
                </div>

                <p className="text-sm mb-4">{dashboard.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Widgets IA:</span>
                    <span>{dashboard.widgets.filter(w => w.aiPowered).length}/{dashboard.widgets.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refresh:</span>
                    <span>{dashboard.refreshInterval}s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mis à jour:</span>
                    <span>{formatDate(dashboard.lastUpdated)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDashboard(dashboard)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Configurer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Insights IA</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Type"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'trend', label: 'Tendances' },
                  { value: 'anomaly', label: 'Anomalies' },
                  { value: 'forecast', label: 'Prévisions' },
                  { value: 'recommendation', label: 'Recommandations' },
                ]}
              />
              <Select
                placeholder="Impact"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'critical', label: 'Critique' },
                  { value: 'high', label: 'Élevé' },
                  { value: 'medium', label: 'Moyen' },
                  { value: 'low', label: 'Faible' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {insight.type} • {insight.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getImpactBadge(insight.impact)}
                    <Badge variant="info" className="text-xs">
                      {insight.confidence}% confiance
                    </Badge>
                  </div>
                </div>

                <p className="text-sm mb-4">{insight.description}</p>

                {insight.actionable && insight.actions && insight.actions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Actions recommandées:</div>
                    <div className="space-y-1">
                      {insight.actions.slice(0, 2).map((action, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(insight.timestamp)}
                  </div>
                  {insight.actionable && (
                    <Badge variant="success" className="text-xs">Actionnable</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  {insight.actionable && (
                    <Button size="sm">
                      <Zap className="h-3 w-3 mr-1" />
                      Agir
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Details Dialog */}
      {selectedDashboard && (
        <Dialog
          isOpen={showDashboardDialog}
          onClose={() => setShowDashboardDialog(false)}
          title="Détails du tableau de bord"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="mt-1">{selectedDashboard.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedDashboard.category)}
                  <span className="capitalize">{selectedDashboard.category}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Visibilité</label>
                <p className="mt-1">{selectedDashboard.isPublic ? 'Public' : 'Privé'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Créé par</label>
                <p className="mt-1">{selectedDashboard.createdBy}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedDashboard.description}</p>
            </div>

            {/* Widgets */}
            <div>
              <label className="text-sm font-medium mb-3 block">Widgets ({selectedDashboard.widgets.length})</label>
              <div className="space-y-3">
                {selectedDashboard.widgets.map((widget) => (
                  <div key={widget.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getWidgetIcon(widget.type)}
                        <span className="font-medium">{widget.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{widget.type}</Badge>
                        {widget.aiPowered && (
                          <Badge variant="info" className="text-xs">IA</Badge>
                        )}
                      </div>
                    </div>
                    {widget.description && (
                      <p className="text-sm text-muted-foreground mb-2">{widget.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>Source: {widget.config.dataSource}</div>
                      <div>Refresh: {widget.refreshRate}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            {selectedDashboard.filters.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Filtres ({selectedDashboard.filters.length})</label>
                <div className="space-y-2">
                  {selectedDashboard.filters.map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium text-sm">{filter.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">{filter.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Intervalle de refresh</label>
                <p>{selectedDashboard.refreshInterval}s</p>
              </div>
              <div>
                <label className="font-medium">Dernière mise à jour</label>
                <p>{formatDate(selectedDashboard.lastUpdated)}</p>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Insight Details Dialog */}
      {selectedInsight && (
        <Dialog
          isOpen={showInsightDialog}
          onClose={() => setShowInsightDialog(false)}
          title="Détails de l'insight IA"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getInsightIcon(selectedInsight.type)}
                  <span className="capitalize">{selectedInsight.type}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <p className="mt-1 capitalize">{selectedInsight.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Impact</label>
                <div className="mt-1">{getImpactBadge(selectedInsight.impact)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Confiance</label>
                <p className="mt-1">{selectedInsight.confidence}%</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedInsight.description}</p>
            </div>

            {/* Data Details */}
            <div>
              <label className="text-sm font-medium mb-3 block">Données détaillées</label>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(selectedInsight.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Actions */}
            {selectedInsight.actionable && selectedInsight.actions && selectedInsight.actions.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Actions recommandées</label>
                <div className="space-y-2">
                  {selectedInsight.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Actionnable</label>
                <p>{selectedInsight.actionable ? 'Oui' : 'Non'}</p>
              </div>
              <div>
                <label className="font-medium">Date de création</label>
                <p>{formatDate(selectedInsight.timestamp)}</p>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
