// API Gateway Management Component

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
  Globe, Shield, Zap, Activity, BarChart3, Settings,
  Key, Lock, Eye, RefreshCw, Download, Upload, Plus,
  CheckCircle, AlertTriangle, Clock, Users, Network,
  Server, Database, Code, FileText, Target, Award
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'maintenance';
  authentication: 'none' | 'api_key' | 'oauth2' | 'jwt' | 'basic';
  rateLimit: {
    requests: number;
    window: string;
    burst: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'redis' | 'cdn';
  };
  monitoring: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    requestCount: number;
  };
  documentation: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: string;
  };
  status: 'active' | 'revoked' | 'expired';
  usage: {
    totalRequests: number;
    lastUsed: string;
    quotaUsed: number;
    quotaLimit: number;
  };
  restrictions: {
    ipWhitelist: string[];
    allowedEndpoints: string[];
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      timezone: string;
    };
  };
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

interface APIMetrics {
  id: string;
  endpoint: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  userAgent: string;
  ipAddress: string;
  apiKey?: string;
}

interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  type: 'global' | 'per_key' | 'per_ip' | 'per_user';
  limits: {
    requests: number;
    window: string;
    burst?: number;
  };
  endpoints: string[];
  conditions: {
    userAgent?: string;
    ipRange?: string;
    headers?: { [key: string]: string };
  };
  actions: {
    onExceeded: 'block' | 'throttle' | 'queue';
    responseCode: number;
    responseMessage: string;
  };
  enabled: boolean;
  priority: number;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'cors' | 'csrf' | 'xss' | 'sql_injection' | 'ddos' | 'custom';
  rules: SecurityRule[];
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: {
    block: boolean;
    log: boolean;
    alert: boolean;
    quarantine: boolean;
  };
  whitelist: string[];
  blacklist: string[];
}

interface SecurityRule {
  id: string;
  pattern: string;
  type: 'regex' | 'exact' | 'contains' | 'ip_range';
  field: 'header' | 'body' | 'query' | 'path' | 'ip';
  action: 'allow' | 'deny' | 'log';
}

const APIGatewayManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [rateLimitRules, setRateLimitRules] = useState<RateLimitRule[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [metrics, setMetrics] = useState<APIMetrics[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [showEndpointDialog, setShowEndpointDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock API endpoints
  const mockEndpoints: APIEndpoint[] = [
    {
      id: 'customers_api',
      name: 'Customers API',
      path: '/api/v1/customers',
      method: 'GET',
      description: 'Retrieve customer information with filtering and pagination',
      version: '1.2.0',
      status: 'active',
      authentication: 'jwt',
      rateLimit: {
        requests: 1000,
        window: '1h',
        burst: 50
      },
      caching: {
        enabled: true,
        ttl: 300,
        strategy: 'redis'
      },
      monitoring: {
        uptime: 99.95,
        avgResponseTime: 145,
        errorRate: 0.02,
        requestCount: 125000
      },
      documentation: 'https://docs.api.company.com/customers',
      tags: ['customers', 'core', 'v1'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-18T14:30:00Z'
    },
    {
      id: 'orders_api',
      name: 'Orders API',
      path: '/api/v1/orders',
      method: 'POST',
      description: 'Create and manage customer orders',
      version: '1.1.5',
      status: 'active',
      authentication: 'oauth2',
      rateLimit: {
        requests: 500,
        window: '1h',
        burst: 25
      },
      caching: {
        enabled: false,
        ttl: 0,
        strategy: 'memory'
      },
      monitoring: {
        uptime: 99.87,
        avgResponseTime: 280,
        errorRate: 0.15,
        requestCount: 89000
      },
      documentation: 'https://docs.api.company.com/orders',
      tags: ['orders', 'core', 'v1'],
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2024-12-19T11:20:00Z'
    },
    {
      id: 'analytics_api',
      name: 'Analytics API',
      path: '/api/v2/analytics',
      method: 'GET',
      description: 'Access business analytics and reporting data',
      version: '2.0.0-beta',
      status: 'beta',
      authentication: 'api_key',
      rateLimit: {
        requests: 100,
        window: '1h',
        burst: 10
      },
      caching: {
        enabled: true,
        ttl: 600,
        strategy: 'cdn'
      },
      monitoring: {
        uptime: 98.50,
        avgResponseTime: 520,
        errorRate: 1.2,
        requestCount: 15000
      },
      documentation: 'https://docs.api.company.com/analytics-v2',
      tags: ['analytics', 'beta', 'v2'],
      createdAt: '2024-11-01T16:00:00Z',
      updatedAt: '2024-12-20T09:45:00Z'
    }
  ];

  // Mock API keys
  const mockApiKeys: APIKey[] = [
    {
      id: 'key_mobile_app',
      name: 'Mobile App Production',
      key: 'ak_prod_1234567890abcdef',
      description: 'Production API key for mobile application',
      permissions: ['customers:read', 'orders:read', 'orders:write'],
      rateLimit: {
        requests: 10000,
        window: '1h'
      },
      status: 'active',
      usage: {
        totalRequests: 2500000,
        lastUsed: '2024-12-20T15:30:00Z',
        quotaUsed: 8500,
        quotaLimit: 10000
      },
      restrictions: {
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
        allowedEndpoints: ['/api/v1/customers', '/api/v1/orders'],
        timeRestrictions: {
          startTime: '06:00',
          endTime: '22:00',
          timezone: 'Europe/Paris'
        }
      },
      createdAt: '2024-06-15T10:00:00Z',
      createdBy: 'admin@company.com'
    },
    {
      id: 'key_partner_integration',
      name: 'Partner Integration',
      key: 'ak_partner_abcdef1234567890',
      description: 'API key for trusted partner integrations',
      permissions: ['customers:read', 'analytics:read'],
      rateLimit: {
        requests: 5000,
        window: '1h'
      },
      status: 'active',
      usage: {
        totalRequests: 890000,
        lastUsed: '2024-12-20T14:15:00Z',
        quotaUsed: 3200,
        quotaLimit: 5000
      },
      restrictions: {
        ipWhitelist: ['203.0.113.0/24'],
        allowedEndpoints: ['/api/v1/customers', '/api/v2/analytics']
      },
      expiresAt: '2025-06-15T10:00:00Z',
      createdAt: '2024-08-20T14:30:00Z',
      createdBy: 'partnerships@company.com'
    }
  ];

  // Mock rate limit rules
  const mockRateLimitRules: RateLimitRule[] = [
    {
      id: 'global_rate_limit',
      name: 'Global Rate Limit',
      description: 'Default rate limit for all endpoints',
      type: 'global',
      limits: {
        requests: 1000,
        window: '1h',
        burst: 50
      },
      endpoints: ['*'],
      conditions: {},
      actions: {
        onExceeded: 'block',
        responseCode: 429,
        responseMessage: 'Rate limit exceeded. Please try again later.'
      },
      enabled: true,
      priority: 1
    },
    {
      id: 'suspicious_ip_limit',
      name: 'Suspicious IP Throttling',
      description: 'Aggressive rate limiting for suspicious IP addresses',
      type: 'per_ip',
      limits: {
        requests: 100,
        window: '1h',
        burst: 5
      },
      endpoints: ['*'],
      conditions: {
        ipRange: '0.0.0.0/0'
      },
      actions: {
        onExceeded: 'throttle',
        responseCode: 429,
        responseMessage: 'Request throttled due to suspicious activity'
      },
      enabled: false,
      priority: 10
    }
  ];

  // Mock security policies
  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: 'cors_policy',
      name: 'CORS Protection',
      description: 'Cross-Origin Resource Sharing security policy',
      type: 'cors',
      rules: [
        {
          id: 'cors_rule_1',
          pattern: 'https://*.company.com',
          type: 'regex',
          field: 'header',
          action: 'allow'
        }
      ],
      enabled: true,
      severity: 'medium',
      actions: {
        block: true,
        log: true,
        alert: false,
        quarantine: false
      },
      whitelist: ['https://app.company.com', 'https://admin.company.com'],
      blacklist: []
    },
    {
      id: 'sql_injection_policy',
      name: 'SQL Injection Protection',
      description: 'Detect and block SQL injection attempts',
      type: 'sql_injection',
      rules: [
        {
          id: 'sql_rule_1',
          pattern: '(union|select|insert|update|delete|drop|create|alter)',
          type: 'regex',
          field: 'query',
          action: 'deny'
        }
      ],
      enabled: true,
      severity: 'critical',
      actions: {
        block: true,
        log: true,
        alert: true,
        quarantine: true
      },
      whitelist: [],
      blacklist: []
    }
  ];

  useEffect(() => {
    setEndpoints(mockEndpoints);
    setApiKeys(mockApiKeys);
    setRateLimitRules(mockRateLimitRules);
    setSecurityPolicies(mockSecurityPolicies);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'deprecated': return 'text-red-600 bg-red-50';
      case 'beta': return 'text-blue-600 bg-blue-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'revoked': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-50';
      case 'POST': return 'text-green-600 bg-green-50';
      case 'PUT': return 'text-yellow-600 bg-yellow-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      case 'PATCH': return 'text-purple-600 bg-purple-50';
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

  const renderEndpointCard = (endpoint: APIEndpoint) => {
    return (
      <Card key={endpoint.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                <CardDescription className="text-sm">
                  {endpoint.path} • v{endpoint.version}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getMethodColor(endpoint.method)}>
                {endpoint.method}
              </Badge>
              <Badge className={getStatusColor(endpoint.status)}>
                {endpoint.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{endpoint.description}</p>
            
            {/* Monitoring metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{endpoint.monitoring.uptime.toFixed(2)}%</div>
                <div className="text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{endpoint.monitoring.avgResponseTime}ms</div>
                <div className="text-gray-500">Réponse</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{endpoint.monitoring.errorRate.toFixed(2)}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{endpoint.monitoring.requestCount.toLocaleString()}</div>
                <div className="text-gray-500">Requêtes</div>
              </div>
            </div>

            {/* Rate limiting */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Rate Limiting</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Limite:</span>
                  <div>{endpoint.rateLimit.requests} req/{endpoint.rateLimit.window}</div>
                </div>
                <div>
                  <span className="text-gray-600">Burst:</span>
                  <div>{endpoint.rateLimit.burst} req</div>
                </div>
              </div>
            </div>

            {/* Caching */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cache:</span>
              <div className="flex items-center space-x-2">
                <Badge className={endpoint.caching.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                  {endpoint.caching.enabled ? 'Activé' : 'Désactivé'}
                </Badge>
                {endpoint.caching.enabled && (
                  <span className="text-xs text-gray-500">
                    TTL: {endpoint.caching.ttl}s
                  </span>
                )}
              </div>
            </div>

            {/* Authentication */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Authentification:</span>
              <Badge variant="outline">
                {endpoint.authentication.replace('_', ' ').toUpperCase()}
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
                <BarChart3 className="h-3 w-3" />
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

  const renderApiKeyCard = (apiKey: APIKey) => {
    const quotaPercentage = (apiKey.usage.quotaUsed / apiKey.usage.quotaLimit) * 100;

    return (
      <Card key={apiKey.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Key className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                <CardDescription className="text-sm font-mono">
                  {apiKey.key.substring(0, 20)}...
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(apiKey.status)}>
              {apiKey.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{apiKey.description}</p>
            
            {/* Usage metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quota utilisé:</span>
                <span className="font-medium">
                  {apiKey.usage.quotaUsed.toLocaleString()} / {apiKey.usage.quotaLimit.toLocaleString()}
                </span>
              </div>
              <Progress value={quotaPercentage} className="h-2" />
              <div className="text-xs text-gray-500">
                {quotaPercentage.toFixed(1)}% du quota mensuel utilisé
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total requêtes:</span>
                <div className="font-medium">{apiKey.usage.totalRequests.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Dernière utilisation:</span>
                <div className="font-medium">
                  {new Date(apiKey.usage.lastUsed).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Rate limit */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">Rate Limit</div>
              <div className="text-sm text-gray-600">
                {apiKey.rateLimit.requests} requêtes par {apiKey.rateLimit.window}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Permissions:</div>
              <div className="flex flex-wrap gap-1">
                {apiKey.permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Restrictions */}
            {apiKey.restrictions.ipWhitelist.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Restrictions IP:</div>
                <div className="text-xs text-gray-600">
                  {apiKey.restrictions.ipWhitelist.join(', ')}
                </div>
              </div>
            )}

            {/* Expiration */}
            {apiKey.expiresAt && (
              <div className="bg-yellow-50 p-2 rounded text-sm">
                <div className="text-yellow-800 font-medium">
                  Expire le {new Date(apiKey.expiresAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Créé par: {apiKey.createdBy}</div>
              <div>Date: {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSecurityPolicyCard = (policy: SecurityPolicy) => {
    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription className="text-sm">
                  {policy.type.replace('_', ' ')} • {policy.rules.length} règles
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(policy.severity)}>
                {policy.severity}
              </Badge>
              <Badge className={policy.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                {policy.enabled ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{policy.description}</p>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-medium">Actions activées:</div>
                <div className="space-y-1">
                  {Object.entries(policy.actions).map(([action, enabled]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="capitalize">{action.replace('_', ' ')}:</span>
                      <Badge className={enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {enabled ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Règles:</div>
                <div className="space-y-1">
                  {policy.rules.slice(0, 2).map(rule => (
                    <div key={rule.id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="font-medium">{rule.field}: {rule.action}</div>
                      <div className="text-gray-600 truncate">{rule.pattern}</div>
                    </div>
                  ))}
                  {policy.rules.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{policy.rules.length - 2} autres règles
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Whitelist/Blacklist */}
            {(policy.whitelist.length > 0 || policy.blacklist.length > 0) && (
              <div className="space-y-2">
                {policy.whitelist.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-green-600">Whitelist:</div>
                    <div className="text-xs text-gray-600">
                      {policy.whitelist.slice(0, 2).join(', ')}
                      {policy.whitelist.length > 2 && ` +${policy.whitelist.length - 2} autres`}
                    </div>
                  </div>
                )}
                {policy.blacklist.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-red-600">Blacklist:</div>
                    <div className="text-xs text-gray-600">
                      {policy.blacklist.slice(0, 2).join(', ')}
                      {policy.blacklist.length > 2 && ` +${policy.blacklist.length - 2} autres`}
                    </div>
                  </div>
                )}
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
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalEndpoints = endpoints.length;
    const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
    const totalApiKeys = apiKeys.length;
    const activeApiKeys = apiKeys.filter(k => k.status === 'active').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Endpoints Actifs</p>
                <p className="text-2xl font-bold">{activeEndpoints}/{totalEndpoints}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clés API Actives</p>
                <p className="text-2xl font-bold text-green-600">{activeApiKeys}/{totalApiKeys}</p>
              </div>
              <Key className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Politiques Sécurité</p>
                <p className="text-2xl font-bold text-red-600">{securityPolicies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Règles Rate Limit</p>
                <p className="text-2xl font-bold text-purple-600">{rateLimitRules.length}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion API Gateway</h1>
          <p className="text-gray-600">Gérez vos APIs, sécurité et monitoring en temps réel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" onClick={() => setShowEndpointDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Endpoint
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="keys">Clés API</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map(renderEndpointCard)}
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Clés API</h2>
            <Button onClick={() => setShowKeyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Clé
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apiKeys.map(renderApiKeyCard)}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Politiques de Sécurité</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Politique
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPolicies.map(renderSecurityPolicyCard)}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring en Temps Réel</CardTitle>
              <CardDescription>Surveillance des performances et de la santé des APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring en cours de développement</p>
                <p className="text-sm">Métriques en temps réel et alertes intelligentes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics API</CardTitle>
              <CardDescription>Analyses d'utilisation et optimisation des performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics avancées en cours de développement</p>
                <p className="text-sm">Analyses d'usage et recommandations d'optimisation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIGatewayManagement;
