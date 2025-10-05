import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function EditCustomer() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    companyName: '',
    customerType: 'company',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    
    // Legal Information (Morocco)
    ice: '',
    rc: '',
    patente: '',
    cnss: '',
    vatNumber: '',
    
    // Address
    address: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      region: '',
      country: 'Maroc'
    },
    
    // Commercial Information
    customerCategory: 'standard',
    paymentTerms: 30,
    creditLimit: 0,
    discount: 0,
    currency: 'MAD',
    
    // Contact Person
    contactPerson: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    },
    
    // Status and Settings
    isActive: true,
    isVip: false,
    allowCredit: true,
    
    // Additional Information
    industry: '',
    notes: '',
    tags: [] as string[]
  })

  const customerTypes = [
    { value: 'company', label: 'Entreprise' },
    { value: 'individual', label: 'Particulier' },
    { value: 'government', label: 'Administration' },
    { value: 'ngo', label: 'ONG/Association' }
  ]

  const customerCategories = [
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'vip', label: 'VIP' },
    { value: 'wholesale', label: 'Grossiste' },
    { value: 'retail', label: 'Détaillant' }
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

  const industries = [
    'Agriculture',
    'Automobile',
    'Banque/Finance',
    'BTP/Construction',
    'Commerce/Distribution',
    'Éducation',
    'Énergie',
    'Industrie',
    'Informatique/IT',
    'Santé',
    'Services',
    'Télécommunications',
    'Tourisme/Hôtellerie',
    'Transport/Logistique',
    'Autre'
  ]

  const paymentTermsOptions = [
    { value: 0, label: 'Comptant' },
    { value: 15, label: '15 jours' },
    { value: 30, label: '30 jours' },
    { value: 45, label: '45 jours' },
    { value: 60, label: '60 jours' },
    { value: 90, label: '90 jours' }
  ]

  // Load customer data on component mount
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load customer data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the customer
        const mockCustomer = {
          name: 'Société ABC SARL',
          companyName: 'Société ABC SARL',
          customerType: 'company',
          email: 'contact@societeabc.ma',
          phone: '+212 522 123 456',
          mobile: '+212 661 234 567',
          website: 'https://societeabc.ma',
          ice: '001234567890123',
          rc: 'RC-CAS-2020-001',
          patente: 'PAT-2020-001',
          cnss: 'CNSS-123456',
          vatNumber: 'MA001234567890123',
          address: {
            line1: '123 Zone Industrielle Ain Sebaa',
            line2: 'Immeuble Al Manar, 3ème étage',
            city: 'Casablanca',
            postalCode: '20250',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          customerCategory: 'premium',
          paymentTerms: 30,
          creditLimit: 100000,
          discount: 5,
          currency: 'MAD',
          contactPerson: {
            firstName: 'Ahmed',
            lastName: 'Bennani',
            title: 'Directeur Commercial',
            email: 'ahmed.bennani@societeabc.ma',
            phone: '+212 661 234 567'
          },
          isActive: true,
          isVip: true,
          allowCredit: true,
          industry: 'Commerce/Distribution',
          notes: 'Client important avec un bon historique de paiement. Négociation possible sur les prix pour les gros volumes.',
          tags: ['VIP', 'Gros Volume', 'Paiement Rapide']
        }
        
        setFormData(mockCustomer)
      } catch (err) {
        setError('Erreur lors du chargement du client')
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const validateICE = (ice: string) => {
    return ice.length === 15 && /^\d+$/.test(ice)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.email) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (formData.ice && !validateICE(formData.ice)) {
        throw new Error('Le numéro ICE doit contenir exactement 15 chiffres')
      }

      if (formData.creditLimit < 0) {
        throw new Error('La limite de crédit ne peut pas être négative')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(true)
      setTimeout(() => {
        navigate('/sales')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement du client...
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
                Client modifié avec succès !
              </h2>
              <p className="text-green-600">
                Les modifications de "{formData.name}" ont été enregistrées.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Redirection vers les ventes...
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
            Modifier le Client
          </h1>
          <p className="text-muted-foreground">
            Modifier les informations du client "{formData.name}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
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
              Informations principales du client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type de Client</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {customerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  name="customerCategory"
                  value={formData.customerCategory}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {customerCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nom/Raison Sociale *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: Société ABC SARL"
                  required
                />
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
                <label className="text-sm font-medium">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="+212 661 123 456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Légales</CardTitle>
            <CardDescription>
              Identifiants officiels au Maroc
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

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
            <CardDescription>
              Adresse de facturation et de livraison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse Ligne 1</label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="123 Zone Industrielle Ain Sebaa"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adresse Ligne 2</label>
                <input
                  type="text"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Immeuble Al Manar, 3ème étage"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Casablanca"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code Postal</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="20250"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Région</label>
                <select
                  name="address.region"
                  value={formData.address.region}
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

        {/* Commercial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Commerciales</CardTitle>
            <CardDescription>
              Conditions de paiement et paramètres commerciaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Conditions de Paiement</label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {paymentTermsOptions.map(term => (
                    <option key={term.value} value={term.value}>
                      {term.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Limite de Crédit (MAD)</label>
                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  min="0"
                  step="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Remise (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Secteur d'Activité</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner un secteur</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Client actif</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isVip"
                  checked={formData.isVip}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Client VIP</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="allowCredit"
                  checked={formData.allowCredit}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Autoriser le crédit</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/sales')}>
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
