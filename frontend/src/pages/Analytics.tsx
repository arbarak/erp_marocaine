import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Analytics() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for KPIs
  const [kpis] = useState([
    {
      id: 1,
      name: 'Chiffre d\'Affaires',
      value: 2450000,
      unit: 'MAD',
      change: 12.5,
      changeType: 'increase',
      period: 'Ce mois',
      target: 2500000,
      category: 'financial'
    },
    {
      id: 2,
      name: 'Marge Brute',
      value: 35.8,
      unit: '%',
      change: -2.1,
      changeType: 'decrease',
      period: 'Ce mois',
      target: 40,
      category: 'financial'
    },
    {
      id: 3,
      name: 'Nouveaux Clients',
      value: 23,
      unit: 'clients',
      change: 15.0,
      changeType: 'increase',
      period: 'Ce mois',
      target: 25,
      category: 'sales'
    },
    {
      id: 4,
      name: 'Rotation Stock',
      value: 8.2,
      unit: 'fois/an',
      change: 5.1,
      changeType: 'increase',
      period: 'Ce mois',
      target: 10,
      category: 'inventory'
    },
    {
      id: 5,
      name: 'Délai Paiement Moyen',
      value: 28,
      unit: 'jours',
      change: -3.2,
      changeType: 'decrease',
      period: 'Ce mois',
      target: 30,
      category: 'financial'
    },
    {
      id: 6,
      name: 'Taux de Conversion',
      value: 18.5,
      unit: '%',
      change: 2.8,
      changeType: 'increase',
      period: 'Ce mois',
      target: 20,
      category: 'sales'
    }
  ])

  // Mock data for trends
  const [trends] = useState([
    {
      id: 1,
      name: 'Évolution du CA',
      period: 'Derniers 12 mois',
      data: [
        { month: 'Jan', value: 1800000 },
        { month: 'Fév', value: 1950000 },
        { month: 'Mar', value: 2100000 },
        { month: 'Avr', value: 2050000 },
        { month: 'Mai', value: 2200000 },
        { month: 'Jun', value: 2350000 },
        { month: 'Jul', value: 2400000 },
        { month: 'Aoû', value: 2300000 },
        { month: 'Sep', value: 2450000 },
        { month: 'Oct', value: 2500000 },
        { month: 'Nov', value: 2400000 },
        { month: 'Déc', value: 2450000 }
      ],
      trend: 'upward',
      growth: 36.1
    },
    {
      id: 2,
      name: 'Acquisition Clients',
      period: 'Derniers 6 mois',
      data: [
        { month: 'Jul', value: 15 },
        { month: 'Aoû', value: 18 },
        { month: 'Sep', value: 22 },
        { month: 'Oct', value: 19 },
        { month: 'Nov', value: 25 },
        { month: 'Déc', value: 23 }
      ],
      trend: 'upward',
      growth: 53.3
    }
  ])

  // Mock data for analytics dashboards
  const [dashboards] = useState([
    {
      id: 1,
      name: 'Tableau de Bord Financier',
      description: 'KPIs financiers et analyse de rentabilité',
      category: 'financial',
      widgets: 8,
      lastUpdated: '2025-01-18T10:30:00Z',
      isActive: true,
      owner: 'Ahmed Admin'
    },
    {
      id: 2,
      name: 'Performance Commerciale',
      description: 'Suivi des ventes et performance équipe',
      category: 'sales',
      widgets: 6,
      lastUpdated: '2025-01-18T09:15:00Z',
      isActive: true,
      owner: 'Fatima Manager'
    },
    {
      id: 3,
      name: 'Analyse Inventaire',
      description: 'Rotation stock et optimisation inventaire',
      category: 'inventory',
      widgets: 5,
      lastUpdated: '2025-01-17T16:45:00Z',
      isActive: true,
      owner: 'Mohamed Director'
    },
    {
      id: 4,
      name: 'Tableau de Bord Exécutif',
      description: 'Vue d\'ensemble pour la direction',
      category: 'executive',
      widgets: 12,
      lastUpdated: '2025-01-18T08:00:00Z',
      isActive: true,
      owner: 'Ahmed Admin'
    }
  ])

  // Mock data for predictive analytics
  const [predictions] = useState([
    {
      id: 1,
      name: 'Prévision CA Q1 2025',
      type: 'revenue_forecast',
      predictedValue: 7200000,
      confidence: 87,
      timeframe: 'Q1 2025',
      basedOn: 'Historique 24 mois + tendances saisonnières',
      generatedAt: '2025-01-18T10:00:00Z'
    },
    {
      id: 2,
      name: 'Risque Rupture Stock',
      type: 'stock_risk',
      predictedValue: 15,
      confidence: 92,
      timeframe: '30 prochains jours',
      basedOn: 'Consommation historique + commandes en cours',
      generatedAt: '2025-01-18T09:30:00Z'
    },
    {
      id: 3,
      name: 'Clients à Risque',
      type: 'customer_churn',
      predictedValue: 8,
      confidence: 78,
      timeframe: '60 prochains jours',
      basedOn: 'Comportement d\'achat + délais de paiement',
      generatedAt: '2025-01-17T14:20:00Z'
    }
  ])

  // Mock data for data exports
  const [dataExports] = useState([
    {
      id: 1,
      name: 'Export KPIs Mensuels',
      format: 'Excel',
      size: '2.5 MB',
      generatedAt: '2025-01-18T10:00:00Z',
      generatedBy: 'Ahmed Admin',
      downloadCount: 5
    },
    {
      id: 2,
      name: 'Analyse Clients - Q4 2024',
      format: 'PDF',
      size: '8.1 MB',
      generatedAt: '2025-01-15T16:30:00Z',
      generatedBy: 'Fatima Manager',
      downloadCount: 12
    },
    {
      id: 3,
      name: 'Données Brutes Ventes',
      format: 'CSV',
      size: '15.3 MB',
      generatedAt: '2025-01-10T09:45:00Z',
      generatedBy: 'Mohamed Director',
      downloadCount: 3
    }
  ])

  const getKpiCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800'
      case 'sales': return 'bg-blue-100 text-blue-800'
      case 'inventory': return 'bg-purple-100 text-purple-800'
      case 'executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeColor = (changeType: string) => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (changeType: string) => {
    return changeType === 'increase' ? '↗️' : '↘️'
  }

  const getTrendColor = (trend: string) => {
    return trend === 'upward' ? 'text-green-600' : 'text-red-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M MAD'
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K MAD'
    }
    return amount.toLocaleString() + ' MAD'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const calculateProgress = (value: number, target: number) => {
    return Math.min(100, (value / target) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics & Business Intelligence
          </h1>
          <p className="text-muted-foreground">
            Analyses avancées et intelligence d'affaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">📊</span>
            Nouveau Tableau de Bord
          </Button>
          <Button>
            <span className="mr-2">📈</span>
            Générer Rapport
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Tableaux de Bord Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">KPIs Suivis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Prédictions Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Exports ce Mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'kpis' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('kpis')}
        >
          KPIs
        </Button>
        <Button
          variant={activeTab === 'dashboards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('dashboards')}
        >
          Tableaux de Bord
        </Button>
        <Button
          variant={activeTab === 'predictions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('predictions')}
        >
          Prédictions
        </Button>
        <Button
          variant={activeTab === 'exports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('exports')}
        >
          Exports
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs Clés de Performance</CardTitle>
              <CardDescription>KPIs principaux et leur évolution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.slice(0, 4).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{kpi.name}</p>
                        <p className="text-xs text-muted-foreground">{kpi.period}</p>
                        <Badge className={getKpiCategoryColor(kpi.category)} size="sm">
                          {kpi.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {kpi.unit === 'MAD' ? formatAmount(kpi.value) : `${kpi.value}${kpi.unit}`}
                      </div>
                      <div className={`text-sm ${getChangeColor(kpi.changeType)}`}>
                        {getChangeIcon(kpi.changeType)} {Math.abs(kpi.change)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${calculateProgress(kpi.value, kpi.target)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analyses Tendancielles</CardTitle>
              <CardDescription>Évolutions et tendances principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend) => (
                  <div key={trend.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{trend.name}</h3>
                      <div className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                        +{trend.growth}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{trend.period}</p>
                    
                    {/* Simple trend visualization */}
                    <div className="flex items-end space-x-1 h-16">
                      {trend.data.slice(-6).map((point, index) => {
                        const maxValue = Math.max(...trend.data.map(d => d.value))
                        const height = (point.value / maxValue) * 100
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: `${height}%` }}
                            ></div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {point.month}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'kpis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{kpi.name}</span>
                  <Badge className={getKpiCategoryColor(kpi.category)}>
                    {kpi.category}
                  </Badge>
                </CardTitle>
                <CardDescription>{kpi.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {kpi.unit === 'MAD' ? formatAmount(kpi.value) : `${kpi.value}${kpi.unit}`}
                    </div>
                    <div className={`text-sm ${getChangeColor(kpi.changeType)} flex items-center justify-center gap-1`}>
                      <span>{getChangeIcon(kpi.changeType)}</span>
                      <span>{Math.abs(kpi.change)}% vs mois précédent</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Objectif</span>
                      <span>{kpi.unit === 'MAD' ? formatAmount(kpi.target) : `${kpi.target}${kpi.unit}`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${calculateProgress(kpi.value, kpi.target) >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, calculateProgress(kpi.value, kpi.target))}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {calculateProgress(kpi.value, kpi.target).toFixed(1)}% de l'objectif atteint
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'dashboards' && (
        <Card>
          <CardHeader>
            <CardTitle>Tableaux de Bord</CardTitle>
            <CardDescription>Gestion des tableaux de bord analytiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboards.map((dashboard) => (
                <div key={dashboard.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{dashboard.name}</h3>
                      <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getKpiCategoryColor(dashboard.category)}>
                          {dashboard.category}
                        </Badge>
                        <Badge variant="outline">
                          {dashboard.widgets} widgets
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Par {dashboard.owner}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Mis à jour: {formatDateTime(dashboard.lastUpdated)}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Voir</Button>
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Partager</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'predictions' && (
        <Card>
          <CardHeader>
            <CardTitle>Analyses Prédictives</CardTitle>
            <CardDescription>Prévisions et analyses prédictives basées sur l'IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔮</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{prediction.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Période: {prediction.timeframe}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Généré le: {formatDateTime(prediction.generatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Détails</Button>
                      <Button variant="outline" size="sm">Actualiser</Button>
                      <Button variant="outline" size="sm">Exporter</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium mb-3">Prédiction</p>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {prediction.type === 'revenue_forecast' ? formatAmount(prediction.predictedValue) :
                           prediction.predictedValue}
                          {prediction.type === 'stock_risk' ? ' produits' :
                           prediction.type === 'customer_churn' ? ' clients' : ''}
                        </div>
                        <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          Confiance: {prediction.confidence}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getConfidenceColor(prediction.confidence).includes('green') ? 'bg-green-500' :
                                       getConfidenceColor(prediction.confidence).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${prediction.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-3">Méthodologie</p>
                      <div className="p-3 bg-muted rounded text-sm">
                        {prediction.basedOn}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="outline">
                      {prediction.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={prediction.confidence >= 80 ? 'success' : prediction.confidence >= 60 ? 'warning' : 'destructive'}>
                      {prediction.confidence >= 80 ? 'Haute confiance' :
                       prediction.confidence >= 60 ? 'Confiance moyenne' : 'Faible confiance'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'exports' && (
        <Card>
          <CardHeader>
            <CardTitle>Exports de Données</CardTitle>
            <CardDescription>Historique des exports et téléchargements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataExports.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{exportItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Généré par {exportItem.generatedBy} • {formatDateTime(exportItem.generatedAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {exportItem.format}
                        </Badge>
                        <Badge variant="outline">
                          {exportItem.size}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exportItem.downloadCount} téléchargements
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Télécharger</Button>
                    <Button variant="outline" size="sm">Partager</Button>
                    <Button variant="outline" size="sm">Supprimer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau Tableau de Bord</CardTitle>
          <CardDescription>Créer un nouveau tableau de bord analytique</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom du Tableau de Bord</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Performance Commerciale Q1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="financial">Financier</option>
                <option value="sales">Commercial</option>
                <option value="inventory">Inventaire</option>
                <option value="executive">Exécutif</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Période de Données</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Temps réel</option>
                <option>Dernières 24h</option>
                <option>Dernière semaine</option>
                <option>Dernier mois</option>
                <option>Dernier trimestre</option>
                <option>Dernière année</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fréquence de Mise à Jour</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Temps réel</option>
                <option>Toutes les heures</option>
                <option>Quotidienne</option>
                <option>Hebdomadaire</option>
                <option>Mensuelle</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              placeholder="Description du tableau de bord et de ses objectifs"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">KPIs à Inclure</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {['Chiffre d\'Affaires', 'Marge Brute', 'Nouveaux Clients', 'Rotation Stock', 'Délai Paiement', 'Taux Conversion'].map((kpi) => (
                <label key={kpi} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">{kpi}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer le Tableau de Bord</Button>
            <Button variant="outline">Aperçu</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
