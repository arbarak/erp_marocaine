import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Sales() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for customers
  const [customers] = useState([
    {
      id: 1,
      code: 'CUST-001',
      name: 'Société Générale Maroc',
      ice: '001234567890123',
      email: 'contact@sgmaroc.ma',
      phone: '+212 522 123 456',
      address: '55 Boulevard Zerktouni, Casablanca',
      city: 'Casablanca',
      creditLimit: 500000,
      currentBalance: 125000,
      status: 'active',
      lastOrder: '2025-01-15'
    },
    {
      id: 2,
      code: 'CUST-002',
      name: 'TechnoSoft Solutions',
      ice: '002345678901234',
      email: 'info@technosoft.ma',
      phone: '+212 537 654 321',
      address: '12 Avenue Hassan II, Rabat',
      city: 'Rabat',
      creditLimit: 200000,
      currentBalance: 45000,
      status: 'active',
      lastOrder: '2025-01-12'
    },
    {
      id: 3,
      code: 'CUST-003',
      name: 'Atlas Trading',
      ice: '003456789012345',
      email: 'orders@atlas-trading.ma',
      phone: '+212 524 987 654',
      address: '78 Route de Fès, Meknès',
      city: 'Meknès',
      creditLimit: 100000,
      currentBalance: 15000,
      status: 'active',
      lastOrder: '2025-01-10'
    }
  ])

  // Mock data for sales orders
  const [salesOrders] = useState([
    {
      id: 1,
      number: 'SO-2025-001',
      customer: 'Société Générale Maroc',
      customerCode: 'CUST-001',
      date: '2025-01-18',
      deliveryDate: '2025-01-25',
      status: 'confirmed',
      totalHT: 85000,
      totalTTC: 102000,
      items: [
        { product: 'Ordinateur Portable HP', quantity: 10, unitPrice: 8500 }
      ],
      salesperson: 'Ahmed Admin'
    },
    {
      id: 2,
      number: 'SO-2025-002',
      customer: 'TechnoSoft Solutions',
      customerCode: 'CUST-002',
      date: '2025-01-17',
      deliveryDate: '2025-01-24',
      status: 'draft',
      totalHT: 24000,
      totalTTC: 28800,
      items: [
        { product: 'Imprimante Canon', quantity: 20, unitPrice: 1200 }
      ],
      salesperson: 'Ahmed Admin'
    },
    {
      id: 3,
      number: 'SO-2025-003',
      customer: 'Atlas Trading',
      customerCode: 'CUST-003',
      date: '2025-01-16',
      deliveryDate: '2025-01-23',
      status: 'delivered',
      totalHT: 7500,
      totalTTC: 9000,
      items: [
        { product: 'Souris Logitech', quantity: 50, unitPrice: 150 }
      ],
      salesperson: 'Ahmed Admin'
    }
  ])

  // Mock data for quotations
  const [quotations] = useState([
    {
      id: 1,
      number: 'QUO-2025-001',
      customer: 'Société Générale Maroc',
      date: '2025-01-18',
      validUntil: '2025-02-18',
      status: 'sent',
      totalHT: 170000,
      totalTTC: 204000,
      items: [
        { product: 'Ordinateur Portable HP', quantity: 20, unitPrice: 8500 }
      ]
    },
    {
      id: 2,
      number: 'QUO-2025-002',
      customer: 'TechnoSoft Solutions',
      date: '2025-01-17',
      validUntil: '2025-02-17',
      status: 'accepted',
      totalHT: 36000,
      totalTTC: 43200,
      items: [
        { product: 'Imprimante Canon', quantity: 30, unitPrice: 1200 }
      ]
    }
  ])

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuotationStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCustomerStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Ventes
          </h1>
          <p className="text-muted-foreground">
            Gestion des clients, devis, commandes et livraisons
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales/customers/create')}>
            <span className="mr-2">👤</span>
            Nouveau Client
          </Button>
          <Button variant="outline" onClick={() => navigate('/sales/quotations/create')}>
            <span className="mr-2">📋</span>
            Nouveau Devis
          </Button>
          <Button onClick={() => navigate('/sales/orders/create')}>
            <span className="mr-2">➕</span>
            Nouvelle Commande
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Clients Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">116,500 MAD</div>
            <p className="text-sm text-muted-foreground">CA du Mois</p>
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
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Devis en Attente</p>
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
          variant={activeTab === 'customers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('customers')}
        >
          Clients
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
          Devis
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>Dernières commandes clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">🛒</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.number}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{order.totalTTC.toLocaleString()} MAD</div>
                      <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {order.status === 'draft' ? 'Brouillon' : 
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Meilleurs Clients</CardTitle>
              <CardDescription>Clients par chiffre d'affaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">🏢</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{customer.currentBalance.toLocaleString()} MAD</div>
                      <p className="text-xs text-muted-foreground">Solde actuel</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'customers' && (
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Gestion de la base clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {customer.code} | ICE: {customer.ice}</p>
                      <p className="text-sm text-muted-foreground">{customer.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          Crédit: {customer.creditLimit.toLocaleString()} MAD
                        </Badge>
                        <Badge variant={getCustomerStatusColor(customer.status)}>
                          {customer.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{customer.currentBalance.toLocaleString()} MAD</div>
                    <p className="text-sm text-muted-foreground">Solde: {customer.currentBalance.toLocaleString()} MAD</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/customers/detail/${customer.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/customers/edit/${customer.id}`)}>
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
            <CardTitle>Commandes de Vente</CardTitle>
            <CardDescription>Gestion des commandes clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🛒</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.number}</h3>
                      <p className="text-sm text-muted-foreground">Client: {order.customer}</p>
                      <p className="text-sm text-muted-foreground">Date: {order.date} | Livraison: {order.deliveryDate}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status === 'draft' ? 'Brouillon' :
                           order.status === 'confirmed' ? 'Confirmée' :
                           order.status === 'delivered' ? 'Livrée' : 'Annulée'}
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/orders/detail/${order.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/orders/edit/${order.id}`)}>
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
            <CardTitle>Devis</CardTitle>
            <CardDescription>Gestion des devis clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{quotation.number}</h3>
                      <p className="text-sm text-muted-foreground">Client: {quotation.customer}</p>
                      <p className="text-sm text-muted-foreground">Date: {quotation.date} | Valide jusqu'au: {quotation.validUntil}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getQuotationStatusColor(quotation.status)}>
                          {quotation.status === 'draft' ? 'Brouillon' :
                           quotation.status === 'sent' ? 'Envoyé' :
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/quotations/detail/${quotation.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/sales/quotations/edit/${quotation.id}`)}>
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

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Commande</CardTitle>
          <CardDescription>Créer rapidement une commande client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Client</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Sélectionner un client...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.code})
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
              <label className="text-sm font-medium">Date de Livraison</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                defaultValue="2025-01-25"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Commercial</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Ahmed Admin</option>
                <option>Fatima Sales</option>
                <option>Mohamed Manager</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Articles</h4>
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
