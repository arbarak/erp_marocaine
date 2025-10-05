import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditQuotation() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    quotationNumber: '',
    customerId: '',
    customerName: '',
    quotationDate: '',
    validUntil: '',
    status: 'draft',
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
    totalAmount: 0
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

  // Mock data for sales persons
  const salesPersons = ['Ahmed Admin', 'Fatima Sales', 'Mohamed Manager']

  // Quotation statuses
  const quotationStatuses = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'sent', label: 'Envoyé' },
    { value: 'accepted', label: 'Accepté' },
    { value: 'rejected', label: 'Refusé' },
    { value: 'expired', label: 'Expiré' }
  ]

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
          quotationNumber: 'QUO-2025-001',
          customerId: '1',
          customerName: 'Société Générale Maroc',
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
          totalAmount: 162840
        }
        
        setFormData(mockQuotation)
      } catch (err) {
        setError('Erreur lors du chargement du devis')
      } finally {
        setLoading(false)
      }
    }

    loadQuotation()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      totalDiscount,
      totalTVA,
      totalAmount
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
      // Simulate API call to update quotation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/sales')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du devis')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.quotationNumber) {
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

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Devis modifié avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                Le devis {formData.quotationNumber} a été mis à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page des ventes...
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Modifier le Devis
          </h1>
          <p className="text-muted-foreground">
            Modifier le devis "{formData.quotationNumber}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Annuler
          </Button>
          <Button form="quotation-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Quotation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Devis</CardTitle>
            <CardDescription>
              Détails généraux du devis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">N° de Devis</label>
                <input
                  type="text"
                  name="quotationNumber"
                  value={formData.quotationNumber}
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
                <label className="text-sm font-medium">Commercial</label>
                <select
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {salesPersons.map(person => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date de Devis *</label>
                <input
                  type="date"
                  name="quotationDate"
                  value={formData.quotationDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valide jusqu'au</label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
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
                  {quotationStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles du Devis</CardTitle>
            <CardDescription>
              Produits et services proposés
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

        {/* Quotation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé du Devis</CardTitle>
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
              placeholder="Conditions et notes du devis..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/sales')}>
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
