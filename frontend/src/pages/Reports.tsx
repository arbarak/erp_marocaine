import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Reports() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for report categories
  const [reportCategories] = useState([
    {
      id: 1,
      name: 'Rapports Financiers',
      description: 'Bilans, comptes de résultat, flux de trésorerie',
      icon: '💰',
      reportCount: 8,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 2,
      name: 'Rapports de Ventes',
      description: 'Analyses des ventes, clients, commandes',
      icon: '📈',
      reportCount: 6,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 3,
      name: 'Rapports d\'Inventaire',
      description: 'Stock, mouvements, valorisation',
      icon: '📦',
      reportCount: 5,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 4,
      name: 'Rapports d\'Achats',
      description: 'Fournisseurs, commandes, réceptions',
      icon: '🛒',
      reportCount: 4,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 5,
      name: 'Rapports Fiscaux',
      description: 'TVA, déclarations, conformité',
      icon: '📋',
      reportCount: 7,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 6,
      name: 'Rapports Analytiques',
      description: 'KPI, tableaux de bord, tendances',
      icon: '📊',
      reportCount: 9,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ])

  // Mock data for financial reports
  const [financialReports] = useState([
    {
      id: 1,
      name: 'Bilan Comptable',
      description: 'Situation patrimoniale de l\'entreprise',
      type: 'balance_sheet',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Compte de Résultat',
      description: 'Résultat d\'exploitation et financier',
      type: 'income_statement',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Flux de Trésorerie',
      description: 'Mouvements de trésorerie par période',
      type: 'cash_flow',
      frequency: 'weekly',
      lastGenerated: '2025-01-18T00:00:00Z',
      format: 'Excel',
      status: 'ready'
    },
    {
      id: 4,
      name: 'Balance Générale',
      description: 'Balance de tous les comptes',
      type: 'trial_balance',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    }
  ])

  // Mock data for sales reports
  const [salesReports] = useState([
    {
      id: 1,
      name: 'Chiffre d\'Affaires par Période',
      description: 'Évolution du CA mensuel et annuel',
      type: 'revenue_analysis',
      frequency: 'monthly',
      lastGenerated: '2025-01-18T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Top Clients',
      description: 'Classement des meilleurs clients',
      type: 'top_customers',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'Excel',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Analyse des Commandes',
      description: 'Statistiques des commandes par statut',
      type: 'order_analysis',
      frequency: 'weekly',
      lastGenerated: '2025-01-18T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    }
  ])

  // Mock data for tax reports
  const [taxReports] = useState([
    {
      id: 1,
      name: 'Déclaration TVA',
      description: 'Déclaration mensuelle de TVA',
      type: 'vat_declaration',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready',
      dueDate: '2025-01-20T00:00:00Z'
    },
    {
      id: 2,
      name: 'Rapport RAS/TVA',
      description: 'Retenues à la source sur TVA',
      type: 'withholding_tax',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'Excel',
      status: 'ready',
      dueDate: '2025-01-25T00:00:00Z'
    },
    {
      id: 3,
      name: 'Journal des Achats',
      description: 'Journal détaillé des achats avec TVA',
      type: 'purchase_journal',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    },
    {
      id: 4,
      name: 'Journal des Ventes',
      description: 'Journal détaillé des ventes avec TVA',
      type: 'sales_journal',
      frequency: 'monthly',
      lastGenerated: '2025-01-15T00:00:00Z',
      format: 'PDF',
      status: 'ready'
    }
  ])

  // Mock data for recent reports
  const [recentReports] = useState([
    {
      id: 1,
      name: 'Flux de Trésorerie - Semaine 3',
      category: 'Financier',
      generatedAt: '2025-01-18T10:30:00Z',
      generatedBy: 'Ahmed Admin',
      format: 'Excel',
      size: '245 KB',
      downloads: 3
    },
    {
      id: 2,
      name: 'Top Clients - Janvier 2025',
      category: 'Ventes',
      generatedAt: '2025-01-18T09:15:00Z',
      generatedBy: 'Fatima Manager',
      format: 'PDF',
      size: '1.2 MB',
      downloads: 7
    },
    {
      id: 3,
      name: 'Analyse Stock - Produits Critiques',
      category: 'Inventaire',
      generatedAt: '2025-01-17T16:45:00Z',
      generatedBy: 'Mohamed Director',
      format: 'PDF',
      size: '890 KB',
      downloads: 2
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success'
      case 'generating': return 'warning'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt'
      case 'generating': return 'En cours'
      case 'error': return 'Erreur'
      default: return 'Inconnu'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Rapports et Analyses
          </h1>
          <p className="text-muted-foreground">
            Génération et consultation des rapports d'activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="mr-2">📅</span>
            Planifier
          </Button>
          <Button>
            <span className="mr-2">📊</span>
            Nouveau Rapport
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">39</div>
            <p className="text-sm text-muted-foreground">Rapports Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Générés ce Mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Déclarations en Attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Téléchargements Total</p>
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
          variant={activeTab === 'financial' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('financial')}
        >
          Financiers
        </Button>
        <Button
          variant={activeTab === 'sales' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('sales')}
        >
          Ventes
        </Button>
        <Button
          variant={activeTab === 'tax' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tax')}
        >
          Fiscaux
        </Button>
        <Button
          variant={activeTab === 'custom' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('custom')}
        >
          Personnalisés
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Catégories de Rapports</CardTitle>
              <CardDescription>Types de rapports disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={category.color}>
                        {category.reportCount} rapports
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Rapports Récents</CardTitle>
              <CardDescription>Derniers rapports générés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.category} • {formatDateTime(report.generatedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Par {report.generatedBy} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {report.format}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.downloads} téléchargements
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports Financiers</CardTitle>
            <CardDescription>Bilans, comptes de résultat et analyses financières</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {report.frequency === 'monthly' ? 'Mensuel' :
                           report.frequency === 'weekly' ? 'Hebdomadaire' : 'Quotidien'}
                        </Badge>
                        <Badge variant="outline">
                          {report.format}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière génération: {formatDateTime(report.lastGenerated)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Voir</Button>
                    <Button variant="outline" size="sm">Télécharger</Button>
                    <Button size="sm">Générer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sales' && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports de Ventes</CardTitle>
            <CardDescription>Analyses des ventes, clients et performances commerciales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {report.frequency === 'monthly' ? 'Mensuel' :
                           report.frequency === 'weekly' ? 'Hebdomadaire' : 'Quotidien'}
                        </Badge>
                        <Badge variant="outline">
                          {report.format}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière génération: {formatDateTime(report.lastGenerated)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Voir</Button>
                    <Button variant="outline" size="sm">Télécharger</Button>
                    <Button size="sm">Générer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tax' && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports Fiscaux</CardTitle>
            <CardDescription>Déclarations TVA, RAS/TVA et conformité fiscale marocaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taxReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {report.frequency === 'monthly' ? 'Mensuel' :
                           report.frequency === 'weekly' ? 'Hebdomadaire' : 'Quotidien'}
                        </Badge>
                        <Badge variant="outline">
                          {report.format}
                        </Badge>
                        <Badge variant={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        {report.dueDate && (
                          <Badge variant={isOverdue(report.dueDate) ? 'destructive' : 'warning'}>
                            Échéance: {formatDate(report.dueDate)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière génération: {formatDateTime(report.lastGenerated)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Voir</Button>
                    <Button variant="outline" size="sm">Télécharger</Button>
                    <Button size="sm" variant={report.dueDate && isOverdue(report.dueDate) ? 'destructive' : 'default'}>
                      {report.dueDate && isOverdue(report.dueDate) ? 'Urgent' : 'Générer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créateur de Rapports Personnalisés</CardTitle>
              <CardDescription>Créez vos propres rapports avec des critères spécifiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom du Rapport</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="Ex: Analyse Mensuelle des Ventes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type de Rapport</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Rapport Financier</option>
                      <option>Rapport de Ventes</option>
                      <option>Rapport d'Inventaire</option>
                      <option>Rapport d'Achats</option>
                      <option>Rapport Fiscal</option>
                      <option>Rapport Analytique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Période</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Ce mois</option>
                      <option>Mois dernier</option>
                      <option>Ce trimestre</option>
                      <option>Cette année</option>
                      <option>Période personnalisée</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format de Sortie</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                      <option>Word</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Filtres</label>
                    <div className="space-y-2 mt-1">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Inclure les données de toutes les entreprises</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Exclure les transactions annulées</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Inclure les détails par ligne</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Ajouter les graphiques</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fréquence de Génération</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Génération manuelle</option>
                      <option>Quotidien</option>
                      <option>Hebdomadaire</option>
                      <option>Mensuel</option>
                      <option>Trimestriel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email de Notification</label>
                    <input
                      type="email"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="admin@entreprise.ma"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button>
                  <span className="mr-2">📊</span>
                  Créer le Rapport
                </Button>
                <Button variant="outline">
                  <span className="mr-2">👁️</span>
                  Aperçu
                </Button>
                <Button variant="outline">Annuler</Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Custom Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Rapports Personnalisés Sauvegardés</CardTitle>
              <CardDescription>Vos rapports personnalisés créés précédemment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold mb-2">Aucun rapport personnalisé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez votre premier rapport personnalisé pour commencer
                </p>
                <Button>
                  <span className="mr-2">➕</span>
                  Créer un Rapport
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
