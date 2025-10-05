import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DuplicateModal, PrintModal, ActionModal } from '@/components/ActionModal'
import { useToast } from '@/components/Toast'

export function PurchaseOrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showSuccess } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [receiveStockModalOpen, setReceiveStockModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [deliveryNoteModalOpen, setDeliveryNoteModalOpen] = useState(false)

  const [order, setOrder] = useState({
    id: '',
    orderNumber: '',
    supplierId: '',
    supplierName: '',
    supplierCode: '',
    orderDate: '',
    deliveryDate: '',
    status: '',
    priority: '',
    buyer: '',
    paymentTerms: 30,
    currency: 'MAD',
    notes: '',
    deliveryAddress: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      region: '',
      country: 'Maroc'
    },
    items: [] as Array<{
      id: string
      productId: string
      productName: string
      description: string
      quantity: number
      unitPrice: number
      discount: number
      tvaRate: number
      total: number
    }>,
    subtotal: 0,
    totalDiscount: 0,
    totalTVA: 0,
    totalAmount: 0,
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  // Load purchase order data on component mount
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load purchase order data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the purchase order
        const mockOrder = {
          id: id || '1',
          orderNumber: 'PO-2025-001',
          supplierId: '1',
          supplierName: 'TechSupply Maroc',
          supplierCode: 'SUPP-001',
          orderDate: '2025-01-18',
          deliveryDate: '2025-01-25',
          status: 'confirmed',
          priority: 'normal',
          buyer: 'Ahmed Admin',
          paymentTerms: 30,
          currency: 'MAD',
          notes: 'Commande urgente pour renouvellement du stock. Livraison directe à l\'entrepôt principal.',
          deliveryAddress: {
            line1: 'Zone Industrielle Sidi Bernoussi',
            line2: 'Entrepôt A, Bloc 15',
            city: 'Casablanca',
            postalCode: '20600',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              description: 'HP EliteBook 840 G8, Intel Core i7, 16GB RAM, 512GB SSD',
              quantity: 20,
              unitPrice: 7500,
              discount: 10,
              tvaRate: 20,
              total: 162000
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              description: 'Canon PIXMA G3420, Multifonction, WiFi',
              quantity: 10,
              unitPrice: 2200,
              discount: 5,
              tvaRate: 20,
              total: 25080
            }
          ],
          subtotal: 187080,
          totalDiscount: 18708,
          totalTVA: 33674,
          totalAmount: 202046,
          createdAt: '2025-01-18T09:15:00Z',
          updatedAt: '2025-01-18T11:30:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setOrder(mockOrder)
      } catch (err) {
        setError('Erreur lors du chargement de la commande')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En cours'
      case 'shipped': return 'Expédiée'
      case 'received': return 'Reçue'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Basse'
      case 'normal': return 'Normale'
      case 'high': return 'Haute'
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement de la commande...
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
              <Button onClick={() => navigate('/purchases')}>
                Retour aux Achats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Commande d'achat • {order.supplierName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Retour aux Achats
          </Button>
          <Button onClick={() => navigate(`/purchases/orders/edit/${order.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de Commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° de Commande</label>
                  <p className="text-sm font-mono">{order.orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fournisseur</label>
                  <p className="text-sm">{order.supplierName} ({order.supplierCode})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Acheteur</label>
                  <p className="text-sm">{order.buyer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de Commande</label>
                  <p className="text-sm">{new Date(order.orderDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de Livraison</label>
                  <p className="text-sm">{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Conditions de Paiement</label>
                  <p className="text-sm">{order.paymentTerms} jours</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
                <Badge className={getPriorityColor(order.priority)}>
                  {getPriorityLabel(order.priority)}
                </Badge>
                <Badge variant="outline">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse de Livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && (
                  <p className="text-sm">{order.deliveryAddress.line2}</p>
                )}
                <p className="text-sm">
                  {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                </p>
                <p className="text-sm">{order.deliveryAddress.region}</p>
                <p className="text-sm font-medium">{order.deliveryAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles de la Commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.total.toLocaleString()} MAD</div>
                        <p className="text-sm text-muted-foreground">TTC</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Quantité</label>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Prix Unitaire</label>
                        <p className="font-medium">{item.unitPrice.toLocaleString()} MAD</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Remise</label>
                        <p className="font-medium">{item.discount}%</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">TVA</label>
                        <p className="font-medium">{item.tvaRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé Financier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total HT</span>
                  <span className="text-sm font-medium">{order.subtotal.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise totale</span>
                  <span className="text-sm text-red-600">-{order.totalDiscount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">TVA totale</span>
                  <span className="text-sm font-medium">{order.totalTVA.toLocaleString()} MAD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-green-600">{order.totalAmount.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la Commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Priorité</span>
                  <Badge className={getPriorityColor(order.priority)}>
                    {getPriorityLabel(order.priority)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Articles</span>
                  <span className="text-sm font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantité totale</span>
                  <span className="text-sm font-medium">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
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
              <Button className="w-full" onClick={() => setReceiveStockModalOpen(true)}>
                📦 Réceptionner Stock
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setDuplicateModalOpen(true)}>
                📋 Dupliquer Commande
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setPrintModalOpen(true)}>
                🖨️ Imprimer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setDeliveryNoteModalOpen(true)}>
                🚚 Bon de Réception
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
                <span className="text-sm text-muted-foreground">Créée le</span>
                <span className="text-sm">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifiée le</span>
                <span className="text-sm">{new Date(order.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créée par</span>
                <span className="text-sm">{order.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Modals */}
    <ActionModal
      isOpen={receiveStockModalOpen}
      onClose={() => setReceiveStockModalOpen(false)}
      title="Réceptionner Stock"
      description={`Commande ${order.orderNumber}`}
      onConfirm={() => {
        showSuccess('Réception créée', 'Réception de stock créée avec succès!')
        setReceiveStockModalOpen(false)
        // TODO: Navigate to stock movement creation
      }}
      confirmText="Créer Réception"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action va créer un mouvement de stock d'entrée pour tous les articles de cette commande.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Entrepôt de Réception</label>
            <select className="w-full mt-1 p-2 border rounded-md">
              <option>Entrepôt Principal Casablanca</option>
              <option>Dépôt Rabat</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date de Réception</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-md"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Notes de Réception</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md"
            rows={3}
            placeholder="Notes optionnelles sur la réception..."
          />
        </div>
      </div>
    </ActionModal>

    <ActionModal
      isOpen={deliveryNoteModalOpen}
      onClose={() => setDeliveryNoteModalOpen(false)}
      title="Générer Bon de Réception"
      description={`Commande ${order.orderNumber}`}
      onConfirm={() => {
        showSuccess('Bon généré', 'Bon de réception généré avec succès!')
        setDeliveryNoteModalOpen(false)
        // TODO: Generate delivery note
      }}
      confirmText="Générer"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Générer un bon de réception pour cette commande d'achat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Format</label>
            <select className="w-full mt-1 p-2 border rounded-md">
              <option>PDF</option>
              <option>Excel</option>
              <option>Word</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Langue</label>
            <select className="w-full mt-1 p-2 border rounded-md">
              <option>Français</option>
              <option>العربية</option>
              <option>English</option>
            </select>
          </div>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">Inclure les détails des articles</span>
          </label>
        </div>
      </div>
    </ActionModal>

    <DuplicateModal
      isOpen={duplicateModalOpen}
      onClose={() => setDuplicateModalOpen(false)}
      itemType="Commande d'Achat"
      itemNumber={order.orderNumber}
      onDuplicate={(options) => {
        console.log('Duplicate options:', options)
        // TODO: Create duplicate order
      }}
    />

    <PrintModal
      isOpen={printModalOpen}
      onClose={() => setPrintModalOpen(false)}
      itemType="Commande d'Achat"
      itemNumber={order.orderNumber}
      onPrint={(options) => {
        console.log('Print options:', options)
        // TODO: Generate and print document
      }}
    />
  </>
  )
}
