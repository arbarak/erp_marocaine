// Enterprise Integrations Hub Component

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
  Plug, Settings, CheckCircle, AlertTriangle, Clock, RefreshCw,
  Database, Cloud, Zap, Shield, Eye, Edit, Trash2, Plus,
  Download, Upload, Sync, Activity, BarChart3, Users,
  FileText, DollarSign, Package, ShoppingCart, Mail, Phone
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'erp' | 'crm' | 'accounting' | 'ecommerce' | 'communication' | 'analytics' | 'storage';
  provider: string;
  version: string;
  status: 'active' | 'inactive' | 'error' | 'pending' | 'configuring';
  lastSync: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  recordsProcessed: number;
  errorCount: number;
  config: IntegrationConfig;
  endpoints: IntegrationEndpoint[];
  webhooks: Webhook[];
}

interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  customFields: { [key: string]: any };
}

interface IntegrationEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  enabled: boolean;
  lastCalled?: string;
  responseTime?: number;
  successRate: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  secret?: string;
  lastTriggered?: string;
  deliveryCount: number;
  failureCount: number;
}

interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: string;
  type: 'sync' | 'webhook' | 'manual';
  status: 'success' | 'error' | 'warning';
  recordsProcessed: number;
  duration: number;
  message: string;
  details?: any;
}

const EnterpriseIntegrationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock integrations data
  const mockIntegrations: Integration[] = [
    {
      id: 'sap_integration',
      name: 'SAP ERP',
      description: 'Intégration avec SAP pour la synchronisation des données financières et opérationnelles',
      category: 'erp',
      provider: 'SAP SE',
      version: '2.1.0',
      status: 'active',
      lastSync: '2024-12-20T14:30:00Z',
      syncFrequency: 'hourly',
      dataFlow: 'bidirectional',
      recordsProcessed: 15420,
      errorCount: 2,
      config: {
        baseUrl: 'https://api.sap.com/v1',
        clientId: 'erp_client_123',
        customFields: { environment: 'production', timeout: 30000 }
      },
      endpoints: [
        {
          id: 'customers',
          name: 'Synchronisation Clients',
          method: 'GET',
          url: '/customers',
          description: 'Récupération des données clients',
          enabled: true,
          lastCalled: '2024-12-20T14:30:00Z',
          responseTime: 245,
          successRate: 99.2
        },
        {
          id: 'orders',
          name: 'Synchronisation Commandes',
          method: 'POST',
          url: '/orders',
          description: 'Envoi des nouvelles commandes',
          enabled: true,
          lastCalled: '2024-12-20T14:25:00Z',
          responseTime: 180,
          successRate: 98.8
        }
      ],
      webhooks: [
        {
          id: 'order_updates',
          name: 'Mises à jour Commandes',
          url: 'https://notre-erp.com/webhooks/sap/orders',
          events: ['order.created', 'order.updated', 'order.cancelled'],
          enabled: true,
          secret: 'webhook_secret_123',
          lastTriggered: '2024-12-20T13:45:00Z',
          deliveryCount: 1250,
          failureCount: 8
        }
      ]
    },
    {
      id: 'salesforce_crm',
      name: 'Salesforce CRM',
      description: 'Synchronisation des contacts, opportunités et comptes avec Salesforce',
      category: 'crm',
      provider: 'Salesforce',
      version: '1.8.2',
      status: 'active',
      lastSync: '2024-12-20T14:15:00Z',
      syncFrequency: 'realtime',
      dataFlow: 'bidirectional',
      recordsProcessed: 8750,
      errorCount: 0,
      config: {
        baseUrl: 'https://api.salesforce.com/v1',
        accessToken: 'sf_token_456',
        customFields: { sandbox: false, apiVersion: '58.0' }
      },
      endpoints: [
        {
          id: 'accounts',
          name: 'Comptes',
          method: 'GET',
          url: '/accounts',
          description: 'Synchronisation des comptes',
          enabled: true,
          lastCalled: '2024-12-20T14:15:00Z',
          responseTime: 120,
          successRate: 100
        }
      ],
      webhooks: []
    },
    {
      id: 'quickbooks_accounting',
      name: 'QuickBooks Online',
      description: 'Intégration comptable avec QuickBooks pour la synchronisation financière',
      category: 'accounting',
      provider: 'Intuit',
      version: '3.2.1',
      status: 'error',
      lastSync: '2024-12-20T12:00:00Z',
      syncFrequency: 'daily',
      dataFlow: 'outbound',
      recordsProcessed: 3200,
      errorCount: 15,
      config: {
        baseUrl: 'https://api.quickbooks.com/v3',
        clientId: 'qb_client_789',
        customFields: { companyId: 'comp_123', realmId: 'realm_456' }
      },
      endpoints: [
        {
          id: 'invoices',
          name: 'Factures',
          method: 'POST',
          url: '/invoices',
          description: 'Envoi des factures',
          enabled: true,
          lastCalled: '2024-12-20T12:00:00Z',
          responseTime: 890,
          successRate: 85.2
        }
      ],
      webhooks: []
    },
    {
      id: 'shopify_ecommerce',
      name: 'Shopify Store',
      description: 'Synchronisation des produits, commandes et inventaire avec Shopify',
      category: 'ecommerce',
      provider: 'Shopify',
      version: '2.0.5',
      status: 'active',
      lastSync: '2024-12-20T14:20:00Z',
      syncFrequency: 'realtime',
      dataFlow: 'bidirectional',
      recordsProcessed: 12500,
      errorCount: 3,
      config: {
        baseUrl: 'https://api.shopify.com/admin/api/2023-10',
        accessToken: 'shopify_token_abc',
        customFields: { shopDomain: 'notre-boutique.myshopify.com' }
      },
      endpoints: [
        {
          id: 'products',
          name: 'Produits',
          method: 'GET',
          url: '/products',
          description: 'Synchronisation des produits',
          enabled: true,
          lastCalled: '2024-12-20T14:20:00Z',
          responseTime: 95,
          successRate: 99.8
        }
      ],
      webhooks: [
        {
          id: 'product_updates',
          name: 'Mises à jour Produits',
          url: 'https://notre-erp.com/webhooks/shopify/products',
          events: ['products/create', 'products/update', 'products/delete'],
          enabled: true,
          lastTriggered: '2024-12-20T14:10:00Z',
          deliveryCount: 890,
          failureCount: 2
        }
      ]
    }
  ];

  // Mock sync logs
  const mockSyncLogs: SyncLog[] = [
    {
      id: 'log_1',
      integrationId: 'sap_integration',
      timestamp: '2024-12-20T14:30:00Z',
      type: 'sync',
      status: 'success',
      recordsProcessed: 125,
      duration: 2450,
      message: 'Synchronisation réussie - 125 enregistrements traités'
    },
    {
      id: 'log_2',
      integrationId: 'salesforce_crm',
      timestamp: '2024-12-20T14:15:00Z',
      type: 'webhook',
      status: 'success',
      recordsProcessed: 1,
      duration: 180,
      message: 'Webhook traité - Nouveau compte créé'
    },
    {
      id: 'log_3',
      integrationId: 'quickbooks_accounting',
      timestamp: '2024-12-20T12:00:00Z',
      type: 'sync',
      status: 'error',
      recordsProcessed: 0,
      duration: 5000,
      message: 'Erreur d\'authentification - Token expiré'
    }
  ];

  useEffect(() => {
    setIntegrations(mockIntegrations);
    setSyncLogs(mockSyncLogs);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'configuring': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'erp': return <Database className="h-5 w-5" />;
      case 'crm': return <Users className="h-5 w-5" />;
      case 'accounting': return <DollarSign className="h-5 w-5" />;
      case 'ecommerce': return <ShoppingCart className="h-5 w-5" />;
      case 'communication': return <Mail className="h-5 w-5" />;
      case 'analytics': return <BarChart3 className="h-5 w-5" />;
      case 'storage': return <Cloud className="h-5 w-5" />;
      default: return <Plug className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'configuring': return <Settings className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  const renderIntegrationCard = (integration: Integration) => {
    return (
      <Card key={integration.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getCategoryIcon(integration.category)}
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription className="text-sm">{integration.provider} v{integration.version}</CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(integration.status)}>
              {getStatusIcon(integration.status)}
              {integration.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{integration.description}</p>
            
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {integration.recordsProcessed.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Enregistrements</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {integration.endpoints.length}
                </div>
                <div className="text-xs text-gray-500">Endpoints</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${integration.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {integration.errorCount}
                </div>
                <div className="text-xs text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Sync info */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Dernière sync: {new Date(integration.lastSync).toLocaleString('fr-FR')}</span>
              <Badge variant="outline">{integration.syncFrequency}</Badge>
            </div>

            {/* Data flow */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flux de données:</span>
              <Badge variant="outline" className={
                integration.dataFlow === 'bidirectional' ? 'text-blue-600' :
                integration.dataFlow === 'inbound' ? 'text-green-600' : 'text-orange-600'
              }>
                {integration.dataFlow === 'bidirectional' ? 'Bidirectionnel' :
                 integration.dataFlow === 'inbound' ? 'Entrant' : 'Sortant'}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedIntegration(integration);
                  setShowConfigDialog(true);
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurer
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <Sync className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSyncLogs = () => (
    <Card>
      <CardHeader>
        <CardTitle>Journaux de Synchronisation</CardTitle>
        <CardDescription>Historique des synchronisations et événements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {syncLogs.map(log => {
            const integration = integrations.find(i => i.id === log.integrationId);
            const StatusIcon = log.status === 'success' ? CheckCircle :
                              log.status === 'error' ? AlertTriangle : Clock;
            
            return (
              <div key={log.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <StatusIcon className={`h-5 w-5 ${
                  log.status === 'success' ? 'text-green-600' :
                  log.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{integration?.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{log.message}</div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{log.recordsProcessed} enregistrements</span>
                    <span>{log.duration}ms</span>
                    <Badge variant="outline" className="text-xs">
                      {log.type}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderOverviewStats = () => {
    const totalIntegrations = integrations.length;
    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    const totalRecords = integrations.reduce((sum, i) => sum + i.recordsProcessed, 0);
    const totalErrors = integrations.reduce((sum, i) => sum + i.errorCount, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Intégrations Totales</p>
                <p className="text-2xl font-bold">{totalIntegrations}</p>
              </div>
              <Plug className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-green-600">{activeIntegrations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enregistrements</p>
                <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erreurs</p>
                <p className={`text-2xl font-bold ${totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalErrors}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConfigDialog = () => (
    <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuration - {selectedIntegration?.name}</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de connexion et de synchronisation
          </DialogDescription>
        </DialogHeader>
        
        {selectedIntegration && (
          <div className="space-y-6">
            {/* Connection settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paramètres de Connexion</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-url">URL de Base</Label>
                  <Input
                    id="base-url"
                    value={selectedIntegration.config.baseUrl || ''}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    value={selectedIntegration.config.clientId || ''}
                    placeholder="Identifiant client"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-key">Clé API</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={selectedIntegration.config.apiKey || ''}
                    placeholder="••••••••••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="api-secret">Secret API</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    value={selectedIntegration.config.apiSecret || ''}
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Sync settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paramètres de Synchronisation</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sync-frequency">Fréquence</Label>
                  <Select value={selectedIntegration.syncFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Temps réel</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="manual">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data-flow">Flux de Données</Label>
                  <Select value={selectedIntegration.dataFlow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bidirectional">Bidirectionnel</SelectItem>
                      <SelectItem value="inbound">Entrant uniquement</SelectItem>
                      <SelectItem value="outbound">Sortant uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-retry" />
                <Label htmlFor="auto-retry">Nouvelle tentative automatique en cas d'erreur</Label>
              </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endpoints Actifs</h3>
              <div className="space-y-2">
                {selectedIntegration.endpoints.map(endpoint => (
                  <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Switch checked={endpoint.enabled} />
                      <div>
                        <div className="font-medium">{endpoint.name}</div>
                        <div className="text-sm text-gray-500">{endpoint.method} {endpoint.url}</div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {endpoint.successRate.toFixed(1)}% succès
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Annuler
              </Button>
              <Button>
                Tester la Connexion
              </Button>
              <Button>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
          <h1 className="text-3xl font-bold text-gray-900">Hub d'Intégrations Entreprise</h1>
          <p className="text-gray-600">Connectez votre ERP avec vos outils métier</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Config
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Intégration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="logs">Journaux</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intégrations Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.filter(i => i.status === 'active').slice(0, 3).map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(integration.category)}
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncLogs.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {log.status === 'success' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        }
                        <span className="text-sm">{log.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(renderIntegrationCard)}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {renderSyncLogs()}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace d'Intégrations</CardTitle>
              <CardDescription>Découvrez et installez de nouvelles intégrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Plug className="h-12 w-12 mx-auto mb-4" />
                <p>Marketplace en cours de développement</p>
                <p className="text-sm">Bientôt disponible avec plus de 100 intégrations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderConfigDialog()}
    </div>
  );
};

export default EnterpriseIntegrationsHub;
