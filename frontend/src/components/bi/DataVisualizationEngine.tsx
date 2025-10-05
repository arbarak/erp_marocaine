// Data Visualization Engine Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Activity, TrendingUp, Zap, Eye, Settings, Palette, Download,
  RefreshCw, Play, Pause, RotateCcw, Maximize2, Copy, Share2
} from 'lucide-react';

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'treemap' | 'funnel';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string[];
  colors: string[];
  options: {
    showGrid: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    showLabels: boolean;
    stacked: boolean;
    smooth: boolean;
    fillOpacity: number;
    strokeWidth: number;
    animationDuration: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

interface VisualizationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  chartType: string;
  preview: string;
  config: Partial<ChartConfig>;
}

const DataVisualizationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    id: 'chart_1',
    type: 'bar',
    title: 'Mon Graphique',
    data: [],
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'],
    options: {
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      showLabels: false,
      stacked: false,
      smooth: false,
      fillOpacity: 0.6,
      strokeWidth: 2,
      animationDuration: 1000
    },
    dimensions: {
      width: 800,
      height: 400
    }
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock data sets
  const mockDataSets = {
    sales: [
      { month: 'Jan', ventes: 180000, objectif: 200000, profit: 32400 },
      { month: 'Fév', ventes: 220000, objectif: 210000, profit: 39600 },
      { month: 'Mar', ventes: 195000, objectif: 205000, profit: 35100 },
      { month: 'Avr', ventes: 240000, objectif: 220000, profit: 43200 },
      { month: 'Mai', ventes: 280000, objectif: 250000, profit: 50400 },
      { month: 'Jun', ventes: 265000, objectif: 260000, profit: 47700 }
    ],
    categories: [
      { name: 'Électronique', value: 35, sales: 850000 },
      { name: 'Vêtements', value: 25, sales: 600000 },
      { name: 'Maison', value: 20, sales: 480000 },
      { name: 'Sport', value: 15, sales: 360000 },
      { name: 'Autres', value: 5, sales: 120000 }
    ],
    performance: [
      { metric: 'Ventes', A: 85, B: 78, fullMark: 100 },
      { metric: 'Marge', A: 92, B: 85, fullMark: 100 },
      { metric: 'Clients', A: 78, B: 82, fullMark: 100 },
      { metric: 'Stock', A: 88, B: 75, fullMark: 100 },
      { metric: 'Qualité', A: 95, B: 90, fullMark: 100 }
    ],
    scatter: [
      { x: 100, y: 200, z: 200 },
      { x: 120, y: 100, z: 260 },
      { x: 170, y: 300, z: 400 },
      { x: 140, y: 250, z: 280 },
      { x: 150, y: 400, z: 500 },
      { x: 110, y: 280, z: 200 }
    ]
  };

  // Visualization templates
  const templates: VisualizationTemplate[] = [
    {
      id: 'sales_trend',
      name: 'Tendance des Ventes',
      description: 'Graphique linéaire pour suivre l\'évolution des ventes',
      category: 'Ventes',
      chartType: 'line',
      preview: '/api/placeholder/200/120',
      config: {
        type: 'line',
        data: mockDataSets.sales,
        xAxis: 'month',
        yAxis: ['ventes', 'objectif']
      }
    },
    {
      id: 'category_distribution',
      name: 'Répartition par Catégorie',
      description: 'Graphique circulaire pour la distribution des catégories',
      category: 'Analyse',
      chartType: 'pie',
      preview: '/api/placeholder/200/120',
      config: {
        type: 'pie',
        data: mockDataSets.categories
      }
    },
    {
      id: 'performance_radar',
      name: 'Performance Radar',
      description: 'Graphique radar pour comparer les performances',
      category: 'Performance',
      chartType: 'radar',
      preview: '/api/placeholder/200/120',
      config: {
        type: 'radar',
        data: mockDataSets.performance
      }
    },
    {
      id: 'sales_bar',
      name: 'Barres de Ventes',
      description: 'Graphique en barres pour comparer les ventes',
      category: 'Ventes',
      chartType: 'bar',
      preview: '/api/placeholder/200/120',
      config: {
        type: 'bar',
        data: mockDataSets.sales,
        xAxis: 'month',
        yAxis: ['ventes']
      }
    }
  ];

  const colorPalettes = [
    { name: 'Défaut', colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'] },
    { name: 'Océan', colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8DD1E1'] },
    { name: 'Coucher de Soleil', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'] },
    { name: 'Professionnel', colors: ['#2C3E50', '#3498DB', '#E74C3C', '#F39C12', '#27AE60'] },
    { name: 'Pastel', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA'] }
  ];

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template && template.config) {
        setChartConfig(prev => ({
          ...prev,
          ...template.config,
          title: template.name
        }));
      }
    }
  }, [selectedTemplate]);

  const updateChartConfig = (updates: Partial<ChartConfig>) => {
    setChartConfig(prev => ({ ...prev, ...updates }));
  };

  const updateChartOptions = (key: string, value: any) => {
    setChartConfig(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
  };

  const renderChart = () => {
    const { type, data, options, colors, dimensions } = chartConfig;
    const commonProps = {
      width: dimensions.width,
      height: dimensions.height,
      data: data
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <BarChart {...commonProps}>
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis || 'month'} />
              <YAxis />
              {options.showTooltip && <Tooltip />}
              {options.showLegend && <Legend />}
              {chartConfig.yAxis?.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]}
                  stackId={options.stacked ? 'stack' : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <LineChart {...commonProps}>
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis || 'month'} />
              <YAxis />
              {options.showTooltip && <Tooltip />}
              {options.showLegend && <Legend />}
              {chartConfig.yAxis?.map((key, index) => (
                <Line 
                  key={key} 
                  type={options.smooth ? 'monotone' : 'linear'}
                  dataKey={key} 
                  stroke={colors[index % colors.length]}
                  strokeWidth={options.strokeWidth}
                  dot={options.showLabels}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={options.showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
                outerRadius={Math.min(dimensions.width, dimensions.height) / 4}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {options.showTooltip && <Tooltip />}
              {options.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <AreaChart {...commonProps}>
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={chartConfig.xAxis || 'month'} />
              <YAxis />
              {options.showTooltip && <Tooltip />}
              {options.showLegend && <Legend />}
              {chartConfig.yAxis?.map((key, index) => (
                <Area 
                  key={key} 
                  type={options.smooth ? 'monotone' : 'linear'}
                  dataKey={key} 
                  stackId={options.stacked ? 'stack' : undefined}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={options.fillOpacity}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              {options.showTooltip && <Tooltip />}
              {options.showLegend && <Legend />}
              <Radar name="A" dataKey="A" stroke={colors[0]} fill={colors[0]} fillOpacity={options.fillOpacity} />
              <Radar name="B" dataKey="B" stroke={colors[1]} fill={colors[1]} fillOpacity={options.fillOpacity} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={dimensions.height}>
            <ScatterChart {...commonProps}>
              {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              {options.showTooltip && <Tooltip />}
              <Scatter name="Points" data={data} fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Sélectionnez un type de graphique
          </div>
        );
    }
  };

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => (
        <Card 
          key={template.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedTemplate(template.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <Badge variant="outline">{template.category}</Badge>
            </div>
            <CardDescription className="text-xs">{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">Aperçu {template.chartType}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderChartControls = () => (
    <div className="space-y-6">
      {/* Chart Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Type de Graphique</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={chartConfig.type} onValueChange={(value) => updateChartConfig({ type: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Barres</SelectItem>
              <SelectItem value="line">Lignes</SelectItem>
              <SelectItem value="pie">Circulaire</SelectItem>
              <SelectItem value="area">Aires</SelectItem>
              <SelectItem value="radar">Radar</SelectItem>
              <SelectItem value="scatter">Nuage de Points</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Data Source */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Source de Données</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={chartConfig.data === mockDataSets.sales ? 'sales' : 
                   chartConfig.data === mockDataSets.categories ? 'categories' : 
                   chartConfig.data === mockDataSets.performance ? 'performance' : 'sales'}
            onValueChange={(value) => updateChartConfig({ data: mockDataSets[value as keyof typeof mockDataSets] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Données de Ventes</SelectItem>
              <SelectItem value="categories">Catégories</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Palette de Couleurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {colorPalettes.map(palette => (
              <div 
                key={palette.name}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                  JSON.stringify(chartConfig.colors) === JSON.stringify(palette.colors) ? 'bg-blue-50 border border-blue-200' : ''
                }`}
                onClick={() => updateChartConfig({ colors: palette.colors })}
              >
                <div className="flex space-x-1">
                  {palette.colors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm">{palette.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Options d'Affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid">Grille</Label>
            <Switch
              id="show-grid"
              checked={chartConfig.options.showGrid}
              onCheckedChange={(checked) => updateChartOptions('showGrid', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-legend">Légende</Label>
            <Switch
              id="show-legend"
              checked={chartConfig.options.showLegend}
              onCheckedChange={(checked) => updateChartOptions('showLegend', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-tooltip">Info-bulles</Label>
            <Switch
              id="show-tooltip"
              checked={chartConfig.options.showTooltip}
              onCheckedChange={(checked) => updateChartOptions('showTooltip', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels">Étiquettes</Label>
            <Switch
              id="show-labels"
              checked={chartConfig.options.showLabels}
              onCheckedChange={(checked) => updateChartOptions('showLabels', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Opacité de Remplissage: {chartConfig.options.fillOpacity}</Label>
            <Slider
              value={[chartConfig.options.fillOpacity]}
              onValueChange={([value]) => updateChartOptions('fillOpacity', value)}
              max={1}
              min={0}
              step={0.1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Épaisseur des Lignes: {chartConfig.options.strokeWidth}</Label>
            <Slider
              value={[chartConfig.options.strokeWidth]}
              onValueChange={([value]) => updateChartOptions('strokeWidth', value)}
              max={5}
              min={1}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moteur de Visualisation</h1>
          <p className="text-gray-600">Créez des graphiques interactifs et personnalisés</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copier
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="controls">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Modèles</TabsTrigger>
              <TabsTrigger value="controls">Contrôles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="mt-4">
              {renderTemplateGrid()}
            </TabsContent>
            
            <TabsContent value="controls" className="mt-4">
              {renderChartControls()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{chartConfig.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center">
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizationEngine;
