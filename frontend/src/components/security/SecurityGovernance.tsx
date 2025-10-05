// Security Governance Component

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
  Shield, Users, Target, AlertTriangle, CheckCircle, XCircle,
  BarChart3, TrendingUp, TrendingDown, Activity, Eye, Settings,
  RefreshCw, Plus, Download, FileText, Award, Gavel, BookOpen,
  Clock, Calendar, Search, Filter, Archive, Lock, Key, Zap
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface SecurityPolicy {
  id: string;
  name: string;
  version: string;
  category: 'access_control' | 'data_protection' | 'incident_response' | 'risk_management' | 'compliance' | 'training';
  type: 'policy' | 'standard' | 'procedure' | 'guideline';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  description: string;
  owner: string;
  approver: string;
  reviewers: string[];
  scope: string[];
  applicability: 'all' | 'department' | 'role' | 'system';
  effectiveDate: string;
  reviewDate: string;
  nextReview: string;
  compliance: {
    frameworks: string[];
    requirements: string[];
  };
  metrics: {
    violations: number;
    exceptions: number;
    waivers: number;
    compliance: number;
  };
  attachments: PolicyAttachment[];
  changeHistory: PolicyChange[];
}

interface PolicyAttachment {
  id: string;
  name: string;
  type: 'document' | 'template' | 'checklist' | 'form';
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface PolicyChange {
  version: string;
  date: string;
  author: string;
  summary: string;
  changes: string[];
  approvedBy: string;
}

interface RiskAssessment {
  id: string;
  name: string;
  type: 'operational' | 'strategic' | 'financial' | 'compliance' | 'technology' | 'reputation';
  scope: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  assessor: string;
  methodology: 'qualitative' | 'quantitative' | 'hybrid';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  inherentRisk: number;
  residualRisk: number;
  riskAppetite: number;
  threats: RiskThreat[];
  vulnerabilities: RiskVulnerability[];
  controls: RiskControl[];
  mitigations: RiskMitigation[];
  timeline: {
    startDate: string;
    endDate: string;
    lastUpdate: string;
    nextReview: string;
  };
  stakeholders: string[];
  findings: string[];
  recommendations: string[];
}

interface RiskThreat {
  id: string;
  name: string;
  category: string;
  likelihood: number;
  impact: number;
  description: string;
  source: 'internal' | 'external' | 'environmental';
}

interface RiskVulnerability {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected: string[];
  exploitability: number;
}

interface RiskControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  effectiveness: number;
  implementation: 'manual' | 'automated' | 'hybrid';
  status: 'implemented' | 'planned' | 'in_progress' | 'not_implemented';
  cost: number;
  owner: string;
}

interface RiskMitigation {
  id: string;
  strategy: 'accept' | 'avoid' | 'mitigate' | 'transfer';
  description: string;
  actions: MitigationAction[];
  timeline: string;
  budget: number;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface MitigationAction {
  id: string;
  description: string;
  type: 'policy' | 'technical' | 'process' | 'training';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  assignee: string;
  dueDate: string;
  progress: number;
}

interface SecurityMetric {
  id: string;
  name: string;
  category: 'governance' | 'risk' | 'compliance' | 'incidents' | 'training' | 'awareness';
  type: 'kpi' | 'kri' | 'operational';
  description: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  target: number;
  threshold: {
    green: number;
    yellow: number;
    red: number;
  };
  currentValue: number;
  trend: 'up' | 'down' | 'stable';
  dataPoints: MetricDataPoint[];
  owner: string;
  lastUpdated: string;
}

interface MetricDataPoint {
  timestamp: string;
  value: number;
  target: number;
  note?: string;
}

interface SecurityTraining {
  id: string;
  name: string;
  type: 'awareness' | 'technical' | 'compliance' | 'incident_response' | 'phishing';
  category: 'mandatory' | 'optional' | 'role_based' | 'certification';
  description: string;
  duration: number;
  format: 'online' | 'classroom' | 'workshop' | 'simulation' | 'hybrid';
  audience: string[];
  prerequisites: string[];
  objectives: string[];
  content: TrainingContent[];
  assessment: {
    required: boolean;
    passingScore: number;
    attempts: number;
  };
  schedule: {
    frequency: 'once' | 'annual' | 'biannual' | 'quarterly' | 'monthly';
    nextSession: string;
    deadline: string;
  };
  metrics: {
    enrolled: number;
    completed: number;
    passed: number;
    failed: number;
    avgScore: number;
    completionRate: number;
  };
  status: 'draft' | 'published' | 'active' | 'suspended' | 'archived';
  instructor: string;
  materials: TrainingMaterial[];
}

interface TrainingContent {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'quiz' | 'simulation';
  duration: number;
  order: number;
  mandatory: boolean;
}

interface TrainingMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'presentation' | 'link' | 'document';
  url: string;
  size?: number;
  description: string;
}

interface SecurityIncident {
  id: string;
  title: string;
  type: 'security_breach' | 'policy_violation' | 'system_compromise' | 'data_loss' | 'phishing' | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  description: string;
  reporter: string;
  assignee: string;
  detectedAt: string;
  reportedAt: string;
  resolvedAt?: string;
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
    scope: 'local' | 'department' | 'organization' | 'external';
  };
  affected: {
    systems: string[];
    users: number;
    data: string[];
  };
  timeline: IncidentEvent[];
  rootCause: string;
  lessonsLearned: string[];
  improvements: string[];
  cost: number;
}

interface IncidentEvent {
  timestamp: string;
  event: string;
  actor: string;
  details: string;
  automated: boolean;
}

const SecurityGovernance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [securityTrainings, setSecurityTrainings] = useState<SecurityTraining[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock security policies
  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: 'policy_001',
      name: 'Politique de Contrôle d\'Accès',
      version: '3.1',
      category: 'access_control',
      type: 'policy',
      status: 'published',
      description: 'Définit les règles et procédures pour le contrôle d\'accès aux systèmes d\'information',
      owner: 'security@company.com',
      approver: 'ciso@company.com',
      reviewers: ['it@company.com', 'hr@company.com'],
      scope: ['all_systems', 'all_users'],
      applicability: 'all',
      effectiveDate: '2024-01-01T00:00:00Z',
      reviewDate: '2024-11-15T00:00:00Z',
      nextReview: '2025-05-01T00:00:00Z',
      compliance: {
        frameworks: ['ISO27001', 'SOC2'],
        requirements: ['A.9.1', 'CC6.1']
      },
      metrics: {
        violations: 5,
        exceptions: 12,
        waivers: 3,
        compliance: 94
      },
      attachments: [
        {
          id: 'att_001',
          name: 'Formulaire de Demande d\'Accès',
          type: 'form',
          url: '/forms/access-request.pdf',
          size: 245760,
          uploadedAt: '2024-01-01T10:00:00Z',
          uploadedBy: 'security@company.com'
        }
      ],
      changeHistory: [
        {
          version: '3.1',
          date: '2024-11-15T00:00:00Z',
          author: 'security@company.com',
          summary: 'Mise à jour des procédures MFA',
          changes: ['Ajout obligation MFA pour accès privilégiés', 'Révision délais de révocation'],
          approvedBy: 'ciso@company.com'
        }
      ]
    },
    {
      id: 'policy_002',
      name: 'Politique de Protection des Données',
      version: '2.3',
      category: 'data_protection',
      type: 'policy',
      status: 'published',
      description: 'Établit les principes et mesures pour la protection des données personnelles et sensibles',
      owner: 'dpo@company.com',
      approver: 'ciso@company.com',
      reviewers: ['legal@company.com', 'security@company.com'],
      scope: ['personal_data', 'sensitive_data'],
      applicability: 'all',
      effectiveDate: '2024-05-25T00:00:00Z',
      reviewDate: '2024-10-01T00:00:00Z',
      nextReview: '2025-05-25T00:00:00Z',
      compliance: {
        frameworks: ['GDPR', 'ISO27001'],
        requirements: ['Article 32', 'A.13.2']
      },
      metrics: {
        violations: 2,
        exceptions: 8,
        waivers: 1,
        compliance: 97
      },
      attachments: [],
      changeHistory: []
    }
  ];

  // Mock risk assessments
  const mockRiskAssessments: RiskAssessment[] = [
    {
      id: 'risk_001',
      name: 'Évaluation des Risques Cyber 2024',
      type: 'technology',
      scope: 'Infrastructure IT et applications critiques',
      status: 'completed',
      assessor: 'security@company.com',
      methodology: 'hybrid',
      riskLevel: 'medium',
      inherentRisk: 75,
      residualRisk: 35,
      riskAppetite: 40,
      threats: [
        {
          id: 'threat_001',
          name: 'Attaque par ransomware',
          category: 'Malware',
          likelihood: 70,
          impact: 90,
          description: 'Risque d\'infection par ransomware via email ou vulnérabilités',
          source: 'external'
        }
      ],
      vulnerabilities: [
        {
          id: 'vuln_001',
          name: 'Systèmes non patchés',
          category: 'Configuration',
          severity: 'high',
          description: 'Certains systèmes ne reçoivent pas les mises à jour de sécurité',
          affected: ['server-01', 'workstation-group-a'],
          exploitability: 80
        }
      ],
      controls: [
        {
          id: 'ctrl_001',
          name: 'Antivirus centralisé',
          type: 'preventive',
          effectiveness: 85,
          implementation: 'automated',
          status: 'implemented',
          cost: 25000,
          owner: 'it@company.com'
        }
      ],
      mitigations: [
        {
          id: 'mit_001',
          strategy: 'mitigate',
          description: 'Renforcement de la sécurité des endpoints',
          actions: [
            {
              id: 'act_001',
              description: 'Déploiement EDR sur tous les postes',
              type: 'technical',
              priority: 'high',
              status: 'in_progress',
              assignee: 'it@company.com',
              dueDate: '2025-02-01T00:00:00Z',
              progress: 65
            }
          ],
          timeline: '3 mois',
          budget: 50000,
          owner: 'security@company.com',
          status: 'in_progress'
        }
      ],
      timeline: {
        startDate: '2024-09-01T00:00:00Z',
        endDate: '2024-11-30T00:00:00Z',
        lastUpdate: '2024-12-15T00:00:00Z',
        nextReview: '2025-09-01T00:00:00Z'
      },
      stakeholders: ['ciso@company.com', 'it@company.com', 'ceo@company.com'],
      findings: [
        'Niveau de risque acceptable après mise en place des contrôles',
        'Nécessité de renforcer la formation utilisateurs'
      ],
      recommendations: [
        'Implémenter une solution EDR',
        'Améliorer la gestion des correctifs',
        'Renforcer la sensibilisation phishing'
      ]
    }
  ];

  // Mock security metrics
  const mockSecurityMetrics: SecurityMetric[] = [
    {
      id: 'metric_001',
      name: 'Taux de Conformité Politique',
      category: 'governance',
      type: 'kpi',
      description: 'Pourcentage de conformité aux politiques de sécurité',
      unit: '%',
      frequency: 'monthly',
      target: 95,
      threshold: {
        green: 95,
        yellow: 85,
        red: 75
      },
      currentValue: 92,
      trend: 'up',
      dataPoints: [
        { timestamp: '2024-10-01T00:00:00Z', value: 88, target: 95 },
        { timestamp: '2024-11-01T00:00:00Z', value: 90, target: 95 },
        { timestamp: '2024-12-01T00:00:00Z', value: 92, target: 95 }
      ],
      owner: 'security@company.com',
      lastUpdated: '2024-12-20T15:30:00Z'
    },
    {
      id: 'metric_002',
      name: 'Temps Moyen de Résolution Incident',
      category: 'incidents',
      type: 'operational',
      description: 'Temps moyen pour résoudre un incident de sécurité',
      unit: 'heures',
      frequency: 'weekly',
      target: 24,
      threshold: {
        green: 24,
        yellow: 48,
        red: 72
      },
      currentValue: 18,
      trend: 'down',
      dataPoints: [
        { timestamp: '2024-12-01T00:00:00Z', value: 22, target: 24 },
        { timestamp: '2024-12-08T00:00:00Z', value: 20, target: 24 },
        { timestamp: '2024-12-15T00:00:00Z', value: 18, target: 24 }
      ],
      owner: 'security@company.com',
      lastUpdated: '2024-12-20T15:30:00Z'
    }
  ];

  // Mock security trainings
  const mockSecurityTrainings: SecurityTraining[] = [
    {
      id: 'training_001',
      name: 'Sensibilisation Sécurité Générale',
      type: 'awareness',
      category: 'mandatory',
      description: 'Formation obligatoire sur les bonnes pratiques de sécurité informatique',
      duration: 60,
      format: 'online',
      audience: ['all_employees'],
      prerequisites: [],
      objectives: [
        'Comprendre les enjeux de la sécurité informatique',
        'Identifier les principales menaces',
        'Adopter les bonnes pratiques'
      ],
      content: [
        {
          id: 'content_001',
          title: 'Introduction à la sécurité',
          type: 'video',
          duration: 15,
          order: 1,
          mandatory: true
        },
        {
          id: 'content_002',
          title: 'Quiz de validation',
          type: 'quiz',
          duration: 10,
          order: 2,
          mandatory: true
        }
      ],
      assessment: {
        required: true,
        passingScore: 80,
        attempts: 3
      },
      schedule: {
        frequency: 'annual',
        nextSession: '2025-01-15T09:00:00Z',
        deadline: '2025-03-31T23:59:59Z'
      },
      metrics: {
        enrolled: 1250,
        completed: 1180,
        passed: 1165,
        failed: 15,
        avgScore: 87,
        completionRate: 94.4
      },
      status: 'active',
      instructor: 'security@company.com',
      materials: [
        {
          id: 'mat_001',
          name: 'Guide des bonnes pratiques',
          type: 'pdf',
          url: '/materials/security-guide.pdf',
          size: 2048000,
          description: 'Guide complet des bonnes pratiques de sécurité'
        }
      ]
    }
  ];

  useEffect(() => {
    setSecurityPolicies(mockSecurityPolicies);
    setRiskAssessments(mockRiskAssessments);
    setSecurityMetrics(mockSecurityMetrics);
    setSecurityTrainings(mockSecurityTrainings);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'implemented': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'passed': return 'text-green-600 bg-green-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'planned': return 'text-yellow-600 bg-yellow-50';
      case 'suspended': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'open': return 'text-red-600 bg-red-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderOverviewStats = () => {
    const publishedPolicies = securityPolicies.filter(p => p.status === 'published').length;
    const completedAssessments = riskAssessments.filter(r => r.status === 'completed').length;
    const avgCompliance = securityPolicies.reduce((sum, p) => sum + p.metrics.compliance, 0) / securityPolicies.length;
    const activeTrainings = securityTrainings.filter(t => t.status === 'active').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Politiques Actives</p>
                <p className="text-2xl font-bold">{publishedPolicies}</p>
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
                <p className="text-sm font-medium text-gray-600">Évaluations Complètes</p>
                <p className="text-2xl font-bold text-purple-600">{completedAssessments}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Formations Actives</p>
                <p className="text-2xl font-bold text-orange-600">{activeTrainings}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPolicyCard = (policy: SecurityPolicy) => {
    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription className="text-sm">
                  {policy.type} • v{policy.version} • {policy.category.replace('_', ' ')}
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
            
            {/* Compliance Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité:</span>
                <span className={`font-medium ${policy.metrics.compliance > 90 ? 'text-green-600' : policy.metrics.compliance > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {policy.metrics.compliance}%
                </span>
              </div>
              <Progress value={policy.metrics.compliance} className="h-2" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-red-600">{policy.metrics.violations}</div>
                <div className="text-gray-500">Violations</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">{policy.metrics.exceptions}</div>
                <div className="text-gray-500">Exceptions</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{policy.metrics.waivers}</div>
                <div className="text-gray-500">Dérogations</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{policy.attachments.length}</div>
                <div className="text-gray-500">Annexes</div>
              </div>
            </div>

            {/* Compliance Frameworks */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Conformité:</div>
              <div className="flex flex-wrap gap-1">
                {policy.compliance.frameworks.map(framework => (
                  <Badge key={framework} variant="outline" className="text-xs">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Review Dates */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Révisions</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Dernière:</span>
                  <div className="font-medium">{new Date(policy.reviewDate).toLocaleDateString('fr-FR')}</div>
                </div>
                <div>
                  <span className="text-gray-600">Prochaine:</span>
                  <div className="font-medium">{new Date(policy.nextReview).toLocaleDateString('fr-FR')}</div>
                </div>
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
              <div>Applicabilité: {policy.applicability}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMetricCard = (metric: SecurityMetric) => {
    const getMetricColor = (value: number, threshold: any) => {
      if (value >= threshold.green) return 'text-green-600';
      if (value >= threshold.yellow) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <Card key={metric.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                <CardDescription className="text-sm">
                  {metric.type.toUpperCase()} • {metric.frequency}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(metric.trend)}
              <Badge variant="outline">
                {metric.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{metric.description}</p>
            
            {/* Current Value */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${getMetricColor(metric.currentValue, metric.threshold)}`}>
                {metric.currentValue}{metric.unit}
              </div>
              <div className="text-sm text-gray-500">
                Objectif: {metric.target}{metric.unit}
              </div>
            </div>

            {/* Progress towards target */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression:</span>
                <span className="font-medium">
                  {((metric.currentValue / metric.target) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(metric.currentValue / metric.target) * 100} className="h-2" />
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-600">Vert</div>
                <div>≥ {metric.threshold.green}{metric.unit}</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-600">Jaune</div>
                <div>≥ {metric.threshold.yellow}{metric.unit}</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-600">Rouge</div>
                <div>&lt; {metric.threshold.red}{metric.unit}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <BarChart3 className="h-3 w-3 mr-1" />
                Tendances
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Propriétaire: {metric.owner}</div>
              <div>MAJ: {new Date(metric.lastUpdated).toLocaleString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
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
          <h1 className="text-3xl font-bold text-gray-900">Gouvernance de la Sécurité</h1>
          <p className="text-gray-600">Gestion des politiques, risques, métriques et formation sécurité</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Gouvernance
          </Button>
          <Button size="sm" onClick={() => setShowPolicyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Politique
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="policies">Politiques</TabsTrigger>
          <TabsTrigger value="risks">Risques</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="training">Formation</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Governance Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Tableau de Bord Gouvernance</CardTitle>
              <CardDescription>Vue d'ensemble de la posture de sécurité organisationnelle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de gouvernance en cours de développement</p>
                <p className="text-sm">Métriques exécutives et indicateurs de performance sécurité</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Politiques de Sécurité</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="access_control">Contrôle d'accès</SelectItem>
                  <SelectItem value="data_protection">Protection des données</SelectItem>
                  <SelectItem value="incident_response">Réponse aux incidents</SelectItem>
                  <SelectItem value="risk_management">Gestion des risques</SelectItem>
                  <SelectItem value="compliance">Conformité</SelectItem>
                  <SelectItem value="training">Formation</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowPolicyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Politique
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPolicies
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .map(renderPolicyCard)}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Évaluations des Risques</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Évaluation
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskAssessments.map(assessment => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-red-50">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {assessment.type} • {assessment.methodology}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(assessment.riskLevel)}>
                        {assessment.riskLevel}
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {assessment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{assessment.scope}</p>
                    
                    {/* Risk Levels */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-red-600">{assessment.inherentRisk}</div>
                        <div className="text-gray-500">Risque Inhérent</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{assessment.residualRisk}</div>
                        <div className="text-gray-500">Risque Résiduel</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{assessment.riskAppetite}</div>
                        <div className="text-gray-500">Appétit Risque</div>
                      </div>
                    </div>

                    {/* Components */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{assessment.threats.length}</div>
                        <div className="text-gray-500">Menaces</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{assessment.vulnerabilities.length}</div>
                        <div className="text-gray-500">Vulnérabilités</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{assessment.controls.length}</div>
                        <div className="text-gray-500">Contrôles</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{assessment.mitigations.length}</div>
                        <div className="text-gray-500">Mitigations</div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Calendrier</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Dernière MAJ:</span>
                          <div className="font-medium">{new Date(assessment.timeline.lastUpdate).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Prochaine révision:</span>
                          <div className="font-medium">{new Date(assessment.timeline.nextReview).toLocaleDateString('fr-FR')}</div>
                        </div>
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
                      <div>Évaluateur: {assessment.assessor}</div>
                      <div>Parties prenantes: {assessment.stakeholders.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Métriques de Sécurité</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Métrique
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityMetrics.map(renderMetricCard)}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Formation et Sensibilisation</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Formation
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityTrainings.map(training => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{training.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {training.type} • {training.duration}min • {training.format}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={training.category === 'mandatory' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}>
                        {training.category}
                      </Badge>
                      <Badge className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{training.description}</p>
                    
                    {/* Completion Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux de Completion:</span>
                        <span className={`font-medium ${training.metrics.completionRate > 90 ? 'text-green-600' : training.metrics.completionRate > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {training.metrics.completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={training.metrics.completionRate} className="h-2" />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{training.metrics.enrolled}</div>
                        <div className="text-gray-500">Inscrits</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{training.metrics.completed}</div>
                        <div className="text-gray-500">Terminés</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{training.metrics.passed}</div>
                        <div className="text-gray-500">Réussis</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{training.metrics.avgScore}</div>
                        <div className="text-gray-500">Score Moy.</div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Planification</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Fréquence:</span>
                          <div className="font-medium capitalize">{training.schedule.frequency}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Échéance:</span>
                          <div className="font-medium">{new Date(training.schedule.deadline).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Consulter
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
                      <div>Instructeur: {training.instructor}</div>
                      <div>Contenu: {training.content.length} modules</div>
                      <div>Matériaux: {training.materials.length} ressources</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Incidents de Sécurité</CardTitle>
              <CardDescription>Suivi et analyse des incidents de sécurité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Module de gestion des incidents en cours de développement</p>
                <p className="text-sm">Workflow de réponse aux incidents et métriques de performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityGovernance;
