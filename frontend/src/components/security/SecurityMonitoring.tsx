import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  AlertTriangle,
  Activity,
  Eye,
  Lock,
  Zap,
  Globe,
  Server,
  Database,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface SecurityAlert {
  id: string
  type: 'intrusion' | 'malware' | 'data_breach' | 'unauthorized_access' | 'suspicious_activity' | 'system_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  source: string
  status: 'active' | 'investigating' | 'resolved' | 'false_positive'
  affectedSystems: string[]
  indicators: ThreatIndicator[]
  responseActions: ResponseAction[]
  assignedTo?: string
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email'
  value: string
  confidence: number
  source: string
}

interface ResponseAction {
  id: string
  action: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
  performedBy?: string
}

interface SecurityMetric {
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  unit: string
  icon: React.ReactNode
  color: string
}

interface SystemHealth {
  component: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  uptime: number
  lastCheck: string
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

export function SecurityMonitoring() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'threats' | 'health' | 'incidents'>('dashboard')
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  // Mock data initialization
  useEffect(() => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'unauthorized_access',
        severity: 'high',
        title: 'Tentatives de connexion suspectes',
        description: 'Multiples tentatives de connexion échouées depuis une adresse IP externe',
        timestamp: '2024-01-20T10:30:00Z',
        source: 'Authentication System',
        status: 'active',
        affectedSystems: ['Web Application', 'Database'],
        indicators: [
          {
            type: 'ip',
            value: '203.0.113.45',
            confidence: 85,
            source: 'Firewall Logs'
          }
        ],
        responseActions: [
          {
            id: 'action1',
            action: 'Bloquer l\'adresse IP',
            status: 'completed',
            timestamp: '2024-01-20T10:35:00Z',
            performedBy: 'Security Team'
          },
          {
            id: 'action2',
            action: 'Analyser les logs d\'accès',
            status: 'pending',
            timestamp: '2024-01-20T10:40:00Z'
          }
        ]
      },
      {
        id: '2',
        type: 'system_anomaly',
        severity: 'medium',
        title: 'Pic d\'utilisation CPU anormal',
        description: 'Utilisation CPU inhabituelle détectée sur le serveur de base de données',
        timestamp: '2024-01-20T09:15:00Z',
        source: 'System Monitor',
        status: 'investigating',
        affectedSystems: ['Database Server'],
        indicators: [
          {
            type: 'hash',
            value: 'a1b2c3d4e5f6',
            confidence: 70,
            source: 'Process Monitor'
          }
        ],
        responseActions: [
          {
            id: 'action3',
            action: 'Analyser les processus actifs',
            status: 'completed',
            timestamp: '2024-01-20T09:20:00Z',
            performedBy: 'IT Team'
          }
        ],
        assignedTo: 'admin@company.com'
      },
      {
        id: '3',
        type: 'suspicious_activity',
        severity: 'low',
        title: 'Accès inhabituel aux données',
        description: 'Accès aux données clients en dehors des heures normales',
        timestamp: '2024-01-19T23:45:00Z',
        source: 'Data Access Monitor',
        status: 'resolved',
        affectedSystems: ['Customer Database'],
        indicators: [],
        responseActions: [
          {
            id: 'action4',
            action: 'Vérifier l\'autorisation d\'accès',
            status: 'completed',
            timestamp: '2024-01-20T08:00:00Z',
            performedBy: 'Security Team'
          }
        ]
      }
    ]

    const mockSystemHealth: SystemHealth[] = [
      {
        component: 'Web Server',
        status: 'healthy',
        uptime: 99.8,
        lastCheck: '2024-01-20T10:30:00Z',
        metrics: {
          cpu: 45,
          memory: 62,
          disk: 78,
          network: 23
        }
      },
      {
        component: 'Database Server',
        status: 'warning',
        uptime: 99.2,
        lastCheck: '2024-01-20T10:30:00Z',
        metrics: {
          cpu: 85,
          memory: 78,
          disk: 65,
          network: 45
        }
      },
      {
        component: 'Authentication Service',
        status: 'healthy',
        uptime: 99.9,
        lastCheck: '2024-01-20T10:30:00Z',
        metrics: {
          cpu: 25,
          memory: 45,
          disk: 32,
          network: 18
        }
      },
      {
        component: 'File Storage',
        status: 'critical',
        uptime: 95.5,
        lastCheck: '2024-01-20T10:30:00Z',
        metrics: {
          cpu: 15,
          memory: 35,
          disk: 95,
          network: 12
        }
      }
    ]

    setSecurityAlerts(mockAlerts)
    setSystemHealth(mockSystemHealth)
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate real-time updates
      console.log('Refreshing security data...')
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'intrusion':
        return <Shield className="h-4 w-4 text-error" />
      case 'malware':
        return <Zap className="h-4 w-4 text-error" />
      case 'data_breach':
        return <Database className="h-4 w-4 text-error" />
      case 'unauthorized_access':
        return <Lock className="h-4 w-4 text-warning" />
      case 'suspicious_activity':
        return <Eye className="h-4 w-4 text-info" />
      case 'system_anomaly':
        return <Activity className="h-4 w-4 text-warning" />
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="error">Actif</Badge>
      case 'investigating':
        return <Badge variant="warning">Investigation</Badge>
      case 'resolved':
        return <Badge variant="success">Résolu</Badge>
      case 'false_positive':
        return <Badge variant="neutral">Faux positif</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Sain</Badge>
      case 'warning':
        return <Badge variant="warning">Attention</Badge>
      case 'critical':
        return <Badge variant="error">Critique</Badge>
      case 'offline':
        return <Badge variant="neutral">Hors ligne</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getMetricColor = (value: number, type: string) => {
    if (type === 'disk' && value > 90) return 'text-error'
    if (type === 'cpu' && value > 80) return 'text-error'
    if (type === 'memory' && value > 85) return 'text-error'
    if (value > 70) return 'text-warning'
    return 'text-success'
  }

  const handleViewAlert = (alert: SecurityAlert) => {
    setSelectedAlert(alert)
    setShowAlertDialog(true)
  }

  const handleResolveAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ))
  }

  const handleAssignAlert = (alertId: string, assignee: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, assignedTo: assignee } : alert
    ))
  }

  const securityMetrics: SecurityMetric[] = [
    {
      name: 'Alertes actives',
      value: securityAlerts.filter(a => a.status === 'active').length,
      change: -2,
      changeType: 'decrease',
      unit: '',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'error'
    },
    {
      name: 'Tentatives d\'intrusion',
      value: 15,
      change: 5,
      changeType: 'increase',
      unit: '/jour',
      icon: <Shield className="h-5 w-5" />,
      color: 'warning'
    },
    {
      name: 'Systèmes surveillés',
      value: systemHealth.length,
      change: 0,
      changeType: 'increase',
      unit: '',
      icon: <Server className="h-5 w-5" />,
      color: 'info'
    },
    {
      name: 'Disponibilité moyenne',
      value: 99.2,
      change: 0.3,
      changeType: 'increase',
      unit: '%',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'success'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Surveillance sécurité
          </h1>
          <p className="text-muted-foreground">
            Monitoring en temps réel et détection des menaces
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(parseInt(value))}
            options={[
              { value: '10', label: '10s' },
              { value: '30', label: '30s' },
              { value: '60', label: '1m' },
              { value: '300', label: '5m' },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'dashboard', label: 'Tableau de bord', icon: <Activity className="h-4 w-4" /> },
          { id: 'alerts', label: 'Alertes', icon: <Bell className="h-4 w-4" /> },
          { id: 'threats', label: 'Menaces', icon: <Shield className="h-4 w-4" /> },
          { id: 'health', label: 'Santé système', icon: <Server className="h-4 w-4" /> },
          { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Security Metrics */}
          {securityMetrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${metric.color}/10 rounded-lg`}>
                  <div className={`text-${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{metric.name}</h3>
                  <p className={`text-2xl font-bold text-${metric.color}`}>
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-error" />
                )}
                <span className={metric.changeType === 'increase' ? 'text-success' : 'text-error'}>
                  {Math.abs(metric.change)}
                </span>
                <span className="text-muted-foreground">vs hier</span>
              </div>
            </Card>
          ))}

          {/* Recent Alerts */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertes récentes
            </h3>
            <div className="space-y-3">
              {securityAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{alert.title}</span>
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.source} • {formatRelativeTime(alert.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAlert(alert)}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alertes de sécurité</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Sévérité"
                options={[
                  { value: 'all', label: 'Toutes' },
                  { value: 'critical', label: 'Critique' },
                  { value: 'high', label: 'Élevée' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'low', label: 'Faible' },
                ]}
              />
              <Select
                placeholder="Statut"
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'active', label: 'Actif' },
                  { value: 'investigating', label: 'Investigation' },
                  { value: 'resolved', label: 'Résolu' },
                ]}
              />
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Titre</th>
                    <th className="text-left p-4">Sévérité</th>
                    <th className="text-left p-4">Statut</th>
                    <th className="text-left p-4">Source</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Assigné à</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {securityAlerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-border hover:bg-muted/25">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <span className="text-sm capitalize">{alert.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {alert.description}
                        </div>
                      </td>
                      <td className="p-4">{getSeverityBadge(alert.severity)}</td>
                      <td className="p-4">{getStatusBadge(alert.status)}</td>
                      <td className="p-4 text-sm">{alert.source}</td>
                      <td className="p-4 text-sm">{formatDate(alert.timestamp)}</td>
                      <td className="p-4 text-sm">{alert.assignedTo || 'Non assigné'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAlert(alert)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {alert.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Santé des systèmes</h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {systemHealth.map((system, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-info" />
                    <div>
                      <h4 className="font-semibold">{system.component}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uptime: {system.uptime}%
                      </p>
                    </div>
                  </div>
                  {getHealthStatusBadge(system.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">CPU</span>
                      <span className={`text-sm font-medium ${getMetricColor(system.metrics.cpu, 'cpu')}`}>
                        {system.metrics.cpu}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          system.metrics.cpu > 80 ? 'bg-error' :
                          system.metrics.cpu > 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${system.metrics.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Mémoire</span>
                      <span className={`text-sm font-medium ${getMetricColor(system.metrics.memory, 'memory')}`}>
                        {system.metrics.memory}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          system.metrics.memory > 85 ? 'bg-error' :
                          system.metrics.memory > 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${system.metrics.memory}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Disque</span>
                      <span className={`text-sm font-medium ${getMetricColor(system.metrics.disk, 'disk')}`}>
                        {system.metrics.disk}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          system.metrics.disk > 90 ? 'bg-error' :
                          system.metrics.disk > 70 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${system.metrics.disk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Réseau</span>
                      <span className={`text-sm font-medium ${getMetricColor(system.metrics.network, 'network')}`}>
                        {system.metrics.network}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-info"
                        style={{ width: `${system.metrics.network}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Dernière vérification: {formatRelativeTime(system.lastCheck)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alert Details Dialog */}
      {selectedAlert && (
        <Dialog
          isOpen={showAlertDialog}
          onClose={() => setShowAlertDialog(false)}
          title="Détails de l'alerte de sécurité"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getAlertIcon(selectedAlert.type)}
                  <span className="capitalize">{selectedAlert.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Sévérité</label>
                <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Source</label>
                <p className="mt-1 text-sm">{selectedAlert.source}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedAlert.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Systèmes affectés</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedAlert.affectedSystems.map((system, index) => (
                  <Badge key={index} variant="outline">{system}</Badge>
                ))}
              </div>
            </div>

            {/* Threat Indicators */}
            {selectedAlert.indicators.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-3 block">Indicateurs de menace</label>
                <div className="space-y-2">
                  {selectedAlert.indicators.map((indicator, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm capitalize">{indicator.type}</span>
                        <Badge variant="info">{indicator.confidence}% confiance</Badge>
                      </div>
                      <div className="text-sm font-mono">{indicator.value}</div>
                      <div className="text-xs text-muted-foreground">Source: {indicator.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Actions */}
            <div>
              <label className="text-sm font-medium mb-3 block">Actions de réponse</label>
              <div className="space-y-2">
                {selectedAlert.responseActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{action.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(action.timestamp)}
                        {action.performedBy && ` • Par ${action.performedBy}`}
                      </div>
                    </div>
                    <Badge variant={
                      action.status === 'completed' ? 'success' :
                      action.status === 'failed' ? 'error' : 'warning'
                    }>
                      {action.status === 'completed' ? 'Terminé' :
                       action.status === 'failed' ? 'Échec' : 'En cours'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assigné à</label>
                <p className="mt-1 text-sm">{selectedAlert.assignedTo || 'Non assigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Date de création</label>
                <p className="mt-1 text-sm">{formatDate(selectedAlert.timestamp)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {selectedAlert.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleAssignAlert(selectedAlert.id, 'admin@company.com')}
                  >
                    Assigner
                  </Button>
                  <Button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id)
                      setShowAlertDialog(false)
                    }}
                  >
                    Marquer comme résolu
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
