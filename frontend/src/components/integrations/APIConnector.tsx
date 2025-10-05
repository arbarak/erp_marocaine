// API Connector Component

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
import { 
  Code, Play, Save, Copy, Download, Upload, RefreshCw, 
  CheckCircle, AlertTriangle, Clock, Zap, Settings,
  Database, Cloud, Key, Shield, Eye, EyeOff
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  description: string;
  headers: { [key: string]: string };
  queryParams: { [key: string]: string };
  body: string;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials: { [key: string]: string };
  };
  response: {
    status: number;
    headers: { [key: string]: string };
    body: string;
    time: number;
  } | null;
  lastTested: string | null;
  isValid: boolean;
}

interface APICollection {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  endpoints: APIEndpoint[];
  globalHeaders: { [key: string]: string };
  globalAuth: {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials: { [key: string]: string };
  };
}

const APIConnector: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [collections, setCollections] = useState<APICollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock collections
  const mockCollections: APICollection[] = [
    {
      id: 'erp_api',
      name: 'ERP Internal API',
      description: 'API interne pour les opérations ERP',
      baseUrl: 'https://api.notre-erp.com/v1',
      globalHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      globalAuth: {
        type: 'bearer',
        credentials: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      },
      endpoints: [
        {
          id: 'get_customers',
          name: 'Récupérer Clients',
          method: 'GET',
          url: '/customers',
          description: 'Récupère la liste des clients',
          headers: {},
          queryParams: { limit: '50', offset: '0' },
          body: '',
          authentication: { type: 'none', credentials: {} },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([
              { id: 1, name: 'ACME Corp', email: 'contact@acme.com' },
              { id: 2, name: 'TechStart', email: 'info@techstart.com' }
            ], null, 2),
            time: 245
          },
          lastTested: '2024-12-20T14:30:00Z',
          isValid: true
        },
        {
          id: 'create_order',
          name: 'Créer Commande',
          method: 'POST',
          url: '/orders',
          description: 'Crée une nouvelle commande',
          headers: {},
          queryParams: {},
          body: JSON.stringify({
            customer_id: 1,
            items: [
              { product_id: 101, quantity: 2, price: 29.99 },
              { product_id: 102, quantity: 1, price: 49.99 }
            ],
            total: 109.97
          }, null, 2),
          authentication: { type: 'none', credentials: {} },
          response: null,
          lastTested: null,
          isValid: false
        }
      ]
    },
    {
      id: 'external_api',
      name: 'API Externe',
      description: 'Connexions vers des APIs externes',
      baseUrl: 'https://api.external-service.com',
      globalHeaders: {
        'User-Agent': 'Notre-ERP/1.0'
      },
      globalAuth: {
        type: 'api_key',
        credentials: { key: 'api_key_123456789' }
      },
      endpoints: [
        {
          id: 'weather_api',
          name: 'Données Météo',
          method: 'GET',
          url: '/weather',
          description: 'Récupère les données météorologiques',
          headers: {},
          queryParams: { city: 'Casablanca', units: 'metric' },
          body: '',
          authentication: { type: 'none', credentials: {} },
          response: null,
          lastTested: null,
          isValid: false
        }
      ]
    }
  ];

  useEffect(() => {
    setCollections(mockCollections);
    if (mockCollections.length > 0) {
      setSelectedCollection(mockCollections[0].id);
      if (mockCollections[0].endpoints.length > 0) {
        setSelectedEndpoint(mockCollections[0].endpoints[0].id);
      }
    }
  }, []);

  const getCurrentCollection = () => {
    return collections.find(c => c.id === selectedCollection);
  };

  const getCurrentEndpoint = () => {
    const collection = getCurrentCollection();
    return collection?.endpoints.find(e => e.id === selectedEndpoint);
  };

  const updateEndpoint = (updates: Partial<APIEndpoint>) => {
    setCollections(prev => prev.map(collection => 
      collection.id === selectedCollection 
        ? {
            ...collection,
            endpoints: collection.endpoints.map(endpoint =>
              endpoint.id === selectedEndpoint
                ? { ...endpoint, ...updates }
                : endpoint
            )
          }
        : collection
    ));
  };

  const testEndpoint = async () => {
    const endpoint = getCurrentEndpoint();
    const collection = getCurrentCollection();
    
    if (!endpoint || !collection) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        status: Math.random() > 0.2 ? 200 : 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: Math.random() > 0.2,
          data: { message: 'Test response' },
          timestamp: new Date().toISOString()
        }, null, 2),
        time: Math.floor(Math.random() * 1000) + 100
      };

      updateEndpoint({
        response: mockResponse,
        lastTested: new Date().toISOString(),
        isValid: mockResponse.status < 400
      });

      setIsLoading(false);
    }, 1500);
  };

  const addNewEndpoint = () => {
    const collection = getCurrentCollection();
    if (!collection) return;

    const newEndpoint: APIEndpoint = {
      id: `endpoint_${Date.now()}`,
      name: 'Nouvel Endpoint',
      method: 'GET',
      url: '/new-endpoint',
      description: 'Description du nouvel endpoint',
      headers: {},
      queryParams: {},
      body: '',
      authentication: { type: 'none', credentials: {} },
      response: null,
      lastTested: null,
      isValid: false
    };

    setCollections(prev => prev.map(c => 
      c.id === selectedCollection 
        ? { ...c, endpoints: [...c.endpoints, newEndpoint] }
        : c
    ));

    setSelectedEndpoint(newEndpoint.id);
  };

  const renderEndpointBuilder = () => {
    const endpoint = getCurrentEndpoint();
    const collection = getCurrentCollection();
    
    if (!endpoint || !collection) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Code className="h-12 w-12 mx-auto mb-4" />
          <p>Sélectionnez un endpoint pour commencer</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Request Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration de la Requête</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and URL */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <Label>Méthode</Label>
                <Select 
                  value={endpoint.method} 
                  onValueChange={(value) => updateEndpoint({ method: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-10">
                <Label>URL</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    {collection.baseUrl}
                  </span>
                  <Input
                    value={endpoint.url}
                    onChange={(e) => updateEndpoint({ url: e.target.value })}
                    className="rounded-l-none"
                    placeholder="/endpoint"
                  />
                </div>
              </div>
            </div>

            {/* Name and Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={endpoint.name}
                  onChange={(e) => updateEndpoint({ name: e.target.value })}
                  placeholder="Nom de l'endpoint"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={endpoint.description}
                  onChange={(e) => updateEndpoint({ description: e.target.value })}
                  placeholder="Description de l'endpoint"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headers */}
        <Card>
          <CardHeader>
            <CardTitle>En-têtes HTTP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(endpoint.headers).map(([key, value], index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input value={key} placeholder="Nom de l'en-tête" />
                  <Input value={value} placeholder="Valeur" />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => {
                updateEndpoint({
                  headers: { ...endpoint.headers, '': '' }
                });
              }}>
                Ajouter En-tête
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Query Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de Requête</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(endpoint.queryParams).map(([key, value], index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input 
                    value={key} 
                    placeholder="Nom du paramètre"
                    onChange={(e) => {
                      const newParams = { ...endpoint.queryParams };
                      delete newParams[key];
                      newParams[e.target.value] = value;
                      updateEndpoint({ queryParams: newParams });
                    }}
                  />
                  <Input 
                    value={value} 
                    placeholder="Valeur"
                    onChange={(e) => {
                      updateEndpoint({
                        queryParams: { ...endpoint.queryParams, [key]: e.target.value }
                      });
                    }}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => {
                updateEndpoint({
                  queryParams: { ...endpoint.queryParams, '': '' }
                });
              }}>
                Ajouter Paramètre
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Request Body */}
        {['POST', 'PUT', 'PATCH'].includes(endpoint.method) && (
          <Card>
            <CardHeader>
              <CardTitle>Corps de la Requête</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={endpoint.body}
                onChange={(e) => updateEndpoint({ body: e.target.value })}
                placeholder="Corps de la requête (JSON, XML, etc.)"
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        )}

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type d'authentification</Label>
              <Select 
                value={endpoint.authentication.type}
                onValueChange={(value) => updateEndpoint({
                  authentication: { ...endpoint.authentication, type: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {endpoint.authentication.type === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <Input placeholder="Username" />
                </div>
                <div>
                  <Label>Mot de passe</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {endpoint.authentication.type === 'bearer' && (
              <div>
                <Label>Token</Label>
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Bearer token"
                />
              </div>
            )}

            {endpoint.authentication.type === 'api_key' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom de la clé</Label>
                  <Input placeholder="X-API-Key" />
                </div>
                <div>
                  <Label>Valeur</Label>
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="API key value"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Button */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button onClick={testEndpoint} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Tester
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copier cURL
            </Button>
          </div>
          
          {endpoint.lastTested && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {endpoint.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span>Testé le {new Date(endpoint.lastTested).toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResponse = () => {
    const endpoint = getCurrentEndpoint();
    
    if (!endpoint?.response) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <p>Aucune réponse disponible</p>
          <p className="text-sm">Testez l'endpoint pour voir la réponse</p>
        </div>
      );
    }

    const { response } = endpoint;
    const statusColor = response.status < 300 ? 'text-green-600' : 
                       response.status < 400 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="space-y-6">
        {/* Response Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut de la Réponse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${statusColor}`}>
                  {response.status}
                </div>
                <div className="text-sm text-gray-500">Code de statut</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {response.time}ms
                </div>
                <div className="text-sm text-gray-500">Temps de réponse</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Blob([response.body]).size}B
                </div>
                <div className="text-sm text-gray-500">Taille</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Headers */}
        <Card>
          <CardHeader>
            <CardTitle>En-têtes de Réponse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b">
                  <div className="font-medium text-sm">{key}</div>
                  <div className="text-sm text-gray-600">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Body */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Corps de la Réponse</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono max-h-96">
              {response.body}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCollectionManager = () => {
    const collection = getCurrentCollection();
    
    return (
      <div className="space-y-6">
        {/* Collection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de la collection</Label>
              <Input value={collection?.name || ''} placeholder="Nom de la collection" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={collection?.description || ''} placeholder="Description" />
            </div>
            <div>
              <Label>URL de base</Label>
              <Input value={collection?.baseUrl || ''} placeholder="https://api.example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Global Headers */}
        <Card>
          <CardHeader>
            <CardTitle>En-têtes Globaux</CardTitle>
            <CardDescription>Ces en-têtes seront ajoutés à toutes les requêtes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collection && Object.entries(collection.globalHeaders).map(([key, value], index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input value={key} placeholder="Nom de l'en-tête" />
                  <Input value={value} placeholder="Valeur" />
                </div>
              ))}
              <Button variant="outline" size="sm">
                Ajouter En-tête Global
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Global Authentication */}
        <Card>
          <CardHeader>
            <CardTitle>Authentification Globale</CardTitle>
            <CardDescription>Configuration d'authentification par défaut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type d'authentification</Label>
              <Select value={collection?.globalAuth.type || 'none'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Endpoints ({collection?.endpoints.length || 0})</CardTitle>
              <Button size="sm" onClick={addNewEndpoint}>
                <Zap className="h-4 w-4 mr-2" />
                Nouvel Endpoint
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {collection?.endpoints.map(endpoint => (
                <div 
                  key={endpoint.id}
                  className={`flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedEndpoint === endpoint.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      endpoint.method === 'GET' ? 'default' :
                      endpoint.method === 'POST' ? 'destructive' :
                      endpoint.method === 'PUT' ? 'secondary' : 'outline'
                    }>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-gray-500">{endpoint.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {endpoint.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    {endpoint.lastTested && (
                      <span className="text-xs text-gray-500">
                        {new Date(endpoint.lastTested).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connecteur API</h1>
          <p className="text-gray-600">Testez et gérez vos connexions API</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sélectionner une collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map(collection => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Constructeur</TabsTrigger>
          <TabsTrigger value="response">Réponse</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {renderEndpointBuilder()}
        </TabsContent>

        <TabsContent value="response" className="space-y-6">
          {renderResponse()}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          {renderCollectionManager()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIConnector;
