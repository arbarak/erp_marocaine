import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Profile() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  
  // Mock data for current user
  const [currentUser] = useState({
    id: 1,
    username: 'admin',
    email: 'admin@erpmaroc.com',
    firstName: 'Ahmed',
    lastName: 'Admin',
    phone: '+212 661 123 456',
    language: 'fr',
    timezone: 'Africa/Casablanca',
    isVerified: true,
    isActive: true,
    isSuperuser: true,
    lastLogin: '2025-01-18T10:30:00Z',
    lastLoginIp: '192.168.1.100',
    createdAt: '2025-01-01T00:00:00Z',
    avatar: null,
    jobTitle: 'Administrateur Système',
    department: 'IT',
    companies: [
      { id: 1, name: 'TechnoMaroc SARL', role: 'Super Administrator', isActive: true },
      { id: 2, name: 'Atlas Distribution', role: 'Consultant', isActive: false }
    ],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      dashboardRefresh: 'auto',
      defaultCompany: 'TechnoMaroc SARL',
      theme: 'light'
    }
  })

  // Mock data for user activity
  const [userActivity] = useState([
    {
      id: 1,
      action: 'Connexion au système',
      module: 'Authentication',
      timestamp: '2025-01-18T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true
    },
    {
      id: 2,
      action: 'Modification produit HP-LAP-001',
      module: 'Catalog',
      timestamp: '2025-01-18T09:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true
    },
    {
      id: 3,
      action: 'Génération rapport financier',
      module: 'Reports',
      timestamp: '2025-01-17T16:45:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true
    },
    {
      id: 4,
      action: 'Tentative de connexion échouée',
      module: 'Authentication',
      timestamp: '2025-01-17T08:20:00Z',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: false
    }
  ])

  // Mock data for user sessions
  const [userSessions] = useState([
    {
      id: 1,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Casablanca, Maroc',
      startTime: '2025-01-18T10:30:00Z',
      lastActivity: '2025-01-18T11:45:00Z',
      isActive: true,
      isCurrent: true
    },
    {
      id: 2,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: 'Casablanca, Maroc',
      startTime: '2025-01-17T14:20:00Z',
      lastActivity: '2025-01-17T18:30:00Z',
      isActive: false,
      isCurrent: false
    }
  ])

  const getLanguageDisplay = (language: string) => {
    const languages = {
      'fr': 'Français',
      'ar': 'العربية',
      'en': 'English'
    }
    return languages[language as keyof typeof languages] || language
  }

  const getActivityStatusColor = (success: boolean) => {
    return success ? 'success' : 'destructive'
  }

  const getActivityStatusText = (success: boolean) => {
    return success ? 'Succès' : 'Échec'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mon Profil
          </h1>
          <p className="text-muted-foreground">
            Gestion de votre profil utilisateur et préférences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">🔒</span>
            Changer Mot de Passe
          </Button>
          <Button>
            <span className="mr-2">💾</span>
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{currentUser.firstName} {currentUser.lastName}</h2>
              <p className="text-muted-foreground">{currentUser.jobTitle} • {currentUser.department}</p>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={currentUser.isActive ? 'success' : 'destructive'}>
                  {currentUser.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                <Badge variant={currentUser.isVerified ? 'success' : 'warning'}>
                  {currentUser.isVerified ? 'Vérifié' : 'Non vérifié'}
                </Badge>
                {currentUser.isSuperuser && (
                  <Badge variant="destructive">
                    Super Utilisateur
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dernière connexion</p>
              <p className="font-medium">{formatDateTime(currentUser.lastLogin)}</p>
              <p className="text-sm text-muted-foreground">IP: {currentUser.lastLoginIp}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('profile')}
        >
          Profil
        </Button>
        <Button
          variant={activeTab === 'companies' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('companies')}
        >
          Entreprises
        </Button>
        <Button
          variant={activeTab === 'preferences' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('preferences')}
        >
          Préférences
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('activity')}
        >
          Activité
        </Button>
        <Button
          variant={activeTab === 'security' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('security')}
        >
          Sécurité
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Modifiez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.firstName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.lastName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.email}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <input 
                    type="tel" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.phone}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.username}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Poste</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.jobTitle}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Département</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={currentUser.department}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Langue</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="text-sm font-medium">Photo de Profil</label>
              <div className="mt-2 flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <Button variant="outline" size="sm">Changer la Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou GIF. Taille maximale: 2MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'companies' && (
        <Card>
          <CardHeader>
            <CardTitle>Entreprises Associées</CardTitle>
            <CardDescription>Gestion de vos accès aux entreprises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentUser.companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">Rôle: {company.role}</p>
                      <Badge variant={company.isActive ? 'success' : 'secondary'}>
                        {company.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {company.name === currentUser.preferences.defaultCompany ? 'Par défaut' : 'Définir par défaut'}
                    </Button>
                    <Button variant="outline" size="sm">Gérer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>Configurez vos préférences système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={currentUser.preferences.emailNotifications}
                      className="rounded"
                    />
                    <span className="text-sm">Notifications par email</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={currentUser.preferences.smsNotifications}
                      className="rounded"
                    />
                    <span className="text-sm">Notifications par SMS</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Interface</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Thème</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Actualisation du tableau de bord</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="auto">Automatique</option>
                      <option value="manual">Manuel</option>
                      <option value="5min">Toutes les 5 minutes</option>
                      <option value="15min">Toutes les 15 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Entreprise par Défaut</h3>
                <select className="w-full p-2 border rounded-md">
                  {currentUser.companies.map((company) => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Historique d'Activité</CardTitle>
            <CardDescription>Vos dernières actions dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{activity.action}</h3>
                      <p className="text-xs text-muted-foreground">Module: {activity.module}</p>
                      <p className="text-xs text-muted-foreground">IP: {activity.ipAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getActivityStatusColor(activity.success)}>
                      {getActivityStatusText(activity.success)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du Compte</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Mot de Passe</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Mot de passe actuel</label>
                      <input
                        type="password"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nouveau mot de passe</label>
                      <input
                        type="password"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button>Changer le Mot de Passe</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Authentification à Deux Facteurs</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">2FA par SMS</p>
                      <p className="text-sm text-muted-foreground">
                        Sécurisez votre compte avec un code SMS
                      </p>
                    </div>
                    <Button variant="outline">Activer</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions Actives</CardTitle>
              <CardDescription>Gérez vos sessions de connexion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">💻</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {session.userAgent.includes('iPhone') ? 'iPhone' : 'Ordinateur'}
                          {session.isCurrent && ' (Session actuelle)'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • IP: {session.ipAddress}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dernière activité: {formatDateTime(session.lastActivity)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.isActive ? 'success' : 'secondary'}>
                        {session.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      {!session.isCurrent && (
                        <Button variant="outline" size="sm">Déconnecter</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="destructive">Déconnecter Toutes les Autres Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
