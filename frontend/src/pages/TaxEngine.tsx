import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TaxEngine() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for tax rules
  const [taxRules] = useState([
    {
      id: 1,
      name: 'TVA Standard Maroc',
      code: 'MA_VAT_20',
      rate: 20.0,
      type: 'VAT',
      jurisdiction: 'Maroc',
      applicableFrom: '2025-01-01',
      applicableTo: null,
      conditions: ['product_type != "essential"', 'customer_type != "export"'],
      isActive: true,
      priority: 1
    },
    {
      id: 2,
      name: 'TVA Réduite Produits Essentiels',
      code: 'MA_VAT_7',
      rate: 7.0,
      type: 'VAT',
      jurisdiction: 'Maroc',
      applicableFrom: '2025-01-01',
      applicableTo: null,
      conditions: ['product_category == "essential"', 'product_type == "food"'],
      isActive: true,
      priority: 2
    },
    {
      id: 3,
      name: 'RAS/TVA Prestataires',
      code: 'MA_WITHHOLDING_10',
      rate: 10.0,
      type: 'WITHHOLDING',
      jurisdiction: 'Maroc',
      applicableFrom: '2025-01-01',
      applicableTo: null,
      conditions: ['supplier_type == "service_provider"', 'amount > 1000'],
      isActive: true,
      priority: 3
    },
    {
      id: 4,
      name: 'Exonération Export',
      code: 'MA_EXPORT_0',
      rate: 0.0,
      type: 'VAT',
      jurisdiction: 'Export',
      applicableFrom: '2025-01-01',
      applicableTo: null,
      conditions: ['customer_country != "MA"', 'transaction_type == "export"'],
      isActive: true,
      priority: 4
    }
  ])

  // Mock data for tax calculations
  const [taxCalculations] = useState([
    {
      id: 1,
      documentType: 'Invoice',
      documentNumber: 'FAC-2025-001',
      customerName: 'TechnoMaroc SARL',
      baseAmount: 10000,
      taxAmount: 2000,
      totalAmount: 12000,
      appliedRules: [
        { ruleCode: 'MA_VAT_20', rate: 20.0, baseAmount: 10000, taxAmount: 2000 }
      ],
      calculatedAt: '2025-01-18T10:30:00Z',
      status: 'calculated'
    },
    {
      id: 2,
      documentType: 'Purchase Order',
      documentNumber: 'BC-2025-001',
      customerName: 'Atlas Distribution',
      baseAmount: 5000,
      taxAmount: 850,
      totalAmount: 5850,
      appliedRules: [
        { ruleCode: 'MA_VAT_14', rate: 14.0, baseAmount: 5000, taxAmount: 700 },
        { ruleCode: 'MA_WITHHOLDING_10', rate: 10.0, baseAmount: 1500, taxAmount: 150 }
      ],
      calculatedAt: '2025-01-18T09:15:00Z',
      status: 'calculated'
    },
    {
      id: 3,
      documentType: 'Quote',
      documentNumber: 'DEV-2025-001',
      customerName: 'Société Export SA',
      baseAmount: 15000,
      taxAmount: 0,
      totalAmount: 15000,
      appliedRules: [
        { ruleCode: 'MA_EXPORT_0', rate: 0.0, baseAmount: 15000, taxAmount: 0 }
      ],
      calculatedAt: '2025-01-17T16:45:00Z',
      status: 'calculated'
    }
  ])

  // Mock data for tax exemptions
  const [taxExemptions] = useState([
    {
      id: 1,
      entityType: 'Customer',
      entityName: 'ONG Humanitaire Maroc',
      entityCode: 'CUST-001',
      exemptionType: 'VAT',
      exemptionRate: 100,
      reason: 'Organisation à but non lucratif',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      certificateNumber: 'EX-2025-001',
      isActive: true
    },
    {
      id: 2,
      entityType: 'Product',
      entityName: 'Médicaments Essentiels',
      entityCode: 'PROD-MED-001',
      exemptionType: 'VAT',
      exemptionRate: 100,
      reason: 'Produits pharmaceutiques essentiels',
      validFrom: '2025-01-01',
      validTo: null,
      certificateNumber: 'EX-PERM-002',
      isActive: true
    },
    {
      id: 3,
      entityType: 'Transaction',
      entityName: 'Ventes Export Zone Franche',
      entityCode: 'TRANS-EXPORT',
      exemptionType: 'VAT',
      exemptionRate: 100,
      reason: 'Exportation vers zone franche',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      certificateNumber: 'EX-ZF-003',
      isActive: true
    }
  ])

  // Mock data for tax audit trail
  const [taxAuditTrail] = useState([
    {
      id: 1,
      action: 'Tax Calculation',
      documentType: 'Invoice',
      documentNumber: 'FAC-2025-001',
      oldTaxAmount: 0,
      newTaxAmount: 2000,
      reason: 'Initial calculation',
      performedBy: 'Ahmed Admin',
      performedAt: '2025-01-18T10:30:00Z',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      action: 'Tax Rule Update',
      documentType: 'Tax Rule',
      documentNumber: 'MA_VAT_20',
      oldTaxAmount: null,
      newTaxAmount: null,
      reason: 'Rate change from 19% to 20%',
      performedBy: 'Fatima Manager',
      performedAt: '2025-01-15T14:20:00Z',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      action: 'Exemption Applied',
      documentType: 'Quote',
      documentNumber: 'DEV-2025-001',
      oldTaxAmount: 3000,
      newTaxAmount: 0,
      reason: 'Export exemption applied',
      performedBy: 'Mohamed Director',
      performedAt: '2025-01-17T16:45:00Z',
      ipAddress: '192.168.2.100'
    }
  ])

  const getTaxTypeColor = (type: string) => {
    switch (type) {
      case 'VAT': return 'bg-blue-100 text-blue-800'
      case 'WITHHOLDING': return 'bg-orange-100 text-orange-800'
      case 'EXEMPTION': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculated': return 'success'
      case 'pending': return 'warning'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'calculated': return 'Calculé'
      case 'pending': return 'En attente'
      case 'error': return 'Erreur'
      default: return 'Inconnu'
    }
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + ' MAD'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Moteur Fiscal
          </h1>
          <p className="text-muted-foreground">
            Calculs automatiques et gestion avancée des taxes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">🔄</span>
            Recalculer Tout
          </Button>
          <Button>
            <span className="mr-2">➕</span>
            Nouvelle Règle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">Règles Fiscales Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Calculs ce Mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Exonérations Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-sm text-muted-foreground">Précision Calculs</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('rules')}
        >
          Règles Fiscales
        </Button>
        <Button
          variant={activeTab === 'calculations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('calculations')}
        >
          Calculs
        </Button>
        <Button
          variant={activeTab === 'exemptions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('exemptions')}
        >
          Exonérations
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('audit')}
        >
          Audit
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tax Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Calculs Fiscaux Récents</CardTitle>
              <CardDescription>Derniers calculs de taxes effectués</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxCalculations.slice(0, 5).map((calc) => (
                  <div key={calc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">🧮</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{calc.documentNumber}</p>
                        <p className="text-xs text-muted-foreground">{calc.documentType} • {calc.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          Base: {formatAmount(calc.baseAmount)} • Taxe: {formatAmount(calc.taxAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatAmount(calc.totalAmount)}
                      </div>
                      <Badge variant={getStatusColor(calc.status)} className="text-xs">
                        {getStatusText(calc.status)}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(calc.calculatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Tax Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Règles Fiscales Actives</CardTitle>
              <CardDescription>Règles de calcul en vigueur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxRules.filter(rule => rule.isActive).map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">⚖️</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.code} • {rule.jurisdiction}</p>
                        <Badge className={getTaxTypeColor(rule.type)} size="sm">
                          {rule.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {rule.rate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Priorité: {rule.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <CardTitle>Règles Fiscales</CardTitle>
            <CardDescription>Configuration des règles de calcul des taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">⚖️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {rule.code}</p>
                        <p className="text-sm text-muted-foreground">Juridiction: {rule.jurisdiction}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Tester</Button>
                      <Button variant="outline" size="sm" className={rule.isActive ? 'text-red-600' : 'text-green-600'}>
                        {rule.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium mb-3">Paramètres de la Règle</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Taux:</span>
                          <span className="font-medium">{rule.rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge className={getTaxTypeColor(rule.type)}>
                            {rule.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Priorité:</span>
                          <span className="font-medium">{rule.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Applicable depuis:</span>
                          <span className="font-medium">{formatDate(rule.applicableFrom)}</span>
                        </div>
                        {rule.applicableTo && (
                          <div className="flex justify-between">
                            <span>Applicable jusqu'à:</span>
                            <span className="font-medium">{formatDate(rule.applicableTo)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-3">Conditions d'Application</p>
                      <div className="space-y-2">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                            {condition}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={getTaxTypeColor(rule.type)}>
                      {rule.type}
                    </Badge>
                    <Badge variant={rule.isActive ? 'success' : 'destructive'}>
                      {rule.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="outline">
                      Priorité {rule.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'calculations' && (
        <Card>
          <CardHeader>
            <CardTitle>Calculs Fiscaux</CardTitle>
            <CardDescription>Historique des calculs de taxes effectués</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxCalculations.map((calc) => (
                <div key={calc.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🧮</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{calc.documentNumber}</h3>
                        <p className="text-sm text-muted-foreground">{calc.documentType} • {calc.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Calculé le: {formatDateTime(calc.calculatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Recalculer</Button>
                      <Button variant="outline" size="sm">Détails</Button>
                      <Button variant="outline" size="sm">Exporter</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium mb-3">Montants</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Montant de Base:</span>
                          <span className="font-medium">{formatAmount(calc.baseAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant des Taxes:</span>
                          <span className="font-medium">{formatAmount(calc.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Montant Total:</span>
                          <span className="font-medium text-lg">{formatAmount(calc.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-3">Règles Appliquées</p>
                      <div className="space-y-2">
                        {calc.appliedRules.map((appliedRule, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{appliedRule.ruleCode}</span>
                              <span className="text-sm">{appliedRule.rate}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Base: {formatAmount(appliedRule.baseAmount)}</span>
                              <span>Taxe: {formatAmount(appliedRule.taxAmount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={getStatusColor(calc.status)}>
                      {getStatusText(calc.status)}
                    </Badge>
                    <Badge variant="outline">
                      {calc.appliedRules.length} règle(s) appliquée(s)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'exemptions' && (
        <Card>
          <CardHeader>
            <CardTitle>Exonérations Fiscales</CardTitle>
            <CardDescription>Gestion des exonérations et exemptions de taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxExemptions.map((exemption) => (
                <div key={exemption.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">🛡️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{exemption.entityName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exemption.entityType} • Code: {exemption.entityCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Certificat: {exemption.certificateNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Renouveler</Button>
                      <Button variant="outline" size="sm" className={exemption.isActive ? 'text-red-600' : 'text-green-600'}>
                        {exemption.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium mb-3">Détails de l'Exonération</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type d'Exonération:</span>
                          <Badge className={getTaxTypeColor(exemption.exemptionType)}>
                            {exemption.exemptionType}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux d'Exonération:</span>
                          <span className="font-medium">{exemption.exemptionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valide depuis:</span>
                          <span className="font-medium">{formatDate(exemption.validFrom)}</span>
                        </div>
                        {exemption.validTo && (
                          <div className="flex justify-between">
                            <span>Valide jusqu'à:</span>
                            <span className="font-medium">{formatDate(exemption.validTo)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-3">Justification</p>
                      <div className="p-3 bg-muted rounded text-sm">
                        {exemption.reason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={getTaxTypeColor(exemption.exemptionType)}>
                      {exemption.exemptionType}
                    </Badge>
                    <Badge variant={exemption.isActive ? 'success' : 'destructive'}>
                      {exemption.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="outline">
                      {exemption.exemptionRate}% d'exonération
                    </Badge>
                    {exemption.validTo && new Date(exemption.validTo) < new Date() && (
                      <Badge variant="destructive">
                        Expiré
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal d'Audit Fiscal</CardTitle>
            <CardDescription>Traçabilité des modifications fiscales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxAuditTrail.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{audit.action}</h3>
                      <p className="text-sm text-muted-foreground">
                        {audit.documentType}: {audit.documentNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Raison: {audit.reason}
                      </p>
                      {audit.oldTaxAmount !== null && audit.newTaxAmount !== null && (
                        <p className="text-sm text-muted-foreground">
                          Montant: {formatAmount(audit.oldTaxAmount)} → {formatAmount(audit.newTaxAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {audit.performedBy}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(audit.performedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IP: {audit.ipAddress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Règle Fiscale</CardTitle>
          <CardDescription>Créer une nouvelle règle de calcul fiscal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nom de la Règle</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: TVA Réduite Services"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Code de la Règle</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: MA_VAT_14"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type de Taxe</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="VAT">TVA</option>
                <option value="WITHHOLDING">Retenue à la Source</option>
                <option value="EXEMPTION">Exonération</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Taux (%)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="14.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Juridiction</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Maroc"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priorité</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date d'Application</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de Fin (optionnel)</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Conditions d'Application</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              placeholder="Ex: product_category == 'services' AND customer_type != 'export'"
            />
          </div>

          <div className="mt-6 flex gap-2">
            <Button>Créer la Règle</Button>
            <Button variant="outline">Tester la Règle</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
