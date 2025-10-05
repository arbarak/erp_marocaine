import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CreateStockMovement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Movement Information
    movementType: 'IN',
    movementDate: new Date().toISOString().split('T')[0],
    reference: '',
    
    // Product Information
    productId: '',
    productName: '',
    productSku: '',
    
    // Location Information
    warehouseId: '',
    warehouseName: '',
    locationCode: '',
    
    // Quantity Information
    quantity: 1,
    unitOfMeasure: 'pcs',
    unitCost: 0,
    totalValue: 0,
    
    // Transfer Information (if applicable)
    sourceWarehouseId: '',
    sourceLocationCode: '',
    destinationWarehouseId: '',
    destinationLocationCode: '',
    
    // Additional Information
    reason: '',
    notes: '',
    batchNumber: '',
    expiryDate: '',
    serialNumbers: '',
    
    // User Information
    userId: 'current-user',
    userName: 'Ahmed Admin'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const movementTypes = [
    { value: 'IN', label: 'Entrée de Stock', icon: '📥', description: 'Réception de marchandises' },
    { value: 'OUT', label: 'Sortie de Stock', icon: '📤', description: 'Expédition ou vente' },
    { value: 'TRANSFER', label: 'Transfert', icon: '🔄', description: 'Transfert entre entrepôts' },
    { value: 'ADJUSTMENT', label: 'Ajustement', icon: '⚖️', description: 'Correction d\'inventaire' },
    { value: 'RETURN', label: 'Retour', icon: '↩️', description: 'Retour client ou fournisseur' },
    { value: 'LOSS', label: 'Perte', icon: '❌', description: 'Perte ou casse' }
  ]

  const reasons = {
    'IN': [
      'Réception fournisseur',
      'Retour client',
      'Production',
      'Ajustement positif',
      'Autre'
    ],
    'OUT': [
      'Vente',
      'Expédition',
      'Retour fournisseur',
      'Consommation interne',
      'Autre'
    ],
    'TRANSFER': [
      'Réorganisation',
      'Optimisation stock',
      'Demande magasin',
      'Autre'
    ],
    'ADJUSTMENT': [
      'Inventaire physique',
      'Correction erreur',
      'Dépréciation',
      'Autre'
    ],
    'RETURN': [
      'Défaut qualité',
      'Erreur commande',
      'Annulation',
      'Autre'
    ],
    'LOSS': [
      'Casse',
      'Vol',
      'Péremption',
      'Autre'
    ]
  }

  const warehouses = [
    { id: '1', name: 'Entrepôt Principal Casablanca', code: 'WH-CAS-001' },
    { id: '2', name: 'Dépôt Rabat', code: 'WH-RAB-002' },
    { id: '3', name: 'Magasin Marrakech', code: 'WH-MAR-003' }
  ]

  const products = [
    { id: '1', name: 'Ordinateur Portable HP', sku: 'HP-LAP-001', cost: 7500 },
    { id: '2', name: 'Imprimante Canon', sku: 'CAN-PRT-002', cost: 1200 },
    { id: '3', name: 'Souris Logitech', sku: 'LOG-MOU-003', cost: 150 },
    { id: '4', name: 'Clavier Sans Fil', sku: 'KEY-WIR-004', cost: 200 }
  ]

  const unitsOfMeasure = [
    { value: 'pcs', label: 'Pièces' },
    { value: 'kg', label: 'Kilogrammes' },
    { value: 'l', label: 'Litres' },
    { value: 'm', label: 'Mètres' },
    { value: 'box', label: 'Boîtes' },
    { value: 'pack', label: 'Paquets' }
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

    // Calculate total value when quantity or unit cost changes
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = field === 'quantity' ? Number(value) : formData.quantity
      const unitCost = field === 'unitCost' ? Number(value) : formData.unitCost
      setFormData(prev => ({
        ...prev,
        totalValue: quantity * unitCost
      }))
    }
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        productName: product.name,
        productSku: product.sku,
        unitCost: product.cost,
        totalValue: prev.quantity * product.cost
      }))
    }
  }

  const handleWarehouseChange = (warehouseId: string, field: 'warehouseId' | 'sourceWarehouseId' | 'destinationWarehouseId') => {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    if (warehouse) {
      if (field === 'warehouseId') {
        setFormData(prev => ({
          ...prev,
          warehouseId,
          warehouseName: warehouse.name
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: warehouseId
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.movementType) {
      newErrors.movementType = 'Le type de mouvement est obligatoire'
    }

    if (!formData.productId) {
      newErrors.productId = 'Le produit est obligatoire'
    }

    if (!formData.warehouseId && formData.movementType !== 'TRANSFER') {
      newErrors.warehouseId = 'L\'entrepôt est obligatoire'
    }

    if (formData.movementType === 'TRANSFER') {
      if (!formData.sourceWarehouseId) {
        newErrors.sourceWarehouseId = 'L\'entrepôt source est obligatoire'
      }
      if (!formData.destinationWarehouseId) {
        newErrors.destinationWarehouseId = 'L\'entrepôt destination est obligatoire'
      }
      if (formData.sourceWarehouseId === formData.destinationWarehouseId) {
        newErrors.destinationWarehouseId = 'L\'entrepôt destination doit être différent de la source'
      }
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0'
    }

    if (!formData.movementDate) {
      newErrors.movementDate = 'La date de mouvement est obligatoire'
    }

    if (!formData.reason) {
      newErrors.reason = 'La raison du mouvement est obligatoire'
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
        message: 'Mouvement de stock enregistré avec succès!'
      })
      
      // Redirect to inventory after 2 seconds
      setTimeout(() => {
        navigate('/inventory')
      }, 2000)
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement du mouvement'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/inventory')
  }

  const getMovementTypeInfo = () => {
    return movementTypes.find(type => type.value === formData.movementType)
  }

  const getCurrentReasons = () => {
    return reasons[formData.movementType as keyof typeof reasons] || []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Nouveau Mouvement de Stock
          </h1>
          <p className="text-muted-foreground">
            Enregistrer un mouvement d'entrée, sortie ou transfert
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Mouvement'}
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
        {/* Movement Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Type de Mouvement</CardTitle>
            <CardDescription>
              Sélectionner le type de mouvement de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {movementTypes.map((type) => (
                <div
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.movementType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('movementType', type.value)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h3 className="font-medium">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.movementType && <p className="text-red-500 text-sm mt-2">{errors.movementType}</p>}
          </CardContent>
        </Card>

        {/* Movement Information */}
        {formData.movementType && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center space-x-2">
                  <span>{getMovementTypeInfo()?.icon}</span>
                  <span>Informations du {getMovementTypeInfo()?.label}</span>
                </span>
              </CardTitle>
              <CardDescription>
                Détails du mouvement de stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date du Mouvement *
                  </label>
                  <input
                    type="date"
                    value={formData.movementDate}
                    onChange={(e) => handleInputChange('movementDate', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.movementDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.movementDate && <p className="text-red-500 text-sm mt-1">{errors.movementDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Référence du mouvement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Raison du Mouvement *
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Sélectionner une raison</option>
                    {getCurrentReasons().map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Selection */}
        {formData.movementType && (
          <Card>
            <CardHeader>
              <CardTitle>Produit</CardTitle>
              <CardDescription>
                Sélection du produit concerné par le mouvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Produit *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.productId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
                {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
              </div>

              {formData.productId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Nom:</p>
                    <p className="text-sm text-gray-600">{formData.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">SKU:</p>
                    <p className="text-sm text-gray-600">{formData.productSku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coût Unitaire:</p>
                    <p className="text-sm text-gray-600">{formData.unitCost.toLocaleString()} MAD</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quantity and Value */}
        {formData.movementType && (
          <Card>
            <CardHeader>
              <CardTitle>Quantité et Valeur</CardTitle>
              <CardDescription>
                Quantités et valeurs du mouvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 border rounded-lg ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unité de Mesure
                  </label>
                  <select
                    value={formData.unitOfMeasure}
                    onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {unitsOfMeasure.map(unit => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coût Unitaire (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valeur Totale (MAD)
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg font-medium">
                    {formData.totalValue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Entrepôt *
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => handleWarehouseChange(e.target.value, 'warehouseId')}
                  className={`w-full p-3 border rounded-lg ${errors.warehouseId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner un entrepôt</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </option>
                  ))}
                </select>
                {errors.warehouseId && <p className="text-red-500 text-sm mt-1">{errors.warehouseId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Notes et remarques sur le mouvement..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {formData.movementType && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer le Mouvement'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}
