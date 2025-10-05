// AutoML Engine Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, Brain, Target, BarChart3, TrendingUp, Settings,
  Play, Pause, Square, RefreshCw, Download, Upload,
  CheckCircle, AlertTriangle, Clock, Database, Cpu,
  Layers, Eye, Filter, Search, Award, Sparkles
} from 'lucide-react';

interface AutoMLExperiment {
  id: string;
  name: string;
  description: string;
  taskType: 'classification' | 'regression' | 'forecasting' | 'clustering' | 'anomaly_detection';
  dataset: {
    name: string;
    size: number;
    features: number;
    target?: string;
    quality: number;
  };
  configuration: {
    timeLimit: number;
    modelTypes: string[];
    metricOptimization: string;
    crossValidation: number;
    featureEngineering: boolean;
    hyperparameterTuning: boolean;
    ensembleMethods: boolean;
  };
  status: 'created' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    currentStep: string;
    percentage: number;
    modelsEvaluated: number;
    bestScore: number;
    timeElapsed: number;
    estimatedTimeRemaining: number;
  };
  results?: {
    bestModel: ModelResult;
    leaderboard: ModelResult[];
    insights: string[];
    recommendations: string[];
  };
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

interface ModelResult {
  id: string;
  name: string;
  algorithm: string;
  score: number;
  metrics: { [key: string]: number };
  hyperparameters: { [key: string]: any };
  features: {
    selected: string[];
    engineered: string[];
    importance: { feature: string; importance: number }[];
  };
  crossValidationScore: number;
  trainingTime: number;
  inferenceTime: number;
  complexity: 'low' | 'medium' | 'high';
  interpretability: number;
}

interface DatasetProfile {
  id: string;
  name: string;
  description: string;
  size: number;
  features: number;
  rows: number;
  target?: string;
  taskType: string;
  quality: {
    score: number;
    missingValues: number;
    duplicates: number;
    outliers: number;
    dataTypes: { [key: string]: number };
  };
  statistics: {
    numerical: { feature: string; mean: number; std: number; min: number; max: number }[];
    categorical: { feature: string; unique: number; mode: string; frequency: number }[];
  };
  recommendations: string[];
  uploadedAt: string;
}

const AutoMLEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('experiments');
  const [experiments, setExperiments] = useState<AutoMLExperiment[]>([]);
  const [datasets, setDatasets] = useState<DatasetProfile[]>([]);
  const [showExperimentDialog, setShowExperimentDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<AutoMLExperiment | null>(null);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    taskType: 'classification',
    datasetId: '',
    timeLimit: 60,
    metricOptimization: 'accuracy'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock experiments
  const mockExperiments: AutoMLExperiment[] = [
    {
      id: 'exp_sales_forecast',
      name: 'Prévision des Ventes Q1 2025',
      description: 'Modèle de prévision des ventes basé sur les données historiques et saisonnalité',
      taskType: 'forecasting',
      dataset: {
        name: 'sales_data_2024.csv',
        size: 2.5,
        features: 15,
        target: 'monthly_sales',
        quality: 92.3
      },
      configuration: {
        timeLimit: 120,
        modelTypes: ['XGBoost', 'Random Forest', 'LSTM', 'Prophet'],
        metricOptimization: 'mape',
        crossValidation: 5,
        featureEngineering: true,
        hyperparameterTuning: true,
        ensembleMethods: true
      },
      status: 'completed',
      progress: {
        currentStep: 'Terminé',
        percentage: 100,
        modelsEvaluated: 47,
        bestScore: 94.2,
        timeElapsed: 118,
        estimatedTimeRemaining: 0
      },
      results: {
        bestModel: {
          id: 'model_xgb_001',
          name: 'XGBoost Optimisé',
          algorithm: 'XGBoost',
          score: 94.2,
          metrics: {
            mape: 5.8,
            rmse: 1250.5,
            mae: 890.2,
            r2: 0.942
          },
          hyperparameters: {
            n_estimators: 500,
            max_depth: 8,
            learning_rate: 0.05,
            subsample: 0.8
          },
          features: {
            selected: ['month', 'season', 'promotion', 'price', 'competitor_price'],
            engineered: ['price_ratio', 'seasonal_trend', 'moving_avg_3m'],
            importance: [
              { feature: 'seasonal_trend', importance: 0.35 },
              { feature: 'price_ratio', importance: 0.28 },
              { feature: 'promotion', importance: 0.22 },
              { feature: 'moving_avg_3m', importance: 0.15 }
            ]
          },
          crossValidationScore: 93.8,
          trainingTime: 45.2,
          inferenceTime: 2.1,
          complexity: 'medium',
          interpretability: 0.75
        },
        leaderboard: [
          {
            id: 'model_xgb_001',
            name: 'XGBoost Optimisé',
            algorithm: 'XGBoost',
            score: 94.2,
            metrics: { mape: 5.8, rmse: 1250.5 },
            hyperparameters: {},
            features: { selected: [], engineered: [], importance: [] },
            crossValidationScore: 93.8,
            trainingTime: 45.2,
            inferenceTime: 2.1,
            complexity: 'medium',
            interpretability: 0.75
          },
          {
            id: 'model_rf_002',
            name: 'Random Forest',
            algorithm: 'Random Forest',
            score: 91.7,
            metrics: { mape: 8.3, rmse: 1450.8 },
            hyperparameters: {},
            features: { selected: [], engineered: [], importance: [] },
            crossValidationScore: 91.2,
            trainingTime: 32.1,
            inferenceTime: 5.8,
            complexity: 'high',
            interpretability: 0.85
          },
          {
            id: 'model_lstm_003',
            name: 'LSTM Deep Learning',
            algorithm: 'LSTM',
            score: 89.4,
            metrics: { mape: 10.6, rmse: 1680.3 },
            hyperparameters: {},
            features: { selected: [], engineered: [], importance: [] },
            crossValidationScore: 88.9,
            trainingTime: 125.7,
            inferenceTime: 8.2,
            complexity: 'high',
            interpretability: 0.35
          }
        ],
        insights: [
          'La saisonnalité est le facteur le plus important pour la prévision',
          'L\'ingénierie de features a amélioré les performances de 12%',
          'Les méthodes d\'ensemble n\'ont pas apporté d\'amélioration significative'
        ],
        recommendations: [
          'Déployer le modèle XGBoost en production',
          'Mettre à jour les données mensuellement',
          'Surveiller la dérive des données'
        ]
      },
      createdAt: '2024-12-18T09:00:00Z',
      completedAt: '2024-12-18T11:00:00Z',
      createdBy: 'data-scientist@company.com'
    },
    {
      id: 'exp_customer_churn',
      name: 'Prédiction de Churn Client',
      description: 'Identification des clients à risque de désabonnement',
      taskType: 'classification',
      dataset: {
        name: 'customer_behavior.csv',
        size: 1.8,
        features: 22,
        target: 'churn',
        quality: 87.5
      },
      configuration: {
        timeLimit: 90,
        modelTypes: ['Logistic Regression', 'XGBoost', 'Neural Network'],
        metricOptimization: 'f1_score',
        crossValidation: 10,
        featureEngineering: true,
        hyperparameterTuning: true,
        ensembleMethods: false
      },
      status: 'running',
      progress: {
        currentStep: 'Optimisation hyperparamètres',
        percentage: 65,
        modelsEvaluated: 23,
        bestScore: 87.3,
        timeElapsed: 58,
        estimatedTimeRemaining: 32
      },
      createdAt: '2024-12-20T14:30:00Z',
      createdBy: 'ml-engineer@company.com'
    },
    {
      id: 'exp_inventory_optimization',
      name: 'Optimisation des Stocks',
      description: 'Prédiction des niveaux de stock optimaux par produit',
      taskType: 'regression',
      dataset: {
        name: 'inventory_history.csv',
        size: 3.2,
        features: 18,
        target: 'optimal_stock_level',
        quality: 94.1
      },
      configuration: {
        timeLimit: 150,
        modelTypes: ['Linear Regression', 'XGBoost', 'Random Forest', 'SVR'],
        metricOptimization: 'rmse',
        crossValidation: 5,
        featureEngineering: true,
        hyperparameterTuning: true,
        ensembleMethods: true
      },
      status: 'created',
      progress: {
        currentStep: 'En attente',
        percentage: 0,
        modelsEvaluated: 0,
        bestScore: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: 150
      },
      createdAt: '2024-12-20T16:00:00Z',
      createdBy: 'supply-chain@company.com'
    }
  ];

  // Mock datasets
  const mockDatasets: DatasetProfile[] = [
    {
      id: 'dataset_sales',
      name: 'sales_data_2024.csv',
      description: 'Données de ventes mensuelles avec facteurs externes',
      size: 2.5,
      features: 15,
      rows: 12000,
      target: 'monthly_sales',
      taskType: 'forecasting',
      quality: {
        score: 92.3,
        missingValues: 2.1,
        duplicates: 0.3,
        outliers: 1.8,
        dataTypes: { numerical: 12, categorical: 3 }
      },
      statistics: {
        numerical: [
          { feature: 'monthly_sales', mean: 125000, std: 35000, min: 45000, max: 280000 },
          { feature: 'price', mean: 49.99, std: 15.20, min: 19.99, max: 99.99 },
          { feature: 'promotion_discount', mean: 12.5, std: 8.3, min: 0, max: 50 }
        ],
        categorical: [
          { feature: 'season', unique: 4, mode: 'summer', frequency: 3000 },
          { feature: 'product_category', unique: 8, mode: 'electronics', frequency: 4500 },
          { feature: 'region', unique: 5, mode: 'north', frequency: 2800 }
        ]
      },
      recommendations: [
        'Qualité des données excellente',
        'Peu de valeurs manquantes à traiter',
        'Données bien équilibrées par catégorie'
      ],
      uploadedAt: '2024-12-15T10:30:00Z'
    },
    {
      id: 'dataset_customers',
      name: 'customer_behavior.csv',
      description: 'Comportement et caractéristiques des clients',
      size: 1.8,
      features: 22,
      rows: 8500,
      target: 'churn',
      taskType: 'classification',
      quality: {
        score: 87.5,
        missingValues: 5.2,
        duplicates: 1.1,
        outliers: 3.4,
        dataTypes: { numerical: 16, categorical: 6 }
      },
      statistics: {
        numerical: [
          { feature: 'age', mean: 42.3, std: 12.8, min: 18, max: 75 },
          { feature: 'monthly_spend', mean: 89.50, std: 45.20, min: 10.00, max: 500.00 },
          { feature: 'tenure_months', mean: 24.5, std: 18.2, min: 1, max: 72 }
        ],
        categorical: [
          { feature: 'subscription_type', unique: 3, mode: 'premium', frequency: 3400 },
          { feature: 'payment_method', unique: 4, mode: 'credit_card', frequency: 4200 },
          { feature: 'support_tickets', unique: 6, mode: '0', frequency: 5100 }
        ]
      },
      recommendations: [
        'Traiter les valeurs manquantes dans les features de comportement',
        'Considérer l\'équilibrage des classes (churn vs non-churn)',
        'Analyser les outliers dans monthly_spend'
      ],
      uploadedAt: '2024-12-18T14:20:00Z'
    }
  ];

  useEffect(() => {
    setExperiments(mockExperiments);
    setDatasets(mockDatasets);
    setIsLoading(false);
  }, []);

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'classification': return <Target className="h-4 w-4" />;
      case 'regression': return <TrendingUp className="h-4 w-4" />;
      case 'forecasting': return <BarChart3 className="h-4 w-4" />;
      case 'clustering': return <Layers className="h-4 w-4" />;
      case 'anomaly_detection': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      case 'created': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const startExperiment = (experimentId: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { ...exp, status: 'running', progress: { ...exp.progress, currentStep: 'Préparation des données', percentage: 5 } }
        : exp
    ));
  };

  const stopExperiment = (experimentId: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId 
        ? { ...exp, status: 'cancelled' }
        : exp
    ));
  };

  const renderExperimentCard = (experiment: AutoMLExperiment) => {
    return (
      <Card key={experiment.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getTaskTypeIcon(experiment.taskType)}
              </div>
              <div>
                <CardTitle className="text-lg">{experiment.name}</CardTitle>
                <CardDescription className="text-sm">
                  {experiment.taskType} • {experiment.dataset.name}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(experiment.status)}>
              {experiment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{experiment.description}</p>
            
            {/* Progress */}
            {experiment.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{experiment.progress.currentStep}</span>
                  <span>{experiment.progress.percentage}%</span>
                </div>
                <Progress value={experiment.progress.percentage} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>Modèles évalués: {experiment.progress.modelsEvaluated}</div>
                  <div>Meilleur score: {experiment.progress.bestScore.toFixed(1)}%</div>
                  <div>Temps écoulé: {experiment.progress.timeElapsed}min</div>
                  <div>Temps restant: {experiment.progress.estimatedTimeRemaining}min</div>
                </div>
              </div>
            )}

            {/* Results summary */}
            {experiment.results && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Meilleur Modèle</div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{experiment.results.bestModel.name}</span>
                    <Badge className="text-green-600 bg-green-100">
                      Score: {experiment.results.bestModel.score.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    Algorithme: {experiment.results.bestModel.algorithm} • 
                    Complexité: {experiment.results.bestModel.complexity} • 
                    Inférence: {experiment.results.bestModel.inferenceTime}ms
                  </div>
                </div>
              </div>
            )}

            {/* Dataset info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{experiment.dataset.features}</div>
                <div className="text-gray-500">Features</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{experiment.dataset.size}MB</div>
                <div className="text-gray-500">Taille</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{experiment.dataset.quality.toFixed(1)}%</div>
                <div className="text-gray-500">Qualité</div>
              </div>
            </div>

            {/* Configuration */}
            <div className="text-xs text-gray-600 space-y-1">
              <div>Limite de temps: {experiment.configuration.timeLimit}min</div>
              <div>Métrique: {experiment.configuration.metricOptimization}</div>
              <div>Validation croisée: {experiment.configuration.crossValidation}-fold</div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              {experiment.status === 'created' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => startExperiment(experiment.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Démarrer
                </Button>
              )}
              {experiment.status === 'running' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => stopExperiment(experiment.id)}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Arrêter
                </Button>
              )}
              {experiment.status === 'completed' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedExperiment(experiment)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Résultats
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Créé par: {experiment.createdBy}</div>
              <div>Date: {new Date(experiment.createdAt).toLocaleDateString('fr-FR')}</div>
              {experiment.completedAt && (
                <div>Terminé: {new Date(experiment.completedAt).toLocaleDateString('fr-FR')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDatasetCard = (dataset: DatasetProfile) => {
    return (
      <Card key={dataset.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{dataset.name}</CardTitle>
                <CardDescription className="text-sm">
                  {dataset.taskType} • {dataset.rows.toLocaleString()} lignes
                </CardDescription>
              </div>
            </div>
            <Badge className={
              dataset.quality.score >= 90 ? 'text-green-600 bg-green-50' :
              dataset.quality.score >= 70 ? 'text-yellow-600 bg-yellow-50' :
              'text-red-600 bg-red-50'
            }>
              Qualité: {dataset.quality.score.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{dataset.description}</p>
            
            {/* Dataset stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{dataset.features}</div>
                <div className="text-gray-500">Features</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{dataset.size}MB</div>
                <div className="text-gray-500">Taille</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{dataset.rows.toLocaleString()}</div>
                <div className="text-gray-500">Lignes</div>
              </div>
            </div>

            {/* Data quality issues */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Qualité des Données</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Valeurs manquantes:</span>
                  <span className={dataset.quality.missingValues > 5 ? 'text-red-600' : 'text-green-600'}>
                    {dataset.quality.missingValues.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Doublons:</span>
                  <span className={dataset.quality.duplicates > 2 ? 'text-red-600' : 'text-green-600'}>
                    {dataset.quality.duplicates.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Outliers:</span>
                  <span className={dataset.quality.outliers > 5 ? 'text-red-600' : 'text-green-600'}>
                    {dataset.quality.outliers.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Types de données:</span>
                  <span>{dataset.quality.dataTypes.numerical}N / {dataset.quality.dataTypes.categorical}C</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {dataset.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommandations</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {dataset.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-blue-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Zap className="h-3 w-3 mr-1" />
                Nouvelle Expérience
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3" />
              </Button>
            </div>

            {/* Upload info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              Téléchargé le {new Date(dataset.uploadedAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExperimentResults = () => {
    if (!selectedExperiment?.results) return null;

    const { bestModel, leaderboard, insights, recommendations } = selectedExperiment.results;

    return (
      <Dialog open={!!selectedExperiment} onOpenChange={() => setSelectedExperiment(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedExperiment.name}</DialogTitle>
            <DialogDescription>Résultats de l'expérience AutoML</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Best model overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-3">Meilleur Modèle</h3>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{bestModel.name}</h4>
                        <p className="text-sm text-gray-600">{bestModel.algorithm}</p>
                      </div>
                      <Badge className="text-green-600 bg-green-100">
                        Score: {bestModel.score.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Validation croisée:</span>
                        <div className="font-medium">{bestModel.crossValidationScore.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Temps d'entraînement:</span>
                        <div className="font-medium">{bestModel.trainingTime.toFixed(1)}min</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Temps d'inférence:</span>
                        <div className="font-medium">{bestModel.inferenceTime.toFixed(1)}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Complexité:</span>
                        <Badge className={getComplexityColor(bestModel.complexity)}>
                          {bestModel.complexity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Métriques</h3>
                <div className="space-y-3">
                  {Object.entries(bestModel.metrics).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{metric.replace('_', ' ')}:</span>
                      <span className="font-medium">{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature importance */}
            <div>
              <h3 className="text-lg font-medium mb-3">Importance des Features</h3>
              <div className="space-y-2">
                {bestModel.features.importance.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm w-32">{feature.feature}:</span>
                    <Progress value={feature.importance * 100} className="flex-1 h-2" />
                    <span className="text-sm w-12">{(feature.importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <h3 className="text-lg font-medium mb-3">Classement des Modèles</h3>
              <div className="space-y-2">
                {leaderboard.map((model, index) => (
                  <div key={model.id} className={`p-3 rounded-lg border ${
                    index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                        <div>
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({model.algorithm})</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Score: {model.score.toFixed(1)}%</span>
                        <span>CV: {model.crossValidationScore.toFixed(1)}%</span>
                        <Badge className={getComplexityColor(model.complexity)}>
                          {model.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights and recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Insights</h3>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recommandations</h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le Modèle
              </Button>
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Déployer en Production
              </Button>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Relancer l'Expérience
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderOverviewStats = () => {
    const totalExperiments = experiments.length;
    const runningExperiments = experiments.filter(e => e.status === 'running').length;
    const completedExperiments = experiments.filter(e => e.status === 'completed').length;
    const avgScore = experiments
      .filter(e => e.results)
      .reduce((sum, e) => sum + e.results!.bestModel.score, 0) / 
      experiments.filter(e => e.results).length || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expériences Totales</p>
                <p className="text-2xl font-bold">{totalExperiments}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-blue-600">{runningExperiments}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{completedExperiments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Moyen</p>
                <p className="text-2xl font-bold text-purple-600">{avgScore.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
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
          <h1 className="text-3xl font-bold text-gray-900">AutoML Engine</h1>
          <p className="text-gray-600">Automatisez la création et l'optimisation de modèles ML</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer Dataset
          </Button>
          <Button size="sm" onClick={() => setShowExperimentDialog(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Nouvelle Expérience
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">Expériences</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map(renderExperimentCard)}
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map(renderDatasetCard)}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modèles Générés</CardTitle>
              <CardDescription>Modèles créés par AutoML prêts pour le déploiement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4" />
                <p>Bibliothèque de modèles en cours de développement</p>
                <p className="text-sm">Gestion et déploiement des modèles optimisés</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses AutoML</CardTitle>
              <CardDescription>Métriques de performance et comparaisons d'expériences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses avancées en cours de développement</p>
                <p className="text-sm">Comparaisons d'expériences et optimisation des hyperparamètres</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderExperimentResults()}
    </div>
  );
};

export default AutoMLEngine;
