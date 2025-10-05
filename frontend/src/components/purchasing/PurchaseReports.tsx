import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Download, Calendar, TrendingUp, 
  DollarSign, Users, Package, AlertCircle,
  CheckCircle, Clock, Target, BarChart3
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'compliance' | 'performance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  last_generated: string;
  status: 'active' | 'inactive';
}

interface ReportData {
  id: string;
  title: string;
  generated_at: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_orders: number;
    total_value: number;
    avg_order_value: number;
    top_supplier: string;
    compliance_score: number;
  };
  sections: Array<{
    title: string;
    type: 'table' | 'chart' | 'metrics';
    data: any;
  }>;
}

const PurchaseReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportPeriod, setReportPeriod] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Monthly Purchase Summary',
      description: 'Comprehensive monthly overview of all purchase activities',
      type: 'summary',
      frequency: 'monthly',
      last_generated: '2024-09-30',
      status: 'active'
    },
    {
      id: '2',
      name: 'Supplier Performance Report',
      description: 'Detailed analysis of supplier performance metrics',
      type: 'performance',
      frequency: 'quarterly',
      last_generated: '2024-09-15',
      status: 'active'
    },
    {
      id: '3',
      name: 'Compliance Audit Report',
      description: 'Compliance status and audit findings',
      type: 'compliance',
      frequency: 'monthly',
      last_generated: '2024-09-28',
      status: 'active'
    },
    {
      id: '4',
      name: 'Cost Analysis Report',
      description: 'Detailed cost breakdown and savings analysis',
      type: 'detailed',
      frequency: 'weekly',
      last_generated: '2024-10-01',
      status: 'active'
    }
  ]);

  const [generatedReports, setGeneratedReports] = useState<ReportData[]>([
    {
      id: '1',
      title: 'Monthly Purchase Summary - September 2024',
      generated_at: '2024-10-01T09:00:00Z',
      period: {
        start_date: '2024-09-01',
        end_date: '2024-09-30'
      },
      summary: {
        total_orders: 342,
        total_value: 785600.00,
        avg_order_value: 2297.66,
        top_supplier: 'TechnoMaroc SARL',
        compliance_score: 94.5
      },
      sections: []
    },
    {
      id: '2',
      title: 'Supplier Performance Report - Q3 2024',
      generated_at: '2024-10-01T10:30:00Z',
      period: {
        start_date: '2024-07-01',
        end_date: '2024-09-30'
      },
      summary: {
        total_orders: 1024,
        total_value: 2347890.00,
        avg_order_value: 2292.67,
        top_supplier: 'Atlas Distribution',
        compliance_score: 91.2
      },
      sections: []
    }
  ]);

  const generateReport = async () => {
    if (!selectedTemplate) {
      alert('Please select a report template');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `${template?.name} - ${new Date().toLocaleDateString()}`,
        generated_at: new Date().toISOString(),
        period: reportPeriod,
        summary: {
          total_orders: Math.floor(Math.random() * 500) + 100,
          total_value: Math.floor(Math.random() * 1000000) + 500000,
          avg_order_value: Math.floor(Math.random() * 3000) + 1000,
          top_supplier: 'TechnoMaroc SARL',
          compliance_score: Math.floor(Math.random() * 20) + 80
        },
        sections: []
      };

      setGeneratedReports(prev => [newReport, ...prev]);
      setActiveTab('generated');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    // Mock download - replace with actual implementation
    console.log(`Downloading report ${reportId} as ${format}`);
    alert(`Report download started (${format.toUpperCase()})`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'bg-blue-100 text-blue-800';
      case 'detailed': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Clock className="h-4 w-4" />;
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <BarChart3 className="h-4 w-4" />;
      case 'quarterly': return <TrendingUp className="h-4 w-4" />;
      case 'yearly': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Reports</h1>
          <p className="text-gray-600">Generate and manage purchase reports and analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
              <CardDescription>Pre-configured report templates for different purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getTemplateTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          {getFrequencyIcon(template.frequency)}
                          {template.frequency}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last generated: {template.last_generated}</span>
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create a custom report with specific parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Report Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={reportPeriod.start_date}
                      onChange={(e) => setReportPeriod(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={reportPeriod.end_date}
                      onChange={(e) => setReportPeriod(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTemplate && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Selected Template</h4>
                      {(() => {
                        const template = reportTemplates.find(t => t.id === selectedTemplate);
                        return template ? (
                          <div>
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getTemplateTypeColor(template.type)}>
                                {template.type}
                              </Badge>
                              <span className="text-xs text-gray-500">{template.frequency}</span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <Button 
                    onClick={generateReport} 
                    disabled={loading || !selectedTemplate}
                    className="w-full"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Previously generated reports available for download</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <p className="text-sm text-gray-600">
                            Generated on {new Date(report.generated_at).toLocaleDateString()} at{' '}
                            {new Date(report.generated_at).toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Period: {report.period.start_date} to {report.period.end_date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'pdf')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'excel')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Excel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'csv')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold">{report.summary.total_orders.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Total Orders</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold">{formatCurrency(report.summary.total_value)}</div>
                          <div className="text-xs text-gray-600">Total Value</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="text-2xl font-bold">{formatCurrency(report.summary.avg_order_value)}</div>
                          <div className="text-xs text-gray-600">Avg Order</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="text-lg font-bold">{report.summary.top_supplier}</div>
                          <div className="text-xs text-gray-600">Top Supplier</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold">{report.summary.compliance_score}%</div>
                          <div className="text-xs text-gray-600">Compliance</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {generatedReports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated yet</h3>
                    <p className="text-gray-600 mb-4">Generate your first report to see it here</p>
                    <Button onClick={() => setActiveTab('generate')}>
                      Generate Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseReports;
