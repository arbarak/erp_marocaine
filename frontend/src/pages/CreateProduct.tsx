import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

export function CreateProduct() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    maxStock: '',
    unit: 'pièce',
    barcode: '',
    weight: '',
    dimensions: '',
    supplier: '',
    brand: '',
    status: 'active',
    taxRate: '20',
    isService: false,
    trackStock: true,
    allowNegativeStock: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Informatique',
    'Bureautique', 
    'Accessoires',
    'Mobilier',
    'Électronique',
    'Consommables',
    'Services',
    'Autre'
  ]

  const units = [
    'pièce',
    'kg',
    'litre',
    'mètre',
    'heure',
    'jour',
    'lot',
    'carton'
  ]

  const suppliers = [
    'Fournisseur A',
    'Fournisseur B', 
    'Fournisseur C',
    'Autre'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est obligatoire'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'Le code SKU est obligatoire'
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est obligatoire'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix de vente doit être supérieur à 0'
    }

    if (!formData.cost || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Le coût d\'achat ne peut pas être négatif'
    }

    if (formData.trackStock && (!formData.stock || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'Le stock initial ne peut pas être négatif'
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
      showSuccess(
        'Produit créé',
        'Produit créé avec succès!'
      )

      // Redirect to catalog after 2 seconds
      setTimeout(() => {
        navigate('/catalog')
      }, 2000)
      
    } catch (error) {
      showError(
        'Erreur de création',
        'Erreur lors de la création du produit'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/catalog')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Nouveau Produit
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau produit au catalogue
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le Produit'}
          </Button>
        </div>
      </div>



      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
            <CardDescription>
              Informations principales du produit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du Produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: Ordinateur Portable HP"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Code SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.sku ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: HP-LAP-001"
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Marque
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: HP, Canon, Logitech"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Description détaillée du produit..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Prix et Coûts</CardTitle>
            <CardDescription>
              Configuration des prix et coûts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prix de Vente (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Coût d'Achat (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.cost ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00"
                />
                {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Taux de TVA (%)
                </label>
                <select
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="0">0% (Exonéré)</option>
                  <option value="7">7%</option>
                  <option value="10">10%</option>
                  <option value="14">14%</option>
                  <option value="20">20% (Standard)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Stocks</CardTitle>
            <CardDescription>
              Configuration du stock et des seuils
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="trackStock"
                checked={formData.trackStock}
                onChange={(e) => handleInputChange('trackStock', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="trackStock" className="text-sm font-medium">
                Suivre le stock pour ce produit
              </label>
            </div>

            {formData.trackStock && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Initial *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stock Maximum
                  </label>
                  <input
                    type="number"
                    value={formData.maxStock}
                    onChange={(e) => handleInputChange('maxStock', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unité
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowNegativeStock"
                checked={formData.allowNegativeStock}
                onChange={(e) => handleInputChange('allowNegativeStock', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="allowNegativeStock" className="text-sm font-medium">
                Autoriser le stock négatif
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Complémentaires</CardTitle>
            <CardDescription>
              Détails techniques et logistiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code-barres
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 1234567890123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fournisseur Principal
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dimensions (L x l x H cm)
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 30 x 20 x 10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isService"
                checked={formData.isService}
                onChange={(e) => handleInputChange('isService', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isService" className="text-sm font-medium">
                Ce produit est un service
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="discontinued">Discontinué</option>
              </select>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours...' : 'Créer le Produit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
