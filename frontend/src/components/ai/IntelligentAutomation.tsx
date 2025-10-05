import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Zap,
  Bot,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Activity,
  BarChart3,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Workflow,
  Brain,
  Cpu,
  Database,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils'
import { ResponsiveContainer, LineChart, AreaChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line } from 'recharts'

interface AutomationRule {
  id: string
  name: string
  description: string
  category: 'sales' | 'inventory' | 'customer' | 'finance' | 'operations' | 'marketing'
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  status: 'active' | 'inactive' | 'paused' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  lastExecuted?: string
  executionCount: number
  successRate: number
  estimatedSavings: number
}

interface AutomationTrigger {
  type: 'schedule' | 'event' | 'threshold' | 'manual'
  config: Record<string, any>
}

interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

interface AutomationAction {
  type: 'email' | 'sms' | 'notification' | 'update_record' | 'create_task' | 'api_call' | 'generate_report'
  config: Record<string, any>
  order: number
}

interface SmartRecommendation {
  id: string
  type: 'process_optimization' | 'cost_reduction' | 'revenue_increase' | 'risk_mitigation' | 'efficiency_improvement'
  title: string
  description: string
  category: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  confidence: number
  estimatedBenefit: number
  timeframe: string
  prerequisites: string[]
  steps: RecommendationStep[]
  status: 'new' | 'reviewed' | 'approved' | 'implemented' | 'rejected'
  createdAt: string
  aiModel: string
}

interface RecommendationStep {
  id: string
  title: string
  description: string
  estimatedTime: string
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}

interface AutomationExecution {
  id: string
  ruleId: string
  ruleName: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  duration?: number
  triggeredBy: string
  actionsExecuted: number
  totalActions: number
  logs: ExecutionLog[]
  error?: string
}

interface ExecutionLog {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  action?: string
}

