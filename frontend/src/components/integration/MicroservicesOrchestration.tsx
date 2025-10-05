// Microservices Orchestration Component

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
  Server, Network, Cpu, Activity, Zap, RefreshCw, Plus,
  Download, Eye, Settings, BarChart3, CheckCircle, XCircle,
  AlertTriangle, Clock, Users, Database, Globe, Layers,
  GitBranch, Workflow, Target, Archive, Search, Filter
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Sankey } from 'recharts';

interface Microservice {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'running' | 'stopped' | 'error' | 'deploying' | 'scaling' | 'updating';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  type: 'api' | 'worker' | 'gateway' | 'database' | 'cache' | 'queue' | 'auth' | 'notification';
  domain: string;
  owner: string;
  repository: string;
  deployment: ServiceDeployment;
  configuration: ServiceConfiguration;
  dependencies: ServiceDependency[];
  endpoints: ServiceEndpoint[];
  metrics: ServiceMetrics;
  monitoring: ServiceMonitoring;
  scaling: ServiceScaling;
  security: ServiceSecurity;
  lifecycle: ServiceLifecycle;
  documentation: ServiceDocumentation;
  createdAt: string;
  updatedAt: string;
}

interface ServiceDeployment {
  environment: 'development' | 'testing' | 'staging' | 'production';
  platform: 'kubernetes' | 'docker' | 'serverless' | 'vm' | 'container';
  strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate';
  replicas: number;
  resources: ResourceRequirements;
  networking: NetworkConfiguration;
  storage: StorageConfiguration;
  secrets: SecretConfiguration[];
  healthChecks: HealthCheck[];
  rollback: RollbackConfiguration;
}

interface ResourceRequirements {
  cpu: {
    request: string;
    limit: string;
  };
  memory: {
    request: string;
    limit: string;
  };
  storage: {
    request: string;
    limit: string;
  };
  gpu?: {
    request: number;
    limit: number;
  };
}

interface NetworkConfiguration {
  ports: NetworkPort[];
  ingress: IngressConfiguration[];
  egress: EgressConfiguration[];
  loadBalancer: LoadBalancerConfiguration;
  serviceDiscovery: ServiceDiscoveryConfiguration;
}

interface NetworkPort {
  name: string;
  port: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'GRPC';
  exposed: boolean;
}

interface IngressConfiguration {
  host: string;
  path: string;
  tls: boolean;
  annotations: { [key: string]: string };
  rules: IngressRule[];
}

interface IngressRule {
  path: string;
  pathType: 'Prefix' | 'Exact' | 'ImplementationSpecific';
  backend: string;
  port: number;
}

interface EgressConfiguration {
  destination: string;
  port: number;
  protocol: string;
  allowed: boolean;
  policies: string[];
}

interface LoadBalancerConfiguration {
  type: 'round_robin' | 'least_connections' | 'ip_hash' | 'weighted';
  algorithm: string;
  healthCheck: boolean;
  sessionAffinity: boolean;
  timeout: number;
}

interface ServiceDiscoveryConfiguration {
  enabled: boolean;
  provider: 'consul' | 'etcd' | 'kubernetes' | 'eureka';
  namespace: string;
  tags: string[];
  healthCheck: boolean;
}

interface StorageConfiguration {
  volumes: VolumeMount[];
  persistentVolumes: PersistentVolume[];
  configMaps: ConfigMapMount[];
  secrets: SecretMount[];
}

interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly: boolean;
  subPath?: string;
}

interface PersistentVolume {
  name: string;
  size: string;
  storageClass: string;
  accessMode: 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany';
  mountPath: string;
}

interface ConfigMapMount {
  name: string;
  mountPath: string;
  items: ConfigMapItem[];
}

interface ConfigMapItem {
  key: string;
  path: string;
  mode?: number;
}

interface SecretMount {
  name: string;
  mountPath: string;
  items: SecretItem[];
}

interface SecretItem {
  key: string;
  path: string;
  mode?: number;
}

interface SecretConfiguration {
  name: string;
  type: 'generic' | 'tls' | 'docker-registry' | 'service-account-token';
  data: { [key: string]: string };
  encrypted: boolean;
  rotation: boolean;
  expiryDate?: string;
}

interface HealthCheck {
  type: 'http' | 'tcp' | 'exec' | 'grpc';
  path?: string;
  port?: number;
  command?: string[];
  initialDelaySeconds: number;
  periodSeconds: number;
  timeoutSeconds: number;
  successThreshold: number;
  failureThreshold: number;
}

interface RollbackConfiguration {
  enabled: boolean;
  revisionHistoryLimit: number;
  autoRollback: boolean;
  rollbackTriggers: RollbackTrigger[];
}

interface RollbackTrigger {
  metric: string;
  threshold: number;
  duration: string;
  action: 'rollback' | 'alert' | 'scale';
}

interface ServiceConfiguration {
  environment: { [key: string]: string };
  configMaps: string[];
  secrets: string[];
  features: FeatureFlag[];
  runtime: RuntimeConfiguration;
  logging: LoggingConfiguration;
  tracing: TracingConfiguration;
  metrics: MetricsConfiguration;
}

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage: number;
  conditions: FeatureCondition[];
  expiryDate?: string;
}

interface FeatureCondition {
  type: 'user' | 'group' | 'environment' | 'time' | 'custom';
  operator: 'equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
  value: any;
}

interface RuntimeConfiguration {
  language: string;
  version: string;
  framework: string;
  jvm?: JVMConfiguration;
  node?: NodeConfiguration;
  python?: PythonConfiguration;
}

interface JVMConfiguration {
  heapSize: string;
  gcAlgorithm: string;
  jvmArgs: string[];
  systemProperties: { [key: string]: string };
}

interface NodeConfiguration {
  nodeVersion: string;
  npmVersion: string;
  nodeArgs: string[];
  environmentVariables: { [key: string]: string };
}

interface PythonConfiguration {
  pythonVersion: string;
  pipVersion: string;
  virtualEnv: boolean;
  requirements: string[];
}

