import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CustomerDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [customer, setCustomer] = useState({
    id: '',
    name: '',
    companyName: '',
    customerType: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    ice: '',
    rc: '',
    patente: '',
    cnss: '',
    vatNumber: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      region: '',
      country: 'Maroc'
    },
    customerCategory: '',
    paymentTerms: 30,
    creditLimit: 0,
    discount: 0,
    currency: 'MAD',
    contactPerson: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    },
    isActive: true,
    isVip: false,
    allowCredit: true,
    industry: '',
    notes: '',
    tags: [] as string[],
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    totalOrders: 0,
    totalAmount: 0,
    lastOrderDate: '',
    outstandingBalance: 0
  })

  const [recentOrders, setRecentOrders] = useState([
    {
      id: '1',
      orderNumber: 'CMD-2025-012',
      date: '2025-01-18',
      amount: 15750,
      status: 'delivered',
      items: 3
    },
    {
      id: '2',
      orderNumber: 'CMD-2025-008',
      date: '2025-01-15',
      amount: 8500,
      status: 'pending',
      items: 1
    },
    {
      id: '3',
      orderNumber: 'CMD-2025-003',
      date: '2025-01-10',
      amount: 22300,
      status: 'delivered',
      items: 5
    }
  ])

  const [recentInvoices, setRecentInvoices] = useState([
    {
      id: '1',
      invoiceNumber: 'FAC-2025-089',
      date: '2025-01-18',
      amount: 15750,
      status: 'paid',
      dueDate: '2025-02-17'
    },
    {
      id: '2',
      invoiceNumber: 'FAC-2025-078',
      date: '2025-01-15',
      amount: 8500,
      status: 'overdue',
      dueDate: '2025-02-14'
    },
    {
      id: '3',
      invoiceNumber: 'FAC-2025-065',
      date: '2025-01-10',
      amount: 22300,
      status: 'paid',
      dueDate: '2025-02-09'
    }
  ])

  // Load customer data on component mount
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load customer data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the customer
        const mockCustomer = {
          id: id || '1',
          name: 'Société ABC SARL',
          companyName: 'Société ABC SARL',
          customerType: 'company',
          email: 'contact@societeabc.ma',
          phone: '+212 522 123 456',
          mobile: '+212 661 234 567',
          website: 'https://societeabc.ma',
          ice: '001234567890123',
          rc: 'RC-CAS-2020-001',
          patente: 'PAT-2020-001',
          cnss: 'CNSS-123456',
          vatNumber: 'MA001234567890123',
          address: {
            line1: '123 Zone Industrielle Ain Sebaa',
            line2: 'Immeuble Al Manar, 3ème étage',
            city: 'Casablanca',
            postalCode: '20250',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          customerCategory: 'premium',
          paymentTerms: 30,
          creditLimit: 100000,
          discount: 5,
          currency: 'MAD',
          contactPerson: {
            firstName: 'Ahmed',
            lastName: 'Bennani',
            title: 'Directeur Commercial',
            email: 'ahmed.bennani@societeabc.ma',
            phone: '+212 661 234 567'
          },
          isActive: true,
          isVip: true,
          allowCredit: true,
          industry: 'Commerce/Distribution',
          notes: 'Client important avec un bon historique de paiement. Négociation possible sur les prix pour les gros volumes.',
          tags: ['VIP', 'Gros Volume', 'Paiement Rapide'],
          createdAt: '2024-03-15T10:30:00Z',
          updatedAt: '2025-01-18T14:20:00Z',
          createdBy: 'Ahmed Admin',
          totalOrders: 24,
          totalAmount: 485750,
          lastOrderDate: '2025-01-18',
          outstandingBalance: 8500
        }
        
        setCustomer(mockCustomer)
      } catch (err) {
        setError('Erreur lors du chargement du client')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [id])

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return 'Entreprise'
      case 'individual': return 'Particulier'
      case 'government': return 'Administration'
      case 'ngo': return 'ONG/Association'
      default: return type
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'standard': return 'Standard'
      case 'premium': return 'Premium'
      case 'vip': return 'VIP'
      case 'wholesale': return 'Grossiste'
      case 'retail': return 'Détaillant'
      default: return category
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'processing': return 'En cours'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyée'
      case 'paid': return 'Payée'
      case 'overdue': return 'En retard'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCreditStatus = () => {
    const usedCredit = customer.outstandingBalance
    const availableCredit = customer.creditLimit - usedCredit
    const usagePercentage = customer.creditLimit > 0 ? (usedCredit / customer.creditLimit) * 100 : 0

    if (usagePercentage >= 90) {
      return { status: 'Limite Atteinte', color: 'bg-red-100 text-red-800' }
    } else if (usagePercentage >= 70) {
      return { status: 'Attention', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'Bon', color: 'bg-green-100 text-green-800' }
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
                Chargement du client...
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
              <Button onClick={() => navigate('/sales')}>
                Retour aux Ventes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const creditStatus = getCreditStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {customer.name}
          </h1>
          <p className="text-muted-foreground">
            {getCustomerTypeLabel(customer.customerType)} • {getCategoryLabel(customer.customerCategory)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Retour aux Ventes
          </Button>
          <Button onClick={() => navigate(`/sales/customers/edit/${customer.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom/Raison Sociale</label>
                  <p className="text-sm">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getCustomerTypeLabel(customer.customerType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{customer.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                  <p className="text-sm">{customer.mobile || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Site Web</label>
                  <p className="text-sm">{customer.website || 'Non défini'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={customer.isActive ? "default" : "secondary"}>
                  {customer.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                {customer.isVip && (
                  <Badge variant="outline">⭐ Client VIP</Badge>
                )}
                <Badge variant="outline">
                  {getCategoryLabel(customer.customerCategory)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Légales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ICE</label>
                  <p className="text-sm font-mono">{customer.ice || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registre de Commerce</label>
                  <p className="text-sm">{customer.rc || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patente</label>
                  <p className="text-sm">{customer.patente || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° TVA</label>
                  <p className="text-sm font-mono">{customer.vatNumber || 'Non défini'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{customer.address.line1}</p>
                {customer.address.line2 && (
                  <p className="text-sm">{customer.address.line2}</p>
                )}
                <p className="text-sm">
                  {customer.address.postalCode} {customer.address.city}
                </p>
                <p className="text-sm">{customer.address.region}</p>
                <p className="text-sm font-medium">{customer.address.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle>Personne de Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom Complet</label>
                  <p className="text-sm">{customer.contactPerson.firstName} {customer.contactPerson.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Titre</label>
                  <p className="text-sm">{customer.contactPerson.title || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{customer.contactPerson.email || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{customer.contactPerson.phone || 'Non défini'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Commercial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé Commercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {customer.totalOrders}
                </div>
                <p className="text-sm text-muted-foreground">Commandes Total</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {customer.totalAmount.toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dernière commande</span>
                  <span className="text-sm">{new Date(customer.lastOrderDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conditions paiement</span>
                  <span className="text-sm">{customer.paymentTerms} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise</span>
                  <span className="text-sm">{customer.discount}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Crédit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={creditStatus.color}>
                  {creditStatus.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Limite de crédit</span>
                  <span className="text-sm font-medium">{customer.creditLimit.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Solde impayé</span>
                  <span className="text-sm text-red-600">{customer.outstandingBalance.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crédit disponible</span>
                  <span className="text-sm text-green-600">
                    {(customer.creditLimit - customer.outstandingBalance).toLocaleString()} MAD
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((customer.outstandingBalance / customer.creditLimit) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/sales/orders/create')}>
                📋 Nouvelle Commande
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/sales/quotations/create')}>
                📄 Nouveau Devis
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/invoicing/create')}>
                🧾 Nouvelle Facture
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