export function IntelligentAutomation() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'recommendations' | 'executions' | 'analytics'>('overview')
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([])
  const [automationExecutions, setAutomationExecutions] = useState<AutomationExecution[]>([])
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<SmartRecommendation | null>(null)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Alerte stock faible',
        description: 'Envoie automatiquement une alerte quand le stock d\'un produit descend sous le seuil minimum',
        category: 'inventory',
        trigger: {
          type: 'threshold',
          config: { field: 'stock_quantity', threshold: 10, comparison: 'less_than' }
        },
        conditions: [
          { field: 'product_status', operator: 'equals', value: 'active' },
          { field: 'auto_reorder', operator: 'equals', value: true, logicalOperator: 'AND' }
        ],
        actions: [
          {
            type: 'email',
            config: { 
              to: 'inventory@company.com',
              subject: 'Alerte stock faible - {{product_name}}',
              template: 'low_stock_alert'
            },
            order: 1
          },
          {
            type: 'create_task',
            config: {
              title: 'Réapprovisionner {{product_name}}',
              assignee: 'inventory_manager',
              priority: 'high'
            },
            order: 2
          }
        ],
        status: 'active',
        priority: 'high',
        createdAt: '2024-01-15T10:00:00Z',
        lastExecuted: '2024-01-20T09:30:00Z',
        executionCount: 45,
        successRate: 98.5,
        estimatedSavings: 15000
      },
      {
        id: '2',
        name: 'Suivi client inactif',
        description: 'Identifie et relance automatiquement les clients inactifs depuis plus de 30 jours',
        category: 'customer',
        trigger: {
          type: 'schedule',
          config: { frequency: 'weekly', day: 'monday', time: '09:00' }
        },
        conditions: [
          { field: 'last_order_date', operator: 'less_than', value: '30_days_ago' },
          { field: 'customer_status', operator: 'equals', value: 'active', logicalOperator: 'AND' }
        ],
        actions: [
          {
            type: 'email',
            config: {
              to: '{{customer_email}}',
              subject: 'Nous vous avons manqué !',
              template: 'customer_reactivation'
            },
            order: 1
          },
          {
            type: 'update_record',
            config: {
              table: 'customers',
              field: 'last_contact_date',
              value: '{{current_date}}'
            },
            order: 2
          }
        ],
        status: 'active',
        priority: 'medium',
        createdAt: '2024-01-10T14:30:00Z',
        lastExecuted: '2024-01-15T09:00:00Z',
        executionCount: 12,
        successRate: 95.2,
        estimatedSavings: 8500
      },
      {
        id: '3',
        name: 'Validation commande importante',
        description: 'Demande une validation manuelle pour les commandes supérieures à 10 000 MAD',
        category: 'sales',
        trigger: {
          type: 'event',
          config: { event: 'order_created' }
        },
        conditions: [
          { field: 'order_total', operator: 'greater_than', value: 10000 }
        ],
        actions: [
          {
            type: 'notification',
            config: {
              to: 'sales_manager',
              message: 'Nouvelle commande importante nécessite validation: {{order_number}}',
              priority: 'high'
            },
            order: 1
          },
          {
            type: 'update_record',
            config: {
              table: 'orders',
              field: 'status',
              value: 'pending_approval'
            },
            order: 2
          }
        ],
        status: 'active',
        priority: 'critical',
        createdAt: '2024-01-08T11:15:00Z',
        lastExecuted: '2024-01-19T16:45:00Z',
        executionCount: 8,
        successRate: 100,
        estimatedSavings: 25000
      }
    ]

    const mockRecommendations: SmartRecommendation[] = [
      {
        id: '1',
        type: 'process_optimization',
        title: 'Automatiser la génération des factures',
        description: 'Implémentation d\'un système automatique de génération de factures pour réduire le temps de traitement de 75%',
        category: 'finance',
        impact: 'high',
        effort: 'medium',
        confidence: 92,
        estimatedBenefit: 35000,
        timeframe: '2-3 mois',
        prerequisites: [
          'Configuration des modèles de factures',
          'Intégration avec le système comptable',
          'Formation des équipes'
        ],
        steps: [
          {
            id: 'step1',
            title: 'Analyse des processus actuels',
            description: 'Cartographier les processus de facturation existants',
            estimatedTime: '1 semaine',
            dependencies: [],
            status: 'completed'
          },
          {
            id: 'step2',
            title: 'Développement du système',
            description: 'Créer les règles d\'automatisation',
            estimatedTime: '3 semaines',
            dependencies: ['step1'],
            status: 'in_progress'
          }
        ],
        status: 'approved',
        createdAt: '2024-01-18T10:00:00Z',
        aiModel: 'Process Optimizer v2.1'
      },
      {
        id: '2',
        type: 'cost_reduction',
        title: 'Optimisation des stocks par IA',
        description: 'Utilisation d\'algorithmes prédictifs pour optimiser les niveaux de stock et réduire les coûts de stockage',
        category: 'inventory',
        impact: 'high',
        effort: 'high',
        confidence: 87,
        estimatedBenefit: 45000,
        timeframe: '4-6 mois',
        prerequisites: [
          'Historique de données suffisant',
          'Intégration avec les fournisseurs',
          'Système de prévision avancé'
        ],
        steps: [
          {
            id: 'step1',
            title: 'Collecte et nettoyage des données',
            description: 'Préparer les données historiques pour l\'entraînement',
            estimatedTime: '2 semaines',
            dependencies: [],
            status: 'pending'
          }
        ],
        status: 'new',
        createdAt: '2024-01-19T14:30:00Z',
        aiModel: 'Inventory Optimizer v1.5'
      },
      {
        id: '3',
        type: 'revenue_increase',
        title: 'Recommandations produits personnalisées',
        description: 'Système de recommandations basé sur l\'IA pour augmenter les ventes croisées de 25%',
        category: 'sales',
        impact: 'medium',
        effort: 'medium',
        confidence: 78,
        estimatedBenefit: 28000,
        timeframe: '2-4 mois',
        prerequisites: [
          'Données comportementales clients',
          'Catalogue produits structuré',
          'Interface utilisateur adaptée'
        ],
        steps: [],
        status: 'reviewed',
        createdAt: '2024-01-17T09:20:00Z',
        aiModel: 'Recommendation Engine v3.0'
      }
    ]

    const mockExecutions: AutomationExecution[] = [
      {
        id: '1',
        ruleId: '1',
        ruleName: 'Alerte stock faible',
        status: 'completed',
        startedAt: '2024-01-20T09:30:00Z',
        completedAt: '2024-01-20T09:31:15Z',
        duration: 75,
        triggeredBy: 'system',
        actionsExecuted: 2,
        totalActions: 2,
        logs: [
          { timestamp: '2024-01-20T09:30:00Z', level: 'info', message: 'Déclenchement de la règle', action: 'trigger' },
          { timestamp: '2024-01-20T09:30:30Z', level: 'info', message: 'Email envoyé avec succès', action: 'email' },
          { timestamp: '2024-01-20T09:31:15Z', level: 'info', message: 'Tâche créée avec succès', action: 'create_task' }
        ]
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: 'Suivi client inactif',
        status: 'running',
        startedAt: '2024-01-20T11:00:00Z',
        triggeredBy: 'schedule',
        actionsExecuted: 1,
        totalActions: 2,
        logs: [
          { timestamp: '2024-01-20T11:00:00Z', level: 'info', message: 'Déclenchement programmé', action: 'trigger' },
          { timestamp: '2024-01-20T11:05:00Z', level: 'info', message: 'Traitement de 25 clients inactifs', action: 'email' }
        ]
      }
    ]

    setAutomationRules(mockRules)
    setSmartRecommendations(mockRecommendations)
    setAutomationExecutions(mockExecutions)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'inventory':
        return <Package className="h-4 w-4 text-green-500" />
      case 'customer':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'finance':
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      case 'operations':
        return <Activity className="h-4 w-4 text-orange-500" />
      case 'marketing':
        return <TrendingUp className="h-4 w-4 text-pink-500" />
      default:
        return <Zap className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>
      case 'inactive':
        return <Badge variant="neutral">Inactif</Badge>
      case 'paused':
        return <Badge variant="warning">Pausé</Badge>
      case 'error':
        return <Badge variant="error">Erreur</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="error">Critique</Badge>
      case 'high':
        return <Badge variant="warning">Élevée</Badge>
      case 'medium':
        return <Badge variant="info">Moyenne</Badge>
      default:
        return <Badge variant="neutral">Faible</Badge>
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

  const getRecommendationStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="info">Nouveau</Badge>
      case 'reviewed':
        return <Badge variant="warning">Examiné</Badge>
      case 'approved':
        return <Badge variant="success">Approuvé</Badge>
      case 'implemented':
        return <Badge variant="success">Implémenté</Badge>
      case 'rejected':
        return <Badge variant="error">Rejeté</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getExecutionStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="warning">En cours</Badge>
      case 'completed':
        return <Badge variant="success">Terminé</Badge>
      case 'failed':
        return <Badge variant="error">Échec</Badge>
      case 'cancelled':
        return <Badge variant="neutral">Annulé</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const handleViewRule = (rule: AutomationRule) => {
    setSelectedRule(rule)
    setShowRuleDialog(true)
  }

  const handleViewRecommendation = (recommendation: SmartRecommendation) => {
    setSelectedRecommendation(recommendation)
    setShowRecommendationDialog(true)
  }

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ))
  }

  const handleApproveRecommendation = (recommendationId: string) => {
    setSmartRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId ? { ...rec, status: 'approved' } : rec
    ))
  }

  const automationMetrics = useMemo(() => {
    const activeRules = automationRules.filter(r => r.status === 'active').length
    const totalExecutions = automationRules.reduce((acc, r) => acc + r.executionCount, 0)
    const averageSuccessRate = automationRules.reduce((acc, r) => acc + r.successRate, 0) / automationRules.length
    const totalSavings = automationRules.reduce((acc, r) => acc + r.estimatedSavings, 0)
    const newRecommendations = smartRecommendations.filter(r => r.status === 'new').length

    return {
      activeRules,
      totalExecutions,
      averageSuccessRate,
      totalSavings,
      newRecommendations
    }
  }, [automationRules, smartRecommendations])

  // Sample data for charts
  const executionTrends = [
    { name: 'Lun', executions: 45, success: 43, failed: 2 },
    { name: 'Mar', executions: 52, success: 50, failed: 2 },
    { name: 'Mer', executions: 38, success: 37, failed: 1 },
    { name: 'Jeu', executions: 61, success: 59, failed: 2 },
    { name: 'Ven', executions: 48, success: 46, failed: 2 },
    { name: 'Sam', executions: 35, success: 34, failed: 1 },
    { name: 'Dim', executions: 28, success: 28, failed: 0 },
  ]

  const savingsData = [
    { name: 'Jan', savings: 12000 },
    { name: 'Fév', savings: 15000 },
    { name: 'Mar', savings: 18000 },
    { name: 'Avr', savings: 22000 },
    { name: 'Mai', savings: 25000 },
    { name: 'Jun', savings: 28000 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automation Intelligente
          </h1>
          <p className="text-muted-foreground">
            Automatisation des processus et recommandations IA
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Assistant IA
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle règle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="h-4 w-4" /> },
          { id: 'rules', label: 'Règles', icon: <Workflow className="h-4 w-4" /> },
          { id: 'recommendations', label: 'Recommandations', icon: <Lightbulb className="h-4 w-4" /> },
          { id: 'executions', label: 'Exécutions', icon: <Play className="h-4 w-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Automation Metrics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Règles actives</h3>
                <p className="text-2xl font-bold text-success">{automationMetrics.activeRules}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Sur {automationRules.length} total</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <Activity className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Exécutions</h3>
                <p className="text-2xl font-bold text-info">{automationMetrics.totalExecutions}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total ce mois</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Taux de succès</h3>
                <p className="text-2xl font-bold text-warning">{automationMetrics.averageSuccessRate.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Moyenne globale</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Économies</h3>
                <p className="text-2xl font-bold text-purple-500">{formatCurrency(automationMetrics.totalSavings)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Estimées annuelles</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Recommandations</h3>
                <p className="text-2xl font-bold text-orange-500">{automationMetrics.newRecommendations}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Nouvelles</p>
          </Card>

          {/* Execution Trends Chart */}
          <Card className="p-6 md:col-span-2 lg:col-span-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendances d'exécution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10B981" name="Succès" />
                <Bar dataKey="failed" fill="#EF4444" name="Échecs" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Savings Chart */}
          <Card className="p-6 md:col-span-2 lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Économies mensuelles
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="savings" stroke="#8B5CF6" fill="#8B5CF6" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Recommendations */}
          <Card className="p-6 md:col-span-2 lg:col-span-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommandations récentes
            </h3>
            <div className="space-y-3">
              {smartRecommendations.slice(0, 3).map((recommendation) => (
                <div key={recommendation.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Brain className="h-5 w-5 text-info" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{recommendation.title}</span>
                      {getImpactBadge(recommendation.impact)}
                      {getRecommendationStatusBadge(recommendation.status)}
                      <Badge variant="info" className="text-xs">
                        {recommendation.confidence}% confiance
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bénéfice estimé: {formatCurrency(recommendation.estimatedBenefit)} • {recommendation.timeframe}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewRecommendation(recommendation)}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Règles d'automatisation</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Catégorie"
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'sales', label: 'Ventes' },
                  { value: 'inventory', label: 'Inventaire' },
                  { value: 'customer', label: 'Client' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'operations', label: 'Opérations' },
                ]}
              />
              <Select
                placeholder="Statut"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'active', label: 'Actif' },
                  { value: 'inactive', label: 'Inactif' },
                  { value: 'paused', label: 'Pausé' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(rule.category)}
                    <div>
                      <h4 className="font-semibold mb-1">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {rule.category} • {rule.trigger.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(rule.status)}
                    {getPriorityBadge(rule.priority)}
                  </div>
                </div>

                <p className="text-sm mb-4">{rule.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{rule.executionCount}</div>
                    <div className="text-xs text-muted-foreground">Exécutions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-success">{rule.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Succès</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-purple-500">{formatCurrency(rule.estimatedSavings)}</div>
                    <div className="text-xs text-muted-foreground">Économies</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conditions:</span>
                    <span>{rule.conditions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actions:</span>
                    <span>{rule.actions.length}</span>
                  </div>
                  {rule.lastExecuted && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dernière exécution:</span>
                      <span>{formatDate(rule.lastExecuted)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRule(rule)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    {rule.status === 'active' ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Activer
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recommandations IA</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Type"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'process_optimization', label: 'Optimisation' },
                  { value: 'cost_reduction', label: 'Réduction coûts' },
                  { value: 'revenue_increase', label: 'Augmentation revenus' },
                ]}
              />
              <Select
                placeholder="Impact"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'high', label: 'Élevé' },
                  { value: 'medium', label: 'Moyen' },
                  { value: 'low', label: 'Faible' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {smartRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-info" />
                    <div>
                      <h4 className="font-semibold mb-1">{recommendation.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.category} • {recommendation.aiModel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getImpactBadge(recommendation.impact)}
                    {getRecommendationStatusBadge(recommendation.status)}
                  </div>
                </div>

                <p className="text-sm mb-4">{recommendation.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-success">{formatCurrency(recommendation.estimatedBenefit)}</div>
                    <div className="text-xs text-muted-foreground">Bénéfice estimé</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-info">{recommendation.confidence}%</div>
                    <div className="text-xs text-muted-foreground">Confiance</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Effort:</span>
                    <Badge variant="outline" className="text-xs capitalize">{recommendation.effort}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Délai:</span>
                    <span>{recommendation.timeframe}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Étapes:</span>
                    <span>{recommendation.steps.length}</span>
                  </div>
                </div>

                {recommendation.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Prérequis:</div>
                    <div className="space-y-1">
                      {recommendation.prerequisites.slice(0, 2).map((prereq, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {prereq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRecommendation(recommendation)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  {recommendation.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveRecommendation(recommendation.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approuver
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rule Details Dialog */}
      {selectedRule && (
        <Dialog
          isOpen={showRuleDialog}
          onClose={() => setShowRuleDialog(false)}
          title="Détails de la règle d'automatisation"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="mt-1">{selectedRule.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedRule.category)}
                  <span className="capitalize">{selectedRule.category}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedRule.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <div className="mt-1">{getPriorityBadge(selectedRule.priority)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedRule.description}</p>
            </div>

            {/* Trigger Configuration */}
            <div>
              <label className="text-sm font-medium mb-3 block">Déclencheur</label>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium capitalize">{selectedRule.trigger.type}</span>
                </div>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(selectedRule.trigger.config, null, 2)}
                </pre>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <label className="text-sm font-medium mb-3 block">Conditions ({selectedRule.conditions.length})</label>
              <div className="space-y-2">
                {selectedRule.conditions.map((condition, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{condition.field}</span>
                      <Badge variant="outline" className="text-xs">{condition.operator}</Badge>
                      <span>{condition.value}</span>
                      {condition.logicalOperator && (
                        <Badge variant="info" className="text-xs">{condition.logicalOperator}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <label className="text-sm font-medium mb-3 block">Actions ({selectedRule.actions.length})</label>
              <div className="space-y-2">
                {selectedRule.actions.map((action, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">#{action.order}</span>
                      <Badge variant="outline" className="text-xs capitalize">{action.type}</Badge>
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(action.config, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{selectedRule.executionCount}</div>
                <div className="text-xs text-muted-foreground">Exécutions totales</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-success">{selectedRule.successRate}%</div>
                <div className="text-xs text-muted-foreground">Taux de succès</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-purple-500">{formatCurrency(selectedRule.estimatedSavings)}</div>
                <div className="text-xs text-muted-foreground">Économies estimées</div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Date de création</label>
                <p>{formatDate(selectedRule.createdAt)}</p>
              </div>
              {selectedRule.lastExecuted && (
                <div>
                  <label className="font-medium">Dernière exécution</label>
                  <p>{formatDate(selectedRule.lastExecuted)}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Recommendation Details Dialog */}
      {selectedRecommendation && (
        <Dialog
          isOpen={showRecommendationDialog}
          onClose={() => setShowRecommendationDialog(false)}
          title="Détails de la recommandation IA"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <p className="mt-1">{selectedRecommendation.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="mt-1 capitalize">{selectedRecommendation.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Impact</label>
                <div className="mt-1">{getImpactBadge(selectedRecommendation.impact)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Effort</label>
                <Badge variant="outline" className="mt-1 capitalize">{selectedRecommendation.effort}</Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedRecommendation.description}</p>
            </div>

            {/* Benefits & Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-success">{formatCurrency(selectedRecommendation.estimatedBenefit)}</div>
                <div className="text-xs text-muted-foreground">Bénéfice estimé</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-info">{selectedRecommendation.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confiance IA</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-warning">{selectedRecommendation.timeframe}</div>
                <div className="text-xs text-muted-foreground">Délai estimé</div>
              </div>
            </div>

            {/* Prerequisites */}
            {selectedRecommendation.prerequisites.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Prérequis</label>
                <div className="space-y-2">
                  {selectedRecommendation.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Implementation Steps */}
            {selectedRecommendation.steps.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Étapes d'implémentation</label>
                <div className="space-y-3">
                  {selectedRecommendation.steps.map((step, index) => (
                    <div key={step.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">#{index + 1} {step.title}</h4>
                        <Badge variant={
                          step.status === 'completed' ? 'success' :
                          step.status === 'in_progress' ? 'warning' :
                          step.status === 'blocked' ? 'error' : 'neutral'
                        }>
                          {step.status === 'completed' ? 'Terminé' :
                           step.status === 'in_progress' ? 'En cours' :
                           step.status === 'blocked' ? 'Bloqué' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Durée estimée: {step.estimatedTime}</span>
                        {step.dependencies.length > 0 && (
                          <span>Dépendances: {step.dependencies.length}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Model Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Modèle IA</label>
                <p>{selectedRecommendation.aiModel}</p>
              </div>
              <div>
                <label className="font-medium">Date de création</label>
                <p>{formatDate(selectedRecommendation.createdAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {selectedRecommendation.status === 'new' && (
                <>
                  <Button variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button onClick={() => handleApproveRecommendation(selectedRecommendation.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
