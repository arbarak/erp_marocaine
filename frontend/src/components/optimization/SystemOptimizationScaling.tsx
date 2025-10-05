// System Optimization & Scaling Component

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
import { 
  Cpu, MemoryStick, HardDrive, Network, Zap, TrendingUp,
  Server, Database, Cloud, Activity, AlertTriangle, CheckCircle,
  Settings, Gauge, BarChart3, LineChart, PieChart, Monitor,
  Layers, Globe, Shield, Clock, RefreshCw, Download
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  history: { timestamp: string; value: number }[];
}

interface PerformanceOptimization {
  id: string;
  category: 'database' | 'cache' | 'api' | 'frontend' | 'infrastructure';
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedImprovement: number;
  implementedAt?: string;
  results?: {
    beforeValue: number;
    afterValue: number;
    improvement: number;
  };
}

interface ScalingConfiguration {
  id: string;
  service: string;
  type: 'horizontal' | 'vertical';
  currentInstances: number;
  maxInstances: number;
  minInstances: number;
  cpuThreshold: number;
  memoryThreshold: number;
  autoScaling: boolean;
  lastScaleEvent?: string;
  scalingHistory: {
    timestamp: string;
    action: 'scale_up' | 'scale_down';
    instances: number;
    reason: string;
  }[];
}