interface LoggingConfiguration {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  format: 'json' | 'text' | 'structured';
  output: 'stdout' | 'file' | 'syslog' | 'elasticsearch';
  rotation: LogRotationConfiguration;
  sampling: number;
  structured: boolean;
}

interface LogRotationConfiguration {
  enabled: boolean;
  maxSize: string;
  maxFiles: number;
  maxAge: string;
  compress: boolean;
}

interface TracingConfiguration {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'newrelic';
  samplingRate: number;
  endpoint: string;
  tags: { [key: string]: string };
}

interface MetricsConfiguration {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'cloudwatch';
  endpoint: string;
  interval: number;
  customMetrics: CustomMetric[];
}

interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  unit: string;
}

interface ServiceDependency {
  serviceId: string;
  serviceName: string;
  type: 'synchronous' | 'asynchronous' | 'database' | 'cache' | 'queue' | 'external';
  protocol: 'http' | 'grpc' | 'tcp' | 'udp' | 'amqp' | 'kafka';
  endpoint: string;
  timeout: number;
  retries: number;
  circuitBreaker: CircuitBreakerConfiguration;
  fallback: FallbackConfiguration;
  required: boolean;
}

interface CircuitBreakerConfiguration {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  halfOpenMaxCalls: number;
  minRequestThreshold: number;
}

interface FallbackConfiguration {
  enabled: boolean;
  type: 'static' | 'cache' | 'service' | 'queue';
  value?: any;
  serviceEndpoint?: string;
  cacheKey?: string;
}

interface ServiceEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  description: string;
  authentication: AuthenticationRequirement;
  authorization: AuthorizationRequirement;
  rateLimit: RateLimitConfiguration;
  validation: ValidationConfiguration;
  caching: CachingConfiguration;
  monitoring: EndpointMonitoring;
  documentation: EndpointDocumentation;
}

interface AuthenticationRequirement {
  required: boolean;
  methods: string[];
  providers: string[];
  scopes: string[];
}

interface AuthorizationRequirement {
  required: boolean;
  roles: string[];
  permissions: string[];
  policies: string[];
}

interface RateLimitConfiguration {
  enabled: boolean;
  requests: number;
  window: string;
  burst: number;
  keyBy: 'ip' | 'user' | 'api_key' | 'custom';
}

interface ValidationConfiguration {
  enabled: boolean;
  schema: string;
  strict: boolean;
  sanitization: boolean;
  customValidators: string[];
}

interface CachingConfiguration {
  enabled: boolean;
  ttl: number;
  keyPattern: string;
  invalidation: string[];
  compression: boolean;
}

interface EndpointMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: EndpointAlert[];
  tracing: boolean;
  logging: boolean;
}

interface EndpointAlert {
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
}

interface EndpointDocumentation {
  summary: string;
  description: string;
  parameters: ParameterDocumentation[];
  responses: ResponseDocumentation[];
  examples: ExampleDocumentation[];
}

interface ParameterDocumentation {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: any;
}

interface ResponseDocumentation {
  status: number;
  description: string;
  schema: string;
  examples: any[];
}

interface ExampleDocumentation {
  name: string;
  description: string;
  request: any;
  response: any;
}

interface ServiceMetrics {
  performance: PerformanceMetrics;
  availability: AvailabilityMetrics;
  resource: ResourceMetrics;
  business: BusinessMetrics;
  error: ErrorMetrics;
  custom: { [key: string]: number };
  lastUpdated: string;
}

interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    peakRps: number;
    avgRps: number;
  };
  latency: {
    network: number;
    processing: number;
    database: number;
    external: number;
  };
}

interface AvailabilityMetrics {
  uptime: number;
  downtime: number;
  mtbf: number;
  mttr: number;
  slaCompliance: number;
  incidents: number;
}

interface ResourceMetrics {
  cpu: {
    usage: number;
    limit: number;
    requests: number;
  };
  memory: {
    usage: number;
    limit: number;
    requests: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
  };
  storage: {
    usage: number;
    iops: number;
    throughput: number;
  };
}

interface BusinessMetrics {
  transactions: number;
  revenue: number;
  users: number;
  conversions: number;
  customMetrics: { [key: string]: number };
}

interface ErrorMetrics {
  errorRate: number;
  errorCount: number;
  errorsByType: { [key: string]: number };
  errorsByEndpoint: { [key: string]: number };
  criticalErrors: number;
}

interface ServiceMonitoring {
  enabled: boolean;
  healthChecks: HealthCheckMonitoring[];
  alerts: ServiceAlert[];
  dashboards: string[];
  logs: LogMonitoring;
  traces: TraceMonitoring;
  synthetic: SyntheticMonitoring;
}

interface HealthCheckMonitoring {
  name: string;
  endpoint: string;
  interval: number;
  timeout: number;
  expectedStatus: number;
  expectedResponse?: string;
  alerts: boolean;
}

interface ServiceAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  recipients: string[];
  channels: string[];
  escalation: AlertEscalation[];
}

interface AlertEscalation {
  level: number;
  delay: string;
  recipients: string[];
  channels: string[];
}

interface LogMonitoring {
  enabled: boolean;
  level: string;
  patterns: LogPattern[];
  alerts: LogAlert[];
  retention: string;
}

interface LogPattern {
  name: string;
  pattern: string;
  severity: string;
  action: 'alert' | 'count' | 'ignore';
}

interface LogAlert {
  name: string;
  pattern: string;
  threshold: number;
  window: string;
  severity: string;
  recipients: string[];
}

interface TraceMonitoring {
  enabled: boolean;
  samplingRate: number;
  retention: string;
  analysis: TraceAnalysis[];
}

interface TraceAnalysis {
  name: string;
  query: string;
  threshold: number;
  alert: boolean;
}

interface SyntheticMonitoring {
  enabled: boolean;
  tests: SyntheticTest[];
  frequency: string;
  locations: string[];
}

interface SyntheticTest {
  name: string;
  type: 'http' | 'browser' | 'api';
  script: string;
  assertions: TestAssertion[];
  alerts: boolean;
}

interface TestAssertion {
  type: 'response_time' | 'status_code' | 'content' | 'header';
  operator: 'equals' | 'contains' | 'less_than' | 'greater_than';
  value: any;
}

