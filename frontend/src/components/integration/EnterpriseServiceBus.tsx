// Enterprise Service Bus Component

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
  Network, Zap, Activity, BarChart3, Settings, RefreshCw,
  ArrowRight, ArrowLeft, Plus, Eye, Download, Upload,
  CheckCircle, AlertTriangle, Clock, Users, Database,
  Server, Globe, Code, FileText, Target, Award, Layers
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ServiceEndpoint {
  id: string;
  name: string;
  type: 'rest' | 'soap' | 'graphql' | 'grpc' | 'websocket' | 'message_queue';
  url: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  authentication: {
    type: 'none' | 'basic' | 'oauth2' | 'api_key' | 'jwt' | 'certificate';
    credentials?: any;
  };
  healthCheck: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    lastCheck?: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
  };
  metrics: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    lastHour: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface MessageRoute {
  id: string;
  name: string;
  description: string;
  source: {
    endpoint: string;
    pattern: string;
    filter?: string;
  };
  destination: {
    endpoint: string;
    transformation?: string;
    enrichment?: string;
  };
  routing: {
    type: 'direct' | 'content_based' | 'header_based' | 'round_robin' | 'failover';
    rules: RoutingRule[];
  };
  processing: {
    async: boolean;
    retries: number;
    timeout: number;
    deadLetterQueue?: string;
  };
  monitoring: {
    messagesProcessed: number;
    averageProcessingTime: number;
    errorCount: number;
    lastProcessed?: string;
  };
  status: 'active' | 'paused' | 'error';
  priority: number;
  createdAt: string;
}

interface RoutingRule {
  id: string;
  condition: string;
  action: 'route' | 'transform' | 'filter' | 'enrich' | 'split' | 'aggregate';
  parameters: { [key: string]: any };
  priority: number;
}

interface MessageTransformation {
  id: string;
  name: string;
  description: string;
  type: 'xslt' | 'jsonata' | 'javascript' | 'groovy' | 'python';
  sourceFormat: 'json' | 'xml' | 'csv' | 'text' | 'binary';
  targetFormat: 'json' | 'xml' | 'csv' | 'text' | 'binary';
  script: string;
  testData: {
    input: string;
    expectedOutput: string;
  };
  validation: {
    inputSchema?: string;
    outputSchema?: string;
  };
  performance: {
    avgExecutionTime: number;
    successRate: number;
    errorCount: number;
  };
  version: string;
  status: 'active' | 'draft' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

interface IntegrationFlow {
  id: string;
  name: string;
  description: string;
  type: 'batch' | 'real_time' | 'scheduled' | 'event_driven';
  steps: FlowStep[];
  triggers: FlowTrigger[];
  configuration: {
    parallelism: number;
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'fixed' | 'exponential' | 'linear';
      delay: number;
    };
  };
  monitoring: {
    executionCount: number;
    successRate: number;
    avgExecutionTime: number;
    lastExecution?: string;
    nextExecution?: string;
  };
  status: 'active' | 'paused' | 'error' | 'draft';
  version: string;
  createdBy: string;
  createdAt: string;
}

interface FlowStep {
  id: string;
  name: string;
  type: 'endpoint_call' | 'transformation' | 'validation' | 'enrichment' | 'split' | 'join' | 'condition';
  configuration: any;
  dependencies: string[];
  errorHandling: {
    onError: 'stop' | 'continue' | 'retry' | 'fallback';
    fallbackStep?: string;
  };
}

interface FlowTrigger {
  id: string;
  type: 'schedule' | 'file_watch' | 'message_queue' | 'webhook' | 'database_change';
  configuration: any;
  enabled: boolean;
}

