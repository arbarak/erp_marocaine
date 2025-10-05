import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Database,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import'
  resource: string
  resourceType: 'product' | 'customer' | 'order' | 'invoice' | 'user' | 'setting' | 'report'
  resourceId?: string
  description: string
  ipAddress: string
  userAgent: string
  changes?: AuditChange[]
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  complianceFlags?: string[]
}

interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  fieldType: 'string' | 'number' | 'boolean' | 'date' | 'object'
}

interface AuditFilter {
  dateRange: string
  userId?: string
  action?: string
  resourceType?: string
  severity?: string
  searchTerm: string
}

export function AuditTrailSystem() {
  const { t } = useTranslation()
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<AuditFilter>({
    dateRange: '7d',
    searchTerm: ''
  })
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Mock audit data
  useEffect(() => {
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-20T10:30:00Z',
        userId: 'user1',
        userName: 'Ahmed Benali',
        userRole: 'admin',
        action: 'update',
        resource: 'Produit HP Pavilion 15',
        resourceType: 'product',
        resourceId: 'prod_001',
        description: 'Modification du prix du produit',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'medium',
        changes: [
          {
            field: 'price',
            oldValue: 5000,
            newValue: 5500,
            fieldType: 'number'
          },
          {
            field: 'description',
            oldValue: 'Ordinateur portable HP',
            newValue: 'Ordinateur portable HP Pavilion 15"',
            fieldType: 'string'
          }
        ],
        complianceFlags: ['PRICE_CHANGE', 'PRODUCT_UPDATE']
      },
      {
        id: '2',
        timestamp: '2024-01-20T09:15:00Z',
        userId: 'user2',
        userName: 'Fatima Zahra',
        userRole: 'manager',
        action: 'create',
        resource: 'Client ACME Corp',
        resourceType: 'customer',
        resourceId: 'cust_001',
        description: 'Création d\'un nouveau client',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        severity: 'low',
        metadata: {
          customerType: 'enterprise',
          creditLimit: 50000,
          paymentTerms: '30 days'
        },
        complianceFlags: ['CUSTOMER_CREATION', 'KYC_REQUIRED']
      },
      {
        id: '3',
        timestamp: '2024-01-20T08:45:00Z',
        userId: 'user3',
        userName: 'Mohamed Alami',
        userRole: 'accountant',
        action: 'delete',
        resource: 'Facture FAC-2024-001',
        resourceType: 'invoice',
        resourceId: 'inv_001',
        description: 'Suppression d\'une facture brouillon',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        severity: 'high',
        changes: [
          {
            field: 'status',
            oldValue: 'draft',
            newValue: 'deleted',
            fieldType: 'string'
          }
        ],
        complianceFlags: ['INVOICE_DELETION', 'FINANCIAL_RECORD']
      },
      {
        id: '4',
        timestamp: '2024-01-19T16:20:00Z',
        userId: 'user1',
        userName: 'Ahmed Benali',
        userRole: 'admin',
        action: 'export',
        resource: 'Rapport des ventes',
        resourceType: 'report',
        description: 'Export du rapport des ventes mensuel',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'medium',
        metadata: {
          reportType: 'sales_monthly',
          format: 'PDF',
          period: '2024-01'
        },
        complianceFlags: ['DATA_EXPORT', 'FINANCIAL_REPORT']
      },
      {
        id: '5',
        timestamp: '2024-01-19T14:00:00Z',
        userId: 'user4',
        userName: 'Youssef Tazi',
        userRole: 'user',
        action: 'login',
        resource: 'Système ERP',
        resourceType: 'user',
        description: 'Connexion au système',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Linux; Android 10)',
        severity: 'low',
        metadata: {
          loginMethod: 'password',
          sessionDuration: '4h 30m'
        }
      }
    ]

    setAuditEntries(mockEntries)
    setFilteredEntries(mockEntries)
  }, [])

  // Filter entries based on current filters
  useEffect(() => {
    let filtered = auditEntries

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const days = parseInt(filters.dateRange.replace('d', ''))
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= cutoffDate
      )
    }

    // User filter
    if (filters.userId) {
      filtered = filtered.filter(entry => entry.userId === filters.userId)
    }

    // Action filter
    if (filters.action) {
      filtered = filtered.filter(entry => entry.action === filters.action)
    }

    // Resource type filter
    if (filters.resourceType) {
      filtered = filtered.filter(entry => entry.resourceType === filters.resourceType)
    }

    // Severity filter
    if (filters.severity) {
      filtered = filtered.filter(entry => entry.severity === filters.severity)
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.resource.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.userName.toLowerCase().includes(searchLower)
      )
    }

    setFilteredEntries(filtered)
    setCurrentPage(1)
  }, [auditEntries, filters])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-success" />
      case 'read':
        return <Eye className="h-4 w-4 text-info" />
      case 'update':
        return <Edit className="h-4 w-4 text-warning" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-error" />
      case 'login':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'logout':
        return <XCircle className="h-4 w-4 text-muted-foreground" />
      case 'export':
        return <Download className="h-4 w-4 text-info" />
      case 'import':
        return <Database className="h-4 w-4 text-info" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Database className="h-4 w-4 text-blue-500" />
      case 'customer':
        return <User className="h-4 w-4 text-green-500" />
      case 'order':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'invoice':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />
      case 'setting':
        return <Settings className="h-4 w-4 text-gray-500" />
      case 'report':
        return <FileText className="h-4 w-4 text-indigo-500" />
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

  const handleFilterChange = (key: keyof AuditFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry)
    setShowDetailsDialog(true)
  }

  const handleExportAudit = () => {
    // Export functionality would be implemented here
    console.log('Exporting audit trail...', filteredEntries)
  }

  const formatChangeValue = (value: any, type: string) => {
    switch (type) {
      case 'date':
        return formatDate(value)
      case 'boolean':
        return value ? 'Oui' : 'Non'
      case 'object':
        return JSON.stringify(value, null, 2)
      default:
        return String(value)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="h-6 w-6" />
            Journal d'audit
          </h1>
          <p className="text-muted-foreground">
            Traçabilité complète des actions utilisateurs et modifications système
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportAudit}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Période</label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange('dateRange', value)}
              options={[
                { value: '1d', label: 'Aujourd\'hui' },
                { value: '7d', label: '7 derniers jours' },
                { value: '30d', label: '30 derniers jours' },
                { value: '90d', label: '3 derniers mois' },
                { value: 'all', label: 'Toutes les dates' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Action</label>
            <Select
              value={filters.action || ''}
              onValueChange={(value) => handleFilterChange('action', value)}
              options={[
                { value: '', label: 'Toutes les actions' },
                { value: 'create', label: 'Création' },
                { value: 'read', label: 'Lecture' },
                { value: 'update', label: 'Modification' },
                { value: 'delete', label: 'Suppression' },
                { value: 'login', label: 'Connexion' },
                { value: 'logout', label: 'Déconnexion' },
                { value: 'export', label: 'Export' },
                { value: 'import', label: 'Import' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type de ressource</label>
            <Select
              value={filters.resourceType || ''}
              onValueChange={(value) => handleFilterChange('resourceType', value)}
              options={[
                { value: '', label: 'Tous les types' },
                { value: 'product', label: 'Produits' },
                { value: 'customer', label: 'Clients' },
                { value: 'order', label: 'Commandes' },
                { value: 'invoice', label: 'Factures' },
                { value: 'user', label: 'Utilisateurs' },
                { value: 'setting', label: 'Paramètres' },
                { value: 'report', label: 'Rapports' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sévérité</label>
            <Select
              value={filters.severity || ''}
              onValueChange={(value) => handleFilterChange('severity', value)}
              options={[
                { value: '', label: 'Toutes les sévérités' },
                { value: 'low', label: 'Faible' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'high', label: 'Élevée' },
                { value: 'critical', label: 'Critique' },
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher dans les entrées d'audit..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredEntries.length} entrée{filteredEntries.length !== 1 ? 's' : ''} trouvée{filteredEntries.length !== 1 ? 's' : ''}
        </p>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Audit Entries Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : currentEntries.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune entrée trouvée</h3>
            <p className="text-muted-foreground">
              Aucune entrée d'audit ne correspond aux critères de recherche
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">Date/Heure</th>
                  <th className="text-left p-4">Utilisateur</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Ressource</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Sévérité</th>
                  <th className="text-left p-4">IP</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/25">
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatDate(entry.timestamp)}</div>
                        <div className="text-muted-foreground">
                          {formatRelativeTime(entry.timestamp)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{entry.userName}</div>
                        <div className="text-muted-foreground">{entry.userRole}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <span className="text-sm capitalize">{entry.action}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{entry.resource}</div>
                        <div className="text-muted-foreground">{entry.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getResourceTypeIcon(entry.resourceType)}
                        <span className="text-sm capitalize">{entry.resourceType}</span>
                      </div>
                    </td>
                    <td className="p-4">{getSeverityBadge(entry.severity)}</td>
                    <td className="p-4">
                      <span className="text-sm font-mono">{entry.ipAddress}</span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(entry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details Dialog */}
      {selectedEntry && (
        <Dialog
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          title="Détails de l'entrée d'audit"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date/Heure</label>
                <p className="mt-1 text-sm">{formatDate(selectedEntry.timestamp)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Utilisateur</label>
                <p className="mt-1 text-sm">{selectedEntry.userName} ({selectedEntry.userRole})</p>
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <div className="mt-1 flex items-center gap-2">
                  {getActionIcon(selectedEntry.action)}
                  <span className="text-sm capitalize">{selectedEntry.action}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Sévérité</label>
                <div className="mt-1">{getSeverityBadge(selectedEntry.severity)}</div>
              </div>
            </div>

            {/* Resource Information */}
            <div>
              <label className="text-sm font-medium">Ressource</label>
              <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getResourceTypeIcon(selectedEntry.resourceType)}
                  <span className="font-medium">{selectedEntry.resource}</span>
                  <Badge variant="outline">{selectedEntry.resourceType}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEntry.description}</p>
                {selectedEntry.resourceId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {selectedEntry.resourceId}
                  </p>
                )}
              </div>
            </div>

            {/* Changes */}
            {selectedEntry.changes && selectedEntry.changes.length > 0 && (
              <div>
                <label className="text-sm font-medium">Modifications</label>
                <div className="mt-1 space-y-2">
                  {selectedEntry.changes.map((change, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm mb-2">{change.field}</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Ancienne valeur:</span>
                          <div className="mt-1 p-2 bg-error/10 rounded border-l-2 border-error">
                            {formatChangeValue(change.oldValue, change.fieldType)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nouvelle valeur:</span>
                          <div className="mt-1 p-2 bg-success/10 rounded border-l-2 border-success">
                            {formatChangeValue(change.newValue, change.fieldType)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse IP</label>
                <p className="mt-1 text-sm font-mono">{selectedEntry.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium">User Agent</label>
                <p className="mt-1 text-xs text-muted-foreground break-all">
                  {selectedEntry.userAgent}
                </p>
              </div>
            </div>

            {/* Compliance Flags */}
            {selectedEntry.complianceFlags && selectedEntry.complianceFlags.length > 0 && (
              <div>
                <label className="text-sm font-medium">Indicateurs de conformité</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedEntry.complianceFlags.map((flag, index) => (
                    <Badge key={index} variant="info" className="text-xs">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
              <div>
                <label className="text-sm font-medium">Métadonnées</label>
                <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(selectedEntry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  )
}
