import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CreateAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    // Basic Information
    accountNumber: '',
    accountName: '',
    accountType: 'asset',
    parentAccount: '',
    
    // Classification
    category: '',
    subcategory: '',
    level: 1,
    
    // Moroccan Chart of Accounts
    cgnc: '',
    cpcClass: '',
    
    // Account Properties
    currency: 'MAD',
    isActive: true,
    isReconcilable: false,
    allowManualEntries: true,
    
    // Tax Information
    taxCode: '',
    vatRate: 20,
    isVatAccount: false,
    
    // Balance Information
    openingBalance: 0,
    openingDate: new Date().toISOString().split('T')[0],
    currentBalance: 0,
    
    // Additional Information
    description: '',
    notes: '',
    
    // Reporting
    includeInReports: true,
    reportingCategory: '',
    
    // Bank Account Details (if applicable)
    bankName: '',
    bankAccountNumber: '',
    rib: '',
    swift: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const accountTypes = [
    { value: 'asset', label: 'Actif' },
    { value: 'liability', label: 'Passif' },
    { value: 'equity', label: 'Capitaux Propres' },
    { value: 'income', label: 'Produits' },
    { value: 'expense', label: 'Charges' }
  ]

  const assetCategories = [
    { value: 'current_assets', label: 'Actif Circulant' },
    { value: 'fixed_assets', label: 'Actif Immobilisé' },
    { value: 'cash_bank', label: 'Trésorerie' },
    { value: 'receivables', label: 'Créances' },
    { value: 'inventory', label: 'Stocks' }
  ]

  const liabilityCategories = [
    { value: 'current_liabilities', label: 'Passif Circulant' },
    { value: 'long_term_liabilities', label: 'Dettes à Long Terme' },
    { value: 'payables', label: 'Dettes Fournisseurs' },
    { value: 'tax_liabilities', label: 'Dettes Fiscales' },
    { value: 'social_liabilities', label: 'Dettes Sociales' }
  ]

  const incomeCategories = [
    { value: 'sales_revenue', label: 'Chiffre d\'Affaires' },
    { value: 'other_income', label: 'Autres Produits' },
    { value: 'financial_income', label: 'Produits Financiers' },
    { value: 'exceptional_income', label: 'Produits Exceptionnels' }
  ]

  const expenseCategories = [
    { value: 'cost_of_sales', label: 'Coût des Ventes' },
    { value: 'operating_expenses', label: 'Charges d\'Exploitation' },
    { value: 'financial_expenses', label: 'Charges Financières' },
    { value: 'exceptional_expenses', label: 'Charges Exceptionnelles' },
    { value: 'tax_expenses', label: 'Impôts et Taxes' }
  ]

  const currencies = [
    { value: 'MAD', label: 'Dirham Marocain (MAD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'Dollar US (USD)' },
    { value: 'GBP', label: 'Livre Sterling (GBP)' }
  ]

  const vatRates = [
    { value: 0, label: '0% (Exonéré)' },
    { value: 7, label: '7%' },
    { value: 10, label: '10%' },
    { value: 14, label: '14%' },
    { value: 20, label: '20% (Standard)' }
  ]

  const getCategoriesByType = () => {
    switch (formData.accountType) {
      case 'asset':
        return assetCategories
      case 'liability':
        return liabilityCategories
      case 'income':
        return incomeCategories
      case 'expense':
        return expenseCategories
      default:
        return []
    }
  }

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

    // Reset category when account type changes
    if (field === 'accountType') {
      setFormData(prev => ({
        ...prev,
        category: '',
        subcategory: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Le numéro de compte est obligatoire'
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Le nom du compte est obligatoire'
    }

    if (!formData.accountType) {
      newErrors.accountType = 'Le type de compte est obligatoire'
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est obligatoire'
    }

    if (!formData.openingDate) {
      newErrors.openingDate = 'La date d\'ouverture est obligatoire'
    }

    // Validate account number format (basic validation)
    if (formData.accountNumber && !/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Le numéro de compte doit contenir uniquement des chiffres'
    }

    // Validate RIB format if provided
    if (formData.rib && !/^\d{24}$/.test(formData.rib.replace(/\s/g, ''))) {
      newErrors.rib = 'Le RIB doit contenir 24 chiffres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        message: 'Compte créé avec succès!'
      })
      
      // Redirect to accounting after 2 seconds
      setTimeout(() => {
        navigate('/accounting')
      }, 2000)
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la création du compte'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/accounting')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Nouveau Compte
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau compte au plan comptable
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le Compte'}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
            <CardDescription>
              Détails principaux du compte comptable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Numéro de Compte *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: 512001"
                />
                {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Nom du Compte *
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange('accountName', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.accountName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: Banque Populaire - Compte Courant"
                />
                {errors.accountName && <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de Compte *
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.accountType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner un type</option>
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.accountType && <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={!formData.accountType}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {getCategoriesByType().map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>{currency.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moroccan Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Conformité Marocaine</CardTitle>
            <CardDescription>
              Classification selon le plan comptable marocain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code CGNC
                </label>
                <input
                  type="text"
                  value={formData.cgnc}
                  onChange={(e) => handleInputChange('cgnc', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 5121"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code selon le Code Général de Normalisation Comptable
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Classe CPC
                </label>
                <input
                  type="text"
                  value={formData.cpcClass}
                  onChange={(e) => handleInputChange('cpcClass', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Classe selon le Code du Plan Comptable
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Propriétés du Compte</CardTitle>
            <CardDescription>
              Configuration et paramètres du compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Compte Parent
                </label>
                <input
                  type="text"
                  value={formData.parentAccount}
                  onChange={(e) => handleInputChange('parentAccount', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Numéro du compte parent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Niveau
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value={1}>Niveau 1 (Classe)</option>
                  <option value={2}>Niveau 2 (Rubrique)</option>
                  <option value={3}>Niveau 3 (Poste)</option>
                  <option value={4}>Niveau 4 (Compte)</option>
                  <option value={5}>Niveau 5 (Sous-compte)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Compte actif
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isReconcilable"
                  checked={formData.isReconcilable}
                  onChange={(e) => handleInputChange('isReconcilable', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isReconcilable" className="text-sm font-medium">
                  Compte lettrable (rapprochement bancaire)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowManualEntries"
                  checked={formData.allowManualEntries}
                  onChange={(e) => handleInputChange('allowManualEntries', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="allowManualEntries" className="text-sm font-medium">
                  Autoriser les écritures manuelles
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeInReports"
                  checked={formData.includeInReports}
                  onChange={(e) => handleInputChange('includeInReports', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="includeInReports" className="text-sm font-medium">
                  Inclure dans les rapports
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Fiscales</CardTitle>
            <CardDescription>
              Configuration TVA et taxes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Taxe
                </label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => handleInputChange('taxCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Code de taxe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Taux TVA (%)
                </label>
                <select
                  value={formData.vatRate}
                  onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {vatRates.map(rate => (
                    <option key={rate.value} value={rate.value}>{rate.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="isVatAccount"
                  checked={formData.isVatAccount}
                  onChange={(e) => handleInputChange('isVatAccount', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isVatAccount" className="text-sm font-medium">
                  Compte de TVA
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Solde d'Ouverture</CardTitle>
            <CardDescription>
              Solde initial du compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date d'Ouverture *
                </label>
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => handleInputChange('openingDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.openingDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.openingDate && <p className="text-red-500 text-sm mt-1">{errors.openingDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Solde d'Ouverture
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => handleInputChange('openingBalance', parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Solde Actuel
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {formData.currentBalance.toLocaleString()} {formData.currency}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Details */}
        {formData.category === 'cash_bank' && (
          <Card>
            <CardHeader>
              <CardTitle>Détails Bancaires</CardTitle>
              <CardDescription>
                Informations du compte bancaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de la Banque
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ex: Banque Populaire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Numéro de Compte Bancaire
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Numéro de compte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    RIB
                  </label>
                  <input
                    type="text"
                    value={formData.rib}
                    onChange={(e) => handleInputChange('rib', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.rib ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="24 chiffres"
                  />
                  {errors.rib && <p className="text-red-500 text-sm mt-1">{errors.rib}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Code SWIFT
                  </label>
                  <input
                    type="text"
                    value={formData.swift}
                    onChange={(e) => handleInputChange('swift', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Code SWIFT/BIC"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Complémentaires</CardTitle>
            <CardDescription>
              Description et notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Description courte du compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Notes et remarques sur le compte..."
              />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours...' : 'Créer le Compte'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
