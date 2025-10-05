import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal, DuplicateModal, PrintModal } from '@/components/ActionModal'
import { useToast } from '@/components/Toast'

export function InvoiceDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showSuccess } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  const [invoice, setInvoice] = useState({
    id: '',
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    customerCode: '',
    invoiceDate: '',
    dueDate: '',
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    currency: 'MAD',
    notes: '',
    billingAddress: {
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
    paidAmount: 0,
    remainingAmount: 0,
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  // Load invoice data on component mount
  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load invoice data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the invoice
        const mockInvoice = {
          id: id || '1',
          invoiceNumber: 'INV-2025-001',
          customerId: '1',
          customerName: 'Société Générale Maroc',
          customerCode: 'CUST-001',
          invoiceDate: '2025-01-18',
          dueDate: '2025-02-17',
          status: 'sent',
          paymentStatus: 'partial',
          paymentMethod: 'bank_transfer',
          currency: 'MAD',
          notes: 'Facture pour commande SO-2025-001. Paiement par virement bancaire sous 30 jours.',
          billingAddress: {
            line1: '55 Boulevard Zerktouni',
            line2: 'Tour Attijariwafa Bank, 15ème étage',
            city: 'Casablanca',
            postalCode: '20000',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              description: 'HP EliteBook 840 G8, Intel Core i7, 16GB RAM, 512GB SSD',
              quantity: 10,
              unitPrice: 8500,
              discount: 5,
              tvaRate: 20,
              total: 80750
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              description: 'Canon PIXMA G3420, Multifonction, WiFi',
              quantity: 5,
              unitPrice: 2500,
              discount: 0,
              tvaRate: 20,
              total: 12500
            }
          ],
          subtotal: 93250,
          totalDiscount: 4250,
          totalTVA: 17800,
          totalAmount: 106800,
          paidAmount: 50000,
          remainingAmount: 56800,
          createdAt: '2025-01-18T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setInvoice(mockInvoice)
      } catch (err) {
        setError('Erreur lors du chargement de la facture')
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [id])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyée'
      case 'paid': return 'Payée'
      case 'overdue': return 'En retard'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'partial': return 'Partiel'
      case 'paid': return 'Payé'
      case 'overdue': return 'En retard'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-orange-100 text-orange-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces'
      case 'bank_transfer': return 'Virement bancaire'
      case 'check': return 'Chèque'
      case 'credit_card': return 'Carte de crédit'
      case 'other': return 'Autre'
      default: return method
    }
  }

  const getPaymentProgress = () => {
    if (invoice.totalAmount === 0) return 0
    return (invoice.paidAmount / invoice.totalAmount) * 100
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement de la facture...
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
              <Button onClick={() => navigate('/invoicing')}>
                Retour à la Facturation
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
            {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">
            Facture • {invoice.customerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/invoicing')}>
            Retour à la Facturation
          </Button>
          <Button onClick={() => navigate(`/invoicing/edit/${invoice.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de Facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° de Facture</label>
                  <p className="text-sm font-mono">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{invoice.customerName} ({invoice.customerCode})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de Facture</label>
                  <p className="text-sm">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date d'Échéance</label>
                  <p className="text-sm">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Méthode de Paiement</label>
                  <p className="text-sm">{getPaymentMethodLabel(invoice.paymentMethod)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Devise</label>
                  <p className="text-sm">{invoice.currency}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
                <Badge className={getPaymentStatusColor(invoice.paymentStatus)}>
                  {getPaymentStatusLabel(invoice.paymentStatus)}
                </Badge>
                <Badge variant="outline">
                  {invoice.items.length} article{invoice.items.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles de la Facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
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
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé Financier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total HT</span>
                  <span className="text-sm font-medium">{invoice.subtotal.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise totale</span>
                  <span className="text-sm text-red-600">-{invoice.totalDiscount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">TVA totale</span>
                  <span className="text-sm font-medium">{invoice.totalTVA.toLocaleString()} MAD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-green-600">{invoice.totalAmount.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getPaymentStatusColor(invoice.paymentStatus)} text-lg px-4 py-2`}>
                  {getPaymentStatusLabel(invoice.paymentStatus)}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant payé</span>
                  <span className="text-sm font-medium text-green-600">{invoice.paidAmount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant restant</span>
                  <span className="text-sm font-medium text-orange-600">{invoice.remainingAmount.toLocaleString()} MAD</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${getPaymentProgress()}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {getPaymentProgress().toFixed(1)}% payé
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la Facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(invoice.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Articles</span>
                  <span className="text-sm font-medium">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantité totale</span>
                  <span className="text-sm font-medium">
                    {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Méthode de paiement</span>
                  <span className="text-sm font-medium">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
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
              <Button className="w-full" onClick={() => setPaymentModalOpen(true)}>
                💰 Enregistrer Paiement
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setDuplicateModalOpen(true)}>
                📋 Dupliquer Facture
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setPrintModalOpen(true)}>
                🖨️ Imprimer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => {
                showSuccess('Email envoyé', 'Facture envoyée par email avec succès')
              }}>
                📧 Envoyer par Email
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
                <span className="text-sm">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifiée le</span>
                <span className="text-sm">{new Date(invoice.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créée par</span>
                <span className="text-sm">{invoice.createdBy}</span>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse de Facturation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{invoice.billingAddress.line1}</p>
                {invoice.billingAddress.line2 && (
                  <p className="text-sm">{invoice.billingAddress.line2}</p>
                )}
                <p className="text-sm">
                  {invoice.billingAddress.postalCode} {invoice.billingAddress.city}
                </p>
                <p className="text-sm">{invoice.billingAddress.region}</p>
                <p className="text-sm font-medium">{invoice.billingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Modals */}
    <PaymentModal
      isOpen={paymentModalOpen}
      onClose={() => setPaymentModalOpen(false)}
      invoiceNumber={invoice.number}
      remainingAmount={invoice.totalAmount - invoice.paidAmount}
      onPaymentRecord={(payment) => {
        console.log('Payment recorded:', payment)
        // TODO: Update invoice payment status
      }}
    />

    <DuplicateModal
      isOpen={duplicateModalOpen}
      onClose={() => setDuplicateModalOpen(false)}
      itemType="Facture"
      itemNumber={invoice.number}
      onDuplicate={(options) => {
        console.log('Duplicate options:', options)
        // TODO: Create duplicate invoice
      }}
    />

    <PrintModal
      isOpen={printModalOpen}
      onClose={() => setPrintModalOpen(false)}
      itemType="Facture"
      itemNumber={invoice.number}
      onPrint={(options) => {
        console.log('Print options:', options)
        // TODO: Generate and print document
      }}
    />
  </>
  )
}
