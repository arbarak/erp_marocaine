// Enterprise Architecture Management Component

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
  Building2, Network, Database, Server, Globe, Cpu, HardDrive,
  Layers, GitBranch, Workflow, Settings, Eye, RefreshCw, Plus,
  Download, BarChart3, Activity, Target, CheckCircle, XCircle,
  AlertTriangle, Clock, Users, Lock, Key, Zap, Archive
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Sankey } from 'recharts';

interface EnterpriseArchitecture {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'business' | 'application' | 'data' | 'technology' | 'security';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated';
  framework: 'togaf' | 'zachman' | 'feaf' | 'sabsa' | 'custom';
  domains: ArchitectureDomain[];
  components: ArchitectureComponent[];
  relationships: ArchitectureRelationship[];
  principles: ArchitecturePrinciple[];
  standards: ArchitectureStandard[];
  governance: ArchitectureGovernance;
  roadmap: ArchitectureRoadmap;
  metrics: ArchitectureMetrics;
  stakeholders: string[];
  owner: string;
  architect: string;
  createdAt: string;
  updatedAt: string;
}

interface ArchitectureDomain {
  id: string;
  name: string;
  type: 'business' | 'application' | 'data' | 'technology';
  description: string;
  scope: string;
  capabilities: DomainCapability[];
  services: DomainService[];
  interfaces: DomainInterface[];
  dependencies: string[];
  maturity: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
}

interface DomainCapability {
  id: string;
  name: string;
  description: string;
  level: 'strategic' | 'tactical' | 'operational';
  maturity: number;
  importance: number;
  performance: number;
  gaps: string[];
  initiatives: string[];
}

interface DomainService {
  id: string;
  name: string;
  type: 'business' | 'application' | 'infrastructure';
  description: string;
  provider: string;
  consumers: string[];
  sla: ServiceLevelAgreement;
  interfaces: ServiceInterface[];
  dependencies: string[];
  status: 'active' | 'deprecated' | 'planned' | 'retired';
}

interface ServiceLevelAgreement {
  availability: number;
  performance: number;
  reliability: number;
  security: string;
  support: string;
  recovery: number;
}

interface ServiceInterface {
  id: string;
  name: string;
  type: 'rest' | 'soap' | 'graphql' | 'grpc' | 'messaging' | 'file';
  protocol: string;
  endpoint: string;
  authentication: string;
  documentation: string;
  version: string;
}

interface DomainInterface {
  id: string;
  name: string;
  type: 'api' | 'messaging' | 'file' | 'database' | 'ui';
  source: string;
  target: string;
  protocol: string;
  format: string;
  frequency: string;
  volume: number;
  security: string;
  monitoring: boolean;
}

interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'application' | 'service' | 'database' | 'infrastructure' | 'platform';
  category: string;
  description: string;
  vendor: string;
  version: string;
  status: 'active' | 'deprecated' | 'planned' | 'retired';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  lifecycle: ComponentLifecycle;
  dependencies: ComponentDependency[];
  interfaces: ComponentInterface[];
  deployment: ComponentDeployment;
  compliance: ComponentCompliance;
  costs: ComponentCosts;
  metrics: ComponentMetrics;
}

interface ComponentLifecycle {
  phase: 'planning' | 'development' | 'testing' | 'production' | 'maintenance' | 'retirement';
  startDate: string;
  endDate?: string;
  milestones: LifecycleMilestone[];
  risks: LifecycleRisk[];
}

interface LifecycleMilestone {
  name: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string[];
}

interface LifecycleRisk {
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
}

interface ComponentDependency {
  componentId: string;
  type: 'hard' | 'soft' | 'optional';
  direction: 'upstream' | 'downstream' | 'bidirectional';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  interface: string;
}

interface ComponentInterface {
  id: string;
  name: string;
  type: 'inbound' | 'outbound';
  protocol: string;
  format: string;
  security: string;
  monitoring: boolean;
  documentation: string;
}

