// Custom Report Builder Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Plus, Trash2, Edit, Save, Play, Download, Share2, Copy, 
  Database, Filter, SortAsc, SortDesc, Calendar, Hash,
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Table, TrendingUp, Eye, Settings, Code, FileText
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'table' | 'view' | 'query';
  description: string;
  fields: DataField[];
  relationships: Relationship[];
}

interface DataField {
  id: string;
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  aggregatable: boolean;
  filterable: boolean;
  sortable: boolean;
  description: string;
}

interface Relationship {
  id: string;
  fromTable: string;
  toTable: string;
  fromField: string;
  toField: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 
           'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: any;
  dataType: string;
}

interface ReportColumn {
  id: string;
  field: string;
  displayName: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'count_distinct';
  format?: string;
  width?: number;
  visible: boolean;
  sortOrder?: 'asc' | 'desc';
  sortPriority?: number;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  dataSource: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy: string[];
  orderBy: { field: string; direction: 'asc' | 'desc' }[];
  chartType?: 'table' | 'bar' | 'line' | 'pie' | 'area';
  chartConfig?: any;
  limit?: number;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
}

const CustomReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('data');
  const [reportDefinition, setReportDefinition] = useState<ReportDefinition>({
    id: '',
    name: '',
    description: '',
    category: '',
    dataSource: '',
    columns: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    chartType: 'table',
    chartConfig: {},
    createdBy: '',
    createdAt: '',
    isPublic: false
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Mock data sources
  const mockDataSources: DataSource[] = [
    {
      id: 'sales_orders',
      name: 'Commandes de Vente',
      type: 'table',
      description: 'Données des commandes de vente',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', type: 'number', aggregatable: false, filterable: true, sortable: true, description: 'Identifiant unique' },
        { id: 'order_date', name: 'order_date', displayName: 'Date Commande', type: 'date', aggregatable: false, filterable: true, sortable: true, description: 'Date de la commande' },
        { id: 'customer_name', name: 'customer_name', displayName: 'Client', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Nom du client' },
        { id: 'total_amount', name: 'total_amount', displayName: 'Montant Total', type: 'currency', aggregatable: true, filterable: true, sortable: true, description: 'Montant total de la commande' },
        { id: 'status', name: 'status', displayName: 'Statut', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Statut de la commande' },
        { id: 'product_category', name: 'product_category', displayName: 'Catégorie', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Catégorie de produit' }
      ],
      relationships: []
    },
    {
      id: 'products',
      name: 'Produits',
      type: 'table',
      description: 'Catalogue des produits',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', type: 'number', aggregatable: false, filterable: true, sortable: true, description: 'Identifiant unique' },
        { id: 'name', name: 'name', displayName: 'Nom', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Nom du produit' },
        { id: 'category', name: 'category', displayName: 'Catégorie', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Catégorie du produit' },
        { id: 'price', name: 'price', displayName: 'Prix', type: 'currency', aggregatable: true, filterable: true, sortable: true, description: 'Prix unitaire' },
        { id: 'stock_quantity', name: 'stock_quantity', displayName: 'Stock', type: 'number', aggregatable: true, filterable: true, sortable: true, description: 'Quantité en stock' }
      ],
      relationships: []
    },
    {
      id: 'customers',
      name: 'Clients',
      type: 'table',
      description: 'Base de données clients',
      fields: [
        { id: 'id', name: 'id', displayName: 'ID', type: 'number', aggregatable: false, filterable: true, sortable: true, description: 'Identifiant unique' },
        { id: 'name', name: 'name', displayName: 'Nom', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Nom du client' },
        { id: 'email', name: 'email', displayName: 'Email', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Adresse email' },
        { id: 'city', name: 'city', displayName: 'Ville', type: 'string', aggregatable: false, filterable: true, sortable: true, description: 'Ville' },
        { id: 'registration_date', name: 'registration_date', displayName: 'Date Inscription', type: 'date', aggregatable: false, filterable: true, sortable: true, description: 'Date d\'inscription' }
      ],
      relationships: []
    }
  ];

  // Mock preview data
  const mockPreviewData = [
    { id: 1, order_date: '2024-01-15', customer_name: 'ACME Corp', total_amount: 15000, status: 'Confirmée', product_category: 'Électronique' },
    { id: 2, order_date: '2024-01-16', customer_name: 'TechStart', total_amount: 8500, status: 'En cours', product_category: 'Informatique' },
    { id: 3, order_date: '2024-01-17', customer_name: 'Global Industries', total_amount: 22000, status: 'Livrée', product_category: 'Équipement' },
    { id: 4, order_date: '2024-01-18', customer_name: 'Local Business', total_amount: 3200, status: 'Confirmée', product_category: 'Fournitures' },
    { id: 5, order_date: '2024-01-19', customer_name: 'Enterprise Solutions', total_amount: 45000, status: 'En cours', product_category: 'Logiciel' }
  ];

  useEffect(() => {
    setDataSources(mockDataSources);
  }, []);

  const handleDataSourceChange = (dataSourceId: string) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    setSelectedDataSource(dataSource || null);
    setReportDefinition(prev => ({
      ...prev,
      dataSource: dataSourceId,
      columns: [],
      filters: []
    }));
  };

  const addColumn = (field: DataField) => {
    const newColumn: ReportColumn = {
      id: `col_${Date.now()}`,
      field: field.name,
      displayName: field.displayName,
      visible: true
    };
    
    setReportDefinition(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn]
    }));
  };

  const removeColumn = (columnId: string) => {
    setReportDefinition(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId)
    }));
  };

  const addFilter = () => {
    if (!selectedDataSource) return;
    
    const newFilter: ReportFilter = {
      id: `filter_${Date.now()}`,
      field: selectedDataSource.fields[0]?.name || '',
      operator: 'equals',
      value: '',
      dataType: selectedDataSource.fields[0]?.type || 'string'
    };
    
    setReportDefinition(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const removeFilter = (filterId: string) => {
    setReportDefinition(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== filterId)
    }));
  };

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReportDefinition(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === filterId ? { ...filter, ...updates } : filter
      )
    }));
  };

  const runPreview = async () => {
    setIsPreviewLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPreviewData(mockPreviewData);
      setIsPreviewLoading(false);
    }, 1000);
  };

  const saveReport = () => {
    // Implement save logic
    console.log('Saving report:', reportDefinition);
    setShowSaveDialog(false);
  };

  const getOperatorOptions = (dataType: string) => {
    const baseOperators = ['equals', 'not_equals', 'is_null', 'is_not_null'];
    
    if (dataType === 'string') {
      return [...baseOperators, 'contains', 'starts_with', 'ends_with', 'in', 'not_in'];
    }
    
    if (dataType === 'number' || dataType === 'currency' || dataType === 'date') {
      return [...baseOperators, 'greater_than', 'less_than', 'between'];
    }
    
    return baseOperators;
  };

  const renderDataSourceSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Source de Données</span>
        </CardTitle>
        <CardDescription>Sélectionnez la source de données pour votre rapport</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={reportDefinition.dataSource} onValueChange={handleDataSourceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une source de données" />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map(ds => (
              <SelectItem key={ds.id} value={ds.id}>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{ds.name}</div>
                    <div className="text-sm text-gray-500">{ds.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedDataSource && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Champs Disponibles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedDataSource.fields.map(field => (
                <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{field.displayName}</div>
                    <div className="text-xs text-gray-500">{field.type}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addColumn(field)}
                    disabled={reportDefinition.columns.some(col => col.field === field.name)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderColumnsConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Table className="h-5 w-5" />
          <span>Colonnes</span>
        </CardTitle>
        <CardDescription>Configurez les colonnes de votre rapport</CardDescription>
      </CardHeader>
      <CardContent>
        {reportDefinition.columns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune colonne sélectionnée. Ajoutez des champs depuis la source de données.
          </div>
        ) : (
          <div className="space-y-3">
            {reportDefinition.columns.map(column => (
              <div key={column.id} className="flex items-center space-x-3 p-3 border rounded">
                <Checkbox
                  checked={column.visible}
                  onCheckedChange={(checked) => {
                    setReportDefinition(prev => ({
                      ...prev,
                      columns: prev.columns.map(col =>
                        col.id === column.id ? { ...col, visible: !!checked } : col
                      )
                    }));
                  }}
                />
                <div className="flex-1">
                  <Input
                    value={column.displayName}
                    onChange={(e) => {
                      setReportDefinition(prev => ({
                        ...prev,
                        columns: prev.columns.map(col =>
                          col.id === column.id ? { ...col, displayName: e.target.value } : col
                        )
                      }));
                    }}
                    placeholder="Nom d'affichage"
                  />
                </div>
                <Select
                  value={column.aggregation || 'none'}
                  onValueChange={(value) => {
                    setReportDefinition(prev => ({
                      ...prev,
                      columns: prev.columns.map(col =>
                        col.id === column.id ? { 
                          ...col, 
                          aggregation: value === 'none' ? undefined : value as any 
                        } : col
                      )
                    }));
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="sum">Somme</SelectItem>
                    <SelectItem value="avg">Moyenne</SelectItem>
                    <SelectItem value="count">Nombre</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count_distinct">Distinct</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeColumn(column.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderFiltersConfig = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </div>
          <Button size="sm" onClick={addFilter} disabled={!selectedDataSource}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardTitle>
        <CardDescription>Définissez les critères de filtrage</CardDescription>
      </CardHeader>
      <CardContent>
        {reportDefinition.filters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun filtre défini. Cliquez sur "Ajouter" pour créer un filtre.
          </div>
        ) : (
          <div className="space-y-3">
            {reportDefinition.filters.map(filter => (
              <div key={filter.id} className="grid grid-cols-12 gap-3 items-center p-3 border rounded">
                <div className="col-span-3">
                  <Select
                    value={filter.field}
                    onValueChange={(value) => updateFilter(filter.id, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDataSource?.fields.map(field => (
                        <SelectItem key={field.id} value={field.name}>
                          {field.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorOptions(filter.dataType).map(op => (
                        <SelectItem key={op} value={op}>
                          {op.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-5">
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Valeur"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPreview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Aperçu</span>
          </div>
          <Button onClick={runPreview} disabled={isPreviewLoading || !selectedDataSource}>
            <Play className="h-4 w-4 mr-2" />
            {isPreviewLoading ? 'Chargement...' : 'Exécuter'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {previewData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Cliquez sur "Exécuter" pour voir l'aperçu des données
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {reportDefinition.columns
                    .filter(col => col.visible)
                    .map(column => (
                      <th key={column.id} className="border border-gray-300 px-4 py-2 text-left">
                        {column.displayName}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {reportDefinition.columns
                      .filter(col => col.visible)
                      .map(column => (
                        <td key={column.id} className="border border-gray-300 px-4 py-2">
                          {row[column.field]}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500">
                Affichage de 10 lignes sur {previewData.length}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Constructeur de Rapports</h1>
          <p className="text-gray-600">Créez des rapports personnalisés avec un constructeur visuel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">Données</TabsTrigger>
          <TabsTrigger value="columns">Colonnes</TabsTrigger>
          <TabsTrigger value="filters">Filtres</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-6">
          {renderDataSourceSelector()}
        </TabsContent>

        <TabsContent value="columns" className="space-y-6">
          {renderColumnsConfig()}
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          {renderFiltersConfig()}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {renderPreview()}
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer le Rapport</DialogTitle>
            <DialogDescription>
              Donnez un nom et une description à votre rapport
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name">Nom du rapport</Label>
              <Input
                id="report-name"
                value={reportDefinition.name}
                onChange={(e) => setReportDefinition(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mon rapport personnalisé"
              />
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={reportDefinition.description}
                onChange={(e) => setReportDefinition(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du rapport..."
              />
            </div>
            <div>
              <Label htmlFor="report-category">Catégorie</Label>
              <Select
                value={reportDefinition.category}
                onValueChange={(value) => setReportDefinition(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventes</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="inventory">Inventaire</SelectItem>
                  <SelectItem value="customers">Clients</SelectItem>
                  <SelectItem value="operations">Opérations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-report"
                checked={reportDefinition.isPublic}
                onCheckedChange={(checked) => setReportDefinition(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="public-report">Rendre ce rapport public</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={saveReport}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomReportBuilder;
