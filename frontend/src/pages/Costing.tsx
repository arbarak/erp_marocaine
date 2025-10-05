import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Costing() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for cost centers
  const [costCenters] = useState([
    {
      id: 1,
      code: 'PROD-001',
      name: 'Production Principale',
      description: 'Centre de coût principal de production',
      type: 'production',
      manager: 'Ahmed Benali',
      budget: 500000,
      actualCost: 425000,
      variance: -75000,
      variancePercent: -15,
      isActive: true
    },
    {
      id: 2,
      code: 'ADMIN-001',
      name: 'Administration',
      description: 'Frais administratifs généraux',
      type: 'administrative',
      manager: 'Fatima Alami',
      budget: 200000,
      actualCost: 185000,
      variance: -15000,
      variancePercent: -7.5,
      isActive: true
    },
    {
      id: 3,
      code: 'SALES-001',
      name: 'Commercial',
      description: 'Équipe commerciale et marketing',
      type: 'sales',
      manager: 'Mohamed Tazi',
      budget: 150000,
      actualCost: 165000,
      variance: 15000,
      variancePercent: 10,
      isActive: true
    },
    {
      id: 4,
      code: 'MAINT-001',
      name: 'Maintenance',
      description: 'Maintenance équipements et infrastructure',
      type: 'maintenance',
      manager: 'Sara Idrissi',
      budget: 80000,
      actualCost: 72000,
      variance: -8000,
      variancePercent: -10,
      isActive: true
    }
  ])

  // Mock data for product costing
  const [productCosts] = useState([
    {
      id: 1,
      productCode: 'HP-LAP-001',
      productName: 'HP Laptop ProBook 450',
      costingMethod: 'FIFO',
      standardCost: 4500,
      actualCost: 4650,
      variance: 150,
      variancePercent: 3.33,
      lastCalculated: '2025-01-18T10:00:00Z',
      components: {
        material: 3200,
        labor: 800,
        overhead: 650
      }
    },
    {
      id: 2,
      productCode: 'DEL-MON-001',
      productName: 'Dell Monitor 24"',
      costingMethod: 'WAC',
      standardCost: 1200,
      actualCost: 1180,
      variance: -20,
      variancePercent: -1.67,
      lastCalculated: '2025-01-18T09:30:00Z',
      components: {
        material: 850,
        labor: 200,
        overhead: 130
      }
    },
    {
      id: 3,
      productCode: 'CAN-PRT-001',
      productName: 'Canon Printer LaserJet',
      costingMethod: 'LIFO',
      standardCost: 2800,
      actualCost: 2950,
      variance: 150,
      variancePercent: 5.36,
      lastCalculated: '2025-01-18T08:45:00Z',
      components: {
        material: 2100,
        labor: 500,
        overhead: 350
      }
    }
  ])

  // Mock data for cost allocations
  const [costAllocations] = useState([
    {
      id: 1,
      period: '2025-01',
      fromCostCenter: 'ADMIN-001',
      toCostCenter: 'PROD-001',
      amount: 45000,
      allocationBase: 'Direct Labor Hours',
      percentage: 60,
      status: 'allocated',
      allocatedBy: 'Ahmed Admin',
      allocatedAt: '2025-01-15T14:30:00Z'
    },
    {
      id: 2,
      period: '2025-01',
      fromCostCenter: 'ADMIN-001',
      toCostCenter: 'SALES-001',
      amount: 30000,
      allocationBase: 'Revenue',
      percentage: 40,
      status: 'allocated',
      allocatedBy: 'Ahmed Admin',
      allocatedAt: '2025-01-15T14:30:00Z'
    },
    {
      id: 3,
      period: '2025-01',
      fromCostCenter: 'MAINT-001',
      toCostCenter: 'PROD-001',
      amount: 72000,
      allocationBase: 'Machine Hours',
      percentage: 100,
      status: 'pending',
      allocatedBy: null,
      allocatedAt: null
    }
  ])

  // Mock data for cost reports
  const [costReports] = useState([
    {
      id: 1,
      name: 'Analyse des Écarts de Coûts',
      period: '2025-01',
      type: 'variance_analysis',
      totalBudget: 930000,
      totalActual: 847000,
      totalVariance: -83000,
      variancePercent: -8.92,
      generatedAt: '2025-01-18T10:00:00Z'
    },
    {
      id: 2,
      name: 'Coûts par Centre',
      period: '2025-01',
      type: 'cost_center_analysis',
      totalBudget: 930000,
      totalActual: 847000,
      totalVariance: -83000,
      variancePercent: -8.92,
      generatedAt: '2025-01-17T16:00:00Z'
    },
    {
      id: 3,
      name: 'Coûts Produits',
      period: '2025-01',
      type: 'product_costing',
      totalBudget: 930000,
      totalActual: 847000,
      totalVariance: -83000,
      variancePercent: -8.92,
      generatedAt: '2025-01-16T14:00:00Z'
    }
  ])

  const getCostCenterTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'bg-blue-100 text-blue-800'
      case 'administrative': return 'bg-gray-100 text-gray-800'
      case 'sales': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600'
    if (variance < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getCostingMethodDisplay = (method: string) => {
    const methods = {
      'FIFO': 'Premier Entré, Premier Sorti',
      'LIFO': 'Dernier Entré, Premier Sorti',
      'WAC': 'Coût Moyen Pondéré'
    }
    return methods[method as keyof typeof methods] || method
  }

  const getAllocationStatusColor = (status: string) => {
    return status === 'allocated' ? 'success' : 'warning'
  }

  const getAllocationStatusText = (status: string) => {
    return status === 'allocated' ? 'Alloué' : 'En attente'
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + ' MAD'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Coûts
          </h1>
          <p className="text-muted-foreground">
            Analyse et contrôle des coûts par centre et produit
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">📊</span>
            Rapport de Coûts
          </Button>
          <Button>
            <span className="mr-2">➕</span>
            Nouveau Centre de Coût
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">930K</div>
            <p className="text-sm text-muted-foreground">Budget Total (MAD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">847K</div>
            <p className="text-sm text-muted-foreground">Coût Réel (MAD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">-83K</div>
            <p className="text-sm text-muted-foreground">Écart Total (MAD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">-8.9%</div>
            <p className="text-sm text-muted-foreground">Écart Pourcentage</p>
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
          variant={activeTab === 'centers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('centers')}
        >
          Centres de Coût
        </Button>
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('products')}
        >
          Coûts Produits
        </Button>
        <Button
          variant={activeTab === 'allocations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('allocations')}
        >
          Allocations
        </Button>
        <Button
          variant={activeTab === 'reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reports')}
        >
          Rapports
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Center Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance des Centres de Coût</CardTitle>
              <CardDescription>Écarts budget vs réel par centre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costCenters.map((center) => (
                  <div key={center.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">🏭</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{center.name}</p>
                        <p className="text-xs text-muted-foreground">{center.code} • {center.manager}</p>
                        <Badge className={getCostCenterTypeColor(center.type)} size="sm">
                          {center.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatAmount(center.actualCost)} / {formatAmount(center.budget)}
                      </div>
                      <div className={`text-sm ${getVarianceColor(center.variance)}`}>
                        {center.variance > 0 ? '+' : ''}{formatAmount(center.variance)} ({center.variancePercent}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Cost Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Coûts Récents</CardTitle>
              <CardDescription>Dernières analyses de coûts générées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Période: {report.period} • {formatDateTime(report.generatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatAmount(report.totalActual)}
                      </div>
                      <div className={`text-sm ${getVarianceColor(report.totalVariance)}`}>
                        {report.totalVariance > 0 ? '+' : ''}{formatAmount(report.totalVariance)} ({report.variancePercent}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'centers' && (
        <Card>
          <CardHeader>
            <CardTitle>Centres de Coût</CardTitle>
            <CardDescription>Gestion et analyse des centres de coût</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costCenters.map((center) => (
                <div key={center.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏭</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{center.name}</h3>
                        <p className="text-sm text-muted-foreground">{center.description}</p>
                        <p className="text-sm text-muted-foreground">Code: {center.code} • Responsable: {center.manager}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Historique</Button>
                      <Button variant="outline" size="sm">Rapport</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Budget vs Réel</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Budget:</span> {formatAmount(center.budget)}</p>
                        <p><span className="font-medium">Coût Réel:</span> {formatAmount(center.actualCost)}</p>
                        <p className={`${getVarianceColor(center.variance)}`}>
                          <span className="font-medium">Écart:</span> {center.variance > 0 ? '+' : ''}{formatAmount(center.variance)}
                        </p>
                        <p className={`${getVarianceColor(center.variance)}`}>
                          <span className="font-medium">Pourcentage:</span> {center.variancePercent}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Informations</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Type:</span> {center.type}</p>
                        <p><span className="font-medium">Responsable:</span> {center.manager}</p>
                        <p><span className="font-medium">Statut:</span> {center.isActive ? 'Actif' : 'Inactif'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Performance</p>
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${center.variance < 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(center.variancePercent) * 5)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs">
                          {center.variance < 0 ? 'Sous budget' : 'Dépassement'}: {Math.abs(center.variancePercent)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={getCostCenterTypeColor(center.type)}>
                      {center.type}
                    </Badge>
                    <Badge variant={center.isActive ? 'success' : 'destructive'}>
                      {center.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant={center.variance < 0 ? 'success' : 'destructive'}>
                      {center.variance < 0 ? 'Sous Budget' : 'Dépassement'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Coûts des Produits</CardTitle>
            <CardDescription>Analyse des coûts par produit et méthode de valorisation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productCosts.map((product) => (
                <div key={product.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{product.productName}</h3>
                        <p className="text-sm text-muted-foreground">Code: {product.productCode}</p>
                        <p className="text-sm text-muted-foreground">
                          Méthode: {getCostingMethodDisplay(product.costingMethod)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Recalculer</Button>
                      <Button variant="outline" size="sm">Historique</Button>
                      <Button variant="outline" size="sm">Détails</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium mb-3">Coûts Standard vs Réel</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Coût Standard:</span>
                          <span className="font-medium">{formatAmount(product.standardCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût Réel:</span>
                          <span className="font-medium">{formatAmount(product.actualCost)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Écart:</span>
                          <span className={`font-medium ${getVarianceColor(product.variance)}`}>
                            {product.variance > 0 ? '+' : ''}{formatAmount(product.variance)} ({product.variancePercent}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-3">Décomposition des Coûts</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Matières Premières:</span>
                          <span className="font-medium">{formatAmount(product.components.material)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Main d'Œuvre:</span>
                          <span className="font-medium">{formatAmount(product.components.labor)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frais Généraux:</span>
                          <span className="font-medium">{formatAmount(product.components.overhead)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Total:</span>
                          <span className="font-medium">{formatAmount(product.actualCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="outline">
                      {product.costingMethod}
                    </Badge>
                    <Badge variant={product.variance < 0 ? 'success' : 'destructive'}>
                      {product.variance < 0 ? 'Sous Coût' : 'Surcoût'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Dernière mise à jour: {formatDateTime(product.lastCalculated)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'allocations' && (
        <Card>
          <CardHeader>
            <CardTitle>Allocations de Coûts</CardTitle>
            <CardDescription>Répartition des coûts entre centres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costAllocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔄</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {allocation.fromCostCenter} → {allocation.toCostCenter}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Période: {allocation.period} • Base: {allocation.allocationBase}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {allocation.percentage}%
                        </Badge>
                        <Badge variant={getAllocationStatusColor(allocation.status)}>
                          {getAllocationStatusText(allocation.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatAmount(allocation.amount)}
                    </div>
                    {allocation.allocatedBy && (
                      <p className="text-sm text-muted-foreground">
                        Par {allocation.allocatedBy}
                      </p>
                    )}
                    {allocation.allocatedAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(allocation.allocatedAt)}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        {allocation.status === 'allocated' ? 'Modifier' : 'Allouer'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports de Coûts</CardTitle>
            <CardDescription>Analyses et rapports de performance des coûts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Période: {report.period} • Type: {report.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Généré le: {formatDateTime(report.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <p><span className="font-medium">Budget:</span> {formatAmount(report.totalBudget)}</p>
                      <p><span className="font-medium">Réel:</span> {formatAmount(report.totalActual)}</p>
                      <p className={`${getVarianceColor(report.totalVariance)}`}>
                        <span className="font-medium">Écart:</span> {report.totalVariance > 0 ? '+' : ''}{formatAmount(report.totalVariance)} ({report.variancePercent}%)
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Voir</Button>
                      <Button variant="outline" size="sm">Télécharger</Button>
                      <Button size="sm">Régénérer</Button>
                    </div>
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
          <CardTitle>Nouveau Centre de Coût</CardTitle>
          <CardDescription>Créer un nouveau centre de coût</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Code du Centre</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: PROD-002"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom du Centre</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Production Secondaire"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="production">Production</option>
                <option value="administrative">Administratif</option>
                <option value="sales">Commercial</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Responsable</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Ahmed Benali"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Budget Annuel (MAD)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="500000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Description du centre de coût"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer le Centre de Coût</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
