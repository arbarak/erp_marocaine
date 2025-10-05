// Advanced Data Mining Component

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
  Search, Database, TrendingUp, BarChart3, PieChart, Layers,
  Filter, Target, Zap, Brain, Eye, Settings, Download,
  RefreshCw, Play, Pause, Square, CheckCircle, AlertTriangle,
  Clock, Users, Globe, Award, Sparkles, Network, TreePine
} from 'lucide-react';

interface DataMiningProject {
  id: string;
  name: string;
  description: string;
  technique: 'clustering' | 'association_rules' | 'classification' | 'anomaly_detection' | 'pattern_mining' | 'text_mining';
  dataSource: {
    name: string;
    type: 'database' | 'file' | 'api' | 'stream';
    size: number;
    records: number;
    lastUpdated: string;
  };
  configuration: {
    algorithm: string;
    parameters: { [key: string]: any };
    preprocessing: string[];
    validation: string;
  };
  status: 'created' | 'running' | 'completed' | 'failed' | 'scheduled';
  progress: {
    currentStep: string;
    percentage: number;
    timeElapsed: number;
    estimatedTimeRemaining: number;
  };
  results?: {
    insights: DataInsight[];
    patterns: DataPattern[];
    recommendations: string[];
    confidence: number;
    accuracy?: number;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    nextRun: string;
    enabled: boolean;
  };
  createdAt: string;
  createdBy: string;
}

interface DataInsight {
  id: string;
  type: 'trend' | 'correlation' | 'anomaly' | 'cluster' | 'rule' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: {
    metrics: { [key: string]: number };
    visualizations: VisualizationData[];
  };
  actionable: boolean;
  recommendations: string[];
}

interface DataPattern {
  id: string;
  type: 'frequent_itemset' | 'association_rule' | 'sequential_pattern' | 'cluster_pattern';
  pattern: string;
  support: number;
  confidence: number;
  lift?: number;
  frequency: number;
  examples: string[];
  businessValue: string;
}

interface VisualizationData {
  type: 'line' | 'bar' | 'scatter' | 'heatmap' | 'network' | 'tree';
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    colorBy?: string;
    groupBy?: string;
  };
}

interface ClusterAnalysis {
  id: string;
  name: string;
  algorithm: 'kmeans' | 'hierarchical' | 'dbscan' | 'gaussian_mixture';
  clusters: Cluster[];
  silhouetteScore: number;
  inertia: number;
  optimalClusters: number;
  interpretation: string[];
}

interface Cluster {
  id: number;
  name: string;
  size: number;
  centroid: { [key: string]: number };
  characteristics: string[];
  businessSegment: string;
  actionableInsights: string[];
}

const AdvancedDataMining: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<DataMiningProject[]>([]);
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [clusterAnalyses, setClusterAnalyses] = useState<ClusterAnalysis[]>([]);
  const [selectedProject, setSelectedProject] = useState<DataMiningProject | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data mining projects
  const mockProjects: DataMiningProject[] = [
    {
      id: 'project_customer_segmentation',
      name: 'Segmentation Clientèle Avancée',
      description: 'Analyse de clustering pour identifier les segments de clients basés sur le comportement d\'achat',
      technique: 'clustering',
      dataSource: {
        name: 'customer_transactions_2024',
        type: 'database',
        size: 15.2,
        records: 125000,
        lastUpdated: '2024-12-20T08:00:00Z'
      },
      configuration: {
        algorithm: 'K-Means++',
        parameters: {
          n_clusters: 6,
          max_iter: 300,
          random_state: 42,
          init: 'k-means++'
        },
        preprocessing: ['standardization', 'outlier_removal', 'feature_selection'],
        validation: 'silhouette_analysis'
      },
      status: 'completed',
      progress: {
        currentStep: 'Terminé',
        percentage: 100,
        timeElapsed: 45,
        estimatedTimeRemaining: 0
      },
      results: {
        insights: [
          {
            id: 'insight_1',
            type: 'cluster',
            title: 'Segment Premium Identifié',
            description: 'Un segment de 15% des clients génère 45% du chiffre d\'affaires',
            confidence: 0.92,
            impact: 'high',
            data: {
              metrics: { revenue_contribution: 0.45, customer_percentage: 0.15, avg_order_value: 850 },
              visualizations: []
            },
            actionable: true,
            recommendations: ['Créer programme de fidélité premium', 'Personnaliser offres haut de gamme']
          },
          {
            id: 'insight_2',
            type: 'cluster',
            title: 'Clients à Risque de Churn',
            description: 'Segment de 22% des clients avec baisse d\'activité récente',
            confidence: 0.87,
            impact: 'critical',
            data: {
              metrics: { churn_probability: 0.68, revenue_at_risk: 125000, avg_days_since_purchase: 45 },
              visualizations: []
            },
            actionable: true,
            recommendations: ['Campagne de réactivation ciblée', 'Offres spéciales personnalisées']
          }
        ],
        patterns: [],
        recommendations: [
          'Implémenter stratégie de rétention pour segment à risque',
          'Développer programme VIP pour segment premium',
          'Optimiser mix produits pour segment occasionnel'
        ],
        confidence: 0.89,
        accuracy: 0.94
      },
      schedule: {
        frequency: 'weekly',
        nextRun: '2024-12-27T09:00:00Z',
        enabled: true
      },
      createdAt: '2024-12-18T10:30:00Z',
      createdBy: 'marketing@company.com'
    },
    {
      id: 'project_market_basket',
      name: 'Analyse du Panier de Marché',
      description: 'Découverte de règles d\'association pour optimiser les recommandations produits',
      technique: 'association_rules',
      dataSource: {
        name: 'sales_transactions',
        type: 'database',
        size: 8.7,
        records: 89000,
        lastUpdated: '2024-12-19T16:30:00Z'
      },
      configuration: {
        algorithm: 'Apriori',
        parameters: {
          min_support: 0.01,
          min_confidence: 0.3,
          min_lift: 1.2,
          max_length: 4
        },
        preprocessing: ['transaction_grouping', 'item_filtering', 'frequency_analysis'],
        validation: 'cross_validation'
      },
      status: 'running',
      progress: {
        currentStep: 'Génération des règles d\'association',
        percentage: 75,
        timeElapsed: 28,
        estimatedTimeRemaining: 12
      },
      createdAt: '2024-12-20T14:00:00Z',
      createdBy: 'sales@company.com'
    },
    {
      id: 'project_anomaly_detection',
      name: 'Détection d\'Anomalies Financières',
      description: 'Identification automatique de transactions suspectes et fraudes potentielles',
      technique: 'anomaly_detection',
      dataSource: {
        name: 'financial_transactions',
        type: 'stream',
        size: 25.4,
        records: 450000,
        lastUpdated: '2024-12-20T15:45:00Z'
      },
      configuration: {
        algorithm: 'Isolation Forest',
        parameters: {
          contamination: 0.05,
          n_estimators: 200,
          max_samples: 'auto',
          random_state: 42
        },
        preprocessing: ['normalization', 'feature_engineering', 'temporal_features'],
        validation: 'temporal_split'
      },
      status: 'completed',
      progress: {
        currentStep: 'Terminé',
        percentage: 100,
        timeElapsed: 67,
        estimatedTimeRemaining: 0
      },
      results: {
        insights: [
          {
            id: 'insight_3',
            type: 'anomaly',
            title: 'Transactions Suspectes Détectées',
            description: '127 transactions présentent des patterns anormaux nécessitant investigation',
            confidence: 0.95,
            impact: 'critical',
            data: {
              metrics: { anomalies_detected: 127, false_positive_rate: 0.02, potential_fraud_value: 45000 },
              visualizations: []
            },
            actionable: true,
            recommendations: ['Investigation manuelle immédiate', 'Renforcement contrôles automatiques']
          }
        ],
        patterns: [],
        recommendations: [
          'Mettre en place alertes temps réel',
          'Former équipe sur nouveaux patterns de fraude',
          'Intégrer détection dans workflow validation'
        ],
        confidence: 0.95,
        accuracy: 0.98
      },
      schedule: {
        frequency: 'daily',
        nextRun: '2024-12-21T06:00:00Z',
        enabled: true
      },
      createdAt: '2024-12-15T09:15:00Z',
      createdBy: 'finance@company.com'
    }
  ];

  // Mock cluster analyses
  const mockClusterAnalyses: ClusterAnalysis[] = [
    {
      id: 'cluster_customers',
      name: 'Segmentation Clientèle',
      algorithm: 'kmeans',
      clusters: [
        {
          id: 0,
          name: 'Clients Premium',
          size: 1250,
          centroid: { avg_order_value: 850, frequency: 12, recency: 15 },
          characteristics: ['Commandes fréquentes', 'Panier moyen élevé', 'Fidélité forte'],
          businessSegment: 'High Value',
          actionableInsights: ['Programme VIP', 'Offres exclusives', 'Service prioritaire']
        },
        {
          id: 1,
          name: 'Clients Occasionnels',
          size: 3200,
          centroid: { avg_order_value: 180, frequency: 3, recency: 45 },
          characteristics: ['Achats saisonniers', 'Sensibles aux promotions', 'Panier moyen'],
          businessSegment: 'Occasional',
          actionableInsights: ['Campagnes promotionnelles', 'Rappels saisonniers', 'Cross-selling']
        },
        {
          id: 2,
          name: 'Nouveaux Clients',
          size: 890,
          centroid: { avg_order_value: 120, frequency: 1, recency: 7 },
          characteristics: ['Premier achat récent', 'Potentiel inexploré', 'Besoin d\'accompagnement'],
          businessSegment: 'New',
          actionableInsights: ['Programme d\'onboarding', 'Offres de bienvenue', 'Support renforcé']
        }
      ],
      silhouetteScore: 0.72,
      inertia: 1250.5,
      optimalClusters: 6,
      interpretation: [
        'Segmentation claire avec 3 groupes principaux',
        'Segment premium très rentable mais petit',
        'Opportunité de conversion pour nouveaux clients'
      ]
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
    setClusterAnalyses(mockClusterAnalyses);
    setIsLoading(false);
  }, []);

  const getTechniqueIcon = (technique: string) => {
    switch (technique) {
      case 'clustering': return <Layers className="h-4 w-4" />;
      case 'association_rules': return <Network className="h-4 w-4" />;
      case 'classification': return <Target className="h-4 w-4" />;
      case 'anomaly_detection': return <AlertTriangle className="h-4 w-4" />;
      case 'pattern_mining': return <Search className="h-4 w-4" />;
      case 'text_mining': return <Brain className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'scheduled': return 'text-purple-600 bg-purple-50';
      case 'created': return 'text-yellow-600 bg-yellow-50';
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

  const startProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'running', progress: { ...project.progress, currentStep: 'Préparation des données', percentage: 5 } }
        : project
    ));
  };

  const stopProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: 'created' }
        : project
    ));
  };

  const renderProjectCard = (project: DataMiningProject) => {
    return (
      <Card key={project.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getTechniqueIcon(project.technique)}
              </div>
              <div>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription className="text-sm">
                  {project.technique.replace('_', ' ')} • {project.dataSource.records.toLocaleString()} records
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{project.description}</p>
            
            {/* Progress */}
            {project.status === 'running' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{project.progress.currentStep}</span>
                  <span>{project.progress.percentage}%</span>
                </div>
                <Progress value={project.progress.percentage} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>Temps écoulé: {project.progress.timeElapsed}min</div>
                  <div>Temps restant: {project.progress.estimatedTimeRemaining}min</div>
                </div>
              </div>
            )}

            {/* Results summary */}
            {project.results && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Résultats</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Insights:</span>
                    <div className="font-medium">{project.results.insights.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Confiance:</span>
                    <div className="font-medium">{(project.results.confidence * 100).toFixed(1)}%</div>
                  </div>
                  {project.results.accuracy && (
                    <div>
                      <span className="text-gray-600">Précision:</span>
                      <div className="font-medium">{(project.results.accuracy * 100).toFixed(1)}%</div>
                    </div>
                  )}
                </div>
                
                {/* Top insights */}
                <div className="space-y-2">
                  {project.results.insights.slice(0, 2).map(insight => (
                    <div key={insight.id} className="bg-blue-50 p-2 rounded text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{insight.title}</span>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <div className="text-gray-600 text-xs">{insight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data source info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{project.dataSource.size}MB</div>
                <div className="text-gray-500">Taille</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{project.dataSource.records.toLocaleString()}</div>
                <div className="text-gray-500">Records</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{project.configuration.algorithm}</div>
                <div className="text-gray-500">Algorithme</div>
              </div>
            </div>

            {/* Schedule info */}
            {project.schedule && (
              <div className="bg-gray-50 p-2 rounded text-xs">
                <div className="flex justify-between items-center">
                  <span>Planification: {project.schedule.frequency}</span>
                  <Badge className={project.schedule.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                    {project.schedule.enabled ? 'Activé' : 'Désactivé'}
                  </Badge>
                </div>
                {project.schedule.enabled && (
                  <div className="text-gray-600 mt-1">
                    Prochaine exécution: {new Date(project.schedule.nextRun).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              {project.status === 'created' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => startProject(project.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Démarrer
                </Button>
              )}
              {project.status === 'running' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => stopProject(project.id)}
                >
                  <Square className="h-3 w-3 mr-1" />
                  Arrêter
                </Button>
              )}
              {project.status === 'completed' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedProject(project)}
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
              <div>Créé par: {project.createdBy}</div>
              <div>Date: {new Date(project.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderClusterAnalysis = (analysis: ClusterAnalysis) => {
    return (
      <Card key={analysis.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{analysis.name}</CardTitle>
            <Badge className="text-blue-600 bg-blue-50">
              {analysis.algorithm}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {analysis.silhouetteScore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Score Silhouette</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {analysis.clusters.length}
                </div>
                <div className="text-sm text-gray-600">Clusters</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">
                  {analysis.inertia.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Inertie</div>
              </div>
            </div>

            {/* Clusters */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Segments Identifiés</h4>
              {analysis.clusters.map(cluster => (
                <div key={cluster.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-lg">{cluster.name}</h5>
                      <p className="text-sm text-gray-600">{cluster.businessSegment}</p>
                    </div>
                    <Badge variant="outline">
                      {cluster.size.toLocaleString()} clients
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Caractéristiques</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {cluster.characteristics.map((char, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-blue-500">•</span>
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Actions Recommandées</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {cluster.actionableInsights.map((insight, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-green-500">→</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretation */}
            <div>
              <h4 className="text-lg font-medium mb-3">Interprétation</h4>
              <ul className="space-y-2">
                {analysis.interpretation.map((interp, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{interp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalProjects = projects.length;
    const runningProjects = projects.filter(p => p.status === 'running').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalInsights = projects.reduce((sum, p) => sum + (p.results?.insights.length || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets Totaux</p>
                <p className="text-2xl font-bold">{totalProjects}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-blue-600">{runningProjects}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Générés</p>
                <p className="text-2xl font-bold text-purple-600">{totalInsights}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Data Mining Avancé</h1>
          <p className="text-gray-600">Découvrez des patterns cachés et générez des insights actionnables</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" onClick={() => setShowProjectDialog(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(renderProjectCard)}
          </div>
        </TabsContent>

        <TabsContent value="clustering" className="space-y-6">
          <div className="space-y-6">
            {clusterAnalyses.map(renderClusterAnalysis)}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patterns Découverts</CardTitle>
              <CardDescription>Règles d'association et patterns séquentiels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Network className="h-12 w-12 mx-auto mb-4" />
                <p>Analyse de patterns en cours de développement</p>
                <p className="text-sm">Règles d'association et patterns fréquents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Actionnables</CardTitle>
              <CardDescription>Recommandations basées sur l'analyse des données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard d'insights en cours de développement</p>
                <p className="text-sm">Recommandations personnalisées et actions prioritaires</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDataMining;
