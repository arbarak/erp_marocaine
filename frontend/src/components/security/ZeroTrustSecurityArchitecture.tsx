// Zero Trust Security Architecture Component

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
  Shield, Lock, Eye, AlertTriangle, CheckCircle, Clock,
  Users, Network, Database, Server, Globe, Key, Zap,
  Activity, BarChart3, Settings, RefreshCw, Plus, Download,
  Target, Award, Monitor, Cpu, HardDrive, FileText
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'identity' | 'device' | 'network' | 'application' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  rules: SecurityRule[];
  enforcement: {
    mode: 'monitor' | 'enforce' | 'block';
    exceptions: string[];
    schedule: string;
  };
  compliance: {
    frameworks: string[];
    requirements: string[];
    evidence: string[];
  };
  metrics: {
    violations: number;
    blocked: number;
    allowed: number;
    lastTriggered?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert' | 'quarantine';
  parameters: { [key: string]: any };
  priority: number;
  enabled: boolean;
}

interface IdentityVerification {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: 'verified' | 'pending' | 'failed' | 'revoked';
  verificationMethods: VerificationMethod[];
  riskScore: number;
  trustLevel: 'low' | 'medium' | 'high' | 'critical';
  lastVerification: string;
  deviceFingerprint: string;
  location: {
    country: string;
    city: string;
    ip: string;
    suspicious: boolean;
  };
  behaviorAnalysis: {
    normalPatterns: string[];
    anomalies: string[];
    confidence: number;
  };
  accessHistory: AccessEvent[];
}

interface VerificationMethod {
  type: 'password' | 'mfa' | 'biometric' | 'certificate' | 'sso';
  status: 'active' | 'inactive' | 'expired';
  lastUsed: string;
  strength: number;
  metadata: any;
}

interface AccessEvent {
  timestamp: string;
  resource: string;
  action: string;
  result: 'granted' | 'denied' | 'challenged';
  riskFactors: string[];
  deviceInfo: any;
}

interface DeviceTrust {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'server' | 'iot';
  os: string;
  version: string;
  trustScore: number;
  status: 'trusted' | 'untrusted' | 'quarantined' | 'unknown';
  compliance: {
    encrypted: boolean;
    patched: boolean;
    antivirus: boolean;
    firewall: boolean;
    managed: boolean;
  };
  certificates: DeviceCertificate[];
  lastSeen: string;
  owner: string;
  location: string;
  vulnerabilities: SecurityVulnerability[];
}

interface DeviceCertificate {
  id: string;
  type: 'device' | 'user' | 'application';
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  status: 'valid' | 'expired' | 'revoked';
  fingerprint: string;
}

interface SecurityVulnerability {
  id: string;
  cve: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected: string;
  remediation: string;
  status: 'open' | 'patched' | 'mitigated' | 'accepted';
  discoveredAt: string;
}

interface NetworkSegment {
  id: string;
  name: string;
  description: string;
  type: 'dmz' | 'internal' | 'restricted' | 'public' | 'management';
  cidr: string;
  vlan: number;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  policies: string[];
  devices: string[];
  traffic: {
    inbound: number;
    outbound: number;
    blocked: number;
    suspicious: number;
  };
  monitoring: {
    ids: boolean;
    ips: boolean;
    dlp: boolean;
    logging: boolean;
  };
  isolation: {
    enabled: boolean;
    exceptions: string[];
    quarantine: boolean;
  };
}

interface ThreatIntelligence {
  id: string;
  type: 'malware' | 'phishing' | 'apt' | 'insider' | 'ddos' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  indicators: ThreatIndicator[];
  attribution: {
    actor: string;
    campaign: string;
    techniques: string[];
  };
  impact: {
    confidentiality: 'low' | 'medium' | 'high';
    integrity: 'low' | 'medium' | 'high';
    availability: 'low' | 'medium' | 'high';
  };
  mitigation: string[];
  status: 'active' | 'contained' | 'resolved' | 'monitoring';
  firstSeen: string;
  lastSeen: string;
  source: string;
}

interface ThreatIndicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file';
  value: string;
  confidence: number;
  context: string;
}

const ZeroTrustSecurityArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [identityVerifications, setIdentityVerifications] = useState<IdentityVerification[]>([]);
  const [deviceTrusts, setDeviceTrusts] = useState<DeviceTrust[]>([]);
  const [networkSegments, setNetworkSegments] = useState<NetworkSegment[]>([]);
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock security policies
  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: 'identity_mfa_policy',
      name: 'Authentification Multi-Facteurs Obligatoire',
      description: 'Exige une authentification multi-facteurs pour tous les accès aux ressources critiques',
      type: 'identity',
      severity: 'high',
      status: 'active',
      rules: [
        {
          id: 'mfa_rule_1',
          name: 'MFA pour ressources critiques',
          condition: 'resource.classification == "critical" AND user.mfa_enabled == false',
          action: 'deny',
          parameters: { message: 'MFA requis pour accéder à cette ressource' },
          priority: 1,
          enabled: true
        }
      ],
      enforcement: {
        mode: 'enforce',
        exceptions: ['emergency_access_group'],
        schedule: '24/7'
      },
      compliance: {
        frameworks: ['ISO27001', 'SOC2', 'NIST'],
        requirements: ['AC-2', 'IA-2'],
        evidence: ['mfa_config.json', 'audit_log.csv']
      },
      metrics: {
        violations: 23,
        blocked: 156,
        allowed: 8945,
        lastTriggered: '2024-12-20T14:30:00Z'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-18T14:30:00Z',
      createdBy: 'security@company.com'
    },
    {
      id: 'device_trust_policy',
      name: 'Politique de Confiance des Appareils',
      description: 'Vérifie la conformité et la sécurité des appareils avant l\'accès',
      type: 'device',
      severity: 'critical',
      status: 'active',
      rules: [
        {
          id: 'device_rule_1',
          name: 'Appareil non géré',
          condition: 'device.managed == false',
          action: 'quarantine',
          parameters: { quarantine_duration: 3600 },
          priority: 1,
          enabled: true
        },
        {
          id: 'device_rule_2',
          name: 'Chiffrement requis',
          condition: 'device.encrypted == false',
          action: 'deny',
          parameters: { message: 'Chiffrement du disque requis' },
          priority: 2,
          enabled: true
        }
      ],
      enforcement: {
        mode: 'enforce',
        exceptions: ['guest_network'],
        schedule: '24/7'
      },
      compliance: {
        frameworks: ['GDPR', 'HIPAA'],
        requirements: ['SC-13', 'SC-28'],
        evidence: ['device_inventory.json']
      },
      metrics: {
        violations: 45,
        blocked: 89,
        allowed: 2156,
        lastTriggered: '2024-12-20T15:15:00Z'
      },
      createdAt: '2024-02-20T09:15:00Z',
      updatedAt: '2024-12-19T11:20:00Z',
      createdBy: 'security@company.com'
    }
  ];

  // Mock identity verifications
  const mockIdentityVerifications: IdentityVerification[] = [
    {
      id: 'user_001_verification',
      userId: 'user_001',
      userName: 'Jean Dupont',
      email: 'jean.dupont@company.com',
      status: 'verified',
      verificationMethods: [
        {
          type: 'password',
          status: 'active',
          lastUsed: '2024-12-20T15:30:00Z',
          strength: 85,
          metadata: { complexity: 'high', age: 45 }
        },
        {
          type: 'mfa',
          status: 'active',
          lastUsed: '2024-12-20T15:30:00Z',
          strength: 95,
          metadata: { method: 'totp', backup_codes: 8 }
        }
      ],
      riskScore: 15,
      trustLevel: 'high',
      lastVerification: '2024-12-20T15:30:00Z',
      deviceFingerprint: 'fp_abc123def456',
      location: {
        country: 'France',
        city: 'Paris',
        ip: '192.168.1.100',
        suspicious: false
      },
      behaviorAnalysis: {
        normalPatterns: ['morning_login', 'office_hours', 'standard_apps'],
        anomalies: [],
        confidence: 92
      },
      accessHistory: [
        {
          timestamp: '2024-12-20T15:30:00Z',
          resource: '/api/customers',
          action: 'read',
          result: 'granted',
          riskFactors: [],
          deviceInfo: { type: 'desktop', os: 'Windows 11' }
        }
      ]
    },
    {
      id: 'user_002_verification',
      userId: 'user_002',
      userName: 'Marie Martin',
      email: 'marie.martin@company.com',
      status: 'pending',
      verificationMethods: [
        {
          type: 'password',
          status: 'active',
          lastUsed: '2024-12-20T14:45:00Z',
          strength: 70,
          metadata: { complexity: 'medium', age: 120 }
        }
      ],
      riskScore: 65,
      trustLevel: 'medium',
      lastVerification: '2024-12-20T14:45:00Z',
      deviceFingerprint: 'fp_xyz789ghi012',
      location: {
        country: 'France',
        city: 'Lyon',
        ip: '203.0.113.50',
        suspicious: true
      },
      behaviorAnalysis: {
        normalPatterns: ['afternoon_login', 'mobile_access'],
        anomalies: ['unusual_location', 'new_device'],
        confidence: 45
      },
      accessHistory: [
        {
          timestamp: '2024-12-20T14:45:00Z',
          resource: '/api/orders',
          action: 'write',
          result: 'challenged',
          riskFactors: ['new_location', 'unusual_time'],
          deviceInfo: { type: 'mobile', os: 'iOS 17' }
        }
      ]
    }
  ];

  // Mock device trusts
  const mockDeviceTrusts: DeviceTrust[] = [
    {
      id: 'device_001',
      deviceId: 'DESKTOP-ABC123',
      deviceName: 'Poste Jean Dupont',
      type: 'desktop',
      os: 'Windows 11 Pro',
      version: '22H2',
      trustScore: 92,
      status: 'trusted',
      compliance: {
        encrypted: true,
        patched: true,
        antivirus: true,
        firewall: true,
        managed: true
      },
      certificates: [
        {
          id: 'cert_001',
          type: 'device',
          issuer: 'Company CA',
          subject: 'DESKTOP-ABC123',
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2025-01-01T00:00:00Z',
          status: 'valid',
          fingerprint: 'SHA256:abc123def456...'
        }
      ],
      lastSeen: '2024-12-20T15:30:00Z',
      owner: 'jean.dupont@company.com',
      location: 'Bureau Paris',
      vulnerabilities: []
    },
    {
      id: 'device_002',
      deviceId: 'MOBILE-XYZ789',
      deviceName: 'iPhone Marie Martin',
      type: 'mobile',
      os: 'iOS',
      version: '17.2',
      trustScore: 45,
      status: 'untrusted',
      compliance: {
        encrypted: true,
        patched: false,
        antivirus: false,
        firewall: true,
        managed: false
      },
      certificates: [],
      lastSeen: '2024-12-20T14:45:00Z',
      owner: 'marie.martin@company.com',
      location: 'Lyon',
      vulnerabilities: [
        {
          id: 'vuln_001',
          cve: 'CVE-2024-1234',
          severity: 'medium',
          description: 'Vulnérabilité dans le système de gestion des certificats',
          affected: 'iOS 17.1',
          remediation: 'Mise à jour vers iOS 17.2',
          status: 'open',
          discoveredAt: '2024-12-15T10:00:00Z'
        }
      ]
    }
  ];

  // Mock network segments
  const mockNetworkSegments: NetworkSegment[] = [
    {
      id: 'segment_dmz',
      name: 'Zone Démilitarisée',
      description: 'Segment réseau pour les services publics',
      type: 'dmz',
      cidr: '10.0.1.0/24',
      vlan: 100,
      securityLevel: 'high',
      policies: ['web_access_policy', 'public_service_policy'],
      devices: ['web_server_01', 'load_balancer_01'],
      traffic: {
        inbound: 15420,
        outbound: 8950,
        blocked: 234,
        suspicious: 12
      },
      monitoring: {
        ids: true,
        ips: true,
        dlp: true,
        logging: true
      },
      isolation: {
        enabled: true,
        exceptions: ['management_subnet'],
        quarantine: false
      }
    },
    {
      id: 'segment_internal',
      name: 'Réseau Interne',
      description: 'Segment réseau pour les utilisateurs internes',
      type: 'internal',
      cidr: '10.0.10.0/24',
      vlan: 200,
      securityLevel: 'medium',
      policies: ['internal_access_policy', 'user_policy'],
      devices: ['workstation_001', 'workstation_002'],
      traffic: {
        inbound: 8950,
        outbound: 12340,
        blocked: 89,
        suspicious: 5
      },
      monitoring: {
        ids: true,
        ips: false,
        dlp: true,
        logging: true
      },
      isolation: {
        enabled: false,
        exceptions: [],
        quarantine: false
      }
    }
  ];

  // Mock threat intelligence
  const mockThreatIntelligence: ThreatIntelligence[] = [
    {
      id: 'threat_001',
      type: 'phishing',
      severity: 'high',
      title: 'Campagne de Phishing Ciblée',
      description: 'Campagne de phishing sophistiquée ciblant les employés du secteur financier',
      indicators: [
        {
          type: 'domain',
          value: 'fake-bank-login.com',
          confidence: 95,
          context: 'Domaine malveillant imitant une banque'
        },
        {
          type: 'ip',
          value: '203.0.113.100',
          confidence: 90,
          context: 'Serveur C&C identifié'
        }
      ],
      attribution: {
        actor: 'APT-Finance-2024',
        campaign: 'Operation GoldenPhish',
        techniques: ['T1566.001', 'T1204.002']
      },
      impact: {
        confidentiality: 'high',
        integrity: 'medium',
        availability: 'low'
      },
      mitigation: [
        'Bloquer les domaines malveillants',
        'Formation de sensibilisation',
        'Filtrage email renforcé'
      ],
      status: 'active',
      firstSeen: '2024-12-18T10:00:00Z',
      lastSeen: '2024-12-20T14:30:00Z',
      source: 'Threat Intelligence Feed'
    }
  ];

  useEffect(() => {
    setSecurityPolicies(mockSecurityPolicies);
    setIdentityVerifications(mockIdentityVerifications);
    setDeviceTrusts(mockDeviceTrusts);
    setNetworkSegments(mockNetworkSegments);
    setThreatIntelligence(mockThreatIntelligence);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'verified': return 'text-green-600 bg-green-50';
      case 'trusted': return 'text-green-600 bg-green-50';
      case 'valid': return 'text-green-600 bg-green-50';
      case 'contained': return 'text-green-600 bg-green-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-red-600 bg-red-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'untrusted': return 'text-red-600 bg-red-50';
      case 'revoked': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'quarantined': return 'text-yellow-600 bg-yellow-50';
      case 'monitoring': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-blue-600 bg-blue-50';
      case 'unknown': return 'text-gray-600 bg-gray-50';
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

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderSecurityPolicyCard = (policy: SecurityPolicy) => {
    const violationRate = policy.metrics.violations / (policy.metrics.violations + policy.metrics.allowed) * 100;

    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <CardDescription className="text-sm">
                  {policy.type} • {policy.rules.length} règles
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(policy.severity)}>
                {policy.severity}
              </Badge>
              <Badge className={getStatusColor(policy.status)}>
                {policy.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{policy.description}</p>
            
            {/* Enforcement */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Application</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <Badge className={policy.enforcement.mode === 'enforce' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'}>
                    {policy.enforcement.mode}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Planification:</span>
                  <div className="font-medium">{policy.enforcement.schedule}</div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-red-600">{policy.metrics.violations}</div>
                <div className="text-gray-500">Violations</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">{policy.metrics.blocked}</div>
                <div className="text-gray-500">Bloqués</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{policy.metrics.allowed}</div>
                <div className="text-gray-500">Autorisés</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{violationRate.toFixed(1)}%</div>
                <div className="text-gray-500">Taux Violation</div>
              </div>
            </div>

            {/* Compliance */}
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

            {/* Rules preview */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Règles actives:</div>
              <div className="space-y-1">
                {policy.rules.slice(0, 2).map(rule => (
                  <div key={rule.id} className="bg-gray-50 p-2 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{rule.name}</span>
                      <Badge className={rule.enabled ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                        {rule.enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Action: {rule.action} • Priorité: {rule.priority}
                    </div>
                  </div>
                ))}
                {policy.rules.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{policy.rules.length - 2} autres règles
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Configurer
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
              <div>Créé par: {policy.createdBy}</div>
              <div>MAJ: {new Date(policy.updatedAt).toLocaleDateString('fr-FR')}</div>
              {policy.metrics.lastTriggered && (
                <div>Dernière violation: {new Date(policy.metrics.lastTriggered).toLocaleString('fr-FR')}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderIdentityCard = (identity: IdentityVerification) => {
    return (
      <Card key={identity.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{identity.userName}</CardTitle>
                <CardDescription className="text-sm">
                  {identity.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getTrustLevelColor(identity.trustLevel)}>
                {identity.trustLevel}
              </Badge>
              <Badge className={getStatusColor(identity.status)}>
                {identity.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score de Risque:</span>
                <span className={`font-medium ${identity.riskScore > 70 ? 'text-red-600' : identity.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {identity.riskScore}/100
                </span>
              </div>
              <Progress value={identity.riskScore} className="h-2" />
            </div>

            {/* Verification Methods */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Méthodes de vérification:</div>
              <div className="space-y-1">
                {identity.verificationMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Key className="h-3 w-3" />
                      <span className="capitalize">{method.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Force: {method.strength}%</span>
                      <Badge className={getStatusColor(method.status)}>
                        {method.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Localisation</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Lieu:</span>
                  <div className="font-medium">{identity.location.city}, {identity.location.country}</div>
                </div>
                <div>
                  <span className="text-gray-600">IP:</span>
                  <div className="font-medium font-mono">{identity.location.ip}</div>
                </div>
              </div>
              {identity.location.suspicious && (
                <div className="mt-2">
                  <Badge className="text-red-600 bg-red-50">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Localisation suspecte
                  </Badge>
                </div>
              )}
            </div>

            {/* Behavior Analysis */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Analyse comportementale:</div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Confiance:</span>
                  <span className="font-medium">{identity.behaviorAnalysis.confidence}%</span>
                </div>
                {identity.behaviorAnalysis.anomalies.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Anomalies détectées:</div>
                    <div className="flex flex-wrap gap-1">
                      {identity.behaviorAnalysis.anomalies.map(anomaly => (
                        <Badge key={anomaly} className="text-red-600 bg-red-50 text-xs">
                          {anomaly.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Access */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Accès récents:</div>
              <div className="space-y-1">
                {identity.accessHistory.slice(0, 2).map((access, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{access.resource}</span>
                      <Badge className={getStatusColor(access.result)}>
                        {access.result}
                      </Badge>
                    </div>
                    <div className="text-gray-600 mt-1">
                      {new Date(access.timestamp).toLocaleString('fr-FR')} • {access.action}
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
                <Lock className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Dernière vérification: {new Date(identity.lastVerification).toLocaleString('fr-FR')}</div>
              <div>Empreinte appareil: {identity.deviceFingerprint}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDeviceCard = (device: DeviceTrust) => {
    const complianceScore = Object.values(device.compliance).filter(Boolean).length / Object.values(device.compliance).length * 100;

    return (
      <Card key={device.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg">{device.deviceName}</CardTitle>
                <CardDescription className="text-sm">
                  {device.type} • {device.os} {device.version}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(device.status)}>
                {device.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Trust Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score de Confiance:</span>
                <span className={`font-medium ${device.trustScore > 80 ? 'text-green-600' : device.trustScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {device.trustScore}/100
                </span>
              </div>
              <Progress value={device.trustScore} className="h-2" />
            </div>

            {/* Compliance */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conformité:</span>
                <span className="font-medium">{complianceScore.toFixed(0)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(device.compliance).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600">{key.replace('_', ' ')}:</span>
                    <Badge className={value ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                      {value ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            {device.certificates.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Certificats:</div>
                <div className="space-y-1">
                  {device.certificates.map(cert => (
                    <div key={cert.id} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cert.type}</span>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Émetteur: {cert.issuer} • Expire: {new Date(cert.validTo).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {device.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Vulnérabilités:</div>
                <div className="space-y-1">
                  {device.vulnerabilities.map(vuln => (
                    <div key={vuln.id} className="bg-red-50 p-2 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{vuln.cve}</span>
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {vuln.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Device Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Informations</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Propriétaire:</span>
                  <div className="font-medium">{device.owner}</div>
                </div>
                <div>
                  <span className="text-gray-600">Localisation:</span>
                  <div className="font-medium">{device.location}</div>
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
                <Shield className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>ID: {device.deviceId}</div>
              <div>Dernière activité: {new Date(device.lastSeen).toLocaleString('fr-FR')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewStats = () => {
    const activePolicies = securityPolicies.filter(p => p.status === 'active').length;
    const verifiedIdentities = identityVerifications.filter(i => i.status === 'verified').length;
    const trustedDevices = deviceTrusts.filter(d => d.status === 'trusted').length;
    const activeThreats = threatIntelligence.filter(t => t.status === 'active').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Politiques Actives</p>
                <p className="text-2xl font-bold">{activePolicies}/{securityPolicies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Identités Vérifiées</p>
                <p className="text-2xl font-bold text-green-600">{verifiedIdentities}/{identityVerifications.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appareils de Confiance</p>
                <p className="text-2xl font-bold text-blue-600">{trustedDevices}/{deviceTrusts.length}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menaces Actives</p>
                <p className="text-2xl font-bold text-orange-600">{activeThreats}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Architecture Sécurité Zero Trust</h1>
          <p className="text-gray-600">Sécurité adaptative avec vérification continue et confiance zéro</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport Sécurité
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
          <TabsTrigger value="identity">Identités</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="network">Réseau</TabsTrigger>
          <TabsTrigger value="threats">Menaces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewStats()}
          
          {/* Security posture chart */}
          <Card>
            <CardHeader>
              <CardTitle>Posture de Sécurité</CardTitle>
              <CardDescription>Évolution des métriques de sécurité sur {selectedTimeRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de posture sécurité en cours de développement</p>
                <p className="text-sm">Métriques temps réel et tendances de sécurité</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Politiques de Sécurité</h2>
            <Button onClick={() => setShowPolicyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Politique
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPolicies.map(renderSecurityPolicyCard)}
          </div>
        </TabsContent>

        <TabsContent value="identity" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vérification d'Identité</h2>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {identityVerifications.map(renderIdentityCard)}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Confiance des Appareils</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer Appareil
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deviceTrusts.map(renderDeviceCard)}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Segmentation Réseau</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Segment
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {networkSegments.map(segment => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <Network className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{segment.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {segment.cidr} • VLAN {segment.vlan}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(segment.securityLevel)}>
                      {segment.securityLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{segment.description}</p>
                    
                    {/* Traffic metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{segment.traffic.inbound}</div>
                        <div className="text-gray-500">Entrant</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{segment.traffic.outbound}</div>
                        <div className="text-gray-500">Sortant</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{segment.traffic.blocked}</div>
                        <div className="text-gray-500">Bloqué</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">{segment.traffic.suspicious}</div>
                        <div className="text-gray-500">Suspect</div>
                      </div>
                    </div>

                    {/* Monitoring */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(segment.monitoring).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize text-gray-600">{key.replace('_', ' ')}:</span>
                          <Badge className={value ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'}>
                            {value ? 'Activé' : 'Désactivé'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Configurer
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Intelligence des Menaces</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Menace
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {threatIntelligence.map(threat => (
              <Card key={threat.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{threat.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {threat.type} • {threat.attribution.actor}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{threat.description}</p>
                    
                    {/* Impact */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">Confidentialité</div>
                        <Badge className={getSeverityColor(threat.impact.confidentiality)}>
                          {threat.impact.confidentiality}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Intégrité</div>
                        <Badge className={getSeverityColor(threat.impact.integrity)}>
                          {threat.impact.integrity}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Disponibilité</div>
                        <Badge className={getSeverityColor(threat.impact.availability)}>
                          {threat.impact.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Indicateurs:</div>
                      <div className="space-y-1">
                        {threat.indicators.slice(0, 2).map((indicator, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-sm">
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
                      </div>
                    </div>

                    {/* Mitigation */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Mesures d'atténuation:</div>
                      <div className="space-y-1">
                        {threat.mitigation.slice(0, 2).map((measure, index) => (
                          <div key={index} className="text-sm bg-blue-50 p-2 rounded">
                            • {measure}
                          </div>
                        ))}
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
                      <div>Source: {threat.source}</div>
                      <div>Première détection: {new Date(threat.firstSeen).toLocaleDateString('fr-FR')}</div>
                      <div>Dernière activité: {new Date(threat.lastSeen).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZeroTrustSecurityArchitecture;
