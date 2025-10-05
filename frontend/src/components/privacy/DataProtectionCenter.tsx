import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  FileText,
  User,
  Database,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Info,
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

interface DataSubject {
  id: string
  type: 'customer' | 'employee' | 'supplier' | 'contact'
  name: string
  email: string
  phone?: string
  address?: string
  createdAt: string
  lastUpdated: string
  consentStatus: ConsentStatus
  dataCategories: DataCategory[]
  retentionPeriod: string
  isMinor: boolean
}

interface ConsentStatus {
  marketing: boolean
  analytics: boolean
  functional: boolean
  necessary: boolean
  lastUpdated: string
  ipAddress: string
  userAgent: string
}

interface DataCategory {
  category: string
  description: string
  dataFields: string[]
  purpose: string
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests'
  retentionPeriod: string
  encrypted: boolean
}

interface PrivacyRequest {
  id: string
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  subjectId: string
  subjectName: string
  subjectEmail: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestDate: string
  completionDate?: string
  description: string
  response?: string
  documents?: string[]
}

interface DataBreachIncident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'reported' | 'investigating' | 'contained' | 'resolved'
  reportedAt: string
  affectedRecords: number
  dataTypes: string[]
  notificationRequired: boolean
  notificationSent: boolean
  mitigationSteps: string[]
}

