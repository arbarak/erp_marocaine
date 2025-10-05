// IoT Device Management Component

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
  Cpu, Wifi, Battery, Thermometer, Activity, Globe,
  RefreshCw, Plus, Download, Eye, Settings, BarChart3,
  CheckCircle, XCircle, AlertTriangle, Clock, Users,
  Target, Archive, Search, Filter, Layers, GitBranch,
  Zap, Network, Database, Server, MapPin, Shield
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface IoTDevice {
  id: string;
  name: string;
  description: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller' | 'camera' | 'beacon' | 'tracker' | 'meter';
  category: 'industrial' | 'environmental' | 'security' | 'energy' | 'logistics' | 'healthcare' | 'agriculture';
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'updating' | 'sleeping' | 'low_battery';
  location: DeviceLocation;
  hardware: DeviceHardware;
  connectivity: DeviceConnectivity;
  sensors: DeviceSensor[];
  actuators: DeviceActuator[];
  firmware: DeviceFirmware;
  configuration: DeviceConfiguration;
  security: DeviceSecurity;
  monitoring: DeviceMonitoring;
  analytics: DeviceAnalytics;
  maintenance: DeviceMaintenance;
  integration: DeviceIntegration;
  compliance: DeviceCompliance;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface DeviceLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  address: string;
  building: string;
  floor: string;
  room: string;
  zone: string;
  accuracy: number;
  lastUpdate: string;
}

interface DeviceHardware {
  manufacturer: string;
  model: string;
  serialNumber: string;
  version: string;
  processor: ProcessorInfo;
  memory: MemoryInfo;
  storage: StorageInfo;
  power: PowerInfo;
  interfaces: HardwareInterface[];
  specifications: HardwareSpecs;
}

interface ProcessorInfo {
  type: string;
  architecture: string;
  frequency: number;
  cores: number;
  usage: number;
  temperature: number;
}

interface MemoryInfo {
  total: number;
  used: number;
  available: number;
  type: string;
  speed: number;
}

interface StorageInfo {
  total: number;
  used: number;
  available: number;
  type: 'flash' | 'emmc' | 'sd' | 'hdd' | 'ssd';
  health: number;
}

interface PowerInfo {
  source: 'battery' | 'solar' | 'mains' | 'usb' | 'poe' | 'wireless';
  voltage: number;
  current: number;
  power: number;
  battery: BatteryInfo;
  efficiency: number;
}

interface BatteryInfo {
  level: number;
  capacity: number;
  health: number;
  cycles: number;
  temperature: number;
  charging: boolean;
  timeRemaining: number;
}

interface HardwareInterface {
  type: 'usb' | 'ethernet' | 'wifi' | 'bluetooth' | 'zigbee' | 'lora' | 'cellular' | 'gpio' | 'i2c' | 'spi' | 'uart';
  name: string;
  status: 'active' | 'inactive' | 'error';
  configuration: { [key: string]: any };
}

interface HardwareSpecs {
  dimensions: { width: number; height: number; depth: number };
  weight: number;
  operatingTemperature: { min: number; max: number };
  humidity: { min: number; max: number };
  ipRating: string;
  certifications: string[];
}

interface DeviceConnectivity {
  primary: ConnectionInfo;
  backup: ConnectionInfo[];
  protocols: ProtocolInfo[];
  network: NetworkInfo;
  security: ConnectivitySecurity;
  quality: ConnectionQuality;
}

interface ConnectionInfo {
  type: 'wifi' | 'ethernet' | 'cellular' | 'lora' | 'zigbee' | 'bluetooth' | 'satellite';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  signalStrength: number;
  bandwidth: number;
  latency: number;
  configuration: ConnectionConfig;
}

interface ConnectionConfig {
  ssid?: string;
  frequency?: number;
  channel?: number;
  encryption?: string;
  apn?: string;
  operator?: string;
  deviceEui?: string;
  appKey?: string;
}

