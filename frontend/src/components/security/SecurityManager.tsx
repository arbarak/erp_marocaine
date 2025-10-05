import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  Activity,
  Smartphone,
  Globe,
  Database,
  FileText,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface SecurityPolicy {
  id: string
  name: string
  description: string
  category: 'authentication' | 'authorization' | 'data' | 'network' | 'compliance'
  status: 'active' | 'inactive' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: string
  config: Record<string, any>
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'config_change'
  severity: 'info' | 'warning' | 'error' | 'critical'
  user: string
  description: string
  timestamp: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, any>
}

interface TwoFactorSetup {
  isEnabled: boolean
  method: 'totp' | 'sms' | 'email'
  backupCodes: string[]
  lastUsed?: string
}

export function SecurityManager() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'events' | '2fa' | 'sessions'>('overview')
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Politique de mots de passe',
        description: 'Exigences de complexité et de rotation des mots de passe',
        category: 'authentication',
        status: 'active',
        severity: 'high',
        lastUpdated: '2024-01-20T10:00:00Z',
        config: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90,
          preventReuse: 5
        }
      },
      {
        id: '2',
        name: 'Authentification à deux facteurs',
        description: 'Authentification multi-facteurs obligatoire pour les administrateurs',
        category: 'authentication',
        status: 'active',
        severity: 'critical',
        lastUpdated: '2024-01-19T15:30:00Z',
        config: {
          required: true,
          methods: ['totp', 'sms'],
          gracePeriod: 7
        }
      },
      {
        id: '3',
        name: 'Contrôle d\'accès basé sur les rôles',
        description: 'Permissions granulaires basées sur les rôles utilisateur',
        category: 'authorization',
        status: 'active',
        severity: 'high',
        lastUpdated: '2024-01-18T09:15:00Z',
        config: {
          strictMode: true,
          inheritanceEnabled: true,
          auditRequired: true
        }
      },
      {
        id: '4',
        name: 'Chiffrement des données',
        description: 'Chiffrement AES-256 pour les données sensibles',
        category: 'data',
        status: 'active',
        severity: 'critical',
        lastUpdated: '2024-01-17T14:20:00Z',
        config: {
          algorithm: 'AES-256-GCM',
          keyRotation: 30,
          encryptAtRest: true,
          encryptInTransit: true
        }
      },
      {
        id: '5',
        name: 'Surveillance des sessions',
        description: 'Monitoring et limitation des sessions utilisateur',
        category: 'authentication',
        status: 'warning',
        severity: 'medium',
        lastUpdated: '2024-01-16T11:45:00Z',
        config: {
          maxConcurrentSessions: 3,
          sessionTimeout: 480,
          idleTimeout: 30,
          forceLogoutOnSuspicious: true
        }
      }
    ]

    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'failed_login',
        severity: 'warning',
        user: 'admin@company.com',
        description: 'Tentative de connexion échouée - mot de passe incorrect',
        timestamp: '2024-01-20T14:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: { attempts: 3, locked: false }
      },
      {
        id: '2',
        type: 'permission_denied',
        severity: 'error',
        user: 'user@company.com',
        description: 'Accès refusé au module comptabilité',
        timestamp: '2024-01-20T13:15:00Z',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: { module: 'accounting', action: 'view_reports' }
      },
      {
        id: '3',
        type: 'config_change',
        severity: 'critical',
        user: 'admin@company.com',
        description: 'Modification de la politique de sécurité',
        timestamp: '2024-01-20T10:00:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: { policy: 'password_policy', changes: ['minLength: 8 -> 12'] }
      },
      {
        id: '4',
        type: 'login',
        severity: 'info',
        user: 'manager@company.com',
        description: 'Connexion réussie',
        timestamp: '2024-01-20T09:30:00Z',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        metadata: { method: '2fa', location: 'Casablanca, Morocco' }
      }
    ]

    const mockTwoFactor: TwoFactorSetup = {
      isEnabled: true,
      method: 'totp',
      backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012'],
      lastUsed: '2024-01-20T09:30:00Z'
    }

    setPolicies(mockPolicies)
    setEvents(mockEvents)
    setTwoFactorSetup(mockTwoFactor)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-error" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="error">Critique</Badge>
      case 'high':
        return <Badge variant="warning">Élevée</Badge>
      case 'medium':
        return <Badge variant="info">Moyenne</Badge>
      default:
        return <Badge variant="neutral">Faible</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Key className="h-4 w-4" />
      case 'authorization':
        return <Users className="h-4 w-4" />
      case 'data':
        return <Database className="h-4 w-4" />
      case 'network':
        return <Globe className="h-4 w-4" />
      case 'compliance':
        return <FileText className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'logout':
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      case 'failed_login':
        return <XCircle className="h-4 w-4 text-error" />
      case 'permission_denied':
        return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'data_access':
        return <Eye className="h-4 w-4 text-info" />
      case 'config_change':
        return <Settings className="h-4 w-4 text-warning" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handlePolicyEdit = (policy: SecurityPolicy) => {
    setSelectedPolicy(policy)
    setIsPolicyDialogOpen(true)
  }

  const handlePolicyToggle = async (policyId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPolicies(prev => prev.map(p => 
      p.id === policyId 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ))
    setIsLoading(false)
  }

  const securityScore = Math.round(
    (policies.filter(p => p.status === 'active').length / policies.length) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestionnaire de sécurité
          </h1>
          <p className="text-muted-foreground">
            Surveillance et gestion de la sécurité de l'entreprise
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score de sécurité</div>
            <div className={`text-2xl font-bold ${
              securityScore >= 90 ? 'text-success' :
              securityScore >= 70 ? 'text-warning' : 'text-error'
            }`}>
              {securityScore}%
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            securityScore >= 90 ? 'bg-success/10' :
            securityScore >= 70 ? 'bg-warning/10' : 'bg-error/10'
          }`}>
            <Shield className={`h-6 w-6 ${
              securityScore >= 90 ? 'text-success' :
              securityScore >= 70 ? 'text-warning' : 'text-error'
            }`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="h-4 w-4" /> },
          { id: 'policies', label: 'Politiques', icon: <FileText className="h-4 w-4" /> },
          { id: 'events', label: 'Événements', icon: <Eye className="h-4 w-4" /> },
          { id: '2fa', label: '2FA', icon: <Smartphone className="h-4 w-4" /> },
          { id: 'sessions', label: 'Sessions', icon: <Users className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Security Metrics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Politiques actives</h3>
                <p className="text-2xl font-bold text-success">
                  {policies.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sur {policies.length} politiques configurées
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Alertes récentes</h3>
                <p className="text-2xl font-bold text-warning">
                  {events.filter(e => e.severity === 'warning' || e.severity === 'error').length}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Dernières 24 heures
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Sessions actives</h3>
                <p className="text-2xl font-bold text-info">24</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Utilisateurs connectés
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="font-semibold">Tentatives échouées</h3>
                <p className="text-2xl font-bold text-error">
                  {events.filter(e => e.type === 'failed_login').length}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Dernières 24 heures
            </p>
          </Card>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Politiques de sécurité</h2>
            <Button onClick={() => setIsPolicyDialogOpen(true)}>
              Nouvelle politique
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(policy.category)}
                    <div>
                      <h3 className="font-semibold">{policy.name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(policy.status)}
                    {getSeverityBadge(policy.severity)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Dernière mise à jour:</span>
                    <span className="ml-2 font-medium">{formatDate(policy.lastUpdated)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePolicyEdit(policy)}
                  >
                    Configurer
                  </Button>
                  
                  <Button
                    variant={policy.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handlePolicyToggle(policy.id)}
                    disabled={isLoading}
                  >
                    {policy.status === 'active' ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Événements de sécurité</h2>
            <Select
              placeholder="Filtrer par type"
              options={[
                { value: 'all', label: 'Tous les événements' },
                { value: 'login', label: 'Connexions' },
                { value: 'failed_login', label: 'Échecs de connexion' },
                { value: 'permission_denied', label: 'Accès refusés' },
                { value: 'config_change', label: 'Modifications' },
              ]}
            />
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{event.description}</h4>
                      <Badge variant={
                        event.severity === 'critical' ? 'error' :
                        event.severity === 'error' ? 'error' :
                        event.severity === 'warning' ? 'warning' : 'info'
                      }>
                        {event.severity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Utilisateur:</span>
                        <br />
                        {event.user}
                      </div>
                      <div>
                        <span className="font-medium">IP:</span>
                        <br />
                        {event.ipAddress}
                      </div>
                      <div>
                        <span className="font-medium">Heure:</span>
                        <br />
                        {formatRelativeTime(event.timestamp)}
                      </div>
                      <div>
                        <span className="font-medium">Navigateur:</span>
                        <br />
                        {event.userAgent.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && twoFactorSetup && (
        <div className="max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Authentification à deux facteurs</h2>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  twoFactorSetup.isEnabled ? 'bg-success/10' : 'bg-muted'
                }`}>
                  <Smartphone className={`h-5 w-5 ${
                    twoFactorSetup.isEnabled ? 'text-success' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold">2FA Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorSetup.isEnabled ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
              </div>
              
              <Badge variant={twoFactorSetup.isEnabled ? 'success' : 'error'}>
                {twoFactorSetup.isEnabled ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {twoFactorSetup.isEnabled && (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Méthode:</span>
                  <span className="ml-2 font-medium">
                    {twoFactorSetup.method === 'totp' ? 'Application d\'authentification' :
                     twoFactorSetup.method === 'sms' ? 'SMS' : 'Email'}
                  </span>
                </div>
                
                {twoFactorSetup.lastUsed && (
                  <div>
                    <span className="text-sm text-muted-foreground">Dernière utilisation:</span>
                    <span className="ml-2 font-medium">{formatDate(twoFactorSetup.lastUsed)}</span>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Codes de récupération</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {twoFactorSetup.backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-muted rounded font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Conservez ces codes en lieu sûr. Ils peuvent être utilisés si vous perdez l'accès à votre appareil.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant={twoFactorSetup.isEnabled ? 'outline' : 'default'}>
                {twoFactorSetup.isEnabled ? 'Reconfigurer' : 'Activer'} 2FA
              </Button>
              {twoFactorSetup.isEnabled && (
                <Button variant="outline">
                  Générer nouveaux codes
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Gestion des sessions</h3>
          <p className="text-muted-foreground mb-4">
            Surveillez et gérez les sessions utilisateur actives
          </p>
          <Button variant="outline">Voir les sessions actives</Button>
        </div>
      )}

      {/* Policy Configuration Dialog */}
      <Dialog
        isOpen={isPolicyDialogOpen}
        onClose={() => setIsPolicyDialogOpen(false)}
        title={selectedPolicy ? 'Modifier la politique' : 'Nouvelle politique'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom de la politique</label>
            <Input placeholder="Nom de la politique" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input placeholder="Description de la politique" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie</label>
            <Select
              placeholder="Sélectionner une catégorie"
              options={[
                { value: 'authentication', label: 'Authentification' },
                { value: 'authorization', label: 'Autorisation' },
                { value: 'data', label: 'Données' },
                { value: 'network', label: 'Réseau' },
                { value: 'compliance', label: 'Conformité' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sévérité</label>
            <Select
              placeholder="Sélectionner la sévérité"
              options={[
                { value: 'low', label: 'Faible' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'high', label: 'Élevée' },
                { value: 'critical', label: 'Critique' },
              ]}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsPolicyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsPolicyDialogOpen(false)}>
              {selectedPolicy ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
