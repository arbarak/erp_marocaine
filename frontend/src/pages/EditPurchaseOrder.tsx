import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditPurchaseOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierId: '',
    supplierName: '',
    orderDate: '',
    deliveryDate: '',
    status: 'draft',
    priority: 'normal',
    buyer: '',
    paymentTerms: 30,
    currency: 'MAD',
    notes: '',
    deliveryAddress: {
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
    totalAmount: 0
  })

  // Mock data for suppliers
  const suppliers = [
    { id: '1', name: 'TechSupply Maroc', code: 'SUPP-001' },
    { id: '2', name: 'Office Solutions', code: 'SUPP-002' },
    { id: '3', name: 'IT Distribution', code: 'SUPP-003' }
  ]

  // Mock data for products
  const products = [
    { id: '1', name: 'Ordinateur Portable HP', price: 8500, tvaRate: 20 },
    { id: '2', name: 'Imprimante Canon', price: 2500, tvaRate: 20 },
    { id: '3', name: 'Souris Logitech', price: 150, tvaRate: 20 }
  ]

  // Mock data for buyers
  const buyers = ['Ahmed Admin', 'Fatima Purchasing', 'Mohamed Manager']

  // Order statuses
  const orderStatuses = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'processing', label: 'En cours' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'received', label: 'Reçue' },
    { value: 'cancelled', label: 'Annulée' }
  ]

  // Priority levels
  const priorities = [
    { value: 'low', label: 'Basse' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Haute' },
    { value: 'urgent', label: 'Urgente' }
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

  // Load purchase order data on component mount
  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load purchase order data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the purchase order
        const mockOrder = {
          orderNumber: 'PO-2025-001',
          supplierId: '1',
          supplierName: 'TechSupply Maroc',
          orderDate: '2025-01-18',
          deliveryDate: '2025-01-25',
          status: 'confirmed',
          priority: 'normal',
          buyer: 'Ahmed Admin',
          paymentTerms: 30,
          currency: 'MAD',
          notes: 'Commande urgente pour renouvellement du stock. Livraison directe à l\'entrepôt principal.',
          deliveryAddress: {
            line1: 'Zone Industrielle Sidi Bernoussi',
            line2: 'Entrepôt A, Bloc 15',
            city: 'Casablanca',
            postalCode: '20600',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              description: 'HP EliteBook 840 G8, Intel Core i7, 16GB RAM, 512GB SSD',
              quantity: 20,
              unitPrice: 7500,
              discount: 10,
              tvaRate: 20,
              total: 162000
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              description: 'Canon PIXMA G3420, Multifonction, WiFi',
              quantity: 10,
              unitPrice: 2200,
              discount: 5,
              tvaRate: 20,
              total: 25080
            }
          ],
          subtotal: 187080,
          totalDiscount: 18708,
          totalTVA: 33674,
          totalAmount: 202046
        }
        
        setFormData(mockOrder)
      } catch (err) {
        setError('Erreur lors du chargement de la commande')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
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
      // Simulate API call to update purchase order
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/purchases')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.orderNumber) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement de la commande...
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
                Commande modifiée avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                La commande {formData.orderNumber} a été mise à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page des achats...
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Modifier la Commande
          </h1>
          <p className="text-muted-foreground">
            Modifier la commande "{formData.orderNumber}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Annuler
          </Button>
          <Button form="order-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Commande</CardTitle>
            <CardDescription>
              Détails généraux de la commande d'achat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">N° de Commande</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fournisseur *</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Acheteur</label>
                <select
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {buyers.map(buyer => (
                    <option key={buyer} value={buyer}>
                      {buyer}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date de Commande *</label>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de Livraison</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
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
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Conditions de Paiement</label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value={0}>Comptant</option>
                  <option value={15}>15 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={45}>45 jours</option>
                  <option value={60}>60 jours</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse de Livraison</CardTitle>
            <CardDescription>
              Adresse où la commande sera livrée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse Ligne 1</label>
                <input
                  type="text"
                  name="deliveryAddress.line1"
                  value={formData.deliveryAddress.line1}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Zone Industrielle Sidi Bernoussi"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adresse Ligne 2</label>
                <input
                  type="text"
                  name="deliveryAddress.line2"
                  value={formData.deliveryAddress.line2}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Entrepôt A, Bloc 15"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Casablanca"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code Postal</label>
                <input
                  type="text"
                  name="deliveryAddress.postalCode"
                  value={formData.deliveryAddress.postalCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="20600"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Région</label>
                <select
                  name="deliveryAddress.region"
                  value={formData.deliveryAddress.region}
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

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles de la Commande</CardTitle>
            <CardDescription>
              Produits et services commandés
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

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé de la Commande</CardTitle>
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
              placeholder="Notes et instructions spéciales..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchases')}>
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
