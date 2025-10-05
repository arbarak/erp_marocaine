import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { t } = useTranslation() // Will use 'common' as default namespace
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">ERP</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Système ERP Marocain
              </h1>
              <Badge variant="success" className="text-xs mt-1">
                Production Ready
              </Badge>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className={`transition-colors font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.dashboard')}
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className={`transition-colors font-medium ${
                location.pathname === '/catalog'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.catalog')}
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className={`transition-colors font-medium ${
                location.pathname === '/inventory'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.inventory')}
            </button>
            <button
              onClick={() => navigate('/purchasing')}
              className={`transition-colors font-medium ${
                location.pathname === '/purchasing'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.purchasing')}
            </button>
            <button
              onClick={() => navigate('/sales')}
              className={`transition-colors font-medium ${
                location.pathname === '/sales'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.sales')}
            </button>
            <button
              onClick={() => navigate('/invoicing')}
              className={`transition-colors font-medium ${
                location.pathname === '/invoicing'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.invoicing')}
            </button>
            <button
              onClick={() => navigate('/accounting')}
              className={`transition-colors font-medium ${
                location.pathname === '/accounting'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('navigation.accounting')}
            </button>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className={location.pathname === '/settings' ? 'bg-muted' : ''}
              >
                {t('navigation.settings')}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/profile')}
                className={location.pathname === '/profile' ? 'bg-primary/90' : ''}
              >
                {t('navigation.profile')}
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <Button variant="outline" size="sm" className="md:hidden">
            Menu
          </Button>
        </div>
      </div>
    </header>
  )
}
