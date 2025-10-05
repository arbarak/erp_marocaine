import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Calculator,
  Building,
  CreditCard,
  TrendingUp,
  Calendar,
  Shield,
  Eye,
  Settings,
  Flag,
  Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ComplianceRequirement {
  id: string
  category: 'tax' | 'financial' | 'legal' | 'social' | 'environmental'
  title: string
  description: string
  authority: string
  frequency: 'monthly' | 'quarterly' | 'annually' | 'on_demand'
  nextDueDate: string
  status: 'compliant' | 'warning' | 'overdue' | 'not_applicable'
  lastSubmission?: string
  documents: ComplianceDocument[]
  penalties?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface ComplianceDocument {
  id: string
  name: string
  type: 'declaration' | 'report' | 'certificate' | 'form'
  status: 'draft' | 'ready' | 'submitted' | 'approved' | 'rejected'
  dueDate: string
  submittedDate?: string
  fileUrl?: string
}

interface TaxObligation {
  id: string
  type: 'tva' | 'is' | 'ir' | 'ras_tva' | 'taxe_professionnelle'
  name: string
  rate: number
  period: string
  amount: number
  status: 'calculated' | 'declared' | 'paid'
  dueDate: string
  reference?: string
}

interface FinancialReport {
  id: string
  type: 'bilan' | 'cpc' | 'etic' | 'tableau_financement'
  name: string
  period: string
  status: 'draft' | 'finalized' | 'submitted'
  generatedDate: string
  submissionDate?: string
  fileUrl?: string
}

export function MoroccanComplianceCenter() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'tax' | 'financial' | 'legal' | 'documents'>('overview')
  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirement[]>([])
  const [taxObligations, setTaxObligations] = useState<TaxObligation[]>([])
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([])
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null)
  const [showRequirementDialog, setShowRequirementDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockRequirements: ComplianceRequirement[] = [
      {
        id: '1',
        category: 'tax',
        title: 'Déclaration TVA mensuelle',
        description: 'Déclaration mensuelle de la TVA auprès de la DGI',
        authority: 'Direction Générale des Impôts (DGI)',
        frequency: 'monthly',
        nextDueDate: '2024-02-20T23:59:59Z',
        status: 'warning',
        lastSubmission: '2024-01-18T14:30:00Z',
        priority: 'high',
        penalties: 'Pénalité de 15% + intérêts de retard',
        documents: [
          {
            id: 'doc1',
            name: 'Déclaration TVA Janvier 2024',
            type: 'declaration',
            status: 'ready',
            dueDate: '2024-02-20T23:59:59Z'
          }
        ]
      },
      {
        id: '2',
        category: 'tax',
        title: 'Impôt sur les Sociétés (IS)',
        description: 'Déclaration annuelle de l\'impôt sur les sociétés',
        authority: 'Direction Générale des Impôts (DGI)',
        frequency: 'annually',
        nextDueDate: '2024-03-31T23:59:59Z',
        status: 'compliant',
        lastSubmission: '2023-03-25T10:15:00Z',
        priority: 'critical',
        penalties: 'Pénalité de 25% + intérêts de retard',
        documents: [
          {
            id: 'doc2',
            name: 'Déclaration IS 2023',
            type: 'declaration',
            status: 'submitted',
            dueDate: '2024-03-31T23:59:59Z',
            submittedDate: '2023-03-25T10:15:00Z'
          }
        ]
      },
      {
        id: '3',
        category: 'financial',
        title: 'États de synthèse annuels',
        description: 'Dépôt des états de synthèse au greffe du tribunal de commerce',
        authority: 'Tribunal de Commerce',
        frequency: 'annually',
        nextDueDate: '2024-04-30T23:59:59Z',
        status: 'warning',
        priority: 'high',
        penalties: 'Amende de 1000 à 5000 MAD',
        documents: [
          {
            id: 'doc3',
            name: 'Bilan 2023',
            type: 'report',
            status: 'draft',
            dueDate: '2024-04-30T23:59:59Z'
          }
        ]
      },
      {
        id: '4',
        category: 'social',
        title: 'Déclaration CNSS',
        description: 'Déclaration mensuelle des salaires à la CNSS',
        authority: 'Caisse Nationale de Sécurité Sociale (CNSS)',
        frequency: 'monthly',
        nextDueDate: '2024-02-15T23:59:59Z',
        status: 'compliant',
        lastSubmission: '2024-01-12T09:30:00Z',
        priority: 'medium',
        penalties: 'Pénalité de 2% par mois de retard',
        documents: [
          {
            id: 'doc4',
            name: 'Bordereau CNSS Janvier 2024',
            type: 'declaration',
            status: 'submitted',
            dueDate: '2024-02-15T23:59:59Z',
            submittedDate: '2024-01-12T09:30:00Z'
          }
        ]
      }
    ]

    const mockTaxObligations: TaxObligation[] = [
      {
        id: '1',
        type: 'tva',
        name: 'TVA Janvier 2024',
        rate: 20,
        period: '2024-01',
        amount: 45000,
        status: 'calculated',
        dueDate: '2024-02-20T23:59:59Z'
      },
      {
        id: '2',
        type: 'ras_tva',
        name: 'RAS/TVA Janvier 2024',
        rate: 10,
        period: '2024-01',
        amount: 8500,
        status: 'declared',
        dueDate: '2024-02-20T23:59:59Z',
        reference: 'RAS202401001'
      },
      {
        id: '3',
        type: 'is',
        name: 'Acompte IS T1 2024',
        rate: 31,
        period: '2024-Q1',
        amount: 125000,
        status: 'paid',
        dueDate: '2024-03-31T23:59:59Z',
        reference: 'IS202401001'
      }
    ]

    const mockFinancialReports: FinancialReport[] = [
      {
        id: '1',
        type: 'bilan',
        name: 'Bilan 2023',
        period: '2023',
        status: 'finalized',
        generatedDate: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        type: 'cpc',
        name: 'Compte de Produits et Charges 2023',
        period: '2023',
        status: 'finalized',
        generatedDate: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        type: 'etic',
        name: 'État des Informations Complémentaires 2023',
        period: '2023',
        status: 'draft',
        generatedDate: '2024-01-20T14:30:00Z'
      }
    ]

    setComplianceRequirements(mockRequirements)
    setTaxObligations(mockTaxObligations)
    setFinancialReports(mockFinancialReports)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="success">Conforme</Badge>
      case 'warning':
        return <Badge variant="warning">Attention</Badge>
      case 'overdue':
        return <Badge variant="error">En retard</Badge>
      case 'not_applicable':
        return <Badge variant="neutral">Non applicable</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
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

  const getTaxStatusBadge = (status: string) => {
    switch (status) {
      case 'calculated':
        return <Badge variant="warning">Calculé</Badge>
      case 'declared':
        return <Badge variant="info">Déclaré</Badge>
      case 'paid':
        return <Badge variant="success">Payé</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tax':
        return <Calculator className="h-4 w-4 text-orange-500" />
      case 'financial':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'legal':
        return <Shield className="h-4 w-4 text-purple-500" />
      case 'social':
        return <Building className="h-4 w-4 text-green-500" />
      case 'environmental':
        return <Flag className="h-4 w-4 text-emerald-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTaxTypeIcon = (type: string) => {
    switch (type) {
      case 'tva':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'is':
        return <Building className="h-4 w-4 text-green-500" />
      case 'ir':
        return <Banknote className="h-4 w-4 text-purple-500" />
      case 'ras_tva':
        return <Calculator className="h-4 w-4 text-orange-500" />
      case 'taxe_professionnelle':
        return <FileText className="h-4 w-4 text-red-500" />
      default:
        return <Calculator className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleViewRequirement = (requirement: ComplianceRequirement) => {
    setSelectedRequirement(requirement)
    setShowRequirementDialog(true)
  }

  const handleGenerateReport = (reportType: string) => {
    console.log('Generating report:', reportType)
    // Implementation would generate the specified report
  }

  const handleSubmitDeclaration = (obligationId: string) => {
    console.log('Submitting declaration:', obligationId)
    // Implementation would submit the tax declaration
  }

  const complianceScore = 78 // Mock compliance score
  const overdueCount = complianceRequirements.filter(r => r.status === 'overdue').length
  const warningCount = complianceRequirements.filter(r => r.status === 'warning').length
  const compliantCount = complianceRequirements.filter(r => r.status === 'compliant').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flag className="h-6 w-6" />
            Conformité Maroc
          </h1>
          <p className="text-muted-foreground">
            Gestion de la conformité réglementaire marocaine
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Score de conformité</div>
            <div className={`text-2xl font-bold ${complianceScore >= 80 ? 'text-success' : complianceScore >= 60 ? 'text-warning' : 'text-error'}`}>
              {complianceScore}%
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
            complianceScore >= 80 ? 'border-success bg-success/10' :
            complianceScore >= 60 ? 'border-warning bg-warning/10' :
            'border-error bg-error/10'
          }`}>
            <Shield className={`h-6 w-6 ${complianceScore >= 80 ? 'text-success' : complianceScore >= 60 ? 'text-warning' : 'text-error'}`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: <Shield className="h-4 w-4" /> },
          { id: 'tax', label: 'Fiscal', icon: <Calculator className="h-4 w-4" /> },
          { id: 'financial', label: 'Financier', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'legal', label: 'Juridique', icon: <FileText className="h-4 w-4" /> },
          { id: 'documents', label: 'Documents', icon: <Eye className="h-4 w-4" /> },
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
          {/* Compliance Metrics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Conformes</h3>
                <p className="text-2xl font-bold text-success">{compliantCount}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Obligations respectées</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Attention</h3>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Échéances proches</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <Clock className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="font-semibold">En retard</h3>
                <p className="text-2xl font-bold text-error">{overdueCount}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Actions urgentes</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-info/10 rounded-lg">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Total</h3>
                <p className="text-2xl font-bold text-info">{complianceRequirements.length}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Obligations suivies</p>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Échéances à venir
            </h3>
            <div className="space-y-3">
              {complianceRequirements
                .filter(req => req.status === 'warning' || req.status === 'overdue')
                .slice(0, 5)
                .map((requirement) => (
                <div key={requirement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  {getCategoryIcon(requirement.category)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{requirement.title}</span>
                      {getStatusBadge(requirement.status)}
                      {getPriorityBadge(requirement.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {requirement.authority} • Échéance: {formatDate(requirement.nextDueDate)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewRequirement(requirement)}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tax Tab */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Obligations fiscales</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleGenerateReport('tax_summary')}>
                <Download className="h-4 w-4 mr-2" />
                Rapport fiscal
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {taxObligations.map((obligation) => (
              <Card key={obligation.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTaxTypeIcon(obligation.type)}
                    <div>
                      <h4 className="font-semibold">{obligation.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Taux: {obligation.rate}% • Période: {obligation.period}
                      </p>
                    </div>
                  </div>
                  {getTaxStatusBadge(obligation.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant:</span>
                    <span className="font-medium">{formatCurrency(obligation.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Échéance:</span>
                    <span className="font-medium">{formatDate(obligation.dueDate)}</span>
                  </div>
                  {obligation.reference && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Référence:</span>
                      <span className="font-medium font-mono text-xs">{obligation.reference}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {obligation.status === 'calculated' && (
                    <Button
                      size="sm"
                      onClick={() => handleSubmitDeclaration(obligation.id)}
                    >
                      Déclarer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Détails
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">États financiers</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleGenerateReport('financial_statements')}>
                <Download className="h-4 w-4 mr-2" />
                Générer états
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {financialReports.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-1">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">Période: {report.period}</p>
                  </div>
                  <Badge variant={report.status === 'finalized' ? 'success' : report.status === 'submitted' ? 'info' : 'warning'}>
                    {report.status === 'finalized' ? 'Finalisé' : 
                     report.status === 'submitted' ? 'Soumis' : 'Brouillon'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Généré:</span> {formatDate(report.generatedDate)}
                  </div>
                  {report.submissionDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Soumis:</span> {formatDate(report.submissionDate)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  {report.fileUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Télécharger
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requirement Details Dialog */}
      {selectedRequirement && (
        <Dialog
          isOpen={showRequirementDialog}
          onClose={() => setShowRequirementDialog(false)}
          title="Détails de l'obligation"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <p className="mt-1">{selectedRequirement.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Autorité</label>
                <p className="mt-1">{selectedRequirement.authority}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Fréquence</label>
                <p className="mt-1 capitalize">{selectedRequirement.frequency}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Prochaine échéance</label>
                <p className="mt-1">{formatDate(selectedRequirement.nextDueDate)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1 text-sm">{selectedRequirement.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedRequirement.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Priorité</label>
                <div className="mt-1">{getPriorityBadge(selectedRequirement.priority)}</div>
              </div>
            </div>

            {selectedRequirement.penalties && (
              <div>
                <label className="text-sm font-medium">Pénalités</label>
                <p className="mt-1 text-sm text-error">{selectedRequirement.penalties}</p>
              </div>
            )}

            {/* Documents */}
            <div>
              <label className="text-sm font-medium mb-3 block">Documents associés</label>
              <div className="space-y-2">
                {selectedRequirement.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Type: {doc.type} • Échéance: {formatDate(doc.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.status === 'submitted' ? 'success' : doc.status === 'ready' ? 'info' : 'warning'}>
                        {doc.status === 'submitted' ? 'Soumis' :
                         doc.status === 'ready' ? 'Prêt' :
                         doc.status === 'approved' ? 'Approuvé' :
                         doc.status === 'rejected' ? 'Rejeté' : 'Brouillon'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
