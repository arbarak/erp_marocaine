import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Settings() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('general')
  
  // Mock data for system settings
  const [systemSettings] = useState({
    appName: 'ERP Maroc',
    appVersion: '1.0.0',
    environment: 'demo',
    timezone: 'Africa/Casablanca',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'MAD',
    language: 'fr-MA',
    maintenanceMode: false,
    debugMode: false,
    backupEnabled: true,
    backupFrequency: 'daily',
    lastBackup: '2025-01-18T02:00:00Z'
  })

  // Mock data for company settings
  const [companySettings] = useState({
    companyName: 'TechnoMaroc SARL',
    legalName: 'TechnoMaroc Société à Responsabilité Limitée',
    ice: '001234567890123',
    ifNumber: '12345678',
    vatNumber: 'MA001234567890123',
    rc: 'RC-CAS-2020-001',
    email: 'contact@technomaroc.ma',
    phone: '+212 522 123 456',
    website: 'https://technomaroc.ma',
    address: '123 Zone Industrielle Ain Sebaa\nCasablanca, Maroc',
    logo: null,
    fiscalYearStart: 1,
    currency: 'MAD',
    locale: 'fr-MA',
    taxRounding: 'ROUND_HALF_UP',
    inclusiveTaxes: false
  })

  // Mock data for tax settings
  const [taxSettings] = useState([
    {
      id: 1,
      name: 'TVA Standard',
      rate: 20.0,
      type: 'VAT',
      isDefault: true,
      isActive: true,
      description: 'Taux de TVA standard au Maroc'
    },
    {
      id: 2,
      name: 'TVA Réduite 1',
      rate: 14.0,
      type: 'VAT',
      isDefault: false,
      isActive: true,
      description: 'TVA réduite pour certains produits'
    },
    {
      id: 3,
      name: 'TVA Réduite 2',
      rate: 10.0,
      type: 'VAT',
      isDefault: false,
      isActive: true,
      description: 'TVA réduite pour produits de première nécessité'
    },
    {
      id: 4,
      name: 'TVA Réduite 3',
      rate: 7.0,
      type: 'VAT',
      isDefault: false,
      isActive: true,
      description: 'TVA réduite pour certains services'
    },
    {
      id: 5,
      name: 'TVA Exonérée',
      rate: 0.0,
      type: 'VAT',
      isDefault: false,
      isActive: true,
      description: 'Produits exonérés de TVA'
    },
    {
      id: 6,
      name: 'RAS/TVA',
      rate: 10.0,
      type: 'WITHHOLDING',
      isDefault: false,
      isActive: true,
      description: 'Retenue à la source sur TVA'
    }
  ])

  // Mock data for number sequences
  const [numberSequences] = useState([
    {
      id: 1,
      name: 'Factures',
      prefix: 'FAC',
      nextNumber: 1001,
      padding: 4,
      format: 'FAC-{YYYY}-{####}',
      example: 'FAC-2025-1001'
    },
    {
      id: 2,
      name: 'Devis',
      prefix: 'DEV',
      nextNumber: 501,
      padding: 3,
      format: 'DEV-{YYYY}-{###}',
      example: 'DEV-2025-501'
    },
    {
      id: 3,
      name: 'Bons de Commande',
      prefix: 'BC',
      nextNumber: 2001,
      padding: 4,
      format: 'BC-{YYYY}-{####}',
      example: 'BC-2025-2001'
    },
    {
      id: 4,
      name: 'Bons de Livraison',
      prefix: 'BL',
      nextNumber: 3001,
      padding: 4,
      format: 'BL-{YYYY}-{####}',
      example: 'BL-2025-3001'
    }
  ])

  // Mock data for email settings
  const [emailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@technomaroc.ma',
    smtpPassword: '••••••••',
    smtpSecurity: 'TLS',
    fromName: 'TechnoMaroc SARL',
    fromEmail: 'noreply@technomaroc.ma',
    replyToEmail: 'contact@technomaroc.ma',
    emailSignature: 'Cordialement,\nÉquipe TechnoMaroc SARL\nwww.technomaroc.ma',
    testEmailSent: false
  })

  // Mock data for integration settings
  const [integrationSettings] = useState([
    {
      id: 1,
      name: 'API REST',
      type: 'api',
      status: 'active',
      endpoint: 'https://api.erpmaroc.com/v1/',
      apiKey: 'erm_••••••••••••••••',
      lastUsed: '2025-01-18T10:30:00Z',
      requestCount: 1234
    },
    {
      id: 2,
      name: 'Webhook Notifications',
      type: 'webhook',
      status: 'active',
      endpoint: 'https://hooks.erpmaroc.com/notifications',
      apiKey: 'whk_••••••••••••••••',
      lastUsed: '2025-01-18T09:15:00Z',
      requestCount: 567
    },
    {
      id: 3,
      name: 'Export Comptable',
      type: 'export',
      status: 'inactive',
      endpoint: 'https://export.erpmaroc.com/accounting',
      apiKey: 'exp_••••••••••••••••',
      lastUsed: '2025-01-15T14:20:00Z',
      requestCount: 89
    }
  ])

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-green-100 text-green-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      case 'demo': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntegrationStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'destructive'
  }

  const formatLastUsed = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Paramètres Système
          </h1>
          <p className="text-muted-foreground">
            Configuration générale et paramètres avancés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">💾</span>
            Sauvegarder
          </Button>
          <Button variant="outline">
            <span className="mr-2">🔄</span>
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">v{systemSettings.appVersion}</div>
            <p className="text-sm text-muted-foreground">Version Système</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-lg font-bold">En ligne</div>
            </div>
            <p className="text-sm text-muted-foreground">Statut Système</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">6</div>
            <p className="text-sm text-muted-foreground">Intégrations Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-sm text-muted-foreground">Disponibilité</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'general' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('general')}
        >
          Général
        </Button>
        <Button
          variant={activeTab === 'company' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('company')}
        >
          Entreprise
        </Button>
        <Button
          variant={activeTab === 'tax' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tax')}
        >
          Taxes
        </Button>
        <Button
          variant={activeTab === 'numbering' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('numbering')}
        >
          Numérotation
        </Button>
        <Button
          variant={activeTab === 'email' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('email')}
        >
          Email
        </Button>
        <Button
          variant={activeTab === 'integrations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('integrations')}
        >
          Intégrations
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
              <CardDescription>Configuration générale de l'application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom de l'Application</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={systemSettings.appName}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <input 
                      type="text" 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={systemSettings.appVersion}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Environnement</label>
                    <div className="mt-1">
                      <Badge className={getEnvironmentColor(systemSettings.environment)}>
                        {systemSettings.environment.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fuseau Horaire</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="Africa/Casablanca">Africa/Casablanca</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format de Date</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format d'Heure</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="24h">24 heures</option>
                      <option value="12h">12 heures (AM/PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>État du Système</CardTitle>
              <CardDescription>Statut et maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode Maintenance</p>
                    <p className="text-sm text-muted-foreground">Désactiver l'accès utilisateur</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={systemSettings.maintenanceMode}
                      className="rounded"
                    />
                    <span className="text-sm">{systemSettings.maintenanceMode ? 'Activé' : 'Désactivé'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode Debug</p>
                    <p className="text-sm text-muted-foreground">Afficher les informations de débogage</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={systemSettings.debugMode}
                      className="rounded"
                    />
                    <span className="text-sm">{systemSettings.debugMode ? 'Activé' : 'Désactivé'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sauvegarde Automatique</p>
                    <p className="text-sm text-muted-foreground">Dernière sauvegarde: {formatLastUsed(systemSettings.lastBackup)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={systemSettings.backupEnabled ? 'success' : 'destructive'}>
                      {systemSettings.backupEnabled ? 'Activé' : 'Désactivé'}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <span className="mr-2">💾</span>
                    Créer une Sauvegarde Maintenant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'Entreprise</CardTitle>
            <CardDescription>Configuration de l'entreprise actuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Informations Légales</h3>
                <div>
                  <label className="text-sm font-medium">Nom Commercial</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.companyName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Raison Sociale</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.legalName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ICE</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.ice}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">IF</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.ifNumber}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Numéro TVA</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.vatNumber}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">RC</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.rc}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Contact & Configuration</h3>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.email}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.phone}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Site Web</label>
                  <input
                    type="url"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={companySettings.website}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Adresse</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={3}
                    value={companySettings.address}
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
                  <label className="text-sm font-medium">Début d'Exercice</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option value="1">Janvier</option>
                    <option value="4">Avril</option>
                    <option value="7">Juillet</option>
                    <option value="10">Octobre</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tax' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration des Taxes</CardTitle>
            <CardDescription>Gestion des taux de TVA et taxes marocaines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxSettings.map((tax) => (
                <div key={tax.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{tax.name}</h3>
                      <p className="text-sm text-muted-foreground">{tax.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {tax.rate}%
                        </Badge>
                        <Badge variant="outline">
                          {tax.type === 'VAT' ? 'TVA' : 'Retenue'}
                        </Badge>
                        {tax.isDefault && (
                          <Badge variant="success">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm" className={tax.isActive ? 'text-red-600' : 'text-green-600'}>
                      {tax.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <Button>
                  <span className="mr-2">➕</span>
                  Ajouter un Taux de Taxe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'numbering' && (
        <Card>
          <CardHeader>
            <CardTitle>Séquences de Numérotation</CardTitle>
            <CardDescription>Configuration des numéros automatiques pour les documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {numberSequences.map((sequence) => (
                <div key={sequence.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{sequence.name}</h3>
                      <p className="text-sm text-muted-foreground">Format: {sequence.format}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          Préfixe: {sequence.prefix}
                        </Badge>
                        <Badge variant="outline">
                          Prochain: {sequence.nextNumber}
                        </Badge>
                        <Badge variant="success">
                          Exemple: {sequence.example}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm">Réinitialiser</Button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <Button>
                  <span className="mr-2">➕</span>
                  Nouvelle Séquence
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration SMTP</CardTitle>
              <CardDescription>Paramètres du serveur de messagerie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Serveur SMTP</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.smtpHost}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Port</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={emailSettings.smtpPort}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sécurité</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="TLS">TLS</option>
                      <option value="SSL">SSL</option>
                      <option value="NONE">Aucune</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Utilisateur</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.smtpUser}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mot de passe</label>
                  <input
                    type="password"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.smtpPassword}
                  />
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    <span className="mr-2">📧</span>
                    Tester la Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'Envoi</CardTitle>
              <CardDescription>Configuration des emails sortants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom de l'Expéditeur</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.fromName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email de l'Expéditeur</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.fromEmail}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email de Réponse</label>
                  <input
                    type="email"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={emailSettings.replyToEmail}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Signature Email</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                    value={emailSettings.emailSignature}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'integrations' && (
        <Card>
          <CardHeader>
            <CardTitle>Intégrations et API</CardTitle>
            <CardDescription>Configuration des intégrations externes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationSettings.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔗</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.endpoint}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getIntegrationStatusColor(integration.status)}>
                          {integration.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">
                          {integration.requestCount} requêtes
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Dernière utilisation: {formatLastUsed(integration.lastUsed)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Configurer</Button>
                    <Button variant="outline" size="sm">Tester</Button>
                    <Button variant="outline" size="sm" className={integration.status === 'active' ? 'text-red-600' : 'text-green-600'}>
                      {integration.status === 'active' ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <Button>
                  <span className="mr-2">➕</span>
                  Nouvelle Intégration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