interface ProtocolInfo {
  name: string;
  version: string;
  enabled: boolean;
  configuration: { [key: string]: any };
  security: ProtocolSecurity;
}

interface ProtocolSecurity {
  encryption: boolean;
  authentication: boolean;
  integrity: boolean;
  keyManagement: string;
}

interface NetworkInfo {
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dns: string[];
  mac: string;
  hostname: string;
  domain: string;
}

interface ConnectivitySecurity {
  vpn: VPNConfig;
  firewall: FirewallConfig;
  certificates: CertificateInfo[];
  encryption: EncryptionConfig;
}

interface VPNConfig {
  enabled: boolean;
  type: 'openvpn' | 'ipsec' | 'wireguard';
  server: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface FirewallConfig {
  enabled: boolean;
  rules: FirewallRule[];
  defaultPolicy: 'allow' | 'deny';
  logging: boolean;
}

interface FirewallRule {
  id: string;
  action: 'allow' | 'deny' | 'log';
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  source: string;
  destination: string;
  port: string;
  enabled: boolean;
}

interface CertificateInfo {
  type: 'x509' | 'ecc' | 'rsa';
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  status: 'valid' | 'expired' | 'revoked';
}

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  mode: string;
  keyRotation: boolean;
  rotationInterval: number;
}

interface ConnectionQuality {
  uptime: number;
  reliability: number;
  throughput: number;
  packetLoss: number;
  jitter: number;
  history: QualityMetric[];
}

interface QualityMetric {
  timestamp: string;
  signalStrength: number;
  bandwidth: number;
  latency: number;
  packetLoss: number;
}

interface DeviceSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'light' | 'motion' | 'sound' | 'air_quality' | 'vibration' | 'proximity' | 'gps';
  unit: string;
  range: { min: number; max: number };
  accuracy: number;
  resolution: number;
  samplingRate: number;
  calibration: SensorCalibration;
  readings: SensorReading[];
  alerts: SensorAlert[];
  status: 'active' | 'inactive' | 'error' | 'calibrating';
}

interface SensorCalibration {
  lastCalibrated: string;
  nextCalibration: string;
  method: 'manual' | 'automatic' | 'factory';
  offset: number;
  scale: number;
  drift: number;
}

interface SensorReading {
  timestamp: string;
  value: number;
  quality: 'good' | 'fair' | 'poor' | 'invalid';
  confidence: number;
  processed: boolean;
}

interface SensorAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'failure' | 'calibration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: string;
  threshold: number;
  enabled: boolean;
  actions: AlertAction[];
}

interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'actuator' | 'log';
  target: string;
  parameters: { [key: string]: any };
  delay: number;
}

interface DeviceActuator {
  id: string;
  name: string;
  type: 'relay' | 'motor' | 'valve' | 'pump' | 'heater' | 'cooler' | 'light' | 'speaker' | 'display';
  status: 'idle' | 'active' | 'error' | 'maintenance';
  state: any;
  capabilities: ActuatorCapability[];
  commands: ActuatorCommand[];
  safety: ActuatorSafety;
  maintenance: ActuatorMaintenance;
}

interface ActuatorCapability {
  name: string;
  type: 'binary' | 'analog' | 'digital' | 'pwm';
  range: { min: number; max: number };
  precision: number;
  responseTime: number;
}

interface ActuatorCommand {
  id: string;
  name: string;
  parameters: CommandParameter[];
  validation: CommandValidation;
  execution: CommandExecution;
  history: CommandHistory[];
}

interface CommandParameter {
  name: string;
  type: 'boolean' | 'integer' | 'float' | 'string' | 'enum';
  required: boolean;
  default: any;
  validation: ParameterValidation;
}

interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  custom?: string;
}

interface CommandValidation {
  enabled: boolean;
  rules: ValidationRule[];
  timeout: number;
  retries: number;
}

interface ValidationRule {
  condition: string;
  message: string;
  severity: 'warning' | 'error';
}

