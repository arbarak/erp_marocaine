// Predictive Analytics Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ReferenceArea
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Brain, Target, AlertTriangle, CheckCircle,
  Calendar, Clock, Zap, Eye, Settings, Download, Share2, RefreshCw,
  BarChart3, Activity, Lightbulb, ArrowRight, Info, Warning
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'sales_forecast' | 'demand_prediction' | 'churn_analysis' | 'price_optimization' | 'inventory_forecast';
  title: string;
  description: string;
  confidence: number;
  accuracy: number;
  timeHorizon: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  createdAt: string;
  lastUpdated: string;
  results: PredictionResult[];
  insights: string[];
  recommendations: string[];
}

interface PredictionResult {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface ModelMetrics {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  lastTrained: string;
  dataPoints: number;
  features: string[];
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: { [key: string]: number };
  results: PredictionResult[];
  impact: 'positive' | 'negative' | 'neutral';
  probability: number;
}

const PredictiveAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forecasts');
  const [selectedPrediction, setSelectedPrediction] = useState<string>('sales_forecast');
  const [timeHorizon, setTimeHorizon] = useState('3m');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock predictions data
  const mockPredictions: Prediction[] = [
    {
      id: 'sales_forecast',
      type: 'sales_forecast',
      title: 'Prévision des Ventes',
      description: 'Prédiction du chiffre d\'affaires pour les 3 prochains mois',
      confidence: 87,
      accuracy: 92,
      timeHorizon: '3 mois',
      status: 'completed',
      createdAt: '2024-12-20T10:00:00Z',
      lastUpdated: '2024-12-20T14:30:00Z',
      results: [
        { date: '2025-01', predicted: 280000, lowerBound: 260000, upperBound: 300000, confidence: 85 },
        { date: '2025-02', predicted: 295000, lowerBound: 275000, upperBound: 315000, confidence: 82 },
        { date: '2025-03', predicted: 310000, lowerBound: 285000, upperBound: 335000, confidence: 79 }
      ],
      insights: [
        'Croissance prévue de 12% par rapport à la même période l\'année dernière',
        'Pic de ventes attendu en mars avec l\'arrivée du printemps',
        'Segment Électronique montre la plus forte croissance'
      ],
      recommendations: [
        'Augmenter le stock des produits électroniques de 20%',
        'Préparer une campagne marketing pour février',
        'Recruter du personnel temporaire pour mars'
      ]
    },
    {
      id: 'demand_prediction',
      type: 'demand_prediction',
      title: 'Prédiction de la Demande',
      description: 'Analyse de la demande par produit et catégorie',
      confidence: 91,
      accuracy: 88,
      timeHorizon: '6 semaines',
      status: 'completed',
      createdAt: '2024-12-20T09:00:00Z',
      lastUpdated: '2024-12-20T15:00:00Z',
      results: [
        { date: 'Sem 1', predicted: 1250, lowerBound: 1180, upperBound: 1320, confidence: 92 },
        { date: 'Sem 2', predicted: 1180, lowerBound: 1100, upperBound: 1260, confidence: 89 },
        { date: 'Sem 3', predicted: 1320, lowerBound: 1240, upperBound: 1400, confidence: 87 }
      ],
      insights: [
        'Demande stable avec légère tendance à la hausse',
        'Produits saisonniers montrent une forte demande',
        'Nouveaux produits gagnent en popularité'
      ],
      recommendations: [
        'Optimiser les niveaux de stock pour éviter les ruptures',
        'Négocier avec les fournisseurs pour les produits saisonniers',
        'Investir dans le marketing des nouveaux produits'
      ]
    },
    {
      id: 'churn_analysis',
      type: 'churn_analysis',
      title: 'Analyse du Churn Client',
      description: 'Prédiction des clients à risque de départ',
      confidence: 84,
      accuracy: 89,
      timeHorizon: '1 mois',
      status: 'running',
      createdAt: '2024-12-20T11:00:00Z',
      lastUpdated: '2024-12-20T16:00:00Z',
      results: [],
      insights: [
        '15% des clients présentent un risque élevé de churn',
        'Clients inactifs depuis 60 jours ont 70% de probabilité de partir',
        'Segment PME montre le taux de churn le plus élevé'
      ],
      recommendations: [
        'Lancer une campagne de rétention ciblée',
        'Améliorer le service client pour les PME',
        'Proposer des offres personnalisées aux clients à risque'
      ]
    }
  ];

