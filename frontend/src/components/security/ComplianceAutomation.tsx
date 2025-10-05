// Compliance Automation Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Clock, FileText,
  Award, Target, Eye, Settings, RefreshCw, Plus, Download,
  BarChart3, Activity, Users, Database, Lock, Key, Zap,
  Calendar, Search, Filter, Archive, BookOpen, Gavel
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'regulatory' | 'industry' | 'internal' | 'international';
  status: 'active' | 'inactive' | 'deprecated' | 'draft';
  requirements: ComplianceRequirement[];
  assessments: ComplianceAssessment[];
  compliance: {
    overall: number;
    lastAssessment: string;
    nextAssessment: string;
    trend: 'improving' | 'stable' | 'declining';
  };
  scope: string[];
  owner: string;
  auditor: string;
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed';
  controls: ComplianceControl[];
  evidence: Evidence[];
  gaps: ComplianceGap[];
  lastReview: string;
  nextReview: string;
  owner: string;
}

interface ComplianceControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  implementation: 'manual' | 'automated' | 'hybrid';
  effectiveness: number;
  status: 'implemented' | 'planned' | 'in_progress' | 'not_implemented';
  testing: {
    frequency: string;
    lastTest: string;
    nextTest: string;
    result: 'passed' | 'failed' | 'partial' | 'not_tested';
  };
  automation: {
    enabled: boolean;
    tool: string;
    schedule: string;
    lastRun?: string;
  };
  metrics: ControlMetric[];
}

interface ControlMetric {
  timestamp: string;
  effectiveness: number;
  incidents: number;
  violations: number;
  cost: number;
}

interface Evidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'report' | 'policy';
  name: string;
  description: string;
  url: string;
  hash: string;
  collectedAt: string;
  collectedBy: string;
  retention: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

interface ComplianceGap {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  remediation: RemediationPlan;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  identifiedAt: string;
  targetDate: string;
  owner: string;
}

interface RemediationPlan {
  actions: RemediationAction[];
  timeline: string;
  budget: number;
  resources: string[];
  dependencies: string[];
}

interface RemediationAction {
  id: string;
  description: string;
  type: 'policy' | 'technical' | 'process' | 'training';
  priority: number;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  progress: number;
}

interface ComplianceAssessment {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'self' | 'third_party';
  scope: string[];
  assessor: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  findings: AssessmentFinding[];
  score: number;
  recommendations: string[];
  report: {
    url: string;
    summary: string;
    executiveSummary: string;
  };
}

interface AssessmentFinding {
  id: string;
  requirement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  dueDate: string;
  assignee: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: 'iso' | 'soc' | 'pci' | 'hipaa' | 'gdpr' | 'custom';
  status: 'valid' | 'expired' | 'suspended' | 'pending';
  issuedDate: string;
  expiryDate: string;
  scope: string;
  certificate: {
    number: string;
    url: string;
    hash: string;
  };
  auditor: string;
  nextAudit: string;
}

interface PolicyDocument {
  id: string;
  name: string;
  version: string;
  type: 'policy' | 'procedure' | 'standard' | 'guideline';
  category: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
  content: string;
  owner: string;
  approver: string;
  reviewers: string[];
  effectiveDate: string;
  reviewDate: string;
  nextReview: string;
  compliance: {
    frameworks: string[];
    requirements: string[];
  };
  distribution: {
    scope: 'all' | 'department' | 'role' | 'custom';
    recipients: string[];
    acknowledgment: boolean;
  };
  metrics: {
    views: number;
    acknowledgments: number;
    violations: number;
  };
}

interface AuditTrail {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: any;
  ip: string;
  userAgent: string;
  result: 'success' | 'failure' | 'warning';
  compliance: {
    frameworks: string[];
    retention: string;
    classification: string;
  };
}

const ComplianceAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('frameworks');
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [policyDocuments, setPolicyDocuments] = useState<PolicyDocument[]>([]);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock compliance frameworks
  const mockComplianceFrameworks: ComplianceFramework[] = [
    {
      id: 'iso27001',
      name: 'ISO 27001:2022',
      version: '2022',
      description: 'Système de management de la sécurité de l\'information',
      type: 'international',
      status: 'active',
      requirements: [
        {
          id: 'iso_5_1',
          code: '5.1',
          title: 'Politiques de sécurité de l\'information',
          description: 'L\'organisation doit établir des politiques de sécurité de l\'information',
          category: 'Politique',
          priority: 'high',
          status: 'compliant',
          controls: [
            {
              id: 'ctrl_5_1_1',
              name: 'Politique de sécurité documentée',
              type: 'preventive',
              implementation: 'manual',
              effectiveness: 95,
              status: 'implemented',
              testing: {
                frequency: 'annually',
                lastTest: '2024-06-15T00:00:00Z',
                nextTest: '2025-06-15T00:00:00Z',
                result: 'passed'
              },
              automation: {
                enabled: false,
                tool: '',
                schedule: ''
              },
              metrics: [
                { timestamp: '2024-12-01T00:00:00Z', effectiveness: 95, incidents: 0, violations: 0, cost: 5000 },
                { timestamp: '2024-11-01T00:00:00Z', effectiveness: 93, incidents: 1, violations: 0, cost: 5200 }
              ]
            }
          ],
          evidence: [
            {
              id: 'ev_001',
              type: 'document',
              name: 'Politique de Sécurité v2.1',
              description: 'Document officiel de la politique de sécurité',
              url: '/documents/security-policy-v2.1.pdf',
              hash: 'sha256:abc123...',
              collectedAt: '2024-12-01T10:00:00Z',
              collectedBy: 'compliance@company.com',
              retention: '7 years',
              classification: 'internal'
            }
          ],
          gaps: [],
          lastReview: '2024-12-01T00:00:00Z',
          nextReview: '2025-06-01T00:00:00Z',
          owner: 'security@company.com'
        }
      ],
      assessments: [
        {
          id: 'assess_001',
          name: 'Audit ISO 27001 Annuel 2024',
          type: 'external',
          scope: ['all_systems', 'all_processes'],
          assessor: 'Bureau Veritas',
          status: 'completed',
          startDate: '2024-10-01T00:00:00Z',
          endDate: '2024-10-15T00:00:00Z',
          findings: [
            {
              id: 'find_001',
              requirement: '5.1',
              severity: 'low',
              description: 'Politique de sécurité nécessite une mise à jour mineure',
              evidence: ['policy_review.pdf'],
              recommendation: 'Mettre à jour la politique avec les dernières pratiques',
              status: 'in_progress',
              dueDate: '2025-01-15T00:00:00Z',
              assignee: 'security@company.com'
            }
          ],
          score: 92,
          recommendations: [
            'Améliorer la formation de sensibilisation',
            'Renforcer les contrôles d\'accès'
          ],
          report: {
            url: '/reports/iso27001-audit-2024.pdf',
            summary: 'Audit réussi avec quelques améliorations mineures',
            executiveSummary: 'L\'organisation maintient un niveau élevé de conformité ISO 27001'
          }
        }
      ],
      compliance: {
        overall: 92,
        lastAssessment: '2024-10-15T00:00:00Z',
        nextAssessment: '2025-10-01T00:00:00Z',
        trend: 'improving'
      },
      scope: ['all_systems', 'all_data', 'all_processes'],
      owner: 'security@company.com',
      auditor: 'Bureau Veritas',
      certifications: [
        {
          id: 'cert_iso_001',
          name: 'ISO 27001:2022 Certificate',
          issuer: 'Bureau Veritas',
          type: 'iso',
          status: 'valid',
          issuedDate: '2024-11-01T00:00:00Z',
          expiryDate: '2027-11-01T00:00:00Z',
          scope: 'Information Security Management System',
          certificate: {
            number: 'ISO-27001-2024-001',
            url: '/certificates/iso27001-cert.pdf',
            hash: 'sha256:def456...'
          },
          auditor: 'Bureau Veritas',
          nextAudit: '2025-11-01T00:00:00Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z'
    },
    {
      id: 'gdpr',
      name: 'RGPD/GDPR',
      version: '2018',
      description: 'Règlement Général sur la Protection des Données',
      type: 'regulatory',
      status: 'active',
      requirements: [
        {
          id: 'gdpr_art_32',
          code: 'Article 32',
          title: 'Sécurité du traitement',
          description: 'Mesures techniques et organisationnelles appropriées pour assurer la sécurité',
          category: 'Sécurité',
          priority: 'critical',
          status: 'compliant',
          controls: [
            {
              id: 'ctrl_gdpr_32_1',
              name: 'Chiffrement des données personnelles',
              type: 'preventive',
              implementation: 'automated',
              effectiveness: 98,
              status: 'implemented',
              testing: {
                frequency: 'monthly',
                lastTest: '2024-12-01T00:00:00Z',
                nextTest: '2025-01-01T00:00:00Z',
                result: 'passed'
              },
              automation: {
                enabled: true,
                tool: 'Encryption Service',
                schedule: 'continuous',
                lastRun: '2024-12-20T15:30:00Z'
              },
              metrics: [
                { timestamp: '2024-12-01T00:00:00Z', effectiveness: 98, incidents: 0, violations: 0, cost: 15000 },
                { timestamp: '2024-11-01T00:00:00Z', effectiveness: 97, incidents: 0, violations: 0, cost: 14800 }
              ]
            }
          ],
          evidence: [
            {
              id: 'ev_gdpr_001',
              type: 'report',
              name: 'Rapport de Chiffrement',
              description: 'Rapport automatique sur l\'état du chiffrement',
              url: '/reports/encryption-status.json',
              hash: 'sha256:ghi789...',
              collectedAt: '2024-12-20T15:30:00Z',
              collectedBy: 'system',
              retention: '3 years',
              classification: 'confidential'
            }
          ],
          gaps: [],
          lastReview: '2024-12-01T00:00:00Z',
          nextReview: '2025-03-01T00:00:00Z',
          owner: 'dpo@company.com'
        }
      ],
      assessments: [],
      compliance: {
        overall: 96,
        lastAssessment: '2024-09-01T00:00:00Z',
        nextAssessment: '2025-03-01T00:00:00Z',
        trend: 'stable'
      },
      scope: ['personal_data', 'data_processing'],
      owner: 'dpo@company.com',
      auditor: 'CNIL',
      certifications: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z'
    }
  ];

  // Mock policy documents
  const mockPolicyDocuments: PolicyDocument[] = [
    {
      id: 'policy_001',
      name: 'Politique de Sécurité de l\'Information',
      version: '2.1',
      type: 'policy',
      category: 'Sécurité',
      status: 'published',
      content: 'Cette politique définit les principes et règles de sécurité...',
      owner: 'security@company.com',
      approver: 'ciso@company.com',
      reviewers: ['legal@company.com', 'hr@company.com'],
      effectiveDate: '2024-01-01T00:00:00Z',
      reviewDate: '2024-12-01T00:00:00Z',
      nextReview: '2025-06-01T00:00:00Z',
      compliance: {
        frameworks: ['iso27001', 'gdpr'],
        requirements: ['5.1', 'Article 32']
      },
      distribution: {
        scope: 'all',
        recipients: [],
        acknowledgment: true
      },
      metrics: {
        views: 1250,
        acknowledgments: 1180,
        violations: 3
      }
    },
    {
      id: 'policy_002',
      name: 'Procédure de Gestion des Incidents',
      version: '1.3',
      type: 'procedure',
      category: 'Incident Response',
      status: 'published',
      content: 'Cette procédure décrit les étapes de gestion des incidents...',
      owner: 'security@company.com',
      approver: 'ciso@company.com',
      reviewers: ['it@company.com'],
      effectiveDate: '2024-06-01T00:00:00Z',
      reviewDate: '2024-11-15T00:00:00Z',
      nextReview: '2025-05-01T00:00:00Z',
      compliance: {
        frameworks: ['iso27001'],
        requirements: ['16.1']
      },
      distribution: {
        scope: 'department',
        recipients: ['security_team', 'it_team'],
        acknowledgment: true
      },
      metrics: {
        views: 450,
        acknowledgments: 425,
        violations: 1
      }
    }
  ];

  // Mock audit trails
  const mockAuditTrails: AuditTrail[] = [
    {
      id: 'audit_001',
      timestamp: '2024-12-20T15:30:00Z',
      user: 'jean.dupont@company.com',
      action: 'ACCESS_CUSTOMER_DATA',
      resource: '/api/customers/12345',
      details: { customer_id: '12345', fields: ['name', 'email'] },
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      result: 'success',
      compliance: {
        frameworks: ['gdpr'],
        retention: '3 years',
        classification: 'confidential'
      }
    },
    {
      id: 'audit_002',
      timestamp: '2024-12-20T15:25:00Z',
      user: 'marie.martin@company.com',
      action: 'POLICY_ACKNOWLEDGMENT',
      resource: 'policy_001',
      details: { policy: 'Politique de Sécurité v2.1', version: '2.1' },
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0...',
      result: 'success',
      compliance: {
        frameworks: ['iso27001'],
        retention: '7 years',
        classification: 'internal'
      }
    }
  ];

  useEffect(() => {
    setComplianceFrameworks(mockComplianceFrameworks);
    setPolicyDocuments(mockPolicyDocuments);
    setAuditTrails(mockAuditTrails);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'published': return 'text-green-600 bg-green-50';
      case 'implemented': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'passed': return 'text-green-600 bg-green-50';
      case 'valid': return 'text-green-600 bg-green-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'open': return 'text-red-600 bg-red-50';
      case 'failure': return 'text-red-600 bg-red-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'planned': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      case 'not_assessed': return 'text-gray-600 bg-gray-50';
      case 'not_implemented': return 'text-gray-600 bg-gray-50';
      case 'not_tested': return 'text-gray-600 bg-gray-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      case 'deprecated': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderFrameworkCard = (framework: ComplianceFramework) => {
    const compliantRequirements = framework.requirements.filter(r => r.status === 'compliant').length;
    const totalRequirements = framework.requirements.length;
    const complianceRate = totalRequirements > 0 ? (compliantRequirements / totalRequirements) * 100 : 0;

    return (
      <Card key={framework.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                <CardDescription className="text-sm">
                  {framework.type} • {framework.requirements.length} exigences
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(framework.status)}>
                {framework.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{framework.description}</p>
            
            {/* Compliance Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité Globale:</span>
                <span className={`font-medium ${framework.compliance.overall > 90 ? 'text-green-600' : framework.compliance.overall > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {framework.compliance.overall}%
                </span>
              </div>
              <Progress value={framework.compliance.overall} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{compliantRequirements}/{totalRequirements} exigences conformes</span>
                <span className={getTrendColor(framework.compliance.trend)}>
                  {framework.compliance.trend === 'improving' ? '↗' : framework.compliance.trend === 'declining' ? '↘' : '→'} {framework.compliance.trend}
                </span>
              </div>
            </div>

            {/* Requirements Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{framework.requirements.filter(r => r.status === 'compliant').length}</div>
                <div className="text-gray-500">Conformes</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">{framework.requirements.filter(r => r.status === 'partial').length}</div>
                <div className="text-gray-500">Partielles</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{framework.requirements.filter(r => r.status === 'non_compliant').length}</div>
                <div className="text-gray-500">Non-conformes</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">{framework.requirements.filter(r => r.status === 'not_assessed').length}</div>
                <div className="text-gray-500">Non évaluées</div>
              </div>
            </div>

            {/* Certifications */}
            {framework.certifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Certifications:</div>
                <div className="space-y-1">
                  {framework.certifications.map(cert => (
                    <div key={cert.id} className="bg-green-50 p-2 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cert.name}</span>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Émetteur: {cert.issuer} • Expire: {new Date(cert.expiryDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Assessment */}
            {framework.assessments.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2">Dernière évaluation</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">{new Date(framework.compliance.lastAssessment).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Prochaine:</span>
                    <div className="font-medium">{new Date(framework.compliance.nextAssessment).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scope */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Périmètre:</div>
              <div className="flex flex-wrap gap-1">
                {framework.scope.map(scope => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Propriétaire: {framework.owner}</div>
              <div>Auditeur: {framework.auditor}</div>
              <div>MAJ: {new Date(framework.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPolicyCard = (policy: PolicyDocument) => {
    const acknowledgmentRate = policy.metrics.acknowledgments / policy.metrics.views * 100;

    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription className="text-sm">
                  {policy.type} • v{policy.version}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(policy.status)}>
              {policy.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{policy.metrics.views}</div>
                <div className="text-gray-500">Vues</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{policy.metrics.acknowledgments}</div>
                <div className="text-gray-500">Accusés</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{policy.metrics.violations}</div>
                <div className="text-gray-500">Violations</div>
              </div>
            </div>

            {/* Acknowledgment Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taux d'accusé de réception:</span>
                <span className={`font-medium ${acknowledgmentRate > 90 ? 'text-green-600' : acknowledgmentRate > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {acknowledgmentRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={acknowledgmentRate} className="h-2" />
            </div>

            {/* Compliance */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Conformité:</div>
              <div className="flex flex-wrap gap-1">
                {policy.compliance.frameworks.map(framework => (
                  <Badge key={framework} variant="outline" className="text-xs">
                    {framework.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Distribution */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Distribution</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Portée:</span>
                  <div className="font-medium capitalize">{policy.distribution.scope}</div>
                </div>
                <div>
                  <span className="text-gray-600">Accusé requis:</span>
                  <Badge className={policy.distribution.acknowledgment ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                    {policy.distribution.acknowledgment ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Review Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dernière révision:</span>
                <div className="font-medium">{new Date(policy.reviewDate).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <span className="text-gray-600">Prochaine révision:</span>
                <div className="font-medium">{new Date(policy.nextReview).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Consulter
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Propriétaire: {policy.owner}</div>
              <div>Approbateur: {policy.approver}</div>
              <div>Effectif: {new Date(policy.effectiveDate).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalFrameworks = complianceFrameworks.length;
    const activeFrameworks = complianceFrameworks.filter(f => f.status === 'active').length;
    const avgCompliance = complianceFrameworks.reduce((sum, f) => sum + f.compliance.overall, 0) / totalFrameworks;
    const activePolicies = policyDocuments.filter(p => p.status === 'published').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frameworks Actifs</p>
                <p className="text-2xl font-bold">{activeFrameworks}/{totalFrameworks}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformité Moyenne</p>
                <p className="text-2xl font-bold text-green-600">{avgCompliance.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Politiques Actives</p>
                <p className="text-2xl font-bold text-purple-600">{activePolicies}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements Audit</p>
                <p className="text-2xl font-bold text-orange-600">{auditTrails.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automatisation de la Conformité</h1>
          <p className="text-gray-600">Gestion automatisée de la conformité réglementaire et des audits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Conformité
          </Button>
          <Button size="sm" onClick={() => setShowFrameworkDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Framework
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="policies">Politiques</TabsTrigger>
          <TabsTrigger value="assessments">Évaluations</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les frameworks</SelectItem>
                <SelectItem value="regulatory">Réglementaires</SelectItem>
                <SelectItem value="industry">Sectoriels</SelectItem>
                <SelectItem value="international">Internationaux</SelectItem>
                <SelectItem value="internal">Internes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceFrameworks
              .filter(f => selectedFramework === 'all' || f.type === selectedFramework)
              .map(renderFrameworkCard)}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Documents de Politique</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Politique
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policyDocuments.map(renderPolicyCard)}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Évaluations de Conformité</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Évaluation
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-4" />
                <p>Module d'évaluations en cours de développement</p>
                <p className="text-sm">Évaluations automatisées et rapports de conformité</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Piste d'Audit</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 heure</SelectItem>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {auditTrails.map(trail => (
              <Card key={trail.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{trail.action.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-600">
                          {trail.user} • {trail.resource}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(trail.result)}>
                        {trail.result}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(trail.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="font-medium">IP:</span> {trail.ip}
                      </div>
                      <div>
                        <span className="font-medium">Frameworks:</span> {trail.compliance.frameworks.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Rétention:</span> {trail.compliance.retention}
                      </div>
                      <div>
                        <span className="font-medium">Classification:</span> {trail.compliance.classification}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Conformité</CardTitle>
              <CardDescription>Génération automatique de rapports et tableaux de bord</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Module de rapports en cours de développement</p>
                <p className="text-sm">Rapports automatisés et tableaux de bord exécutifs</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceAutomation;
