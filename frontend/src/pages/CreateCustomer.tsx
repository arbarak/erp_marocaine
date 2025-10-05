import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

export function CreateCustomer() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    type: 'individual', // individual, company
    email: '',
    phone: '',
    mobile: '',
    website: '',
    
    // Company Information (if type is company)
    companyName: '',
    ice: '', // Identifiant Commun de l'Entreprise
    rc: '', // Registre de Commerce
    patente: '',
    cnss: '',
    vatNumber: '',
    legalForm: '',
    
    // Address Information
    address: '',
    city: '',
    postalCode: '',
    region: '',
    country: 'Maroc',
    
    // Commercial Information
    customerCode: '',
    paymentTerms: '30',
    creditLimit: '',
    discount: '',
    priceList: 'standard',
    currency: 'MAD',
    
    // Contact Person
    contactFirstName: '',
    contactLastName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    
    // Additional Information
    notes: '',
    tags: '',
    status: 'active',
    isProspect: false,
    newsletter: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const regions = [
    'Casablanca-Settat',
    'Rabat-Salé-Kénitra',
    'Marrakech-Safi',
    'Fès-Meknès',
    'Tanger-Tétouan-Al Hoceïma',
    'Oriental',
    'Souss-Massa',
    'Drâa-Tafilalet',
    'Béni Mellal-Khénifra',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab',
    'Guelmim-Oued Noun'
  ]

  const legalForms = [
    'SARL',
    'SA',
    'SAS',
    'SASU',
    'SNC',
    'SCS',
    'Auto-entrepreneur',
    'Autre'
  ]

  const paymentTermsOptions = [
    { value: '0', label: 'Comptant' },
    { value: '15', label: '15 jours' },
    { value: '30', label: '30 jours' },
    { value: '45', label: '45 jours' },
    { value: '60', label: '60 jours' },
    { value: '90', label: '90 jours' }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est obligatoire'
    }

    if (formData.type === 'company') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'La raison sociale est obligatoire'
      }
      
      if (formData.ice && !/^\d{15}$/.test(formData.ice)) {
        newErrors.ice = 'L\'ICE doit contenir exactement 15 chiffres'
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est obligatoire'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est obligatoire'
    }

    if (formData.creditLimit && parseFloat(formData.creditLimit) < 0) {
      newErrors.creditLimit = 'La limite de crédit ne peut pas être négative'
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
      showSuccess(
        'Client créé',
        'Client créé avec succès!'
      )

      // Redirect to sales after 2 seconds
      setTimeout(() => {
        navigate('/sales')
      }, 2000)
      
    } catch (error) {
      showError(
        'Erreur de création',
        'Erreur lors de la création du client'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/sales')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Nouveau Client
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau client à votre base
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le Client'}
          </Button>
        </div>
      </div>



      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Type */}
        <Card>
          <CardHeader>
            <CardTitle>Type de Client</CardTitle>
            <CardDescription>
              Sélectionnez le type de client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="individual"
                  checked={formData.type === 'individual'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="rounded"
                />
                <span>Particulier</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  value="company"
                  checked={formData.type === 'company'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="rounded"
                />
                <span>Entreprise</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
            <CardDescription>
              Informations principales du client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.type === 'company' ? 'Nom du Contact *' : 'Nom Complet *'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={formData.type === 'company' ? 'Ex: Ahmed Bennani' : 'Ex: Ahmed Bennani'}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Client
                </label>
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={(e) => handleInputChange('customerCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Auto-généré si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="client@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+212 5XX-XXXXXX"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="+212 6XX-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Site Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information (only if type is company) */}
        {formData.type === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle>Informations Entreprise</CardTitle>
              <CardDescription>
                Détails légaux et administratifs de l'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Raison Sociale *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Ex: Société ABC SARL"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Forme Juridique
                  </label>
                  <select
                    value={formData.legalForm}
                    onChange={(e) => handleInputChange('legalForm', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner</option>
                    {legalForms.map(form => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ICE (15 chiffres)
                  </label>
                  <input
                    type="text"
                    value={formData.ice}
                    onChange={(e) => handleInputChange('ice', e.target.value)}
                    className={`w-full p-3 border rounded-lg ${errors.ice ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="000000000000000"
                    maxLength={15}
                  />
                  {errors.ice && <p className="text-red-500 text-sm mt-1">{errors.ice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Registre de Commerce
                  </label>
                  <input
                    type="text"
                    value={formData.rc}
                    onChange={(e) => handleInputChange('rc', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ex: 12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Patente
                  </label>
                  <input
                    type="text"
                    value={formData.patente}
                    onChange={(e) => handleInputChange('patente', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ex: 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    CNSS
                  </label>
                  <input
                    type="text"
                    value={formData.cnss}
                    onChange={(e) => handleInputChange('cnss', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ex: 1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    N° TVA
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ex: 12345678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
            <CardDescription>
              Informations d'adresse du client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Adresse *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Adresse complète..."
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: Casablanca"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Région
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner une région</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Maroc"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commercial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Commerciales</CardTitle>
            <CardDescription>
              Conditions de vente et paramètres commerciaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Conditions de Paiement
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {paymentTermsOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Limite de Crédit (MAD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.creditLimit ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0.00"
                />
                {errors.creditLimit && <p className="text-red-500 text-sm mt-1">{errors.creditLimit}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Remise par Défaut (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Liste de Prix
                </label>
                <select
                  value={formData.priceList}
                  onChange={(e) => handleInputChange('priceList', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="standard">Standard</option>
                  <option value="wholesale">Grossiste</option>
                  <option value="retail">Détail</option>
                  <option value="vip">VIP</option>
                </select>
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
                  <option value="MAD">MAD (Dirham)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Complémentaires</CardTitle>
            <CardDescription>
              Notes et paramètres additionnels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Notes internes sur le client..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Ex: VIP, Grossiste, Fidèle"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isProspect"
                  checked={formData.isProspect}
                  onChange={(e) => handleInputChange('isProspect', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isProspect" className="text-sm font-medium">
                  Ce client est un prospect
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="newsletter" className="text-sm font-medium">
                  Abonné à la newsletter
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="blocked">Bloqué</option>
              </select>
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
                {isSubmitting ? 'Création en cours...' : 'Créer le Client'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