  // Mock model metrics
  const mockModelMetrics: ModelMetrics[] = [
    {
      id: 'sales_model',
      name: 'Modèle de Prévision des Ventes',
      type: 'Random Forest',
      accuracy: 92.5,
      precision: 89.2,
      recall: 91.8,
      f1Score: 90.5,
      mse: 0.08,
      mae: 0.06,
      lastTrained: '2024-12-15T10:00:00Z',
      dataPoints: 24000,
      features: ['historique_ventes', 'saisonnalite', 'promotions', 'prix', 'stock']
    },
    {
      id: 'demand_model',
      name: 'Modèle de Demande',
      type: 'LSTM Neural Network',
      accuracy: 88.7,
      precision: 86.4,
      recall: 89.1,
      f1Score: 87.7,
      mse: 0.12,
      mae: 0.09,
      lastTrained: '2024-12-18T14:00:00Z',
      dataPoints: 18500,
      features: ['tendances', 'evenements', 'meteo', 'concurrence', 'marketing']
    },
    {
      id: 'churn_model',
      name: 'Modèle de Churn',
      type: 'Gradient Boosting',
      accuracy: 89.3,
      precision: 87.6,
      recall: 88.9,
      f1Score: 88.2,
      mse: 0.11,
      mae: 0.08,
      lastTrained: '2024-12-19T16:00:00Z',
      dataPoints: 15200,
      features: ['activite', 'satisfaction', 'support', 'facturation', 'usage']
    }
  ];

  // Mock scenarios
  const mockScenarios: Scenario[] = [
    {
      id: 'optimistic',
      name: 'Scénario Optimiste',
      description: 'Croissance économique favorable, campagnes marketing réussies',
      parameters: { growth_rate: 1.15, marketing_boost: 1.08, economic_factor: 1.05 },
      results: [
        { date: '2025-01', predicted: 320000, lowerBound: 300000, upperBound: 340000, confidence: 78 },
        { date: '2025-02', predicted: 335000, lowerBound: 315000, upperBound: 355000, confidence: 75 },
        { date: '2025-03', predicted: 350000, lowerBound: 325000, upperBound: 375000, confidence: 72 }
      ],
      impact: 'positive',
      probability: 25
    },
    {
      id: 'pessimistic',
      name: 'Scénario Pessimiste',
      description: 'Ralentissement économique, concurrence accrue',
      parameters: { growth_rate: 0.92, competition_impact: 0.95, economic_factor: 0.88 },
      results: [
        { date: '2025-01', predicted: 240000, lowerBound: 220000, upperBound: 260000, confidence: 82 },
        { date: '2025-02', predicted: 235000, lowerBound: 215000, upperBound: 255000, confidence: 80 },
        { date: '2025-03', predicted: 245000, lowerBound: 220000, upperBound: 270000, confidence: 77 }
      ],
      impact: 'negative',
      probability: 20
    },
    {
      id: 'realistic',
      name: 'Scénario Réaliste',
      description: 'Conditions normales, croissance modérée',
      parameters: { growth_rate: 1.02, stability_factor: 1.0, market_conditions: 1.0 },
      results: [
        { date: '2025-01', predicted: 280000, lowerBound: 260000, upperBound: 300000, confidence: 87 },
        { date: '2025-02', predicted: 295000, lowerBound: 275000, upperBound: 315000, confidence: 85 },
        { date: '2025-03', predicted: 310000, lowerBound: 285000, upperBound: 335000, confidence: 83 }
      ],
      impact: 'neutral',
      probability: 55
    }
  ];

