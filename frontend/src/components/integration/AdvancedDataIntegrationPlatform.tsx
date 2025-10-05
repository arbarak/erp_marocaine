// Advanced Data Integration Platform Component

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
  Database, GitBranch, Workflow, Zap, Activity, RefreshCw,
  Plus, Download, Eye, Settings, BarChart3, CheckCircle,
  XCircle, AlertTriangle, Clock, Users, Network, Server,
  FileText, Archive, Filter, Search, Target, Globe
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Sankey } from 'recharts';

interface DataIntegrationPipeline {
  id: string;
  name: string;
  description: string;
  type: 'etl' | 'elt' | 'streaming' | 'batch' | 'real_time' | 'hybrid';
  status: 'active' | 'inactive' | 'error' | 'paused' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: DataSource;
  target: DataTarget;
  transformations: DataTransformation[];
  schedule: PipelineSchedule;
  monitoring: PipelineMonitoring;
  quality: DataQuality;
  lineage: DataLineage;
  performance: PipelinePerformance;
  security: DataSecurity;
  owner: string;
  createdAt: string;
  updatedAt: string;
  lastRun: string;
  nextRun: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'file' | 'api' | 'stream' | 'cloud' | 'application';
  subtype: string;
  connection: ConnectionConfig;
  schema: DataSchema;
  format: DataFormat;
  volume: DataVolume;
  freshness: DataFreshness;
  availability: number;
  credentials: CredentialConfig;
}

interface DataTarget {
  id: string;
  name: string;
  type: 'database' | 'file' | 'api' | 'warehouse' | 'lake' | 'cache';
  subtype: string;
  connection: ConnectionConfig;
  schema: DataSchema;
  format: DataFormat;
  partitioning: PartitioningConfig;
  indexing: IndexingConfig;
  compression: CompressionConfig;
  credentials: CredentialConfig;
}

interface ConnectionConfig {
  host: string;
  port: number;
  database?: string;
  protocol: string;
  ssl: boolean;
  timeout: number;
  poolSize: number;
  retries: number;
  parameters: { [key: string]: any };
}

interface DataSchema {
  name: string;
  version: string;
  fields: SchemaField[];
  constraints: SchemaConstraint[];
  relationships: SchemaRelationship[];
  metadata: { [key: string]: any };
}

interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
  defaultValue?: any;
  description: string;
  constraints: FieldConstraint[];
}

interface FieldConstraint {
  type: 'unique' | 'check' | 'range' | 'pattern' | 'length';
  value: any;
  message: string;
}

interface SchemaConstraint {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
  fields: string[];
  reference?: string;
  condition?: string;
}

interface SchemaRelationship {
  name: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  source: string;
  target: string;
  fields: { [key: string]: string };
}

interface DataFormat {
  type: 'json' | 'xml' | 'csv' | 'parquet' | 'avro' | 'orc' | 'binary';
  encoding: string;
  delimiter?: string;
  headers?: boolean;
  compression?: string;
  schema?: string;
}

interface DataVolume {
  recordCount: number;
  sizeBytes: number;
  growthRate: number;
  peakThroughput: number;
  avgThroughput: number;
  estimatedDaily: number;
}

interface DataFreshness {
  updateFrequency: string;
  lastUpdate: string;
  staleness: number;
  sla: number;
  alertThreshold: number;
}

interface CredentialConfig {
  type: 'basic' | 'oauth' | 'token' | 'certificate' | 'kerberos';
  username?: string;
  password?: string;
  token?: string;
  certificate?: string;
  keystore?: string;
  encrypted: boolean;
  rotation: boolean;
  expiryDate?: string;
}

interface PartitioningConfig {
  enabled: boolean;
  strategy: 'range' | 'hash' | 'list' | 'composite';
  fields: string[];
  buckets?: number;
  ranges?: PartitionRange[];
}

interface PartitionRange {
  name: string;
  minValue: any;
  maxValue: any;
  location?: string;
}

interface IndexingConfig {
  enabled: boolean;
  indexes: DataIndex[];
  autoOptimize: boolean;
  statistics: boolean;
}

interface DataIndex {
  name: string;
  type: 'btree' | 'hash' | 'bitmap' | 'fulltext' | 'spatial';
  fields: string[];
  unique: boolean;
  clustered: boolean;
  size: number;
  usage: number;
}

interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'snappy' | 'zstd' | 'brotli';
  level: number;
  ratio: number;
  savings: number;
}

