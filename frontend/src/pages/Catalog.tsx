import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Catalog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [searchTerm, setSearchTerm] = useState('')

  const [products] = useState([
    {
      id: 1,
      name: 'Ordinateur Portable HP',
      sku: 'HP-LAP-001',
      category: 'Informatique',
      price: 8500,
      stock: 25,
      status: 'active'
    },
    {
      id: 2,
      name: 'Imprimante Canon',
      sku: 'CAN-PRT-002',
      category: 'Bureautique',
      price: 1200,
      stock: 15,
      status: 'active'
    },
    {
      id: 3,
      name: 'Souris Logitech',
      sku: 'LOG-MOU-003',
      category: 'Accessoires',
      price: 150,
      stock: 50,
      status: 'active'
    },
    {
      id: 4,
      name: 'Clavier Mécanique',
      sku: 'KEY-MEC-004',
      category: 'Accessoires',
      price: 350,
      stock: 8,
      status: 'active'
    },
    {
      id: 5,
      name: 'Écran Dell 24"',
      sku: 'DELL-MON-005',
      category: 'Informatique',
      price: 2200,
      stock: 12,
      status: 'active'
    },
    {
      id: 6,
      name: 'Scanner Epson',
      sku: 'EPS-SCN-006',
      category: 'Bureautique',
      price: 800,
      stock: 3,
      status: 'active'
    }
  ])

  // Filter products based on active filter and search term
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Apply category filter
    if (activeFilter !== 'Tous') {
      if (activeFilter === 'Stock Faible') {
        filtered = filtered.filter(product => product.stock <= 10)
      } else {
        filtered = filtered.filter(product => product.category === activeFilter)
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [products, activeFilter, searchTerm])

  const categories = ['Tous', 'Informatique', 'Bureautique', 'Accessoires', 'Stock Faible']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('modules.catalog')}
          </h1>
          <p className="text-muted-foreground">
            {t('modules.catalogDescription')}
          </p>
        </div>
        <Button onClick={() => navigate('/catalog/create')}>
          <span className="mr-2">➕</span>
          Ajouter un Produit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">Total Produits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">Catégories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">890</div>
            <p className="text-sm text-muted-foreground">Produits Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Stock Faible</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="text-sm font-medium">Rechercher</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Rechercher par nom, SKU ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Catégories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits</CardTitle>
          <CardDescription>
            {filteredProducts.length} produit(s) trouvé(s) {activeFilter !== 'Tous' && `dans "${activeFilter}"`}
            {searchTerm && ` pour "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun produit trouvé avec les critères sélectionnés.</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setActiveFilter('Tous')
                    setSearchTerm('')
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant={product.stock > 20 ? "success" : product.stock > 10 ? "warning" : "destructive"}>
                        Stock: {product.stock}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{product.price.toLocaleString()} MAD</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/catalog/edit/${product.id}`)}>
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/catalog/detail/${product.id}`)}>
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Form Modal would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Nouveau Produit</CardTitle>
          <CardDescription>
            Formulaire rapide pour ajouter un produit au catalogue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom du Produit</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Ordinateur Portable Dell"
              />
            </div>
            <div>
              <label className="text-sm font-medium">SKU</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: DELL-LAP-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Informatique</option>
                <option>Bureautique</option>
                <option>Accessoires</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prix (MAD)</label>
              <input 
                type="number" 
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stock Initial</label>
              <input 
                type="number" 
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">TVA (%)</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="20">20% (Standard)</option>
                <option value="14">14% (Réduit)</option>
                <option value="10">10% (Base)</option>
                <option value="7">7% (Essentiel)</option>
                <option value="0">0% (Exonéré)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button>Enregistrer</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
