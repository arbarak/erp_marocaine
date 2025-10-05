import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Lightbulb,
  Cpu,
  Database,
  Clock,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
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
import { ResponsiveContainer, LineChart as RechartsLineChart, AreaChart, BarChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line, Cell, ComposedChart } from 'recharts'

interface AIInsight {
  id: string
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend' | 'opportunity' | 'risk'
  category: 'sales' | 'inventory' | 'finance' | 'customer' | 'operations' | 'market'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  priority: number
  timestamp: string
  data: any
  actionable: boolean
  actions?: AIAction[]
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed'
}

interface AIAction {
  id: string
  title: string
  description: string
  type: 'automated' | 'manual' | 'approval_required'
  estimatedImpact: string
  estimatedEffort: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

interface PredictiveModel {
  id: string
  name: string
  type: 'demand_forecast' | 'sales_prediction' | 'churn_prediction' | 'price_optimization' | 'inventory_optimization'
  accuracy: number
  lastTrained: string
  status: 'active' | 'training' | 'inactive' | 'error'
  predictions: ModelPrediction[]
}

interface ModelPrediction {
  period: string
  predicted: number
  actual?: number
  confidence: number
  factors: string[]
}

interface AnalyticsMetric {
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  prediction: number
  predictionChange: number
  unit: string
  icon: React.ReactNode
  color: string
  aiInsights: number
}

export function AIAnalyticsEngine() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'predictions' | 'models' | 'automation'>('overview')
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([])
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [showInsightDialog, setShowInsightDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(300) // 5 minutes

  // Mock data initialization
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'prediction',
        category: 'sales',
        title: 'Augmentation des ventes prévue',
        description: 'Les modèles prédictifs indiquent une augmentation de 15% des ventes pour le mois prochain basée sur les tendances saisonnières et les données historiques.',
        confidence: 87,
        impact: 'high',
        priority: 1,
        timestamp: '2024-01-20T10:30:00Z',
        data: {
          predictedIncrease: 15,
          timeframe: '30 days',
          factors: ['Tendance saisonnière', 'Campagne marketing', 'Nouveau produit']
        },
        actionable: true,
        actions: [
          {
            id: 'action1',
            title: 'Augmenter le stock',
            description: 'Augmenter les niveaux de stock de 20% pour répondre à la demande prévue',
            type: 'manual',
            estimatedImpact: 'Éviter les ruptures de stock',
            estimatedEffort: '2 heures',
            status: 'pending'
          }
        ],
        status: 'new'
      },
      {
        id: '2',
        type: 'anomaly',
        category: 'inventory',
        title: 'Anomalie détectée dans les mouvements de stock',
        description: 'Détection d\'un pattern inhabituel dans les sorties de stock pour la catégorie "Électronique" - 40% au-dessus de la normale.',
        confidence: 92,
        impact: 'medium',
        priority: 2,
        timestamp: '2024-01-20T09:15:00Z',
        data: {
          category: 'Électronique',
          deviation: 40,
          normalRange: [100, 150],
          currentValue: 210
        },
        actionable: true,
        actions: [
          {
            id: 'action2',
            title: 'Vérifier les commandes',
            description: 'Analyser les commandes récentes pour identifier la cause de l\'augmentation',
            type: 'manual',
            estimatedImpact: 'Identification de la cause',
            estimatedEffort: '1 heure',
            status: 'pending'
          }
        ],
        status: 'new'
      },
      {
        id: '3',
        type: 'recommendation',
        category: 'customer',
        title: 'Opportunité de fidélisation client',
        description: 'Identification de 25 clients à risque de churn avec une probabilité de 78%. Recommandation d\'actions de rétention ciblées.',
        confidence: 78,
        impact: 'high',
        priority: 1,
        timestamp: '2024-01-20T08:45:00Z',
        data: {
          customersAtRisk: 25,
          averageValue: 5600,
          retentionActions: ['Offre personnalisée', 'Contact commercial', 'Programme fidélité']
        },
        actionable: true,
        actions: [
          {
            id: 'action3',
            title: 'Campagne de rétention',
            description: 'Lancer une campagne de rétention personnalisée pour les clients identifiés',
            type: 'approval_required',
            estimatedImpact: 'Rétention de 60% des clients',
            estimatedEffort: '1 semaine',
            status: 'pending'
          }
        ],
        status: 'new'
      },
      {
        id: '4',
        type: 'opportunity',
        category: 'market',
        title: 'Nouvelle opportunité de marché',
        description: 'Analyse des tendances du marché révèle une demande croissante pour les produits écologiques (+35% en 6 mois).',
        confidence: 85,
        impact: 'high',
        priority: 1,
        timestamp: '2024-01-19T16:20:00Z',
        data: {
          marketGrowth: 35,
          timeframe: '6 months',
          segments: ['Produits bio', 'Emballage recyclable', 'Énergie verte']
        },
        actionable: true,
        status: 'reviewed'
      }
    ]

    const mockModels: PredictiveModel[] = [
      {
        id: '1',
        name: 'Prévision de la demande',
        type: 'demand_forecast',
        accuracy: 89.5,
        lastTrained: '2024-01-19T14:30:00Z',
        status: 'active',
        predictions: [
          {
            period: 'Février 2024',
            predicted: 125000,
            confidence: 87,
            factors: ['Tendance saisonnière', 'Promotions', 'Historique']
          },
          {
            period: 'Mars 2024',
            predicted: 135000,
            confidence: 82,
            factors: ['Croissance tendancielle', 'Nouveau produit']
          }
        ]
      },
      {
        id: '2',
        name: 'Prédiction des ventes',
        type: 'sales_prediction',
        accuracy: 92.3,
        lastTrained: '2024-01-18T10:15:00Z',
        status: 'active',
        predictions: [
          {
            period: 'Février 2024',
            predicted: 285000,
            confidence: 91,
            factors: ['Campagne marketing', 'Saisonnalité', 'Tendance marché']
          }
        ]
      },
      {
        id: '3',
        name: 'Détection de churn',
        type: 'churn_prediction',
        accuracy: 84.7,
        lastTrained: '2024-01-17T09:45:00Z',
        status: 'training',
        predictions: []
      }
    ]

    setAIInsights(mockInsights)
    setPredictiveModels(mockModels)
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('Refreshing AI analytics...')
      // Simulate real-time AI insights generation
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <TrendingUp className="h-4 w-4 text-info" />
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-success" />
      case 'trend':
        return <BarChart3 className="h-4 w-4 text-purple-500" />
      case 'opportunity':
        return <Target className="h-4 w-4 text-emerald-500" />
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-error" />
      default:
        return <Brain className="h-4 w-4 text-muted-foreground" />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">Nouveau</Badge>
      case 'reviewed':
        return <Badge variant="warning">Examiné</Badge>
      case 'implemented':
        return <Badge variant="success">Implémenté</Badge>
      case 'dismissed':
        return <Badge variant="neutral">Rejeté</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getModelStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>
      case 'training':
        return <Badge variant="warning">Entraînement</Badge>
      case 'inactive':
        return <Badge variant="neutral">Inactif</Badge>
      case 'error':
        return <Badge variant="error">Erreur</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'inventory':
        return <Package className="h-4 w-4 text-green-500" />
      case 'finance':
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      case 'customer':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'operations':
        return <Activity className="h-4 w-4 text-orange-500" />
      case 'market':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      default:
        return <Brain className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleViewInsight = (insight: AIInsight) => {
    setSelectedInsight(insight)
    setShowInsightDialog(true)
  }

  const handleImplementAction = (insightId: string, actionId: string) => {
    setAIInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? {
            ...insight,
            actions: insight.actions?.map(action =>
              action.id === actionId 
                ? { ...action, status: 'in_progress' }
                : action
            )
          }
        : insight
    ))
  }

  const handleDismissInsight = (insightId: string) => {
    setAIInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, status: 'dismissed' } : insight
    ))
  }

  const analyticsMetrics: AnalyticsMetric[] = [
    {
      name: 'Insights générés',
      value: aiInsights.length,
      change: 3,
      changeType: 'increase',
      prediction: aiInsights.length + 2,
      predictionChange: 2,
      unit: '',
      icon: <Brain className="h-5 w-5" />,
      color: 'info',
      aiInsights: aiInsights.filter(i => i.status === 'new').length
    },
    {
      name: 'Précision moyenne',
      value: 88.5,
      change: 2.1,
      changeType: 'increase',
      prediction: 89.2,
      predictionChange: 0.7,
      unit: '%',
      icon: <Target className="h-5 w-5" />,
      color: 'success',
      aiInsights: 0
    },
    {
      name: 'Actions recommandées',
      value: aiInsights.filter(i => i.actionable).length,
      change: 1,
      changeType: 'increase',
      prediction: aiInsights.filter(i => i.actionable).length + 1,
      predictionChange: 1,
      unit: '',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'warning',
      aiInsights: aiInsights.filter(i => i.actionable && i.status === 'new').length
    },
    {
      name: 'Modèles actifs',
      value: predictiveModels.filter(m => m.status === 'active').length,
      change: 0,
      changeType: 'increase',
      prediction: predictiveModels.filter(m => m.status === 'active').length,
      predictionChange: 0,
      unit: '',
      icon: <Cpu className="h-5 w-5" />,
      color: 'purple',
      aiInsights: 0
    }
  ]

  // Sample data for charts
  const performanceData = [
    { name: 'Jan', actual: 120000, predicted: 118000, accuracy: 95 },
    { name: 'Fév', actual: 135000, predicted: 132000, accuracy: 92 },
    { name: 'Mar', actual: 148000, predicted: 145000, accuracy: 89 },
    { name: 'Avr', actual: 162000, predicted: 165000, accuracy: 91 },
    { name: 'Mai', actual: 175000, predicted: 172000, accuracy: 94 },
    { name: 'Jun', actual: 188000, predicted: 190000, accuracy: 96 },
  ]

  const insightDistribution = [
    { name: 'Prédictions', value: aiInsights.filter(i => i.type === 'prediction').length, color: '#3B82F6' },
    { name: 'Anomalies', value: aiInsights.filter(i => i.type === 'anomaly').length, color: '#F59E0B' },
    { name: 'Recommandations', value: aiInsights.filter(i => i.type === 'recommendation').length, color: '#10B981' },
    { name: 'Opportunités', value: aiInsights.filter(i => i.type === 'opportunity').length, color: '#8B5CF6' },
    { name: 'Risques', value: aiInsights.filter(i => i.type === 'risk').length, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Intelligence Artificielle
          </h1>
          <p className="text-muted-foreground">
            Analytics avancées et insights prédictifs alimentés par l'IA
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
          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(parseInt(value))}
            options={[
              { value: '60', label: '1m' },
              { value: '300', label: '5m' },
              { value: '600', label: '10m' },
              { value: '1800', label: '30m' },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="h-4 w-4" /> },
          { id: 'insights', label: 'Insights IA', icon: <Lightbulb className="h-4 w-4" /> },
          { id: 'predictions', label: 'Prédictions', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'models', label: 'Modèles ML', icon: <Cpu className="h-4 w-4" /> },
          { id: 'automation', label: 'Automation', icon: <Zap className="h-4 w-4" /> },
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Metrics */}
          {analyticsMetrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${metric.color}/10 rounded-lg`}>
                  <div className={`text-${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{metric.name}</h3>
                  <p className={`text-2xl font-bold text-${metric.color}`}>
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm">
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-error" />
                  )}
                  <span className={metric.changeType === 'increase' ? 'text-success' : 'text-error'}>
                    {Math.abs(metric.change)}{metric.unit}
                  </span>
                  <span className="text-muted-foreground">vs hier</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Brain className="h-3 w-3 text-info" />
                  <span className="text-info">Prédiction: {metric.prediction}{metric.unit}</span>
                </div>
                {metric.aiInsights > 0 && (
                  <Badge variant="warning" className="text-xs">
                    {metric.aiInsights} nouveaux insights
                  </Badge>
                )}
              </div>
            </Card>
          ))}

          {/* Performance Chart */}
          <Card className="p-6 md:col-span-2 lg:col-span-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance des prédictions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'accuracy' ? `${value}%` : formatCurrency(value),
                    name === 'actual' ? 'Réel' : name === 'predicted' ? 'Prédit' : 'Précision'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="actual" fill="#3B82F6" name="Réel" />
                <Bar yAxisId="left" dataKey="predicted" fill="#10B981" name="Prédit" />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#F59E0B" strokeWidth={3} name="Précision" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Insight Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution des insights
            </h3>
            <ResponsiveContainer width="100%" height={200}>
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

          {/* Recent AI Insights */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights IA récents
            </h3>
            <div className="space-y-3">
              {aiInsights.slice(0, 5).map((insight) => (
                <div key={insight.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getInsightIcon(insight.type)}
                  {getCategoryIcon(insight.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{insight.title}</span>
                      {getImpactBadge(insight.impact)}
                      {getStatusBadge(insight.status)}
                      <Badge variant="info" className="text-xs">
                        {insight.confidence}% confiance
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {insight.description.substring(0, 100)}...
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewInsight(insight)}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
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
                  { value: 'prediction', label: 'Prédictions' },
                  { value: 'anomaly', label: 'Anomalies' },
                  { value: 'recommendation', label: 'Recommandations' },
                  { value: 'opportunity', label: 'Opportunités' },
                  { value: 'risk', label: 'Risques' },
                ]}
              />
              <Select
                placeholder="Catégorie"
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'sales', label: 'Ventes' },
                  { value: 'inventory', label: 'Inventaire' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'customer', label: 'Client' },
                  { value: 'operations', label: 'Opérations' },
                  { value: 'market', label: 'Marché' },
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
                    {getCategoryIcon(insight.category)}
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {insight.type} • {insight.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getImpactBadge(insight.impact)}
                    {getStatusBadge(insight.status)}
                  </div>
                </div>

                <p className="text-sm mb-4">{insight.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Confiance:</span>
                      <span className="font-medium ml-1">{insight.confidence}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Priorité:</span>
                      <span className="font-medium ml-1">{insight.priority}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(insight.timestamp)}
                  </div>
                </div>

                {insight.actionable && insight.actions && insight.actions.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="text-sm font-medium mb-2">Actions recommandées:</div>
                    <div className="space-y-2">
                      {insight.actions.slice(0, 2).map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <div className="text-sm font-medium">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.estimatedImpact}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImplementAction(insight.id, action.id)}
                            disabled={action.status !== 'pending'}
                          >
                            {action.status === 'pending' ? 'Implémenter' : 
                             action.status === 'in_progress' ? 'En cours' : 'Terminé'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  {insight.status === 'new' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissInsight(insight.id)}
                    >
                      Rejeter
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
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
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedInsight.category)}
                  <span className="capitalize">{selectedInsight.category}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Impact</label>
                <div className="mt-1">{getImpactBadge(selectedInsight.impact)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Confiance</label>
                <p className="mt-1 text-sm font-medium">{selectedInsight.confidence}%</p>
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
            {selectedInsight.actions && selectedInsight.actions.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Actions recommandées</label>
                <div className="space-y-3">
                  {selectedInsight.actions.map((action) => (
                    <div key={action.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{action.title}</h4>
                        <Badge variant={
                          action.status === 'completed' ? 'success' :
                          action.status === 'in_progress' ? 'warning' :
                          action.status === 'failed' ? 'error' : 'neutral'
                        }>
                          {action.status === 'completed' ? 'Terminé' :
                           action.status === 'in_progress' ? 'En cours' :
                           action.status === 'failed' ? 'Échec' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Impact estimé:</span> {action.estimatedImpact}
                        </div>
                        <div>
                          <span className="font-medium">Effort estimé:</span> {action.estimatedEffort}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Priorité</label>
                <p>{selectedInsight.priority}</p>
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
