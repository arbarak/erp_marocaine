// Predictive Analytics Engine Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, TrendingDown, BarChart3, LineChart, Target,
  Brain, Zap, Eye, Settings, RefreshCw, Download, Calendar,
  AlertTriangle, CheckCircle, Clock, Users, DollarSign,
  Package, ShoppingCart, Award, Sparkles, Filter, Search
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface PredictionModel {
  id: string;
  name: string;
  type: 'sales_forecast' | 'demand_prediction' | 'churn_prediction' | 'price_optimization' | 'inventory_optimization';
  description: string;
  algorithm: string;
  accuracy: number;
  confidence: number;
  lastTrained: string;
  nextUpdate: string;
  status: 'active' | 'training' | 'inactive' | 'error';
  features: string[];
  targetVariable: string;
  timeHorizon: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly';
}

interface Prediction {
  id: string;
  modelId: string;
  modelName: string;
  type: string;
  target: string;
  predictions: PredictionPoint[];
  confidence: number;
  accuracy: number;
  generatedAt: string;
  validUntil: string;
  scenarios: Scenario[];
  insights: string[];
  recommendations: string[];
}

interface PredictionPoint {
  date: string;
  predicted: number;
  actual?: number;
  confidence_lower: number;
  confidence_upper: number;
  factors: { [key: string]: number };
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'optimistic' | 'realistic' | 'pessimistic' | 'custom';
  adjustments: { [key: string]: number };
  impact: number;
  probability: number;
}

interface ForecastAlert {
  id: string;
  type: 'trend_change' | 'anomaly_predicted' | 'target_miss' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  prediction: string;
  impact: number;
  probability: number;
  timeframe: string;
  actionable: boolean;
  recommendations: string[];
}

const PredictiveAnalyticsEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forecasts');
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<ForecastAlert[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [timeHorizon, setTimeHorizon] = useState('30d');
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [isLoading, setIsLoading] = useState(true);

  // Mock prediction models
  const mockModels: PredictionModel[] = [
    {
      id: 'sales_forecast_model',
      name: 'Prévision des Ventes',
      type: 'sales_forecast',
      description: 'Modèle de prévision des ventes basé sur l\'historique et les facteurs saisonniers',
      algorithm: 'LSTM + XGBoost Ensemble',
      accuracy: 94.2,
      confidence: 87.5,
      lastTrained: '2024-12-18T10:00:00Z',
      nextUpdate: '2024-12-25T10:00:00Z',
      status: 'active',
      features: ['historical_sales', 'seasonality', 'promotions', 'weather', 'economic_indicators'],
      targetVariable: 'daily_sales',
      timeHorizon: '90 jours',
      updateFrequency: 'weekly'
    },
    {
      id: 'demand_prediction_model',
      name: 'Prédiction de la Demande',
      type: 'demand_prediction',
      description: 'Prédiction de la demande par produit pour optimiser les stocks',
      algorithm: 'Prophet + Random Forest',
      accuracy: 89.7,
      confidence: 82.3,
      lastTrained: '2024-12-19T14:30:00Z',
      nextUpdate: '2024-12-26T14:30:00Z',
      status: 'active',
      features: ['product_category', 'price', 'competitor_price', 'inventory_level', 'marketing_spend'],
      targetVariable: 'product_demand',
      timeHorizon: '60 jours',
      updateFrequency: 'daily'
    },
    {
      id: 'churn_prediction_model',
      name: 'Prédiction de Churn',
      type: 'churn_prediction',
      description: 'Identification des clients à risque de désabonnement',
      algorithm: 'Gradient Boosting',
      accuracy: 91.8,
      confidence: 85.9,
      lastTrained: '2024-12-17T09:15:00Z',
      nextUpdate: '2024-12-24T09:15:00Z',
      status: 'active',
      features: ['recency', 'frequency', 'monetary', 'support_tickets', 'satisfaction_score'],
      targetVariable: 'churn_probability',
      timeHorizon: '30 jours',
      updateFrequency: 'weekly'
    }
  ];

  // Mock predictions
  const mockPredictions: Prediction[] = [
    {
      id: 'sales_forecast_dec',
      modelId: 'sales_forecast_model',
      modelName: 'Prévision des Ventes',
      type: 'sales_forecast',
      target: 'Chiffre d\'affaires quotidien',
      predictions: [
        { date: '2024-12-21', predicted: 125000, confidence_lower: 115000, confidence_upper: 135000, factors: { seasonality: 0.15, promotions: 0.08 } },
        { date: '2024-12-22', predicted: 142000, confidence_lower: 130000, confidence_upper: 154000, factors: { seasonality: 0.22, promotions: 0.12 } },
        { date: '2024-12-23', predicted: 168000, confidence_lower: 155000, confidence_upper: 181000, factors: { seasonality: 0.35, promotions: 0.18 } },
        { date: '2024-12-24', predicted: 195000, confidence_lower: 180000, confidence_upper: 210000, factors: { seasonality: 0.45, promotions: 0.25 } },
        { date: '2024-12-25', predicted: 89000, confidence_lower: 82000, confidence_upper: 96000, factors: { seasonality: -0.25, promotions: 0.05 } },
        { date: '2024-12-26', predicted: 156000, confidence_lower: 145000, confidence_upper: 167000, factors: { seasonality: 0.28, promotions: 0.15 } }
      ],
      confidence: 87.5,
      accuracy: 94.2,
      generatedAt: '2024-12-20T15:00:00Z',
      validUntil: '2024-12-27T15:00:00Z',
      scenarios: [
        {
          id: 'optimistic',
          name: 'Scénario Optimiste',
          description: 'Conditions favorables avec promotions renforcées',
          type: 'optimistic',
          adjustments: { promotions: 0.2, marketing: 0.15 },
          impact: 0.18,
          probability: 0.25
        },
        {
          id: 'realistic',
          name: 'Scénario Réaliste',
          description: 'Conditions normales basées sur l\'historique',
          type: 'realistic',
          adjustments: {},
          impact: 0,
          probability: 0.6
        },
        {
          id: 'pessimistic',
          name: 'Scénario Pessimiste',
          description: 'Conditions défavorables avec concurrence accrue',
          type: 'pessimistic',
          adjustments: { competition: -0.15, economic: -0.1 },
          impact: -0.22,
          probability: 0.15
        }
      ],
      insights: [
        'Pic de ventes attendu le 24 décembre (+55% vs moyenne)',
        'Baisse significative le 25 décembre (-30% vs moyenne)',
        'Reprise forte le 26 décembre avec les retours/échanges'
      ],
      recommendations: [
        'Augmenter les stocks pour le 23-24 décembre',
        'Planifier des promotions post-Noël pour le 26 décembre',
        'Prévoir du personnel supplémentaire pour les pics'
      ]
    }
  ];

  // Mock alerts
  const mockAlerts: ForecastAlert[] = [
    {
      id: 'alert_demand_spike',
      type: 'opportunity',
      severity: 'high',
      title: 'Pic de Demande Prévu',
      description: 'Une augmentation de 45% de la demande est prévue pour les produits électroniques dans les 3 prochains jours',
      prediction: 'Demande électronique',
      impact: 0.45,
      probability: 0.89,
      timeframe: '3 jours',
      actionable: true,
      recommendations: [
        'Augmenter les stocks de produits électroniques',
        'Préparer des campagnes marketing ciblées',
        'Négocier des livraisons express avec les fournisseurs'
      ]
    },
    {
      id: 'alert_churn_risk',
      type: 'trend_change',
      severity: 'critical',
      title: 'Risque de Churn Élevé',
      description: 'Le modèle prédit une augmentation de 25% du taux de churn dans le segment premium',
      prediction: 'Churn clients premium',
      impact: -0.25,
      probability: 0.78,
      timeframe: '2 semaines',
      actionable: true,
      recommendations: [
        'Lancer une campagne de rétention ciblée',
        'Contacter personnellement les clients à risque',
        'Proposer des offres de fidélisation exclusives'
      ]
    }
  ];

  useEffect(() => {
    setModels(mockModels);
    setPredictions(mockPredictions);
    setAlerts(mockAlerts);
    setSelectedModel(mockModels[0]?.id || '');
    setIsLoading(false);
  }, []);

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'sales_forecast': return <TrendingUp className="h-4 w-4" />;
      case 'demand_prediction': return <Package className="h-4 w-4" />;
      case 'churn_prediction': return <Users className="h-4 w-4" />;
      case 'price_optimization': return <DollarSign className="h-4 w-4" />;
      case 'inventory_optimization': return <ShoppingCart className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'training': return 'text-blue-600 bg-blue-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
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

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'optimistic': return 'text-green-600 bg-green-50';
      case 'realistic': return 'text-blue-600 bg-blue-50';
      case 'pessimistic': return 'text-red-600 bg-red-50';
      case 'custom': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderModelCard = (model: PredictionModel) => {
    return (
      <Card key={model.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getModelTypeIcon(model.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.algorithm} • {model.timeHorizon}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(model.status)}>
              {model.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{model.description}</p>
            
            {/* Performance metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {model.accuracy.toFixed(1)}%
                </div>
                <div className="text-gray-600">Précision</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {model.confidence.toFixed(1)}%
                </div>
                <div className="text-gray-600">Confiance</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Variables d'entrée:</div>
              <div className="flex flex-wrap gap-1">
                {model.features.slice(0, 3).map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature.replace('_', ' ')}
                  </Badge>
                ))}
                {model.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{model.features.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Schedule info */}
            <div className="text-xs text-gray-600 space-y-1">
              <div>Cible: {model.targetVariable.replace('_', ' ')}</div>
              <div>Fréquence MAJ: {model.updateFrequency}</div>
              <div>Dernière formation: {new Date(model.lastTrained).toLocaleDateString('fr-FR')}</div>
              <div>Prochaine MAJ: {new Date(model.nextUpdate).toLocaleDateString('fr-FR')}</div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => setSelectedModel(model.id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Prédictions
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPredictionChart = (prediction: Prediction) => {
    const chartData = prediction.predictions.map(p => ({
      date: new Date(p.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      predicted: p.predicted,
      lower: p.confidence_lower,
      upper: p.confidence_upper,
      actual: p.actual
    }));

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{prediction.modelName}</CardTitle>
              <CardDescription>{prediction.target}</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Confiance: </span>
                <span className="font-medium">{prediction.confidence.toFixed(1)}%</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Précision: </span>
                <span className="font-medium">{prediction.accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toLocaleString()} €`,
                    name === 'predicted' ? 'Prédiction' :
                    name === 'actual' ? 'Réel' :
                    name === 'lower' ? 'Borne inf.' : 'Borne sup.'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="upper" 
                  stackId="1"
                  stroke="none"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
                <Area 
                  type="monotone" 
                  dataKey="lower" 
                  stackId="1"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                {chartData.some(d => d.actual) && (
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>

            {/* Scenarios */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Scénarios d'Analyse</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.scenarios.map(scenario => (
                  <div 
                    key={scenario.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedScenario === scenario.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{scenario.name}</h5>
                      <Badge className={getScenarioColor(scenario.type)}>
                        {scenario.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Impact:</span>
                        <div className={`font-medium ${
                          scenario.impact > 0 ? 'text-green-600' : 
                          scenario.impact < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {scenario.impact > 0 ? '+' : ''}{(scenario.impact * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Probabilité:</span>
                        <div className="font-medium">{(scenario.probability * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3">Insights Clés</h4>
                <ul className="space-y-2">
                  {prediction.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3">Recommandations</h4>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Validity info */}
            <div className="text-xs text-gray-500 pt-4 border-t">
              <div>Généré: {new Date(prediction.generatedAt).toLocaleString('fr-FR')}</div>
              <div>Valide jusqu'au: {new Date(prediction.validUntil).toLocaleString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlert = (alert: ForecastAlert) => {
    const AlertIcon = alert.type === 'opportunity' ? Target :
                     alert.type === 'trend_change' ? TrendingUp :
                     alert.type === 'anomaly_predicted' ? AlertTriangle : Clock;

    return (
      <Card key={alert.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <AlertIcon className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">{alert.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              </div>
            </div>
            <Badge className={getSeverityColor(alert.severity)}>
              {alert.severity}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Impact:</span>
              <div className={`font-medium ${
                alert.impact > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {alert.impact > 0 ? '+' : ''}{(alert.impact * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Probabilité:</span>
              <div className="font-medium">{(alert.probability * 100).toFixed(0)}%</div>
            </div>
            <div>
              <span className="text-gray-600">Délai:</span>
              <div className="font-medium">{alert.timeframe}</div>
            </div>
          </div>

          {alert.actionable && alert.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Actions Recommandées:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                {alert.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
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

  const renderOverviewStats = () => {
    const activeModels = models.filter(m => m.status === 'active').length;
    const avgAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0) / models.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const totalPredictions = predictions.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles Actifs</p>
                <p className="text-2xl font-bold">{activeModels}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Précision Moyenne</p>
                <p className="text-2xl font-bold text-green-600">{avgAccuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes Critiques</p>
                <p className={`text-2xl font-bold ${criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalAlerts}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prédictions Actives</p>
                <p className="text-2xl font-bold text-purple-600">{totalPredictions}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Prédictives</h1>
          <p className="text-gray-600">Prévisions intelligentes et analyse de scénarios</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
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
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Nouveau Modèle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Prévisions</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-6">
          {renderOverviewStats()}
          <div className="space-y-6">
            {predictions.map(renderPredictionChart)}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map(renderModelCard)}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map(renderAlert)}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de Scénarios</CardTitle>
              <CardDescription>Simulation et comparaison de différents scénarios business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Simulateur de scénarios en cours de développement</p>
                <p className="text-sm">Analyse d'impact et simulation Monte Carlo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsEngine;