interface CommandExecution {
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration: number;
  result: any;
  error?: string;
}

interface CommandHistory {
  timestamp: string;
  command: string;
  parameters: { [key: string]: any };
  result: 'success' | 'failure';
  duration: number;
  user: string;
}

interface ActuatorSafety {
  enabled: boolean;
  interlocks: SafetyInterlock[];
  emergencyStop: boolean;
  failSafe: FailSafeConfig;
  monitoring: SafetyMonitoring;
}

interface SafetyInterlock {
  name: string;
  condition: string;
  action: 'stop' | 'limit' | 'alert';
  enabled: boolean;
  priority: number;
}

interface FailSafeConfig {
  enabled: boolean;
  mode: 'stop' | 'safe_state' | 'maintain';
  timeout: number;
  state: any;
}

interface SafetyMonitoring {
  enabled: boolean;
  parameters: string[];
  thresholds: { [key: string]: number };
  actions: string[];
}

interface ActuatorMaintenance {
  schedule: MaintenanceSchedule;
  history: MaintenanceRecord[];
  predictive: PredictiveMaintenance;
  alerts: MaintenanceAlert[];
}

interface MaintenanceSchedule {
  frequency: string;
  nextDue: string;
  tasks: MaintenanceTask[];
  automated: boolean;
}

interface MaintenanceTask {
  name: string;
  type: 'inspection' | 'cleaning' | 'calibration' | 'replacement' | 'lubrication';
  duration: number;
  skills: string[];
  tools: string[];
  parts: string[];
}

interface MaintenanceRecord {
  date: string;
  type: string;
  technician: string;
  duration: number;
  tasks: string[];
  findings: string[];
  parts: string[];
  cost: number;
}

interface PredictiveMaintenance {
  enabled: boolean;
  algorithms: string[];
  indicators: HealthIndicator[];
  predictions: MaintenancePrediction[];
  recommendations: string[];
}

interface HealthIndicator {
  name: string;
  value: number;
  threshold: number;
  trend: 'improving' | 'stable' | 'degrading';
  confidence: number;
}

interface MaintenancePrediction {
  component: string;
  timeToFailure: number;
  confidence: number;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface MaintenanceAlert {
  type: 'due' | 'overdue' | 'predicted' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  dueDate: string;
  actions: string[];
}

interface DeviceFirmware {
  current: FirmwareVersion;
  available: FirmwareVersion[];
  updatePolicy: UpdatePolicy;
  rollback: RollbackConfig;
  security: FirmwareSecurity;
  history: FirmwareHistory[];
}

interface FirmwareVersion {
  version: string;
  buildDate: string;
  size: number;
  checksum: string;
  signature: string;
  features: string[];
  bugFixes: string[];
  securityFixes: string[];
  compatibility: CompatibilityInfo;
}

interface CompatibilityInfo {
  hardware: string[];
  dependencies: string[];
  conflicts: string[];
  requirements: { [key: string]: any };
}

interface UpdatePolicy {
  automatic: boolean;
  schedule: UpdateSchedule;
  approval: ApprovalProcess;
  testing: TestingProcess;
  rollout: RolloutStrategy;
}

interface UpdateSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  maintenance: boolean;
}

interface ApprovalProcess {
  required: boolean;
  approvers: string[];
  threshold: number;
  timeout: number;
  escalation: string[];
}

interface TestingProcess {
  enabled: boolean;
  stages: TestStage[];
  criteria: TestCriteria;
  automation: boolean;
}

interface TestStage {
  name: string;
  type: 'unit' | 'integration' | 'system' | 'acceptance';
  duration: number;
  criteria: string[];
  automated: boolean;
}

interface TestCriteria {
  functional: string[];
  performance: string[];
  security: string[];
  compatibility: string[];
}

interface RolloutStrategy {
  type: 'immediate' | 'phased' | 'canary' | 'blue_green';
  phases: RolloutPhase[];
  criteria: RolloutCriteria;
  monitoring: RolloutMonitoring;
}