interface ServiceScaling {
  enabled: boolean;
  type: 'horizontal' | 'vertical' | 'both';
  horizontal: HorizontalScaling;
  vertical: VerticalScaling;
  policies: ScalingPolicy[];
  schedule: ScheduledScaling[];
}

interface HorizontalScaling {
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  targetMemory: number;
  customMetrics: CustomScalingMetric[];
  scaleUpPolicy: ScalePolicy;
  scaleDownPolicy: ScalePolicy;
}

interface VerticalScaling {
  enabled: boolean;
  minCPU: string;
  maxCPU: string;
  minMemory: string;
  maxMemory: string;
  updatePolicy: 'Auto' | 'Off' | 'Initial';
}

interface ScalingPolicy {
  name: string;
  type: 'cpu' | 'memory' | 'custom' | 'external';
  metric: string;
  target: number;
  behavior: ScalingBehavior;
}

interface ScalingBehavior {
  scaleUp: ScaleBehavior;
  scaleDown: ScaleBehavior;
}

interface ScaleBehavior {
  stabilizationWindowSeconds: number;
  policies: ScalePolicyRule[];
}

interface ScalePolicyRule {
  type: 'Percent' | 'Pods';
  value: number;
  periodSeconds: number;
}

interface CustomScalingMetric {
  name: string;
  query: string;
  target: number;
  type: 'AverageValue' | 'Value' | 'AverageUtilization';
}

interface ScheduledScaling {
  name: string;
  schedule: string;
  replicas: number;
  timezone: string;
  enabled: boolean;
}

interface ScalePolicy {
  stabilizationWindow: number;
  maxChangePercent: number;
  maxChangePods: number;
  cooldownPeriod: number;
}

interface ServiceSecurity {
  authentication: ServiceAuthentication;
  authorization: ServiceAuthorization;
  encryption: ServiceEncryption;
  secrets: ServiceSecrets;
  compliance: ServiceCompliance;
  vulnerabilities: VulnerabilityAssessment;
}

interface ServiceAuthentication {
  enabled: boolean;
  methods: string[];
  providers: AuthProvider[];
  mfa: boolean;
  sessionManagement: SessionManagement;
}

interface AuthProvider {
  name: string;
  type: 'oauth2' | 'saml' | 'ldap' | 'jwt' | 'api_key';
  endpoint: string;
  configuration: { [key: string]: any };
  enabled: boolean;
}

interface SessionManagement {
  timeout: number;
  renewal: boolean;
  storage: 'memory' | 'redis' | 'database';
  encryption: boolean;
}

interface ServiceAuthorization {
  enabled: boolean;
  model: 'rbac' | 'abac' | 'acl';
  policies: AuthorizationPolicy[];
  roles: Role[];
  permissions: Permission[];
}

interface AuthorizationPolicy {
  name: string;
  effect: 'allow' | 'deny';
  principals: string[];
  resources: string[];
  actions: string[];
  conditions: PolicyCondition[];
}

interface PolicyCondition {
  attribute: string;
  operator: string;
  value: any;
}

interface Role {
  name: string;
  description: string;
  permissions: string[];
  inheritance: string[];
}

interface Permission {
  name: string;
  description: string;
  resource: string;
  actions: string[];
}

interface ServiceEncryption {
  inTransit: EncryptionConfig;
  atRest: EncryptionConfig;
  keyManagement: KeyManagement;
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  protocol: string;
  certificates: Certificate[];
}

interface Certificate {
  name: string;
  type: 'tls' | 'ca' | 'client';
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
}

interface KeyManagement {
  provider: 'vault' | 'kms' | 'hsm' | 'local';
  rotation: boolean;
  rotationInterval: string;
  backup: boolean;
}

interface ServiceSecrets {
  management: SecretManagement;
  rotation: SecretRotation;
  access: SecretAccess;
  audit: SecretAudit;
}

interface SecretManagement {
  provider: 'kubernetes' | 'vault' | 'aws_secrets' | 'azure_keyvault';
  encryption: boolean;
  versioning: boolean;
  backup: boolean;
}

interface SecretRotation {
  enabled: boolean;
  interval: string;
  automatic: boolean;
  notification: boolean;
}

interface SecretAccess {
  authentication: boolean;
  authorization: boolean;
  audit: boolean;
  encryption: boolean;
}

interface SecretAudit {
  enabled: boolean;
  events: string[];
  retention: string;
  alerting: boolean;
}

