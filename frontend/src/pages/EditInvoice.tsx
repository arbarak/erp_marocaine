import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditInvoice() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    invoiceDate: '',
    dueDate: '',
    status: 'draft',
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
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
    remainingAmount: 0
  })

  // Mock data for customers
  const customers = [
    { id: '1', name: 'Société Générale Maroc', code: 'CUST-001' },
    { id: '2', name: 'TechnoSoft Solutions', code: 'CUST-002' },
    { id: '3', name: 'Atlas Trading', code: 'CUST-003' }
  ]

  // Mock data for products
  const products = [
    { id: '1', name: 'Ordinateur Portable HP', price: 8500, tvaRate: 20 },
    { id: '2', name: 'Imprimante Canon', price: 2500, tvaRate: 20 },
    { id: '3', name: 'Souris Logitech', price: 150, tvaRate: 20 }
  ]

  // Invoice statuses
  const invoiceStatuses = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'sent', label: 'Envoyée' },
    { value: 'paid', label: 'Payée' },
    { value: 'overdue', label: 'En retard' },
    { value: 'cancelled', label: 'Annulée' }
  ]

  // Payment statuses
  const paymentStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'partial', label: 'Partiel' },
    { value: 'paid', label: 'Payé' },
    { value: 'overdue', label: 'En retard' }
  ]

  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'credit_card', label: 'Carte de crédit' },
    { value: 'other', label: 'Autre' }
  ]

  // Moroccan regions
  const moroccanRegions = [
    'Tanger-Tétouan-Al Hoceïma',
    'Oriental',
    'Fès-Meknès',
    'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra',
    'Casablanca-Settat',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Souss-Massa',
    'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab'
  ]

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
          invoiceNumber: 'INV-2025-001',
          customerId: '1',
          customerName: 'Société Générale Maroc',
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
          remainingAmount: 56800
        }
        
        setFormData(mockInvoice)
      } catch (err) {
        setError('Erreur lors du chargement de la facture')
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    // Recalculate item total
    const item = updatedItems[index]
    const subtotal = item.quantity * item.unitPrice
    const discountAmount = (subtotal * item.discount) / 100
    const subtotalAfterDiscount = subtotal - discountAmount
    const tvaAmount = (subtotalAfterDiscount * item.tvaRate) / 100
    item.total = subtotalAfterDiscount + tvaAmount
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }))
    
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items: typeof formData.items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalDiscount = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0)
    const subtotalAfterDiscount = subtotal - totalDiscount
    const totalTVA = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const itemDiscount = (itemSubtotal * item.discount) / 100
      const itemSubtotalAfterDiscount = itemSubtotal - itemDiscount
      return sum + ((itemSubtotalAfterDiscount * item.tvaRate) / 100)
    }, 0)
    const totalAmount = subtotalAfterDiscount + totalTVA
    const remainingAmount = totalAmount - formData.paidAmount
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalDiscount,
      totalTVA,
      totalAmount,
      remainingAmount
    }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tvaRate: 20,
      total: 0
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }))
    calculateTotals(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call to update invoice
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/invoicing')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la facture')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.invoiceNumber) {
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

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Facture modifiée avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                La facture {formData.invoiceNumber} a été mise à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page de facturation...
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Modifier la Facture
          </h1>
          <p className="text-muted-foreground">
            Modifier la facture "{formData.invoiceNumber}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/invoicing')}>
            Annuler
          </Button>
          <Button form="invoice-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Facture</CardTitle>
            <CardDescription>
              Détails généraux de la facture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">N° de Facture</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Client *</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Méthode de Paiement</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date de Facture *</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d'Échéance</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {invoiceStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Statut de Paiement</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {paymentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Montant Payé (MAD)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de Facturation</CardTitle>
            <CardDescription>
              Adresse du client pour la facturation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse Ligne 1</label>
                <input
                  type="text"
                  name="billingAddress.line1"
                  value={formData.billingAddress.line1}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="55 Boulevard Zerktouni"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adresse Ligne 2</label>
                <input
                  type="text"
                  name="billingAddress.line2"
                  value={formData.billingAddress.line2}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Tour Attijariwafa Bank, 15ème étage"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  name="billingAddress.city"
                  value={formData.billingAddress.city}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Casablanca"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code Postal</label>
                <input
                  type="text"
                  name="billingAddress.postalCode"
                  value={formData.billingAddress.postalCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="20000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Région</label>
                <select
                  name="billingAddress.region"
                  value={formData.billingAddress.region}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner une région</option>
                  {moroccanRegions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles de la Facture</CardTitle>
            <CardDescription>
              Produits et services facturés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Article {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium">Produit</label>
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value)
                        if (product) {
                          handleItemChange(index, 'productId', product.id)
                          handleItemChange(index, 'productName', product.name)
                          handleItemChange(index, 'unitPrice', product.price)
                          handleItemChange(index, 'tvaRate', product.tvaRate)
                        }
                      }}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantité</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prix Unit. (MAD)</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Remise (%)</label>
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total (MAD)</label>
                    <input
                      type="text"
                      value={item.total.toLocaleString()}
                      className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={2}
                    placeholder="Description détaillée du produit..."
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              + Ajouter un Article
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé de la Facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total HT:</span>
                <span className="font-medium">{formData.subtotal.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between">
                <span>Remise totale:</span>
                <span className="font-medium text-red-600">-{formData.totalDiscount.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between">
                <span>TVA totale:</span>
                <span className="font-medium">{formData.totalTVA.toLocaleString()} MAD</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC:</span>
                  <span>{formData.totalAmount.toLocaleString()} MAD</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Montant payé:</span>
                  <span className="font-medium text-green-600">{formData.paidAmount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Montant restant:</span>
                  <span className="font-medium text-orange-600">{formData.remainingAmount.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Notes et conditions de paiement..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/invoicing')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
