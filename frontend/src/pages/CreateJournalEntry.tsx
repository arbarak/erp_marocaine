import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface JournalLine {
  id: string
  accountNumber: string
  accountName: string
  description: string
  debit: number
  credit: number
}

export function CreateJournalEntry() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Entry Information
    entryNumber: '',
    entryDate: new Date().toISOString().split('T')[0],
    period: new Date().toISOString().slice(0, 7), // YYYY-MM format
    
    // Entry Details
    description: '',
    reference: '',
    journal: 'general',
    
    // Status
    status: 'draft',
    
    // Totals (calculated)
    totalDebit: 0,
    totalCredit: 0,
    difference: 0
  })

  const [journalLines, setJournalLines] = useState<JournalLine[]>([
    {
      id: '1',
      accountNumber: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    },
    {
      id: '2',
      accountNumber: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Mock chart of accounts (PCGM - Plan Comptable Général Marocain)
  const chartOfAccounts = [
    { number: '1111', name: 'Capital Social', type: 'equity' },
    { number: '1140', name: 'Réserves Légales', type: 'equity' },
    { number: '2111', name: 'Frais de Constitution', type: 'asset' },
    { number: '2321', name: 'Terrains', type: 'asset' },
    { number: '2340', name: 'Matériel de Transport', type: 'asset' },
    { number: '3111', name: 'Marchandises', type: 'asset' },
    { number: '3421', name: 'Clients', type: 'asset' },
    { number: '4411', name: 'Fournisseurs', type: 'liability' },
    { number: '4455', name: 'État - TVA Récupérable', type: 'asset' },
    { number: '4456', name: 'État - TVA Due', type: 'liability' },
    { number: '5111', name: 'Banque', type: 'asset' },
    { number: '5161', name: 'Caisse', type: 'asset' },
    { number: '6111', name: 'Achats de Marchandises', type: 'expense' },
    { number: '6121', name: 'Achats de Matières Premières', type: 'expense' },
    { number: '6142', name: 'Achats de Fournitures de Bureau', type: 'expense' },
    { number: '6167', name: 'Services Bancaires', type: 'expense' },
    { number: '7111', name: 'Ventes de Marchandises', type: 'income' },
    { number: '7121', name: 'Ventes de Produits Finis', type: 'income' }
  ]

  const journals = [
    { value: 'general', label: 'Journal Général' },
    { value: 'sales', label: 'Journal des Ventes' },
    { value: 'purchases', label: 'Journal des Achats' },
    { value: 'bank', label: 'Journal de Banque' },
    { value: 'cash', label: 'Journal de Caisse' },
    { value: 'operations', label: 'Journal des Opérations Diverses' }
  ]

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleLineChange = (lineId: string, field: keyof JournalLine, value: string | number) => {
    setJournalLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value }
        
        // Auto-populate account name when account number changes
        if (field === 'accountNumber') {
          const account = chartOfAccounts.find(acc => acc.number === value)
          if (account) {
            updatedLine.accountName = account.name
          } else {
            updatedLine.accountName = ''
          }
        }
        
        return updatedLine
      }
      return line
    }))
    
    // Recalculate totals
    calculateTotals()
  }

  const addJournalLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      accountNumber: '',
      accountName: '',
      description: '',
      debit: 0,
      credit: 0
    }
    setJournalLines(prev => [...prev, newLine])
  }

  const removeJournalLine = (lineId: string) => {
    if (journalLines.length > 2) {
      setJournalLines(prev => prev.filter(line => line.id !== lineId))
      calculateTotals()
    }
  }

  const calculateTotals = () => {
    setTimeout(() => {
      setJournalLines(current => {
        const totalDebit = current.reduce((sum, line) => sum + (line.debit || 0), 0)
        const totalCredit = current.reduce((sum, line) => sum + (line.credit || 0), 0)
        const difference = totalDebit - totalCredit
        
        setFormData(prev => ({
          ...prev,
          totalDebit,
          totalCredit,
          difference
        }))
        
        return current
      })
    }, 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.entryDate) {
      newErrors.entryDate = 'La date d\'écriture est obligatoire'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire'
    }

    // Validate journal lines
    const validLines = journalLines.filter(line => 
      line.accountNumber && (line.debit > 0 || line.credit > 0)
    )

    if (validLines.length < 2) {
      newErrors.journalLines = 'Au moins 2 lignes avec comptes et montants sont obligatoires'
    }

    // Check if each line has either debit or credit (not both)
    const invalidLines = journalLines.filter(line => 
      line.accountNumber && line.debit > 0 && line.credit > 0
    )

    if (invalidLines.length > 0) {
      newErrors.journalLines = 'Une ligne ne peut pas avoir à la fois un débit et un crédit'
    }

    // Check if totals are balanced
    if (Math.abs(formData.difference) > 0.01) {
      newErrors.balance = 'L\'écriture doit être équilibrée (Débit = Crédit)'
    }

    // Validate account numbers
    journalLines.forEach((line, index) => {
      if (line.accountNumber && !chartOfAccounts.find(acc => acc.number === line.accountNumber)) {
        newErrors[`line_${index}_account`] = 'Numéro de compte invalide'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Recalculate totals before validation
    calculateTotals()
    
    // Wait a bit for state to update
    setTimeout(async () => {
      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Écriture comptable créée avec succès!'
        })
        
        // Redirect to accounting after 2 seconds
        setTimeout(() => {
          navigate('/accounting')
        }, 2000)
        
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Erreur lors de la création de l\'écriture'
        })
      } finally {
        setIsSubmitting(false)
      }
    }, 100)
  }

  const handleCancel = () => {
    navigate('/accounting')
  }

  const isBalanced = Math.abs(formData.difference) < 0.01

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Nouvelle Écriture Comptable
          </h1>
          <p className="text-muted-foreground">
            Saisir une écriture au journal selon le PCGM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isBalanced}>
            {isSubmitting ? 'Création...' : 'Créer l\'Écriture'}
          </Button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${notification.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
          <CardContent className="pt-4">
            <p className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Balance Status */}
      <Card className={`border-l-4 ${isBalanced ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${isBalanced ? 'text-green-700' : 'text-orange-700'}`}>
                {isBalanced ? '✅ Écriture équilibrée' : '⚠️ Écriture non équilibrée'}
              </p>
              <p className="text-sm text-gray-600">
                Débit: {formData.totalDebit.toLocaleString()} MAD | 
                Crédit: {formData.totalCredit.toLocaleString()} MAD | 
                Différence: {formData.difference.toLocaleString()} MAD
              </p>
            </div>
            {!isBalanced && (
              <Badge variant="destructive">
                Différence: {Math.abs(formData.difference).toLocaleString()} MAD
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entry Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'Écriture</CardTitle>
            <CardDescription>
              Détails généraux de l'écriture comptable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  N° d'Écriture
                </label>
                <input
                  type="text"
                  value={formData.entryNumber}
                  onChange={(e) => handleInputChange('entryNumber', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date d'Écriture *
                </label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.entryDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.entryDate && <p className="text-red-500 text-sm mt-1">{errors.entryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Période
                </label>
                <input
                  type="month"
                  value={formData.period}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Journal
                </label>
                <select
                  value={formData.journal}
                  onChange={(e) => handleInputChange('journal', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {journals.map(journal => (
                    <option key={journal.value} value={journal.value}>{journal.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Description de l'écriture"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Référence externe"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journal Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Lignes d'Écriture</CardTitle>
            <CardDescription>
              Détail des comptes débités et crédités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.journalLines && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.journalLines}</p>
              </div>
            )}

            {errors.balance && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.balance}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Compte</th>
                    <th className="text-left p-2 font-medium">Libellé</th>
                    <th className="text-left p-2 font-medium">Description</th>
                    <th className="text-right p-2 font-medium">Débit (MAD)</th>
                    <th className="text-right p-2 font-medium">Crédit (MAD)</th>
                    <th className="text-center p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {journalLines.map((line, index) => (
                    <tr key={line.id} className="border-b">
                      <td className="p-2">
                        <select
                          value={line.accountNumber}
                          onChange={(e) => handleLineChange(line.id, 'accountNumber', e.target.value)}
                          className={`w-full p-2 border rounded ${errors[`line_${index}_account`] ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Sélectionner</option>
                          {chartOfAccounts.map(account => (
                            <option key={account.number} value={account.number}>
                              {account.number}
                            </option>
                          ))}
                        </select>
                        {errors[`line_${index}_account`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`line_${index}_account`]}</p>
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.accountName}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                          placeholder="Auto-rempli"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="Description de la ligne"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(line.id, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(line.id, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {journalLines.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeJournalLine(line.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={3} className="p-2 text-right">TOTAUX:</td>
                    <td className="p-2 text-right bg-blue-50">
                      {formData.totalDebit.toLocaleString()} MAD
                    </td>
                    <td className="p-2 text-right bg-blue-50">
                      {formData.totalCredit.toLocaleString()} MAD
                    </td>
                    <td className="p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={addJournalLine}
              >
                ➕ Ajouter une Ligne
              </Button>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Différence: <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(formData.difference).toLocaleString()} MAD
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleInputChange('status', 'draft')}
                disabled={isSubmitting}
              >
                Enregistrer comme Brouillon
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isBalanced}
                className={!isBalanced ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isSubmitting ? 'Création en cours...' : 'Créer l\'Écriture'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
