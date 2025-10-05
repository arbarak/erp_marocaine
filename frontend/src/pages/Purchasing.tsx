import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Purchasing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for suppliers
  const [suppliers] = useState([
    {
      id: 1,
      code: 'SUPP-001',
      name: 'TechDistrib Maroc',
      ice: '004567890123456',
      email: 'contact@techdistrib.ma',
      phone: '+212 522 987 654',
      address: '89 Zone Industrielle Sidi Bernoussi',
      city: 'Casablanca',
      paymentTerms: '30 jours',
      currentBalance: 85000,
      status: 'active',
      lastOrder: '2025-01-15'
    },
    {
      id: 2,
      code: 'SUPP-002',
      name: 'Atlas Office Supplies',
      ice: '005678901234567',
      email: 'orders@atlas-office.ma',
      phone: '+212 537 456 789',
      address: '34 Boulevard Al Massira, Rabat',
      city: 'Rabat',
      paymentTerms: '45 jours',
      currentBalance: 32000,
      status: 'active',
      lastOrder: '2025-01-12'
    },
    {
      id: 3,
      code: 'SUPP-003',
      name: 'Maroc IT Solutions',
      ice: '006789012345678',
      email: 'procurement@marocit.ma',
      phone: '+212 524 321 987',
      address: '67 Avenue Hassan II, Fès',
      city: 'Fès',
      paymentTerms: '60 jours',
      currentBalance: 15000,
      status: 'active',
      lastOrder: '2025-01-10'
    }
  ])

  // Mock data for purchase orders
  const [purchaseOrders] = useState([
    {
      id: 1,
      number: 'PO-2025-001',
      supplier: 'TechDistrib Maroc',
      supplierCode: 'SUPP-001',
      date: '2025-01-18',
      deliveryDate: '2025-01-25',
      status: 'confirmed',
      totalHT: 425000,
      totalTTC: 510000,
      items: [
        { product: 'Ordinateur Portable HP', quantity: 50, unitPrice: 8500 }
      ],
      buyer: 'Ahmed Admin'
    },
    {
      id: 2,
      number: 'PO-2025-002',
      supplier: 'Atlas Office Supplies',
      supplierCode: 'SUPP-002',
      date: '2025-01-17',
      deliveryDate: '2025-01-24',
      status: 'draft',
      totalHT: 60000,
      totalTTC: 72000,
      items: [
        { product: 'Imprimante Canon', quantity: 50, unitPrice: 1200 }
      ],
      buyer: 'Ahmed Admin'
    },
    {
      id: 3,
      number: 'PO-2025-003',
      supplier: 'Maroc IT Solutions',
      supplierCode: 'SUPP-003',
      date: '2025-01-16',
      deliveryDate: '2025-01-23',
      status: 'received',
      totalHT: 15000,
      totalTTC: 18000,
      items: [
        { product: 'Souris Logitech', quantity: 100, unitPrice: 150 }
      ],
      buyer: 'Ahmed Admin'
    }
  ])

  // Mock data for supplier quotations
  const [supplierQuotations] = useState([
    {
      id: 1,
      number: 'RFQ-2025-001',
      supplier: 'TechDistrib Maroc',
      date: '2025-01-18',
      validUntil: '2025-02-18',
      status: 'received',
      totalHT: 850000,
      totalTTC: 1020000,
      items: [
        { product: 'Ordinateur Portable HP', quantity: 100, unitPrice: 8500 }
      ]
    },
    {
      id: 2,
      number: 'RFQ-2025-002',
      supplier: 'Atlas Office Supplies',
      date: '2025-01-17',
      validUntil: '2025-02-17',
      status: 'pending',
      totalHT: 120000,
      totalTTC: 144000,
      items: [
        { product: 'Imprimante Canon', quantity: 100, unitPrice: 1200 }
      ]
    }
  ])

  // Mock data for goods receipts
  const [goodsReceipts] = useState([
    {
      id: 1,
      number: 'GR-2025-001',
      purchaseOrder: 'PO-2025-003',
      supplier: 'Maroc IT Solutions',
      date: '2025-01-23',
      status: 'completed',
      items: [
        { product: 'Souris Logitech', quantityOrdered: 100, quantityReceived: 100, quantityAccepted: 95, quantityRejected: 5 }
      ]
    }
  ])

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuotationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSupplierStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Achats
          </h1>
          <p className="text-muted-foreground">
            Gestion des fournisseurs, commandes d'achat et réceptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchasing/suppliers/create')}>
            <span className="mr-2">🏢</span>
            Nouveau Fournisseur
          </Button>
          <Button variant="outline">
            <span className="mr-2">📋</span>
            Demande de Devis
          </Button>
          <Button onClick={() => navigate('/purchasing/orders/create')}>
            <span className="mr-2">➕</span>
            Bon de Commande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Fournisseurs Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">500,000 MAD</div>
            <p className="text-sm text-muted-foreground">Achats du Mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Commandes en Cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">132,000 MAD</div>
            <p className="text-sm text-muted-foreground">Dettes Fournisseurs</p>
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
          variant={activeTab === 'suppliers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('suppliers')}
        >
          Fournisseurs
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('orders')}
        >
          Commandes
        </Button>
        <Button
          variant={activeTab === 'quotations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('quotations')}
        >
          Devis Fournisseurs
        </Button>
        <Button
          variant={activeTab === 'receipts' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('receipts')}
        >
          Réceptions
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>Dernières commandes d'achat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchaseOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">📦</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.number}</p>
                        <p className="text-xs text-muted-foreground">{order.supplier}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{order.totalTTC.toLocaleString()} MAD</div>
                      <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {order.status === 'draft' ? 'Brouillon' : 
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'received' ? 'Reçue' : 'Annulée'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Suppliers */}
          <Card>
            <CardHeader>
              <CardTitle>Principaux Fournisseurs</CardTitle>
              <CardDescription>Fournisseurs par volume d'achat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">🏭</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{supplier.currentBalance.toLocaleString()} MAD</div>
                      <p className="text-xs text-muted-foreground">Solde dû</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle>Fournisseurs</CardTitle>
            <CardDescription>Gestion de la base fournisseurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏭</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {supplier.code} | ICE: {supplier.ice}</p>
                      <p className="text-sm text-muted-foreground">{supplier.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          Paiement: {supplier.paymentTerms}
                        </Badge>
                        <Badge variant={getSupplierStatusColor(supplier.status)}>
                          {supplier.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{supplier.currentBalance.toLocaleString()} MAD</div>
                    <p className="text-sm text-muted-foreground">Solde dû</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/purchases/suppliers/detail/${supplier.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/purchases/suppliers/edit/${supplier.id}`)}>
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

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Commandes d'Achat</CardTitle>
            <CardDescription>Gestion des bons de commande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📦</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.number}</h3>
                      <p className="text-sm text-muted-foreground">Fournisseur: {order.supplier}</p>
                      <p className="text-sm text-muted-foreground">Date: {order.date} | Livraison: {order.deliveryDate}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status === 'draft' ? 'Brouillon' :
                           order.status === 'confirmed' ? 'Confirmée' :
                           order.status === 'received' ? 'Reçue' : 'Annulée'}
                        </Badge>
                        <Badge variant="outline">
                          {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{order.totalTTC.toLocaleString()} MAD</div>
                    <p className="text-sm text-muted-foreground">HT: {order.totalHT.toLocaleString()} MAD</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/purchases/orders/detail/${order.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/purchases/orders/edit/${order.id}`)}>
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

      {activeTab === 'quotations' && (
        <Card>
          <CardHeader>
            <CardTitle>Devis Fournisseurs</CardTitle>
            <CardDescription>Demandes de devis et réponses fournisseurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierQuotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{quotation.number}</h3>
                      <p className="text-sm text-muted-foreground">Fournisseur: {quotation.supplier}</p>
                      <p className="text-sm text-muted-foreground">Date: {quotation.date} | Valide jusqu'au: {quotation.validUntil}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getQuotationStatusColor(quotation.status)}>
                          {quotation.status === 'pending' ? 'En attente' :
                           quotation.status === 'received' ? 'Reçu' :
                           quotation.status === 'accepted' ? 'Accepté' :
                           quotation.status === 'rejected' ? 'Refusé' : 'Expiré'}
                        </Badge>
                        <Badge variant="outline">
                          {quotation.items.length} article{quotation.items.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{quotation.totalTTC.toLocaleString()} MAD</div>
                    <p className="text-sm text-muted-foreground">HT: {quotation.totalHT.toLocaleString()} MAD</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Comparer</Button>
                      <Button variant="outline" size="sm">Accepter</Button>
                      <Button variant="outline" size="sm">Commander</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'receipts' && (
        <Card>
          <CardHeader>
            <CardTitle>Réceptions de Marchandises</CardTitle>
            <CardDescription>Gestion des réceptions et contrôles qualité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goodsReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📥</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{receipt.number}</h3>
                      <p className="text-sm text-muted-foreground">Commande: {receipt.purchaseOrder}</p>
                      <p className="text-sm text-muted-foreground">Fournisseur: {receipt.supplier}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="success">
                          {receipt.status === 'completed' ? 'Terminée' : 'En cours'}
                        </Badge>
                        <Badge variant="outline">
                          {receipt.items.length} article{receipt.items.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{receipt.date}</div>
                    <p className="text-sm text-muted-foreground">Date de réception</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">Détails</Button>
                      <Button variant="outline" size="sm">Imprimer</Button>
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
          <CardTitle>Nouvelle Commande d'Achat</CardTitle>
          <CardDescription>Créer rapidement un bon de commande</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fournisseur</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Sélectionner un fournisseur...</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date de Commande</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                defaultValue="2025-01-18"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de Livraison Souhaitée</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                defaultValue="2025-01-25"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Acheteur</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Ahmed Admin</option>
                <option>Fatima Purchasing</option>
                <option>Mohamed Manager</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Articles à Commander</h4>
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Produit</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Ordinateur Portable HP</option>
                    <option>Imprimante Canon</option>
                    <option>Souris Logitech</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantité</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prix Unitaire (MAD)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer la Commande</Button>
            <Button variant="outline">Enregistrer comme Brouillon</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