  useEffect(() => {
    setPredictions(mockPredictions);
    setModelMetrics(mockModelMetrics);
    setScenarios(mockScenarios);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'scheduled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderPredictionCard = (prediction: Prediction) => {
    const StatusIcon = prediction.status === 'completed' ? CheckCircle :
                      prediction.status === 'running' ? RefreshCw :
                      prediction.status === 'failed' ? AlertTriangle : Clock;

    return (
      <Card key={prediction.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{prediction.title}</CardTitle>
            <Badge className={getStatusColor(prediction.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {prediction.status}
            </Badge>
          </div>
          <CardDescription>{prediction.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}%
                </div>
                <div className="text-xs text-gray-500">Confiance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{prediction.accuracy}%</div>
                <div className="text-xs text-gray-500">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{prediction.timeHorizon}</div>
                <div className="text-xs text-gray-500">Horizon</div>
              </div>
            </div>

            {/* Progress bar for confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Niveau de confiance</span>
                <span>{prediction.confidence}%</span>
              </div>
              <Progress value={prediction.confidence} className="h-2" />
            </div>

            {/* Key insights */}
            {prediction.insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                  Insights Clés
                </h4>
                <ul className="space-y-1">
                  {prediction.insights.slice(0, 2).map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <ArrowRight className="h-3 w-3 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderForecastChart = () => {
    const selectedPred = predictions.find(p => p.id === selectedPrediction);
    if (!selectedPred || selectedPred.results.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Aucune donnée de prévision disponible
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={selectedPred.results}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            dataKey="upperBound"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.1}
            name="Limite Haute"
          />
          <Area
            dataKey="predicted"
            stackId="2"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
            name="Prédiction"
          />
          <Area
            dataKey="lowerBound"
            stackId="1"
            stroke="#8884d8"
            fill="#ffffff"
            fillOpacity={1}
            name="Limite Basse"
          />
          {selectedPred.results.some(r => r.actual) && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#ff7300"
              strokeWidth={3}
              name="Réel"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderModelMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modelMetrics.map(model => (
        <Card key={model.id}>
          <CardHeader>
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <CardDescription>{model.type}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Performance metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{model.accuracy.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Précision</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{model.f1Score.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">F1-Score</div>
                </div>
              </div>

              {/* Detailed metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Précision:</span>
                  <span>{model.precision.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rappel:</span>
                  <span>{model.recall.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MSE:</span>
                  <span>{model.mse.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MAE:</span>
                  <span>{model.mae.toFixed(3)}</span>
                </div>
              </div>

              {/* Training info */}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Dernière formation:</span>
                  <span>{new Date(model.lastTrained).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Points de données:</span>
                  <span>{model.dataPoints.toLocaleString()}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Caractéristiques:</h4>
                <div className="flex flex-wrap gap-1">
                  {model.features.slice(0, 3).map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {model.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{model.features.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderScenarioAnalysis = () => (
    <div className="space-y-6">
      {/* Scenario comparison chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des Scénarios</CardTitle>
          <CardDescription>Impact des différents scénarios sur les prévisions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {scenarios.map((scenario, index) => (
                <Line
                  key={scenario.id}
                  type="monotone"
                  dataKey="predicted"
                  data={scenario.results}
                  stroke={['#8884d8', '#82ca9d', '#ffc658'][index]}
                  strokeWidth={2}
                  name={scenario.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map(scenario => (
          <Card key={scenario.id} className={`border-l-4 ${
            scenario.impact === 'positive' ? 'border-l-green-500' :
            scenario.impact === 'negative' ? 'border-l-red-500' :
            'border-l-blue-500'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{scenario.name}</CardTitle>
                <Badge className={
                  scenario.impact === 'positive' ? 'bg-green-100 text-green-800' :
                  scenario.impact === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {scenario.probability}%
                </Badge>
              </div>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Key parameters */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Paramètres Clés:</h4>
                  {Object.entries(scenario.parameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className={value > 1 ? 'text-green-600' : value < 1 ? 'text-red-600' : 'text-gray-600'}>
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Impact summary */}
                <div className="pt-2 border-t">
                  <div className="text-sm">
                    <span className="font-medium">Impact prévu: </span>
                    <span className={
                      scenario.impact === 'positive' ? 'text-green-600' :
                      scenario.impact === 'negative' ? 'text-red-600' :
                      'text-blue-600'
                    }>
                      {scenario.impact === 'positive' ? 'Positif' :
                       scenario.impact === 'negative' ? 'Négatif' : 'Neutre'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Analyses Prédictives</h1>
          <p className="text-gray-600">Prévisions intelligentes et modélisation prédictive</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mois</SelectItem>
              <SelectItem value="3m">3 mois</SelectItem>
              <SelectItem value="6m">6 mois</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Nouvelle Prédiction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Prévisions</TabsTrigger>
          <TabsTrigger value="models">Modèles</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-6">
          {/* Predictions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map(renderPredictionCard)}
          </div>

          {/* Detailed forecast chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Graphique de Prévision Détaillé</CardTitle>
                <Select value={selectedPrediction} onValueChange={setSelectedPrediction}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {predictions.map(pred => (
                      <SelectItem key={pred.id} value={pred.id}>
                        {pred.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {renderForecastChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {renderModelMetrics()}
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {renderScenarioAnalysis()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map(prediction => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    {prediction.title} - Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Insights */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-800">Observations:</h4>
                      <ul className="space-y-1">
                        {prediction.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <Info className="h-3 w-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-800">Recommandations:</h4>
                      <ul className="space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
