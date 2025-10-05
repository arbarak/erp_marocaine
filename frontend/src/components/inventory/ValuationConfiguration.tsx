import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, Save, RefreshCw, AlertTriangle, 
  CheckCircle, Info, Calculator, Clock
} from 'lucide-react';

interface ValuationRule {
  id: string;
  product_category: string;
  warehouse: string;
  method: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ValuationSettings {
  default_method: string;
  auto_revaluation: boolean;
  revaluation_frequency: string;
  cost_variance_threshold: number;
  enable_layer_tracking: boolean;
  standard_cost_update_method: string;
}

const ValuationConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const [settings, setSettings] = useState<ValuationSettings>({
    default_method: 'WEIGHTED_AVG',
    auto_revaluation: true,
    revaluation_frequency: 'MONTHLY',
    cost_variance_threshold: 10.0,
    enable_layer_tracking: true,
    standard_cost_update_method: 'MANUAL'
  });

  const [rules, setRules] = useState<ValuationRule[]>([
    {
      id: '1',
      product_category: 'Electronics',
      warehouse: 'Main Warehouse',
      method: 'FIFO',
      priority: 1,
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      product_category: 'Office Supplies',
      warehouse: 'All Warehouses',
      method: 'WEIGHTED_AVG',
      priority: 2,
      is_active: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    }
  ]);

  const [newRule, setNewRule] = useState({
    product_category: '',
    warehouse: '',
    method: 'WEIGHTED_AVG',
    priority: 1,
    is_active: true
  });

  const valuationMethods = [
    { value: 'WEIGHTED_AVG', label: 'Weighted Average', description: 'Average cost of all units' },
    { value: 'FIFO', label: 'First In, First Out', description: 'First purchased items are sold first' },
    { value: 'LIFO', label: 'Last In, First Out', description: 'Last purchased items are sold first' },
    { value: 'STANDARD', label: 'Standard Cost', description: 'Predetermined standard cost' },
    { value: 'MOVING_AVG', label: 'Moving Average', description: 'Continuously updated average' }
  ];

  const frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' }
  ];

  const updateMethods = [
    { value: 'MANUAL', label: 'Manual Update' },
    { value: 'AUTO_PURCHASE', label: 'Auto from Purchase Orders' },
    { value: 'AUTO_MARKET', label: 'Auto from Market Prices' }
  ];

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // API call to save settings
      console.log('Saving valuation settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    if (newRule.product_category && newRule.warehouse) {
      const rule: ValuationRule = {
        id: Date.now().toString(),
        ...newRule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setRules([...rules, rule]);
      setNewRule({
        product_category: '',
        warehouse: '',
        method: 'WEIGHTED_AVG',
        priority: 1,
        is_active: true
      });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, is_active: !rule.is_active, updated_at: new Date().toISOString() }
        : rule
    ));
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'WEIGHTED_AVG': 'bg-blue-100 text-blue-800',
      'FIFO': 'bg-green-100 text-green-800',
      'LIFO': 'bg-purple-100 text-purple-800',
      'STANDARD': 'bg-orange-100 text-orange-800',
      'MOVING_AVG': 'bg-pink-100 text-pink-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Valuation Configuration</h1>
          <p className="text-gray-600">Configure stock valuation methods and rules</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Valuation Settings
              </CardTitle>
              <CardDescription>Configure default valuation behavior for the entire system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-method">Default Valuation Method</Label>
                  <Select 
                    value={settings.default_method} 
                    onValueChange={(value) => setSettings({...settings, default_method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {valuationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {valuationMethods.find(m => m.value === settings.default_method)?.description}
                  </p>
                </div>

                <div>
                  <Label htmlFor="variance-threshold">Cost Variance Threshold (%)</Label>
                  <Input
                    id="variance-threshold"
                    type="number"
                    value={settings.cost_variance_threshold}
                    onChange={(e) => setSettings({...settings, cost_variance_threshold: parseFloat(e.target.value)})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when cost variance exceeds this percentage
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-revaluation">Automatic Revaluation</Label>
                    <p className="text-sm text-gray-500">Automatically revalue inventory at scheduled intervals</p>
                  </div>
                  <Switch
                    id="auto-revaluation"
                    checked={settings.auto_revaluation}
                    onCheckedChange={(checked) => setSettings({...settings, auto_revaluation: checked})}
                  />
                </div>

                {settings.auto_revaluation && (
                  <div>
                    <Label htmlFor="revaluation-frequency">Revaluation Frequency</Label>
                    <Select 
                      value={settings.revaluation_frequency} 
                      onValueChange={(value) => setSettings({...settings, revaluation_frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="layer-tracking">Enable Layer Tracking</Label>
                    <p className="text-sm text-gray-500">Track individual cost layers for FIFO/LIFO calculations</p>
                  </div>
                  <Switch
                    id="layer-tracking"
                    checked={settings.enable_layer_tracking}
                    onCheckedChange={(checked) => setSettings({...settings, enable_layer_tracking: checked})}
                  />
                </div>

                <div>
                  <Label htmlFor="standard-cost-update">Standard Cost Update Method</Label>
                  <Select 
                    value={settings.standard_cost_update_method} 
                    onValueChange={(value) => setSettings({...settings, standard_cost_update_method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {updateMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valuation Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Valuation Rules</CardTitle>
              <CardDescription>Define specific valuation methods for product categories and warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add New Rule */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Add New Rule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor="new-category">Product Category</Label>
                      <Input
                        id="new-category"
                        value={newRule.product_category}
                        onChange={(e) => setNewRule({...newRule, product_category: e.target.value})}
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-warehouse">Warehouse</Label>
                      <Input
                        id="new-warehouse"
                        value={newRule.warehouse}
                        onChange={(e) => setNewRule({...newRule, warehouse: e.target.value})}
                        placeholder="e.g., Main Warehouse"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-method">Method</Label>
                      <Select 
                        value={newRule.method} 
                        onValueChange={(value) => setNewRule({...newRule, method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {valuationMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddRule} className="w-full">
                        Add Rule
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing Rules */}
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{rule.product_category}</div>
                          <div className="text-sm text-gray-500">{rule.warehouse}</div>
                        </div>
                        <Badge className={getMethodColor(rule.method)}>
                          {valuationMethods.find(m => m.value === rule.method)?.label}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          Priority: {rule.priority}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Valuation Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {valuationMethods.map((method) => (
                <div key={method.value} className="p-3 border rounded-lg">
                  <div className="font-medium">{method.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  Changing valuation methods will affect future calculations. Historical data remains unchanged.
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  Rules are applied in priority order. Higher priority rules override lower priority ones.
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  Layer tracking is required for FIFO and LIFO methods to work accurately.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValuationConfiguration;
