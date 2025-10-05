// Advanced Workflow Engine Component

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
  Play, Pause, Square, RotateCcw, Settings, Plus, Edit, Trash2,
  GitBranch, Clock, CheckCircle, AlertTriangle, Users, Mail,
  Calendar, FileText, Database, Zap, Activity, Eye, Download
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'approval' | 'notification' | 'delay' | 'integration';
  description: string;
  config: {
    [key: string]: any;
  };
  position: { x: number; y: number };
  connections: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  executionTime?: number;
  error?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: {
    type: 'manual' | 'schedule' | 'event' | 'webhook';
    config: any;
  };
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: string;
  createdAt: string;
  lastModified: string;
  lastExecution?: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: string;
  stepExecutions: {
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: string;
    endTime?: string;
    duration?: number;
    output?: any;
    error?: string;
  }[];
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    stepId?: string;
  }[];
}

const AdvancedWorkflowEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [showDesigner, setShowDesigner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock workflows data
  const mockWorkflows: Workflow[] = [
    {
      id: 'order_approval',
      name: 'Approbation des Commandes',
      description: 'Workflow d\'approbation automatique pour les commandes importantes',
      category: 'Ventes',
      trigger: {
        type: 'event',
        config: { event: 'order.created', condition: 'amount > 10000' }
      },
      steps: [
        {
          id: 'step_1',
          name: 'Vérification Montant',
          type: 'condition',
          description: 'Vérifier si le montant dépasse le seuil',
          config: { condition: 'order.amount > 10000' },
          position: { x: 100, y: 100 },
          connections: ['step_2'],
          status: 'completed'
        },
        {
          id: 'step_2',
          name: 'Notification Manager',
          type: 'notification',
          description: 'Notifier le manager pour approbation',
          config: { 
            recipients: ['manager@company.com'],
            template: 'order_approval_request',
            subject: 'Approbation requise pour commande #{order.id}'
          },
          position: { x: 300, y: 100 },
          connections: ['step_3'],
          status: 'completed'
        },
        {
          id: 'step_3',
          name: 'Attente Approbation',
          type: 'approval',
          description: 'Attendre l\'approbation du manager',
          config: { 
            approvers: ['manager@company.com'],
            timeout: 24,
            timeoutAction: 'auto_approve'
          },
          position: { x: 500, y: 100 },
          connections: ['step_4'],
          status: 'running'
        },
        {
          id: 'step_4',
          name: 'Mise à jour Statut',
          type: 'action',
          description: 'Mettre à jour le statut de la commande',
          config: { 
            action: 'update_order_status',
            status: 'approved'
          },
          position: { x: 700, y: 100 },
          connections: [],
          status: 'pending'
        }
      ],
      status: 'active',
      version: '1.2.0',
      createdAt: '2024-11-15T10:00:00Z',
      lastModified: '2024-12-10T14:30:00Z',
      lastExecution: '2024-12-20T13:45:00Z',
      executionCount: 156,
      successRate: 94.2,
      averageExecutionTime: 1850
    },
    {
      id: 'invoice_processing',
      name: 'Traitement des Factures',
      description: 'Automatisation du traitement et de l\'envoi des factures',
      category: 'Finance',
      trigger: {
        type: 'schedule',
        config: { cron: '0 9 * * 1-5', timezone: 'Africa/Casablanca' }
      },
      steps: [
        {
          id: 'step_1',
          name: 'Génération Factures',
          type: 'action',
          description: 'Générer les factures en attente',
          config: { action: 'generate_pending_invoices' },
          position: { x: 100, y: 100 },
          connections: ['step_2'],
          status: 'completed'
        },
        {
          id: 'step_2',
          name: 'Validation Comptable',
          type: 'approval',
          description: 'Validation par le service comptable',
          config: { 
            approvers: ['comptable@company.com'],
            timeout: 4,
            timeoutAction: 'escalate'
          },
          position: { x: 300, y: 100 },
          connections: ['step_3'],
          status: 'completed'
        },
        {
          id: 'step_3',
          name: 'Envoi par Email',
          type: 'action',
          description: 'Envoyer les factures par email',
          config: { 
            action: 'send_invoices_email',
            template: 'invoice_email'
          },
          position: { x: 500, y: 100 },
          connections: [],
          status: 'completed'
        }
      ],
      status: 'active',
      version: '2.1.0',
      createdAt: '2024-10-20T09:00:00Z',
      lastModified: '2024-12-15T11:20:00Z',
      lastExecution: '2024-12-20T09:00:00Z',
      executionCount: 89,
      successRate: 98.9,
      averageExecutionTime: 3200
    },
    {
      id: 'customer_onboarding',
      name: 'Intégration Client',
      description: 'Processus d\'intégration automatique des nouveaux clients',
      category: 'CRM',
      trigger: {
        type: 'event',
        config: { event: 'customer.created' }
      },
      steps: [
        {
          id: 'step_1',
          name: 'Email de Bienvenue',
          type: 'notification',
          description: 'Envoyer un email de bienvenue',
          config: { 
            template: 'welcome_email',
            delay: 0
          },
          position: { x: 100, y: 100 },
          connections: ['step_2'],
          status: 'completed'
        },
        {
          id: 'step_2',
          name: 'Création Compte',
          type: 'action',
          description: 'Créer le compte client dans le système',
          config: { action: 'create_customer_account' },
          position: { x: 300, y: 100 },
          connections: ['step_3'],
          status: 'completed'
        },
        {
          id: 'step_3',
          name: 'Attribution Commercial',
          type: 'action',
          description: 'Attribuer un commercial au client',
          config: { 
            action: 'assign_sales_rep',
            criteria: 'region'
          },
          position: { x: 500, y: 100 },
          connections: ['step_4'],
          status: 'completed'
        },
        {
          id: 'step_4',
          name: 'Suivi J+7',
          type: 'delay',
          description: 'Attendre 7 jours puis envoyer un suivi',
          config: { 
            delay: 7,
            unit: 'days'
          },
          position: { x: 700, y: 100 },
          connections: ['step_5'],
          status: 'running'
        },
        {
          id: 'step_5',
          name: 'Email de Suivi',
          type: 'notification',
          description: 'Envoyer un email de suivi',
          config: { 
            template: 'followup_email'
          },
          position: { x: 900, y: 100 },
          connections: [],
          status: 'pending'
        }
      ],
      status: 'active',
      version: '1.0.0',
      createdAt: '2024-12-01T15:00:00Z',
      lastModified: '2024-12-05T10:15:00Z',
      lastExecution: '2024-12-19T16:30:00Z',
      executionCount: 23,
      successRate: 100,
      averageExecutionTime: 950
    }
  ];

  // Mock executions data
  const mockExecutions: WorkflowExecution[] = [
    {
      id: 'exec_1',
      workflowId: 'order_approval',
      status: 'running',
      startTime: '2024-12-20T13:45:00Z',
      triggeredBy: 'system',
      stepExecutions: [
        {
          stepId: 'step_1',
          status: 'completed',
          startTime: '2024-12-20T13:45:00Z',
          endTime: '2024-12-20T13:45:02Z',
          duration: 2000,
          output: { result: true }
        },
        {
          stepId: 'step_2',
          status: 'completed',
          startTime: '2024-12-20T13:45:02Z',
          endTime: '2024-12-20T13:45:05Z',
          duration: 3000,
          output: { sent: true, messageId: 'msg_123' }
        },
        {
          stepId: 'step_3',
          status: 'running',
          startTime: '2024-12-20T13:45:05Z'
        }
      ],
      logs: [
        {
          timestamp: '2024-12-20T13:45:00Z',
          level: 'info',
          message: 'Workflow execution started',
          stepId: undefined
        },
        {
          timestamp: '2024-12-20T13:45:02Z',
          level: 'info',
          message: 'Condition evaluated to true',
          stepId: 'step_1'
        },
        {
          timestamp: '2024-12-20T13:45:05Z',
          level: 'info',
          message: 'Notification sent successfully',
          stepId: 'step_2'
        }
      ]
    }
  ];

  useEffect(() => {
    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'archived': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'action': return <Zap className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      case 'approval': return <Users className="h-4 w-4" />;
      case 'notification': return <Mail className="h-4 w-4" />;
      case 'delay': return <Clock className="h-4 w-4" />;
      case 'integration': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const renderWorkflowCard = (workflow: Workflow) => {
    return (
      <Card key={workflow.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </div>
            <Badge className={getStatusColor(workflow.status)}>
              {workflow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {workflow.executionCount}
                </div>
                <div className="text-xs text-gray-500">Exécutions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {workflow.successRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Succès</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(workflow.averageExecutionTime / 1000)}s
                </div>
                <div className="text-xs text-gray-500">Temps moyen</div>
              </div>
            </div>

            {/* Trigger info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Déclencheur:</span>
              <Badge variant="outline">
                {workflow.trigger.type === 'manual' ? 'Manuel' :
                 workflow.trigger.type === 'schedule' ? 'Planifié' :
                 workflow.trigger.type === 'event' ? 'Événement' : 'Webhook'}
              </Badge>
            </div>

            {/* Steps preview */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Étapes ({workflow.steps.length})
              </div>
              <div className="flex space-x-1 overflow-x-auto">
                {workflow.steps.map(step => (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs whitespace-nowrap ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {getStepIcon(step.type)}
                    <span>{step.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last execution */}
            {workflow.lastExecution && (
              <div className="text-xs text-gray-500">
                Dernière exécution: {new Date(workflow.lastExecution).toLocaleString('fr-FR')}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="h-3 w-3 mr-1" />
                Exécuter
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedWorkflow(workflow.id);
                  setShowDesigner(true);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Modifier
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExecutionsList = () => (
    <Card>
      <CardHeader>
        <CardTitle>Exécutions Récentes</CardTitle>
        <CardDescription>Historique des exécutions de workflows</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {executions.map(execution => {
            const workflow = workflows.find(w => w.id === execution.workflowId);
            const StatusIcon = execution.status === 'completed' ? CheckCircle :
                              execution.status === 'failed' ? AlertTriangle :
                              execution.status === 'running' ? Activity : Clock;
            
            return (
              <div key={execution.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <StatusIcon className={`h-5 w-5 ${
                  execution.status === 'completed' ? 'text-green-600' :
                  execution.status === 'failed' ? 'text-red-600' :
                  execution.status === 'running' ? 'text-blue-600' : 'text-yellow-600'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{workflow?.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(execution.startTime).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Déclenché par: {execution.triggeredBy}
                  </div>
                  
                  {/* Progress bar for running executions */}
                  {execution.status === 'running' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span>
                          {execution.stepExecutions.filter(s => s.status === 'completed').length} / {execution.stepExecutions.length}
                        </span>
                      </div>
                      <Progress 
                        value={(execution.stepExecutions.filter(s => s.status === 'completed').length / execution.stepExecutions.length) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {execution.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      Durée: {Math.round(execution.duration / 1000)}s
                    </div>
                  )}
                </div>
                
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Détails
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkflowDesigner = () => (
    <Dialog open={showDesigner} onOpenChange={setShowDesigner}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Concepteur de Workflow</DialogTitle>
          <DialogDescription>
            Concevez et modifiez votre workflow visuellement
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Workflow canvas */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-96 bg-gray-50">
            <div className="text-center text-gray-500">
              <GitBranch className="h-12 w-12 mx-auto mb-4" />
              <p>Concepteur visuel de workflow</p>
              <p className="text-sm">Glissez-déposez les étapes pour créer votre workflow</p>
            </div>
          </div>
          
          {/* Toolbox */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Boîte à Outils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { type: 'action', name: 'Action', icon: Zap },
                  { type: 'condition', name: 'Condition', icon: GitBranch },
                  { type: 'approval', name: 'Approbation', icon: Users },
                  { type: 'notification', name: 'Notification', icon: Mail },
                  { type: 'delay', name: 'Délai', icon: Clock },
                  { type: 'integration', name: 'Intégration', icon: Database }
                ].map(tool => {
                  const IconComponent = tool.icon;
                  return (
                    <div 
                      key={tool.type}
                      className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <IconComponent className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm">{tool.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDesigner(false)}>
              Annuler
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderOverviewStats = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
    const averageSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows Totaux</p>
                <p className="text-2xl font-bold">{totalWorkflows}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeWorkflows}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exécutions</p>
                <p className="text-2xl font-bold">{totalExecutions}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Succès</p>
                <p className="text-2xl font-bold text-green-600">{averageSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Moteur de Workflow Avancé</h1>
          <p className="text-gray-600">Automatisez vos processus métier avec des workflows intelligents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" onClick={() => setShowDesigner(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Exécutions</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {renderOverviewStats()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(renderWorkflowCard)}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          {renderExecutionsList()}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modèles de Workflow</CardTitle>
              <CardDescription>Modèles prêts à l'emploi pour vos processus courants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Bibliothèque de modèles en cours de développement</p>
                <p className="text-sm">Bientôt disponible avec plus de 50 modèles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyses de Performance</CardTitle>
              <CardDescription>Statistiques et métriques de vos workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>Analyses avancées en cours de développement</p>
                <p className="text-sm">Tableaux de bord et métriques détaillées</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderWorkflowDesigner()}
    </div>
  );
};

export default AdvancedWorkflowEngine;
