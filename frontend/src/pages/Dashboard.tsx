import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('navigation.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            Bienvenue dans votre espace de gestion d'entreprise
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success">En ligne</Badge>
          <Badge variant="default">TechnoMaroc SARL</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234,567 MAD</div>
            <p className="text-xs text-muted-foreground">
              +15% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Articles en stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/catalog/create')}
            >
              <span className="mr-2">📦</span>
              Ajouter un Produit
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/invoicing/create')}
            >
              <span className="mr-2">🧾</span>
              Créer une Facture
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/sales/orders/create')}
            >
              <span className="mr-2">🛒</span>
              Nouvelle Commande
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/sales/customers/create')}
            >
              <span className="mr-2">👤</span>
              Nouveau Client
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/purchasing/suppliers/create')}
            >
              <span className="mr-2">🏢</span>
              Nouveau Fournisseur
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate('/reports')}
            >
              <span className="mr-2">📊</span>
              Voir les Rapports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aperçu des Ventes</CardTitle>
            <CardDescription>
              Performance commerciale du mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Commandes en cours</span>
              <Badge variant="default">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Devis en attente</span>
              <Badge variant="secondary">8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Factures impayées</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Clients actifs</span>
              <Badge variant="success">45</Badge>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Objectif mensuel</span>
                <span className="text-sm font-bold text-green-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Dernières opérations commerciales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Commande CMD-2025-012 validée</p>
                <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
              </div>
              <Badge variant="outline">Ventes</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau client "Société ABC" ajouté</p>
                <p className="text-xs text-muted-foreground">Il y a 3 heures</p>
              </div>
              <Badge variant="outline">Clients</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Réception marchandises - Bon BR-2025-008</p>
                <p className="text-xs text-muted-foreground">Il y a 5 heures</p>
              </div>
              <Badge variant="outline">Achats</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Paiement reçu - Facture FAC-2025-089</p>
                <p className="text-xs text-muted-foreground">Il y a 7 heures</p>
              </div>
              <Badge variant="outline">Comptabilité</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
