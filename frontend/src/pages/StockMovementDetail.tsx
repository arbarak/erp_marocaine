import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function StockMovementDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [movement, setMovement] = useState({
    id: '',
    movementNumber: '',
    movementType: '',
    warehouseId: '',
    warehouseName: '',
    sourceWarehouseId: '',
    sourceWarehouseName: '',
    destinationWarehouseId: '',
    destinationWarehouseName: '',
    movementDate: '',
    expectedDate: '',
    status: '',
    priority: '',
    responsible: '',
    reference: '',
    reason: '',
    notes: '',
    items: [] as Array<{
      id: string
      productId: string
      productName: string
      productCode: string
      currentStock: number
      quantity: number
      unitCost: number
      totalCost: number
      lotNumber: string
      expiryDate: string
      location: string
    }>,
    totalQuantity: 0,
    totalCost: 0,
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  // Load stock movement data on component mount
  useEffect(() => {
    const loadStockMovement = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load stock movement data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the stock movement
        const mockMovement = {
          id: id || '1',
          movementNumber: 'SM-2025-001',
          movementType: 'in',
          warehouseId: '1',
          warehouseName: 'Entrepôt Principal Casablanca',
          sourceWarehouseId: '',
          sourceWarehouseName: '',
          destinationWarehouseId: '',
          destinationWarehouseName: '',
          movementDate: '2025-01-18',
          expectedDate: '2025-01-18',
          status: 'completed',
          priority: 'normal',
          responsible: 'Ahmed Admin',
          reference: 'PO-2025-001',
          reason: 'Réception fournisseur',
          notes: 'Réception de commande d\'achat PO-2025-001. Contrôle qualité effectué.',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              productCode: 'PROD-001',
              currentStock: 35,
              quantity: 10,
              unitCost: 8500,
              totalCost: 85000,
              lotNumber: 'LOT-2025-001',
              expiryDate: '',
              location: 'A-01-01'
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              productCode: 'PROD-002',
              currentStock: 20,
              quantity: 5,
              unitCost: 2500,
              totalCost: 12500,
              lotNumber: 'LOT-2025-002',
              expiryDate: '',
              location: 'A-01-02'
            }
          ],
          totalQuantity: 15,
          totalCost: 97500,
          createdAt: '2025-01-18T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setMovement(mockMovement)
      } catch (err) {
        setError('Erreur lors du chargement du mouvement de stock')
      } finally {
        setLoading(false)
      }
    }

    loadStockMovement()
  }, [id])

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Entrée de Stock'
      case 'out': return 'Sortie de Stock'
      case 'transfer': return 'Transfert'
      case 'adjustment': return 'Ajustement'
      case 'return': return 'Retour'
      case 'loss': return 'Perte'
      case 'found': return 'Trouvé'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvé'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Faible'
      case 'normal': return 'Normale'
      case 'high': return 'Élevée'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in': return '📥'
      case 'out': return '📤'
      case 'transfer': return '🔄'
      case 'adjustment': return '⚖️'
      case 'return': return '↩️'
      case 'loss': return '❌'
      case 'found': return '✅'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du mouvement de stock...
              </h2>
              <p className="text-muted-foreground">
                Veuillez patienter pendant le chargement des données.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/inventory')}>
                Retour à l'Inventaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {movement.movementNumber}
          </h1>
          <p className="text-muted-foreground">
            Mouvement de stock • {getMovementTypeLabel(movement.movementType)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            Retour à l'Inventaire
          </Button>
          <Button onClick={() => navigate(`/inventory/movements/edit/${movement.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Movement Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du Mouvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° de Mouvement</label>
                  <p className="text-sm font-mono">{movement.movementNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm flex items-center gap-2">
                    <span>{getMovementTypeIcon(movement.movementType)}</span>
                    {getMovementTypeLabel(movement.movementType)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de Mouvement</label>
                  <p className="text-sm">{new Date(movement.movementDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Prévue</label>
                  <p className="text-sm">{new Date(movement.expectedDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Responsable</label>
                  <p className="text-sm">{movement.responsible}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Référence</label>
                  <p className="text-sm">{movement.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Motif</label>
                  <p className="text-sm">{movement.reason}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(movement.status)}>
                  {getStatusLabel(movement.status)}
                </Badge>
                <Badge className={getPriorityColor(movement.priority)}>
                  {getPriorityLabel(movement.priority)}
                </Badge>
                <Badge variant="outline">
                  {movement.items.length} article{movement.items.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Entrepôt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movement.movementType === 'transfer' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entrepôt Source</label>
                      <p className="text-sm">{movement.sourceWarehouseName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Entrepôt Destination</label>
                      <p className="text-sm">{movement.destinationWarehouseName}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entrepôt</label>
                    <p className="text-sm">{movement.warehouseName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movement Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles du Mouvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movement.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">Code: {item.productCode}</p>
                        {item.lotNumber && (
                          <p className="text-sm text-muted-foreground">Lot: {item.lotNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.totalCost.toLocaleString()} MAD</div>
                        <p className="text-sm text-muted-foreground">Coût total</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Quantité</label>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Coût Unitaire</label>
                        <p className="font-medium">{item.unitCost.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Stock Actuel</label>
                        <p className="font-medium">{item.currentStock}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Emplacement</label>
                        <p className="font-medium">{item.location || '-'}</p>
                      </div>
                    </div>
                    {item.expiryDate && (
                      <div className="mt-2">
                        <label className="text-sm text-muted-foreground">Date d'expiration</label>
                        <p className="text-sm">{new Date(item.expiryDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {movement.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{movement.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Movement Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé du Mouvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {getMovementTypeIcon(movement.movementType)}
                </div>
                <p className="text-sm text-muted-foreground">{getMovementTypeLabel(movement.movementType)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Articles</span>
                  <span className="text-sm font-medium">{movement.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantité totale</span>
                  <span className="text-sm font-medium">{movement.totalQuantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coût total</span>
                  <span className="text-sm font-medium">{movement.totalCost.toLocaleString()} MAD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movement Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du Mouvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(movement.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(movement.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Priorité</span>
                  <Badge className={getPriorityColor(movement.priority)}>
                    {getPriorityLabel(movement.priority)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Responsable</span>
                  <span className="text-sm font-medium">{movement.responsible}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Référence</span>
                  <span className="text-sm font-medium">{movement.reference}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {movement.status === 'draft' && (
                <Button className="w-full" onClick={() => navigate(`/inventory/movements/approve/${movement.id}`)}>
                  ✅ Approuver
                </Button>
              )}
              {movement.status === 'approved' && (
                <Button className="w-full" onClick={() => navigate(`/inventory/movements/execute/${movement.id}`)}>
                  🚀 Exécuter
                </Button>
              )}
              <Button className="w-full" variant="outline" onClick={() => navigate(`/inventory/movements/duplicate/${movement.id}`)}>
                📋 Dupliquer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                🖨️ Imprimer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/inventory/movements/history/${movement.id}`)}>
                📊 Historique
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé le</span>
                <span className="text-sm">{new Date(movement.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <span className="text-sm">{new Date(movement.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="text-sm">{movement.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
