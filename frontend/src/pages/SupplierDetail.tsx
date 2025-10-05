import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SupplierDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [supplier, setSupplier] = useState({
    id: '',
    name: '',
    companyName: '',
    supplierType: '',
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
    supplierCategory: '',
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
    bankInfo: {
      bankName: '',
      accountNumber: '',
      rib: '',
      swift: ''
    },
    isActive: true,
    isPreferred: false,
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
      orderNumber: 'PO-2025-015',
      date: '2025-01-17',
      amount: 45750,
      status: 'received',
      items: 8
    },
    {
      id: '2',
      orderNumber: 'PO-2025-012',
      date: '2025-01-14',
      amount: 28500,
      status: 'pending',
      items: 3
    },
    {
      id: '3',
      orderNumber: 'PO-2025-008',
      date: '2025-01-10',
      amount: 67200,
      status: 'received',
      items: 12
    }
  ])

  const [recentInvoices, setRecentInvoices] = useState([
    {
      id: '1',
      invoiceNumber: 'FINV-2025-089',
      date: '2025-01-17',
      amount: 45750,
      status: 'paid',
      dueDate: '2025-03-03'
    },
    {
      id: '2',
      invoiceNumber: 'FINV-2025-078',
      date: '2025-01-14',
      amount: 28500,
      status: 'pending',
      dueDate: '2025-02-28'
    },
    {
      id: '3',
      invoiceNumber: 'FINV-2025-065',
      date: '2025-01-10',
      amount: 67200,
      status: 'paid',
      dueDate: '2025-02-24'
    }
  ])

  // Load supplier data on component mount
  useEffect(() => {
    const loadSupplier = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load supplier data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the supplier
        const mockSupplier = {
          id: id || '1',
          name: 'TechnoSupply SARL',
          companyName: 'TechnoSupply SARL',
          supplierType: 'company',
          email: 'contact@technosupply.ma',
          phone: '+212 522 987 654',
          mobile: '+212 661 987 654',
          website: 'https://technosupply.ma',
          ice: '009876543210987',
          rc: 'RC-CAS-2019-005',
          patente: 'PAT-2019-005',
          cnss: 'CNSS-987654',
          vatNumber: 'MA009876543210987',
          address: {
            line1: '456 Zone Industrielle Sidi Bernoussi',
            line2: 'Entrepôt B, Bureau 12',
            city: 'Casablanca',
            postalCode: '20600',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          supplierCategory: 'premium',
          paymentTerms: 45,
          creditLimit: 250000,
          discount: 3,
          currency: 'MAD',
          contactPerson: {
            firstName: 'Youssef',
            lastName: 'Alami',
            title: 'Directeur Commercial',
            email: 'y.alami@technosupply.ma',
            phone: '+212 661 987 654'
          },
          bankInfo: {
            bankName: 'Attijariwafa Bank',
            accountNumber: '007890123456789',
            rib: '230007890123456789012345',
            swift: 'BCMAMAMC'
          },
          isActive: true,
          isPreferred: true,
          allowCredit: true,
          industry: 'Informatique/IT',
          notes: 'Fournisseur principal pour équipements informatiques. Excellent service et délais de livraison.',
          tags: ['Informatique', 'Livraison Rapide', 'Qualité Premium'],
          createdAt: '2024-02-20T09:15:00Z',
          updatedAt: '2025-01-17T16:45:00Z',
          createdBy: 'Ahmed Admin',
          totalOrders: 18,
          totalAmount: 785450,
          lastOrderDate: '2025-01-17',
          outstandingBalance: 28500
        }
        
        setSupplier(mockSupplier)
      } catch (err) {
        setError('Erreur lors du chargement du fournisseur')
      } finally {
        setLoading(false)
      }
    }

    loadSupplier()
  }, [id])

  const getSupplierTypeLabel = (type: string) => {
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
      case 'strategic': return 'Stratégique'
      case 'local': return 'Local'
      case 'international': return 'International'
      default: return category
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'received': return 'Reçue'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInvoiceStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyée'
      case 'paid': return 'Payée'
      case 'pending': return 'En attente'
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
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCreditStatus = () => {
    const usedCredit = supplier.outstandingBalance
    const availableCredit = supplier.creditLimit - usedCredit
    const usagePercentage = supplier.creditLimit > 0 ? (usedCredit / supplier.creditLimit) * 100 : 0

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
                Chargement du fournisseur...
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

  const creditStatus = getCreditStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {supplier.name}
          </h1>
          <p className="text-muted-foreground">
            {getSupplierTypeLabel(supplier.supplierType)} • {getCategoryLabel(supplier.supplierCategory)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Retour aux Achats
          </Button>
          <Button onClick={() => navigate(`/purchases/suppliers/edit/${supplier.id}`)}>
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
                  <p className="text-sm">{supplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getSupplierTypeLabel(supplier.supplierType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{supplier.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{supplier.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                  <p className="text-sm">{supplier.mobile || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Site Web</label>
                  <p className="text-sm">{supplier.website || 'Non défini'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                {supplier.isPreferred && (
                  <Badge variant="outline">⭐ Fournisseur Préféré</Badge>
                )}
                <Badge variant="outline">
                  {getCategoryLabel(supplier.supplierCategory)}
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
                  <p className="text-sm font-mono">{supplier.ice || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registre de Commerce</label>
                  <p className="text-sm">{supplier.rc || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patente</label>
                  <p className="text-sm">{supplier.patente || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° TVA</label>
                  <p className="text-sm font-mono">{supplier.vatNumber || 'Non défini'}</p>
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
                <p className="text-sm">{supplier.address.line1}</p>
                {supplier.address.line2 && (
                  <p className="text-sm">{supplier.address.line2}</p>
                )}
                <p className="text-sm">
                  {supplier.address.postalCode} {supplier.address.city}
                </p>
                <p className="text-sm">{supplier.address.region}</p>
                <p className="text-sm font-medium">{supplier.address.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Bancaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Banque</label>
                  <p className="text-sm">{supplier.bankInfo.bankName || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° de Compte</label>
                  <p className="text-sm font-mono">{supplier.bankInfo.accountNumber || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RIB</label>
                  <p className="text-sm font-mono">{supplier.bankInfo.rib || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code SWIFT</label>
                  <p className="text-sm">{supplier.bankInfo.swift || 'Non défini'}</p>
                </div>
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
                  <p className="text-sm">{supplier.contactPerson.firstName} {supplier.contactPerson.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Titre</label>
                  <p className="text-sm">{supplier.contactPerson.title || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{supplier.contactPerson.email || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{supplier.contactPerson.phone || 'Non défini'}</p>
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
                  {supplier.totalOrders}
                </div>
                <p className="text-sm text-muted-foreground">Commandes Total</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {supplier.totalAmount.toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">Volume d'Achats</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dernière commande</span>
                  <span className="text-sm">{new Date(supplier.lastOrderDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conditions paiement</span>
                  <span className="text-sm">{supplier.paymentTerms} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise</span>
                  <span className="text-sm">{supplier.discount}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Crédit Fournisseur</CardTitle>
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
                  <span className="text-sm font-medium">{supplier.creditLimit.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Solde impayé</span>
                  <span className="text-sm text-red-600">{supplier.outstandingBalance.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crédit disponible</span>
                  <span className="text-sm text-green-600">
                    {(supplier.creditLimit - supplier.outstandingBalance).toLocaleString()} MAD
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((supplier.outstandingBalance / supplier.creditLimit) * 100, 100)}%`
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
              <Button className="w-full" onClick={() => navigate('/purchases/orders/create')}>
                📋 Nouvelle Commande
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/purchases/quotations/create')}>
                📄 Demande de Devis
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/invoicing/supplier/create')}>
                🧾 Nouvelle Facture
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
