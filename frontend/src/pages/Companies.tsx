import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Companies() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for companies
  const [companies] = useState([
    {
      id: 1,
      name: 'TechnoMaroc SARL',
      legalName: 'TechnoMaroc Société à Responsabilité Limitée',
      ice: '001234567890123',
      ifNumber: '12345678',
      rc: 'RC-CAS-2020-001',
      email: 'contact@technomaroc.ma',
      phone: '+212 522 123 456',
      website: 'https://technomaroc.ma',
      addressLine1: '123 Zone Industrielle Ain Sebaa',
      addressLine2: 'Immeuble Al Manar, 3ème étage',
      city: 'Casablanca',
      postalCode: '20250',
      stateProvince: 'Grand Casablanca',
      country: 'Maroc',
      currency: 'MAD',
      locale: 'fr-MA',
      fiscalYearStartMonth: 1,
      vatNumber: 'MA001234567890123',
      taxRoundingMethod: 'ROUND_HALF_UP',
      inclusiveTaxes: false,
      isActive: true,
      createdAt: '2025-01-01',
      userCount: 15,
      status: 'active'
    },
    {
      id: 2,
      name: 'Atlas Distribution',
      legalName: 'Atlas Distribution SA',
      ice: '002345678901234',
      ifNumber: '23456789',
      rc: 'RC-RAB-2021-002',
      email: 'info@atlas-distribution.ma',
      phone: '+212 537 654 321',
      website: 'https://atlas-distribution.ma',
      addressLine1: '456 Avenue Mohammed V',
      addressLine2: '',
      city: 'Rabat',
      postalCode: '10000',
      stateProvince: 'Rabat-Salé-Kénitra',
      country: 'Maroc',
      currency: 'MAD',
      locale: 'fr-MA',
      fiscalYearStartMonth: 1,
      vatNumber: 'MA002345678901234',
      taxRoundingMethod: 'ROUND_HALF_UP',
      inclusiveTaxes: false,
      isActive: true,
      createdAt: '2025-01-01',
      userCount: 8,
      status: 'active'
    }
  ])

  // Mock data for company settings
  const [companySettings] = useState([
    {
      id: 1,
      companyId: 1,
      invoicePrefix: 'FAC',
      quotePrefix: 'DEV',
      poPrefix: 'BC',
      soPrefix: 'BL',
      defaultPaymentTerms: 30,
      defaultQuoteValidity: 30,
      emailSignature: 'Cordialement,\nÉquipe TechnoMaroc SARL',
      defaultCostingMethod: 'FIFO'
    },
    {
      id: 2,
      companyId: 2,
      invoicePrefix: 'INV',
      quotePrefix: 'QUO',
      poPrefix: 'PO',
      soPrefix: 'SO',
      defaultPaymentTerms: 45,
      defaultQuoteValidity: 15,
      emailSignature: 'Meilleures salutations,\nAtlas Distribution',
      defaultCostingMethod: 'WAC'
    }
  ])

  // Mock data for user memberships
  const [userMemberships] = useState([
    {
      id: 1,
      companyId: 1,
      userId: 1,
      userName: 'Ahmed Admin',
      userEmail: 'admin@erpmaroc.com',
      roles: ['Administrator', 'Manager'],
      joinedAt: '2025-01-01',
      isActive: true,
      isAdmin: true
    },
    {
      id: 2,
      companyId: 1,
      userId: 2,
      userName: 'Fatima Manager',
      userEmail: 'fatima@technomaroc.ma',
      roles: ['Manager', 'Sales'],
      joinedAt: '2025-01-05',
      isActive: true,
      isAdmin: false
    },
    {
      id: 3,
      companyId: 2,
      userId: 3,
      userName: 'Mohamed Director',
      userEmail: 'mohamed@atlas-distribution.ma',
      roles: ['Administrator'],
      joinedAt: '2025-01-01',
      isActive: true,
      isAdmin: true
    }
  ])

  const getCompanyStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'destructive'
  }

  const getCurrencyDisplay = (currency: string) => {
    const currencies = {
      'MAD': 'Dirham Marocain (MAD)',
      'EUR': 'Euro (EUR)',
      'USD': 'US Dollar (USD)'
    }
    return currencies[currency as keyof typeof currencies] || currency
  }

  const getLocaleDisplay = (locale: string) => {
    const locales = {
      'fr-MA': 'Français (Maroc)',
      'ar-MA': 'العربية (المغرب)',
      'en-US': 'English (US)'
    }
    return locales[locale as keyof typeof locales] || locale
  }

  const getCostingMethodDisplay = (method: string) => {
    const methods = {
      'FIFO': 'Premier Entré, Premier Sorti',
      'LIFO': 'Dernier Entré, Premier Sorti',
      'WAC': 'Coût Moyen Pondéré'
    }
    return methods[method as keyof typeof methods] || method
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Entreprises
          </h1>
          <p className="text-muted-foreground">
            Configuration multi-entreprises et paramètres organisationnels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">🔄</span>
            Changer d'Entreprise
          </Button>
          <Button onClick={() => navigate('/companies/create')}>
            <span className="mr-2">➕</span>
            Nouvelle Entreprise
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Entreprises Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">23</div>
            <p className="text-sm text-muted-foreground">Utilisateurs Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">MAD</div>
            <p className="text-sm text-muted-foreground">Devise Principale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">100%</div>
            <p className="text-sm text-muted-foreground">Conformité ICE</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'companies' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('companies')}
        >
          Entreprises
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
        >
          Paramètres
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Company */}
          <Card>
            <CardHeader>
              <CardTitle>Entreprise Actuelle</CardTitle>
              <CardDescription>Informations de l'entreprise sélectionnée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{companies[0].name}</h3>
                    <p className="text-sm text-muted-foreground">{companies[0].legalName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">ICE: {companies[0].ice}</Badge>
                      <Badge variant="success">Actif</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Adresse:</p>
                    <p className="text-muted-foreground">
                      {companies[0].addressLine1}<br/>
                      {companies[0].city}, {companies[0].country}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Contact:</p>
                    <p className="text-muted-foreground">
                      {companies[0].email}<br/>
                      {companies[0].phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Rapides</CardTitle>
              <CardDescription>Aperçu de l'activité multi-entreprises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">🏢</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{company.userCount} utilisateurs</div>
                      <Badge variant={getCompanyStatusColor(company.status)} className="text-xs">
                        {company.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'companies' && (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Entreprises</CardTitle>
            <CardDescription>Gestion des entreprises du système multi-tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.legalName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Sélectionner</Button>
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Paramètres</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Identifiants Légaux</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">ICE:</span> {company.ice}</p>
                        <p><span className="font-medium">IF:</span> {company.ifNumber}</p>
                        <p><span className="font-medium">RC:</span> {company.rc}</p>
                        <p><span className="font-medium">TVA:</span> {company.vatNumber}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Contact & Adresse</p>
                      <div className="space-y-1">
                        <p>{company.email}</p>
                        <p>{company.phone}</p>
                        <p>{company.addressLine1}</p>
                        <p>{company.city}, {company.country}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Configuration</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Devise:</span> {getCurrencyDisplay(company.currency)}</p>
                        <p><span className="font-medium">Langue:</span> {getLocaleDisplay(company.locale)}</p>
                        <p><span className="font-medium">Exercice:</span> Mois {company.fiscalYearStartMonth}</p>
                        <p><span className="font-medium">Utilisateurs:</span> {company.userCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={getCompanyStatusColor(company.status)}>
                      {company.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="outline">
                      Créé le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                    </Badge>
                    <Badge variant="outline">
                      {company.inclusiveTaxes ? 'Prix TTC' : 'Prix HT'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres des Entreprises</CardTitle>
            <CardDescription>Configuration des préfixes, termes et méthodes par entreprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {companies.map((company) => {
                const settings = companySettings.find(s => s.companyId === company.id)
                return (
                  <div key={company.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <Button variant="outline" size="sm">Modifier Paramètres</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Préfixes de Numérotation</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Factures:</span>
                            <span className="font-medium">{settings?.invoicePrefix}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Devis:</span>
                            <span className="font-medium">{settings?.quotePrefix}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bons de Commande:</span>
                            <span className="font-medium">{settings?.poPrefix}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bons de Livraison:</span>
                            <span className="font-medium">{settings?.soPrefix}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Termes par Défaut</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Délai de Paiement:</span>
                            <span className="font-medium">{settings?.defaultPaymentTerms} jours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Validité Devis:</span>
                            <span className="font-medium">{settings?.defaultQuoteValidity} jours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Méthode de Coût:</span>
                            <span className="font-medium">{getCostingMethodDisplay(settings?.defaultCostingMethod || 'FIFO')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {settings?.emailSignature && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Signature Email</h4>
                        <div className="bg-muted p-3 rounded text-sm whitespace-pre-line">
                          {settings.emailSignature}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Multi-Entreprises</CardTitle>
            <CardDescription>Gestion des accès utilisateurs par entreprise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userMemberships.map((membership) => {
                const company = companies.find(c => c.id === membership.companyId)
                return (
                  <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{membership.userName}</h3>
                        <p className="text-sm text-muted-foreground">{membership.userEmail}</p>
                        <p className="text-sm text-muted-foreground">Entreprise: {company?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {membership.roles.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {membership.isAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              Administrateur
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Rejoint le {new Date(membership.joinedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">Rôles</Button>
                        <Button variant="outline" size="sm">Modifier</Button>
                        <Button variant="outline" size="sm" className={membership.isActive ? 'text-red-600' : 'text-green-600'}>
                          {membership.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Entreprise</CardTitle>
          <CardDescription>Ajouter une nouvelle entreprise au système multi-tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom Commercial</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: TechnoMaroc SARL"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Raison Sociale</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: TechnoMaroc Société à Responsabilité Limitée"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ICE (15 chiffres)</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="001234567890123"
                maxLength={15}
              />
            </div>
            <div>
              <label className="text-sm font-medium">IF (7-8 chiffres)</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="12345678"
                maxLength={8}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="contact@entreprise.ma"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="+212 522 123 456"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adresse</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="123 Zone Industrielle"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ville</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Casablanca"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Devise</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="MAD">Dirham Marocain (MAD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Langue</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="fr-MA">Français (Maroc)</option>
                <option value="ar-MA">العربية (المغرب)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer l'Entreprise</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
