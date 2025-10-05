import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CreateCompany() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    legalName: '',
    legalForm: 'SARL',
    
    // Legal Identifiers
    ice: '',
    ifNumber: '',
    rc: '',
    patente: '',
    cnss: '',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    
    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    stateProvince: '',
    country: 'Maroc',
    
    // Financial Settings
    currency: 'MAD',
    locale: 'fr-MA',
    fiscalYearStartMonth: 1,
    vatNumber: '',
    taxRoundingMethod: 'ROUND_HALF_UP',
    inclusiveTaxes: false,
    
    // Banking Information
    bankName: '',
    bankAccountNumber: '',
    rib: '',
    swift: '',
    iban: '',
    
    // Business Settings
    defaultPaymentTerms: 30,
    defaultQuoteValidity: 30,
    invoicePrefix: 'FAC',
    quotePrefix: 'DEV',
    poPrefix: 'BC',
    soPrefix: 'BL',
    defaultCostingMethod: 'FIFO',
    
    // Additional Information
    description: '',
    emailSignature: '',
    isActive: true
  })

  const legalForms = [
    { value: 'SARL', label: 'SARL - Société à Responsabilité Limitée' },
    { value: 'SA', label: 'SA - Société Anonyme' },
    { value: 'SAS', label: 'SAS - Société par Actions Simplifiée' },
    { value: 'SASU', label: 'SASU - Société par Actions Simplifiée Unipersonnelle' },
    { value: 'SNC', label: 'SNC - Société en Nom Collectif' },
    { value: 'SCS', label: 'SCS - Société en Commandite Simple' },
    { value: 'AUTO_ENTREPRENEUR', label: 'Auto-entrepreneur' },
    { value: 'AUTRE', label: 'Autre' }
  ]

  const moroccanRegions = [
    'Tanger-Tétouan-Al Hoceïma',
    'Oriental',
    'Fès-Meknès', 
    'Rabat-Salé-Kénitra',
    'Béni Mellal-Khénifra',
    'Casablanca-Settat',
    'Marrakech-Safi',
    'Drâa-Tafilalet',
    'Souss-Massa',
    'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab'
  ]

  const currencies = [
    { value: 'MAD', label: 'Dirham Marocain (MAD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'US Dollar (USD)' }
  ]

  const costingMethods = [
    { value: 'FIFO', label: 'FIFO - Premier Entré, Premier Sorti' },
    { value: 'LIFO', label: 'LIFO - Dernier Entré, Premier Sorti' },
    { value: 'WAC', label: 'WAC - Coût Moyen Pondéré' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateICE = (ice: string) => {
    return ice.length === 15 && /^\d{15}$/.test(ice)
  }

  const validateRIB = (rib: string) => {
    return rib.length === 24 && /^\d{24}$/.test(rib)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.legalName || !formData.email) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (formData.ice && !validateICE(formData.ice)) {
        throw new Error('Le numéro ICE doit contenir exactement 15 chiffres')
      }

      if (formData.rib && !validateRIB(formData.rib)) {
        throw new Error('Le RIB doit contenir exactement 24 chiffres')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(true)
      setTimeout(() => {
        navigate('/companies')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Entreprise créée avec succès !
              </h2>
              <p className="text-green-600">
                L'entreprise "{formData.name}" a été créée et configurée.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Redirection vers la liste des entreprises...
              </p>
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
            Créer une Nouvelle Entreprise
          </h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle entreprise au système multi-entreprises
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/companies')}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Créer l\'Entreprise'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Erreur:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
            <CardDescription>
              Informations principales de l'entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom Commercial *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: TechnoMaroc"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Raison Sociale *</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: TechnoMaroc SARL"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Forme Juridique *</label>
                <select
                  name="legalForm"
                  value={formData.legalForm}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  {legalForms.map(form => (
                    <option key={form.value} value={form.value}>
                      {form.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="contact@entreprise.ma"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                rows={3}
                placeholder="Description de l'activité de l'entreprise..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Identifiers */}
        <Card>
          <CardHeader>
            <CardTitle>Identifiants Légaux</CardTitle>
            <CardDescription>
              Numéros d'identification officiels au Maroc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ICE (15 chiffres)</label>
                <input
                  type="text"
                  name="ice"
                  value={formData.ice}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="001234567890123"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Identifiant Commun de l'Entreprise
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">IF (8 chiffres)</label>
                <input
                  type="text"
                  name="ifNumber"
                  value={formData.ifNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="12345678"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Identifiant Fiscal
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Registre de Commerce</label>
                <input
                  type="text"
                  name="rc"
                  value={formData.rc}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="RC-CAS-2020-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Patente</label>
                <input
                  type="text"
                  name="patente"
                  value={formData.patente}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Numéro de patente"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CNSS</label>
                <input
                  type="text"
                  name="cnss"
                  value={formData.cnss}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Numéro CNSS"
                />
              </div>
              <div>
                <label className="text-sm font-medium">N° TVA</label>
                <input
                  type="text"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="MA001234567890123"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
            <CardDescription>
              Coordonnées de l'entreprise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="+212 522 123 456"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Site Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="https://entreprise.ma"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
            <CardDescription>
              Adresse du siège social
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Adresse Ligne 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="123 Zone Industrielle Ain Sebaa"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adresse Ligne 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Immeuble Al Manar, 3ème étage"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Casablanca"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="20250"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Région</label>
                <select
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner une région</option>
                  {moroccanRegions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Financiers</CardTitle>
            <CardDescription>
              Configuration comptable et fiscale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Devise</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Méthode de Coût</label>
                <select
                  name="defaultCostingMethod"
                  value={formData.defaultCostingMethod}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {costingMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Début Exercice Fiscal</label>
                <select
                  name="fiscalYearStartMonth"
                  value={formData.fiscalYearStartMonth}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value={1}>Janvier</option>
                  <option value={4}>Avril</option>
                  <option value={7}>Juillet</option>
                  <option value={10}>Octobre</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="inclusiveTaxes"
                  checked={formData.inclusiveTaxes}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Prix TTC par défaut</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer l\'Entreprise'}
          </Button>
        </div>
      </form>
    </div>
  )
}