interface DataTransformation {
  id: string;
  name: string;
  type: 'mapping' | 'filtering' | 'aggregation' | 'enrichment' | 'validation' | 'cleansing';
  order: number;
  enabled: boolean;
  configuration: TransformationConfig;
  performance: TransformationPerformance;
  quality: TransformationQuality;
  dependencies: string[];
}

interface TransformationConfig {
  rules: TransformationRule[];
  functions: TransformationFunction[];
  lookups: LookupTable[];
  validations: ValidationRule[];
  parameters: { [key: string]: any };
}

interface TransformationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  description: string;
}

interface TransformationFunction {
  name: string;
  type: 'built_in' | 'custom' | 'udf';
  language: string;
  code: string;
  parameters: FunctionParameter[];
  returnType: string;
}

interface FunctionParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface LookupTable {
  name: string;
  source: string;
  keyField: string;
  valueFields: string[];
  cacheEnabled: boolean;
  refreshInterval: string;
  size: number;
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  field: string;
  condition: string;
  severity: 'warning' | 'error' | 'critical';
  action: 'log' | 'reject' | 'quarantine' | 'fix';
  message: string;
}

interface TransformationPerformance {
  avgExecutionTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  successRate: number;
}

interface TransformationQuality {
  validRecords: number;
  invalidRecords: number;
  duplicates: number;
  nullValues: number;
  outliers: number;
  qualityScore: number;
}

interface PipelineSchedule {
  type: 'manual' | 'cron' | 'event' | 'dependency';
  expression?: string;
  timezone: string;
  enabled: boolean;
  startDate: string;
  endDate?: string;
  triggers: ScheduleTrigger[];
  dependencies: PipelineDependency[];
}

interface ScheduleTrigger {
  type: 'time' | 'file' | 'data' | 'api' | 'message';
  condition: string;
  parameters: { [key: string]: any };
  enabled: boolean;
}

interface PipelineDependency {
  pipelineId: string;
  type: 'success' | 'completion' | 'data_available';
  timeout: number;
  retries: number;
}

interface PipelineMonitoring {
  enabled: boolean;
  metrics: MonitoringMetric[];
  alerts: MonitoringAlert[];
  notifications: NotificationConfig[];
  dashboards: string[];
  logs: LogConfig;
}

interface MonitoringMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  unit: string;
  description: string;
  thresholds: MetricThreshold[];
  retention: string;
}

interface MetricThreshold {
  level: 'info' | 'warning' | 'critical';
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  value: number;
  duration: string;
}

interface MonitoringAlert {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  recipients: string[];
  channels: string[];
  throttle: string;
  escalation: EscalationRule[];
}

interface EscalationRule {
  level: number;
  delay: string;
  recipients: string[];
  channels: string[];
}

interface NotificationConfig {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  endpoint: string;
  template: string;
  enabled: boolean;
  filters: NotificationFilter[];
}

interface NotificationFilter {
  field: string;
  operator: string;
  value: any;
}

interface LogConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  format: 'json' | 'text' | 'structured';
  retention: string;
  compression: boolean;
  sampling: number;
  destinations: LogDestination[];
}

interface LogDestination {
  type: 'file' | 'database' | 'elasticsearch' | 'splunk' | 'cloudwatch';
  endpoint: string;
  format: string;
  enabled: boolean;
}

interface DataQuality {
  enabled: boolean;
  rules: QualityRule[];
  metrics: QualityMetric[];
  reports: QualityReport[];
  thresholds: QualityThreshold[];
  remediation: RemediationAction[];
}

interface QualityRule {
  id: string;
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'uniqueness' | 'timeliness';
  field: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  history: QualityDataPoint[];
}

interface QualityDataPoint {
  timestamp: string;
  value: number;
  target: number;
}

interface QualityReport {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'trend' | 'exception';
  schedule: string;
  recipients: string[];
  format: 'pdf' | 'html' | 'csv' | 'json';
  enabled: boolean;
}

interface QualityThreshold {
  metric: string;
  warning: number;
  critical: number;
  action: 'log' | 'alert' | 'stop' | 'quarantine';
}

interface RemediationAction {
  trigger: string;
  type: 'automatic' | 'manual' | 'workflow';
  action: string;
  parameters: { [key: string]: any };
  enabled: boolean;
}

interface DataLineage {
  enabled: boolean;
  upstream: LineageNode[];
  downstream: LineageNode[];
  transformations: LineageTransformation[];
  impact: ImpactAnalysis;
  governance: LineageGovernance;
}

interface LineageNode {
  id: string;
  name: string;
  type: 'source' | 'target' | 'transformation' | 'view' | 'report';
  system: string;
  schema: string;
  table: string;
  fields: string[];
  metadata: { [key: string]: any };
}

