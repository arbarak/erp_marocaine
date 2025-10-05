import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditAccount() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'asset',
    parentAccount: '',
    level: 1,
    status: 'active',
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
    notes: ''
  })

  // Account types based on PCGM (Plan Comptable Général Marocain)
  const accountTypes = [
    { value: 'asset', label: 'Actif (Classe 2-3)' },
    { value: 'liability', label: 'Passif (Classe 1-4)' },
    { value: 'equity', label: 'Capitaux Propres (Classe 1)' },
    { value: 'revenue', label: 'Produits (Classe 7)' },
    { value: 'expense', label: 'Charges (Classe 6)' },
    { value: 'financial', label: 'Financier (Classe 5)' },
    { value: 'special', label: 'Comptes Spéciaux (Classe 0-8-9)' }
  ]

  // Account statuses
  const accountStatuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'closed', label: 'Fermé' },
    { value: 'suspended', label: 'Suspendu' }
  ]

  // Tax types
  const taxTypes = [
    { value: 'tva_collectee', label: 'TVA Collectée' },
    { value: 'tva_deductible', label: 'TVA Déductible' },
    { value: 'ir', label: 'Impôt sur le Revenu' },
    { value: 'is', label: 'Impôt sur les Sociétés' },
    { value: 'taxe_professionnelle', label: 'Taxe Professionnelle' },
    { value: 'other', label: 'Autre' }
  ]

  // Mock parent accounts
  const parentAccounts = [
    { code: '1', name: 'Financement Permanent' },
    { code: '2', name: 'Actif Immobilisé' },
    { code: '3', name: 'Actif Circulant' },
    { code: '4', name: 'Passif Circulant' },
    { code: '5', name: 'Trésorerie' },
    { code: '6', name: 'Charges' },
    { code: '7', name: 'Produits' }
  ]

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
          notes: 'Compte de caisse géré par le service comptabilité. Contrôle quotidien obligatoire.'
        }
        
        setFormData(mockAccount)
      } catch (err) {
        setError('Erreur lors du chargement du compte')
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call to update account
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/accounting')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du compte')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.accountCode) {
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

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Compte modifié avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                Le compte {formData.accountCode} - {formData.accountName} a été mis à jour.
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
            Modifier le Compte
          </h1>
          <p className="text-muted-foreground">
            Modifier le compte "{formData.accountCode} - {formData.accountName}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/accounting')}>
            Annuler
          </Button>
          <Button form="account-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="account-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>
              Détails de base du compte comptable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Code Compte *</label>
                <input
                  type="text"
                  name="accountCode"
                  value={formData.accountCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                  placeholder="5161001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nom du Compte *</label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                  placeholder="Caisse Centrale"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type de Compte</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Compte Parent</label>
                <select
                  name="parentAccount"
                  value={formData.parentAccount}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Aucun parent</option>
                  {parentAccounts.map(account => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
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
                  {accountStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Niveau</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  min="1"
                  max="10"
                />
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
              <div>
                <label className="text-sm font-medium">Solde Actuel (MAD)</label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  step="0.01"
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isReconcilable"
                  checked={formData.isReconcilable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Compte rapprochable</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allowJournalEntries"
                  checked={formData.allowJournalEntries}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Autoriser les écritures</label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                rows={2}
                placeholder="Description du compte..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Fiscale</CardTitle>
            <CardDescription>
              Paramètres liés à la fiscalité marocaine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="taxConfiguration.isTaxAccount"
                checked={formData.taxConfiguration.isTaxAccount}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Compte de taxe</label>
            </div>
            {formData.taxConfiguration.isTaxAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type de Taxe</label>
                  <select
                    name="taxConfiguration.taxType"
                    value={formData.taxConfiguration.taxType}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Sélectionner un type</option>
                    {taxTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Taux de Taxe (%)</label>
                  <input
                    type="number"
                    name="taxConfiguration.taxRate"
                    value={formData.taxConfiguration.taxRate}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails Bancaires</CardTitle>
            <CardDescription>
              Informations bancaires si applicable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="bankDetails.isBank"
                checked={formData.bankDetails.isBank}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Compte bancaire</label>
            </div>
            {formData.bankDetails.isBank && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom de la Banque</label>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="Attijariwafa Bank"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Numéro de Compte</label>
                  <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="007 780 0000123456789 12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">RIB (24 chiffres)</label>
                  <input
                    type="text"
                    name="bankDetails.rib"
                    value={formData.bankDetails.rib}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="007780000012345678912345"
                    maxLength={24}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Code SWIFT</label>
                  <input
                    type="text"
                    name="bankDetails.swift"
                    value={formData.bankDetails.swift}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder="BCMAMAMC"
                  />
                </div>
              </div>
            )}
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
              placeholder="Notes et informations supplémentaires..."
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/accounting')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
