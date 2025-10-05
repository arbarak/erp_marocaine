import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Accounting() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for chart of accounts (PCGM - Plan Comptable Général Marocain)
  const [chartOfAccounts] = useState([
    {
      id: 1,
      code: '1110',
      name: 'Capital social ou personnel',
      type: 'Capitaux propres',
      balance: 1000000,
      level: 1
    },
    {
      id: 2,
      code: '2110',
      name: 'Terrains',
      type: 'Immobilisations corporelles',
      balance: 500000,
      level: 1
    },
    {
      id: 3,
      code: '3110',
      name: 'Marchandises',
      type: 'Stocks',
      balance: 660000,
      level: 1
    },
    {
      id: 4,
      code: '4110',
      name: 'Fournisseurs',
      type: 'Dettes',
      balance: -132000,
      level: 1
    },
    {
      id: 5,
      code: '4411',
      name: 'Clients',
      type: 'Créances',
      balance: 185000,
      level: 1
    },
    {
      id: 6,
      code: '5110',
      name: 'Banques',
      type: 'Trésorerie',
      balance: 250000,
      level: 1
    },
    {
      id: 7,
      code: '7110',
      name: 'Ventes de marchandises',
      type: 'Produits',
      balance: -1234567,
      level: 1
    }
  ])

  // Mock data for journal entries
  const [journalEntries] = useState([
    {
      id: 1,
      number: 'JE-2025-001',
      date: '2025-01-18',
      reference: 'FAC-2025-001',
      description: 'Vente facture FAC-2025-001',
      totalDebit: 102000,
      totalCredit: 102000,
      status: 'posted',
      lines: [
        { account: '4411', accountName: 'Clients', debit: 102000, credit: 0 },
        { account: '7110', accountName: 'Ventes de marchandises', debit: 0, credit: 85000 },
        { account: '4455', accountName: 'TVA facturée', debit: 0, credit: 17000 }
      ]
    },
    {
      id: 2,
      number: 'JE-2025-002',
      date: '2025-01-17',
      reference: 'PO-2025-001',
      description: 'Achat commande PO-2025-001',
      totalDebit: 510000,
      totalCredit: 510000,
      status: 'posted',
      lines: [
        { account: '3110', accountName: 'Marchandises', debit: 425000, credit: 0 },
        { account: '3456', accountName: 'TVA récupérable', debit: 85000, credit: 0 },
        { account: '4110', accountName: 'Fournisseurs', debit: 0, credit: 510000 }
      ]
    },
    {
      id: 3,
      number: 'JE-2025-003',
      date: '2025-01-16',
      reference: 'BANK-001',
      description: 'Paiement fournisseur par virement',
      totalDebit: 150000,
      totalCredit: 150000,
      status: 'draft',
      lines: [
        { account: '4110', accountName: 'Fournisseurs', debit: 150000, credit: 0 },
        { account: '5110', accountName: 'Banques', debit: 0, credit: 150000 }
      ]
    }
  ])

  // Mock data for trial balance
  const [trialBalance] = useState([
    { account: '1110', accountName: 'Capital social', debit: 0, credit: 1000000 },
    { account: '2110', accountName: 'Terrains', debit: 500000, credit: 0 },
    { account: '3110', accountName: 'Marchandises', debit: 660000, credit: 0 },
    { account: '4110', accountName: 'Fournisseurs', debit: 0, credit: 132000 },
    { account: '4411', accountName: 'Clients', debit: 185000, credit: 0 },
    { account: '5110', accountName: 'Banques', debit: 250000, credit: 0 },
    { account: '7110', accountName: 'Ventes de marchandises', debit: 0, credit: 1234567 }
  ])

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Capitaux propres': return 'bg-blue-100 text-blue-800'
      case 'Immobilisations corporelles': return 'bg-green-100 text-green-800'
      case 'Stocks': return 'bg-yellow-100 text-yellow-800'
      case 'Dettes': return 'bg-red-100 text-red-800'
      case 'Créances': return 'bg-purple-100 text-purple-800'
      case 'Trésorerie': return 'bg-indigo-100 text-indigo-800'
      case 'Produits': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntryStatusColor = (status: string) => {
    return status === 'posted' ? 'success' : 'warning'
  }

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString() + ' MAD'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Comptabilité
          </h1>
          <p className="text-muted-foreground">
            Plan comptable PCGM, écritures et états financiers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting/accounts/create')}>
            <span className="mr-2">💰</span>
            Nouveau Compte
          </Button>
          <Button variant="outline">
            <span className="mr-2">📊</span>
            Balance
          </Button>
          <Button onClick={() => navigate('/accounting/journal/create')}>
            <span className="mr-2">➕</span>
            Écriture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,000,000 MAD</div>
            <p className="text-sm text-muted-foreground">Capital Social</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,595,000 MAD</div>
            <p className="text-sm text-muted-foreground">Total Actif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,234,567 MAD</div>
            <p className="text-sm text-muted-foreground">CA Année</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">53,000 MAD</div>
            <p className="text-sm text-muted-foreground">Solde Clients</p>
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
          variant={activeTab === 'chart' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('chart')}
        >
          Plan Comptable
        </Button>
        <Button
          variant={activeTab === 'journal' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('journal')}
        >
          Journal
        </Button>
        <Button
          variant={activeTab === 'balance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('balance')}
        >
          Balance
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Écritures Récentes</CardTitle>
              <CardDescription>Dernières écritures comptables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {journalEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">📝</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.number}</p>
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatAmount(entry.totalDebit)}</div>
                      <Badge variant={getEntryStatusColor(entry.status)}>
                        {entry.status === 'posted' ? 'Validée' : 'Brouillon'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Balances Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Soldes Principaux</CardTitle>
              <CardDescription>Soldes des comptes principaux</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chartOfAccounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm">💰</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{account.code} - {account.name}</p>
                        <Badge className={`text-xs ${getAccountTypeColor(account.type)}`}>
                          {account.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(account.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Comptable PCGM</CardTitle>
            <CardDescription>Plan Comptable Général Marocain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartOfAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.code} - {account.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getAccountTypeColor(account.type)}>
                          {account.type}
                        </Badge>
                        <Badge variant="outline">
                          Niveau {account.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatAmount(account.balance)}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounting/accounts/detail/${account.id}`)}>
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/accounting/accounts/edit/${account.id}`)}>
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'journal' && (
        <Card>
          <CardHeader>
            <CardTitle>Journal des Écritures</CardTitle>
            <CardDescription>Toutes les écritures comptables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xl">📝</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.number}</h3>
                        <p className="text-sm text-muted-foreground">Date: {entry.date} | Réf: {entry.reference}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatAmount(entry.totalDebit)}</div>
                      <Badge variant={getEntryStatusColor(entry.status)}>
                        {entry.status === 'posted' ? 'Validée' : 'Brouillon'}
                      </Badge>
                    </div>
                  </div>

                  {/* Journal Lines */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium mb-2">
                      <div>Compte</div>
                      <div>Libellé</div>
                      <div className="text-right">Débit</div>
                      <div className="text-right">Crédit</div>
                    </div>
                    {entry.lines.map((line, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 text-sm py-1">
                        <div>{line.account}</div>
                        <div>{line.accountName}</div>
                        <div className="text-right">{line.debit > 0 ? formatAmount(line.debit) : '-'}</div>
                        <div className="text-right">{line.credit > 0 ? formatAmount(line.credit) : '-'}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounting/journal/detail/${entry.id}`)}>
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounting/journal/edit/${entry.id}`)}>
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm">Dupliquer</Button>
                    <Button variant="outline" size="sm">Imprimer</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'balance' && (
        <Card>
          <CardHeader>
            <CardTitle>Balance Générale</CardTitle>
            <CardDescription>Balance des comptes au {new Date().toLocaleDateString('fr-FR')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Compte</th>
                    <th className="text-left p-2">Libellé</th>
                    <th className="text-right p-2">Débit</th>
                    <th className="text-right p-2">Crédit</th>
                    <th className="text-right p-2">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.map((account, index) => {
                    const balance = account.debit - account.credit
                    return (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono">{account.account}</td>
                        <td className="p-2">{account.accountName}</td>
                        <td className="p-2 text-right">{account.debit > 0 ? formatAmount(account.debit) : '-'}</td>
                        <td className="p-2 text-right">{account.credit > 0 ? formatAmount(account.credit) : '-'}</td>
                        <td className={`p-2 text-right font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(balance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="p-2" colSpan={2}>TOTAUX</td>
                    <td className="p-2 text-right">
                      {formatAmount(trialBalance.reduce((sum, acc) => sum + acc.debit, 0))}
                    </td>
                    <td className="p-2 text-right">
                      {formatAmount(trialBalance.reduce((sum, acc) => sum + acc.credit, 0))}
                    </td>
                    <td className="p-2 text-right">
                      {formatAmount(trialBalance.reduce((sum, acc) => sum + (acc.debit - acc.credit), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Écriture Comptable</CardTitle>
          <CardDescription>Saisir une écriture au journal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Numéro d'Écriture</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="JE-2025-004"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded-md"
                defaultValue="2025-01-18"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Référence</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Ex: FAC-2025-001"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Description de l'écriture..."
            />
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium mb-3">Lignes d'Écriture</h4>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Compte</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>Sélectionner...</option>
                  {chartOfAccounts.map(account => (
                    <option key={account.id} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Libellé</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Libellé de la ligne"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Débit (MAD)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crédit (MAD)</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  Ajouter Ligne
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Enregistrer l'Écriture</Button>
            <Button variant="outline">Enregistrer comme Brouillon</Button>
            <Button variant="outline">Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
