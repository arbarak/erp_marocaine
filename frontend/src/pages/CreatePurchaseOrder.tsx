import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

interface PurchaseOrderLine {
  id: string
  product: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

export function CreatePurchaseOrder() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Purchase Order Information
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    
    // Supplier Information
    supplierId: '',
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierICE: '',
    
    // Delivery Information
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    deliveryCountry: 'Maroc',
    
    // Commercial Terms
    paymentTerms: '30',
    currency: 'MAD',
    priority: 'normal',
    
    // Additional Information
    reference: '',
    notes: '',
    internalNotes: '',
    status: 'draft',
    
    // Totals (calculated)
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    total: 0,
    totalTTC: 0
  })

  const [orderLines, setOrderLines] = useState<PurchaseOrderLine[]>([
    {
      id: '1',
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Mock data
  const suppliers = [
    { id: '1', name: 'TechnoMaroc SARL', email: 'contact@technomaroc.ma', phone: '+212 5XX-XXXXXX', ice: '001234567890123' },
    { id: '2', name: 'Fournitures Pro', email: 'info@fournitures.ma', phone: '+212 6XX-XXXXXX', ice: '001234567890124' },
    { id: '3', name: 'Hassan Alami', email: 'hassan@example.com', phone: '+212 6XX-XXXXXX', ice: '' }
  ]

  const products = [
    { id: '1', name: 'Ordinateur Portable HP', price: 7500, description: 'HP Pavilion 15"', taxRate: 20 },
    { id: '2', name: 'Imprimante Canon', price: 1000, description: 'Canon PIXMA', taxRate: 20 },
    { id: '3', name: 'Papier A4', price: 45, description: 'Ramette 500 feuilles', taxRate: 20 },
    { id: '4', name: 'Cartouche Encre', price: 120, description: 'Cartouche HP noire', taxRate: 20 }
  ]

  const paymentTermsOptions = [
    { value: '0', label: 'Comptant' },
    { value: '15', label: '15 jours' },
    { value: '30', label: '30 jours' },
    { value: '45', label: '45 jours' },
    { value: '60', label: '60 jours' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Basse' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Haute' },
    { value: 'urgent', label: 'Urgente' }
  ]

  const taxRates = [
    { value: 0, label: '0% (Exonéré)' },
    { value: 7, label: '7%' },
    { value: 10, label: '10%' },
    { value: 14, label: '14%' },
    { value: 20, label: '20% (Standard)' }
  ]

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId,
        supplierName: supplier.name,
        supplierEmail: supplier.email,
        supplierPhone: supplier.phone,
        supplierICE: supplier.ice
      }))
    }
  }

  const handleLineChange = (lineId: string, field: keyof PurchaseOrderLine, value: string | number) => {
    setOrderLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value }
        
        // Recalculate total for this line
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'taxRate') {
          const subtotal = updatedLine.quantity * updatedLine.unitPrice
          const discountAmount = subtotal * (updatedLine.discount / 100)
          const taxableAmount = subtotal - discountAmount
          const taxAmount = taxableAmount * (updatedLine.taxRate / 100)
          updatedLine.total = taxableAmount + taxAmount
        }
        
        return updatedLine
      }
      return line
    }))
    
    // Recalculate order totals
    calculateTotals()
  }

  const handleProductChange = (lineId: string, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      handleLineChange(lineId, 'product', productId)
      handleLineChange(lineId, 'description', product.description)
      handleLineChange(lineId, 'unitPrice', product.price)
      handleLineChange(lineId, 'taxRate', product.taxRate)
    }
  }

  const addOrderLine = () => {
    const newLine: PurchaseOrderLine = {
      id: Date.now().toString(),
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0
    }
    setOrderLines(prev => [...prev, newLine])
  }

  const removeOrderLine = (lineId: string) => {
    if (orderLines.length > 1) {
      setOrderLines(prev => prev.filter(line => line.id !== lineId))
      calculateTotals()
    }
  }

  const calculateTotals = () => {
    const subtotal = orderLines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice)
    }, 0)
    
    const totalDiscount = orderLines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice * line.discount / 100)
    }, 0)
    
    const totalTax = orderLines.reduce((sum, line) => {
      const lineSubtotal = line.quantity * line.unitPrice
      const lineDiscount = lineSubtotal * (line.discount / 100)
      const taxableAmount = lineSubtotal - lineDiscount
      return sum + (taxableAmount * line.taxRate / 100)
    }, 0)
    
    const total = subtotal - totalDiscount
    const totalTTC = total + totalTax
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalDiscount,
      totalTax,
      total,
      totalTTC
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierId) {
      newErrors.supplierId = 'Le fournisseur est obligatoire'
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'La date de commande est obligatoire'
    }

    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'La date de livraison prévue est obligatoire'
    }

    if (orderLines.length === 0 || orderLines.every(line => !line.product)) {
      newErrors.orderLines = 'Au moins une ligne de commande est obligatoire'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Bon de commande créé avec succès!'
      })
      
      // Redirect to purchasing after 2 seconds
      setTimeout(() => {
        navigate('/purchasing')
      }, 2000)
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la création du bon de commande'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/purchasing')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Bon de Commande
          </h1>
          <p className="text-muted-foreground">
            Créer un nouveau bon de commande d'achat
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer la Commande'}
          </Button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${notification.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
          <CardContent className="pt-4">
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purchase Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Commande</CardTitle>
            <CardDescription>
              Détails généraux du bon de commande
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  N° de Commande
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date de Commande *
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.orderDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.orderDate && <p className="text-red-500 text-sm mt-1">{errors.orderDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Livraison Prévue *
                </label>
                <input
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.expectedDelivery ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.expectedDelivery && <p className="text-red-500 text-sm mt-1">{errors.expectedDelivery}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Fournisseur</CardTitle>
            <CardDescription>
              Sélection et informations du fournisseur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sélectionner un Fournisseur *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.supplierId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Choisir un fournisseur</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>}
            </div>

            {formData.supplierId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-gray-600">{formData.supplierEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Téléphone:</p>
                  <p className="text-sm text-gray-600">{formData.supplierPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ICE:</p>
                  <p className="text-sm text-gray-600">{formData.supplierICE || 'Non renseigné'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de Livraison</CardTitle>
            <CardDescription>
              Lieu de livraison des produits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Adresse de livraison"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.deliveryCity}
                  onChange={(e) => handleInputChange('deliveryCity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ville"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={formData.deliveryPostalCode}
                  onChange={(e) => handleInputChange('deliveryPostalCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Code postal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.deliveryCountry}
                  onChange={(e) => handleInputChange('deliveryCountry', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Order Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Lignes de Commande</CardTitle>
            <CardDescription>
              Produits et services à commander
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.orderLines && (
              <p className="text-red-500 text-sm">{errors.orderLines}</p>
            )}

            <div className="space-y-4">
              {orderLines.map((line, index) => (
                <div key={line.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Ligne {index + 1}</h4>
                    {orderLines.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOrderLine(line.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Produit/Service
                      </label>
                      <select
                        value={line.product}
                        onChange={(e) => handleProductChange(line.id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">Sélectionner un produit</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Prix Unitaire HT
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        TVA (%)
                      </label>
                      <select
                        value={line.taxRate}
                        onChange={(e) => handleLineChange(line.id, 'taxRate', parseFloat(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        {taxRates.map(rate => (
                          <option key={rate.value} value={rate.value}>{rate.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Total TTC
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-right font-medium">
                        {line.total.toLocaleString()} MAD
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Description du produit/service"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Remise (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={line.discount}
                        onChange={(e) => handleLineChange(line.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addOrderLine}
              className="w-full"
            >
              + Ajouter une ligne
            </Button>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de la Commande</CardTitle>
            <CardDescription>
              Totaux et conditions commerciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span>{formData.subtotal.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Remise totale:</span>
                  <span>-{formData.totalDiscount.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Total HT:</span>
                  <span className="font-medium">{formData.total.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA:</span>
                  <span>{formData.totalTax.toLocaleString()} MAD</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC:</span>
                  <span>{formData.totalTTC.toLocaleString()} MAD</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Conditions de Paiement
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {paymentTermsOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Référence Fournisseur
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Référence du fournisseur"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes et Instructions</CardTitle>
            <CardDescription>
              Informations complémentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Instructions pour le fournisseur
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Instructions qui apparaîtront sur le bon de commande..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes internes
              </label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Notes internes (non visibles par le fournisseur)..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button type="button" variant="outline">
                Enregistrer comme Brouillon
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours...' : 'Créer la Commande'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
