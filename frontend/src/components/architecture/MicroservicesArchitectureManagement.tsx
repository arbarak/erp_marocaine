// Microservices Architecture Management Component

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
  Layers, Server, Database, Network, Cloud, Container,
  Activity, BarChart3, Settings, RefreshCw, Eye, Plus,
  CheckCircle, AlertTriangle, Clock, Users, Zap, Globe,
  Code, FileText, Target, Award, Monitor, Cpu, HardDrive
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Microservice {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'running' | 'stopped' | 'deploying' | 'error' | 'scaling';
  health: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  instances: ServiceInstance[];
  configuration: {
    minInstances: number;
    maxInstances: number;
    cpuThreshold: number;
    memoryThreshold: number;
    autoScaling: boolean;
  };
  deployment: {
    strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate';
    environment: 'development' | 'staging' | 'production';
    namespace: string;
    image: string;
    tag: string;
  };
  networking: {
    port: number;
    protocol: 'http' | 'https' | 'grpc' | 'tcp';
    loadBalancer: boolean;
    serviceMesh: boolean;
  };
  dependencies: ServiceDependency[];
  metrics: ServiceMetrics;
  logs: LogEntry[];
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceInstance {
  id: string;
  name: string;
  status: 'running' | 'pending' | 'terminating' | 'failed';
  node: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  lastRestart?: string;
  createdAt: string;
}

interface ServiceDependency {
  id: string;
  name: string;
  type: 'service' | 'database' | 'cache' | 'queue' | 'external';
  required: boolean;
  healthCheck: boolean;
  status: 'available' | 'unavailable' | 'degraded';
}

interface ServiceMetrics {
  requests: {
    total: number;
    rps: number;
    errorRate: number;
    avgResponseTime: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
  };
  availability: {
    uptime: number;
    sla: number;
    mttr: number;
    mtbf: number;
  };
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  instance: string;
  metadata?: any;
}

interface ServiceMesh {
  id: string;
  name: string;
  type: 'istio' | 'linkerd' | 'consul_connect' | 'envoy';
  status: 'active' | 'inactive' | 'updating';
  services: string[];
  features: {
    trafficManagement: boolean;
    security: boolean;
    observability: boolean;
    policyEnforcement: boolean;
  };
  configuration: {
    mtls: boolean;
    circuitBreaker: boolean;
    retryPolicy: boolean;
    loadBalancing: string;
  };
  metrics: {
    totalRequests: number;
    successRate: number;
    p99Latency: number;
    errorRate: number;
  };
}

interface DeploymentPipeline {
  id: string;
  name: string;
  description: string;
  service: string;
  stages: PipelineStage[];
  triggers: PipelineTrigger[];
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  lastRun?: {
    id: string;
    startTime: string;
    endTime?: string;
    status: string;
    duration?: number;
    triggeredBy: string;
  };
  configuration: {
    autoPromote: boolean;
    rollbackOnFailure: boolean;
    notifications: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'security_scan' | 'deploy' | 'smoke_test' | 'approval';
  configuration: any;
  dependencies: string[];
  timeout: number;
  retries: number;
}

interface PipelineTrigger {
  id: string;
  type: 'manual' | 'git_push' | 'schedule' | 'webhook' | 'dependency';
  configuration: any;
  enabled: boolean;
}

const MicroservicesArchitectureManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [serviceMesh, setServiceMesh] = useState<ServiceMesh[]>([]);
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock microservices
  const mockMicroservices: Microservice[] = [
    {
      id: 'user_service',
      name: 'Service Utilisateurs',
      description: 'Gestion des utilisateurs, authentification et autorisation',
      version: '2.1.3',
      status: 'running',
      health: 'healthy',
      instances: [
        {
          id: 'user-service-7d8f9-abc12',
          name: 'user-service-7d8f9-abc12',
          status: 'running',
          node: 'worker-node-1',
          cpu: 45.2,
          memory: 68.5,
          uptime: 86400,
          restarts: 0,
          createdAt: '2024-12-19T10:00:00Z'
        },
        {
          id: 'user-service-9k2l4-def34',
          name: 'user-service-9k2l4-def34',
          status: 'running',
          node: 'worker-node-2',
          cpu: 42.8,
          memory: 71.2,
          uptime: 82800,
          restarts: 1,
          lastRestart: '2024-12-19T12:30:00Z',
          createdAt: '2024-12-19T10:15:00Z'
        }
      ],
      configuration: {
        minInstances: 2,
        maxInstances: 10,
        cpuThreshold: 70,
        memoryThreshold: 80,
        autoScaling: true
      },
      deployment: {
        strategy: 'rolling',
        environment: 'production',
        namespace: 'erp-prod',
        image: 'registry.company.com/user-service',
        tag: '2.1.3'
      },
      networking: {
        port: 8080,
        protocol: 'https',
        loadBalancer: true,
        serviceMesh: true
      },
      dependencies: [
        {
          id: 'postgres_users',
          name: 'PostgreSQL Users DB',
          type: 'database',
          required: true,
          healthCheck: true,
          status: 'available'
        },
        {
          id: 'redis_sessions',
          name: 'Redis Sessions',
          type: 'cache',
          required: true,
          healthCheck: true,
          status: 'available'
        }
      ],
      metrics: {
        requests: {
          total: 2500000,
          rps: 125,
          errorRate: 0.02,
          avgResponseTime: 145
        },
        resources: {
          cpuUsage: 44.0,
          memoryUsage: 69.8,
          diskUsage: 25.5,
          networkIn: 1250,
          networkOut: 890
        },
        availability: {
          uptime: 99.95,
          sla: 99.9,
          mttr: 5.2,
          mtbf: 720
        }
      },
      logs: [
        {
          timestamp: '2024-12-20T15:45:00Z',
          level: 'info',
          message: 'User authentication successful for user ID 12345',
          service: 'user_service',
          instance: 'user-service-7d8f9-abc12'
        }
      ],
      tags: ['core', 'authentication', 'users'],
      owner: 'platform-team@company.com',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-18T14:30:00Z'
    },
    {
      id: 'order_service',
      name: 'Service Commandes',
      description: 'Gestion du cycle de vie des commandes et processus métier',
      version: '1.8.2',
      status: 'running',
      health: 'healthy',
      instances: [
        {
          id: 'order-service-5h7j9-xyz89',
          name: 'order-service-5h7j9-xyz89',
          status: 'running',
          node: 'worker-node-1',
          cpu: 52.1,
          memory: 75.3,
          uptime: 92400,
          restarts: 0,
          createdAt: '2024-12-18T08:00:00Z'
        },
        {
          id: 'order-service-3m8n2-uvw56',
          name: 'order-service-3m8n2-uvw56',
          status: 'running',
          node: 'worker-node-3',
          cpu: 48.7,
          memory: 72.8,
          uptime: 89100,
          restarts: 0,
          createdAt: '2024-12-18T09:30:00Z'
        },
        {
          id: 'order-service-7p4q1-rst23',
          name: 'order-service-7p4q1-rst23',
          status: 'running',
          node: 'worker-node-2',
          cpu: 55.4,
          memory: 78.1,
          uptime: 85200,
          restarts: 2,
          lastRestart: '2024-12-19T14:20:00Z',
          createdAt: '2024-12-18T11:00:00Z'
        }
      ],
      configuration: {
        minInstances: 3,
        maxInstances: 15,
        cpuThreshold: 75,
        memoryThreshold: 85,
        autoScaling: true
      },
      deployment: {
        strategy: 'blue_green',
        environment: 'production',
        namespace: 'erp-prod',
        image: 'registry.company.com/order-service',
        tag: '1.8.2'
      },
      networking: {
        port: 8081,
        protocol: 'https',
        loadBalancer: true,
        serviceMesh: true
      },
      dependencies: [
        {
          id: 'postgres_orders',
          name: 'PostgreSQL Orders DB',
          type: 'database',
          required: true,
          healthCheck: true,
          status: 'available'
        },
        {
          id: 'user_service',
          name: 'Service Utilisateurs',
          type: 'service',
          required: true,
          healthCheck: true,
          status: 'available'
        },
        {
          id: 'inventory_service',
          name: 'Service Inventaire',
          type: 'service',
          required: true,
          healthCheck: true,
          status: 'available'
        },
        {
          id: 'rabbitmq_orders',
          name: 'RabbitMQ Orders',
          type: 'queue',
          required: true,
          healthCheck: true,
          status: 'available'
        }
      ],
      metrics: {
        requests: {
          total: 1800000,
          rps: 89,
          errorRate: 0.08,
          avgResponseTime: 280
        },
        resources: {
          cpuUsage: 52.1,
          memoryUsage: 75.4,
          diskUsage: 32.1,
          networkIn: 890,
          networkOut: 1250
        },
        availability: {
          uptime: 99.87,
          sla: 99.5,
          mttr: 8.5,
          mtbf: 480
        }
      },
      logs: [
        {
          timestamp: '2024-12-20T15:42:00Z',
          level: 'info',
          message: 'Order ORD-12345 processed successfully',
          service: 'order_service',
          instance: 'order-service-5h7j9-xyz89'
        }
      ],
      tags: ['core', 'business', 'orders'],
      owner: 'business-team@company.com',
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2024-12-19T11:20:00Z'
    },
    {
      id: 'notification_service',
      name: 'Service Notifications',
      description: 'Envoi de notifications email, SMS et push',
      version: '1.3.1',
      status: 'scaling',
      health: 'healthy',
      instances: [
        {
          id: 'notification-service-2k9l7-mno45',
          name: 'notification-service-2k9l7-mno45',
          status: 'running',
          node: 'worker-node-2',
          cpu: 28.5,
          memory: 45.2,
          uptime: 76800,
          restarts: 0,
          createdAt: '2024-12-19T16:00:00Z'
        }
      ],
      configuration: {
        minInstances: 1,
        maxInstances: 8,
        cpuThreshold: 60,
        memoryThreshold: 70,
        autoScaling: true
      },
      deployment: {
        strategy: 'rolling',
        environment: 'production',
        namespace: 'erp-prod',
        image: 'registry.company.com/notification-service',
        tag: '1.3.1'
      },
      networking: {
        port: 8082,
        protocol: 'https',
        loadBalancer: false,
        serviceMesh: true
      },
      dependencies: [
        {
          id: 'redis_notifications',
          name: 'Redis Notifications',
          type: 'cache',
          required: true,
          healthCheck: true,
          status: 'available'
        },
        {
          id: 'sendgrid_api',
          name: 'SendGrid API',
          type: 'external',
          required: false,
          healthCheck: true,
          status: 'available'
        }
      ],
      metrics: {
        requests: {
          total: 450000,
          rps: 25,
          errorRate: 0.15,
          avgResponseTime: 95
        },
        resources: {
          cpuUsage: 28.5,
          memoryUsage: 45.2,
          diskUsage: 15.8,
          networkIn: 125,
          networkOut: 890
        },
        availability: {
          uptime: 99.2,
          sla: 99.0,
          mttr: 12.5,
          mtbf: 240
        }
      },
      logs: [
        {
          timestamp: '2024-12-20T15:40:00Z',
          level: 'info',
          message: 'Email notification sent successfully to user@example.com',
          service: 'notification_service',
          instance: 'notification-service-2k9l7-mno45'
        }
      ],
      tags: ['communication', 'notifications', 'email'],
      owner: 'platform-team@company.com',
      createdAt: '2024-03-10T14:00:00Z',
      updatedAt: '2024-12-15T16:45:00Z'
    }
  ];

  // Mock service mesh
  const mockServiceMesh: ServiceMesh[] = [
    {
      id: 'istio_mesh',
      name: 'Istio Service Mesh',
      type: 'istio',
      status: 'active',
      services: ['user_service', 'order_service', 'notification_service'],
      features: {
        trafficManagement: true,
        security: true,
        observability: true,
        policyEnforcement: true
      },
      configuration: {
        mtls: true,
        circuitBreaker: true,
        retryPolicy: true,
        loadBalancing: 'round_robin'
      },
      metrics: {
        totalRequests: 4750000,
        successRate: 99.85,
        p99Latency: 450,
        errorRate: 0.15
      }
    }
  ];

  // Mock deployment pipelines
  const mockPipelines: DeploymentPipeline[] = [
    {
      id: 'user_service_pipeline',
      name: 'Pipeline Service Utilisateurs',
      description: 'Pipeline CI/CD pour le service utilisateurs',
      service: 'user_service',
      stages: [
        {
          id: 'build',
          name: 'Build & Test',
          type: 'build',
          configuration: { dockerfile: 'Dockerfile', tests: true },
          dependencies: [],
          timeout: 600,
          retries: 2
        },
        {
          id: 'security_scan',
          name: 'Security Scan',
          type: 'security_scan',
          configuration: { scanner: 'trivy', failOnHigh: true },
          dependencies: ['build'],
          timeout: 300,
          retries: 1
        },
        {
          id: 'deploy_staging',
          name: 'Deploy to Staging',
          type: 'deploy',
          configuration: { environment: 'staging', strategy: 'rolling' },
          dependencies: ['security_scan'],
          timeout: 900,
          retries: 1
        },
        {
          id: 'smoke_test',
          name: 'Smoke Tests',
          type: 'smoke_test',
          configuration: { testSuite: 'smoke', timeout: 300 },
          dependencies: ['deploy_staging'],
          timeout: 300,
          retries: 2
        },
        {
          id: 'approval',
          name: 'Production Approval',
          type: 'approval',
          configuration: { approvers: ['platform-team@company.com'] },
          dependencies: ['smoke_test'],
          timeout: 86400,
          retries: 0
        },
        {
          id: 'deploy_production',
          name: 'Deploy to Production',
          type: 'deploy',
          configuration: { environment: 'production', strategy: 'rolling' },
          dependencies: ['approval'],
          timeout: 1200,
          retries: 1
        }
      ],
      triggers: [
        {
          id: 'git_push',
          type: 'git_push',
          configuration: { branch: 'main', repository: 'user-service' },
          enabled: true
        },
        {
          id: 'manual',
          type: 'manual',
          configuration: {},
          enabled: true
        }
      ],
      status: 'idle',
      lastRun: {
        id: 'run_20241220_001',
        startTime: '2024-12-20T10:00:00Z',
        endTime: '2024-12-20T10:45:00Z',
        status: 'success',
        duration: 2700,
        triggeredBy: 'developer@company.com'
      },
      configuration: {
        autoPromote: false,
        rollbackOnFailure: true,
        notifications: ['platform-team@company.com']
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-12-18T15:00:00Z'
    }
  ];

  useEffect(() => {
    setMicroservices(mockMicroservices);
    setServiceMesh(mockServiceMesh);
    setPipelines(mockPipelines);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'unhealthy': return 'text-red-600 bg-red-50';
      case 'deploying': return 'text-blue-600 bg-blue-50';
      case 'scaling': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'idle': return 'text-gray-600 bg-gray-50';
      case 'unknown': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unknown': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderServiceCard = (service: Microservice) => {
    const runningInstances = service.instances.filter(i => i.status === 'running').length;
    const avgCpu = service.instances.reduce((sum, i) => sum + i.cpu, 0) / service.instances.length;
    const avgMemory = service.instances.reduce((sum, i) => sum + i.memory, 0) / service.instances.length;

    return (
      <Card key={service.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Container className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="text-sm">
                  v{service.version} • {service.deployment.environment}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
              {getHealthIcon(service.health)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{service.description}</p>
            
            {/* Instances */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Instances</span>
                <Badge variant="outline">
                  {runningInstances}/{service.instances.length}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">CPU Moyen:</span>
                  <div className="font-medium">{avgCpu.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Mémoire Moyenne:</span>
                  <div className="font-medium">{avgMemory.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{service.metrics.requests.rps}</div>
                <div className="text-gray-500">RPS</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{service.metrics.availability.uptime.toFixed(2)}%</div>
                <div className="text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{service.metrics.requests.avgResponseTime}ms</div>
                <div className="text-gray-500">Latence</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{service.metrics.requests.errorRate.toFixed(2)}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Auto-scaling */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Auto-scaling:</span>
              <div className="flex items-center space-x-2">
                <Badge className={service.configuration.autoScaling ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                  {service.configuration.autoScaling ? 'Activé' : 'Désactivé'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {service.configuration.minInstances}-{service.configuration.maxInstances}
                </span>
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Dépendances:</div>
              <div className="flex flex-wrap gap-1">
                {service.dependencies.slice(0, 3).map(dep => (
                  <Badge 
                    key={dep.id} 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(dep.status)}`}
                  >
                    {dep.name}
                  </Badge>
                ))}
                {service.dependencies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{service.dependencies.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {service.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
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
              <div>Propriétaire: {service.owner}</div>
              <div>MAJ: {new Date(service.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderServiceMeshCard = (mesh: ServiceMesh) => {
    return (
      <Card key={mesh.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{mesh.name}</CardTitle>
                <CardDescription className="text-sm">
                  {mesh.type} • {mesh.services.length} services
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(mesh.status)}>
              {mesh.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium">Fonctionnalités:</div>
                <div className="space-y-1">
                  {Object.entries(mesh.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <Badge className={enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Configuration:</div>
                <div className="space-y-1">
                  {Object.entries(mesh.configuration).map(([config, value]) => (
                    <div key={config} className="flex items-center justify-between">
                      <span className="capitalize">{config.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <Badge variant="outline" className="text-xs">
                        {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{mesh.metrics.totalRequests.toLocaleString()}</div>
                <div className="text-gray-500">Requêtes</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{mesh.metrics.successRate.toFixed(2)}%</div>
                <div className="text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{mesh.metrics.p99Latency}ms</div>
                <div className="text-gray-500">P99 Latence</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{mesh.metrics.errorRate.toFixed(2)}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Services connectés:</div>
              <div className="flex flex-wrap gap-1">
                {mesh.services.map(serviceId => (
                  <Badge key={serviceId} variant="outline" className="text-xs">
                    {microservices.find(s => s.id === serviceId)?.name || serviceId}
                  </Badge>
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
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPipelineCard = (pipeline: DeploymentPipeline) => {
    return (
      <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                <CardDescription className="text-sm">
                  {pipeline.stages.length} étapes • {pipeline.triggers.filter(t => t.enabled).length} déclencheurs
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(pipeline.status)}>
              {pipeline.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{pipeline.description}</p>
            
            {/* Last run */}
            {pipeline.lastRun && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2">Dernière exécution:</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Statut:</span>
                    <Badge className={getStatusColor(pipeline.lastRun.status)} size="sm">
                      {pipeline.lastRun.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Durée:</span>
                    <div className="font-medium">{Math.round((pipeline.lastRun.duration || 0) / 60)}min</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Démarré:</span>
                    <div className="font-medium">
                      {new Date(pipeline.lastRun.startTime).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Par:</span>
                    <div className="font-medium">{pipeline.lastRun.triggeredBy}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stages */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Étapes du pipeline:</div>
              <div className="space-y-1">
                {pipeline.stages.slice(0, 4).map((stage, index) => (
                  <div key={stage.id} className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span>{stage.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {stage.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {pipeline.stages.length > 4 && (
                  <div className="text-xs text-gray-500 ml-8">
                    +{pipeline.stages.length - 4} autres étapes
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Auto-promotion:</span>
                <div>{pipeline.configuration.autoPromote ? 'Activée' : 'Désactivée'}</div>
              </div>
              <div>
                <span className="text-gray-600">Rollback auto:</span>
                <div>{pipeline.configuration.rollbackOnFailure ? 'Activé' : 'Désactivé'}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Zap className="h-3 w-3 mr-1" />
                Exécuter
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Service: {microservices.find(s => s.id === pipeline.service)?.name}</div>
              <div>MAJ: {new Date(pipeline.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalServices = microservices.length;
    const runningServices = microservices.filter(s => s.status === 'running').length;
    const healthyServices = microservices.filter(s => s.health === 'healthy').length;
    const totalInstances = microservices.reduce((sum, s) => sum + s.instances.length, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Actifs</p>
                <p className="text-2xl font-bold">{runningServices}/{totalServices}</p>
              </div>
              <Container className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Sains</p>
                <p className="text-2xl font-bold text-green-600">{healthyServices}/{totalServices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Instances Totales</p>
                <p className="text-2xl font-bold text-purple-600">{totalInstances}</p>
              </div>
              <Server className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Mesh</p>
                <p className="text-2xl font-bold text-orange-600">{serviceMesh.length}</p>
              </div>
              <Network className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Architecture Microservices</h1>
          <p className="text-gray-600">Gestion et monitoring de l'architecture distribuée</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Monitor className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button size="sm" onClick={() => setShowServiceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Service
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="mesh">Service Mesh</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="topology">Topologie</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {microservices.map(renderServiceCard)}
          </div>
        </TabsContent>

        <TabsContent value="mesh" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Mesh</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Configurer Mesh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceMesh.map(renderServiceMeshCard)}
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pipelines de Déploiement</h2>
            <Button onClick={() => setShowPipelineDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Pipeline
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pipelines.map(renderPipelineCard)}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Microservices</CardTitle>
              <CardDescription>Surveillance en temps réel de l'architecture distribuée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring microservices en cours de développement</p>
                <p className="text-sm">Métriques distribuées et observabilité complète</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topologie des Services</CardTitle>
              <CardDescription>Visualisation des dépendances et communication inter-services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Network className="h-12 w-12 mx-auto mb-4" />
                <p>Carte de topologie en cours de développement</p>
                <p className="text-sm">Visualisation interactive des dépendances et flux de données</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MicroservicesArchitectureManagement;
