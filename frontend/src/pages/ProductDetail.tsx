import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ProductDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [product, setProduct] = useState({
    id: '',
    name: '',
    sku: '',
    barcode: '',
    description: '',
    category: '',
    subcategory: '',
    productType: '',
    brand: '',
    costPrice: 0,
    sellingPrice: 0,
    minPrice: 0,
    currency: 'MAD',
    taxRate: 20,
    taxIncluded: false,
    trackInventory: true,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    isActive: true,
    isFeatured: false,
    supplier: '',
    manufacturer: '',
    warranty: '',
    notes: '',
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  const [stockHistory, setStockHistory] = useState([
    {
      id: '1',
      date: '2025-01-18',
      type: 'IN',
      quantity: 50,
      reason: 'Réception commande fournisseur',
      reference: 'CMD-2025-001',
      user: 'Ahmed Admin'
    },
    {
      id: '2',
      date: '2025-01-17',
      type: 'OUT',
      quantity: -5,
      reason: 'Vente client',
      reference: 'FAC-2025-089',
      user: 'Fatima Sales'
    },
    {
      id: '3',
      date: '2025-01-16',
      type: 'ADJUSTMENT',
      quantity: -2,
      reason: 'Ajustement inventaire',
      reference: 'ADJ-2025-003',
      user: 'Mohamed Inventory'
    }
  ])

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
          id: id || '1',
          name: 'Ordinateur Portable HP',
          sku: 'HP-LAP-001',
          barcode: '1234567890123',
          description: 'Ordinateur portable HP avec processeur Intel Core i5, 8GB RAM, 256GB SSD. Écran 15.6" Full HD, Windows 11 Pro préinstallé. Idéal pour le travail de bureau et les applications professionnelles.',
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
          notes: 'Produit phare de la gamme HP. Très demandé par les entreprises.',
          createdAt: '2025-01-10T10:30:00Z',
          updatedAt: '2025-01-18T14:20:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setProduct(mockProduct)
      } catch (err) {
        setError('Erreur lors du chargement du produit')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const getStockStatus = () => {
    if (product.currentStock <= product.minStock) {
      return { status: 'Stock Faible', color: 'bg-red-100 text-red-800' }
    } else if (product.currentStock <= product.reorderPoint) {
      return { status: 'Réapprovisionner', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'En Stock', color: 'bg-green-100 text-green-800' }
    }
  }

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'IN': return '📥'
      case 'OUT': return '📤'
      case 'TRANSFER': return '🔄'
      case 'ADJUSTMENT': return '⚖️'
      case 'RETURN': return '↩️'
      case 'LOSS': return '❌'
      default: return '📦'
    }
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'IN': return 'Entrée'
      case 'OUT': return 'Sortie'
      case 'TRANSFER': return 'Transfert'
      case 'ADJUSTMENT': return 'Ajustement'
      case 'RETURN': return 'Retour'
      case 'LOSS': return 'Perte'
      default: return type
    }
  }

  if (loading) {
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
              <Button onClick={() => navigate('/catalog')}>
                Retour au Catalogue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stockStatus = getStockStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-muted-foreground">
            SKU: {product.sku} • {product.category}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            Retour au Catalogue
          </Button>
          <Button onClick={() => navigate(`/catalog/edit/${product.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-sm">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-sm font-mono">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code-barres</label>
                  <p className="text-sm font-mono">{product.barcode || 'Non défini'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marque</label>
                  <p className="text-sm">{product.brand || 'Non définie'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                  <p className="text-sm">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sous-catégorie</label>
                  <p className="text-sm">{product.subcategory || 'Non définie'}</p>
                </div>
              </div>
              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="outline">⭐ Produit Vedette</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prix de Revient</label>
                  <p className="text-lg font-semibold">{product.costPrice.toLocaleString()} {product.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prix de Vente</label>
                  <p className="text-lg font-semibold text-green-600">{product.sellingPrice.toLocaleString()} {product.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prix Minimum</label>
                  <p className="text-lg font-semibold">{product.minPrice.toLocaleString()} {product.currency}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">TVA ({product.taxRate}%)</span>
                  <span className="text-sm">{product.taxIncluded ? 'Prix TTC' : 'Prix HT'}</span>
                </div>
                {!product.taxIncluded && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Prix TTC</span>
                    <span className="text-lg font-semibold">
                      {(product.sellingPrice * (1 + product.taxRate / 100)).toLocaleString()} {product.currency}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {product.currentStock}
                </div>
                <Badge className={stockStatus.color}>
                  {stockStatus.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock minimum</span>
                  <span className="text-sm">{product.minStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock maximum</span>
                  <span className="text-sm">{product.maxStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Point de réappro.</span>
                  <span className="text-sm">{product.reorderPoint}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate('/inventory/movements/create')}>
                📦 Mouvement de Stock
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.supplier && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fournisseur</label>
                  <p className="text-sm">{product.supplier}</p>
                </div>
              )}
              {product.manufacturer && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fabricant</label>
                  <p className="text-sm">{product.manufacturer}</p>
                </div>
              )}
              {product.warranty && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Garantie</label>
                  <p className="text-sm">{product.warranty}</p>
                </div>
              )}
              {product.weight > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Poids</label>
                  <p className="text-sm">{product.weight} kg</p>
                </div>
              )}
              {(product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                  <p className="text-sm">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Créé le</label>
                <p className="text-sm">{new Date(product.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modifié le</label>
                <p className="text-sm">{new Date(product.updatedAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Créé par</label>
                <p className="text-sm">{product.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Mouvements de Stock</CardTitle>
          <CardDescription>
            Derniers mouvements de stock pour ce produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stockHistory.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getMovementTypeIcon(movement.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getMovementTypeLabel(movement.type)}</span>
                      <Badge variant="outline">{movement.reference}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{movement.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.date).toLocaleDateString('fr-FR')} • {movement.user}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate('/inventory')}>
              Voir Tout l'Historique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
