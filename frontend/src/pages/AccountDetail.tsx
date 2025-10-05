import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AccountDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [account, setAccount] = useState({
    id: '',
    accountCode: '',
    accountName: '',
    accountType: '',
    parentAccount: '',
    level: 1,
    status: '',
    currency: 'MAD',
    description: '',
    balance: 0,
    debitBalance: 0,
    creditBalance: 0,
    isReconcilable: false,
    allowJournalEntries: true,
    taxConfiguration: {
      isTaxAccount: false,
      taxRate: 0,
      taxType: ''
    },
    bankDetails: {
      isBank: false,
      bankName: '',
      accountNumber: '',
      rib: '',
      swift: ''
    },
    notes: '',
    recentTransactions: [] as Array<{
      id: string
      date: string
      reference: string
      description: string
      debit: number
      credit: number
      balance: number
    }>,
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  // Load account data on component mount
  useEffect(() => {
    const loadAccount = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load account data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the account
        const mockAccount = {
          id: id || '1',
          accountCode: '5161001',
          accountName: 'Caisse Centrale',
          accountType: 'financial',
          parentAccount: '5',
          level: 3,
          status: 'active',
          currency: 'MAD',
          description: 'Compte de caisse principal pour les opérations courantes en espèces',
          balance: 125000,
          debitBalance: 125000,
          creditBalance: 0,
          isReconcilable: true,
          allowJournalEntries: true,
          taxConfiguration: {
            isTaxAccount: false,
            taxRate: 0,
            taxType: ''
          },
          bankDetails: {
            isBank: false,
            bankName: '',
            accountNumber: '',
            rib: '',
            swift: ''
          },
          notes: 'Compte de caisse géré par le service comptabilité. Contrôle quotidien obligatoire.',
          recentTransactions: [
            {
              id: '1',
              date: '2025-01-18',
              reference: 'JE-2025-001',
              description: 'Vente au comptant - Facture INV-2025-001',
              debit: 15000,
              credit: 0,
              balance: 125000
            },
            {
              id: '2',
              date: '2025-01-17',
              reference: 'JE-2025-002',
              description: 'Achat fournitures bureau',
              debit: 0,
              credit: 2500,
              balance: 110000
            },
            {
              id: '3',
              date: '2025-01-16',
              reference: 'JE-2025-003',
              description: 'Encaissement client - Facture INV-2025-002',
              debit: 8500,
              credit: 0,
              balance: 112500
            }
          ],
          createdAt: '2025-01-10T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setAccount(mockAccount)
      } catch (err) {
        setError('Erreur lors du chargement du compte')
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [id])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'asset': return 'Actif'
      case 'liability': return 'Passif'
      case 'equity': return 'Capitaux Propres'
      case 'revenue': return 'Produits'
      case 'expense': return 'Charges'
      case 'financial': return 'Financier'
      case 'special': return 'Comptes Spéciaux'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'closed': return 'Fermé'
      case 'suspended': return 'Suspendu'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case 'tva_collectee': return 'TVA Collectée'
      case 'tva_deductible': return 'TVA Déductible'
      case 'ir': return 'Impôt sur le Revenu'
      case 'is': return 'Impôt sur les Sociétés'
      case 'taxe_professionnelle': return 'Taxe Professionnelle'
      case 'other': return 'Autre'
      default: return type
    }
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600'
    if (balance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du compte...
              </h2>
              <p className="text-muted-foreground">
                Veuillez patienter pendant le chargement des données.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/accounting')}>
                Retour à la Comptabilité
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {account.accountCode} - {account.accountName}
          </h1>
          <p className="text-muted-foreground">
            Compte comptable • {getTypeLabel(account.accountType)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting')}>
            Retour à la Comptabilité
          </Button>
          <Button onClick={() => navigate(`/accounting/accounts/edit/${account.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code Compte</label>
                  <p className="text-sm font-mono">{account.accountCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getTypeLabel(account.accountType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Niveau</label>
                  <p className="text-sm">{account.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Devise</label>
                  <p className="text-sm">{account.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Solde Débiteur</label>
                  <p className="text-sm font-medium text-green-600">{account.debitBalance.toLocaleString()} MAD</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Solde Créditeur</label>
                  <p className="text-sm font-medium text-red-600">{account.creditBalance.toLocaleString()} MAD</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(account.status)}>
                  {getStatusLabel(account.status)}
                </Badge>
                {account.isReconcilable && (
                  <Badge variant="outline">Rapprochable</Badge>
                )}
                {account.allowJournalEntries && (
                  <Badge variant="outline">Écritures autorisées</Badge>
                )}
              </div>
              {account.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{account.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Configuration */}
          {account.taxConfiguration.isTaxAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration Fiscale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type de Taxe</label>
                    <p className="text-sm">{getTaxTypeLabel(account.taxConfiguration.taxType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Taux de Taxe</label>
                    <p className="text-sm">{account.taxConfiguration.taxRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details */}
          {account.bankDetails.isBank && (
            <Card>
              <CardHeader>
                <CardTitle>Détails Bancaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Banque</label>
                    <p className="text-sm">{account.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Numéro de Compte</label>
                    <p className="text-sm font-mono">{account.bankDetails.accountNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RIB</label>
                    <p className="text-sm font-mono">{account.bankDetails.rib}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Code SWIFT</label>
                    <p className="text-sm font-mono">{account.bankDetails.swift}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Mouvements Récents</CardTitle>
              <CardDescription>
                Dernières écritures comptables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {account.recentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{transaction.reference}</h4>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Débit</label>
                        <p className="font-medium text-green-600">
                          {transaction.debit > 0 ? `${transaction.debit.toLocaleString()} MAD` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Crédit</label>
                        <p className="font-medium text-red-600">
                          {transaction.credit > 0 ? `${transaction.credit.toLocaleString()} MAD` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Solde</label>
                        <p className={`font-medium ${getBalanceColor(transaction.balance)}`}>
                          {transaction.balance.toLocaleString()} MAD
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {account.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{account.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Solde du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getBalanceColor(account.balance)}`}>
                  {account.balance.toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Débit</span>
                  <span className="text-sm font-medium text-green-600">{account.debitBalance.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Crédit</span>
                  <span className="text-sm font-medium text-red-600">{account.creditBalance.toLocaleString()} MAD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Solde Net</span>
                    <span className={`text-sm font-bold ${getBalanceColor(account.balance)}`}>
                      {account.balance.toLocaleString()} MAD
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(account.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(account.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">{getTypeLabel(account.accountType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Niveau</span>
                  <span className="text-sm font-medium">{account.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Devise</span>
                  <span className="text-sm font-medium">{account.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate(`/accounting/journal/create?account=${account.id}`)}>
                ✏️ Nouvelle Écriture
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/accounting/accounts/reconcile/${account.id}`)}>
                🔄 Rapprochement
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/accounting/accounts/report/${account.id}`)}>
                📊 Grand Livre
              </Button>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                🖨️ Imprimer
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé le</span>
                <span className="text-sm">{new Date(account.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <span className="text-sm">{new Date(account.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="text-sm">{account.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