interface LineageTransformation {
  id: string;
  name: string;
  type: string;
  sourceFields: string[];
  targetFields: string[];
  logic: string;
  dependencies: string[];
}

interface ImpactAnalysis {
  enabled: boolean;
  scope: 'field' | 'table' | 'schema' | 'system';
  depth: number;
  analysis: ImpactResult[];
}

interface ImpactResult {
  node: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affected: string[];
  recommendations: string[];
}

interface LineageGovernance {
  classification: DataClassification[];
  privacy: PrivacyRule[];
  retention: RetentionPolicy[];
  access: AccessControl[];
}

interface DataClassification {
  field: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  category: string;
  tags: string[];
  rules: ClassificationRule[];
}

interface ClassificationRule {
  condition: string;
  action: string;
  parameters: { [key: string]: any };
}

interface PrivacyRule {
  field: string;
  type: 'pii' | 'phi' | 'financial' | 'sensitive';
  protection: 'mask' | 'encrypt' | 'tokenize' | 'anonymize';
  scope: string[];
  exceptions: string[];
}

interface RetentionPolicy {
  scope: string;
  period: string;
  action: 'delete' | 'archive' | 'anonymize';
  conditions: string[];
  exceptions: string[];
}

interface AccessControl {
  principal: string;
  type: 'user' | 'group' | 'role' | 'service';
  permissions: string[];
  conditions: string[];
  expiry?: string;
}

interface PipelinePerformance {
  execution: ExecutionMetrics;
  resource: ResourceMetrics;
  throughput: ThroughputMetrics;
  latency: LatencyMetrics;
  reliability: ReliabilityMetrics;
  cost: CostMetrics;
}

interface ExecutionMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  lastRun: string;
  nextRun: string;
}

interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  parallelism: number;
  efficiency: number;
}

interface ThroughputMetrics {
  recordsPerSecond: number;
  bytesPerSecond: number;
  peakThroughput: number;
  avgThroughput: number;
  bottlenecks: string[];
}

interface LatencyMetrics {
  endToEndLatency: number;
  processingLatency: number;
  networkLatency: number;
  queueLatency: number;
  p50: number;
  p95: number;
  p99: number;
}

interface ReliabilityMetrics {
  availability: number;
  mtbf: number;
  mttr: number;
  errorRate: number;
  retryRate: number;
  slaCompliance: number;
}

interface CostMetrics {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  licenseCost: number;
  totalCost: number;
  costPerRecord: number;
  costPerGB: number;
  optimization: number;
}

interface DataSecurity {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  auditing: AuditingConfig;
  compliance: ComplianceConfig;
  threats: ThreatProtection;
}

interface EncryptionConfig {
  inTransit: boolean;
  atRest: boolean;
  algorithm: string;
  keyManagement: string;
  rotation: boolean;
  strength: number;
}

interface AuthenticationConfig {
  method: 'basic' | 'oauth' | 'saml' | 'ldap' | 'certificate';
  mfa: boolean;
  sso: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
}

interface PasswordPolicy {
  minLength: number;
  complexity: boolean;
  expiry: number;
  history: number;
  lockout: LockoutPolicy;
}

interface LockoutPolicy {
  attempts: number;
  duration: number;
  progressive: boolean;
}

interface AuthorizationConfig {
  model: 'rbac' | 'abac' | 'dac' | 'mac';
  roles: Role[];
  policies: AuthorizationPolicy[];
  inheritance: boolean;
  delegation: boolean;
}

interface Role {
  name: string;
  permissions: string[];
  constraints: string[];
  inheritance: string[];
}

interface AuthorizationPolicy {
  name: string;
  effect: 'allow' | 'deny';
  principals: string[];
  resources: string[];
  actions: string[];
  conditions: string[];
}

interface AuditingConfig {
  enabled: boolean;
  events: string[];
  retention: string;
  format: string;
  destination: string;
  realTime: boolean;
  integrity: boolean;
}

