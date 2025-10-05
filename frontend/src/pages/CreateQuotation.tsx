import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

interface QuotationLine {
  id: string
  product: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

export function CreateQuotation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Quotation Information
    quotationNumber: '',
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    
    // Customer Information
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerICE: '',
    
    // Commercial Terms
    paymentTerms: '30',
    currency: 'MAD',
    deliveryTime: '',
    
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

  const [quotationLines, setQuotationLines] = useState<QuotationLine[]>([
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
  const customers = [
    { id: '1', name: 'Ahmed Bennani', email: 'ahmed@example.com', phone: '+212 6XX-XXXXXX', ice: '001234567890123' },
    { id: '2', name: 'Société ABC SARL', email: 'contact@abc.ma', phone: '+212 5XX-XXXXXX', ice: '001234567890124' },
    { id: '3', name: 'Fatima Alaoui', email: 'fatima@example.com', phone: '+212 6XX-XXXXXX', ice: '' }
  ]

  const products = [
    { id: '1', name: 'Ordinateur Portable HP', price: 8500, description: 'HP Pavilion 15"', taxRate: 20 },
    { id: '2', name: 'Imprimante Canon', price: 1200, description: 'Canon PIXMA', taxRate: 20 },
    { id: '3', name: 'Souris Logitech', price: 150, description: 'Souris optique', taxRate: 20 },
    { id: '4', name: 'Service Installation', price: 500, description: 'Installation et configuration', taxRate: 20 }
  ]

  const paymentTermsOptions = [
    { value: '0', label: 'Comptant' },
    { value: '15', label: '15 jours' },
    { value: '30', label: '30 jours' },
    { value: '45', label: '45 jours' },
    { value: '60', label: '60 jours' }
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

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerICE: customer.ice
      }))
    }
  }

  const handleLineChange = (lineId: string, field: keyof QuotationLine, value: string | number) => {
    setQuotationLines(prev => prev.map(line => {
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
    
    // Recalculate quotation totals
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

  const addQuotationLine = () => {
    const newLine: QuotationLine = {
      id: Date.now().toString(),
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 20,
      total: 0
    }
    setQuotationLines(prev => [...prev, newLine])
  }

  const removeQuotationLine = (lineId: string) => {
    if (quotationLines.length > 1) {
      setQuotationLines(prev => prev.filter(line => line.id !== lineId))
      calculateTotals()
    }
  }

  const calculateTotals = () => {
    const subtotal = quotationLines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice)
    }, 0)
    
    const totalDiscount = quotationLines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice * line.discount / 100)
    }, 0)
    
    const totalTax = quotationLines.reduce((sum, line) => {
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

    if (!formData.customerId) {
      newErrors.customerId = 'Le client est obligatoire'
    }

    if (!formData.quotationDate) {
      newErrors.quotationDate = 'La date de devis est obligatoire'
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'La date de validité est obligatoire'
    }

    if (quotationLines.length === 0 || quotationLines.every(line => !line.product)) {
      newErrors.quotationLines = 'Au moins une ligne de devis est obligatoire'
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
        message: 'Devis créé avec succès!'
      })
      
      // Redirect to sales after 2 seconds
      setTimeout(() => {
        navigate('/sales')
      }, 2000)
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la création du devis'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/sales')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Nouveau Devis
          </h1>
          <p className="text-muted-foreground">
            Créer un nouveau devis de vente
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le Devis'}
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
        {/* Quotation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Devis</CardTitle>
            <CardDescription>
              Détails généraux du devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  N° de Devis
                </label>
                <input
                  type="text"
                  value={formData.quotationNumber}
                  onChange={(e) => handleInputChange('quotationNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date de Devis *
                </label>
                <input
                  type="date"
                  value={formData.quotationDate}
                  onChange={(e) => handleInputChange('quotationDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.quotationDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.quotationDate && <p className="text-red-500 text-sm mt-1">{errors.quotationDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valide Jusqu'au *
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.validUntil ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Délai de Livraison
                </label>
                <input
                  type="text"
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 15 jours"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
            <CardDescription>
              Sélection et informations du client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sélectionner un Client *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.customerId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Choisir un client</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
            </div>

            {formData.customerId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-gray-600">{formData.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Téléphone:</p>
                  <p className="text-sm text-gray-600">{formData.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ICE:</p>
                  <p className="text-sm text-gray-600">{formData.customerICE || 'Non renseigné'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotation Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Lignes du Devis</CardTitle>
            <CardDescription>
              Produits et services proposés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.quotationLines && (
              <p className="text-red-500 text-sm">{errors.quotationLines}</p>
            )}

            <div className="space-y-4">
              {quotationLines.map((line, index) => (
                <div key={line.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Ligne {index + 1}</h4>
                    {quotationLines.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuotationLine(line.id)}
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
              onClick={addQuotationLine}
              className="w-full"
            >
              + Ajouter une ligne
            </Button>
          </CardContent>
        </Card>

        {/* Quotation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif du Devis</CardTitle>
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
                    Référence Client
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Référence du client"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes et Conditions</CardTitle>
            <CardDescription>
              Informations complémentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes pour le client
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Notes qui apparaîtront sur le devis..."
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
                placeholder="Notes internes (non visibles par le client)..."
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
                {isSubmitting ? 'Création en cours...' : 'Créer le Devis'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
