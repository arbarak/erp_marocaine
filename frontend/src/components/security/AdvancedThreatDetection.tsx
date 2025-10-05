// Advanced Threat Detection Component

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
  AlertTriangle, Shield, Eye, Target, Zap, Activity,
  Brain, Search, Clock, CheckCircle, XCircle, Users,
  Network, Database, Server, Globe, Key, Lock, Cpu,
  BarChart3, Settings, RefreshCw, Plus, Download, FileText
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';

interface ThreatDetection {
  id: string;
  name: string;
  type: 'malware' | 'phishing' | 'apt' | 'insider' | 'ddos' | 'data_exfiltration' | 'privilege_escalation' | 'lateral_movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  status: 'active' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  description: string;
  detectionMethod: 'signature' | 'behavioral' | 'anomaly' | 'ml' | 'ai' | 'heuristic';
  source: {
    type: 'network' | 'endpoint' | 'email' | 'web' | 'database' | 'application';
    location: string;
    asset: string;
  };
  indicators: ThreatIndicator[];
  timeline: ThreatEvent[];
  impact: {
    scope: 'local' | 'network' | 'enterprise' | 'external';
    affected: string[];
    dataAtRisk: string[];
  };
  response: {
    automated: AutomatedResponse[];
    manual: ManualResponse[];
    recommendations: string[];
  };
  attribution: {
    actor: string;
    campaign: string;
    techniques: string[];
    confidence: number;
  };
  firstDetected: string;
  lastActivity: string;
  analyst: string;
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file' | 'process' | 'registry';
  value: string;
  confidence: number;
  context: string;
  source: string;
  firstSeen: string;
  lastSeen: string;
}

interface ThreatEvent {
  timestamp: string;
  event: string;
  severity: 'info' | 'warning' | 'critical';
  details: string;
  source: string;
  automated: boolean;
}

interface AutomatedResponse {
  action: 'block' | 'quarantine' | 'isolate' | 'alert' | 'log' | 'sandbox';
  target: string;
  timestamp: string;
  result: 'success' | 'failed' | 'partial';
  details: string;
}

interface ManualResponse {
  action: string;
  analyst: string;
  timestamp: string;
  notes: string;
  evidence: string[];
}

interface BehavioralAnalysis {
  id: string;
  entity: {
    type: 'user' | 'device' | 'application' | 'network';
    identifier: string;
    name: string;
  };
  baseline: {
    established: string;
    dataPoints: number;
    confidence: number;
  };
  anomalies: Anomaly[];
  riskScore: number;
  patterns: BehaviorPattern[];
  recommendations: string[];
  lastAnalysis: string;
}

interface Anomaly {
  id: string;
  type: 'access_pattern' | 'data_volume' | 'time_pattern' | 'location' | 'application_usage';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  deviation: number;
  firstDetected: string;
  lastSeen: string;
  frequency: number;
}

interface BehaviorPattern {
  type: string;
  description: string;
  frequency: number;
  confidence: number;
  normal: boolean;
}

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'clustering' | 'anomaly_detection' | 'prediction' | 'nlp';
  algorithm: string;
  purpose: string;
  status: 'training' | 'active' | 'inactive' | 'updating' | 'failed';
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
  };
  training: {
    datasetSize: number;
    lastTrained: string;
    duration: number;
    features: string[];
  };
  deployment: {
    version: string;
    deployedAt: string;
    predictions: number;
    avgResponseTime: number;
  };
  metrics: ModelMetric[];
}

interface ModelMetric {
  timestamp: string;
  accuracy: number;
  predictions: number;
  falsePositives: number;
  falseNegatives: number;
}

