import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Inventory() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for warehouses
  const [warehouses] = useState([
    {
      id: 1,
      code: 'WH-CAS-001',
      name: 'Entrepôt Principal Casablanca',
      address: '123 Zone Industrielle Ain Sebaa',
      city: 'Casablanca',
      capacity: 5000,
      occupied: 3200,
      status: 'active'
    },
    {
      id: 2,
      code: 'WH-RAB-002',
      name: 'Dépôt Rabat',
      address: '456 Avenue Mohammed V',
      city: 'Rabat',
      capacity: 2000,
      occupied: 800,
      status: 'active'
    }
  ])

  // Mock data for stock movements
  const [stockMovements] = useState([
    {
      id: 1,
      type: 'IN',
      product: 'Ordinateur Portable HP',
      sku: 'HP-LAP-001',
      quantity: 50,
      warehouse: 'Entrepôt Principal Casablanca',
      location: 'A-01-01',
      date: '2025-01-18',
      reference: 'REC-2025-001',
      user: 'Ahmed Admin'
    },
    {
      id: 2,
      type: 'OUT',
      product: 'Imprimante Canon',
      sku: 'CAN-PRT-002',
      quantity: -5,
      warehouse: 'Entrepôt Principal Casablanca',
      location: 'B-02-03',
      date: '2025-01-18',
      reference: 'DEL-2025-001',
      user: 'Ahmed Admin'
    },
    {
      id: 3,
      type: 'TRANSFER',
      product: 'Souris Logitech',
      sku: 'LOG-MOU-003',
      quantity: 20,
      warehouse: 'Dépôt Rabat',
      location: 'C-01-05',
      date: '2025-01-17',
      reference: 'TRF-2025-001',
      user: 'Ahmed Admin'
    }
  ])

  // Mock data for current stock levels
  const [stockLevels] = useState([
    {
      id: 1,
      product: 'Ordinateur Portable HP',
      sku: 'HP-LAP-001',
      warehouse: 'Entrepôt Principal Casablanca',
      location: 'A-01-01',
      quantity: 75,
      reserved: 10,
      available: 65,
      minStock: 20,
      maxStock: 100,
      value: 637500, // 75 * 8500
      lastMovement: '2025-01-18'
    },
    {
      id: 2,
      product: 'Imprimante Canon',
      sku: 'CAN-PRT-002',
      warehouse: 'Entrepôt Principal Casablanca',
      location: 'B-02-03',
      quantity: 10,
      reserved: 2,
      available: 8,
      minStock: 15,
      maxStock: 50,
      value: 12000, // 10 * 1200
      lastMovement: '2025-01-18'
    },
    {
      id: 3,
      product: 'Souris Logitech',
      sku: 'LOG-MOU-003',
      warehouse: 'Dépôt Rabat',
      location: 'C-01-05',
      quantity: 70,
      reserved: 5,
      available: 65,
      minStock: 30,
      maxStock: 100,
      value: 10500, // 70 * 150
      lastMovement: '2025-01-17'
    }
  ])

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800'
      case 'OUT': return 'bg-red-100 text-red-800'
      case 'TRANSFER': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'IN': return '📥'
      case 'OUT': return '📤'
      case 'TRANSFER': return '🔄'
      default: return '📦'
    }
  }

  const getStockStatus = (quantity: number, minStock: number, maxStock: number) => {
    if (quantity <= minStock) return { status: 'low', color: 'destructive' }
    if (quantity >= maxStock) return { status: 'high', color: 'warning' }
    return { status: 'normal', color: 'success' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Stocks
          </h1>
          <p className="text-muted-foreground">
            Gestion des entrepôts, emplacements et mouvements de stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory/warehouses/create')}>
            <span className="mr-2">🏢</span>
            Nouvel Entrepôt
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('inventory')}>
            <span className="mr-2">📊</span>
            Inventaire
          </Button>
          <Button onClick={() => navigate('/inventory/movements/create')}>
            <span className="mr-2">➕</span>
            Mouvement de Stock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Entrepôts Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">155</div>
            <p className="text-sm text-muted-foreground">Emplacements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">660,000 MAD</div>
            <p className="text-sm text-muted-foreground">Valeur du Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-sm text-muted-foreground">Alertes Stock Faible</p>
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
          variant={activeTab === 'warehouses' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('warehouses')}
        >
          Entrepôts
        </Button>
        <Button
          variant={activeTab === 'stock' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('stock')}
        >
          Niveaux de Stock
        </Button>
        <Button
          variant={activeTab === 'movements' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('movements')}
        >
          Mouvements
        </Button>
        <Button
          variant={activeTab === 'inventory' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('inventory')}
        >
          Inventaire
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
          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Mouvements Récents</CardTitle>
              <CardDescription>Derniers mouvements de stock</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockMovements.slice(0, 5).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">{getMovementTypeIcon(movement.type)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{movement.product}</p>
                        <p className="text-xs text-muted-foreground">{movement.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </div>
                      <p className="text-xs text-muted-foreground">{movement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertes de Stock</CardTitle>
              <CardDescription>Produits nécessitant une attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockLevels.filter(stock => stock.quantity <= stock.minStock).map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">⚠️</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{stock.product}</p>
                        <p className="text-xs text-muted-foreground">{stock.warehouse}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">
                        {stock.quantity} / {stock.minStock}
                      </div>
                      <p className="text-xs text-muted-foreground">Stock faible</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'warehouses' && (
        <Card>
          <CardHeader>
            <CardTitle>Entrepôts</CardTitle>
            <CardDescription>Gestion des entrepôts et de leur capacité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{warehouse.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {warehouse.code}</p>
                      <p className="text-sm text-muted-foreground">{warehouse.address}, {warehouse.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          Capacité: {warehouse.occupied.toLocaleString()} / {warehouse.capacity.toLocaleString()}
                        </Badge>
                        <Badge variant={warehouse.status === 'active' ? 'success' : 'destructive'}>
                          {warehouse.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {Math.round((warehouse.occupied / warehouse.capacity) * 100)}%
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/inventory/warehouses/detail/${warehouse.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/inventory/warehouses/edit/${warehouse.id}`)}>
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'stock' && (
        <Card>
          <CardHeader>
            <CardTitle>Niveaux de Stock</CardTitle>
            <CardDescription>État actuel des stocks par produit et emplacement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockLevels.map((stock) => {
                const status = getStockStatus(stock.quantity, stock.minStock, stock.maxStock)
                return (
                  <div key={stock.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">📦</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{stock.product}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {stock.sku}</p>
                        <p className="text-sm text-muted-foreground">{stock.warehouse} - {stock.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={status.color}>
                            Stock: {stock.quantity}
                          </Badge>
                          <Badge variant="outline">
                            Disponible: {stock.available}
                          </Badge>
                          <Badge variant="outline">
                            Réservé: {stock.reserved}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stock.value.toLocaleString()} MAD</div>
                      <p className="text-sm text-muted-foreground">Min: {stock.minStock} | Max: {stock.maxStock}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          // TODO: Open adjustment modal
                          alert('Fonctionnalité d\'ajustement à implémenter')
                        }}>
                          Ajuster
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          // TODO: Show stock history
                          alert('Historique des mouvements à implémenter')
                        }}>
                          Historique
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'movements' && (
        <Card>
          <CardHeader>
            <CardTitle>Mouvements de Stock</CardTitle>
            <CardDescription>Historique complet des mouvements de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getMovementTypeColor(movement.type)}`}>
                      <span className="text-xl">{getMovementTypeIcon(movement.type)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{movement.product}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {movement.sku}</p>
                      <p className="text-sm text-muted-foreground">{movement.warehouse} - {movement.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {movement.type === 'IN' ? 'Entrée' : movement.type === 'OUT' ? 'Sortie' : 'Transfert'}
                        </Badge>
                        <Badge variant="outline">
                          Réf: {movement.reference}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </div>
                    <p className="text-sm text-muted-foreground">{movement.date}</p>
                    <p className="text-sm text-muted-foreground">Par: {movement.user}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/inventory/movements/detail/${movement.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/inventory/movements/edit/${movement.id}`)}>
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions d'Inventaire</CardTitle>
              <CardDescription>Gestion des inventaires et ajustements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center" onClick={() => {
                  alert('Démarrer un nouvel inventaire - Fonctionnalité à implémenter')
                }}>
                  <span className="text-2xl mb-2">📋</span>
                  Nouvel Inventaire
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => {
                  alert('Rapport d\'inventaire - Fonctionnalité à implémenter')
                }}>
                  <span className="text-2xl mb-2">📊</span>
                  Rapport d'Inventaire
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => {
                  alert('Ajustements en lot - Fonctionnalité à implémenter')
                }}>
                  <span className="text-2xl mb-2">⚖️</span>
                  Ajustements en Lot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Inventory Status */}
          <Card>
            <CardHeader>
              <CardTitle>État de l'Inventaire</CardTitle>
              <CardDescription>Statut actuel des inventaires en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Inventaire Annuel 2025</h3>
                      <p className="text-sm text-muted-foreground">Entrepôt Principal Casablanca</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">En cours</Badge>
                        <Badge variant="outline">75% complété</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">156 / 208</div>
                    <p className="text-sm text-muted-foreground">Articles comptés</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Continuer</Button>
                      <Button variant="outline" size="sm">Rapport</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport de valorisation du stock - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="font-semibold mb-2">Valorisation du Stock</h3>
                <p className="text-sm text-muted-foreground">Valeur totale des stocks par entrepôt</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport de rotation des stocks - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="font-semibold mb-2">Rotation des Stocks</h3>
                <p className="text-sm text-muted-foreground">Analyse de la rotation par produit</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport des stocks faibles - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">⚠️</div>
                <h3 className="font-semibold mb-2">Stocks Faibles</h3>
                <p className="text-sm text-muted-foreground">Produits nécessitant un réapprovisionnement</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport des mouvements - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="font-semibold mb-2">Mouvements de Stock</h3>
                <p className="text-sm text-muted-foreground">Historique détaillé des mouvements</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport ABC - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">📈</div>
                <h3 className="font-semibold mb-2">Analyse ABC</h3>
                <p className="text-sm text-muted-foreground">Classification des produits par valeur</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              alert('Rapport de performance - Fonctionnalité à implémenter')
            }}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Performance Entrepôts</h3>
                <p className="text-sm text-muted-foreground">Indicateurs de performance par entrepôt</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Génération Rapide de Rapport</CardTitle>
              <CardDescription>Créer un rapport personnalisé</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type de Rapport</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Valorisation du Stock</option>
                    <option>Mouvements de Stock</option>
                    <option>Stocks Faibles</option>
                    <option>Rotation des Stocks</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Période</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Ce mois</option>
                    <option>Mois dernier</option>
                    <option>Ce trimestre</option>
                    <option>Cette année</option>
                    <option>Personnalisée</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Entrepôt</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Tous les entrepôts</option>
                    <option>Entrepôt Principal Casablanca</option>
                    <option>Dépôt Rabat</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={() => {
                  alert('Génération du rapport - Fonctionnalité à implémenter')
                }}>
                  <span className="mr-2">📊</span>
                  Générer le Rapport
                </Button>
                <Button variant="outline" onClick={() => {
                  alert('Export Excel - Fonctionnalité à implémenter')
                }}>
                  <span className="mr-2">📄</span>
                  Exporter Excel
                </Button>
                <Button variant="outline" onClick={() => {
                  alert('Export PDF - Fonctionnalité à implémenter')
                }}>
                  <span className="mr-2">🖨️</span>
                  Exporter PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Enregistrer un mouvement de stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Type de Mouvement</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="IN">Entrée de Stock</option>
                <option value="OUT">Sortie de Stock</option>
                <option value="TRANSFER">Transfert</option>
                <option value="ADJUSTMENT">Ajustement</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Produit</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Ordinateur Portable HP</option>
                <option>Imprimante Canon</option>
                <option>Souris Logitech</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Entrepôt</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Entrepôt Principal Casablanca</option>
                <option>Dépôt Rabat</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Emplacement</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: A-01-01"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantité</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Référence</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: REC-2025-001"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium">Commentaire</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              placeholder="Commentaire optionnel sur le mouvement..."
            />
          </div>
          <div className="mt-6 flex gap-2">
            <Button>Enregistrer le Mouvement</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
