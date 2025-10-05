import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Cpu,
  Brain,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Target,
  BarChart3,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  LineChart,
  PieChart,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, formatPercentage } from '@/lib/utils'
import { ResponsiveContainer, LineChart as RechartsLineChart, AreaChart, BarChart, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Line, Scatter, Cell } from 'recharts'

interface MLModel {
  id: string
  name: string
  type: 'demand_forecast' | 'sales_prediction' | 'churn_prediction' | 'price_optimization' | 'inventory_optimization' | 'anomaly_detection' | 'customer_segmentation'
  description: string
  status: 'training' | 'active' | 'inactive' | 'error' | 'pending'
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastTrained: string
  nextTraining?: string
  trainingData: {
    samples: number
    features: number
    timeRange: string
  }
  hyperparameters: Record<string, any>
  metrics: ModelMetric[]
  predictions: ModelPrediction[]
  version: string
  deployedAt?: string
}

interface ModelMetric {
  name: string
  value: number
  trend: 'up' | 'down' | 'stable'
  benchmark?: number
}

interface ModelPrediction {
  id: string
  timestamp: string
  input: Record<string, any>
  output: Record<string, any>
  confidence: number
  actualOutcome?: Record<string, any>
  accuracy?: number
}

interface TrainingJob {
  id: string
  modelId: string
  modelName: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startedAt: string
  completedAt?: string
  duration?: number
  logs: TrainingLog[]
  config: TrainingConfig
}

interface TrainingLog {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
}

interface TrainingConfig {
  algorithm: string
  epochs: number
  batchSize: number
  learningRate: number
  validationSplit: number
  earlyStoppingPatience: number
}

