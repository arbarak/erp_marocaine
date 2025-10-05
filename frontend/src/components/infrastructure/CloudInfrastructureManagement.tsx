// Cloud Infrastructure Management Component

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
  Cloud, Server, Database, HardDrive, Cpu, MemoryStick,
  Network, Shield, Zap, Activity, BarChart3, Settings,
  RefreshCw, Eye, Plus, Download, Upload, CheckCircle,
  AlertTriangle, Clock, Users, Globe, Monitor, Award
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface CloudResource {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'database' | 'network' | 'security' | 'monitoring';
  provider: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'ovh';
  region: string;
  status: 'running' | 'stopped' | 'pending' | 'terminated' | 'error';
  configuration: {
    size: string;
    vcpus: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
  cost: {
    hourly: number;
    monthly: number;
    currency: string;
  };
  metrics: ResourceMetrics;
  tags: { [key: string]: string };
  createdAt: string;
  updatedAt: string;
}

interface ResourceMetrics {
  cpu: {
    usage: number;
    average: number;
    peak: number;
  };
  memory: {
    usage: number;
    available: number;
    total: number;
  };
  storage: {
    used: number;
    available: number;
    total: number;
  };
  network: {
    inbound: number;
    outbound: number;
    bandwidth: number;
  };
  uptime: number;
  availability: number;
}

interface AutoScalingGroup {
  id: string;
  name: string;
  description: string;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
  currentSize: number;
  instanceType: string;
  healthCheckType: 'ec2' | 'elb' | 'custom';
  healthCheckGracePeriod: number;
  policies: ScalingPolicy[];
  status: 'active' | 'suspended' | 'updating';
  metrics: {
    scaleOutEvents: number;
    scaleInEvents: number;
    avgInstanceAge: number;
    healthyInstances: number;
  };
  createdAt: string;
}

interface ScalingPolicy {
  id: string;
  name: string;
  type: 'target_tracking' | 'step_scaling' | 'simple_scaling';
  metric: string;
  targetValue: number;
  scaleOutCooldown: number;
  scaleInCooldown: number;
  enabled: boolean;
}

interface CloudCostAnalysis {
  period: string;
  totalCost: number;
  currency: string;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    database: number;
    other: number;
  };
  trends: CostTrend[];
  recommendations: CostRecommendation[];
  budgets: Budget[];
}

interface CostTrend {
  date: string;
  cost: number;
  forecast?: number;
}

interface CostRecommendation {
  id: string;
  type: 'rightsizing' | 'reserved_instances' | 'spot_instances' | 'storage_optimization';
  title: string;
  description: string;
  potentialSavings: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  alerts: BudgetAlert[];
}

interface BudgetAlert {
  threshold: number;
  type: 'actual' | 'forecast';
  triggered: boolean;
  lastTriggered?: string;
}

interface SecurityCompliance {
  id: string;
  framework: 'iso27001' | 'soc2' | 'gdpr' | 'hipaa' | 'pci_dss';
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  score: number;
  controls: ComplianceControl[];
  lastAssessment: string;
  nextAssessment: string;
}

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'not_implemented' | 'partial' | 'not_applicable';
  evidence: string[];
  lastReview: string;
}

const CloudInfrastructureManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [autoScalingGroups, setAutoScalingGroups] = useState<AutoScalingGroup[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CloudCostAnalysis | null>(null);
  const [securityCompliance, setSecurityCompliance] = useState<SecurityCompliance[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock cloud resources
  const mockResources: CloudResource[] = [
    {
      id: 'aws-ec2-web-01',
      name: 'Web Server 01',
      type: 'compute',
      provider: 'aws',
      region: 'eu-west-1',
      status: 'running',
      configuration: {
        size: 't3.large',
        vcpus: 2,
        memory: 8,
        storage: 100,
        bandwidth: 1000
      },
      cost: {
        hourly: 0.0832,
        monthly: 60.74,
        currency: 'EUR'
      },
      metrics: {
        cpu: { usage: 45.2, average: 42.8, peak: 78.5 },
        memory: { usage: 5.8, available: 2.2, total: 8.0 },
        storage: { used: 65, available: 35, total: 100 },
        network: { inbound: 125, outbound: 89, bandwidth: 1000 },
        uptime: 99.95,
        availability: 99.9
      },
      tags: { Environment: 'production', Team: 'platform', Application: 'web' },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-18T14:30:00Z'
    },
    {
      id: 'aws-rds-main',
      name: 'Base de Données Principale',
      type: 'database',
      provider: 'aws',
      region: 'eu-west-1',
      status: 'running',
      configuration: {
        size: 'db.r5.xlarge',
        vcpus: 4,
        memory: 32,
        storage: 500,
        bandwidth: 2000
      },
      cost: {
        hourly: 0.312,
        monthly: 227.76,
        currency: 'EUR'
      },
      metrics: {
        cpu: { usage: 28.5, average: 25.2, peak: 65.8 },
        memory: { usage: 18.5, available: 13.5, total: 32.0 },
        storage: { used: 320, available: 180, total: 500 },
        network: { inbound: 450, outbound: 380, bandwidth: 2000 },
        uptime: 99.98,
        availability: 99.95
      },
      tags: { Environment: 'production', Team: 'data', Application: 'database' },
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2024-12-19T11:20:00Z'
    },
    {
      id: 'azure-vm-api-01',
      name: 'API Server 01',
      type: 'compute',
      provider: 'azure',
      region: 'westeurope',
      status: 'running',
      configuration: {
        size: 'Standard_D2s_v3',
        vcpus: 2,
        memory: 8,
        storage: 50,
        bandwidth: 1000
      },
      cost: {
        hourly: 0.096,
        monthly: 70.08,
        currency: 'EUR'
      },
      metrics: {
        cpu: { usage: 52.1, average: 48.7, peak: 85.2 },
        memory: { usage: 6.2, available: 1.8, total: 8.0 },
        storage: { used: 35, available: 15, total: 50 },
        network: { inbound: 280, outbound: 195, bandwidth: 1000 },
        uptime: 99.87,
        availability: 99.8
      },
      tags: { Environment: 'production', Team: 'backend', Application: 'api' },
      createdAt: '2024-03-10T14:00:00Z',
      updatedAt: '2024-12-15T16:45:00Z'
    }
  ];

  // Mock auto-scaling groups
  const mockAutoScalingGroups: AutoScalingGroup[] = [
    {
      id: 'asg-web-servers',
      name: 'Web Servers Auto Scaling',
      description: 'Auto-scaling group pour les serveurs web frontend',
      minSize: 2,
      maxSize: 10,
      desiredCapacity: 4,
      currentSize: 4,
      instanceType: 't3.medium',
      healthCheckType: 'elb',
      healthCheckGracePeriod: 300,
      policies: [
        {
          id: 'cpu-scale-out',
          name: 'CPU Scale Out',
          type: 'target_tracking',
          metric: 'CPUUtilization',
          targetValue: 70,
          scaleOutCooldown: 300,
          scaleInCooldown: 300,
          enabled: true
        }
      ],
      status: 'active',
      metrics: {
        scaleOutEvents: 12,
        scaleInEvents: 8,
        avgInstanceAge: 72,
        healthyInstances: 4
      },
      createdAt: '2024-06-15T10:00:00Z'
    }
  ];

  // Mock cost analysis
  const mockCostAnalysis: CloudCostAnalysis = {
    period: 'December 2024',
    totalCost: 2847.52,
    currency: 'EUR',
    breakdown: {
      compute: 1520.30,
      storage: 485.20,
      network: 125.80,
      database: 650.22,
      other: 66.00
    },
    trends: [
      { date: '2024-12-01', cost: 89.50 },
      { date: '2024-12-02', cost: 92.30 },
      { date: '2024-12-03', cost: 88.75 },
      { date: '2024-12-04', cost: 95.20 },
      { date: '2024-12-05', cost: 91.80 },
      { date: '2024-12-06', cost: 87.90 },
      { date: '2024-12-07', cost: 93.45 }
    ],
    recommendations: [
      {
        id: 'rightsizing-web',
        type: 'rightsizing',
        title: 'Optimiser la taille des serveurs web',
        description: 'Les serveurs web utilisent seulement 45% de leur capacité CPU',
        potentialSavings: 180.50,
        effort: 'low',
        impact: 'medium'
      },
      {
        id: 'reserved-instances',
        type: 'reserved_instances',
        title: 'Instances réservées pour la base de données',
        description: 'Économisez 40% sur les coûts de base de données avec des instances réservées',
        potentialSavings: 910.00,
        effort: 'low',
        impact: 'high'
      }
    ],
    budgets: [
      {
        id: 'monthly-budget',
        name: 'Budget Mensuel Infrastructure',
        amount: 3000,
        spent: 2847.52,
        period: 'monthly',
        alerts: [
          { threshold: 80, type: 'actual', triggered: true, lastTriggered: '2024-12-18T10:00:00Z' },
          { threshold: 100, type: 'forecast', triggered: false }
        ]
      }
    ]
  };

  // Mock security compliance
  const mockSecurityCompliance: SecurityCompliance[] = [
    {
      id: 'iso27001',
      framework: 'iso27001',
      status: 'compliant',
      score: 92,
      controls: [
        {
          id: 'A.9.1.1',
          name: 'Access Control Policy',
          description: 'Politique de contrôle d\'accès documentée et approuvée',
          status: 'implemented',
          evidence: ['policy-doc-v2.1.pdf', 'approval-email.pdf'],
          lastReview: '2024-11-15T00:00:00Z'
        }
      ],
      lastAssessment: '2024-11-15T00:00:00Z',
      nextAssessment: '2025-11-15T00:00:00Z'
    }
  ];

  useEffect(() => {
    setResources(mockResources);
    setAutoScalingGroups(mockAutoScalingGroups);
    setCostAnalysis(mockCostAnalysis);
    setSecurityCompliance(mockSecurityCompliance);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'implemented': return 'text-green-600 bg-green-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      case 'not_implemented': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'updating': return 'text-yellow-600 bg-yellow-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'suspended': return 'text-gray-600 bg-gray-50';
      case 'terminated': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws': return <Cloud className="h-4 w-4 text-orange-600" />;
      case 'azure': return <Cloud className="h-4 w-4 text-blue-600" />;
      case 'gcp': return <Cloud className="h-4 w-4 text-green-600" />;
      case 'digitalocean': return <Cloud className="h-4 w-4 text-blue-500" />;
      case 'ovh': return <Cloud className="h-4 w-4 text-purple-600" />;
      default: return <Cloud className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Server className="h-4 w-4" />;
      case 'storage': return <HardDrive className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'network': return <Network className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'monitoring': return <Monitor className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const renderResourceCard = (resource: CloudResource) => {
    const cpuUsageColor = resource.metrics.cpu.usage > 80 ? 'text-red-600' : 
                         resource.metrics.cpu.usage > 60 ? 'text-yellow-600' : 'text-green-600';
    const memoryUsagePercent = (resource.metrics.memory.usage / resource.metrics.memory.total) * 100;
    const storageUsagePercent = (resource.metrics.storage.used / resource.metrics.storage.total) * 100;

    return (
      <Card key={resource.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getTypeIcon(resource.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{resource.name}</CardTitle>
                <CardDescription className="text-sm flex items-center space-x-2">
                  {getProviderIcon(resource.provider)}
                  <span>{resource.configuration.size} • {resource.region}</span>
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(resource.status)}>
              {resource.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Configuration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{resource.configuration.vcpus}</div>
                <div className="text-gray-500">vCPUs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{resource.configuration.memory}GB</div>
                <div className="text-gray-500">RAM</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{resource.configuration.storage}GB</div>
                <div className="text-gray-500">Storage</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{resource.configuration.bandwidth}Mbps</div>
                <div className="text-gray-500">Bande passante</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>CPU:</span>
                  <span className={`font-medium ${cpuUsageColor}`}>
                    {resource.metrics.cpu.usage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={resource.metrics.cpu.usage} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Mémoire:</span>
                  <span className="font-medium">
                    {resource.metrics.memory.usage.toFixed(1)}GB / {resource.metrics.memory.total}GB
                  </span>
                </div>
                <Progress value={memoryUsagePercent} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Stockage:</span>
                  <span className="font-medium">
                    {resource.metrics.storage.used}GB / {resource.metrics.storage.total}GB
                  </span>
                </div>
                <Progress value={storageUsagePercent} className="h-2" />
              </div>
            </div>

            {/* Cost */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Coût</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Horaire:</span>
                  <div className="font-medium">{resource.cost.hourly.toFixed(4)} {resource.cost.currency}</div>
                </div>
                <div>
                  <span className="text-gray-600">Mensuel:</span>
                  <div className="font-medium">{resource.cost.monthly.toFixed(2)} {resource.cost.currency}</div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Disponibilité:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-green-600">{resource.metrics.uptime.toFixed(2)}%</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {Object.entries(resource.tags).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <Activity className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Créé: {new Date(resource.createdAt).toLocaleDateString('fr-FR')}</div>
              <div>MAJ: {new Date(resource.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAutoScalingCard = (asg: AutoScalingGroup) => {
    const utilizationPercent = (asg.currentSize / asg.maxSize) * 100;

    return (
      <Card key={asg.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{asg.name}</CardTitle>
                <CardDescription className="text-sm">
                  {asg.instanceType} • {asg.currentSize}/{asg.maxSize} instances
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(asg.status)}>
              {asg.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{asg.description}</p>
            
            {/* Capacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Capacité actuelle:</span>
                <span className="font-medium">{asg.currentSize} / {asg.maxSize}</span>
              </div>
              <Progress value={utilizationPercent} className="h-2" />
              <div className="text-xs text-gray-500">
                Min: {asg.minSize} • Désiré: {asg.desiredCapacity} • Max: {asg.maxSize}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{asg.metrics.scaleOutEvents}</div>
                <div className="text-gray-500">Scale Out</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{asg.metrics.scaleInEvents}</div>
                <div className="text-gray-500">Scale In</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{asg.metrics.avgInstanceAge}h</div>
                <div className="text-gray-500">Âge Moyen</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{asg.metrics.healthyInstances}</div>
                <div className="text-gray-500">Saines</div>
              </div>
            </div>

            {/* Health check */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Health Check</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <div className="font-medium">{asg.healthCheckType.toUpperCase()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Période de grâce:</span>
                  <div className="font-medium">{asg.healthCheckGracePeriod}s</div>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Politiques de scaling:</div>
              <div className="space-y-1">
                {asg.policies.map(policy => (
                  <div key={policy.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{policy.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {policy.targetValue}% {policy.metric}
                      </Badge>
                      <Badge className={policy.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {policy.enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Configurer
              </Button>
              <Button size="sm" variant="outline">
                <Activity className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Créé: {new Date(asg.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCostChart = () => {
    if (!costAnalysis) return null;

    const chartData = costAnalysis.trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      cost: trend.cost,
      forecast: trend.forecast
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Coûts</CardTitle>
          <CardDescription>Coûts quotidiens et prévisions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} €`, name === 'cost' ? 'Coût réel' : 'Prévision']} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} name="Coût réel" />
              <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Prévision" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderCostBredown = () => {
    if (!costAnalysis) return null;

    const pieData = [
      { name: 'Compute', value: costAnalysis.breakdown.compute, color: '#3B82F6' },
      { name: 'Database', value: costAnalysis.breakdown.database, color: '#10B981' },
      { name: 'Storage', value: costAnalysis.breakdown.storage, color: '#F59E0B' },
      { name: 'Network', value: costAnalysis.breakdown.network, color: '#EF4444' },
      { name: 'Other', value: costAnalysis.breakdown.other, color: '#8B5CF6' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition des Coûts</CardTitle>
          <CardDescription>Coûts par catégorie pour {costAnalysis.period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} €`, 'Coût']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toFixed(2)} €</span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>{costAnalysis.totalCost.toFixed(2)} {costAnalysis.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalResources = resources.length;
    const runningResources = resources.filter(r => r.status === 'running').length;
    const totalMonthlyCost = resources.reduce((sum, r) => sum + r.cost.monthly, 0);
    const avgCpuUsage = resources.reduce((sum, r) => sum + r.metrics.cpu.usage, 0) / resources.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ressources Actives</p>
                <p className="text-2xl font-bold">{runningResources}/{totalResources}</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût Mensuel</p>
                <p className="text-2xl font-bold text-green-600">{totalMonthlyCost.toFixed(0)}€</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Moyen</p>
                <p className="text-2xl font-bold text-purple-600">{avgCpuUsage.toFixed(1)}%</p>
              </div>
              <Cpu className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Scaling</p>
                <p className="text-2xl font-bold text-orange-600">{autoScalingGroups.length}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Infrastructure Cloud</h1>
          <p className="text-gray-600">Gestion et optimisation des ressources cloud multi-providers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button size="sm" onClick={() => setShowResourceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Ressource
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="autoscaling">Auto Scaling</TabsTrigger>
          <TabsTrigger value="costs">Coûts</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les providers</SelectItem>
                <SelectItem value="aws">AWS</SelectItem>
                <SelectItem value="azure">Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud</SelectItem>
                <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                <SelectItem value="ovh">OVH</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                <SelectItem value="eu-west-1">EU West 1</SelectItem>
                <SelectItem value="westeurope">West Europe</SelectItem>
                <SelectItem value="us-east-1">US East 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter(r => selectedProvider === 'all' || r.provider === selectedProvider)
              .filter(r => selectedRegion === 'all' || r.region === selectedRegion)
              .map(renderResourceCard)}
          </div>
        </TabsContent>

        <TabsContent value="autoscaling" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Groupes Auto Scaling</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Groupe
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {autoScalingGroups.map(renderAutoScalingCard)}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCostChart()}
            {renderCostBredown()}
          </div>
          
          {/* Cost recommendations */}
          {costAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Recommandations d'Optimisation</CardTitle>
                <CardDescription>Opportunités d'économies identifiées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costAnalysis.recommendations.map(rec => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">
                              Économies: {rec.potentialSavings.toFixed(2)}€
                            </Badge>
                            <Badge variant="outline">
                              Effort: {rec.effort}
                            </Badge>
                            <Badge variant="outline">
                              Impact: {rec.impact}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm">
                          Appliquer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conformité Sécurité</CardTitle>
              <CardDescription>État de conformité aux standards de sécurité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityCompliance.map(compliance => (
                  <div key={compliance.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{compliance.framework.toUpperCase()}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(compliance.status)}>
                          {compliance.status}
                        </Badge>
                        <span className="text-sm font-medium">{compliance.score}%</span>
                      </div>
                    </div>
                    <Progress value={compliance.score} className="h-2 mb-3" />
                    <div className="text-sm text-gray-600">
                      <div>Dernière évaluation: {new Date(compliance.lastAssessment).toLocaleDateString('fr-FR')}</div>
                      <div>Prochaine évaluation: {new Date(compliance.nextAssessment).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Infrastructure</CardTitle>
              <CardDescription>Surveillance en temps réel des ressources cloud</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring cloud en cours de développement</p>
                <p className="text-sm">Métriques temps réel et alertes intelligentes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudInfrastructureManagement;
