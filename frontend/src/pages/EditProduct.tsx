import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    sku: '',
    barcode: '',
    description: '',
    
    // Category and Type
    category: '',
    subcategory: '',
    productType: 'product',
    brand: '',
    
    // Pricing
    costPrice: 0,
    sellingPrice: 0,
    minPrice: 0,
    currency: 'MAD',
    
    // Tax Information
    taxRate: 20,
    taxIncluded: false,
    
    // Inventory
    trackInventory: true,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    
    // Physical Properties
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    
    // Status
    isActive: true,
    isFeatured: false,
    
    // Additional Information
    supplier: '',
    manufacturer: '',
    warranty: '',
    notes: ''
  })

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

  const productTypes = [
    { value: 'product', label: 'Produit Physique' },
    { value: 'service', label: 'Service' },
    { value: 'digital', label: 'Produit Numérique' },
    { value: 'subscription', label: 'Abonnement' }
  ]

  const taxRates = [
    { value: 0, label: '0% (Exonéré)' },
    { value: 7, label: '7% (Essentiel)' },
    { value: 10, label: '10% (Base)' },
    { value: 14, label: '14% (Réduit)' },
    { value: 20, label: '20% (Standard)' }
  ]

  const currencies = [
    { value: 'MAD', label: 'Dirham Marocain (MAD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'US Dollar (USD)' }
  ]

  // Load product data on component mount
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load product data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the product
        const mockProduct = {
          name: 'Ordinateur Portable HP',
          sku: 'HP-LAP-001',
          barcode: '1234567890123',
          description: 'Ordinateur portable HP avec processeur Intel Core i5, 8GB RAM, 256GB SSD',
          category: 'Informatique',
          subcategory: 'Ordinateurs',
          productType: 'product',
          brand: 'HP',
          costPrice: 6500,
          sellingPrice: 8500,
          minPrice: 7000,
          currency: 'MAD',
          taxRate: 20,
          taxIncluded: false,
          trackInventory: true,
          currentStock: 25,
          minStock: 5,
          maxStock: 100,
          reorderPoint: 10,
          weight: 2.5,
          dimensions: {
            length: 35,
            width: 25,
            height: 2
          },
          isActive: true,
          isFeatured: true,
          supplier: 'HP Maroc',
          manufacturer: 'HP Inc.',
          warranty: '2 ans',
          notes: 'Produit phare de la gamme HP'
        }
        
        setFormData(mockProduct)
      } catch (err) {
        setError('Erreur lors du chargement du produit')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.sku) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (formData.sellingPrice <= 0) {
        throw new Error('Le prix de vente doit être supérieur à 0')
      }

      if (formData.minPrice > formData.sellingPrice) {
        throw new Error('Le prix minimum ne peut pas être supérieur au prix de vente')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(true)
      setTimeout(() => {
        navigate('/catalog')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du produit...
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
                Produit modifié avec succès !
              </h2>
              <p className="text-green-600">
                Les modifications de "{formData.name}" ont été enregistrées.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Redirection vers le catalogue...
              </p>
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
            Modifier le Produit
          </h1>
          <p className="text-muted-foreground">
            Modifier les informations du produit "{formData.name}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Erreur:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

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
                <label className="text-sm font-medium">Nom du Produit *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: Ordinateur Portable Dell"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: DELL-LAP-001"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code-barres</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="1234567890123"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Marque</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: HP"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
                placeholder="Description détaillée du produit..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Category and Type */}
        <Card>
          <CardHeader>
            <CardTitle>Catégorie et Type</CardTitle>
            <CardDescription>
              Classification du produit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sous-catégorie</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: Ordinateurs"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type de Produit</label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Tarification</CardTitle>
            <CardDescription>
              Prix et informations fiscales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Prix de Revient</label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prix de Vente *</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prix Minimum</label>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Devise</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Taux de TVA</label>
                <select
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {taxRates.map(rate => (
                    <option key={rate.value} value={rate.value}>
                      {rate.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="taxIncluded"
                  checked={formData.taxIncluded}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Prix TTC</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Stocks</CardTitle>
            <CardDescription>
              Paramètres de suivi des stocks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                name="trackInventory"
                checked={formData.trackInventory}
                onChange={handleInputChange}
                className="rounded"
              />
              <label className="text-sm font-medium">Suivre les stocks</label>
            </div>
            {formData.trackInventory && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Stock Actuel</label>
                  <input
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Minimum</label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Maximum</label>
                  <input
                    type="number"
                    name="maxStock"
                    value={formData.maxStock}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Point de Réapprovisionnement</label>
                  <input
                    type="number"
                    name="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    min="0"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/catalog')}>
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
