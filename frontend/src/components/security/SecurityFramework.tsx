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

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'config_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user: string
  description: string
  timestamp: string
  ipAddress: string
  userAgent: string
  location?: string
  metadata?: Record<string, any>
}

interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  rules: SecurityRule[]
  lastModified: string
  modifiedBy: string
}

interface SecurityRule {
  id: string
  type: 'password' | 'session' | 'access' | 'data' | 'network'
  name: string
  value: any
  enforced: boolean
}

interface TwoFactorSetup {
  enabled: boolean
  method: 'totp' | 'sms' | 'email'
  backupCodes: string[]
  lastUsed?: string
}

export function SecurityFramework() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'events' | 'users' | '2fa'>('overview')
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'failed_login',
        severity: 'high',
        user: 'admin@company.com',
        description: 'Tentative de connexion échouée - mot de passe incorrect',
        timestamp: '2024-01-20T10:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Casablanca, Maroc',
        metadata: { attempts: 3, locked: false }
      },
      {
        id: '2',
        type: 'login',
        severity: 'low',
        user: 'manager@company.com',
        description: 'Connexion réussie',
        timestamp: '2024-01-20T09:15:00Z',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'Rabat, Maroc'
      },
      {
        id: '3',
        type: 'permission_denied',
        severity: 'medium',
        user: 'user@company.com',
        description: 'Accès refusé à la section comptabilité',
        timestamp: '2024-01-20T08:45:00Z',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        location: 'Marrakech, Maroc',
        metadata: { resource: '/accounting/reports', requiredRole: 'accountant' }
      }
    ]

    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Politique de mots de passe',
        description: 'Règles de complexité et de rotation des mots de passe',
        enabled: true,
        lastModified: '2024-01-15T10:00:00Z',
        modifiedBy: 'admin@company.com',
        rules: [
          { id: 'pwd1', type: 'password', name: 'Longueur minimale', value: 12, enforced: true },
          { id: 'pwd2', type: 'password', name: 'Caractères spéciaux requis', value: true, enforced: true },
          { id: 'pwd3', type: 'password', name: 'Rotation (jours)', value: 90, enforced: true },
          { id: 'pwd4', type: 'password', name: 'Historique', value: 5, enforced: true }
        ]
      },
      {
        id: '2',
        name: 'Gestion des sessions',
        description: 'Contrôle de la durée et de la sécurité des sessions',
        enabled: true,
        lastModified: '2024-01-10T14:30:00Z',
        modifiedBy: 'admin@company.com',
        rules: [
          { id: 'sess1', type: 'session', name: 'Timeout inactivité (minutes)', value: 30, enforced: true },
          { id: 'sess2', type: 'session', name: 'Durée maximale (heures)', value: 8, enforced: true },
          { id: 'sess3', type: 'session', name: 'Sessions concurrentes', value: 3, enforced: true }
        ]
      }
    ]

    const mockTwoFactor: TwoFactorSetup = {
      enabled: true,
      method: 'totp',
      backupCodes: ['ABC123', 'DEF456', 'GHI789'],
      lastUsed: '2024-01-20T09:15:00Z'
    }

    setSecurityEvents(mockEvents)
    setSecurityPolicies(mockPolicies)
    setTwoFactorSetup(mockTwoFactor)
  }, [])

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
        return <Database className="h-4 w-4 text-info" />
      case 'config_change':
        return <Settings className="h-4 w-4 text-warning" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
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

  const getSecurityScore = () => {
    const enabledPolicies = securityPolicies.filter(p => p.enabled).length
    const totalPolicies = securityPolicies.length
    const twoFactorBonus = twoFactorSetup?.enabled ? 20 : 0
    const recentIncidents = securityEvents.filter(e => 
      e.severity === 'high' || e.severity === 'critical'
    ).length

    const baseScore = (enabledPolicies / totalPolicies) * 60
    const finalScore = Math.max(0, Math.min(100, baseScore + twoFactorBonus - (recentIncidents * 5)))
    
    return Math.round(finalScore)
  }

  const handleTogglePolicy = (policyId: string) => {
    setSecurityPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled }
        : policy
    ))
  }

  const handleToggle2FA = () => {
    if (twoFactorSetup) {
      setTwoFactorSetup(prev => prev ? { ...prev, enabled: !prev.enabled } : null)
    }
  }

  const securityScore = getSecurityScore()
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-error'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sécurité & Conformité
          </h1>
          <p className="text-muted-foreground">
            Gestion avancée de la sécurité et conformité réglementaire
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score de sécurité</div>
            <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}%
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
            securityScore >= 80 ? 'border-success bg-success/10' :
            securityScore >= 60 ? 'border-warning bg-warning/10' :
            'border-error bg-error/10'
          }`}>
            <Shield className={`h-6 w-6 ${getScoreColor(securityScore)}`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity className="h-4 w-4" /> },
          { id: 'policies', label: 'Politiques', icon: <FileText className="h-4 w-4" /> },
          { id: 'events', label: 'Événements', icon: <Eye className="h-4 w-4" /> },
          { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
          { id: '2fa', label: '2FA', icon: <Smartphone className="h-4 w-4" /> },
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
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Connexions réussies</h3>
                <p className="text-2xl font-bold text-success">1,247</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+12% ce mois</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <XCircle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="font-semibold">Tentatives échouées</h3>
                <p className="text-2xl font-bold text-error">23</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">-8% ce mois</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Alertes sécurité</h3>
                <p className="text-2xl font-bold text-warning">5</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Dernière: il y a 2h</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Sessions actives</h3>
                <p className="text-2xl font-bold text-info">47</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Pic: 52 aujourd'hui</p>
          </Card>

          {/* Recent Security Events */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Événements récents
            </h3>
            <div className="space-y-3">
              {securityEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{event.description}</span>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.user} • {event.ipAddress} • {formatRelativeTime(event.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(event)}
                  >
                    Détails
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Security Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Politiques de sécurité</h3>
            <Button onClick={() => setShowPolicyDialog(true)}>
              Nouvelle politique
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {securityPolicies.map((policy) => (
              <Card key={policy.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-1">{policy.name}</h4>
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={policy.enabled ? 'success' : 'neutral'}>
                      {policy.enabled ? 'Activée' : 'Désactivée'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePolicy(policy.id)}
                    >
                      {policy.enabled ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {policy.rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{rule.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{String(rule.value)}</span>
                        <Checkbox checked={rule.enforced} readOnly />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  Modifiée le {formatDate(policy.lastModified)} par {policy.modifiedBy}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Tab */}
      {activeTab === '2fa' && twoFactorSetup && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentification à deux facteurs</h3>
                <p className="text-muted-foreground">
                  Sécurisez votre compte avec une couche d'authentification supplémentaire
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={twoFactorSetup.enabled ? 'success' : 'warning'}>
                  {twoFactorSetup.enabled ? 'Activée' : 'Désactivée'}
                </Badge>
                <Button onClick={handleToggle2FA}>
                  {twoFactorSetup.enabled ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </div>

            {twoFactorSetup.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Méthode actuelle</h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Smartphone className="h-5 w-5 text-info" />
                      <span className="font-medium">
                        {twoFactorSetup.method === 'totp' ? 'Application d\'authentification' :
                         twoFactorSetup.method === 'sms' ? 'SMS' : 'Email'}
                      </span>
                    </div>
                    {twoFactorSetup.lastUsed && (
                      <p className="text-sm text-muted-foreground">
                        Dernière utilisation: {formatRelativeTime(twoFactorSetup.lastUsed)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Codes de récupération</h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Utilisez ces codes si vous perdez l'accès à votre méthode principale
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {twoFactorSetup.backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-background rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Régénérer les codes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Détails de l'événement de sécurité"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getEventIcon(selectedEvent.type)}
                  <span>{selectedEvent.type}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Sévérité</label>
                <div className="mt-1">{getSeverityBadge(selectedEvent.severity)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <p className="mt-1 text-sm">{selectedEvent.user}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <p className="mt-1 text-sm">{formatDate(selectedEvent.timestamp)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse IP</label>
                <p className="mt-1 text-sm font-mono">{selectedEvent.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Localisation</label>
                <p className="mt-1 text-sm">{selectedEvent.location || 'Non disponible'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">User Agent</label>
              <p className="mt-1 text-xs text-muted-foreground break-all">
                {selectedEvent.userAgent}
              </p>
            </div>

            {selectedEvent.metadata && (
              <div>
                <label className="text-sm font-medium">Métadonnées</label>
                <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  )
}
