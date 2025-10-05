import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditJournalEntry() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    entryNumber: '',
    entryDate: '',
    period: '',
    reference: '',
    description: '',
    status: 'draft',
    journal: 'general',
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
    isBalanced: false
  })

  // Journal types
  const journalTypes = [
    { value: 'general', label: 'Journal Général' },
    { value: 'sales', label: 'Journal des Ventes' },
    { value: 'purchases', label: 'Journal des Achats' },
    { value: 'cash', label: 'Journal de Caisse' },
    { value: 'bank', label: 'Journal de Banque' },
    { value: 'operations', label: 'Journal des Opérations Diverses' }
  ]

  // Entry statuses
  const entryStatuses = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'posted', label: 'Comptabilisé' },
    { value: 'cancelled', label: 'Annulé' }
  ]

  // Mock data for accounts (PCGM)
  const accounts = [
    { id: '1', code: '1111', name: 'Capital Social' },
    { id: '2', code: '2111', name: 'Frais d\'établissement' },
    { id: '3', code: '3111', name: 'Matières premières' },
    { id: '4', code: '4111', name: 'Fournisseurs' },
    { id: '5', code: '5111', name: 'Banque' },
    { id: '6', code: '6111', name: 'Achats de marchandises' },
    { id: '7', code: '7111', name: 'Ventes de marchandises' },
    { id: '8', code: '8111', name: 'Résultats en instance d\'affectation' }
  ]

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
          entryNumber: 'JE-2025-001',
          entryDate: '2025-01-18',
          period: '2025-01',
          reference: 'INV-2025-001',
          description: 'Vente de marchandises - Facture INV-2025-001',
          status: 'approved',
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
          isBalanced: true
        }
        
        setFormData(mockEntry)
      } catch (err) {
        setError('Erreur lors du chargement de l\'écriture comptable')
      } finally {
        setLoading(false)
      }
    }

    loadJournalEntry()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLineChange = (index: number, field: string, value: any) => {
    const updatedLines = [...formData.lines]
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value
    }
    
    // If account is changed, update account details
    if (field === 'accountId') {
      const account = accounts.find(a => a.id === value)
      if (account) {
        updatedLines[index].accountCode = account.code
        updatedLines[index].accountName = account.name
      }
    }
    
    setFormData(prev => ({
      ...prev,
      lines: updatedLines
    }))
    
    calculateTotals(updatedLines)
  }

  const calculateTotals = (lines: typeof formData.lines) => {
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)
    const isBalanced = totalDebit === totalCredit
    
    setFormData(prev => ({
      ...prev,
      totalDebit,
      totalCredit,
      isBalanced
    }))
  }

  const addLine = () => {
    const newLine = {
      id: Date.now().toString(),
      accountId: '',
      accountCode: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0,
      reference: formData.reference
    }
    
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }))
  }

  const removeLine = (index: number) => {
    const updatedLines = formData.lines.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      lines: updatedLines
    }))
    calculateTotals(updatedLines)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.isBalanced) {
      setError('L\'écriture doit être équilibrée (Débit = Crédit)')
      setLoading(false)
      return
    }

    if (formData.lines.length < 2) {
      setError('Une écriture doit contenir au moins 2 lignes')
      setLoading(false)
      return
    }

    try {
      // Simulate API call to update journal entry
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/accounting')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'écriture comptable')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.entryNumber) {
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

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Écriture comptable modifiée avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                L'écriture {formData.entryNumber} a été mise à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page de comptabilité...
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
            Modifier l'Écriture Comptable
          </h1>
          <p className="text-muted-foreground">
            Modifier l'écriture "{formData.entryNumber}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting')}>
            Annuler
          </Button>
          <Button form="entry-form" type="submit" disabled={loading || !formData.isBalanced}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="entry-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'Écriture</CardTitle>
            <CardDescription>
              Détails généraux de l'écriture comptable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">N° d'Écriture</label>
                <input
                  type="text"
                  name="entryNumber"
                  value={formData.entryNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d'Écriture *</label>
                <input
                  type="date"
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Période</label>
                <input
                  type="month"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Journal</label>
                <select
                  name="journal"
                  value={formData.journal}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {journalTypes.map(journal => (
                    <option key={journal.value} value={journal.value}>
                      {journal.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {entryStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Devise</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="MAD">MAD - Dirham Marocain</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar US</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Référence</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="INV-2025-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Taux de Change</label>
                <input
                  type="number"
                  name="exchangeRate"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  step="0.0001"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Description de l'écriture comptable"
              />
            </div>
          </CardContent>
        </Card>

        {/* Journal Entry Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Lignes d'Écriture</CardTitle>
            <CardDescription>
              Détail des comptes débités et crédités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.lines.map((line, index) => (
              <div key={line.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Ligne {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLine(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium">Compte</label>
                    <select
                      value={line.accountId}
                      onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="">Sélectionner un compte</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Débit (MAD)</label>
                    <input
                      type="number"
                      value={line.debit}
                      onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Crédit (MAD)</label>
                    <input
                      type="number"
                      value={line.credit}
                      onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Référence</label>
                    <input
                      type="text"
                      value={line.reference}
                      onChange={(e) => handleLineChange(index, 'reference', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="REF-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description de la ligne</label>
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Description détaillée de l'opération"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addLine} className="w-full">
              + Ajouter une Ligne
            </Button>
          </CardContent>
        </Card>

        {/* Entry Balance */}
        <Card className={formData.isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={formData.isBalanced ? 'text-green-800' : 'text-red-800'}>
              Équilibre de l'Écriture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formData.totalDebit.toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">Total Débit</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formData.totalCredit.toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">Total Crédit</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${formData.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(formData.totalDebit - formData.totalCredit).toLocaleString()} MAD
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.isBalanced ? 'Équilibrée ✅' : 'Déséquilibre ❌'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Notes et observations sur l'écriture comptable..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/accounting')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading || !formData.isBalanced}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