const SystemOptimizationScaling: React.FC = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [scalingConfigs, setScalingConfigs] = useState<ScalingConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock system metrics
  const mockMetrics: SystemMetric[] = [
    {
      id: 'cpu_usage',
      name: 'Utilisation CPU',
      value: 68.5,
      unit: '%',
      threshold: 80,
      status: 'optimal',
      trend: 'up',
      changePercent: 5.2,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 65 },
        { timestamp: '2024-12-20T11:00:00Z', value: 67 },
        { timestamp: '2024-12-20T12:00:00Z', value: 70 },
        { timestamp: '2024-12-20T13:00:00Z', value: 68.5 }
      ]
    },
    {
      id: 'memory_usage',
      name: 'Utilisation Mémoire',
      value: 82.3,
      unit: '%',
      threshold: 85,
      status: 'warning',
      trend: 'up',
      changePercent: 8.7,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 75 },
        { timestamp: '2024-12-20T11:00:00Z', value: 78 },
        { timestamp: '2024-12-20T12:00:00Z', value: 81 },
        { timestamp: '2024-12-20T13:00:00Z', value: 82.3 }
      ]
    },
    {
      id: 'disk_usage',
      name: 'Utilisation Disque',
      value: 45.2,
      unit: '%',
      threshold: 90,
      status: 'optimal',
      trend: 'stable',
      changePercent: 0.8,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 44.8 },
        { timestamp: '2024-12-20T11:00:00Z', value: 45.0 },
        { timestamp: '2024-12-20T12:00:00Z', value: 45.1 },
        { timestamp: '2024-12-20T13:00:00Z', value: 45.2 }
      ]
    },
    {
      id: 'network_throughput',
      name: 'Débit Réseau',
      value: 156.7,
      unit: 'Mbps',
      threshold: 1000,
      status: 'optimal',
      trend: 'down',
      changePercent: -2.3,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 160 },
        { timestamp: '2024-12-20T11:00:00Z', value: 158 },
        { timestamp: '2024-12-20T12:00:00Z', value: 157 },
        { timestamp: '2024-12-20T13:00:00Z', value: 156.7 }
      ]
    },
    {
      id: 'response_time',
      name: 'Temps de Réponse API',
      value: 245,
      unit: 'ms',
      threshold: 500,
      status: 'optimal',
      trend: 'stable',
      changePercent: 1.2,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 242 },
        { timestamp: '2024-12-20T11:00:00Z', value: 244 },
        { timestamp: '2024-12-20T12:00:00Z', value: 246 },
        { timestamp: '2024-12-20T13:00:00Z', value: 245 }
      ]
    },
    {
      id: 'database_connections',
      name: 'Connexions DB',
      value: 45,
      unit: 'connexions',
      threshold: 100,
      status: 'optimal',
      trend: 'up',
      changePercent: 12.5,
      history: [
        { timestamp: '2024-12-20T10:00:00Z', value: 40 },
        { timestamp: '2024-12-20T11:00:00Z', value: 42 },
        { timestamp: '2024-12-20T12:00:00Z', value: 44 },
        { timestamp: '2024-12-20T13:00:00Z', value: 45 }
      ]
    }
  ];

  // Mock optimizations
  const mockOptimizations: PerformanceOptimization[] = [
    {
      id: 'opt_1',
      category: 'database',
      name: 'Optimisation des Index',
      description: 'Ajouter des index composites pour améliorer les performances des requêtes complexes',
      impact: 'high',
      effort: 'medium',
      status: 'completed',
      estimatedImprovement: 35,
      implementedAt: '2024-12-15T10:00:00Z',
      results: {
        beforeValue: 850,
        afterValue: 245,
        improvement: 71.2
      }
    },
    {
      id: 'opt_2',
      category: 'cache',
      name: 'Cache Redis Multi-niveaux',
      description: 'Implémenter un système de cache à plusieurs niveaux avec TTL adaptatif',
      impact: 'high',
      effort: 'high',
      status: 'in_progress',
      estimatedImprovement: 45
    },
    {
      id: 'opt_3',
      category: 'api',
      name: 'Pagination Intelligente',
      description: 'Optimiser la pagination avec cursor-based pagination pour les grandes collections',
      impact: 'medium',
      effort: 'low',
      status: 'pending',
      estimatedImprovement: 25
    },
    {
      id: 'opt_4',
      category: 'frontend',
      name: 'Code Splitting Avancé',
      description: 'Implémenter le code splitting au niveau des routes et composants',
      impact: 'medium',
      effort: 'medium',
      status: 'completed',
      estimatedImprovement: 30,
      implementedAt: '2024-12-10T14:30:00Z',
      results: {
        beforeValue: 2.8,
        afterValue: 1.9,
        improvement: 32.1
      }
    },
    {
      id: 'opt_5',
      category: 'infrastructure',
      name: 'CDN Global',
      description: 'Déployer un CDN global pour les assets statiques',
      impact: 'high',
      effort: 'low',
      status: 'pending',
      estimatedImprovement: 40
    }
  ];

  // Mock scaling configurations
  const mockScalingConfigs: ScalingConfiguration[] = [
    {
      id: 'scale_api',
      service: 'API Backend',
      type: 'horizontal',
      currentInstances: 3,
      maxInstances: 10,
      minInstances: 2,
      cpuThreshold: 70,
      memoryThreshold: 80,
      autoScaling: true,
      lastScaleEvent: '2024-12-19T15:30:00Z',
      scalingHistory: [
        {
          timestamp: '2024-12-19T15:30:00Z',
          action: 'scale_up',
          instances: 3,
          reason: 'CPU threshold exceeded (75%)'
        },
        {
          timestamp: '2024-12-18T09:15:00Z',
          action: 'scale_down',
          instances: 2,
          reason: 'Low traffic period'
        }
      ]
    },
    {
      id: 'scale_worker',
      service: 'Background Workers',
      type: 'horizontal',
      currentInstances: 2,
      maxInstances: 8,
      minInstances: 1,
      cpuThreshold: 80,
      memoryThreshold: 85,
      autoScaling: true,
      lastScaleEvent: '2024-12-20T08:00:00Z',
      scalingHistory: [
        {
          timestamp: '2024-12-20T08:00:00Z',
          action: 'scale_up',
          instances: 2,
          reason: 'Queue length exceeded threshold'
        }
      ]
    },
    {
      id: 'scale_db',
      service: 'Base de Données',
      type: 'vertical',
      currentInstances: 1,
      maxInstances: 1,
      minInstances: 1,
      cpuThreshold: 85,
      memoryThreshold: 90,
      autoScaling: false,
      scalingHistory: []
    }
  ];

  useEffect(() => {
    setMetrics(mockMetrics);
    setOptimizations(mockOptimizations);
    setScalingConfigs(mockScalingConfigs);
    setIsLoading(false);
  }, []);

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu_usage': return <Cpu className="h-5 w-5" />;
      case 'memory_usage': return <MemoryStick className="h-5 w-5" />;
      case 'disk_usage': return <HardDrive className="h-5 w-5" />;
      case 'network_throughput': return <Network className="h-5 w-5" />;
      case 'response_time': return <Clock className="h-5 w-5" />;
      case 'database_connections': return <Database className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      case 'failed': return 'text-red-600 bg-red-50';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'cache': return <Zap className="h-4 w-4" />;
      case 'api': return <Server className="h-4 w-4" />;
      case 'frontend': return <Monitor className="h-4 w-4" />;
      case 'infrastructure': return <Cloud className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const renderMetricCard = (metric: SystemMetric) => {
    const StatusIcon = metric.status === 'optimal' ? CheckCircle :
                      metric.status === 'warning' ? AlertTriangle : AlertTriangle;
    
    return (
      <Card key={metric.id}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getMetricIcon(metric.id)}
              <CardTitle className="text-lg">{metric.name}</CardTitle>
            </div>
            <Badge className={getStatusColor(metric.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {metric.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current value */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metric.value.toFixed(1)}
                <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
              </div>
              <div className={`text-sm ${
                metric.trend === 'up' ? 'text-red-600' :
                metric.trend === 'down' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} 
                {Math.abs(metric.changePercent).toFixed(1)}%
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Utilisation</span>
                <span>Seuil: {metric.threshold}{metric.unit}</span>
              </div>
              <Progress 
                value={(metric.value / metric.threshold) * 100} 
                className={`h-2 ${
                  metric.status === 'critical' ? 'bg-red-100' :
                  metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                }`}
              />
            </div>

            {/* Mini chart */}
            <div className="h-16 bg-gray-50 rounded flex items-end justify-between px-1">
              {metric.history.map((point, index) => (
                <div 
                  key={index}
                  className="bg-blue-500 rounded-t w-2"
                  style={{ 
                    height: `${(point.value / metric.threshold) * 100}%`,
                    minHeight: '2px'
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOptimizationCard = (optimization: PerformanceOptimization) => {
    return (
      <Card key={optimization.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(optimization.category)}
              <CardTitle className="text-lg">{optimization.name}</CardTitle>
            </div>
            <Badge className={getStatusColor(optimization.status)}>
              {optimization.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{optimization.description}</p>
            
            {/* Impact and effort */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Badge className={getImpactColor(optimization.impact)}>
                  {optimization.impact}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">Impact</div>
              </div>
              <div className="text-center">
                <Badge variant="outline">
                  {optimization.effort}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">Effort</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  +{optimization.estimatedImprovement}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Amélioration</div>
              </div>
            </div>

            {/* Results */}
            {optimization.results && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-2">Résultats</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-600">Avant</div>
                    <div className="font-medium">{optimization.results.beforeValue}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Après</div>
                    <div className="font-medium">{optimization.results.afterValue}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Amélioration</div>
                    <div className="font-medium text-green-600">
                      +{optimization.results.improvement.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex justify-end">
              {optimization.status === 'pending' && (
                <Button size="sm">
                  Implémenter
                </Button>
              )}
              {optimization.status === 'in_progress' && (
                <Button size="sm" variant="outline">
                  <Activity className="h-3 w-3 mr-1" />
                  En cours
                </Button>
              )}
              {optimization.status === 'completed' && (
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Terminé
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderScalingConfig = (config: ScalingConfiguration) => {
    return (
      <Card key={config.id}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{config.service}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {config.type === 'horizontal' ? 'Horizontal' : 'Vertical'}
              </Badge>
              <Switch checked={config.autoScaling} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {config.currentInstances}
                </div>
                <div className="text-xs text-gray-500">Instances actuelles</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-600">
                  {config.minInstances} - {config.maxInstances}
                </div>
                <div className="text-xs text-gray-500">Plage</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-medium ${
                  config.autoScaling ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {config.autoScaling ? 'Auto' : 'Manuel'}
                </div>
                <div className="text-xs text-gray-500">Mode</div>
              </div>
            </div>

            {/* Thresholds */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Seuil CPU:</span>
                <span>{config.cpuThreshold}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Seuil Mémoire:</span>
                <span>{config.memoryThreshold}%</span>
              </div>
            </div>

            {/* Last scaling event */}
            {config.lastScaleEvent && (
              <div className="text-xs text-gray-500">
                Dernier événement: {new Date(config.lastScaleEvent).toLocaleString('fr-FR')}
              </div>
            )}

            {/* Recent scaling history */}
            {config.scalingHistory.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Historique récent</div>
                {config.scalingHistory.slice(0, 2).map((event, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className={
                        event.action === 'scale_up' ? 'text-green-600' : 'text-blue-600'
                      }>
                        {event.action === 'scale_up' ? '↗ Scale Up' : '↘ Scale Down'}
                      </span>
                      <span>{event.instances} instances</span>
                    </div>
                    <div className="text-gray-600 mt-1">{event.reason}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Scale Up
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Settings className="h-3 w-3 mr-1" />
                Configurer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalOptimizations = optimizations.length;
    const completedOptimizations = optimizations.filter(o => o.status === 'completed').length;
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
    const autoScalingServices = scalingConfigs.filter(s => s.autoScaling).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Métriques Critiques</p>
                <p className={`text-2xl font-bold ${criticalMetrics > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {criticalMetrics}
                </p>
              </div>
              <Gauge className={`h-8 w-8 ${criticalMetrics > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Optimisations</p>
                <p className="text-2xl font-bold">{completedOptimizations}/{totalOptimizations}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-Scaling</p>
                <p className="text-2xl font-bold text-green-600">{autoScalingServices}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold">{scalingConfigs.length}</p>
              </div>
              <Server className="h-8 w-8 text-purple-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Optimisation & Mise à l'Échelle</h1>
          <p className="text-gray-600">Surveillez et optimisez les performances de votre système</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="optimizations">Optimisations</TabsTrigger>
          <TabsTrigger value="scaling">Mise à l'Échelle</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map(renderMetricCard)}
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizations.map(renderOptimizationCard)}
          </div>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scalingConfigs.map(renderScalingConfig)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses de Performance</CardTitle>
              <CardDescription>Analyses détaillées et tendances de performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses avancées en cours de développement</p>
                <p className="text-sm">Tableaux de bord détaillés et prédictions de performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemOptimizationScaling;