interface ComponentDeployment {
  environment: 'development' | 'testing' | 'staging' | 'production';
  infrastructure: string;
  configuration: any;
  scaling: ScalingConfiguration;
  monitoring: MonitoringConfiguration;
  backup: BackupConfiguration;
}

interface ScalingConfiguration {
  type: 'manual' | 'automatic';
  minInstances: number;
  maxInstances: number;
  metrics: string[];
  thresholds: any;
}

interface MonitoringConfiguration {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfiguration[];
  dashboards: string[];
}

interface AlertConfiguration {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  recipients: string[];
}

interface BackupConfiguration {
  enabled: boolean;
  frequency: string;
  retention: string;
  location: string;
  encryption: boolean;
}

interface ComponentCompliance {
  frameworks: string[];
  requirements: string[];
  assessments: ComplianceAssessment[];
  certifications: string[];
  audits: ComplianceAudit[];
}

interface ComplianceAssessment {
  framework: string;
  date: string;
  score: number;
  findings: string[];
  recommendations: string[];
}

interface ComplianceAudit {
  auditor: string;
  date: string;
  scope: string;
  result: 'pass' | 'fail' | 'conditional';
  findings: string[];
  actions: string[];
}

interface ComponentCosts {
  acquisition: number;
  licensing: number;
  maintenance: number;
  operation: number;
  support: number;
  total: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'annually';
}

interface ComponentMetrics {
  availability: number;
  performance: number;
  reliability: number;
  utilization: number;
  errors: number;
  throughput: number;
  latency: number;
  lastUpdated: string;
}

interface ArchitectureRelationship {
  id: string;
  name: string;
  type: 'dependency' | 'composition' | 'aggregation' | 'association' | 'inheritance';
  source: string;
  target: string;
  description: string;
  strength: 'weak' | 'medium' | 'strong';
  direction: 'unidirectional' | 'bidirectional';
  properties: any;
}

interface ArchitecturePrinciple {
  id: string;
  name: string;
  category: 'business' | 'data' | 'application' | 'technology';
  statement: string;
  rationale: string;
  implications: string[];
  compliance: number;
  exceptions: PrincipleException[];
  owner: string;
}

interface PrincipleException {
  component: string;
  reason: string;
  approver: string;
  expiryDate: string;
  mitigation: string;
}

interface ArchitectureStandard {
  id: string;
  name: string;
  category: string;
  type: 'mandatory' | 'recommended' | 'optional';
  description: string;
  specification: string;
  compliance: number;
  adoption: number;
  exceptions: StandardException[];
  owner: string;
}

interface StandardException {
  component: string;
  reason: string;
  alternative: string;
  approver: string;
  expiryDate: string;
}

interface ArchitectureGovernance {
  board: GovernanceBoard;
  processes: GovernanceProcess[];
  reviews: ArchitectureReview[];
  decisions: ArchitectureDecision[];
  policies: GovernancePolicy[];
  compliance: GovernanceCompliance;
}

interface GovernanceBoard {
  chair: string;
  members: BoardMember[];
  frequency: string;
  nextMeeting: string;
  charter: string;
}

interface BoardMember {
  name: string;
  role: string;
  department: string;
  expertise: string[];
}

interface GovernanceProcess {
  id: string;
  name: string;
  description: string;
  steps: ProcessStep[];
  roles: ProcessRole[];
  artifacts: string[];
  frequency: string;
}

interface ProcessStep {
  name: string;
  description: string;
  owner: string;
  duration: string;
  inputs: string[];
  outputs: string[];
}

interface ProcessRole {
  name: string;
  responsibilities: string[];
  authority: string[];
  skills: string[];
}

interface ArchitectureReview {
  id: string;
  name: string;
  type: 'design' | 'compliance' | 'performance' | 'security' | 'cost';
  scope: string;
  reviewers: string[];
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  findings: ReviewFinding[];
  recommendations: string[];
  decisions: string[];
}

interface ReviewFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommendation: string;
  owner: string;
  dueDate: string;
}

interface ArchitectureDecision {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  date: string;
  context: string;
  decision: string;
  rationale: string;
  consequences: string[];
  alternatives: DecisionAlternative[];
  stakeholders: string[];
  approver: string;
}