interface ComplianceConfig {
  frameworks: string[];
  requirements: string[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  reports: ComplianceReport[];
}

interface ComplianceControl {
  id: string;
  name: string;
  framework: string;
  requirement: string;
  implementation: string;
  testing: string;
  evidence: string[];
  status: 'implemented' | 'planned' | 'not_applicable';
}

interface ComplianceAssessment {
  framework: string;
  date: string;
  assessor: string;
  scope: string;
  result: 'compliant' | 'non_compliant' | 'partial';
  findings: string[];
  recommendations: string[];
}

interface ComplianceReport {
  name: string;
  framework: string;
  schedule: string;
  recipients: string[];
  format: string;
  automated: boolean;
}

interface ThreatProtection {
  detection: ThreatDetection;
  prevention: ThreatPrevention;
  response: ThreatResponse;
  intelligence: ThreatIntelligence;
}

interface ThreatDetection {
  enabled: boolean;
  methods: string[];
  rules: DetectionRule[];
  ml: boolean;
  realTime: boolean;
}

interface DetectionRule {
  name: string;
  type: string;
  condition: string;
  severity: string;
  action: string;
  enabled: boolean;
}

interface ThreatPrevention {
  firewall: boolean;
  ids: boolean;
  ips: boolean;
  dlp: boolean;
  sandbox: boolean;
  quarantine: boolean;
}

interface ThreatResponse {
  automated: boolean;
  playbooks: ResponsePlaybook[];
  escalation: ResponseEscalation[];
  notification: boolean;
  isolation: boolean;
}

interface ResponsePlaybook {
  name: string;
  trigger: string;
  actions: ResponseAction[];
  approval: boolean;
  timeout: number;
}

interface ResponseAction {
  type: string;
  parameters: { [key: string]: any };
  order: number;
  timeout: number;
}

interface ResponseEscalation {
  level: number;
  delay: string;
  recipients: string[];
  actions: string[];
}

interface ThreatIntelligence {
  feeds: IntelligenceFeed[];
  correlation: boolean;
  enrichment: boolean;
  sharing: boolean;
  retention: string;
}

interface IntelligenceFeed {
  name: string;
  source: string;
  type: string;
  format: string;
  frequency: string;
  enabled: boolean;
}

const AdvancedDataIntegrationPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pipelines');
  const [pipelines, setPipelines] = useState<DataIntegrationPipeline[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showPipelineDialog, setShowPipelineDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data integration pipelines
  const mockPipelines: DataIntegrationPipeline[] = [
    {
      id: 'pipeline_001',
      name: 'Synchronisation CRM-ERP',
      description: 'Pipeline de synchronisation des données clients entre CRM et ERP',
      type: 'real_time',
      status: 'active',
      priority: 'high',
      source: {
        id: 'src_crm',
        name: 'CRM Database',
        type: 'database',
        subtype: 'postgresql',
        connection: {
          host: 'crm-db.company.com',
          port: 5432,
          database: 'crm_prod',
          protocol: 'postgresql',
          ssl: true,
          timeout: 30,
          poolSize: 10,
          retries: 3,
          parameters: { schema: 'public' }
        },
        schema: {
          name: 'customers',
          version: '1.2',
          fields: [
            {
              name: 'customer_id',
              type: 'uuid',
              nullable: false,
              primaryKey: true,
              description: 'Identifiant unique du client',
              constraints: []
            },
            {
              name: 'email',
              type: 'varchar(255)',
              nullable: false,
              primaryKey: false,
              description: 'Adresse email du client',
              constraints: [
                { type: 'unique', value: true, message: 'Email must be unique' },
                { type: 'pattern', value: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$', message: 'Invalid email format' }
              ]
            }
          ],
          constraints: [
            {
              name: 'pk_customers',
              type: 'primary_key',
              fields: ['customer_id']
            }
          ],
          relationships: [],
          metadata: { lastUpdated: '2024-12-20T15:30:00Z' }
        },
        format: {
          type: 'json',
          encoding: 'utf-8'
        },
        volume: {
          recordCount: 150000,
          sizeBytes: 52428800,
          growthRate: 5.2,
          peakThroughput: 1000,
          avgThroughput: 250,
          estimatedDaily: 500
        },
        freshness: {
          updateFrequency: 'real-time',
          lastUpdate: '2024-12-20T15:30:00Z',
          staleness: 0,
          sla: 300,
          alertThreshold: 600
        },
        availability: 99.95,
        credentials: {
          type: 'basic',
          username: 'crm_reader',
          encrypted: true,
          rotation: true,
          expiryDate: '2025-06-01T00:00:00Z'
        }
      },
      target: {
        id: 'tgt_erp',
        name: 'ERP Database',
        type: 'database',
        subtype: 'postgresql',
        connection: {
          host: 'erp-db.company.com',
          port: 5432,
          database: 'erp_prod',
          protocol: 'postgresql',
          ssl: true,
          timeout: 30,
          poolSize: 15,
          retries: 3,
          parameters: { schema: 'public' }
        },
        schema: {
          name: 'customers',
          version: '2.0',
          fields: [
            {
              name: 'id',
              type: 'uuid',
              nullable: false,
              primaryKey: true,
              description: 'Identifiant unique du client dans l\'ERP',
              constraints: []
            }
          ],
          constraints: [],
          relationships: [],
          metadata: {}
        },
        format: {
          type: 'json',
          encoding: 'utf-8'
        },
        partitioning: {
          enabled: true,
          strategy: 'range',
          fields: ['created_date'],
          ranges: [
            { name: 'current_year', minValue: '2024-01-01', maxValue: '2024-12-31' },
            { name: 'previous_year', minValue: '2023-01-01', maxValue: '2023-12-31' }
          ]
        },
        indexing: {
          enabled: true,
          indexes: [
            {
              name: 'idx_customer_email',
              type: 'btree',
              fields: ['email'],
              unique: true,
              clustered: false,
              size: 1048576,
              usage: 85
            }
          ],
          autoOptimize: true,
          statistics: true
        },
        compression: {
          enabled: true,
          algorithm: 'lz4',
          level: 3,
          ratio: 3.2,
          savings: 68
        },
        credentials: {
          type: 'basic',
          username: 'erp_writer',
          encrypted: true,
          rotation: true,
          expiryDate: '2025-06-01T00:00:00Z'
        }
      },
      transformations: [
        {
          id: 'trans_001',
          name: 'Mapping des champs',
          type: 'mapping',
          order: 1,
          enabled: true,
          configuration: {
            rules: [
              {
                id: 'rule_001',
                name: 'Map customer_id to id',
                condition: 'source.customer_id IS NOT NULL',
                action: 'target.id = source.customer_id',
                priority: 1,
                enabled: true,
                description: 'Mapping de l\'identifiant client'
              }
            ],
            functions: [],
            lookups: [],
            validations: [
              {
                id: 'val_001',
                name: 'Email validation',
                type: 'format',
                field: 'email',
                condition: 'email MATCHES \'^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$\'',
                severity: 'error',
                action: 'reject',
                message: 'Invalid email format'
              }
            ],
            parameters: {}
          },
          performance: {
            avgExecutionTime: 150,
            throughput: 1000,
            memoryUsage: 256,
            cpuUsage: 15,
            errorRate: 0.02,
            successRate: 99.98
          },
          quality: {
            validRecords: 149970,
            invalidRecords: 30,
            duplicates: 5,
            nullValues: 12,
            outliers: 8,
            qualityScore: 99.8
          },
          dependencies: []
        }
      ],
      schedule: {
        type: 'event',
        timezone: 'Europe/Paris',
        enabled: true,
        startDate: '2024-01-01T00:00:00Z',
        triggers: [
          {
            type: 'data',
            condition: 'NEW_RECORDS_AVAILABLE',
            parameters: { table: 'customers', threshold: 1 },
            enabled: true
          }
        ],
        dependencies: []
      },
      monitoring: {
        enabled: true,
        metrics: [
          {
            name: 'records_processed',
            type: 'counter',
            unit: 'records',
            description: 'Nombre d\'enregistrements traités',
            thresholds: [
              { level: 'warning', operator: 'lt', value: 100, duration: '5m' },
              { level: 'critical', operator: 'lt', value: 10, duration: '10m' }
            ],
            retention: '30d'
          }
        ],
        alerts: [
          {
            id: 'alert_001',
            name: 'Pipeline Failure',
            condition: 'error_rate > 5%',
            severity: 'critical',
            enabled: true,
            recipients: ['ops@company.com'],
            channels: ['email', 'slack'],
            throttle: '15m',
            escalation: [
              {
                level: 1,
                delay: '15m',
                recipients: ['manager@company.com'],
                channels: ['email']
              }
            ]
          }
        ],
        notifications: [
          {
            type: 'email',
            endpoint: 'ops@company.com',
            template: 'pipeline_alert',
            enabled: true,
            filters: [
              { field: 'severity', operator: 'gte', value: 'warning' }
            ]
          }
        ],
        dashboards: ['Pipeline Overview', 'Performance Metrics'],
        logs: {
          level: 'info',
          format: 'json',
          retention: '90d',
          compression: true,
          sampling: 100,
          destinations: [
            {
              type: 'elasticsearch',
              endpoint: 'https://logs.company.com',
              format: 'json',
              enabled: true
            }
          ]
        }
      },
      quality: {
        enabled: true,
        rules: [
          {
            id: 'qr_001',
            name: 'Email completeness',
            type: 'completeness',
            field: 'email',
            condition: 'email IS NOT NULL AND email != \'\'',
            severity: 'high',
            enabled: true,
            description: 'Vérification que l\'email est renseigné'
          }
        ],
        metrics: [
          {
            name: 'completeness',
            value: 99.8,
            target: 99.5,
            trend: 'stable',
            lastUpdated: '2024-12-20T15:30:00Z',
            history: [
              { timestamp: '2024-12-19T15:30:00Z', value: 99.7, target: 99.5 },
              { timestamp: '2024-12-20T15:30:00Z', value: 99.8, target: 99.5 }
            ]
          }
        ],
        reports: [
          {
            id: 'qr_001',
            name: 'Daily Quality Report',
            type: 'summary',
            schedule: '0 8 * * *',
            recipients: ['data-team@company.com'],
            format: 'html',
            enabled: true
          }
        ],
        thresholds: [
          {
            metric: 'completeness',
            warning: 95,
            critical: 90,
            action: 'alert'
          }
        ],
        remediation: [
          {
            trigger: 'completeness < 95%',
            type: 'automatic',
            action: 'quarantine_invalid_records',
            parameters: { quarantine_table: 'data_quarantine' },
            enabled: true
          }
        ]
      },
      lineage: {
        enabled: true,
        upstream: [
          {
            id: 'crm_customers',
            name: 'CRM Customers Table',
            type: 'source',
            system: 'CRM',
            schema: 'public',
            table: 'customers',
            fields: ['customer_id', 'email', 'name'],
            metadata: { owner: 'crm-team@company.com' }
          }
        ],
        downstream: [
          {
            id: 'erp_customers',
            name: 'ERP Customers Table',
            type: 'target',
            system: 'ERP',
            schema: 'public',
            table: 'customers',
            fields: ['id', 'email', 'name'],
            metadata: { owner: 'erp-team@company.com' }
          }
        ],
        transformations: [
          {
            id: 'trans_mapping',
            name: 'Field Mapping',
            type: 'mapping',
            sourceFields: ['customer_id'],
            targetFields: ['id'],
            logic: 'Direct mapping',
            dependencies: []
          }
        ],
        impact: {
          enabled: true,
          scope: 'table',
          depth: 3,
          analysis: [
            {
              node: 'erp_customers',
              impact: 'high',
              affected: ['customer_reports', 'billing_system'],
              recommendations: ['Test downstream systems', 'Notify stakeholders']
            }
          ]
        },
        governance: {
          classification: [
            {
              field: 'email',
              level: 'confidential',
              category: 'PII',
              tags: ['personal', 'contact'],
              rules: [
                {
                  condition: 'field_contains_email',
                  action: 'apply_pii_protection',
                  parameters: { method: 'mask' }
                }
              ]
            }
          ],
          privacy: [
            {
              field: 'email',
              type: 'pii',
              protection: 'mask',
              scope: ['development', 'testing'],
              exceptions: ['production_support']
            }
          ],
          retention: [
            {
              scope: 'customer_data',
              period: '7 years',
              action: 'archive',
              conditions: ['customer_inactive > 2 years'],
              exceptions: ['legal_hold']
            }
          ],
          access: [
            {
              principal: 'data_analysts',
              type: 'group',
              permissions: ['read'],
              conditions: ['masked_data_only'],
              expiry: '2025-12-31T23:59:59Z'
            }
          ]
        }
      },
      performance: {
        execution: {
          totalRuns: 2880,
          successfulRuns: 2875,
          failedRuns: 5,
          avgDuration: 45,
          minDuration: 12,
          maxDuration: 180,
          lastRun: '2024-12-20T15:30:00Z',
          nextRun: '2024-12-20T15:35:00Z'
        },
        resource: {
          cpuUsage: 25,
          memoryUsage: 512,
          diskUsage: 1024,
          networkUsage: 256,
          parallelism: 4,
          efficiency: 85
        },
        throughput: {
          recordsPerSecond: 1000,
          bytesPerSecond: 1048576,
          peakThroughput: 2500,
          avgThroughput: 1000,
          bottlenecks: ['network_latency']
        },
        latency: {
          endToEndLatency: 45,
          processingLatency: 30,
          networkLatency: 10,
          queueLatency: 5,
          p50: 40,
          p95: 80,
          p99: 120
        },
        reliability: {
          availability: 99.95,
          mtbf: 720,
          mttr: 15,
          errorRate: 0.17,
          retryRate: 2.1,
          slaCompliance: 99.8
        },
        cost: {
          computeCost: 150,
          storageCost: 50,
          networkCost: 25,
          licenseCost: 100,
          totalCost: 325,
          costPerRecord: 0.002,
          costPerGB: 6.5,
          optimization: 15
        }
      },
      security: {
        encryption: {
          inTransit: true,
          atRest: true,
          algorithm: 'AES-256',
          keyManagement: 'AWS KMS',
          rotation: true,
          strength: 256
        },
        authentication: {
          method: 'oauth',
          mfa: true,
          sso: true,
          sessionTimeout: 3600,
          passwordPolicy: {
            minLength: 12,
            complexity: true,
            expiry: 90,
            history: 12,
            lockout: {
              attempts: 5,
              duration: 900,
              progressive: true
            }
          }
        },
        authorization: {
          model: 'rbac',
          roles: [
            {
              name: 'pipeline_operator',
              permissions: ['read', 'execute'],
              constraints: ['time_based'],
              inheritance: []
            }
          ],
          policies: [
            {
              name: 'data_access_policy',
              effect: 'allow',
              principals: ['data_team'],
              resources: ['pipeline_001'],
              actions: ['read', 'execute'],
              conditions: ['time_of_day < 18:00']
            }
          ],
          inheritance: true,
          delegation: false
        },
        auditing: {
          enabled: true,
          events: ['access', 'execution', 'modification'],
          retention: '7 years',
          format: 'json',
          destination: 'audit_log_system',
          realTime: true,
          integrity: true
        },
        compliance: {
          frameworks: ['GDPR', 'SOX', 'ISO27001'],
          requirements: ['Data Protection', 'Audit Trail', 'Access Control'],
          controls: [
            {
              id: 'ctrl_001',
              name: 'Data Encryption',
              framework: 'GDPR',
              requirement: 'Article 32',
              implementation: 'AES-256 encryption',
              testing: 'Automated',
              evidence: ['encryption_config.json'],
              status: 'implemented'
            }
          ],
          assessments: [
            {
              framework: 'GDPR',
              date: '2024-10-01T00:00:00Z',
              assessor: 'External Auditor',
              scope: 'Data Processing Pipeline',
              result: 'compliant',
              findings: [],
              recommendations: []
            }
          ],
          reports: [
            {
              name: 'GDPR Compliance Report',
              framework: 'GDPR',
              schedule: 'quarterly',
              recipients: ['dpo@company.com'],
              format: 'pdf',
              automated: true
            }
          ]
        },
        threats: {
          detection: {
            enabled: true,
            methods: ['signature', 'anomaly', 'behavioral'],
            rules: [
              {
                name: 'Unusual Data Access',
                type: 'anomaly',
                condition: 'access_volume > baseline * 3',
                severity: 'medium',
                action: 'alert',
                enabled: true
              }
            ],
            ml: true,
            realTime: true
          },
          prevention: {
            firewall: true,
            ids: true,
            ips: true,
            dlp: true,
            sandbox: false,
            quarantine: true
          },
          response: {
            automated: true,
            playbooks: [
              {
                name: 'Data Breach Response',
                trigger: 'data_exfiltration_detected',
                actions: [
                  {
                    type: 'isolate_pipeline',
                    parameters: { pipeline_id: 'pipeline_001' },
                    order: 1,
                    timeout: 300
                  }
                ],
                approval: false,
                timeout: 600
              }
            ],
            escalation: [
              {
                level: 1,
                delay: '5m',
                recipients: ['security@company.com'],
                actions: ['notify']
              }
            ],
            notification: true,
            isolation: true
          },
          intelligence: {
            feeds: [
              {
                name: 'Threat Intelligence Feed',
                source: 'Commercial Provider',
                type: 'IOC',
                format: 'STIX',
                frequency: 'hourly',
                enabled: true
              }
            ],
            correlation: true,
            enrichment: true,
            sharing: false,
            retention: '1 year'
          }
        }
      },
      owner: 'data-team@company.com',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z',
      lastRun: '2024-12-20T15:30:00Z',
      nextRun: '2024-12-20T15:35:00Z'
    }
  ];

  useEffect(() => {
    setPipelines(mockPipelines);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderPipelineCard = (pipeline: DataIntegrationPipeline) => {
    const successRate = (pipeline.performance.execution.successfulRuns / pipeline.performance.execution.totalRuns) * 100;

    return (
      <Card key={pipeline.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                <CardDescription className="text-sm">
                  {pipeline.type} • {pipeline.source.name} → {pipeline.target.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(pipeline.priority)}>
                {pipeline.priority}
              </Badge>
              <Badge className={getStatusColor(pipeline.status)}>
                {pipeline.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{pipeline.description}</p>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{successRate.toFixed(1)}%</div>
                <div className="text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{pipeline.performance.throughput.recordsPerSecond}</div>
                <div className="text-gray-500">Records/sec</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{pipeline.performance.latency.endToEndLatency}s</div>
                <div className="text-gray-500">Latence</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{pipeline.performance.reliability.availability}%</div>
                <div className="text-gray-500">Disponibilité</div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Qualité des Données:</span>
                <span className={`font-medium ${pipeline.quality.metrics[0].value > 95 ? 'text-green-600' : pipeline.quality.metrics[0].value > 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {pipeline.quality.metrics[0].value}%
                </span>
              </div>
              <Progress value={pipeline.quality.metrics[0].value} className="h-2" />
            </div>

            {/* Transformations */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Transformations ({pipeline.transformations.length}):</div>
              <div className="space-y-1">
                {pipeline.transformations.slice(0, 2).map(transform => (
                  <div key={transform.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{transform.name}</span>
                      <Badge className={transform.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {transform.enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Type: {transform.type} • Succès: {transform.performance.successRate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Sécurité & Conformité</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Chiffrement:</span>
                  <Badge className={pipeline.security.encryption.inTransit && pipeline.security.encryption.atRest ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                    {pipeline.security.encryption.inTransit && pipeline.security.encryption.atRest ? 'Complet' : 'Partiel'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Conformité:</span>
                  <div className="font-medium">{pipeline.security.compliance.frameworks.length} frameworks</div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <div className="font-medium capitalize">{pipeline.schedule.type}</div>
              </div>
              <div>
                <span className="text-gray-600">Prochaine exécution:</span>
                <div className="font-medium">{new Date(pipeline.nextRun).toLocaleTimeString('fr-FR')}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Détails
              </Button>
              <Button size="sm" variant="outline">
                <Activity className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Propriétaire: {pipeline.owner}</div>
              <div>Dernière exécution: {new Date(pipeline.lastRun).toLocaleString('fr-FR')}</div>
              <div>Coût total: {pipeline.performance.cost.totalCost}€/mois</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalPipelines = pipelines.length;
    const activePipelines = pipelines.filter(p => p.status === 'active').length;
    const avgSuccessRate = pipelines.reduce((sum, p) => sum + (p.performance.execution.successfulRuns / p.performance.execution.totalRuns * 100), 0) / totalPipelines;
    const totalRecordsProcessed = pipelines.reduce((sum, p) => sum + p.source.volume.recordCount, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipelines Actifs</p>
                <p className="text-2xl font-bold">{activePipelines}/{totalPipelines}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Succès</p>
                <p className="text-2xl font-bold text-green-600">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Records Traités</p>
                <p className="text-2xl font-bold text-purple-600">{(totalRecordsProcessed / 1000000).toFixed(1)}M</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pipelines.reduce((sum, p) => sum + p.performance.cost.totalCost, 0)}€
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Plateforme d'Intégration de Données Avancée</h1>
          <p className="text-gray-600">Orchestration et gestion complète des pipelines de données d'entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Intégration
          </Button>
          <Button size="sm" onClick={() => setShowPipelineDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Pipeline
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="lineage">Lignage</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de pipeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="etl">ETL</SelectItem>
                <SelectItem value="elt">ELT</SelectItem>
                <SelectItem value="streaming">Streaming</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="real_time">Temps réel</SelectItem>
                <SelectItem value="hybrid">Hybride</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="paused">En pause</SelectItem>
                <SelectItem value="scheduled">Planifié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pipelines
              .filter(p => selectedType === 'all' || p.type === selectedType)
              .filter(p => selectedStatus === 'all' || p.status === selectedStatus)
              .map(renderPipelineCard)}
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sources de Données</CardTitle>
              <CardDescription>Gestion des sources et connecteurs de données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4" />
                <p>Module de gestion des sources en cours de développement</p>
                <p className="text-sm">Catalogue de sources, connecteurs et schémas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Qualité des Données</CardTitle>
              <CardDescription>Monitoring et amélioration de la qualité des données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>Module de qualité des données en cours de développement</p>
                <p className="text-sm">Règles de qualité, métriques et rapports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lignage des Données</CardTitle>
              <CardDescription>Traçabilité et impact des données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Network className="h-12 w-12 mx-auto mb-4" />
                <p>Module de lignage en cours de développement</p>
                <p className="text-sm">Visualisation des flux et analyse d'impact</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring des Pipelines</CardTitle>
              <CardDescription>Surveillance et alertes en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring en cours de développement</p>
                <p className="text-sm">Métriques temps réel et alertes intelligentes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité des Données</CardTitle>
              <CardDescription>Protection et conformité des données</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <p>Module de sécurité en cours de développement</p>
                <p className="text-sm">Chiffrement, contrôle d'accès et audit</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDataIntegrationPlatform;
