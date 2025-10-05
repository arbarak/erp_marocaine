import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditStockMovement() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    movementNumber: '',
    movementType: 'in',
    warehouseId: '',
    warehouseName: '',
    sourceWarehouseId: '',
    sourceWarehouseName: '',
    destinationWarehouseId: '',
    destinationWarehouseName: '',
    movementDate: '',
    expectedDate: '',
    status: 'draft',
    priority: 'normal',
    responsible: '',
    reference: '',
    reason: '',
    notes: '',
    items: [] as Array<{
      id: string
      productId: string
      productName: string
      productCode: string
      currentStock: number
      quantity: number
      unitCost: number
      totalCost: number
      lotNumber: string
      expiryDate: string
      location: string
    }>,
    totalQuantity: 0,
    totalCost: 0
  })

  // Movement types
  const movementTypes = [
    { value: 'in', label: 'Entrée de Stock' },
    { value: 'out', label: 'Sortie de Stock' },
    { value: 'transfer', label: 'Transfert' },
    { value: 'adjustment', label: 'Ajustement' },
    { value: 'return', label: 'Retour' },
    { value: 'loss', label: 'Perte' },
    { value: 'found', label: 'Trouvé' }
  ]

  // Movement statuses
  const movementStatuses = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' }
  ]

  // Priority levels
  const priorityLevels = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ]

  // Mock data for warehouses
  const warehouses = [
    { id: '1', name: 'Entrepôt Principal Casablanca', code: 'WH-001' },
    { id: '2', name: 'Entrepôt Secondaire Rabat', code: 'WH-002' },
    { id: '3', name: 'Entrepôt Transit Tanger', code: 'WH-003' }
  ]

  // Mock data for products
  const products = [
    { id: '1', name: 'Ordinateur Portable HP', code: 'PROD-001', currentStock: 25, unitCost: 8500 },
    { id: '2', name: 'Imprimante Canon', code: 'PROD-002', currentStock: 15, unitCost: 2500 },
    { id: '3', name: 'Souris Logitech', code: 'PROD-003', currentStock: 50, unitCost: 150 }
  ]

  // Mock data for responsible persons
  const responsiblePersons = ['Ahmed Admin', 'Fatima Manager', 'Mohamed Supervisor', 'Aicha Coordinator']

  // Movement reasons
  const movementReasons = [
    'Réception fournisseur',
    'Vente client',
    'Transfert entre entrepôts',
    'Ajustement inventaire',
    'Retour client',
    'Retour fournisseur',
    'Perte/Vol',
    'Produit trouvé',
    'Correction erreur',
    'Autre'
  ]

  // Load stock movement data on component mount
  useEffect(() => {
    const loadStockMovement = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load stock movement data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the stock movement
        const mockMovement = {
          movementNumber: 'SM-2025-001',
          movementType: 'in',
          warehouseId: '1',
          warehouseName: 'Entrepôt Principal Casablanca',
          sourceWarehouseId: '',
          sourceWarehouseName: '',
          destinationWarehouseId: '',
          destinationWarehouseName: '',
          movementDate: '2025-01-18',
          expectedDate: '2025-01-18',
          status: 'approved',
          priority: 'normal',
          responsible: 'Ahmed Admin',
          reference: 'PO-2025-001',
          reason: 'Réception fournisseur',
          notes: 'Réception de commande d\'achat PO-2025-001. Contrôle qualité effectué.',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Ordinateur Portable HP',
              productCode: 'PROD-001',
              currentStock: 25,
              quantity: 10,
              unitCost: 8500,
              totalCost: 85000,
              lotNumber: 'LOT-2025-001',
              expiryDate: '',
              location: 'A-01-01'
            },
            {
              id: '2',
              productId: '2',
              productName: 'Imprimante Canon',
              productCode: 'PROD-002',
              currentStock: 15,
              quantity: 5,
              unitCost: 2500,
              totalCost: 12500,
              lotNumber: 'LOT-2025-002',
              expiryDate: '',
              location: 'A-01-02'
            }
          ],
          totalQuantity: 15,
          totalCost: 97500
        }
        
        setFormData(mockMovement)
      } catch (err) {
        setError('Erreur lors du chargement du mouvement de stock')
      } finally {
        setLoading(false)
      }
    }

    loadStockMovement()
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
    
    // Recalculate item total cost
    if (field === 'quantity' || field === 'unitCost') {
      const item = updatedItems[index]
      item.totalCost = item.quantity * item.unitCost
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }))
    
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items: typeof formData.items) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0)
    
    setFormData(prev => ({
      ...prev,
      totalQuantity,
      totalCost
    }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      productCode: '',
      currentStock: 0,
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      lotNumber: '',
      expiryDate: '',
      location: ''
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
      // Simulate API call to update stock movement
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/inventory')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du mouvement de stock')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.movementNumber) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du mouvement de stock...
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
                Mouvement de stock modifié avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                Le mouvement {formData.movementNumber} a été mis à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page d'inventaire...
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
              <Button onClick={() => navigate('/inventory')}>
                Retour à l'Inventaire
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
            Modifier le Mouvement de Stock
          </h1>
          <p className="text-muted-foreground">
            Modifier le mouvement "{formData.movementNumber}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            Annuler
          </Button>
          <Button form="movement-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="movement-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Movement Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Mouvement</CardTitle>
            <CardDescription>
              Détails généraux du mouvement de stock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">N° de Mouvement</label>
                <input
                  type="text"
                  name="movementNumber"
                  value={formData.movementNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type de Mouvement *</label>
                <select
                  name="movementType"
                  value={formData.movementType}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  {movementTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {movementStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date de Mouvement *</label>
                <input
                  type="date"
                  name="movementDate"
                  value={formData.movementDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date Prévue</label>
                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {priorityLevels.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsable</label>
                <select
                  name="responsible"
                  value={formData.responsible}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner un responsable</option>
                  {responsiblePersons.map(person => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Référence</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="PO-2025-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Motif</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner un motif</option>
                  {movementReasons.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Entrepôt</CardTitle>
            <CardDescription>
              Entrepôts source et destination selon le type de mouvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(formData.movementType === 'in' || formData.movementType === 'out' || formData.movementType === 'adjustment') && (
                <div>
                  <label className="text-sm font-medium">Entrepôt *</label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  >
                    <option value="">Sélectionner un entrepôt</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formData.movementType === 'transfer' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Entrepôt Source *</label>
                    <select
                      name="sourceWarehouseId"
                      value={formData.sourceWarehouseId}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-2 border rounded-md"
                      required
                    >
                      <option value="">Sélectionner l'entrepôt source</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Entrepôt Destination *</label>
                    <select
                      name="destinationWarehouseId"
                      value={formData.destinationWarehouseId}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-2 border rounded-md"
                      required
                    >
                      <option value="">Sélectionner l'entrepôt destination</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Movement Items */}
        <Card>
          <CardHeader>
            <CardTitle>Articles du Mouvement</CardTitle>
            <CardDescription>
              Produits concernés par le mouvement de stock
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
                          handleItemChange(index, 'productCode', product.code)
                          handleItemChange(index, 'currentStock', product.currentStock)
                          handleItemChange(index, 'unitCost', product.unitCost)
                        }
                      }}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock Actuel</label>
                    <input
                      type="number"
                      value={item.currentStock}
                      className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                      readOnly
                    />
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
                    <label className="text-sm font-medium">Coût Unit. (MAD)</label>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Coût Total (MAD)</label>
                    <input
                      type="text"
                      value={item.totalCost.toLocaleString()}
                      className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">N° de Lot</label>
                    <input
                      type="text"
                      value={item.lotNumber}
                      onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="LOT-2025-001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date d'Expiration</label>
                    <input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Emplacement</label>
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="A-01-01"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              + Ajouter un Article
            </Button>
          </CardContent>
        </Card>

        {/* Movement Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé du Mouvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quantité totale:</span>
                <span className="font-medium">{formData.totalQuantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Coût total:</span>
                <span className="font-medium">{formData.totalCost.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between">
                <span>Nombre d'articles:</span>
                <span className="font-medium">{formData.items.length}</span>
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
              placeholder="Notes et observations sur le mouvement..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
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