interface RolloutPhase {
  name: string;
  percentage: number;
  duration: number;
  criteria: string[];
  rollback: boolean;
}

interface RolloutCriteria {
  success: string[];
  failure: string[];
  timeout: number;
  monitoring: string[];
}

interface RolloutMonitoring {
  enabled: boolean;
  metrics: string[];
  thresholds: { [key: string]: number };
  alerts: string[];
}

interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: 'previous' | 'golden' | 'factory';
  timeout: number;
}

interface RollbackTrigger {
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  delay: number;
  confirmation: boolean;
}

interface FirmwareSecurity {
  signing: CodeSigning;
  encryption: boolean;
  verification: boolean;
  attestation: DeviceAttestation;
  secureboot: SecureBootConfig;
}

interface CodeSigning {
  enabled: boolean;
  algorithm: string;
  keyLength: number;
  certificate: string;
  validation: boolean;
}

interface DeviceAttestation {
  enabled: boolean;
  protocol: string;
  frequency: string;
  keys: AttestationKey[];
  validation: boolean;
}

interface AttestationKey {
  type: 'hardware' | 'software';
  algorithm: string;
  length: number;
  usage: string;
  expiry: string;
}

interface SecureBootConfig {
  enabled: boolean;
  chain: BootChain[];
  verification: boolean;
  recovery: boolean;
}

interface BootChain {
  stage: string;
  component: string;
  hash: string;
  signature: string;
  verified: boolean;
}

interface FirmwareHistory {
  version: string;
  installDate: string;
  method: 'ota' | 'usb' | 'ethernet' | 'manual';
  duration: number;
  status: 'success' | 'failure' | 'partial';
  rollback: boolean;
  user: string;
}

const IoTDeviceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock IoT devices data
  const mockDevices: IoTDevice[] = [
    {
      id: 'iot_001',
      name: 'Capteur Température Entrepôt A',
      description: 'Capteur de température et humidité pour surveillance environnementale',
      type: 'sensor',
      category: 'industrial',
      status: 'online',
      location: {
        latitude: 33.5731,
        longitude: -7.5898,
        altitude: 50,
        address: 'Zone Industrielle Ain Sebaa, Casablanca',
        building: 'Entrepôt A',
        floor: 'RDC',
        room: 'Zone 1',
        zone: 'Nord',
        accuracy: 5,
        lastUpdate: '2024-12-20T15:30:00Z'
      },
      hardware: {
        manufacturer: 'Sensirion',
        model: 'SHT85',
        serialNumber: 'SHT85-001-2024',
        version: 'v2.1',
        processor: {
          type: 'ARM Cortex-M0+',
          architecture: 'ARMv6-M',
          frequency: 48,
          cores: 1,
          usage: 15,
          temperature: 35
        },
        memory: {
          total: 256,
          used: 128,
          available: 128,
          type: 'SRAM',
          speed: 48
        },
        storage: {
          total: 1024,
          used: 512,
          available: 512,
          type: 'flash',
          health: 98
        },
        power: {
          source: 'battery',
          voltage: 3.3,
          current: 0.05,
          power: 0.165,
          battery: {
            level: 85,
            capacity: 3000,
            health: 95,
            cycles: 150,
            temperature: 25,
            charging: false,
            timeRemaining: 720
          },
          efficiency: 92
        },
        interfaces: [
          {
            type: 'wifi',
            name: 'WiFi 802.11n',
            status: 'active',
            configuration: {
              ssid: 'IoT-Network',
              frequency: 2.4,
              channel: 6,
              encryption: 'WPA2'
            }
          }
        ],
        specifications: {
          dimensions: { width: 50, height: 30, depth: 15 },
          weight: 25,
          operatingTemperature: { min: -40, max: 85 },
          humidity: { min: 0, max: 100 },
          ipRating: 'IP65',
          certifications: ['CE', 'FCC', 'RoHS']
        }
      },
      connectivity: {
        primary: {
          type: 'wifi',
          status: 'connected',
          signalStrength: -45,
          bandwidth: 150,
          latency: 25,
          configuration: {
            ssid: 'IoT-Network',
            frequency: 2.4,
            channel: 6,
            encryption: 'WPA2'
          }
        },
        backup: [],
        protocols: [
          {
            name: 'MQTT',
            version: '3.1.1',
            enabled: true,
            configuration: {
              broker: 'mqtt.company.com',
              port: 8883,
              tls: true,
              qos: 1
            },
            security: {
              encryption: true,
              authentication: true,
              integrity: true,
              keyManagement: 'X.509'
            }
          }
        ],
        network: {
          ipAddress: '192.168.1.100',
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          dns: ['8.8.8.8', '8.8.4.4'],
          mac: '00:1B:44:11:3A:B7',
          hostname: 'temp-sensor-001',
          domain: 'iot.company.com'
        },
        security: {
          vpn: {
            enabled: true,
            type: 'openvpn',
            server: 'vpn.company.com',
            status: 'connected'
          },
          firewall: {
            enabled: true,
            rules: [
              {
                id: 'rule_001',
                action: 'allow',
                protocol: 'tcp',
                source: '192.168.1.0/24',
                destination: 'any',
                port: '8883',
                enabled: true
              }
            ],
            defaultPolicy: 'deny',
            logging: true
          },
          certificates: [
            {
              type: 'x509',
              subject: 'CN=temp-sensor-001',
              issuer: 'CN=Company IoT CA',
              validFrom: '2024-01-01T00:00:00Z',
              validTo: '2025-01-01T00:00:00Z',
              fingerprint: 'SHA256:1234567890abcdef...',
              status: 'valid'
            }
          ],
          encryption: {
            algorithm: 'AES',
            keyLength: 256,
            mode: 'GCM',
            keyRotation: true,
            rotationInterval: 30
          }
        },
        quality: {
          uptime: 99.8,
          reliability: 98.5,
          throughput: 145,
          packetLoss: 0.1,
          jitter: 2,
          history: [
            {
              timestamp: '2024-12-20T15:00:00Z',
              signalStrength: -45,
              bandwidth: 150,
              latency: 25,
              packetLoss: 0.1
            }
          ]
        }
      },
      sensors: [
        {
          id: 'temp_001',
          name: 'Température',
          type: 'temperature',
          unit: '°C',
          range: { min: -40, max: 85 },
          accuracy: 0.1,
          resolution: 0.01,
          samplingRate: 1,
          calibration: {
            lastCalibrated: '2024-11-01T00:00:00Z',
            nextCalibration: '2025-05-01T00:00:00Z',
            method: 'automatic',
            offset: 0.05,
            scale: 1.0,
            drift: 0.001
          },
          readings: [
            {
              timestamp: '2024-12-20T15:30:00Z',
              value: 22.5,
              quality: 'good',
              confidence: 0.98,
              processed: true
            }
          ],
          alerts: [
            {
              id: 'temp_alert_001',
              type: 'threshold',
              severity: 'high',
              condition: 'temperature > 30',
              threshold: 30,
              enabled: true,
              actions: [
                {
                  type: 'email',
                  target: 'maintenance@company.com',
                  parameters: { subject: 'Température élevée détectée' },
                  delay: 0
                }
              ]
            }
          ],
          status: 'active'
        }
      ],
      actuators: [],
      firmware: {
        current: {
          version: '2.1.5',
          buildDate: '2024-11-15T00:00:00Z',
          size: 512000,
          checksum: 'sha256:abcdef123456...',
          signature: 'rsa:fedcba654321...',
          features: ['MQTT over TLS', 'OTA Updates', 'Power Management'],
          bugFixes: ['Fixed memory leak in WiFi driver'],
          securityFixes: ['Patched buffer overflow vulnerability'],
          compatibility: {
            hardware: ['SHT85 v2.x'],
            dependencies: ['WiFi Driver v1.2+'],
            conflicts: [],
            requirements: { memory: 256, storage: 512 }
          }
        },
        available: [
          {
            version: '2.2.0',
            buildDate: '2024-12-01T00:00:00Z',
            size: 520000,
            checksum: 'sha256:123456abcdef...',
            signature: 'rsa:654321fedcba...',
            features: ['Enhanced Security', 'Improved Power Management'],
            bugFixes: ['Fixed sensor calibration issue'],
            securityFixes: ['Updated TLS library'],
            compatibility: {
              hardware: ['SHT85 v2.x'],
              dependencies: ['WiFi Driver v1.3+'],
              conflicts: [],
              requirements: { memory: 256, storage: 512 }
            }
          }
        ],
        updatePolicy: {
          automatic: false,
          schedule: {
            enabled: true,
            frequency: 'monthly',
            time: '02:00',
            timezone: 'Africa/Casablanca',
            maintenance: true
          },
          approval: {
            required: true,
            approvers: ['iot-admin@company.com'],
            threshold: 1,
            timeout: 86400,
            escalation: ['cto@company.com']
          },
          testing: {
            enabled: true,
            stages: [
              {
                name: 'Unit Tests',
                type: 'unit',
                duration: 300,
                criteria: ['All tests pass'],
                automated: true
              }
            ],
            criteria: {
              functional: ['Sensor readings accurate'],
              performance: ['Power consumption within limits'],
              security: ['TLS connection successful'],
              compatibility: ['Hardware compatibility verified']
            },
            automation: true
          },
          rollout: {
            type: 'phased',
            phases: [
              {
                name: 'Pilot',
                percentage: 10,
                duration: 86400,
                criteria: ['No critical errors'],
                rollback: true
              }
            ],
            criteria: {
              success: ['Error rate < 1%'],
              failure: ['Error rate > 5%'],
              timeout: 604800,
              monitoring: ['error_rate', 'connectivity']
            },
            monitoring: {
              enabled: true,
              metrics: ['error_rate', 'connectivity', 'performance'],
              thresholds: { error_rate: 0.05, connectivity: 0.95 },
              alerts: ['high_error_rate', 'connectivity_loss']
            }
          }
        },
        rollback: {
          enabled: true,
          automatic: true,
          triggers: [
            {
              condition: 'error_rate > 0.1',
              severity: 'high',
              delay: 300,
              confirmation: false
            }
          ],
          strategy: 'previous',
          timeout: 1800
        },
        security: {
          signing: {
            enabled: true,
            algorithm: 'RSA',
            keyLength: 2048,
            certificate: 'Company IoT Signing Certificate',
            validation: true
          },
          encryption: true,
          verification: true,
          attestation: {
            enabled: true,
            protocol: 'TPM 2.0',
            frequency: 'daily',
            keys: [
              {
                type: 'hardware',
                algorithm: 'RSA',
                length: 2048,
                usage: 'attestation',
                expiry: '2025-12-01T00:00:00Z'
              }
            ],
            validation: true
          },
          secureboot: {
            enabled: true,
            chain: [
              {
                stage: 'bootloader',
                component: 'u-boot',
                hash: 'sha256:abc123...',
                signature: 'rsa:def456...',
                verified: true
              }
            ],
            verification: true,
            recovery: true
          }
        },
        history: [
          {
            version: '2.1.5',
            installDate: '2024-11-20T02:00:00Z',
            method: 'ota',
            duration: 300,
            status: 'success',
            rollback: false,
            user: 'system'
          }
        ]
      },
      configuration: {
        parameters: [
          {
            name: 'sampling_interval',
            value: 60,
            type: 'integer',
            unit: 'seconds',
            range: { min: 10, max: 3600 },
            description: 'Intervalle d\'échantillonnage des capteurs'
          }
        ],
        profiles: [
          {
            name: 'Normal',
            active: true,
            parameters: { sampling_interval: 60, power_mode: 'normal' }
          }
        ],
        templates: [],
        validation: {
          enabled: true,
          rules: [
            {
              parameter: 'sampling_interval',
              condition: 'value >= 10 && value <= 3600',
              message: 'L\'intervalle doit être entre 10 et 3600 secondes'
            }
          ]
        },
        backup: {
          enabled: true,
          frequency: 'daily',
          retention: 30,
          location: 'cloud'
        }
      },
      security: {
        authentication: {
          method: 'certificate',
          certificate: 'device-cert-001',
          expiry: '2025-01-01T00:00:00Z',
          renewal: 'automatic'
        },
        authorization: {
          enabled: true,
          policies: [
            {
              resource: 'sensor_data',
              actions: ['read', 'write'],
              conditions: ['authenticated']
            }
          ]
        },
        encryption: {
          enabled: true,
          algorithm: 'AES-256-GCM',
          keyManagement: 'automatic',
          rotation: true
        },
        monitoring: {
          enabled: true,
          events: ['authentication', 'authorization', 'configuration'],
          alerts: ['failed_authentication', 'unauthorized_access'],
          retention: '1y'
        },
        compliance: {
          standards: ['ISO27001', 'IEC62443'],
          assessments: [
            {
              standard: 'ISO27001',
              date: '2024-06-01T00:00:00Z',
              score: 95,
              status: 'compliant'
            }
          ]
        }
      },
      monitoring: {
        enabled: true,
        metrics: [
          {
            name: 'cpu_usage',
            value: 15,
            unit: 'percentage',
            threshold: 80,
            status: 'normal'
          },
          {
            name: 'memory_usage',
            value: 50,
            unit: 'percentage',
            threshold: 90,
            status: 'normal'
          },
          {
            name: 'battery_level',
            value: 85,
            unit: 'percentage',
            threshold: 20,
            status: 'normal'
          }
        ],
        alerts: [
          {
            name: 'Low Battery',
            condition: 'battery_level < 20',
            severity: 'medium',
            enabled: true,
            actions: ['email', 'sms']
          }
        ],
        dashboards: ['Device Health', 'Sensor Data', 'Connectivity'],
        logging: {
          enabled: true,
          level: 'info',
          retention: '90d',
          compression: true
        },
        diagnostics: {
          enabled: true,
          tests: ['connectivity', 'sensor_health', 'memory_test'],
          schedule: 'daily',
          automated: true
        }
      },
      analytics: {
        usage: {
          dataPoints: 86400,
          averageInterval: 60,
          peakUsage: '2024-12-15T14:00:00Z',
          efficiency: 92
        },
        performance: {
          uptime: 99.8,
          responseTime: 150,
          throughput: 1440,
          errorRate: 0.1
        },
        trends: {
          temperature: {
            average: 22.5,
            trend: 'stable',
            variance: 0.5,
            anomalies: 0
          },
          battery: {
            drainRate: 0.5,
            trend: 'stable',
            estimatedLife: 720,
            cycles: 150
          }
        },
        predictions: {
          maintenance: {
            nextDue: '2025-05-01T00:00:00Z',
            confidence: 0.85,
            type: 'calibration'
          },
          failure: {
            probability: 0.05,
            timeframe: '6 months',
            component: 'battery'
          }
        }
      },
      maintenance: {
        schedule: {
          frequency: 'quarterly',
          nextDue: '2025-03-01T00:00:00Z',
          tasks: [
            {
              name: 'Calibration',
              type: 'calibration',
              duration: 30,
              skills: ['sensor_calibration'],
              tools: ['calibration_kit'],
              parts: []
            }
          ],
          automated: false
        },
        history: [
          {
            date: '2024-09-01T00:00:00Z',
            type: 'calibration',
            technician: 'tech@company.com',
            duration: 30,
            tasks: ['Sensor calibration'],
            findings: ['Slight drift detected'],
            parts: [],
            cost: 50
          }
        ],
        predictive: {
          enabled: true,
          algorithms: ['trend_analysis', 'anomaly_detection'],
          indicators: [
            {
              name: 'sensor_drift',
              value: 0.001,
              threshold: 0.01,
              trend: 'stable',
              confidence: 0.9
            }
          ],
          predictions: [
            {
              component: 'temperature_sensor',
              timeToFailure: 180,
              confidence: 0.85,
              recommendation: 'Schedule calibration',
              urgency: 'low'
            }
          ],
          recommendations: ['Schedule quarterly calibration']
        },
        alerts: [
          {
            type: 'due',
            severity: 'medium',
            message: 'Calibration due in 30 days',
            dueDate: '2025-03-01T00:00:00Z',
            actions: ['schedule_maintenance']
          }
        ]
      },
      integration: {
        erp: {
          enabled: true,
          system: 'SAP',
          endpoints: ['asset_management', 'maintenance'],
          synchronization: 'real_time'
        },
        cloud: {
          enabled: true,
          provider: 'AWS IoT Core',
          services: ['device_management', 'data_analytics'],
          region: 'eu-west-1'
        },
        apis: [
          {
            name: 'Device Management API',
            type: 'rest',
            endpoint: 'https://api.company.com/iot',
            authentication: 'oauth2',
            rateLimit: 1000
          }
        ],
        protocols: ['MQTT', 'CoAP', 'HTTP'],
        middleware: {
          enabled: true,
          platform: 'Apache Kafka',
          topics: ['sensor_data', 'device_events'],
          processing: 'real_time'
        }
      },
      compliance: {
        regulations: ['GDPR', 'IoT Security Act'],
        certifications: ['CE', 'FCC'],
        audits: [
          {
            auditor: 'TÜV SÜD',
            date: '2024-06-01T00:00:00Z',
            scope: 'IoT Security Assessment',
            result: 'passed',
            score: 92,
            findings: [],
            recommendations: ['Implement regular security updates']
          }
        ],
        privacy: {
          dataMinimization: true,
          encryption: true,
          anonymization: false,
          retention: '2y'
        },
        reporting: {
          enabled: true,
          frequency: 'quarterly',
          recipients: ['compliance@company.com'],
          automated: true
        }
      },
      owner: 'iot-team@company.com',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z'
    }
  ];

  useEffect(() => {
    setDevices(mockDevices);
    setIsLoading(false);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Appareils IoT</h1>
          <p className="text-gray-600">Surveillance et contrôle des dispositifs IoT connectés</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapport IoT
          </Button>
          <Button size="sm" onClick={() => setShowDeviceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Appareil
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <Cpu className="h-12 w-12 mx-auto mb-4" />
            <p>Module de gestion des appareils IoT en cours de développement</p>
            <p className="text-sm">Capteurs, actionneurs et passerelles connectées</p>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring IoT</CardTitle>
              <CardDescription>Surveillance en temps réel des dispositifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Dashboard de monitoring en cours de développement</p>
                <p className="text-sm">Métriques, alertes et diagnostics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics IoT</CardTitle>
              <CardDescription>Analyse des données et tendances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Module d'analytics en cours de développement</p>
                <p className="text-sm">Tendances, prédictions et optimisation</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Prédictive</CardTitle>
              <CardDescription>Planification et suivi de la maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Module de maintenance en cours de développement</p>
                <p className="text-sm">Maintenance prédictive et planification</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité IoT</CardTitle>
              <CardDescription>Protection et conformité des dispositifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <p>Module de sécurité en cours de développement</p>
                <p className="text-sm">Chiffrement, authentification et conformité</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégration IoT</CardTitle>
              <CardDescription>Connectivité et intégration système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Network className="h-12 w-12 mx-auto mb-4" />
                <p>Module d'intégration en cours de développement</p>
                <p className="text-sm">APIs, protocoles et middleware</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTDeviceManagement;