interface DecisionAlternative {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  cost: number;
  risk: number;
}

interface GovernancePolicy {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: PolicyRule[];
  compliance: number;
  exceptions: PolicyException[];
  owner: string;
}

interface PolicyRule {
  condition: string;
  action: string;
  severity: 'info' | 'warning' | 'error';
  automated: boolean;
}

interface PolicyException {
  component: string;
  rule: string;
  reason: string;
  approver: string;
  expiryDate: string;
}

interface GovernanceCompliance {
  overall: number;
  principles: number;
  standards: number;
  policies: number;
  lastAssessment: string;
  nextAssessment: string;
  trends: ComplianceTrend[];
}

interface ComplianceTrend {
  date: string;
  principles: number;
  standards: number;
  policies: number;
  overall: number;
}

interface ArchitectureRoadmap {
  id: string;
  name: string;
  timeframe: string;
  phases: RoadmapPhase[];
  initiatives: RoadmapInitiative[];
  dependencies: RoadmapDependency[];
  milestones: RoadmapMilestone[];
  risks: RoadmapRisk[];
  budget: RoadmapBudget;
}

interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  deliverables: string[];
  success: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
}

interface RoadmapInitiative {
  id: string;
  name: string;
  description: string;
  type: 'strategic' | 'tactical' | 'operational';
  priority: 'low' | 'medium' | 'high' | 'critical';
  phase: string;
  owner: string;
  budget: number;
  timeline: string;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  benefits: InitiativeBenefit[];
  risks: InitiativeRisk[];
}

interface InitiativeBenefit {
  type: 'cost_reduction' | 'revenue_increase' | 'efficiency' | 'quality' | 'compliance';
  description: string;
  value: number;
  timeframe: string;
  measurement: string;
}

interface InitiativeRisk {
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
}

interface RoadmapDependency {
  source: string;
  target: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number;
  critical: boolean;
}

interface RoadmapMilestone {
  id: string;
  name: string;
  date: string;
  description: string;
  criteria: string[];
  status: 'planned' | 'achieved' | 'missed' | 'at_risk';
  dependencies: string[];
}

interface RoadmapRisk {
  id: string;
  description: string;
  category: 'technical' | 'business' | 'resource' | 'external';
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
}

interface RoadmapBudget {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  currency: string;
  breakdown: BudgetBreakdown[];
  forecasts: BudgetForecast[];
}

interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface BudgetForecast {
  period: string;
  planned: number;
  actual: number;
  variance: number;
}

interface ArchitectureMetrics {
  complexity: ComplexityMetrics;
  quality: QualityMetrics;
  performance: PerformanceMetrics;
  cost: CostMetrics;
  risk: RiskMetrics;
  compliance: ComplianceMetrics;
  lastUpdated: string;
}

interface ComplexityMetrics {
  components: number;
  interfaces: number;
  dependencies: number;
  cyclomaticComplexity: number;
  couplingIndex: number;
  cohesionIndex: number;
}

interface QualityMetrics {
  maintainability: number;
  reliability: number;
  security: number;
  performance: number;
  usability: number;
  testability: number;
}

interface PerformanceMetrics {
  availability: number;
  throughput: number;
  latency: number;
  scalability: number;
  efficiency: number;
  capacity: number;
}

interface CostMetrics {
  totalCost: number;
  costPerTransaction: number;
  costPerUser: number;
  roi: number;
  tco: number;
  optimization: number;
}

interface RiskMetrics {
  overall: number;
  technical: number;
  business: number;
  operational: number;
  compliance: number;
  security: number;
}

interface ComplianceMetrics {
  overall: number;
  principles: number;
  standards: number;
  policies: number;
  frameworks: number;
  audits: number;
}

const EnterpriseArchitectureManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [architectures, setArchitectures] = useState<EnterpriseArchitecture[]>([]);
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('12m');
  const [showArchitectureDialog, setShowArchitectureDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock enterprise architectures
  const mockArchitectures: EnterpriseArchitecture[] = [
    {
      id: 'arch_001',
      name: 'Architecture d\'Entreprise ERP 2024',
      version: '2.1',
      description: 'Architecture globale du système ERP avec intégrations cloud et sécurité avancée',
      type: 'application',
      status: 'implemented',
      framework: 'togaf',
      domains: [
        {
          id: 'domain_business',
          name: 'Domaine Métier',
          type: 'business',
          description: 'Processus métier et capacités organisationnelles',
          scope: 'Tous les processus métier de l\'entreprise',
          capabilities: [
            {
              id: 'cap_001',
              name: 'Gestion Financière',
              description: 'Capacité de gestion comptable et financière',
              level: 'strategic',
              maturity: 85,
              importance: 95,
              performance: 88,
              gaps: ['Reporting temps réel', 'Analytics prédictifs'],
              initiatives: ['Modernisation BI', 'Automatisation reporting']
            }
          ],
          services: [
            {
              id: 'svc_001',
              name: 'Service de Facturation',
              type: 'business',
              description: 'Service de génération et gestion des factures',
              provider: 'ERP Core',
              consumers: ['CRM', 'E-commerce', 'Mobile App'],
              sla: {
                availability: 99.9,
                performance: 2000,
                reliability: 99.5,
                security: 'High',
                support: '24/7',
                recovery: 4
              },
              interfaces: [
                {
                  id: 'int_001',
                  name: 'Facturation API',
                  type: 'rest',
                  protocol: 'HTTPS',
                  endpoint: '/api/v1/invoices',
                  authentication: 'OAuth2',
                  documentation: '/docs/invoicing-api',
                  version: '1.2'
                }
              ],
              dependencies: ['Customer Service', 'Product Catalog'],
              status: 'active'
            }
          ],
          interfaces: [
            {
              id: 'if_001',
              name: 'Interface CRM-ERP',
              type: 'api',
              source: 'CRM System',
              target: 'ERP Core',
              protocol: 'REST/HTTPS',
              format: 'JSON',
              frequency: 'Real-time',
              volume: 10000,
              security: 'OAuth2 + TLS',
              monitoring: true
            }
          ],
          dependencies: ['Application Domain', 'Data Domain'],
          maturity: 85,
          criticality: 'critical',
          owner: 'business@company.com'
        }
      ],
      components: [
        {
          id: 'comp_001',
          name: 'ERP Core Application',
          type: 'application',
          category: 'Enterprise Application',
          description: 'Application principale du système ERP',
          vendor: 'Internal',
          version: '2.1.0',
          status: 'active',
          criticality: 'critical',
          lifecycle: {
            phase: 'production',
            startDate: '2024-01-01T00:00:00Z',
            milestones: [
              {
                name: 'Go-Live',
                date: '2024-06-01T00:00:00Z',
                status: 'completed',
                deliverables: ['Production Deployment', 'User Training', 'Documentation']
              }
            ],
            risks: [
              {
                description: 'Performance dégradée avec montée en charge',
                probability: 30,
                impact: 80,
                mitigation: 'Optimisation base de données et mise en place cache',
                owner: 'tech@company.com'
              }
            ]
          },
          dependencies: [
            {
              componentId: 'comp_002',
              type: 'hard',
              direction: 'downstream',
              criticality: 'critical',
              interface: 'Database Connection'
            }
          ],
          interfaces: [
            {
              id: 'int_comp_001',
              name: 'REST API',
              type: 'outbound',
              protocol: 'HTTPS',
              format: 'JSON',
              security: 'OAuth2',
              monitoring: true,
              documentation: '/api/docs'
            }
          ],
          deployment: {
            environment: 'production',
            infrastructure: 'Kubernetes Cluster',
            configuration: {
              replicas: 3,
              resources: { cpu: '2', memory: '4Gi' },
              storage: '100Gi'
            },
            scaling: {
              type: 'automatic',
              minInstances: 2,
              maxInstances: 10,
              metrics: ['cpu', 'memory', 'requests'],
              thresholds: { cpu: 70, memory: 80, requests: 1000 }
            },
            monitoring: {
              enabled: true,
              metrics: ['availability', 'performance', 'errors'],
              alerts: [
                {
                  name: 'High Error Rate',
                  condition: 'error_rate > 5%',
                  severity: 'critical',
                  recipients: ['ops@company.com']
                }
              ],
              dashboards: ['Application Dashboard', 'Performance Dashboard']
            },
            backup: {
              enabled: true,
              frequency: 'daily',
              retention: '30 days',
              location: 'Cloud Storage',
              encryption: true
            }
          },
          compliance: {
            frameworks: ['ISO27001', 'SOC2'],
            requirements: ['Data Protection', 'Access Control'],
            assessments: [
              {
                framework: 'ISO27001',
                date: '2024-10-01T00:00:00Z',
                score: 92,
                findings: ['Minor documentation gaps'],
                recommendations: ['Update security procedures']
              }
            ],
            certifications: ['ISO27001:2022'],
            audits: [
              {
                auditor: 'External Auditor',
                date: '2024-09-15T00:00:00Z',
                scope: 'Security Controls',
                result: 'pass',
                findings: ['All controls effective'],
                actions: []
              }
            ]
          },
          costs: {
            acquisition: 500000,
            licensing: 50000,
            maintenance: 75000,
            operation: 25000,
            support: 30000,
            total: 180000,
            currency: 'EUR',
            period: 'annually'
          },
          metrics: {
            availability: 99.95,
            performance: 1.2,
            reliability: 99.8,
            utilization: 65,
            errors: 0.02,
            throughput: 5000,
            latency: 150,
            lastUpdated: '2024-12-20T15:30:00Z'
          }
        }
      ],
      relationships: [
        {
          id: 'rel_001',
          name: 'ERP-Database Dependency',
          type: 'dependency',
          source: 'comp_001',
          target: 'comp_002',
          description: 'ERP Core dépend de la base de données PostgreSQL',
          strength: 'strong',
          direction: 'unidirectional',
          properties: { connectionType: 'persistent', poolSize: 20 }
        }
      ],
      principles: [
        {
          id: 'prin_001',
          name: 'API First',
          category: 'application',
          statement: 'Toutes les fonctionnalités doivent être exposées via des APIs',
          rationale: 'Facilite l\'intégration et la réutilisabilité',
          implications: ['Conception API avant UI', 'Documentation obligatoire', 'Versioning'],
          compliance: 95,
          exceptions: [],
          owner: 'architecture@company.com'
        }
      ],
      standards: [
        {
          id: 'std_001',
          name: 'REST API Standard',
          category: 'Integration',
          type: 'mandatory',
          description: 'Standard pour la conception des APIs REST',
          specification: 'OpenAPI 3.0 avec conventions internes',
          compliance: 92,
          adoption: 88,
          exceptions: [],
          owner: 'architecture@company.com'
        }
      ],
      governance: {
        board: {
          chair: 'cto@company.com',
          members: [
            {
              name: 'Jean Dupont',
              role: 'Enterprise Architect',
              department: 'IT',
              expertise: ['TOGAF', 'Cloud Architecture', 'Security']
            }
          ],
          frequency: 'Monthly',
          nextMeeting: '2025-01-15T14:00:00Z',
          charter: 'Architecture governance and decision making'
        },
        processes: [
          {
            id: 'proc_001',
            name: 'Architecture Review Process',
            description: 'Processus de revue des architectures',
            steps: [
              {
                name: 'Submission',
                description: 'Soumission du dossier d\'architecture',
                owner: 'Project Team',
                duration: '1 day',
                inputs: ['Architecture Document'],
                outputs: ['Review Request']
              }
            ],
            roles: [
              {
                name: 'Enterprise Architect',
                responsibilities: ['Review architecture', 'Provide guidance'],
                authority: ['Approve/Reject', 'Request changes'],
                skills: ['TOGAF', 'Domain expertise']
              }
            ],
            artifacts: ['Architecture Document', 'Review Report'],
            frequency: 'As needed'
          }
        ],
        reviews: [
          {
            id: 'rev_001',
            name: 'ERP Architecture Review Q4 2024',
            type: 'design',
            scope: 'Complete ERP architecture',
            reviewers: ['architecture@company.com', 'security@company.com'],
            date: '2024-12-01T00:00:00Z',
            status: 'completed',
            findings: [
              {
                category: 'Performance',
                severity: 'medium',
                description: 'Potential bottleneck in database layer',
                evidence: ['Load test results', 'Performance monitoring'],
                recommendation: 'Implement database sharding',
                owner: 'dba@company.com',
                dueDate: '2025-02-01T00:00:00Z'
              }
            ],
            recommendations: ['Implement caching layer', 'Optimize database queries'],
            decisions: ['Approved with conditions']
          }
        ],
        decisions: [
          {
            id: 'dec_001',
            title: 'Adoption de PostgreSQL comme SGBD principal',
            status: 'accepted',
            date: '2024-01-15T00:00:00Z',
            context: 'Besoin d\'un SGBD robuste pour l\'ERP',
            decision: 'PostgreSQL sera utilisé comme SGBD principal',
            rationale: 'Performance, fiabilité, support JSON, coût',
            consequences: ['Migration des données', 'Formation équipes', 'Nouveaux outils'],
            alternatives: [
              {
                name: 'Oracle Database',
                description: 'SGBD enterprise Oracle',
                pros: ['Performance', 'Support enterprise'],
                cons: ['Coût élevé', 'Vendor lock-in'],
                cost: 200000,
                risk: 30
              }
            ],
            stakeholders: ['DBA Team', 'Development Team', 'Operations'],
            approver: 'cto@company.com'
          }
        ],
        policies: [
          {
            id: 'pol_001',
            name: 'Security by Design',
            category: 'Security',
            description: 'La sécurité doit être intégrée dès la conception',
            rules: [
              {
                condition: 'New component',
                action: 'Security review required',
                severity: 'error',
                automated: true
              }
            ],
            compliance: 94,
            exceptions: [],
            owner: 'security@company.com'
          }
        ],
        compliance: {
          overall: 93,
          principles: 95,
          standards: 92,
          policies: 94,
          lastAssessment: '2024-12-01T00:00:00Z',
          nextAssessment: '2025-03-01T00:00:00Z',
          trends: [
            { date: '2024-09-01T00:00:00Z', principles: 92, standards: 88, policies: 90, overall: 90 },
            { date: '2024-12-01T00:00:00Z', principles: 95, standards: 92, policies: 94, overall: 93 }
          ]
        }
      },
      roadmap: {
        id: 'roadmap_001',
        name: 'ERP Evolution Roadmap 2024-2026',
        timeframe: '24 months',
        phases: [
          {
            id: 'phase_001',
            name: 'Modernisation Core',
            description: 'Modernisation du cœur applicatif ERP',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-12-31T00:00:00Z',
            objectives: ['Améliorer performance', 'Moderniser UI', 'Intégrer cloud'],
            deliverables: ['New UI Framework', 'Cloud Migration', 'API Gateway'],
            success: ['50% performance improvement', '99.9% availability'],
            status: 'in_progress'
          }
        ],
        initiatives: [
          {
            id: 'init_001',
            name: 'Migration Cloud Native',
            description: 'Migration vers architecture cloud native',
            type: 'strategic',
            priority: 'high',
            phase: 'phase_001',
            owner: 'cloudteam@company.com',
            budget: 500000,
            timeline: '12 months',
            status: 'in_progress',
            benefits: [
              {
                type: 'cost_reduction',
                description: 'Réduction coûts infrastructure',
                value: 200000,
                timeframe: 'Annual',
                measurement: 'Infrastructure costs'
              }
            ],
            risks: [
              {
                description: 'Complexité migration données',
                probability: 40,
                impact: 70,
                mitigation: 'Migration progressive par modules',
                owner: 'dba@company.com'
              }
            ]
          }
        ],
        dependencies: [
          {
            source: 'init_001',
            target: 'init_002',
            type: 'finish_to_start',
            lag: 30,
            critical: true
          }
        ],
        milestones: [
          {
            id: 'mile_001',
            name: 'Cloud Migration Complete',
            date: '2024-12-31T00:00:00Z',
            description: 'Migration complète vers le cloud',
            criteria: ['All services migrated', 'Performance validated'],
            status: 'planned',
            dependencies: ['init_001']
          }
        ],
        risks: [
          {
            id: 'risk_001',
            description: 'Retard dans la migration cloud',
            category: 'technical',
            probability: 30,
            impact: 80,
            mitigation: 'Plan de contingence avec infrastructure hybride',
            owner: 'cloudteam@company.com',
            status: 'open'
          }
        ],
        budget: {
          total: 2000000,
          allocated: 1500000,
          spent: 750000,
          remaining: 750000,
          currency: 'EUR',
          breakdown: [
            { category: 'Infrastructure', amount: 800000, percentage: 40 },
            { category: 'Development', amount: 600000, percentage: 30 },
            { category: 'Training', amount: 200000, percentage: 10 },
            { category: 'Consulting', amount: 400000, percentage: 20 }
          ],
          forecasts: [
            { period: 'Q1 2025', planned: 300000, actual: 280000, variance: -20000 },
            { period: 'Q2 2025', planned: 450000, actual: 0, variance: 0 }
          ]
        }
      },
      metrics: {
        complexity: {
          components: 45,
          interfaces: 120,
          dependencies: 89,
          cyclomaticComplexity: 15,
          couplingIndex: 0.65,
          cohesionIndex: 0.82
        },
        quality: {
          maintainability: 85,
          reliability: 92,
          security: 88,
          performance: 78,
          usability: 90,
          testability: 82
        },
        performance: {
          availability: 99.95,
          throughput: 5000,
          latency: 150,
          scalability: 85,
          efficiency: 78,
          capacity: 65
        },
        cost: {
          totalCost: 2500000,
          costPerTransaction: 0.05,
          costPerUser: 125,
          roi: 185,
          tco: 3200000,
          optimization: 22
        },
        risk: {
          overall: 35,
          technical: 40,
          business: 25,
          operational: 30,
          compliance: 15,
          security: 20
        },
        compliance: {
          overall: 93,
          principles: 95,
          standards: 92,
          policies: 94,
          frameworks: 90,
          audits: 96
        },
        lastUpdated: '2024-12-20T15:30:00Z'
      },
      stakeholders: ['cto@company.com', 'architecture@company.com', 'business@company.com'],
      owner: 'architecture@company.com',
      architect: 'jean.dupont@company.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z'
    }
  ];

  useEffect(() => {
    setArchitectures(mockArchitectures);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-600 bg-green-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'achieved': return 'text-green-600 bg-green-50';
      case 'pass': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'planned': return 'text-yellow-600 bg-yellow-50';
      case 'scheduled': return 'text-yellow-600 bg-yellow-50';
      case 'proposed': return 'text-yellow-600 bg-yellow-50';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50';
      case 'deprecated': return 'text-red-600 bg-red-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'retired': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      case 'missed': return 'text-red-600 bg-red-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderArchitectureCard = (architecture: EnterpriseArchitecture) => {
    return (
      <Card key={architecture.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{architecture.name}</CardTitle>
                <CardDescription className="text-sm">
                  {architecture.framework.toUpperCase()} • v{architecture.version} • {architecture.type}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(architecture.status)}>
              {architecture.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{architecture.description}</p>
            
            {/* Architecture Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{architecture.domains.length}</div>
                <div className="text-gray-500">Domaines</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{architecture.components.length}</div>
                <div className="text-gray-500">Composants</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{architecture.relationships.length}</div>
                <div className="text-gray-500">Relations</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{architecture.principles.length}</div>
                <div className="text-gray-500">Principes</div>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité Globale:</span>
                <span className={`font-medium ${architecture.governance.compliance.overall > 90 ? 'text-green-600' : architecture.governance.compliance.overall > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {architecture.governance.compliance.overall}%
                </span>
              </div>
              <Progress value={architecture.governance.compliance.overall} className="h-2" />
            </div>

            {/* Quality Metrics */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Métriques Qualité</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Maintenabilité:</span>
                  <div className="font-medium">{architecture.metrics.quality.maintainability}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Fiabilité:</span>
                  <div className="font-medium">{architecture.metrics.quality.reliability}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Sécurité:</span>
                  <div className="font-medium">{architecture.metrics.quality.security}%</div>
                </div>
              </div>
            </div>

            {/* Roadmap Progress */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Roadmap Progress:</div>
              <div className="space-y-1">
                {architecture.roadmap.phases.slice(0, 2).map(phase => (
                  <div key={phase.id} className="flex items-center justify-between text-sm">
                    <span>{phase.name}</span>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status}
                    </Badge>
                  </div>
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
              <div>Architecte: {architecture.architect}</div>
              <div>Propriétaire: {architecture.owner}</div>
              <div>MAJ: {new Date(architecture.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalArchitectures = architectures.length;
    const implementedArchitectures = architectures.filter(a => a.status === 'implemented').length;
    const avgCompliance = architectures.reduce((sum, a) => sum + a.governance.compliance.overall, 0) / totalArchitectures;
    const totalComponents = architectures.reduce((sum, a) => sum + a.components.length, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Architectures</p>
                <p className="text-2xl font-bold">{implementedArchitectures}/{totalArchitectures}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Composants Totaux</p>
                <p className="text-2xl font-bold text-purple-600">{totalComponents}</p>
              </div>
              <Layers className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Initiatives Actives</p>
                <p className="text-2xl font-bold text-orange-600">
                  {architectures.reduce((sum, a) => sum + a.roadmap.initiatives.filter(i => i.status === 'in_progress').length, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Architecture d'Entreprise</h1>
          <p className="text-gray-600">Gouvernance et gestion complète de l'architecture d'entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Architecture
          </Button>
          <Button size="sm" onClick={() => setShowArchitectureDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Architecture
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="architectures">Architectures</TabsTrigger>
          <TabsTrigger value="components">Composants</TabsTrigger>
          <TabsTrigger value="governance">Gouvernance</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Vue d'ensemble Architecture</CardTitle>
              <CardDescription>Panorama de l'architecture d'entreprise et métriques clés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard d'architecture en cours de développement</p>
                <p className="text-sm">Visualisation des domaines, composants et relations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architectures" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Architectures d'Entreprise</h2>
            <div className="flex items-center space-x-2">
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les frameworks</SelectItem>
                  <SelectItem value="togaf">TOGAF</SelectItem>
                  <SelectItem value="zachman">Zachman</SelectItem>
                  <SelectItem value="feaf">FEAF</SelectItem>
                  <SelectItem value="sabsa">SABSA</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowArchitectureDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Architecture
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architectures
              .filter(a => selectedFramework === 'all' || a.framework === selectedFramework)
              .map(renderArchitectureCard)}
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Composants d'Architecture</CardTitle>
              <CardDescription>Gestion des composants et de leurs relations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Layers className="h-12 w-12 mx-auto mb-4" />
                <p>Module de gestion des composants en cours de développement</p>
                <p className="text-sm">Catalogue de composants, dépendances et interfaces</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gouvernance Architecture</CardTitle>
              <CardDescription>Processus, politiques et conformité architecturale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Workflow className="h-12 w-12 mx-auto mb-4" />
                <p>Module de gouvernance en cours de développement</p>
                <p className="text-sm">Processus de revue, décisions et conformité</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Architecture</CardTitle>
              <CardDescription>Planification et évolution de l'architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-4" />
                <p>Module de roadmap en cours de développement</p>
                <p className="text-sm">Phases, initiatives et jalons d'évolution</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métriques Architecture</CardTitle>
              <CardDescription>Indicateurs de performance et qualité architecturale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de métriques en cours de développement</p>
                <p className="text-sm">Complexité, qualité, performance et coûts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseArchitectureManagement;
