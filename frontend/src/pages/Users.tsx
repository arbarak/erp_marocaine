import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Users() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for users
  const [users] = useState([
    {
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
      companies: ['TechnoMaroc SARL', 'Atlas Distribution'],
      roles: ['Super Administrator', 'System Manager']
    },
    {
      id: 2,
      username: 'fatima.manager',
      email: 'fatima@technomaroc.ma',
      firstName: 'Fatima',
      lastName: 'Manager',
      phone: '+212 662 234 567',
      language: 'fr',
      timezone: 'Africa/Casablanca',
      isVerified: true,
      isActive: true,
      isSuperuser: false,
      lastLogin: '2025-01-18T09:15:00Z',
      lastLoginIp: '192.168.1.101',
      createdAt: '2025-01-05T00:00:00Z',
      companies: ['TechnoMaroc SARL'],
      roles: ['Manager', 'Sales Manager']
    },
    {
      id: 3,
      username: 'mohamed.director',
      email: 'mohamed@atlas-distribution.ma',
      firstName: 'Mohamed',
      lastName: 'Director',
      phone: '+212 663 345 678',
      language: 'fr',
      timezone: 'Africa/Casablanca',
      isVerified: true,
      isActive: true,
      isSuperuser: false,
      lastLogin: '2025-01-17T16:45:00Z',
      lastLoginIp: '192.168.2.100',
      createdAt: '2025-01-01T00:00:00Z',
      companies: ['Atlas Distribution'],
      roles: ['Company Administrator']
    },
    {
      id: 4,
      username: 'sara.accountant',
      email: 'sara@technomaroc.ma',
      firstName: 'Sara',
      lastName: 'Accountant',
      phone: '+212 664 456 789',
      language: 'fr',
      timezone: 'Africa/Casablanca',
      isVerified: true,
      isActive: false,
      isSuperuser: false,
      lastLogin: '2025-01-15T14:20:00Z',
      lastLoginIp: '192.168.1.102',
      createdAt: '2025-01-10T00:00:00Z',
      companies: ['TechnoMaroc SARL'],
      roles: ['Accountant', 'Financial Analyst']
    }
  ])

  // Mock data for roles
  const [roles] = useState([
    {
      id: 1,
      name: 'Super Administrator',
      description: 'Accès complet au système, toutes entreprises',
      company: null,
      permissions: ['*'],
      userCount: 1,
      isActive: true
    },
    {
      id: 2,
      name: 'Company Administrator',
      description: 'Administrateur d\'une entreprise spécifique',
      company: 'TechnoMaroc SARL',
      permissions: ['company.*', 'users.manage', 'settings.edit'],
      userCount: 2,
      isActive: true
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Gestionnaire avec accès aux modules principaux',
      company: 'TechnoMaroc SARL',
      permissions: ['sales.*', 'purchasing.*', 'inventory.*'],
      userCount: 1,
      isActive: true
    },
    {
      id: 4,
      name: 'Sales Manager',
      description: 'Responsable des ventes et clients',
      company: 'TechnoMaroc SARL',
      permissions: ['sales.*', 'customers.*', 'quotes.*'],
      userCount: 1,
      isActive: true
    },
    {
      id: 5,
      name: 'Accountant',
      description: 'Comptable avec accès aux modules financiers',
      company: 'TechnoMaroc SARL',
      permissions: ['accounting.*', 'invoicing.*', 'reports.financial'],
      userCount: 1,
      isActive: true
    }
  ])

  // Mock data for user activity
  const [userActivity] = useState([
    {
      id: 1,
      userId: 1,
      userName: 'Ahmed Admin',
      action: 'Connexion au système',
      module: 'Authentication',
      timestamp: '2025-01-18T10:30:00Z',
      ipAddress: '192.168.1.100',
      company: 'TechnoMaroc SARL'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Fatima Manager',
      action: 'Création commande SO-2025-001',
      module: 'Sales',
      timestamp: '2025-01-18T09:45:00Z',
      ipAddress: '192.168.1.101',
      company: 'TechnoMaroc SARL'
    },
    {
      id: 3,
      userId: 1,
      userName: 'Ahmed Admin',
      action: 'Modification produit HP-LAP-001',
      module: 'Catalog',
      timestamp: '2025-01-18T09:15:00Z',
      ipAddress: '192.168.1.100',
      company: 'TechnoMaroc SARL'
    },
    {
      id: 4,
      userId: 3,
      userName: 'Mohamed Director',
      action: 'Validation facture FAC-2025-001',
      module: 'Invoicing',
      timestamp: '2025-01-17T16:45:00Z',
      ipAddress: '192.168.2.100',
      company: 'Atlas Distribution'
    }
  ])

  const getUserStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'destructive'
    if (!isVerified) return 'warning'
    return 'success'
  }

  const getUserStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactif'
    if (!isVerified) return 'Non vérifié'
    return 'Actif'
  }

  const getRoleTypeColor = (company: string | null) => {
    return company ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  const formatLastLogin = (lastLogin: string) => {
    return new Date(lastLogin).toLocaleString('fr-FR')
  }

  const getLanguageDisplay = (language: string) => {
    const languages = {
      'fr': 'Français',
      'ar': 'العربية',
      'en': 'English'
    }
    return languages[language as keyof typeof languages] || language
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Administration des utilisateurs, rôles et permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">🔑</span>
            Gérer les Rôles
          </Button>
          <Button onClick={() => navigate('/users/create')}>
            <span className="mr-2">➕</span>
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Utilisateurs Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Rôles Définis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Connexions Aujourd'hui</p>
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
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('roles')}
        >
          Rôles & Permissions
        </Button>
        <Button
          variant={activeTab === 'activity' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('activity')}
        >
          Activité
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières actions des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.userName}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.module} • {activity.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatLastLogin(activity.timestamp)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.ipAddress}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Actifs</CardTitle>
              <CardDescription>Utilisateurs connectés récemment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.filter(user => user.isActive).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {user.roles.slice(0, 2).map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getUserStatusColor(user.isActive, user.isVerified)} className="text-xs">
                        {getUserStatusText(user.isActive, user.isVerified)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
            <CardDescription>Gestion des comptes utilisateurs et de leurs accès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Permissions</Button>
                      <Button variant="outline" size="sm" className={user.isActive ? 'text-red-600' : 'text-green-600'}>
                        {user.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Informations Personnelles</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Téléphone:</span> {user.phone}</p>
                        <p><span className="font-medium">Langue:</span> {getLanguageDisplay(user.language)}</p>
                        <p><span className="font-medium">Fuseau:</span> {user.timezone}</p>
                        <p><span className="font-medium">Créé le:</span> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Accès & Sécurité</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Dernière connexion:</span> {formatLastLogin(user.lastLogin)}</p>
                        <p><span className="font-medium">IP:</span> {user.lastLoginIp}</p>
                        <p><span className="font-medium">Vérifié:</span> {user.isVerified ? 'Oui' : 'Non'}</p>
                        <p><span className="font-medium">Super utilisateur:</span> {user.isSuperuser ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Entreprises & Rôles</p>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-xs">Entreprises:</p>
                          {user.companies.map((company, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {company}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <p className="font-medium text-xs">Rôles:</p>
                          {user.roles.map((role, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={getUserStatusColor(user.isActive, user.isVerified)}>
                      {getUserStatusText(user.isActive, user.isVerified)}
                    </Badge>
                    {user.isSuperuser && (
                      <Badge variant="destructive">
                        Super Utilisateur
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>Rôles et Permissions</CardTitle>
            <CardDescription>Configuration des rôles et de leurs permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔑</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        {role.company && (
                          <p className="text-sm text-muted-foreground">Entreprise: {role.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Permissions</Button>
                      <Button variant="outline" size="sm" className={role.isActive ? 'text-red-600' : 'text-green-600'}>
                        {role.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-2">Informations du Rôle</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Utilisateurs:</span> {role.userCount}</p>
                        <p><span className="font-medium">Portée:</span> {role.company ? 'Entreprise spécifique' : 'Système global'}</p>
                        <p><span className="font-medium">Statut:</span> {role.isActive ? 'Actif' : 'Inactif'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Permissions</p>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 5).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{role.permissions.length - 5} autres permissions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={getRoleTypeColor(role.company)}>
                      {role.company ? 'Rôle Entreprise' : 'Rôle Système'}
                    </Badge>
                    <Badge variant={role.isActive ? 'success' : 'destructive'}>
                      {role.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal d'Activité</CardTitle>
            <CardDescription>Historique des actions des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📝</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{activity.userName}</h3>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.module}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {activity.company}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatLastLogin(activity.timestamp)}
                    </div>
                    <p className="text-sm text-muted-foreground">IP: {activity.ipAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvel Utilisateur</CardTitle>
          <CardDescription>Créer un nouveau compte utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Prénom</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Ahmed"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: Benali"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="ahmed.benali@entreprise.ma"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nom d'utilisateur</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="ahmed.benali"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="+212 661 123 456"
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
            <div>
              <label className="text-sm font-medium">Entreprise</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>TechnoMaroc SARL</option>
                <option>Atlas Distribution</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Rôle</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Manager</option>
                <option>Sales Manager</option>
                <option>Accountant</option>
                <option>Company Administrator</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Envoyer un email d'invitation</span>
            </label>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer l'Utilisateur</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