interface ServiceCompliance {
  frameworks: string[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  reports: ComplianceReport[];
}

interface ComplianceControl {
  id: string;
  name: string;
  framework: string;
  description: string;
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

interface VulnerabilityAssessment {
  enabled: boolean;
  scanners: VulnerabilityScanner[];
  schedule: string;
  findings: VulnerabilityFinding[];
  remediation: VulnerabilityRemediation[];
}

interface VulnerabilityScanner {
  name: string;
  type: 'sast' | 'dast' | 'dependency' | 'container' | 'infrastructure';
  enabled: boolean;
  configuration: { [key: string]: any };
}

interface VulnerabilityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  location: string;
  remediation: string;
  status: 'open' | 'fixed' | 'accepted' | 'false_positive';
}

interface VulnerabilityRemediation {
  findingId: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  status: 'planned' | 'in_progress' | 'completed';
}

interface ServiceLifecycle {
  phase: 'development' | 'testing' | 'staging' | 'production' | 'deprecated' | 'retired';
  version: string;
  releases: ServiceRelease[];
  deployments: ServiceDeploymentHistory[];
  rollbacks: ServiceRollback[];
  maintenance: MaintenanceWindow[];
}

interface ServiceRelease {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  changes: ReleaseChange[];
  artifacts: ReleaseArtifact[];
  approvals: ReleaseApproval[];
  rollback: boolean;
}

interface ReleaseChange {
  type: 'feature' | 'bugfix' | 'security' | 'performance' | 'breaking';
  description: string;
  impact: 'low' | 'medium' | 'high';
  author: string;
  ticket: string;
}

interface ReleaseArtifact {
  name: string;
  type: 'container' | 'binary' | 'package' | 'configuration';
  location: string;
  checksum: string;
  size: number;
}

interface ReleaseApproval {
  approver: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
}

interface ServiceDeploymentHistory {
  id: string;
  version: string;
  environment: string;
  date: string;
  status: 'success' | 'failed' | 'rolled_back';
  duration: number;
  deployer: string;
  strategy: string;
  logs: string;
}

interface ServiceRollback {
  id: string;
  fromVersion: string;
  toVersion: string;
  date: string;
  reason: string;
  initiator: string;
  automatic: boolean;
  duration: number;
  status: 'success' | 'failed';
}

interface MaintenanceWindow {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'planned' | 'emergency';
  impact: 'none' | 'partial' | 'full';
  notifications: string[];
  approvals: string[];
}

interface ServiceDocumentation {
  readme: string;
  api: APIDocumentation;
  architecture: ArchitectureDocumentation;
  deployment: DeploymentDocumentation;
  troubleshooting: TroubleshootingDocumentation;
  changelog: ChangelogEntry[];
}

interface APIDocumentation {
  specification: string;
  format: 'openapi' | 'swagger' | 'graphql' | 'grpc';
  version: string;
  url: string;
  examples: APIExample[];
}

interface APIExample {
  name: string;
  description: string;
  request: any;
  response: any;
  language: string;
}

interface ArchitectureDocumentation {
  overview: string;
  diagrams: ArchitectureDiagram[];
  decisions: ArchitectureDecision[];
  patterns: ArchitecturePattern[];
}

interface ArchitectureDiagram {
  name: string;
  type: 'component' | 'sequence' | 'deployment' | 'data_flow';
  url: string;
  description: string;
}

interface ArchitectureDecision {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  date: string;
  context: string;
  decision: string;
  consequences: string[];
}

interface ArchitecturePattern {
  name: string;
  description: string;
  when: string;
  benefits: string[];
  drawbacks: string[];
  examples: string[];
}

interface DeploymentDocumentation {
  prerequisites: string[];
  steps: DeploymentStep[];
  configuration: ConfigurationDoc[];
  troubleshooting: string[];
}

interface DeploymentStep {
  order: number;
  title: string;
  description: string;
  commands: string[];
  validation: string[];
}

interface ConfigurationDoc {
  parameter: string;
  description: string;
  type: string;
  required: boolean;
  defaultValue: any;
  examples: any[];
}

interface TroubleshootingDocumentation {
  commonIssues: TroubleshootingIssue[];
  diagnostics: DiagnosticProcedure[];
  contacts: SupportContact[];
}

interface TroubleshootingIssue {
  symptom: string;
  cause: string;
  solution: string;
  prevention: string;
}

interface DiagnosticProcedure {
  name: string;
  description: string;
  steps: string[];
  tools: string[];
}

interface SupportContact {
  role: string;
  name: string;
  email: string;
  phone?: string;
  availability: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  breaking: boolean;
  migration?: string;
}

const MicroservicesOrchestration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock microservices data
  const mockMicroservices: Microservice[] = [
    {
      id: 'ms_001',
      name: 'User Management Service',
      description: 'Service de gestion des utilisateurs et authentification',
      version: '2.1.3',
      status: 'running',
      health: 'healthy',
      type: 'api',
      domain: 'Identity',
      owner: 'identity-team@company.com',
      repository: 'https://github.com/company/user-management-service',
      deployment: {
        environment: 'production',
        platform: 'kubernetes',
        strategy: 'rolling',
        replicas: 3,
        resources: {
          cpu: { request: '500m', limit: '1000m' },
          memory: { request: '512Mi', limit: '1Gi' },
          storage: { request: '10Gi', limit: '20Gi' }
        },
        networking: {
          ports: [
            { name: 'http', port: 8080, targetPort: 8080, protocol: 'HTTP', exposed: true },
            { name: 'metrics', port: 9090, targetPort: 9090, protocol: 'HTTP', exposed: false }
          ],
          ingress: [
            {
              host: 'api.company.com',
              path: '/users',
              tls: true,
              annotations: { 'nginx.ingress.kubernetes.io/rewrite-target': '/' },
              rules: [
                { path: '/users', pathType: 'Prefix', backend: 'user-service', port: 8080 }
              ]
            }
          ],
          egress: [
            { destination: 'database.company.com', port: 5432, protocol: 'TCP', allowed: true, policies: ['db-access'] }
          ],
          loadBalancer: {
            type: 'round_robin',
            algorithm: 'least_connections',
            healthCheck: true,
            sessionAffinity: false,
            timeout: 30
          },
          serviceDiscovery: {
            enabled: true,
            provider: 'kubernetes',
            namespace: 'default',
            tags: ['api', 'users', 'auth'],
            healthCheck: true
          }
        },
        storage: {
          volumes: [
            { name: 'logs', mountPath: '/var/log', readOnly: false }
          ],
          persistentVolumes: [
            {
              name: 'user-data',
              size: '10Gi',
              storageClass: 'fast-ssd',
              accessMode: 'ReadWriteOnce',
              mountPath: '/data'
            }
          ],
          configMaps: [
            {
              name: 'app-config',
              mountPath: '/etc/config',
              items: [
                { key: 'app.properties', path: 'application.properties' }
              ]
            }
          ],
          secrets: [
            {
              name: 'db-credentials',
              mountPath: '/etc/secrets',
              items: [
                { key: 'username', path: 'db_user' },
                { key: 'password', path: 'db_pass' }
              ]
            }
          ]
        },
        secrets: [
          {
            name: 'database-secret',
            type: 'generic',
            data: { username: 'user_service', password: '***' },
            encrypted: true,
            rotation: true,
            expiryDate: '2025-06-01T00:00:00Z'
          }
        ],
        healthChecks: [
          {
            type: 'http',
            path: '/health',
            port: 8080,
            initialDelaySeconds: 30,
            periodSeconds: 10,
            timeoutSeconds: 5,
            successThreshold: 1,
            failureThreshold: 3
          }
        ],
        rollback: {
          enabled: true,
          revisionHistoryLimit: 10,
          autoRollback: true,
          rollbackTriggers: [
            { metric: 'error_rate', threshold: 5, duration: '5m', action: 'rollback' }
          ]
        }
      },
      configuration: {
        environment: {
          'SPRING_PROFILES_ACTIVE': 'production',
          'LOG_LEVEL': 'INFO',
          'DB_POOL_SIZE': '20'
        },
        configMaps: ['app-config', 'logging-config'],
        secrets: ['db-credentials', 'jwt-secret'],
        features: [
          {
            name: 'advanced_auth',
            enabled: true,
            description: 'Authentification avancée avec MFA',
            rolloutPercentage: 100,
            conditions: [
              { type: 'environment', operator: 'equals', value: 'production' }
            ]
          }
        ],
        runtime: {
          language: 'Java',
          version: '17',
          framework: 'Spring Boot',
          jvm: {
            heapSize: '768m',
            gcAlgorithm: 'G1GC',
            jvmArgs: ['-XX:+UseG1GC', '-XX:MaxGCPauseMillis=200'],
            systemProperties: { 'file.encoding': 'UTF-8' }
          }
        },
        logging: {
          level: 'info',
          format: 'json',
          output: 'stdout',
          rotation: {
            enabled: true,
            maxSize: '100MB',
            maxFiles: 10,
            maxAge: '30d',
            compress: true
          },
          sampling: 100,
          structured: true
        },
        tracing: {
          enabled: true,
          provider: 'jaeger',
          samplingRate: 0.1,
          endpoint: 'http://jaeger-collector:14268/api/traces',
          tags: { service: 'user-management', version: '2.1.3' }
        },
        metrics: {
          enabled: true,
          provider: 'prometheus',
          endpoint: '/metrics',
          interval: 15,
          customMetrics: [
            {
              name: 'user_registrations_total',
              type: 'counter',
              description: 'Total number of user registrations',
              labels: ['source', 'type'],
              unit: 'registrations'
            }
          ]
        }
      },
      dependencies: [
        {
          serviceId: 'ms_db_001',
          serviceName: 'PostgreSQL Database',
          type: 'database',
          protocol: 'tcp',
          endpoint: 'postgres://db.company.com:5432/users',
          timeout: 5000,
          retries: 3,
          circuitBreaker: {
            enabled: true,
            failureThreshold: 5,
            recoveryTimeout: 30,
            halfOpenMaxCalls: 3,
            minRequestThreshold: 10
          },
          fallback: {
            enabled: true,
            type: 'cache',
            cacheKey: 'user_cache'
          },
          required: true
        }
      ],
      endpoints: [
        {
          id: 'ep_001',
          path: '/api/v1/users',
          method: 'GET',
          description: 'Récupérer la liste des utilisateurs',
          authentication: {
            required: true,
            methods: ['jwt', 'api_key'],
            providers: ['oauth2'],
            scopes: ['users:read']
          },
          authorization: {
            required: true,
            roles: ['admin', 'user_manager'],
            permissions: ['users.read'],
            policies: ['user_access_policy']
          },
          rateLimit: {
            enabled: true,
            requests: 1000,
            window: '1h',
            burst: 100,
            keyBy: 'user'
          },
          validation: {
            enabled: true,
            schema: 'user_list_schema',
            strict: true,
            sanitization: true,
            customValidators: ['email_validator']
          },
          caching: {
            enabled: true,
            ttl: 300,
            keyPattern: 'users:list:{query_hash}',
            invalidation: ['user_created', 'user_updated'],
            compression: true
          },
          monitoring: {
            enabled: true,
            metrics: ['response_time', 'request_count', 'error_rate'],
            alerts: [
              {
                name: 'High Response Time',
                condition: 'avg_response_time > 1000ms',
                threshold: 1000,
                severity: 'warning',
                recipients: ['dev-team@company.com']
              }
            ],
            tracing: true,
            logging: true
          },
          documentation: {
            summary: 'List users',
            description: 'Retrieve a paginated list of users with optional filtering',
            parameters: [
              {
                name: 'page',
                type: 'integer',
                required: false,
                description: 'Page number for pagination',
                example: 1
              }
            ],
            responses: [
              {
                status: 200,
                description: 'Successful response',
                schema: 'UserListResponse',
                examples: [{ users: [], total: 0, page: 1 }]
              }
            ],
            examples: [
              {
                name: 'Basic request',
                description: 'Get first page of users',
                request: { method: 'GET', url: '/api/v1/users?page=1' },
                response: { status: 200, body: { users: [], total: 0 } }
              }
            ]
          }
        }
      ],
      metrics: {
        performance: {
          responseTime: { avg: 150, p50: 120, p95: 300, p99: 500 },
          throughput: { requestsPerSecond: 250, peakRps: 500, avgRps: 200 },
          latency: { network: 10, processing: 100, database: 30, external: 10 }
        },
        availability: {
          uptime: 99.95,
          downtime: 21.6,
          mtbf: 720,
          mttr: 15,
          slaCompliance: 99.8,
          incidents: 2
        },
        resource: {
          cpu: { usage: 45, limit: 1000, requests: 500 },
          memory: { usage: 512, limit: 1024, requests: 512 },
          network: { inbound: 1024, outbound: 512, connections: 150 },
          storage: { usage: 5, iops: 1000, throughput: 100 }
        },
        business: {
          transactions: 50000,
          revenue: 125000,
          users: 15000,
          conversions: 850,
          customMetrics: { registrations_today: 45 }
        },
        error: {
          errorRate: 0.5,
          errorCount: 125,
          errorsByType: { validation: 80, timeout: 30, server: 15 },
          errorsByEndpoint: { '/api/v1/users': 50, '/api/v1/auth': 75 },
          criticalErrors: 5
        },
        custom: { cache_hit_rate: 85.5, db_connection_pool: 15 },
        lastUpdated: '2024-12-20T15:30:00Z'
      },
      monitoring: {
        enabled: true,
        healthChecks: [
          {
            name: 'Application Health',
            endpoint: '/health',
            interval: 30,
            timeout: 5,
            expectedStatus: 200,
            alerts: true
          }
        ],
        alerts: [
          {
            id: 'alert_001',
            name: 'High Error Rate',
            condition: 'error_rate > 5%',
            threshold: 5,
            severity: 'critical',
            enabled: true,
            recipients: ['dev-team@company.com'],
            channels: ['email', 'slack'],
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
        dashboards: ['Service Overview', 'Performance Metrics', 'Error Analysis'],
        logs: {
          enabled: true,
          level: 'info',
          patterns: [
            { name: 'Error Pattern', pattern: 'ERROR', severity: 'error', action: 'alert' }
          ],
          alerts: [
            {
              name: 'Error Spike',
              pattern: 'ERROR',
              threshold: 10,
              window: '5m',
              severity: 'warning',
              recipients: ['dev-team@company.com']
            }
          ],
          retention: '30d'
        },
        traces: {
          enabled: true,
          samplingRate: 10,
          retention: '7d',
          analysis: [
            {
              name: 'Slow Queries',
              query: 'duration > 1s',
              threshold: 1000,
              alert: true
            }
          ]
        },
        synthetic: {
          enabled: true,
          tests: [
            {
              name: 'User Login Test',
              type: 'api',
              script: 'POST /api/v1/auth/login',
              assertions: [
                { type: 'status_code', operator: 'equals', value: 200 },
                { type: 'response_time', operator: 'less_than', value: 500 }
              ],
              alerts: true
            }
          ],
          frequency: '5m',
          locations: ['us-east-1', 'eu-west-1']
        }
      },
      scaling: {
        enabled: true,
        type: 'horizontal',
        horizontal: {
          minReplicas: 2,
          maxReplicas: 10,
          targetCPU: 70,
          targetMemory: 80,
          customMetrics: [
            {
              name: 'requests_per_second',
              query: 'rate(http_requests_total[5m])',
              target: 100,
              type: 'AverageValue'
            }
          ],
          scaleUpPolicy: {
            stabilizationWindow: 300,
            maxChangePercent: 100,
            maxChangePods: 4,
            cooldownPeriod: 180
          },
          scaleDownPolicy: {
            stabilizationWindow: 300,
            maxChangePercent: 50,
            maxChangePods: 2,
            cooldownPeriod: 300
          }
        },
        vertical: {
          enabled: false,
          minCPU: '100m',
          maxCPU: '2000m',
          minMemory: '128Mi',
          maxMemory: '2Gi',
          updatePolicy: 'Auto'
        },
        policies: [
          {
            name: 'CPU Scaling',
            type: 'cpu',
            metric: 'cpu_utilization',
            target: 70,
            behavior: {
              scaleUp: {
                stabilizationWindowSeconds: 300,
                policies: [
                  { type: 'Percent', value: 100, periodSeconds: 60 }
                ]
              },
              scaleDown: {
                stabilizationWindowSeconds: 300,
                policies: [
                  { type: 'Percent', value: 50, periodSeconds: 60 }
                ]
              }
            }
          }
        ],
        schedule: [
          {
            name: 'Business Hours Scale Up',
            schedule: '0 8 * * 1-5',
            replicas: 5,
            timezone: 'Europe/Paris',
            enabled: true
          }
        ]
      },
      security: {
        authentication: {
          enabled: true,
          methods: ['jwt', 'oauth2'],
          providers: [
            {
              name: 'OAuth2 Provider',
              type: 'oauth2',
              endpoint: 'https://auth.company.com',
              configuration: { client_id: 'user-service' },
              enabled: true
            }
          ],
          mfa: true,
          sessionManagement: {
            timeout: 3600,
            renewal: true,
            storage: 'redis',
            encryption: true
          }
        },
        authorization: {
          enabled: true,
          model: 'rbac',
          policies: [
            {
              name: 'User Access Policy',
              effect: 'allow',
              principals: ['authenticated_users'],
              resources: ['/api/v1/users'],
              actions: ['read'],
              conditions: [
                { attribute: 'time_of_day', operator: 'less_than', value: '18:00' }
              ]
            }
          ],
          roles: [
            {
              name: 'user_manager',
              description: 'Can manage users',
              permissions: ['users.read', 'users.write'],
              inheritance: ['user']
            }
          ],
          permissions: [
            {
              name: 'users.read',
              description: 'Read user information',
              resource: 'users',
              actions: ['read']
            }
          ]
        },
        encryption: {
          inTransit: {
            enabled: true,
            algorithm: 'TLS',
            keySize: 256,
            protocol: '1.3',
            certificates: [
              {
                name: 'api-cert',
                type: 'tls',
                issuer: 'Let\'s Encrypt',
                subject: 'api.company.com',
                validFrom: '2024-01-01T00:00:00Z',
                validTo: '2025-01-01T00:00:00Z',
                fingerprint: 'sha256:abc123...'
              }
            ]
          },
          atRest: {
            enabled: true,
            algorithm: 'AES',
            keySize: 256,
            protocol: 'AES-256-GCM',
            certificates: []
          },
          keyManagement: {
            provider: 'vault',
            rotation: true,
            rotationInterval: '90d',
            backup: true
          }
        },
        secrets: {
          management: {
            provider: 'vault',
            encryption: true,
            versioning: true,
            backup: true
          },
          rotation: {
            enabled: true,
            interval: '90d',
            automatic: true,
            notification: true
          },
          access: {
            authentication: true,
            authorization: true,
            audit: true,
            encryption: true
          },
          audit: {
            enabled: true,
            events: ['access', 'rotation', 'creation'],
            retention: '1y',
            alerting: true
          }
        },
        compliance: {
          frameworks: ['SOC2', 'GDPR', 'ISO27001'],
          controls: [
            {
              id: 'AC-1',
              name: 'Access Control Policy',
              framework: 'SOC2',
              description: 'Implement access control policies',
              implementation: 'RBAC with JWT tokens',
              testing: 'Automated',
              evidence: ['policy_doc.pdf'],
              status: 'implemented'
            }
          ],
          assessments: [
            {
              framework: 'SOC2',
              date: '2024-10-01T00:00:00Z',
              assessor: 'External Auditor',
              scope: 'User Management Service',
              result: 'compliant',
              findings: [],
              recommendations: []
            }
          ],
          reports: [
            {
              name: 'SOC2 Compliance Report',
              framework: 'SOC2',
              schedule: 'quarterly',
              recipients: ['compliance@company.com'],
              format: 'pdf',
              automated: true
            }
          ]
        },
        vulnerabilities: {
          enabled: true,
          scanners: [
            {
              name: 'OWASP ZAP',
              type: 'dast',
              enabled: true,
              configuration: { target_url: 'https://api.company.com' }
            }
          ],
          schedule: 'daily',
          findings: [
            {
              id: 'vuln_001',
              severity: 'medium',
              type: 'SQL Injection',
              description: 'Potential SQL injection in user search',
              location: '/api/v1/users/search',
              remediation: 'Use parameterized queries',
              status: 'fixed'
            }
          ],
          remediation: [
            {
              findingId: 'vuln_001',
              action: 'Implement parameterized queries',
              priority: 'high',
              assignee: 'dev-team@company.com',
              dueDate: '2024-12-25T00:00:00Z',
              status: 'completed'
            }
          ]
        }
      },
      lifecycle: {
        phase: 'production',
        version: '2.1.3',
        releases: [
          {
            version: '2.1.3',
            date: '2024-12-15T00:00:00Z',
            type: 'patch',
            changes: [
              {
                type: 'bugfix',
                description: 'Fix user search pagination',
                impact: 'low',
                author: 'dev@company.com',
                ticket: 'JIRA-123'
              }
            ],
            artifacts: [
              {
                name: 'user-service:2.1.3',
                type: 'container',
                location: 'registry.company.com/user-service:2.1.3',
                checksum: 'sha256:abc123...',
                size: 150000000
              }
            ],
            approvals: [
              {
                approver: 'tech-lead@company.com',
                date: '2024-12-14T00:00:00Z',
                status: 'approved',
                comments: 'LGTM'
              }
            ],
            rollback: false
          }
        ],
        deployments: [
          {
            id: 'deploy_001',
            version: '2.1.3',
            environment: 'production',
            date: '2024-12-15T10:00:00Z',
            status: 'success',
            duration: 300,
            deployer: 'ci-cd@company.com',
            strategy: 'rolling',
            logs: 'Deployment completed successfully'
          }
        ],
        rollbacks: [],
        maintenance: [
          {
            id: 'maint_001',
            name: 'Database Maintenance',
            description: 'Routine database maintenance and optimization',
            startTime: '2024-12-22T02:00:00Z',
            endTime: '2024-12-22T04:00:00Z',
            type: 'planned',
            impact: 'partial',
            notifications: ['ops@company.com'],
            approvals: ['manager@company.com']
          }
        ]
      },
      documentation: {
        readme: 'https://github.com/company/user-management-service/README.md',
        api: {
          specification: 'https://api.company.com/users/docs',
          format: 'openapi',
          version: '3.0.0',
          url: 'https://api.company.com/users/openapi.json',
          examples: [
            {
              name: 'Create User',
              description: 'Example of creating a new user',
              request: { method: 'POST', body: { name: 'John Doe' } },
              response: { status: 201, body: { id: 1, name: 'John Doe' } },
              language: 'curl'
            }
          ]
        },
        architecture: {
          overview: 'Microservice for user management with JWT authentication',
          diagrams: [
            {
              name: 'Service Architecture',
              type: 'component',
              url: 'https://docs.company.com/diagrams/user-service-arch.png',
              description: 'High-level architecture diagram'
            }
          ],
          decisions: [
            {
              id: 'ADR-001',
              title: 'Use JWT for authentication',
              status: 'accepted',
              date: '2024-01-15T00:00:00Z',
              context: 'Need stateless authentication',
              decision: 'Implement JWT-based authentication',
              consequences: ['Stateless', 'Scalable', 'Token management complexity']
            }
          ],
          patterns: [
            {
              name: 'Circuit Breaker',
              description: 'Prevent cascade failures',
              when: 'External service calls',
              benefits: ['Fault tolerance', 'Fast failure'],
              drawbacks: ['Complexity'],
              examples: ['Database connections']
            }
          ]
        },
        deployment: {
          prerequisites: ['Kubernetes cluster', 'PostgreSQL database'],
          steps: [
            {
              order: 1,
              title: 'Deploy database',
              description: 'Deploy PostgreSQL instance',
              commands: ['kubectl apply -f postgres.yaml'],
              validation: ['kubectl get pods -l app=postgres']
            }
          ],
          configuration: [
            {
              parameter: 'DB_HOST',
              description: 'Database host',
              type: 'string',
              required: true,
              defaultValue: 'localhost',
              examples: ['db.company.com']
            }
          ],
          troubleshooting: ['Check database connectivity', 'Verify secrets']
        },
        troubleshooting: {
          commonIssues: [
            {
              symptom: 'Service not starting',
              cause: 'Database connection failure',
              solution: 'Check database credentials and connectivity',
              prevention: 'Monitor database health'
            }
          ],
          diagnostics: [
            {
              name: 'Health Check',
              description: 'Verify service health',
              steps: ['curl /health', 'Check logs', 'Verify dependencies'],
              tools: ['curl', 'kubectl', 'logs']
            }
          ],
          contacts: [
            {
              role: 'Primary Developer',
              name: 'John Doe',
              email: 'john.doe@company.com',
              availability: '9-17 CET'
            }
          ]
        },
        changelog: [
          {
            version: '2.1.3',
            date: '2024-12-15T00:00:00Z',
            type: 'fixed',
            description: 'Fixed pagination bug in user search',
            breaking: false
          }
        ]
      },
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z'
    }
  ];

  useEffect(() => {
    setMicroservices(mockMicroservices);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'stopped': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'deploying': return 'text-blue-600 bg-blue-50';
      case 'scaling': return 'text-yellow-600 bg-yellow-50';
      case 'updating': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy': return 'text-red-600 bg-red-50';
      case 'unknown': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <Globe className="h-4 w-4" />;
      case 'worker': return <Cpu className="h-4 w-4" />;
      case 'gateway': return <Network className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'cache': return <Archive className="h-4 w-4" />;
      case 'queue': return <GitBranch className="h-4 w-4" />;
      case 'auth': return <Users className="h-4 w-4" />;
      case 'notification': return <AlertTriangle className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const renderServiceCard = (service: Microservice) => {
    const cpuUsage = (service.metrics.resource.cpu.usage / service.metrics.resource.cpu.limit) * 100;
    const memoryUsage = (service.metrics.resource.memory.usage / service.metrics.resource.memory.limit) * 100;

    return (
      <Card key={service.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {getTypeIcon(service.type)}
              </div>
              <div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="text-sm">
                  v{service.version} • {service.domain} • {service.deployment.replicas} replicas
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getHealthColor(service.health)}>
                {service.health}
              </Badge>
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{service.description}</p>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{service.metrics.availability.uptime}%</div>
                <div className="text-gray-500">Disponibilité</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{service.metrics.performance.responseTime.avg}ms</div>
                <div className="text-gray-500">Temps Réponse</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{service.metrics.performance.throughput.requestsPerSecond}</div>
                <div className="text-gray-500">RPS</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{service.metrics.error.errorRate}%</div>
                <div className="text-gray-500">Erreurs</div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU:</span>
                  <span className={`font-medium ${cpuUsage > 80 ? 'text-red-600' : cpuUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={cpuUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mémoire:</span>
                  <span className={`font-medium ${memoryUsage > 80 ? 'text-red-600' : memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={memoryUsage} className="h-2" />
              </div>
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Dépendances ({service.dependencies.length}):</div>
              <div className="space-y-1">
                {service.dependencies.slice(0, 2).map(dep => (
                  <div key={dep.serviceId} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dep.serviceName}</span>
                      <Badge className={dep.required ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}>
                        {dep.required ? 'Requis' : 'Optionnel'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Type: {dep.type} • Protocol: {dep.protocol}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scaling Configuration */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Configuration Scaling</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Min/Max:</span>
                  <div className="font-medium">{service.scaling.horizontal.minReplicas}/{service.scaling.horizontal.maxReplicas}</div>
                </div>
                <div>
                  <span className="text-gray-600">CPU Target:</span>
                  <div className="font-medium">{service.scaling.horizontal.targetCPU}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <div className="font-medium capitalize">{service.scaling.type}</div>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Authentification:</span>
                <Badge className={service.security.authentication.enabled ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                  {service.security.authentication.enabled ? 'Activée' : 'Désactivée'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Chiffrement:</span>
                <Badge className={service.security.encryption.inTransit.enabled && service.security.encryption.atRest.enabled ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}>
                  {service.security.encryption.inTransit.enabled && service.security.encryption.atRest.enabled ? 'Complet' : 'Partiel'}
                </Badge>
              </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Endpoints ({service.endpoints.length}):</div>
              <div className="space-y-1">
                {service.endpoints.slice(0, 2).map(endpoint => (
                  <div key={endpoint.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{endpoint.method} {endpoint.path}</span>
                      <Badge className={endpoint.authentication.required ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}>
                        {endpoint.authentication.required ? 'Auth' : 'Public'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {endpoint.description}
                    </div>
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
                <Activity className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Propriétaire: {service.owner}</div>
              <div>Environnement: {service.deployment.environment}</div>
              <div>Dernière MAJ: {new Date(service.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const totalServices = microservices.length;
    const runningServices = microservices.filter(s => s.status === 'running').length;
    const healthyServices = microservices.filter(s => s.health === 'healthy').length;
    const avgResponseTime = microservices.reduce((sum, s) => sum + s.metrics.performance.responseTime.avg, 0) / totalServices;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Actifs</p>
                <p className="text-2xl font-bold">{runningServices}/{totalServices}</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Sains</p>
                <p className="text-2xl font-bold text-green-600">{healthyServices}/{totalServices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Temps Réponse Moyen</p>
                <p className="text-2xl font-bold text-purple-600">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibilité Globale</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(microservices.reduce((sum, s) => sum + s.metrics.availability.uptime, 0) / totalServices).toFixed(2)}%
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
          <h1 className="text-3xl font-bold text-gray-900">Orchestration de Microservices</h1>
          <p className="text-gray-600">Gestion et monitoring complet des microservices d'entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Services
          </Button>
          <Button size="sm" onClick={() => setShowServiceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Service
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="deployment">Déploiement</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="scaling">Scaling</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {renderOverviewStats()}

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Domaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                <SelectItem value="Identity">Identity</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Notification">Notification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="stopped">Arrêté</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="deploying">Déploiement</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
                <SelectItem value="updating">Mise à jour</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Environnement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les environnements</SelectItem>
                <SelectItem value="development">Développement</SelectItem>
                <SelectItem value="testing">Test</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {microservices
              .filter(s => selectedDomain === 'all' || s.domain === selectedDomain)
              .filter(s => selectedStatus === 'all' || s.status === selectedStatus)
              .filter(s => selectedEnvironment === 'all' || s.deployment.environment === selectedEnvironment)
              .map(renderServiceCard)}
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Déploiements</CardTitle>
              <CardDescription>Orchestration et stratégies de déploiement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Workflow className="h-12 w-12 mx-auto mb-4" />
                <p>Module de déploiement en cours de développement</p>
                <p className="text-sm">Stratégies rolling, blue-green, canary</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring des Services</CardTitle>
              <CardDescription>Surveillance et alertes en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring en cours de développement</p>
                <p className="text-sm">Métriques, traces et logs centralisés</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Scaling</CardTitle>
              <CardDescription>Gestion automatique de la montée en charge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4" />
                <p>Module de scaling en cours de développement</p>
                <p className="text-sm">Scaling horizontal et vertical automatique</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité des Services</CardTitle>
              <CardDescription>Protection et conformité des microservices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>Module de sécurité en cours de développement</p>
                <p className="text-sm">Authentification, autorisation et chiffrement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cycle de Vie</CardTitle>
              <CardDescription>Gestion des versions et releases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <GitBranch className="h-12 w-12 mx-auto mb-4" />
                <p>Module de lifecycle en cours de développement</p>
                <p className="text-sm">Versions, releases et rollbacks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MicroservicesOrchestration;