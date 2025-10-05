// AI Governance & Ethics Component

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
  Shield, Scale, Eye, AlertTriangle, CheckCircle, FileText,
  Users, Lock, Gavel, BookOpen, TrendingUp, BarChart3,
  Settings, Download, Upload, RefreshCw, Clock, Target,
  Brain, Zap, Database, Globe, UserCheck, Flag
} from 'lucide-react';

interface GovernancePolicy {
  id: string;
  name: string;
  category: 'fairness' | 'transparency' | 'accountability' | 'privacy' | 'safety' | 'compliance';
  description: string;
  status: 'active' | 'draft' | 'under_review' | 'archived';
  version: string;
  lastUpdated: string;
  createdBy: string;
  approvedBy?: string;
  requirements: PolicyRequirement[];
  compliance: {
    score: number;
    violations: number;
    lastAudit: string;
  };
}

interface PolicyRequirement {
  id: string;
  description: string;
  mandatory: boolean;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  evidence?: string;
  lastChecked: string;
}

interface BiasAssessment {
  id: string;
  modelId: string;
  modelName: string;
  assessmentType: 'demographic_parity' | 'equalized_odds' | 'calibration' | 'individual_fairness';
  protectedAttributes: string[];
  results: {
    overallScore: number;
    biasMetrics: BiasMetric[];
    recommendations: string[];
  };
  status: 'completed' | 'in_progress' | 'failed';
  timestamp: string;
  assessor: string;
}

interface BiasMetric {
  attribute: string;
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'fail' | 'warning';
  description: string;
}

interface EthicsViolation {
  id: string;
  type: 'bias_detected' | 'privacy_breach' | 'transparency_issue' | 'safety_concern' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  modelId?: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: { [key: string]: any };
  riskLevel: 'low' | 'medium' | 'high';
}

const AIGovernanceEthics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
  const [biasAssessments, setBiasAssessments] = useState<BiasAssessment[]>([]);
  const [violations, setViolations] = useState<EthicsViolation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock governance policies
  const mockPolicies: GovernancePolicy[] = [
    {
      id: 'policy_fairness',
      name: 'Politique d\'Équité et de Non-Discrimination',
      category: 'fairness',
      description: 'Garantit que les modèles IA ne discriminent pas sur la base d\'attributs protégés',
      status: 'active',
      version: '2.1',
      lastUpdated: '2024-12-15T10:30:00Z',
      createdBy: 'ethics@company.com',
      approvedBy: 'ceo@company.com',
      requirements: [
        {
          id: 'req_1',
          description: 'Évaluation de biais obligatoire avant déploiement',
          mandatory: true,
          status: 'compliant',
          evidence: 'Rapport d\'évaluation de biais du 15/12/2024',
          lastChecked: '2024-12-15T14:30:00Z'
        },
        {
          id: 'req_2',
          description: 'Monitoring continu des métriques d\'équité',
          mandatory: true,
          status: 'compliant',
          lastChecked: '2024-12-20T09:00:00Z'
        },
        {
          id: 'req_3',
          description: 'Formation du personnel sur les biais IA',
          mandatory: false,
          status: 'pending',
          lastChecked: '2024-12-10T16:00:00Z'
        }
      ],
      compliance: {
        score: 85.7,
        violations: 2,
        lastAudit: '2024-12-01T10:00:00Z'
      }
    },
    {
      id: 'policy_transparency',
      name: 'Politique de Transparence et d\'Explicabilité',
      category: 'transparency',
      description: 'Exige que les décisions IA soient explicables et transparentes',
      status: 'active',
      version: '1.3',
      lastUpdated: '2024-12-10T14:20:00Z',
      createdBy: 'legal@company.com',
      approvedBy: 'cto@company.com',
      requirements: [
        {
          id: 'req_4',
          description: 'Documentation des modèles et de leurs décisions',
          mandatory: true,
          status: 'compliant',
          evidence: 'Documentation technique complète',
          lastChecked: '2024-12-18T11:30:00Z'
        },
        {
          id: 'req_5',
          description: 'Interface d\'explication pour les utilisateurs',
          mandatory: true,
          status: 'non_compliant',
          lastChecked: '2024-12-20T08:00:00Z'
        }
      ],
      compliance: {
        score: 72.3,
        violations: 1,
        lastAudit: '2024-11-28T15:00:00Z'
      }
    },
    {
      id: 'policy_privacy',
      name: 'Politique de Protection de la Vie Privée',
      category: 'privacy',
      description: 'Protège les données personnelles dans les systèmes IA',
      status: 'active',
      version: '3.0',
      lastUpdated: '2024-12-18T16:45:00Z',
      createdBy: 'privacy@company.com',
      approvedBy: 'dpo@company.com',
      requirements: [
        {
          id: 'req_6',
          description: 'Anonymisation des données d\'entraînement',
          mandatory: true,
          status: 'compliant',
          evidence: 'Processus d\'anonymisation certifié',
          lastChecked: '2024-12-19T13:15:00Z'
        },
        {
          id: 'req_7',
          description: 'Consentement explicite pour l\'utilisation des données',
          mandatory: true,
          status: 'compliant',
          lastChecked: '2024-12-20T10:30:00Z'
        }
      ],
      compliance: {
        score: 94.2,
        violations: 0,
        lastAudit: '2024-12-05T09:00:00Z'
      }
    }
  ];

  // Mock bias assessments
  const mockBiasAssessments: BiasAssessment[] = [
    {
      id: 'bias_1',
      modelId: 'model_hiring',
      modelName: 'Modèle de Recrutement IA',
      assessmentType: 'demographic_parity',
      protectedAttributes: ['genre', 'âge', 'origine'],
      results: {
        overallScore: 78.5,
        biasMetrics: [
          {
            attribute: 'genre',
            metric: 'Parité démographique',
            value: 0.85,
            threshold: 0.8,
            status: 'pass',
            description: 'Taux de sélection équitable entre hommes et femmes'
          },
          {
            attribute: 'âge',
            metric: 'Égalité des chances',
            value: 0.72,
            threshold: 0.8,
            status: 'warning',
            description: 'Léger biais en faveur des candidats plus jeunes'
          },
          {
            attribute: 'origine',
            metric: 'Calibration',
            value: 0.65,
            threshold: 0.8,
            status: 'fail',
            description: 'Biais significatif détecté selon l\'origine'
          }
        ],
        recommendations: [
          'Rééquilibrer les données d\'entraînement',
          'Implémenter des contraintes d\'équité',
          'Réviser les features utilisées'
        ]
      },
      status: 'completed',
      timestamp: '2024-12-18T14:30:00Z',
      assessor: 'ethics@company.com'
    }
  ];

  // Mock violations
  const mockViolations: EthicsViolation[] = [
    {
      id: 'violation_1',
      type: 'bias_detected',
      severity: 'high',
      description: 'Biais de genre détecté dans le modèle de recrutement avec un écart de 15%',
      modelId: 'model_hiring',
      detectedAt: '2024-12-18T14:30:00Z',
      status: 'investigating',
      assignedTo: 'ethics@company.com'
    },
    {
      id: 'violation_2',
      type: 'transparency_issue',
      severity: 'medium',
      description: 'Interface d\'explication manquante pour les décisions de crédit',
      modelId: 'model_credit',
      detectedAt: '2024-12-17T09:15:00Z',
      status: 'open',
      assignedTo: 'dev@company.com'
    },
    {
      id: 'violation_3',
      type: 'privacy_breach',
      severity: 'critical',
      description: 'Données personnelles non anonymisées détectées dans les logs',
      detectedAt: '2024-12-16T16:20:00Z',
      status: 'resolved',
      assignedTo: 'security@company.com',
      resolution: 'Données supprimées et processus d\'anonymisation renforcé',
      resolvedAt: '2024-12-17T10:00:00Z'
    }
  ];

  // Mock audit logs
  const mockAuditLogs: AuditLog[] = [
    {
      id: 'audit_1',
      action: 'Model Deployment',
      resource: 'Sales Forecast Model v1.2',
      userId: 'user_123',
      userName: 'Jean Dupont',
      timestamp: '2024-12-20T14:30:00Z',
      details: { model_id: 'sales_forecast', version: '1.2', environment: 'production' },
      riskLevel: 'medium'
    },
    {
      id: 'audit_2',
      action: 'Bias Assessment',
      resource: 'Hiring Model',
      userId: 'user_456',
      userName: 'Marie Martin',
      timestamp: '2024-12-18T14:30:00Z',
      details: { assessment_type: 'demographic_parity', score: 78.5 },
      riskLevel: 'high'
    },
    {
      id: 'audit_3',
      action: 'Policy Update',
      resource: 'Privacy Policy v3.0',
      userId: 'user_789',
      userName: 'Ahmed Benali',
      timestamp: '2024-12-18T16:45:00Z',
      details: { policy_id: 'policy_privacy', changes: ['anonymization_requirements'] },
      riskLevel: 'low'
    }
  ];

  useEffect(() => {
    setPolicies(mockPolicies);
    setBiasAssessments(mockBiasAssessments);
    setViolations(mockViolations);
    setAuditLogs(mockAuditLogs);
    setIsLoading(false);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fairness': return <Scale className="h-4 w-4" />;
      case 'transparency': return <Eye className="h-4 w-4" />;
      case 'accountability': return <UserCheck className="h-4 w-4" />;
      case 'privacy': return <Lock className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'compliance': return <Gavel className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'under_review': return 'text-yellow-600 bg-yellow-50';
      case 'archived': return 'text-red-600 bg-red-50';
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'open': return 'text-red-600 bg-red-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
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

  const renderPolicyCard = (policy: GovernancePolicy) => {
    const complianceColor = policy.compliance.score >= 90 ? 'text-green-600' :
                           policy.compliance.score >= 70 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getCategoryIcon(policy.category)}
              </div>
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription className="text-sm">
                  v{policy.version} • {policy.category}
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
            <p className="text-sm text-gray-600">{policy.description}</p>
            
            {/* Compliance score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score de Conformité</span>
                <span className={`font-medium ${complianceColor}`}>
                  {policy.compliance.score.toFixed(1)}%
                </span>
              </div>
              <Progress value={policy.compliance.score} className="h-2" />
            </div>

            {/* Requirements summary */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Exigences ({policy.requirements.length})</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-green-600 font-medium">
                    {policy.requirements.filter(r => r.status === 'compliant').length}
                  </div>
                  <div className="text-gray-500">Conformes</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-medium">
                    {policy.requirements.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-gray-500">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-medium">
                    {policy.requirements.filter(r => r.status === 'non_compliant').length}
                  </div>
                  <div className="text-gray-500">Non conformes</div>
                </div>
              </div>
            </div>

            {/* Violations */}
            {policy.compliance.violations > 0 && (
              <div className="bg-red-50 p-2 rounded text-sm">
                <div className="text-red-800 font-medium">
                  {policy.compliance.violations} violation(s) détectée(s)
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Créé par: {policy.createdBy}</div>
              <div>Dernière MAJ: {new Date(policy.lastUpdated).toLocaleDateString('fr-FR')}</div>
              {policy.approvedBy && <div>Approuvé par: {policy.approvedBy}</div>}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                Modifier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBiasAssessment = (assessment: BiasAssessment) => {
    return (
      <Card key={assessment.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{assessment.modelName}</CardTitle>
            <Badge className={getStatusColor(assessment.status)}>
              {assessment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall score */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                assessment.results.overallScore >= 80 ? 'text-green-600' :
                assessment.results.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {assessment.results.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Score d'Équité Global</div>
            </div>

            {/* Bias metrics */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Métriques de Biais</div>
              {assessment.results.biasMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.attribute} - {metric.metric}</span>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(metric.value / 1) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs w-16">{metric.value.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-600">{metric.description}</div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {assessment.results.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommandations</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {assessment.results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Target className="h-3 w-3 mt-1 text-blue-600" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assessment info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Type: {assessment.assessmentType}</div>
              <div>Attributs protégés: {assessment.protectedAttributes.join(', ')}</div>
              <div>Évaluateur: {assessment.assessor}</div>
              <div>Date: {new Date(assessment.timestamp).toLocaleString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderViolation = (violation: EthicsViolation) => {
    return (
      <Card key={violation.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-5 w-5 ${
                violation.severity === 'critical' ? 'text-red-600' :
                violation.severity === 'high' ? 'text-orange-600' :
                violation.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`} />
              <CardTitle className="text-lg">Violation Éthique</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(violation.severity)}>
                {violation.severity}
              </Badge>
              <Badge className={getStatusColor(violation.status)}>
                {violation.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">{violation.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="capitalize">{violation.type.replace('_', ' ')}</div>
              </div>
              <div>
                <span className="text-gray-600">Détecté le:</span>
                <div>{new Date(violation.detectedAt).toLocaleString('fr-FR')}</div>
              </div>
              {violation.assignedTo && (
                <div>
                  <span className="text-gray-600">Assigné à:</span>
                  <div>{violation.assignedTo}</div>
                </div>
              )}
              {violation.modelId && (
                <div>
                  <span className="text-gray-600">Modèle:</span>
                  <div>{violation.modelId}</div>
                </div>
              )}
            </div>

            {violation.resolution && (
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-800 mb-1">Résolution</div>
                <div className="text-sm text-green-700">{violation.resolution}</div>
                {violation.resolvedAt && (
                  <div className="text-xs text-green-600 mt-1">
                    Résolu le {new Date(violation.resolvedAt).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            )}

            {violation.status !== 'resolved' && (
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Assigner
                </Button>
                <Button size="sm" variant="outline">
                  Résoudre
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const avgCompliance = policies.reduce((sum, p) => sum + p.compliance.score, 0) / policies.length;
    const openViolations = violations.filter(v => v.status === 'open' || v.status === 'investigating').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Politiques Actives</p>
                <p className="text-2xl font-bold">{activePolicies}/{totalPolicies}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conformité Moyenne</p>
                <p className={`text-2xl font-bold ${
                  avgCompliance >= 90 ? 'text-green-600' :
                  avgCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {avgCompliance.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Violations Ouvertes</p>
                <p className={`text-2xl font-bold ${openViolations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {openViolations}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${openViolations > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Évaluations Biais</p>
                <p className="text-2xl font-bold text-purple-600">{biasAssessments.length}</p>
              </div>
              <Scale className="h-8 w-8 text-purple-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gouvernance IA & Éthique</h1>
          <p className="text-gray-600">Assurez la conformité éthique de vos systèmes IA</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button size="sm" onClick={() => setShowPolicyDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Nouvelle Politique
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="policies">Politiques</TabsTrigger>
          <TabsTrigger value="bias">Évaluation Biais</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map(renderPolicyCard)}
          </div>
        </TabsContent>

        <TabsContent value="bias" className="space-y-6">
          <div className="space-y-4">
            {biasAssessments.map(renderBiasAssessment)}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <div className="space-y-4">
            {violations.map(renderViolation)}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'Audit</CardTitle>
              <CardDescription>Historique des actions sur les systèmes IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      log.riskLevel === 'high' ? 'bg-red-500' :
                      log.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{log.resource}</div>
                      <div className="text-xs text-gray-500">Par: {log.userName}</div>
                    </div>
                    <Badge className={
                      log.riskLevel === 'high' ? 'text-red-600 bg-red-50' :
                      log.riskLevel === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                      'text-green-600 bg-green-50'
                    }>
                      {log.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses de Gouvernance</CardTitle>
              <CardDescription>Métriques et tendances de conformité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses avancées en cours de développement</p>
                <p className="text-sm">Tableaux de bord de conformité et métriques éthiques</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIGovernanceEthics;
