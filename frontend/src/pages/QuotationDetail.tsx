import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DuplicateModal, PrintModal, ActionModal } from '@/components/ActionModal'
import { useToast } from '@/components/Toast'

export function QuotationDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showSuccess } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [convertToOrderModalOpen, setConvertToOrderModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)

  const [quotation, setQuotation] = useState({
    id: '',
    quotationNumber: '',
    customerId: '',
    customerName: '',
    customerCode: '',
    quotationDate: '',
    validUntil: '',
    status: '',
    salesPerson: '',
    currency: 'MAD',
    notes: '',
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

  // Load quotation data on component mount
  useEffect(() => {
    const loadQuotation = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load quotation data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the quotation
        const mockQuotation = {
          id: id || '1',
          quotationNumber: 'QUO-2025-001',
          customerId: '1',
          customerName: 'Société Générale Maroc',
          customerCode: 'CUST-001',
          quotationDate: '2025-01-18',
          validUntil: '2025-02-17',
          status: 'sent',
          salesPerson: 'Ahmed Admin',
          currency: 'MAD',
          notes: 'Devis pour équipement informatique. Offre valable 30 jours. Livraison incluse.',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              description: 'HP EliteBook 840 G8, Intel Core i7, 16GB RAM, 512GB SSD',
              quantity: 15,
              unitPrice: 8500,
              discount: 8,
              tvaRate: 20,
              total: 140400
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              description: 'Canon PIXMA G3420, Multifonction, WiFi',
              quantity: 8,
              unitPrice: 2500,
              discount: 5,
              tvaRate: 20,
              total: 22800
            }
          ],
          subtotal: 147500,
          totalDiscount: 11800,
          totalTVA: 27140,
          totalAmount: 162840,
          createdAt: '2025-01-18T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setQuotation(mockQuotation)
      } catch (err) {
        setError('Erreur lors du chargement du devis')
      } finally {
        setLoading(false)
      }
    }

    loadQuotation()
  }, [id])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyé'
      case 'accepted': return 'Accepté'
      case 'rejected': return 'Refusé'
      case 'expired': return 'Expiré'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = () => {
    if (!quotation.validUntil) return false
    return new Date(quotation.validUntil) < new Date()
  }

  const getDaysUntilExpiry = () => {
    if (!quotation.validUntil) return null
    const today = new Date()
    const expiryDate = new Date(quotation.validUntil)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du devis...
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

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {quotation.quotationNumber}
          </h1>
          <p className="text-muted-foreground">
            Devis • {quotation.customerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Retour aux Ventes
          </Button>
          <Button onClick={() => navigate(`/sales/quotations/edit/${quotation.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du Devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° de Devis</label>
                  <p className="text-sm font-mono">{quotation.quotationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{quotation.customerName} ({quotation.customerCode})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commercial</label>
                  <p className="text-sm">{quotation.salesPerson}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de Devis</label>
                  <p className="text-sm">{new Date(quotation.quotationDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valide jusqu'au</label>
                  <p className="text-sm">{new Date(quotation.validUntil).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Devise</label>
                  <p className="text-sm">{quotation.currency}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(quotation.status)}>
                  {getStatusLabel(quotation.status)}
                </Badge>
                {isExpired() && (
                  <Badge className="bg-red-100 text-red-800">
                    Expiré
                  </Badge>
                )}
                <Badge variant="outline">
                  {quotation.items.length} article{quotation.items.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articles du Devis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item, index) => (
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
          {quotation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quotation Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé du Devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total HT</span>
                  <span className="text-sm font-medium">{quotation.subtotal.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remise totale</span>
                  <span className="text-sm text-red-600">-{quotation.totalDiscount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">TVA totale</span>
                  <span className="text-sm font-medium">{quotation.totalTVA.toLocaleString()} MAD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span className="text-green-600">{quotation.totalAmount.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du Devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(quotation.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(quotation.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Articles</span>
                  <span className="text-sm font-medium">{quotation.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantité totale</span>
                  <span className="text-sm font-medium">
                    {quotation.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Commercial</span>
                  <span className="text-sm font-medium">{quotation.salesPerson}</span>
                </div>
              </div>
              {quotation.validUntil && (
                <div className="border-t pt-2">
                  <div className="text-center">
                    {isExpired() ? (
                      <div className="text-red-600">
                        <p className="text-sm font-medium">Devis expiré</p>
                        <p className="text-xs">
                          Expiré le {new Date(quotation.validUntil).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ) : (
                      <div className="text-orange-600">
                        <p className="text-sm font-medium">
                          {getDaysUntilExpiry()} jour{getDaysUntilExpiry() !== 1 ? 's' : ''} restant{getDaysUntilExpiry() !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs">
                          Expire le {new Date(quotation.validUntil).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => setConvertToOrderModalOpen(true)}>
                📋 Convertir en Commande
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setDuplicateModalOpen(true)}>
                📄 Dupliquer Devis
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setPrintModalOpen(true)}>
                🖨️ Imprimer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setEmailModalOpen(true)}>
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
                <span className="text-sm text-muted-foreground">Créé le</span>
                <span className="text-sm">{new Date(quotation.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <span className="text-sm">{new Date(quotation.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="text-sm">{quotation.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Modals */}
    <ActionModal
      isOpen={convertToOrderModalOpen}
      onClose={() => setConvertToOrderModalOpen(false)}
      title="Convertir en Commande"
      description={`Devis ${quotation.quotationNumber}`}
      onConfirm={() => {
        showSuccess('Conversion réussie', 'Devis converti en commande avec succès!')
        setConvertToOrderModalOpen(false)
        // TODO: Convert to order
      }}
      confirmText="Convertir"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action va créer une nouvelle commande de vente basée sur ce devis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Numéro de Commande</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="SO-2025-XXX (auto-généré)"
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date de Commande</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-md"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">Conserver les prix et remises du devis</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">Marquer le devis comme accepté</span>
          </label>
        </div>
      </div>
    </ActionModal>

    <ActionModal
      isOpen={emailModalOpen}
      onClose={() => setEmailModalOpen(false)}
      title="Envoyer par Email"
      description={`Devis ${quotation.quotationNumber}`}
      onConfirm={() => {
        showSuccess('Email envoyé', 'Devis envoyé par email avec succès!')
        setEmailModalOpen(false)
        // TODO: Send email
      }}
      confirmText="Envoyer"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Destinataire</label>
          <input
            type="email"
            className="w-full mt-1 p-2 border rounded-md"
            defaultValue="contact@societe-generale.ma"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Objet</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md"
            defaultValue={`Devis ${quotation.quotationNumber} - ${quotation.customerName}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md"
            rows={4}
            defaultValue={`Bonjour,

Veuillez trouver ci-joint notre devis ${quotation.quotationNumber}.

Cordialement,
L'équipe commerciale`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Format</label>
            <select className="w-full mt-1 p-2 border rounded-md">
              <option>PDF</option>
              <option>Excel</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2 mt-6">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Copie à moi-même</span>
            </label>
          </div>
        </div>
      </div>
    </ActionModal>

    <DuplicateModal
      isOpen={duplicateModalOpen}
      onClose={() => setDuplicateModalOpen(false)}
      itemType="Devis"
      itemNumber={quotation.quotationNumber}
      onDuplicate={(options) => {
        console.log('Duplicate options:', options)
        // TODO: Create duplicate quotation
      }}
    />

    <PrintModal
      isOpen={printModalOpen}
      onClose={() => setPrintModalOpen(false)}
      itemType="Devis"
      itemNumber={quotation.quotationNumber}
      onPrint={(options) => {
        console.log('Print options:', options)
        // TODO: Generate and print document
      }}
    />
  </>
  )
}