const EnterpriseServiceBus: React.FC = () => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [endpoints, setEndpoints] = useState<ServiceEndpoint[]>([]);
  const [routes, setRoutes] = useState<MessageRoute[]>([]);
  const [transformations, setTransformations] = useState<MessageTransformation[]>([]);
  const [flows, setFlows] = useState<IntegrationFlow[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [showEndpointDialog, setShowEndpointDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock service endpoints
  const mockEndpoints: ServiceEndpoint[] = [
    {
      id: 'erp_core_api',
      name: 'ERP Core API',
      type: 'rest',
      url: 'https://api.erp.company.com/v1',
      description: 'API principale du système ERP pour les opérations CRUD',
      version: '1.2.0',
      status: 'active',
      authentication: {
        type: 'jwt'
      },
      healthCheck: {
        enabled: true,
        interval: 30,
        timeout: 5,
        retries: 3,
        lastCheck: '2024-12-20T15:45:00Z',
        status: 'healthy'
      },
      metrics: {
        uptime: 99.95,
        avgResponseTime: 145,
        errorRate: 0.02,
        throughput: 1250,
        lastHour: 1180
      },
      tags: ['core', 'erp', 'rest'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-18T14:30:00Z'
    },
    {
      id: 'accounting_service',
      name: 'Service Comptabilité',
      type: 'soap',
      url: 'https://accounting.company.com/soap/v2',
      description: 'Service SOAP pour les opérations comptables et fiscales',
      version: '2.1.0',
      status: 'active',
      authentication: {
        type: 'certificate'
      },
      healthCheck: {
        enabled: true,
        interval: 60,
        timeout: 10,
        retries: 2,
        lastCheck: '2024-12-20T15:40:00Z',
        status: 'healthy'
      },
      metrics: {
        uptime: 99.87,
        avgResponseTime: 320,
        errorRate: 0.08,
        throughput: 450,
        lastHour: 425
      },
      tags: ['accounting', 'soap', 'legacy'],
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2024-12-19T11:20:00Z'
    },
    {
      id: 'warehouse_mq',
      name: 'Message Queue Entrepôt',
      type: 'message_queue',
      url: 'amqp://warehouse.company.com:5672',
      description: 'File de messages pour les événements d\'entrepôt et logistique',
      version: '1.0.0',
      status: 'active',
      authentication: {
        type: 'basic'
      },
      healthCheck: {
        enabled: true,
        interval: 15,
        timeout: 3,
        retries: 5,
        lastCheck: '2024-12-20T15:44:00Z',
        status: 'healthy'
      },
      metrics: {
        uptime: 99.92,
        avgResponseTime: 25,
        errorRate: 0.05,
        throughput: 2800,
        lastHour: 2650
      },
      tags: ['warehouse', 'messaging', 'events'],
      createdAt: '2024-03-10T14:00:00Z',
      updatedAt: '2024-12-15T16:45:00Z'
    },
    {
      id: 'external_bank_api',
      name: 'API Bancaire Externe',
      type: 'rest',
      url: 'https://api.bank.com/v3',
      description: 'API de la banque pour les virements et consultations de comptes',
      version: '3.0.0',
      status: 'active',
      authentication: {
        type: 'oauth2'
      },
      healthCheck: {
        enabled: true,
        interval: 120,
        timeout: 15,
        retries: 2,
        lastCheck: '2024-12-20T15:30:00Z',
        status: 'healthy'
      },
      metrics: {
        uptime: 98.75,
        avgResponseTime: 890,
        errorRate: 1.2,
        throughput: 180,
        lastHour: 165
      },
      tags: ['banking', 'external', 'financial'],
      createdAt: '2024-05-05T11:30:00Z',
      updatedAt: '2024-12-10T09:15:00Z'
    }
  ];

  // Mock message routes
  const mockRoutes: MessageRoute[] = [
    {
      id: 'order_to_warehouse',
      name: 'Commandes vers Entrepôt',
      description: 'Route les nouvelles commandes vers le système d\'entrepôt',
      source: {
        endpoint: 'erp_core_api',
        pattern: '/orders/created',
        filter: 'status == "confirmed"'
      },
      destination: {
        endpoint: 'warehouse_mq',
        transformation: 'order_to_warehouse_transform',
        enrichment: 'add_warehouse_location'
      },
      routing: {
        type: 'content_based',
        rules: [
          {
            id: 'priority_routing',
            condition: 'order.priority == "urgent"',
            action: 'route',
            parameters: { queue: 'urgent_orders' },
            priority: 1
          }
        ]
      },
      processing: {
        async: true,
        retries: 3,
        timeout: 30,
        deadLetterQueue: 'failed_orders'
      },
      monitoring: {
        messagesProcessed: 15420,
        averageProcessingTime: 125,
        errorCount: 23,
        lastProcessed: '2024-12-20T15:42:00Z'
      },
      status: 'active',
      priority: 1,
      createdAt: '2024-06-15T10:00:00Z'
    },
    {
      id: 'payment_to_accounting',
      name: 'Paiements vers Comptabilité',
      description: 'Synchronise les paiements avec le système comptable',
      source: {
        endpoint: 'external_bank_api',
        pattern: '/payments/received'
      },
      destination: {
        endpoint: 'accounting_service',
        transformation: 'payment_to_journal_entry'
      },
      routing: {
        type: 'direct',
        rules: []
      },
      processing: {
        async: false,
        retries: 5,
        timeout: 60,
        deadLetterQueue: 'failed_payments'
      },
      monitoring: {
        messagesProcessed: 8950,
        averageProcessingTime: 340,
        errorCount: 12,
        lastProcessed: '2024-12-20T15:35:00Z'
      },
      status: 'active',
      priority: 2,
      createdAt: '2024-07-20T14:30:00Z'
    }
  ];

  // Mock transformations
  const mockTransformations: MessageTransformation[] = [
    {
      id: 'order_to_warehouse_transform',
      name: 'Commande vers Format Entrepôt',
      description: 'Transforme les données de commande au format attendu par l\'entrepôt',
      type: 'jsonata',
      sourceFormat: 'json',
      targetFormat: 'json',
      script: `{
  "warehouseOrder": {
    "orderId": order.id,
    "items": order.items.{
      "sku": product.sku,
      "quantity": quantity,
      "location": warehouse.defaultLocation
    },
    "priority": order.priority,
    "customerInfo": {
      "name": customer.name,
      "address": shipping.address
    }
  }
}`,
      testData: {
        input: '{"order": {"id": "ORD-001", "items": [{"product": {"sku": "SKU-123"}, "quantity": 2}]}}',
        expectedOutput: '{"warehouseOrder": {"orderId": "ORD-001", "items": [{"sku": "SKU-123", "quantity": 2}]}}'
      },
      validation: {
        inputSchema: 'order_schema.json',
        outputSchema: 'warehouse_order_schema.json'
      },
      performance: {
        avgExecutionTime: 15,
        successRate: 99.8,
        errorCount: 3
      },
      version: '1.2.0',
      status: 'active',
      createdAt: '2024-06-15T10:30:00Z',
      updatedAt: '2024-11-20T16:15:00Z'
    },
    {
      id: 'payment_to_journal_entry',
      name: 'Paiement vers Écriture Comptable',
      description: 'Convertit les données de paiement en écriture comptable',
      type: 'xslt',
      sourceFormat: 'xml',
      targetFormat: 'xml',
      script: `<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/payment">
    <journalEntry>
      <date><xsl:value-of select="date"/></date>
      <amount><xsl:value-of select="amount"/></amount>
      <account>411000</account>
      <description>Paiement reçu - <xsl:value-of select="reference"/></description>
    </journalEntry>
  </xsl:template>
</xsl:stylesheet>`,
      testData: {
        input: '<payment><date>2024-12-20</date><amount>1000</amount><reference>PAY-001</reference></payment>',
        expectedOutput: '<journalEntry><date>2024-12-20</date><amount>1000</amount><account>411000</account></journalEntry>'
      },
      validation: {
        inputSchema: 'payment_schema.xsd',
        outputSchema: 'journal_entry_schema.xsd'
      },
      performance: {
        avgExecutionTime: 45,
        successRate: 99.5,
        errorCount: 8
      },
      version: '2.1.0',
      status: 'active',
      createdAt: '2024-07-20T15:00:00Z',
      updatedAt: '2024-12-01T10:30:00Z'
    }
  ];

  // Mock integration flows
  const mockFlows: IntegrationFlow[] = [
    {
      id: 'daily_accounting_sync',
      name: 'Synchronisation Comptable Quotidienne',
      description: 'Synchronise toutes les transactions du jour avec le système comptable',
      type: 'scheduled',
      steps: [
        {
          id: 'extract_transactions',
          name: 'Extraire Transactions',
          type: 'endpoint_call',
          configuration: { endpoint: 'erp_core_api', path: '/transactions/daily' },
          dependencies: [],
          errorHandling: { onError: 'stop' }
        },
        {
          id: 'transform_data',
          name: 'Transformer Données',
          type: 'transformation',
          configuration: { transformation: 'transaction_to_journal' },
          dependencies: ['extract_transactions'],
          errorHandling: { onError: 'retry' }
        },
        {
          id: 'send_to_accounting',
          name: 'Envoyer vers Comptabilité',
          type: 'endpoint_call',
          configuration: { endpoint: 'accounting_service', method: 'POST' },
          dependencies: ['transform_data'],
          errorHandling: { onError: 'fallback', fallbackStep: 'manual_review' }
        }
      ],
      triggers: [
        {
          id: 'daily_schedule',
          type: 'schedule',
          configuration: { cron: '0 2 * * *', timezone: 'Europe/Paris' },
          enabled: true
        }
      ],
      configuration: {
        parallelism: 1,
        timeout: 3600,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          delay: 60
        }
      },
      monitoring: {
        executionCount: 365,
        successRate: 98.9,
        avgExecutionTime: 1250,
        lastExecution: '2024-12-20T02:00:00Z',
        nextExecution: '2024-12-21T02:00:00Z'
      },
      status: 'active',
      version: '1.0.0',
      createdBy: 'admin@company.com',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    setEndpoints(mockEndpoints);
    setRoutes(mockRoutes);
    setTransformations(mockTransformations);
    setFlows(mockFlows);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'unhealthy': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'deprecated': return 'text-red-600 bg-red-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      case 'unknown': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rest': return <Globe className="h-4 w-4" />;
      case 'soap': return <Code className="h-4 w-4" />;
      case 'graphql': return <Layers className="h-4 w-4" />;
      case 'grpc': return <Network className="h-4 w-4" />;
      case 'websocket': return <Zap className="h-4 w-4" />;
      case 'message_queue': return <Activity className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const renderEndpointCard = (endpoint: ServiceEndpoint) => {
    return (
      <Card key={endpoint.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getTypeIcon(endpoint.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                <CardDescription className="text-sm">
                  {endpoint.type.toUpperCase()} • v{endpoint.version}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(endpoint.status)}>
                {endpoint.status}
              </Badge>
              <Badge className={getStatusColor(endpoint.healthCheck.status)}>
                {endpoint.healthCheck.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{endpoint.description}</p>
            
            {/* URL */}
            <div className="bg-gray-50 p-2 rounded text-sm font-mono">
              {endpoint.url}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{endpoint.metrics.uptime.toFixed(2)}%</div>
                <div className="text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{endpoint.metrics.avgResponseTime}ms</div>
                <div className="text-gray-500">Réponse</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{endpoint.metrics.errorRate.toFixed(2)}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{endpoint.metrics.throughput}</div>
                <div className="text-gray-500">Req/min</div>
              </div>
            </div>

            {/* Health check */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Health Check</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Intervalle:</span>
                  <div>{endpoint.healthCheck.interval}s</div>
                </div>
                <div>
                  <span className="text-gray-600">Timeout:</span>
                  <div>{endpoint.healthCheck.timeout}s</div>
                </div>
              </div>
              {endpoint.healthCheck.lastCheck && (
                <div className="text-xs text-gray-500 mt-2">
                  Dernière vérification: {new Date(endpoint.healthCheck.lastCheck).toLocaleTimeString('fr-FR')}
                </div>
              )}
            </div>

            {/* Authentication */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Authentification:</span>
              <Badge variant="outline">
                {endpoint.authentication.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {endpoint.tags.map(tag => (
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
              <div>Créé: {new Date(endpoint.createdAt).toLocaleDateString('fr-FR')}</div>
              <div>MAJ: {new Date(endpoint.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRouteCard = (route: MessageRoute) => {
    const successRate = ((route.monitoring.messagesProcessed - route.monitoring.errorCount) / route.monitoring.messagesProcessed) * 100;

    return (
      <Card key={route.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <CardDescription className="text-sm">
                  {route.routing.type} • Priorité {route.priority}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(route.status)}>
              {route.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{route.description}</p>
            
            {/* Route flow */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{route.source.endpoint}</Badge>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <Badge variant="outline">{route.destination.endpoint}</Badge>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Pattern: {route.source.pattern}
              </div>
              {route.source.filter && (
                <div className="text-xs text-gray-600">
                  Filtre: {route.source.filter}
                </div>
              )}
            </div>

            {/* Processing stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{route.monitoring.messagesProcessed.toLocaleString()}</div>
                <div className="text-gray-500">Messages</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{successRate.toFixed(1)}%</div>
                <div className="text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{route.monitoring.averageProcessingTime}ms</div>
                <div className="text-gray-500">Temps Moy.</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{route.monitoring.errorCount}</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Configuration:</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <div>{route.processing.async ? 'Asynchrone' : 'Synchrone'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Tentatives:</span>
                  <div>{route.processing.retries}</div>
                </div>
                <div>
                  <span className="text-gray-600">Timeout:</span>
                  <div>{route.processing.timeout}s</div>
                </div>
                <div>
                  <span className="text-gray-600">DLQ:</span>
                  <div>{route.processing.deadLetterQueue || 'Aucune'}</div>
                </div>
              </div>
            </div>

            {/* Transformations */}
            {route.destination.transformation && (
              <div className="bg-blue-50 p-2 rounded text-sm">
                <div className="font-medium">Transformation:</div>
                <div className="text-blue-700">{route.destination.transformation}</div>
              </div>
            )}

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
              <div>Créé: {new Date(route.createdAt).toLocaleDateString('fr-FR')}</div>
              {route.monitoring.lastProcessed && (
                <div>Dernier message: {new Date(route.monitoring.lastProcessed).toLocaleString('fr-FR')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransformationCard = (transformation: MessageTransformation) => {
    return (
      <Card key={transformation.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{transformation.name}</CardTitle>
                <CardDescription className="text-sm">
                  {transformation.type.toUpperCase()} • v{transformation.version}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(transformation.status)}>
              {transformation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{transformation.description}</p>
            
            {/* Format conversion */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Badge variant="outline">{transformation.sourceFormat.toUpperCase()}</Badge>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <Badge variant="outline">{transformation.targetFormat.toUpperCase()}</Badge>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{transformation.performance.avgExecutionTime}ms</div>
                <div className="text-gray-500">Temps Moy.</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{transformation.performance.successRate.toFixed(1)}%</div>
                <div className="text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{transformation.performance.errorCount}</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Script preview */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Script:</div>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {transformation.script.substring(0, 200)}
                {transformation.script.length > 200 && '...'}
              </div>
            </div>

            {/* Validation */}
            {(transformation.validation.inputSchema || transformation.validation.outputSchema) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Validation:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {transformation.validation.inputSchema && (
                    <div>
                      <span className="text-gray-600">Entrée:</span>
                      <div className="text-blue-600">{transformation.validation.inputSchema}</div>
                    </div>
                  )}
                  {transformation.validation.outputSchema && (
                    <div>
                      <span className="text-gray-600">Sortie:</span>
                      <div className="text-blue-600">{transformation.validation.outputSchema}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Éditer
              </Button>
              <Button size="sm" variant="outline">
                <Activity className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Créé: {new Date(transformation.createdAt).toLocaleDateString('fr-FR')}</div>
              <div>MAJ: {new Date(transformation.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFlowCard = (flow: IntegrationFlow) => {
    return (
      <Card key={flow.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{flow.name}</CardTitle>
                <CardDescription className="text-sm">
                  {flow.type} • {flow.steps.length} étapes
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(flow.status)}>
              {flow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{flow.description}</p>
            
            {/* Execution stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{flow.monitoring.executionCount}</div>
                <div className="text-gray-500">Exécutions</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{flow.monitoring.successRate.toFixed(1)}%</div>
                <div className="text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{Math.round(flow.monitoring.avgExecutionTime / 60)}min</div>
                <div className="text-gray-500">Durée Moy.</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{flow.triggers.filter(t => t.enabled).length}</div>
                <div className="text-gray-500">Déclencheurs</div>
              </div>
            </div>

            {/* Steps preview */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Étapes du flux:</div>
              <div className="space-y-1">
                {flow.steps.slice(0, 3).map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span>{step.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {step.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {flow.steps.length > 3 && (
                  <div className="text-xs text-gray-500 ml-8">
                    +{flow.steps.length - 3} autres étapes
                  </div>
                )}
              </div>
            </div>

            {/* Next execution */}
            {flow.monitoring.nextExecution && (
              <div className="bg-blue-50 p-2 rounded text-sm">
                <div className="font-medium">Prochaine exécution:</div>
                <div className="text-blue-700">
                  {new Date(flow.monitoring.nextExecution).toLocaleString('fr-FR')}
                </div>
              </div>
            )}

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">Parallélisme:</span>
                <div>{flow.configuration.parallelism}</div>
              </div>
              <div>
                <span className="text-gray-600">Timeout:</span>
                <div>{Math.round(flow.configuration.timeout / 60)}min</div>
              </div>
              <div>
                <span className="text-gray-600">Tentatives max:</span>
                <div>{flow.configuration.retryPolicy.maxRetries}</div>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <div>{flow.version}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Gérer
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
              <div>Créé par: {flow.createdBy}</div>
              <div>Date: {new Date(flow.createdAt).toLocaleDateString('fr-FR')}</div>
              {flow.monitoring.lastExecution && (
                <div>Dernière exécution: {new Date(flow.monitoring.lastExecution).toLocaleString('fr-FR')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
    const healthyEndpoints = endpoints.filter(e => e.healthCheck.status === 'healthy').length;
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const totalMessages = routes.reduce((sum, r) => sum + r.monitoring.messagesProcessed, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Endpoints Actifs</p>
                <p className="text-2xl font-bold">{activeEndpoints}/{endpoints.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Sains</p>
                <p className="text-2xl font-bold text-green-600">{healthyEndpoints}/{endpoints.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Routes Actives</p>
                <p className="text-2xl font-bold text-purple-600">{activeRoutes}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Traités</p>
                <p className="text-2xl font-bold text-orange-600">{totalMessages.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Service Bus</h1>
          <p className="text-gray-600">Orchestration et intégration des services d'entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" onClick={() => setShowEndpointDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Service
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">Services</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="transformations">Transformations</TabsTrigger>
          <TabsTrigger value="flows">Flux</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map(renderEndpointCard)}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Routes de Messages</h2>
            <Button onClick={() => setShowRouteDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Route
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map(renderRouteCard)}
          </div>
        </TabsContent>

        <TabsContent value="transformations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transformations de Données</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Transformation
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformations.map(renderTransformationCard)}
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Flux d'Intégration</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Flux
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flows.map(renderFlowCard)}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring ESB</CardTitle>
              <CardDescription>Surveillance en temps réel des intégrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring ESB en cours de développement</p>
                <p className="text-sm">Métriques temps réel et alertes intelligentes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseServiceBus;