interface HuntingQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  language: 'kql' | 'sql' | 'splunk' | 'elastic' | 'sigma';
  category: 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'lateral_movement' | 'collection' | 'exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  tags: string[];
  schedule: {
    enabled: boolean;
    frequency: string;
    lastRun?: string;
    nextRun?: string;
  };
  results: {
    totalRuns: number;
    totalHits: number;
    lastHits: number;
    avgExecutionTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

const AdvancedThreatDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('detections');
  const [threatDetections, setThreatDetections] = useState<ThreatDetection[]>([]);
  const [behavioralAnalyses, setBehavioralAnalyses] = useState<BehavioralAnalysis[]>([]);
  const [mlModels, setMlModels] = useState<MLModel[]>([]);
  const [huntingQueries, setHuntingQueries] = useState<HuntingQuery[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showDetectionDialog, setShowDetectionDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock threat detections
  const mockThreatDetections: ThreatDetection[] = [
    {
      id: 'threat_001',
      name: 'Activité de Reconnaissance Suspecte',
      type: 'apt',
      severity: 'high',
      confidence: 87,
      status: 'investigating',
      description: 'Détection d\'activités de reconnaissance réseau inhabituelles depuis une adresse IP externe',
      detectionMethod: 'behavioral',
      source: {
        type: 'network',
        location: 'DMZ',
        asset: 'Firewall-01'
      },
      indicators: [
        {
          type: 'ip',
          value: '203.0.113.100',
          confidence: 95,
          context: 'Source des tentatives de scan de ports',
          source: 'Network IDS',
          firstSeen: '2024-12-20T14:30:00Z',
          lastSeen: '2024-12-20T15:45:00Z'
        },
        {
          type: 'domain',
          value: 'suspicious-domain.com',
          confidence: 80,
          context: 'Domaine récemment enregistré avec historique malveillant',
          source: 'Threat Intelligence',
          firstSeen: '2024-12-20T14:35:00Z',
          lastSeen: '2024-12-20T15:40:00Z'
        }
      ],
      timeline: [
        {
          timestamp: '2024-12-20T14:30:00Z',
          event: 'Première détection de scan de ports',
          severity: 'warning',
          details: 'Scan TCP sur ports 22, 80, 443, 3389',
          source: 'Network IDS',
          automated: true
        },
        {
          timestamp: '2024-12-20T14:45:00Z',
          event: 'Escalade vers scan de vulnérabilités',
          severity: 'critical',
          details: 'Tentatives d\'exploitation de CVE-2024-1234',
          source: 'IPS',
          automated: true
        }
      ],
      impact: {
        scope: 'network',
        affected: ['web-server-01', 'api-gateway'],
        dataAtRisk: ['customer_data', 'financial_records']
      },
      response: {
        automated: [
          {
            action: 'block',
            target: '203.0.113.100',
            timestamp: '2024-12-20T14:32:00Z',
            result: 'success',
            details: 'IP bloquée au niveau du firewall'
          }
        ],
        manual: [
          {
            action: 'Analyse approfondie des logs',
            analyst: 'security@company.com',
            timestamp: '2024-12-20T15:00:00Z',
            notes: 'Investigation en cours des activités suspectes',
            evidence: ['firewall_logs.txt', 'ids_alerts.json']
          }
        ],
        recommendations: [
          'Renforcer la surveillance du périmètre réseau',
          'Mettre à jour les signatures IDS/IPS',
          'Effectuer un scan de vulnérabilités complet'
        ]
      },
      attribution: {
        actor: 'APT-Unknown',
        campaign: 'Reconnaissance-2024',
        techniques: ['T1595.001', 'T1190'],
        confidence: 65
      },
      firstDetected: '2024-12-20T14:30:00Z',
      lastActivity: '2024-12-20T15:45:00Z',
      analyst: 'security@company.com'
    },
    {
      id: 'threat_002',
      name: 'Tentative d\'Exfiltration de Données',
      type: 'data_exfiltration',
      severity: 'critical',
      confidence: 92,
      status: 'contained',
      description: 'Détection d\'un transfert de données anormalement élevé vers une destination externe',
      detectionMethod: 'ml',
      source: {
        type: 'network',
        location: 'Internal Network',
        asset: 'DLP-System'
      },
      indicators: [
        {
          type: 'ip',
          value: '198.51.100.50',
          confidence: 90,
          context: 'Destination du transfert de données suspect',
          source: 'DLP System',
          firstSeen: '2024-12-20T13:15:00Z',
          lastSeen: '2024-12-20T13:45:00Z'
        }
      ],
      timeline: [
        {
          timestamp: '2024-12-20T13:15:00Z',
          event: 'Détection de transfert de données anormal',
          severity: 'critical',
          details: 'Transfert de 2.5 GB de données sensibles',
          source: 'DLP System',
          automated: true
        },
        {
          timestamp: '2024-12-20T13:20:00Z',
          event: 'Blocage automatique du transfert',
          severity: 'info',
          details: 'Connexion interrompue par le système DLP',
          source: 'DLP System',
          automated: true
        }
      ],
      impact: {
        scope: 'enterprise',
        affected: ['database-server-01'],
        dataAtRisk: ['customer_pii', 'financial_data', 'trade_secrets']
      },
      response: {
        automated: [
          {
            action: 'block',
            target: 'Data transfer to 198.51.100.50',
            timestamp: '2024-12-20T13:20:00Z',
            result: 'success',
            details: 'Transfert bloqué par le système DLP'
          },
          {
            action: 'quarantine',
            target: 'workstation-user-123',
            timestamp: '2024-12-20T13:25:00Z',
            result: 'success',
            details: 'Poste de travail isolé du réseau'
          }
        ],
        manual: [],
        recommendations: [
          'Analyser le contenu des données tentant d\'être exfiltrées',
          'Vérifier l\'intégrité des systèmes de base de données',
          'Renforcer les contrôles d\'accès aux données sensibles'
        ]
      },
      attribution: {
        actor: 'Insider-Threat',
        campaign: 'Data-Theft-2024',
        techniques: ['T1041', 'T1048'],
        confidence: 85
      },
      firstDetected: '2024-12-20T13:15:00Z',
      lastActivity: '2024-12-20T13:45:00Z',
      analyst: 'security@company.com'
    }
  ];

  // Mock behavioral analyses
  const mockBehavioralAnalyses: BehavioralAnalysis[] = [
    {
      id: 'behavior_001',
      entity: {
        type: 'user',
        identifier: 'user_123',
        name: 'Jean Dupont'
      },
      baseline: {
        established: '2024-11-01T00:00:00Z',
        dataPoints: 1500,
        confidence: 95
      },
      anomalies: [
        {
          id: 'anomaly_001',
          type: 'access_pattern',
          description: 'Accès à des ressources inhabituelles en dehors des heures de travail',
          severity: 'medium',
          confidence: 78,
          deviation: 3.2,
          firstDetected: '2024-12-20T02:30:00Z',
          lastSeen: '2024-12-20T03:15:00Z',
          frequency: 3
        }
      ],
      riskScore: 65,
      patterns: [
        {
          type: 'login_time',
          description: 'Connexions habituelles entre 8h et 18h',
          frequency: 95,
          confidence: 98,
          normal: true
        },
        {
          type: 'application_usage',
          description: 'Utilisation principalement d\'applications métier',
          frequency: 87,
          confidence: 92,
          normal: true
        }
      ],
      recommendations: [
        'Surveiller les accès en dehors des heures de travail',
        'Vérifier l\'authentification multi-facteurs',
        'Analyser les ressources accédées récemment'
      ],
      lastAnalysis: '2024-12-20T15:30:00Z'
    }
  ];

  // Mock ML models
  const mockMlModels: MLModel[] = [
    {
      id: 'model_001',
      name: 'Détecteur d\'Anomalies Réseau',
      type: 'anomaly_detection',
      algorithm: 'Isolation Forest',
      purpose: 'Détection d\'activités réseau anormales et de tentatives d\'intrusion',
      status: 'active',
      performance: {
        accuracy: 94.5,
        precision: 92.1,
        recall: 89.7,
        f1Score: 90.9,
        falsePositiveRate: 2.3
      },
      training: {
        datasetSize: 2500000,
        lastTrained: '2024-12-15T10:00:00Z',
        duration: 3600,
        features: ['packet_size', 'connection_duration', 'port_usage', 'protocol_distribution']
      },
      deployment: {
        version: '2.1.0',
        deployedAt: '2024-12-16T08:00:00Z',
        predictions: 1250000,
        avgResponseTime: 15
      },
      metrics: [
        { timestamp: '2024-12-20T00:00:00Z', accuracy: 94.2, predictions: 50000, falsePositives: 115, falseNegatives: 89 },
        { timestamp: '2024-12-20T06:00:00Z', accuracy: 94.8, predictions: 48000, falsePositives: 98, falseNegatives: 76 },
        { timestamp: '2024-12-20T12:00:00Z', accuracy: 95.1, predictions: 52000, falsePositives: 87, falseNegatives: 82 }
      ]
    },
    {
      id: 'model_002',
      name: 'Classificateur de Malware',
      type: 'classification',
      algorithm: 'Random Forest',
      purpose: 'Classification et détection de malware basée sur l\'analyse comportementale',
      status: 'active',
      performance: {
        accuracy: 97.8,
        precision: 96.5,
        recall: 95.2,
        f1Score: 95.8,
        falsePositiveRate: 1.2
      },
      training: {
        datasetSize: 5000000,
        lastTrained: '2024-12-10T14:00:00Z',
        duration: 7200,
        features: ['file_entropy', 'api_calls', 'network_behavior', 'registry_modifications']
      },
      deployment: {
        version: '3.0.1',
        deployedAt: '2024-12-11T09:00:00Z',
        predictions: 890000,
        avgResponseTime: 8
      },
      metrics: [
        { timestamp: '2024-12-20T00:00:00Z', accuracy: 97.5, predictions: 35000, falsePositives: 42, falseNegatives: 38 },
        { timestamp: '2024-12-20T06:00:00Z', accuracy: 98.1, predictions: 33000, falsePositives: 31, falseNegatives: 29 },
        { timestamp: '2024-12-20T12:00:00Z', accuracy: 97.9, predictions: 37000, falsePositives: 39, falseNegatives: 35 }
      ]
    }
  ];

  // Mock hunting queries
  const mockHuntingQueries: HuntingQuery[] = [
    {
      id: 'hunt_001',
      name: 'Détection de PowerShell Suspect',
      description: 'Recherche d\'exécutions PowerShell avec des paramètres suspects ou obfusqués',
      query: `SecurityEvent
| where EventID == 4688
| where Process contains "powershell.exe"
| where CommandLine contains "-enc" or CommandLine contains "-nop" or CommandLine contains "bypass"
| project TimeGenerated, Computer, Account, CommandLine`,
      language: 'kql',
      category: 'defense_evasion',
      severity: 'high',
      author: 'security@company.com',
      tags: ['powershell', 'obfuscation', 'defense_evasion'],
      schedule: {
        enabled: true,
        frequency: '*/15 * * * *',
        lastRun: '2024-12-20T15:30:00Z',
        nextRun: '2024-12-20T15:45:00Z'
      },
      results: {
        totalRuns: 2880,
        totalHits: 156,
        lastHits: 3,
        avgExecutionTime: 2.5
      },
      createdAt: '2024-11-01T10:00:00Z',
      updatedAt: '2024-12-15T14:30:00Z'
    },
    {
      id: 'hunt_002',
      name: 'Mouvement Latéral via WMI',
      description: 'Détection de tentatives de mouvement latéral utilisant WMI',
      query: `SecurityEvent
| where EventID == 4688
| where Process contains "wmic.exe"
| where CommandLine contains "process call create"
| project TimeGenerated, Computer, Account, CommandLine, ParentProcessName`,
      language: 'kql',
      category: 'lateral_movement',
      severity: 'medium',
      author: 'security@company.com',
      tags: ['wmi', 'lateral_movement', 'remote_execution'],
      schedule: {
        enabled: true,
        frequency: '0 */2 * * *',
        lastRun: '2024-12-20T14:00:00Z',
        nextRun: '2024-12-20T16:00:00Z'
      },
      results: {
        totalRuns: 720,
        totalHits: 23,
        lastHits: 0,
        avgExecutionTime: 1.8
      },
      createdAt: '2024-11-15T09:00:00Z',
      updatedAt: '2024-12-10T11:20:00Z'
    }
  ];

  useEffect(() => {
    setThreatDetections(mockThreatDetections);
    setBehavioralAnalyses(mockBehavioralAnalyses);
    setMlModels(mockMlModels);
    setHuntingQueries(mockHuntingQueries);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'contained': return 'text-blue-600 bg-blue-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'training': return 'text-blue-600 bg-blue-50';
      case 'updating': return 'text-yellow-600 bg-yellow-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'false_positive': return 'text-gray-600 bg-gray-50';
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

  const renderThreatDetectionCard = (detection: ThreatDetection) => {
    return (
      <Card key={detection.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{detection.name}</CardTitle>
                <CardDescription className="text-sm">
                  {detection.type.replace('_', ' ')} • Confiance: {detection.confidence}%
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(detection.severity)}>
                {detection.severity}
              </Badge>
              <Badge className={getStatusColor(detection.status)}>
                {detection.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{detection.description}</p>
            
            {/* Source and Method */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Détection</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Méthode:</span>
                  <Badge variant="outline" className="ml-2">
                    {detection.detectionMethod}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Source:</span>
                  <div className="font-medium">{detection.source.type} • {detection.source.asset}</div>
                </div>
              </div>
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Impact:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Portée:</span>
                  <Badge className={getSeverityColor(detection.impact.scope === 'enterprise' ? 'critical' : 'medium')}>
                    {detection.impact.scope}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Systèmes affectés:</span>
                  <div className="font-medium">{detection.impact.affected.length}</div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Indicateurs ({detection.indicators.length}):</div>
              <div className="space-y-1">
                {detection.indicators.slice(0, 2).map((indicator, index) => (
                  <div key={index} className="bg-red-50 p-2 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium font-mono">{indicator.value}</span>
                      <Badge variant="outline">
                        {indicator.type} • {indicator.confidence}%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {indicator.context}
                    </div>
                  </div>
                ))}
                {detection.indicators.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{detection.indicators.length - 2} autres indicateurs
                  </div>
                )}
              </div>
            </div>

            {/* Automated Response */}
            {detection.response.automated.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Réponses automatisées:</div>
                <div className="space-y-1">
                  {detection.response.automated.map((response, index) => (
                    <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{response.action}</span>
                        <Badge className={getStatusColor(response.result)}>
                          {response.result}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {response.details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attribution */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Attribution</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Acteur:</span>
                  <div className="font-medium">{detection.attribution.actor}</div>
                </div>
                <div>
                  <span className="text-gray-600">Confiance:</span>
                  <div className="font-medium">{detection.attribution.confidence}%</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Analyser
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Analyste: {detection.analyst}</div>
              <div>Première détection: {new Date(detection.firstDetected).toLocaleString('fr-FR')}</div>
              <div>Dernière activité: {new Date(detection.lastActivity).toLocaleString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMLModelCard = (model: MLModel) => {
    return (
      <Card key={model.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.algorithm} • v{model.deployment.version}
                </CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(model.status)}>
              {model.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{model.purpose}</p>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">{model.performance.accuracy.toFixed(1)}%</div>
                <div className="text-gray-500">Précision</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{model.performance.precision.toFixed(1)}%</div>
                <div className="text-gray-500">Précision</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{model.performance.recall.toFixed(1)}%</div>
                <div className="text-gray-500">Rappel</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{model.performance.falsePositiveRate.toFixed(1)}%</div>
                <div className="text-gray-500">Faux Positifs</div>
              </div>
            </div>

            {/* Training Info */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Entraînement</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Dataset:</span>
                  <div className="font-medium">{model.training.datasetSize.toLocaleString()} échantillons</div>
                </div>
                <div>
                  <span className="text-gray-600">Dernière formation:</span>
                  <div className="font-medium">{new Date(model.training.lastTrained).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>

            {/* Deployment Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Prédictions:</span>
                <div className="font-medium">{model.deployment.predictions.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Temps de réponse:</span>
                <div className="font-medium">{model.deployment.avgResponseTime}ms</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Caractéristiques ({model.training.features.length}):</div>
              <div className="flex flex-wrap gap-1">
                {model.training.features.slice(0, 4).map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature.replace('_', ' ')}
                  </Badge>
                ))}
                {model.training.features.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{model.training.features.length - 4}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Métriques
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Type: {model.type.replace('_', ' ')}</div>
              <div>Déployé: {new Date(model.deployment.deployedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const activeThreatDetections = threatDetections.filter(t => t.status === 'active' || t.status === 'investigating').length;
    const criticalThreats = threatDetections.filter(t => t.severity === 'critical').length;
    const activeModels = mlModels.filter(m => m.status === 'active').length;
    const avgModelAccuracy = mlModels.reduce((sum, m) => sum + m.performance.accuracy, 0) / mlModels.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menaces Actives</p>
                <p className="text-2xl font-bold">{activeThreatDetections}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menaces Critiques</p>
                <p className="text-2xl font-bold text-red-600">{criticalThreats}</p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modèles ML Actifs</p>
                <p className="text-2xl font-bold text-blue-600">{activeModels}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Précision Moyenne</p>
                <p className="text-2xl font-bold text-green-600">{avgModelAccuracy.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Détection Avancée de Menaces</h1>
          <p className="text-gray-600">Intelligence artificielle et analyse comportementale pour la cybersécurité</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Menaces
          </Button>
          <Button size="sm" onClick={() => setShowDetectionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Règle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="detections">Détections</TabsTrigger>
          <TabsTrigger value="behavioral">Comportemental</TabsTrigger>
          <TabsTrigger value="ml">ML/IA</TabsTrigger>
          <TabsTrigger value="hunting">Threat Hunting</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="detections" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sévérités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 heure</SelectItem>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {threatDetections
              .filter(t => selectedSeverity === 'all' || t.severity === selectedSeverity)
              .map(renderThreatDetectionCard)}
          </div>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Analyse Comportementale</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Analyse
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {behavioralAnalyses.map(analysis => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{analysis.entity.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {analysis.entity.type} • {analysis.anomalies.length} anomalies
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Risk Score */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score de Risque:</span>
                        <span className={`font-medium ${analysis.riskScore > 70 ? 'text-red-600' : analysis.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {analysis.riskScore}/100
                        </span>
                      </div>
                      <Progress value={analysis.riskScore} className="h-2" />
                    </div>

                    {/* Baseline */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Ligne de base</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Points de données:</span>
                          <div className="font-medium">{analysis.baseline.dataPoints.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Confiance:</span>
                          <div className="font-medium">{analysis.baseline.confidence}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Anomalies */}
                    {analysis.anomalies.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Anomalies détectées:</div>
                        <div className="space-y-1">
                          {analysis.anomalies.map(anomaly => (
                            <div key={anomaly.id} className="bg-red-50 p-2 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{anomaly.type.replace('_', ' ')}</span>
                                <Badge className={getSeverityColor(anomaly.severity)}>
                                  {anomaly.severity}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {anomaly.description} • Confiance: {anomaly.confidence}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Analyser
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
                      <div>Dernière analyse: {new Date(analysis.lastAnalysis).toLocaleString('fr-FR')}</div>
                      <div>Baseline établie: {new Date(analysis.baseline.established).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ml" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Modèles ML/IA</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Modèle
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mlModels.map(renderMLModelCard)}
          </div>
        </TabsContent>

        <TabsContent value="hunting" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Threat Hunting</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Requête
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {huntingQueries.map(query => (
              <Card key={query.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <Search className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{query.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {query.language.toUpperCase()} • {query.category.replace('_', ' ')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(query.severity)}>
                        {query.severity}
                      </Badge>
                      <Badge className={query.schedule.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {query.schedule.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{query.description}</p>
                    
                    {/* Query preview */}
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {query.query}
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{query.results.totalRuns}</div>
                        <div className="text-gray-500">Exécutions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{query.results.totalHits}</div>
                        <div className="text-gray-500">Résultats</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{query.results.lastHits}</div>
                        <div className="text-gray-500">Derniers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{query.results.avgExecutionTime.toFixed(1)}s</div>
                        <div className="text-gray-500">Temps Moy.</div>
                      </div>
                    </div>

                    {/* Schedule */}
                    {query.schedule.enabled && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Planification</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Fréquence:</span>
                            <div className="font-medium font-mono">{query.schedule.frequency}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Prochaine exécution:</span>
                            <div className="font-medium">
                              {query.schedule.nextRun ? new Date(query.schedule.nextRun).toLocaleTimeString('fr-FR') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {query.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Exécuter
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div>Auteur: {query.author}</div>
                      <div>Créé: {new Date(query.createdAt).toLocaleDateString('fr-FR')}</div>
                      <div>MAJ: {new Date(query.updatedAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Sécurité</CardTitle>
              <CardDescription>Analyses avancées et tendances de sécurité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard d'analytics sécurité en cours de développement</p>
                <p className="text-sm">Analyses prédictives et intelligence des menaces</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedThreatDetection;
