import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditSupplier() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    supplierType: 'company',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    ice: '',
    rc: '',
    patente: '',
    cnss: '',
    vatNumber: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      region: '',
      country: 'Maroc'
    },
    supplierCategory: 'standard',
    paymentTerms: 30,
    creditLimit: 0,
    discount: 0,
    currency: 'MAD',
    contactPerson: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    },
    bankInfo: {
      bankName: '',
      accountNumber: '',
      rib: '',
      swift: ''
    },
    isActive: true,
    isPreferred: false,
    allowCredit: true,
    industry: '',
    notes: '',
    tags: [] as string[]
  })

  // Supplier types
  const supplierTypes = [
    { value: 'company', label: 'Entreprise' },
    { value: 'individual', label: 'Particulier' },
    { value: 'government', label: 'Administration' },
    { value: 'ngo', label: 'ONG/Association' }
  ]

  // Supplier categories
  const supplierCategories = [
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'strategic', label: 'Stratégique' },
    { value: 'local', label: 'Local' },
    { value: 'international', label: 'International' }
  ]

  // Moroccan regions
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

  // Industries
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

  // Payment terms options
  const paymentTermsOptions = [
    { value: 0, label: 'Comptant' },
    { value: 15, label: '15 jours' },
    { value: 30, label: '30 jours' },
    { value: 45, label: '45 jours' },
    { value: 60, label: '60 jours' },
    { value: 90, label: '90 jours' }
  ]

  // Load supplier data on component mount
  useEffect(() => {
    const loadSupplier = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load supplier data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the supplier
        const mockSupplier = {
          name: 'TechnoSupply SARL',
          companyName: 'TechnoSupply SARL',
          supplierType: 'company',
          email: 'contact@technosupply.ma',
          phone: '+212 522 987 654',
          mobile: '+212 661 987 654',
          website: 'https://technosupply.ma',
          ice: '009876543210987',
          rc: 'RC-CAS-2019-005',
          patente: 'PAT-2019-005',
          cnss: 'CNSS-987654',
          vatNumber: 'MA009876543210987',
          address: {
            line1: '456 Zone Industrielle Sidi Bernoussi',
            line2: 'Entrepôt B, Bureau 12',
            city: 'Casablanca',
            postalCode: '20600',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          supplierCategory: 'premium',
          paymentTerms: 45,
          creditLimit: 250000,
          discount: 3,
          currency: 'MAD',
          contactPerson: {
            firstName: 'Youssef',
            lastName: 'Alami',
            title: 'Directeur Commercial',
            email: 'y.alami@technosupply.ma',
            phone: '+212 661 987 654'
          },
          bankInfo: {
            bankName: 'Attijariwafa Bank',
            accountNumber: '007890123456789',
            rib: '230007890123456789012345',
            swift: 'BCMAMAMC'
          },
          isActive: true,
          isPreferred: true,
          allowCredit: true,
          industry: 'Informatique/IT',
          notes: 'Fournisseur principal pour équipements informatiques. Excellent service et délais de livraison.',
          tags: ['Informatique', 'Livraison Rapide', 'Qualité Premium']
        }
        
        setFormData(mockSupplier)
      } catch (err) {
        setError('Erreur lors du chargement du fournisseur')
      } finally {
        setLoading(false)
      }
    }

    loadSupplier()
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

  // ICE validation (15 digits)
  const validateICE = (ice: string) => {
    return ice.length === 15 && /^\d+$/.test(ice)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Le nom du fournisseur est requis')
      }
      if (!formData.email.trim()) {
        throw new Error('L\'email est requis')
      }
      if (formData.ice && !validateICE(formData.ice)) {
        throw new Error('L\'ICE doit contenir exactement 15 chiffres')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/purchases')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement')
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
                Chargement du fournisseur...
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
                Fournisseur modifié avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                Les modifications ont été enregistrées. Redirection en cours...
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
            Modifier le Fournisseur
          </h1>
          <p className="text-muted-foreground">
            Modifier les informations du fournisseur "{formData.name}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/purchases')}>
            Annuler
          </Button>
          <Button form="supplier-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Base</CardTitle>
            <CardDescription>
              Informations principales du fournisseur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type de Fournisseur</label>
                <select
                  name="supplierType"
                  value={formData.supplierType}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {supplierTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  name="supplierCategory"
                  value={formData.supplierCategory}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {supplierCategories.map(category => (
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
                  placeholder="Ex: TechnoSupply SARL"
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
                  placeholder="contact@fournisseur.ma"
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ICE (15 chiffres)</label>
                <input
                  type="text"
                  name="ice"
                  value={formData.ice}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md font-mono"
                  placeholder="009876543210987"
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
                  placeholder="RC-CAS-2019-005"
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
                  className="w-full mt-1 p-2 border rounded-md font-mono"
                  placeholder="MA009876543210987"
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Adresse Ligne 1</label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="456 Zone Industrielle Sidi Bernoussi"
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
                  placeholder="Entrepôt B, Bureau 12"
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
                  placeholder="20600"
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

        {/* Bank Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Bancaires</CardTitle>
            <CardDescription>
              Coordonnées bancaires pour les paiements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Banque</label>
                <input
                  type="text"
                  name="bankInfo.bankName"
                  value={formData.bankInfo.bankName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Attijariwafa Bank"
                />
              </div>
              <div>
                <label className="text-sm font-medium">N° de Compte</label>
                <input
                  type="text"
                  name="bankInfo.accountNumber"
                  value={formData.bankInfo.accountNumber}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md font-mono"
                  placeholder="007890123456789"
                />
              </div>
              <div>
                <label className="text-sm font-medium">RIB (24 chiffres)</label>
                <input
                  type="text"
                  name="bankInfo.rib"
                  value={formData.bankInfo.rib}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md font-mono"
                  placeholder="230007890123456789012345"
                  maxLength={24}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code SWIFT</label>
                <input
                  type="text"
                  name="bankInfo.swift"
                  value={formData.bankInfo.swift}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="BCMAMAMC"
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
              Conditions de paiement et paramètres commerciaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Conditions de Paiement</label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {paymentTermsOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                  step="1000"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Fournisseur actif
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreferred"
                  name="isPreferred"
                  checked={formData.isPreferred}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label htmlFor="isPreferred" className="text-sm font-medium">
                  Fournisseur préféré
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowCredit"
                  name="allowCredit"
                  checked={formData.allowCredit}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label htmlFor="allowCredit" className="text-sm font-medium">
                  Autoriser le crédit
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchases')}>
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