export function DataProtectionCenter() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'requests' | 'breaches' | 'compliance'>('overview')
  const [dataSubjects, setDataSubjects] = useState<DataSubject[]>([])
  const [privacyRequests, setPrivacyRequests] = useState<PrivacyRequest[]>([])
  const [dataBreaches, setDataBreaches] = useState<DataBreachIncident[]>([])
  const [selectedSubject, setSelectedSubject] = useState<DataSubject | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<PrivacyRequest | null>(null)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockSubjects: DataSubject[] = [
      {
        id: '1',
        type: 'customer',
        name: 'Ahmed Benali',
        email: 'ahmed.benali@email.com',
        phone: '+212 6 12 34 56 78',
        address: 'Casablanca, Maroc',
        createdAt: '2024-01-15T10:00:00Z',
        lastUpdated: '2024-01-20T14:30:00Z',
        isMinor: false,
        retentionPeriod: '7 years',
        consentStatus: {
          marketing: true,
          analytics: true,
          functional: true,
          necessary: true,
          lastUpdated: '2024-01-15T10:00:00Z',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        dataCategories: [
          {
            category: 'Identité',
            description: 'Informations personnelles de base',
            dataFields: ['nom', 'prénom', 'email', 'téléphone'],
            purpose: 'Gestion de la relation client',
            legalBasis: 'contract',
            retentionPeriod: '7 years',
            encrypted: true
          },
          {
            category: 'Adresse',
            description: 'Informations de localisation',
            dataFields: ['adresse', 'ville', 'code postal', 'pays'],
            purpose: 'Livraison et facturation',
            legalBasis: 'contract',
            retentionPeriod: '7 years',
            encrypted: true
          }
        ]
      },
      {
        id: '2',
        type: 'employee',
        name: 'Fatima Zahra',
        email: 'fatima.zahra@company.com',
        phone: '+212 6 87 65 43 21',
        createdAt: '2024-01-10T09:00:00Z',
        lastUpdated: '2024-01-18T16:45:00Z',
        isMinor: false,
        retentionPeriod: '10 years',
        consentStatus: {
          marketing: false,
          analytics: true,
          functional: true,
          necessary: true,
          lastUpdated: '2024-01-10T09:00:00Z',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        dataCategories: [
          {
            category: 'Emploi',
            description: 'Informations professionnelles',
            dataFields: ['poste', 'salaire', 'date d\'embauche', 'département'],
            purpose: 'Gestion des ressources humaines',
            legalBasis: 'contract',
            retentionPeriod: '10 years',
            encrypted: true
          }
        ]
      }
    ]

    const mockRequests: PrivacyRequest[] = [
      {
        id: '1',
        type: 'access',
        subjectId: '1',
        subjectName: 'Ahmed Benali',
        subjectEmail: 'ahmed.benali@email.com',
        status: 'completed',
        requestDate: '2024-01-18T10:00:00Z',
        completionDate: '2024-01-20T15:30:00Z',
        description: 'Demande d\'accès aux données personnelles',
        response: 'Données personnelles fournies via export sécurisé',
        documents: ['data_export_ahmed_benali.pdf']
      },
      {
        id: '2',
        type: 'erasure',
        subjectId: '2',
        subjectName: 'Mohamed Alami',
        subjectEmail: 'mohamed.alami@email.com',
        status: 'pending',
        requestDate: '2024-01-19T14:20:00Z',
        description: 'Demande de suppression de toutes les données personnelles'
      }
    ]

    const mockBreaches: DataBreachIncident[] = [
      {
        id: '1',
        title: 'Accès non autorisé à la base de données clients',
        description: 'Tentative d\'accès non autorisé détectée sur la base de données clients',
        severity: 'high',
        status: 'resolved',
        reportedAt: '2024-01-15T08:30:00Z',
        affectedRecords: 0,
        dataTypes: ['emails', 'noms'],
        notificationRequired: false,
        notificationSent: false,
        mitigationSteps: [
          'Changement des mots de passe administrateur',
          'Audit de sécurité complet',
          'Mise à jour des règles de pare-feu'
        ]
      }
    ]

    setDataSubjects(mockSubjects)
    setPrivacyRequests(mockRequests)
    setDataBreaches(mockBreaches)
  }, [])

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      access: 'Accès aux données',
      rectification: 'Rectification',
      erasure: 'Effacement',
      portability: 'Portabilité',
      restriction: 'Limitation',
      objection: 'Opposition'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Terminée</Badge>
      case 'in_progress':
        return <Badge variant="info">En cours</Badge>
      case 'pending':
        return <Badge variant="warning">En attente</Badge>
      case 'rejected':
        return <Badge variant="error">Rejetée</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getBreachSeverityBadge = (severity: string) => {
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

  const getLegalBasisLabel = (basis: string) => {
    const labels = {
      consent: 'Consentement',
      contract: 'Contrat',
      legal_obligation: 'Obligation légale',
      vital_interests: 'Intérêts vitaux',
      public_task: 'Mission d\'intérêt public',
      legitimate_interests: 'Intérêts légitimes'
    }
    return labels[basis as keyof typeof labels] || basis
  }

  const handleViewSubject = (subject: DataSubject) => {
    setSelectedSubject(subject)
    setShowSubjectDialog(true)
  }

  const handleViewRequest = (request: PrivacyRequest) => {
    setSelectedRequest(request)
    setShowRequestDialog(true)
  }

  const handleExportData = (subjectId: string) => {
    console.log('Exporting data for subject:', subjectId)
    // Implementation would generate and download data export
  }

  const handleDeleteData = (subjectId: string) => {
    console.log('Deleting data for subject:', subjectId)
    // Implementation would handle data deletion with proper verification
  }

  const complianceScore = 85 // Mock compliance score

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Protection des données
          </h1>
          <p className="text-muted-foreground">
            Gestion de la conformité RGPD et protection de la vie privée
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score de conformité</div>
            <div className="text-2xl font-bold text-success">{complianceScore}%</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-success bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Shield className="h-4 w-4" /> },
          { id: 'subjects', label: 'Sujets de données', icon: <User className="h-4 w-4" /> },
          { id: 'requests', label: 'Demandes', icon: <FileText className="h-4 w-4" /> },
          { id: 'breaches', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
          { id: 'compliance', label: 'Conformité', icon: <CheckCircle className="h-4 w-4" /> },
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
          {/* Metrics Cards */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <User className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Sujets de données</h3>
                <p className="text-2xl font-bold text-info">{dataSubjects.length}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Personnes enregistrées</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Demandes en cours</h3>
                <p className="text-2xl font-bold text-warning">
                  {privacyRequests.filter(r => r.status === 'pending' || r.status === 'in_progress').length}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">À traiter</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="font-semibold">Incidents</h3>
                <p className="text-2xl font-bold text-error">{dataBreaches.length}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Signalés ce mois</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Lock className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Données chiffrées</h3>
                <p className="text-2xl font-bold text-success">98%</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Taux de chiffrement</p>
          </Card>

          {/* Recent Privacy Requests */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Demandes récentes
            </h3>
            <div className="space-y-3">
              {privacyRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getRequestTypeLabel(request.type)}</span>
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.subjectName} • {formatRelativeTime(request.requestDate)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewRequest(request)}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Data Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sujets de données</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher..." className="w-64" />
              <Select
                placeholder="Type"
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'customer', label: 'Clients' },
                  { value: 'employee', label: 'Employés' },
                  { value: 'supplier', label: 'Fournisseurs' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dataSubjects.map((subject) => (
              <Card key={subject.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-1">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">{subject.email}</p>
                    <Badge variant="outline" className="mt-2">
                      {subject.type}
                    </Badge>
                  </div>
                  {subject.isMinor && (
                    <Badge variant="warning" className="text-xs">Mineur</Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Créé:</span> {formatDate(subject.createdAt)}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Rétention:</span> {subject.retentionPeriod}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Catégories:</span> {subject.dataCategories.length}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSubject(subject)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData(subject.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Demandes de confidentialité</h3>
            <Button>Nouvelle demande</Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Demandeur</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Statut</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {privacyRequests.map((request) => (
                    <tr key={request.id} className="border-b border-border">
                      <td className="p-4">
                        <span className="font-medium">{getRequestTypeLabel(request.type)}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{request.subjectName}</div>
                          <div className="text-sm text-muted-foreground">{request.subjectEmail}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{formatDate(request.requestDate)}</td>
                      <td className="p-4">{getRequestStatusBadge(request.status)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                        >
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Data Subject Details Dialog */}
      {selectedSubject && (
        <Dialog
          isOpen={showSubjectDialog}
          onClose={() => setShowSubjectDialog(false)}
          title="Détails du sujet de données"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <p className="mt-1">{selectedSubject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="mt-1">{selectedSubject.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="mt-1 capitalize">{selectedSubject.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Période de rétention</label>
                <p className="mt-1">{selectedSubject.retentionPeriod}</p>
              </div>
            </div>

            {/* Consent Status */}
            <div>
              <label className="text-sm font-medium mb-3 block">Statut du consentement</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>Marketing</span>
                  <Badge variant={selectedSubject.consentStatus.marketing ? 'success' : 'neutral'}>
                    {selectedSubject.consentStatus.marketing ? 'Accordé' : 'Refusé'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>Analytics</span>
                  <Badge variant={selectedSubject.consentStatus.analytics ? 'success' : 'neutral'}>
                    {selectedSubject.consentStatus.analytics ? 'Accordé' : 'Refusé'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>Fonctionnel</span>
                  <Badge variant={selectedSubject.consentStatus.functional ? 'success' : 'neutral'}>
                    {selectedSubject.consentStatus.functional ? 'Accordé' : 'Refusé'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>Nécessaire</span>
                  <Badge variant={selectedSubject.consentStatus.necessary ? 'success' : 'neutral'}>
                    {selectedSubject.consentStatus.necessary ? 'Accordé' : 'Refusé'}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Dernière mise à jour: {formatDate(selectedSubject.consentStatus.lastUpdated)}
              </p>
            </div>

            {/* Data Categories */}
            <div>
              <label className="text-sm font-medium mb-3 block">Catégories de données</label>
              <div className="space-y-3">
                {selectedSubject.dataCategories.map((category, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.category}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getLegalBasisLabel(category.legalBasis)}</Badge>
                        {category.encrypted && (
                          <Badge variant="success" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Chiffré
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <div className="text-sm">
                      <span className="font-medium">Finalité:</span> {category.purpose}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Champs:</span> {category.dataFields.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rétention:</span> {category.retentionPeriod}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => handleExportData(selectedSubject.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteData(selectedSubject.id)}
                className="text-error hover:text-error"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer les données
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