export function MachineLearningModels() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'models' | 'training' | 'predictions' | 'performance' | 'deployment'>('models')
  const [mlModels, setMLModels] = useState<MLModel[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null)
  const [showModelDialog, setShowModelDialog] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockModels: MLModel[] = [
      {
        id: '1',
        name: 'Prévision de la demande',
        type: 'demand_forecast',
        description: 'Modèle de prévision de la demande basé sur les données historiques, la saisonnalité et les tendances du marché',
        status: 'active',
        accuracy: 89.5,
        precision: 87.2,
        recall: 91.8,
        f1Score: 89.4,
        lastTrained: '2024-01-19T14:30:00Z',
        nextTraining: '2024-01-26T14:30:00Z',
        trainingData: {
          samples: 50000,
          features: 25,
          timeRange: '2 ans'
        },
        hyperparameters: {
          algorithm: 'Random Forest',
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5
        },
        metrics: [
          { name: 'MAE', value: 125.5, trend: 'down', benchmark: 150 },
          { name: 'RMSE', value: 189.2, trend: 'down', benchmark: 220 },
          { name: 'MAPE', value: 8.5, trend: 'stable', benchmark: 10 }
        ],
        predictions: [
          {
            id: 'pred1',
            timestamp: '2024-01-20T10:00:00Z',
            input: { product: 'Laptop HP', month: 'Février', historical_avg: 150 },
            output: { predicted_demand: 175, confidence_interval: [160, 190] },
            confidence: 87
          }
        ],
        version: '2.1.0',
        deployedAt: '2024-01-19T15:00:00Z'
      },
      {
        id: '2',
        name: 'Prédiction de churn client',
        type: 'churn_prediction',
        description: 'Modèle de classification pour identifier les clients à risque de désabonnement',
        status: 'active',
        accuracy: 84.7,
        precision: 82.1,
        recall: 87.3,
        f1Score: 84.6,
        lastTrained: '2024-01-18T09:15:00Z',
        nextTraining: '2024-01-25T09:15:00Z',
        trainingData: {
          samples: 25000,
          features: 18,
          timeRange: '18 mois'
        },
        hyperparameters: {
          algorithm: 'XGBoost',
          max_depth: 6,
          learning_rate: 0.1,
          n_estimators: 200
        },
        metrics: [
          { name: 'AUC-ROC', value: 0.89, trend: 'up', benchmark: 0.85 },
          { name: 'Precision', value: 82.1, trend: 'stable' },
          { name: 'Recall', value: 87.3, trend: 'up' }
        ],
        predictions: [
          {
            id: 'pred2',
            timestamp: '2024-01-20T11:30:00Z',
            input: { customer_id: 'CUST001', last_purchase: 45, support_tickets: 3 },
            output: { churn_probability: 0.78, risk_level: 'high' },
            confidence: 84
          }
        ],
        version: '1.8.2',
        deployedAt: '2024-01-18T10:00:00Z'
      },
      {
        id: '3',
        name: 'Segmentation client',
        type: 'customer_segmentation',
        description: 'Modèle de clustering pour segmenter automatiquement la base client',
        status: 'training',
        accuracy: 76.3,
        precision: 74.8,
        recall: 78.1,
        f1Score: 76.4,
        lastTrained: '2024-01-15T16:45:00Z',
        trainingData: {
          samples: 15000,
          features: 22,
          timeRange: '1 an'
        },
        hyperparameters: {
          algorithm: 'K-Means',
          n_clusters: 5,
          max_iter: 300,
          tol: 0.0001
        },
        metrics: [
          { name: 'Silhouette Score', value: 0.72, trend: 'up', benchmark: 0.65 },
          { name: 'Inertia', value: 1250.5, trend: 'down' },
          { name: 'Calinski-Harabasz', value: 485.2, trend: 'up' }
        ],
        predictions: [],
        version: '1.3.1'
      },
      {
        id: '4',
        name: 'Détection d\'anomalies',
        type: 'anomaly_detection',
        description: 'Modèle de détection d\'anomalies dans les transactions et comportements',
        status: 'active',
        accuracy: 92.1,
        precision: 89.5,
        recall: 94.8,
        f1Score: 92.1,
        lastTrained: '2024-01-17T11:20:00Z',
        nextTraining: '2024-01-24T11:20:00Z',
        trainingData: {
          samples: 100000,
          features: 15,
          timeRange: '6 mois'
        },
        hyperparameters: {
          algorithm: 'Isolation Forest',
          contamination: 0.1,
          n_estimators: 100,
          max_samples: 256
        },
        metrics: [
          { name: 'Precision', value: 89.5, trend: 'up', benchmark: 85 },
          { name: 'Recall', value: 94.8, trend: 'stable' },
          { name: 'F1-Score', value: 92.1, trend: 'up' }
        ],
        predictions: [
          {
            id: 'pred3',
            timestamp: '2024-01-20T14:15:00Z',
            input: { transaction_amount: 15000, time: '02:30', location: 'Casablanca' },
            output: { anomaly_score: 0.85, is_anomaly: true },
            confidence: 92
          }
        ],
        version: '3.0.1',
        deployedAt: '2024-01-17T12:00:00Z'
      }
    ]

    const mockTrainingJobs: TrainingJob[] = [
      {
        id: '1',
        modelId: '3',
        modelName: 'Segmentation client',
        status: 'running',
        progress: 65,
        startedAt: '2024-01-20T09:00:00Z',
        logs: [
          { timestamp: '2024-01-20T09:00:00Z', level: 'info', message: 'Début de l\'entraînement du modèle' },
          { timestamp: '2024-01-20T09:15:00Z', level: 'info', message: 'Préparation des données terminée' },
          { timestamp: '2024-01-20T09:30:00Z', level: 'info', message: 'Époque 1/10 terminée - Loss: 0.245' },
          { timestamp: '2024-01-20T10:00:00Z', level: 'warning', message: 'Convergence lente détectée' }
        ],
        config: {
          algorithm: 'K-Means',
          epochs: 10,
          batchSize: 32,
          learningRate: 0.001,
          validationSplit: 0.2,
          earlyStoppingPatience: 5
        }
      },
      {
        id: '2',
        modelId: '1',
        modelName: 'Prévision de la demande',
        status: 'completed',
        progress: 100,
        startedAt: '2024-01-19T14:00:00Z',
        completedAt: '2024-01-19T14:30:00Z',
        duration: 30,
        logs: [
          { timestamp: '2024-01-19T14:00:00Z', level: 'info', message: 'Début de l\'entraînement' },
          { timestamp: '2024-01-19T14:30:00Z', level: 'info', message: 'Entraînement terminé avec succès' }
        ],
        config: {
          algorithm: 'Random Forest',
          epochs: 100,
          batchSize: 64,
          learningRate: 0.01,
          validationSplit: 0.2,
          earlyStoppingPatience: 10
        }
      }
    ]

    setMLModels(mockModels)
    setTrainingJobs(mockTrainingJobs)
  }, [])

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'demand_forecast':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'sales_prediction':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'churn_prediction':
        return <Users className="h-4 w-4 text-red-500" />
      case 'price_optimization':
        return <Target className="h-4 w-4 text-purple-500" />
      case 'inventory_optimization':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'anomaly_detection':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'customer_segmentation':
        return <PieChart className="h-4 w-4 text-indigo-500" />
      default:
        return <Brain className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>
      case 'training':
        return <Badge variant="warning">Entraînement</Badge>
      case 'inactive':
        return <Badge variant="neutral">Inactif</Badge>
      case 'error':
        return <Badge variant="error">Erreur</Badge>
      case 'pending':
        return <Badge variant="info">En attente</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getTrainingStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="warning">En cours</Badge>
      case 'completed':
        return <Badge variant="success">Terminé</Badge>
      case 'failed':
        return <Badge variant="error">Échec</Badge>
      case 'cancelled':
        return <Badge variant="neutral">Annulé</Badge>
      case 'queued':
        return <Badge variant="info">En file</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-error rotate-180" />
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />
    }
  }

  const handleViewModel = (model: MLModel) => {
    setSelectedModel(model)
    setShowModelDialog(true)
  }

  const handleStartTraining = (modelId: string) => {
    console.log('Starting training for model:', modelId)
    // Implementation would start model training
  }

  const handleStopTraining = (jobId: string) => {
    console.log('Stopping training job:', jobId)
    // Implementation would stop training job
  }

  const handleDeployModel = (modelId: string) => {
    console.log('Deploying model:', modelId)
    // Implementation would deploy model to production
  }

  const activeModels = mlModels.filter(m => m.status === 'active').length
  const trainingModels = mlModels.filter(m => m.status === 'training').length
  const averageAccuracy = mlModels.reduce((acc, m) => acc + m.accuracy, 0) / mlModels.length

  // Sample data for performance charts
  const performanceData = [
    { name: 'Sem 1', accuracy: 85, precision: 83, recall: 87 },
    { name: 'Sem 2', accuracy: 87, precision: 85, recall: 89 },
    { name: 'Sem 3', accuracy: 89, precision: 87, recall: 91 },
    { name: 'Sem 4', accuracy: 88, precision: 86, recall: 90 },
  ]

  const modelDistribution = [
    { name: 'Prédiction', value: mlModels.filter(m => m.type.includes('prediction')).length, color: '#3B82F6' },
    { name: 'Classification', value: mlModels.filter(m => m.type.includes('churn') || m.type.includes('segmentation')).length, color: '#10B981' },
    { name: 'Optimisation', value: mlModels.filter(m => m.type.includes('optimization')).length, color: '#F59E0B' },
    { name: 'Détection', value: mlModels.filter(m => m.type.includes('detection')).length, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            Modèles Machine Learning
          </h1>
          <p className="text-muted-foreground">
            Gestion et monitoring des modèles d'apprentissage automatique
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer modèle
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau modèle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'models', label: 'Modèles', icon: <Brain className="h-4 w-4" /> },
          { id: 'training', label: 'Entraînement', icon: <Activity className="h-4 w-4" /> },
          { id: 'predictions', label: 'Prédictions', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'performance', label: 'Performance', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'deployment', label: 'Déploiement', icon: <Zap className="h-4 w-4" /> },
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

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Modèles actifs</h3>
                  <p className="text-2xl font-bold text-success">{activeModels}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">En production</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">En entraînement</h3>
                  <p className="text-2xl font-bold text-warning">{trainingModels}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Modèles en cours</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-info/10 rounded-lg">
                  <Target className="h-5 w-5 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold">Précision moyenne</h3>
                  <p className="text-2xl font-bold text-info">{averageAccuracy.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Tous modèles</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple/10 rounded-lg">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Total modèles</h3>
                  <p className="text-2xl font-bold text-purple-500">{mlModels.length}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Dans le système</p>
            </Card>
          </div>

          {/* Models List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mlModels.map((model) => (
              <Card key={model.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getModelIcon(model.type)}
                    <div>
                      <h4 className="font-semibold mb-1">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {model.type.replace('_', ' ')} • v{model.version}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(model.status)}
                </div>

                <p className="text-sm mb-4">{model.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-success">{model.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Précision</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-info">{model.f1Score}%</div>
                    <div className="text-xs text-muted-foreground">F1-Score</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière formation:</span>
                    <span>{formatDate(model.lastTrained)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Échantillons:</span>
                    <span>{model.trainingData.samples.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Algorithme:</span>
                    <span>{model.hyperparameters.algorithm}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewModel(model)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                  {model.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartTraining(model.id)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Réentraîner
                    </Button>
                  )}
                  {model.status === 'inactive' && (
                    <Button
                      size="sm"
                      onClick={() => handleDeployModel(model.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Déployer
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tâches d'entraînement</h3>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Nouveau entraînement
            </Button>
          </div>

          <div className="space-y-4">
            {trainingJobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-1">{job.modelName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Algorithme: {job.config.algorithm} • Démarré: {formatDate(job.startedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrainingStatusBadge(job.status)}
                    {job.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopTraining(job.id)}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Arrêter
                      </Button>
                    )}
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-info h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Époques:</span>
                    <span className="font-medium ml-1">{job.config.epochs}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Batch Size:</span>
                    <span className="font-medium ml-1">{job.config.batchSize}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Learning Rate:</span>
                    <span className="font-medium ml-1">{job.config.learningRate}</span>
                  </div>
                  {job.duration && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Durée:</span>
                      <span className="font-medium ml-1">{job.duration}min</span>
                    </div>
                  )}
                </div>

                {job.logs.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Logs récents</h5>
                    <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {job.logs.slice(-3).map((log, index) => (
                        <div key={index} className="text-sm mb-1 last:mb-0">
                          <span className="text-muted-foreground text-xs">
                            {formatDate(log.timestamp)}
                          </span>
                          <span className={`ml-2 ${
                            log.level === 'error' ? 'text-error' :
                            log.level === 'warning' ? 'text-warning' : 'text-foreground'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Tendances de performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2} name="Précision" />
                  <Line type="monotone" dataKey="precision" stroke="#10B981" strokeWidth={2} name="Precision" />
                  <Line type="monotone" dataKey="recall" stroke="#F59E0B" strokeWidth={2} name="Recall" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </Card>

            {/* Model Distribution */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribution des modèles
              </h3>
              <div className="space-y-4">
                {modelDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Model Performance Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Performance détaillée des modèles</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Modèle</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Précision</th>
                    <th className="text-left p-3">Precision</th>
                    <th className="text-left p-3">Recall</th>
                    <th className="text-left p-3">F1-Score</th>
                    <th className="text-left p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {mlModels.map((model) => (
                    <tr key={model.id} className="border-b border-border">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getModelIcon(model.type)}
                          <span className="font-medium">{model.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm capitalize">{model.type.replace('_', ' ')}</td>
                      <td className="p-3">
                        <span className="font-medium">{model.accuracy}%</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{model.precision}%</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{model.recall}%</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{model.f1Score}%</span>
                      </td>
                      <td className="p-3">{getStatusBadge(model.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Model Details Dialog */}
      {selectedModel && (
        <Dialog
          isOpen={showModelDialog}
          onClose={() => setShowModelDialog(false)}
          title="Détails du modèle ML"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="mt-1">{selectedModel.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getModelIcon(selectedModel.type)}
                  <span className="capitalize">{selectedModel.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <p className="mt-1">{selectedModel.version}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedModel.status)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedModel.description}</p>
            </div>

            {/* Performance Metrics */}
            <div>
              <label className="text-sm font-medium mb-3 block">Métriques de performance</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-success">{selectedModel.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Précision</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-info">{selectedModel.precision}%</div>
                  <div className="text-xs text-muted-foreground">Precision</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-warning">{selectedModel.recall}%</div>
                  <div className="text-xs text-muted-foreground">Recall</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-500">{selectedModel.f1Score}%</div>
                  <div className="text-xs text-muted-foreground">F1-Score</div>
                </div>
              </div>
            </div>

            {/* Training Data */}
            <div>
              <label className="text-sm font-medium mb-3 block">Données d'entraînement</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{selectedModel.trainingData.samples.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Échantillons</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{selectedModel.trainingData.features}</div>
                  <div className="text-xs text-muted-foreground">Caractéristiques</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{selectedModel.trainingData.timeRange}</div>
                  <div className="text-xs text-muted-foreground">Période</div>
                </div>
              </div>
            </div>

            {/* Hyperparameters */}
            <div>
              <label className="text-sm font-medium mb-3 block">Hyperparamètres</label>
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(selectedModel.hyperparameters, null, 2)}
                </pre>
              </div>
            </div>

            {/* Model Metrics */}
            {selectedModel.metrics.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Métriques détaillées</label>
                <div className="space-y-2">
                  {selectedModel.metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{metric.value}</div>
                        {metric.benchmark && (
                          <div className="text-xs text-muted-foreground">
                            Benchmark: {metric.benchmark}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Predictions */}
            {selectedModel.predictions.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Prédictions récentes</label>
                <div className="space-y-2">
                  {selectedModel.predictions.slice(0, 3).map((prediction) => (
                    <div key={prediction.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Prédiction {prediction.id}</span>
                        <Badge variant="info">{prediction.confidence}% confiance</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(prediction.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter modèle
              </Button>
              {selectedModel.status === 'active' && (
                <Button onClick={() => handleStartTraining(selectedModel.id)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réentraîner
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
