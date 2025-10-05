import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function JournalEntryDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [entry, setEntry] = useState({
    id: '',
    entryNumber: '',
    entryDate: '',
    period: '',
    reference: '',
    description: '',
    status: '',
    journal: '',
    currency: 'MAD',
    exchangeRate: 1,
    notes: '',
    lines: [] as Array<{
      id: string
      accountId: string
      accountCode: string
      accountName: string
      description: string
      debit: number
      credit: number
      reference: string
    }>,
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: false,
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

  // Load journal entry data on component mount
  useEffect(() => {
    const loadJournalEntry = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load journal entry data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the journal entry
        const mockEntry = {
          id: id || '1',
          entryNumber: 'JE-2025-001',
          entryDate: '2025-01-18',
          period: '2025-01',
          reference: 'INV-2025-001',
          description: 'Vente de marchandises - Facture INV-2025-001',
          status: 'posted',
          journal: 'sales',
          currency: 'MAD',
          exchangeRate: 1,
          notes: 'Écriture de vente avec TVA 20%',
          lines: [
            {
              id: '1',
              accountId: '4',
              accountCode: '4111',
              accountName: 'Fournisseurs',
              description: 'Client ABC - Facture INV-2025-001',
              debit: 12000,
              credit: 0,
              reference: 'INV-2025-001'
            },
            {
              id: '2',
              accountId: '7',
              accountCode: '7111',
              accountName: 'Ventes de marchandises',
              description: 'Vente marchandises HT',
              debit: 0,
              credit: 10000,
              reference: 'INV-2025-001'
            },
            {
              id: '3',
              accountId: '8',
              accountCode: '4455',
              accountName: 'TVA Collectée',
              description: 'TVA 20% sur vente',
              debit: 0,
              credit: 2000,
              reference: 'INV-2025-001'
            }
          ],
          totalDebit: 12000,
          totalCredit: 12000,
          isBalanced: true,
          createdAt: '2025-01-18T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setEntry(mockEntry)
      } catch (err) {
        setError('Erreur lors du chargement de l\'écriture comptable')
      } finally {
        setLoading(false)
      }
    }

    loadJournalEntry()
  }, [id])

  const getJournalLabel = (journal: string) => {
    switch (journal) {
      case 'general': return 'Journal Général'
      case 'sales': return 'Journal des Ventes'
      case 'purchases': return 'Journal des Achats'
      case 'cash': return 'Journal de Caisse'
      case 'bank': return 'Journal de Banque'
      case 'operations': return 'Journal des Opérations Diverses'
      default: return journal
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'pending': return 'En attente'
      case 'approved': return 'Approuvé'
      case 'posted': return 'Comptabilisé'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'posted': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJournalIcon = (journal: string) => {
    switch (journal) {
      case 'general': return '📋'
      case 'sales': return '💰'
      case 'purchases': return '🛒'
      case 'cash': return '💵'
      case 'bank': return '🏦'
      case 'operations': return '⚙️'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement de l'écriture comptable...
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
            {entry.entryNumber}
          </h1>
          <p className="text-muted-foreground">
            Écriture comptable • {getJournalLabel(entry.journal)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting')}>
            Retour à la Comptabilité
          </Button>
          <Button onClick={() => navigate(`/accounting/journal/edit/${entry.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entry Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'Écriture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">N° d'Écriture</label>
                  <p className="text-sm font-mono">{entry.entryNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Journal</label>
                  <p className="text-sm flex items-center gap-2">
                    <span>{getJournalIcon(entry.journal)}</span>
                    {getJournalLabel(entry.journal)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date d'Écriture</label>
                  <p className="text-sm">{new Date(entry.entryDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Période</label>
                  <p className="text-sm">{entry.period}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Référence</label>
                  <p className="text-sm">{entry.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Devise</label>
                  <p className="text-sm">{entry.currency}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(entry.status)}>
                  {getStatusLabel(entry.status)}
                </Badge>
                <Badge variant="outline">
                  {entry.lines.length} ligne{entry.lines.length > 1 ? 's' : ''}
                </Badge>
                <Badge className={entry.isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {entry.isBalanced ? 'Équilibrée ✅' : 'Déséquilibrée ❌'}
                </Badge>
              </div>
              {entry.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{entry.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Journal Entry Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Lignes d'Écriture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.lines.map((line, index) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{line.accountCode} - {line.accountName}</h4>
                        <p className="text-sm text-muted-foreground">{line.description}</p>
                        {line.reference && (
                          <p className="text-sm text-muted-foreground">Réf: {line.reference}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {line.debit > 0 ? (
                            <span className="text-green-600">+{line.debit.toLocaleString()} MAD</span>
                          ) : (
                            <span className="text-red-600">-{line.credit.toLocaleString()} MAD</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {line.debit > 0 ? 'Débit' : 'Crédit'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Débit</label>
                        <p className="font-medium text-green-600">
                          {line.debit > 0 ? `${line.debit.toLocaleString()} MAD` : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Crédit</label>
                        <p className="font-medium text-red-600">
                          {line.credit > 0 ? `${line.credit.toLocaleString()} MAD` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {entry.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{entry.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Entry Balance */}
          <Card className={entry.isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardHeader>
              <CardTitle className={entry.isBalanced ? 'text-green-800' : 'text-red-800'}>
                Équilibre de l'Écriture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl mb-2 ${entry.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.isBalanced ? '⚖️' : '⚠️'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {entry.isBalanced ? 'Écriture équilibrée' : 'Écriture déséquilibrée'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Débit</span>
                  <span className="text-sm font-medium text-green-600">{entry.totalDebit.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Crédit</span>
                  <span className="text-sm font-medium text-red-600">{entry.totalCredit.toLocaleString()} MAD</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Différence</span>
                    <span className={`text-sm font-bold ${entry.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(entry.totalDebit - entry.totalCredit).toLocaleString()} MAD
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entry Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de l'Écriture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(entry.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(entry.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Journal</span>
                  <span className="text-sm font-medium">{getJournalLabel(entry.journal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Période</span>
                  <span className="text-sm font-medium">{entry.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Devise</span>
                  <span className="text-sm font-medium">{entry.currency}</span>
                </div>
                {entry.exchangeRate !== 1 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de Change</span>
                    <span className="text-sm font-medium">{entry.exchangeRate}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entry.status === 'draft' && (
                <Button className="w-full" onClick={() => navigate(`/accounting/journal/approve/${entry.id}`)}>
                  ✅ Approuver
                </Button>
              )}
              {entry.status === 'approved' && (
                <Button className="w-full" onClick={() => navigate(`/accounting/journal/post/${entry.id}`)}>
                  📝 Comptabiliser
                </Button>
              )}
              <Button className="w-full" variant="outline" onClick={() => navigate(`/accounting/journal/duplicate/${entry.id}`)}>
                📋 Dupliquer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                🖨️ Imprimer
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/accounting/journal/reverse/${entry.id}`)}>
                🔄 Contrepasser
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
                <span className="text-sm">{new Date(entry.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <span className="text-sm">{new Date(entry.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="text-sm">{entry.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
