import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const modules = [
    { key: 'catalog', icon: '📦', path: '/catalog' },
    { key: 'inventory', icon: '📊', path: '/inventory' },
    { key: 'invoicing', icon: '🧾', path: '/invoicing' },
    { key: 'purchasing', icon: '🛒', path: '/purchasing' },
    { key: 'sales', icon: '💰', path: '/sales' },
    { key: 'accounting', icon: '📈', path: '/accounting' }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-6">
          <Badge variant="success">Système Opérationnel ✅</Badge>
          <Badge variant="success">Conforme Maroc ✅</Badge>
          <Badge variant="success">Sécurisé ✅</Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {t('welcome')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('description')}
        </p>
        <Button size="lg" className="mb-12" onClick={() => navigate('/dashboard')}>
          Accéder au Tableau de Bord
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {modules.map((module) => (
            <Card 
              key={module.key}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{module.icon}</span>
                  {t(`modules.${module.key}`)}
                </CardTitle>
                <CardDescription>
                  {t(`modules.${module.key}Description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* Compliance Section */}
        <Card className="mt-12 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Modules de Gestion
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-foreground font-bold">📊</span>
                </div>
                <h3 className="font-semibold mb-2">Ventes & CRM</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion complète des clients, devis et commandes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-foreground font-bold">📦</span>
                </div>
                <h3 className="font-semibold mb-2">Inventaire</h3>
                <p className="text-sm text-muted-foreground">
                  Suivi des stocks et mouvements en temps réel
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-foreground font-bold">💰</span>
                </div>
                <h3 className="font-semibold mb-2">Comptabilité</h3>
                <p className="text-sm text-muted-foreground">
                  Gestion financière conforme aux normes marocaines
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Fonctionnalités Clés
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Gestion multi-entreprises</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Suivi des stocks en temps réel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Facturation automatisée</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Comptabilité conforme Maroc</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Rapports et tableaux de bord</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Interface intuitive et moderne</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Avantages Métier
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">⚡</span>
                  <span className="text-sm">Gain de temps sur les tâches administratives</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">📊</span>
                  <span className="text-sm">Visibilité en temps réel sur votre activité</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">🔒</span>
                  <span className="text-sm">Sécurité et confidentialité des données</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">📈</span>
                  <span className="text-sm">Amélioration de la productivité</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">🤝</span>
                  <span className="text-sm">Collaboration d'équipe simplifiée</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">💰</span>
                  <span className="text-sm">Réduction des coûts opérationnels</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            &copy; 2025 ERP System - Solution de gestion pour entreprises marocaines
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Optimisez votre gestion d'entreprise avec notre solution complète ✅
          </p>
        </div>
      </footer>
    </div>
  )
}
