import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

export function CreateWarehouse() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    code: '',
    type: 'main',
    status: 'active',
    
    // Location Information
    address: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Maroc',
    
    // Contact Information
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    
    // Warehouse Details
    totalArea: '',
    storageCapacity: '',
    temperatureControlled: false,
    securityLevel: 'standard',
    
    // Operating Hours
    operatingHours: '08:00-17:00',
    workingDays: 'monday-friday',
    
    // Additional Information
    description: '',
    notes: '',
    
    // Configuration
    allowNegativeStock: false,
    autoReorderEnabled: false,
    barcodeRequired: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const warehouseTypes = [
    { value: 'main', label: 'Entrepôt Principal' },
    { value: 'secondary', label: 'Entrepôt Secondaire' },
    { value: 'retail', label: 'Magasin de Vente' },
    { value: 'transit', label: 'Entrepôt de Transit' },
    { value: 'virtual', label: 'Entrepôt Virtuel' }
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

  const securityLevels = [
    { value: 'basic', label: 'Basique' },
    { value: 'standard', label: 'Standard' },
    { value: 'high', label: 'Élevé' },
    { value: 'maximum', label: 'Maximum' }
  ]

  const workingDaysOptions = [
    { value: 'monday-friday', label: 'Lundi - Vendredi' },
    { value: 'monday-saturday', label: 'Lundi - Samedi' },
    { value: 'everyday', label: 'Tous les jours' },
    { value: 'custom', label: 'Personnalisé' }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entrepôt est obligatoire'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Le code de l\'entrepôt est obligatoire'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est obligatoire'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est obligatoire'
    }

    if (!formData.region) {
      newErrors.region = 'La région est obligatoire'
    }

    if (!formData.managerName.trim()) {
      newErrors.managerName = 'Le nom du responsable est obligatoire'
    }

    if (formData.managerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
      newErrors.managerEmail = 'Format d\'email invalide'
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
        message: 'Entrepôt créé avec succès!'
      })
      
      // Redirect to inventory after 2 seconds
      setTimeout(() => {
        navigate('/inventory')
      }, 2000)
      
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors de la création de l\'entrepôt'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/inventory')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Créer un Nouvel Entrepôt
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau lieu de stockage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer l\'Entrepôt'}
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
            <CardTitle>Informations Générales</CardTitle>
            <CardDescription>
              Détails de base de l'entrepôt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom de l'Entrepôt *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: Entrepôt Central Casablanca"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Code Entrepôt *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex: WH-CASA-01"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type d'Entrepôt
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {warehouseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="maintenance">En Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Description courte de l'entrepôt"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
            <CardDescription>
              Adresse et informations géographiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Adresse complète de l'entrepôt"
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
                  placeholder="Ville"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Région *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.region ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Sélectionner une région</option>
                  {moroccanRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
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
                  placeholder="Code postal"
                />
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Responsable de l'Entrepôt</CardTitle>
            <CardDescription>
              Informations de contact du responsable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du Responsable *
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => handleInputChange('managerName', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.managerName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nom complet du responsable"
                />
                {errors.managerName && <p className="text-red-500 text-sm mt-1">{errors.managerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${errors.managerEmail ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@example.com"
                />
                {errors.managerEmail && <p className="text-red-500 text-sm mt-1">{errors.managerEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="+212 6XX-XXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'Entrepôt</CardTitle>
            <CardDescription>
              Caractéristiques techniques et capacités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Surface Totale (m²)
                </label>
                <input
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange('totalArea', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacité de Stockage
                </label>
                <input
                  type="text"
                  value={formData.storageCapacity}
                  onChange={(e) => handleInputChange('storageCapacity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 500 palettes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Niveau de Sécurité
                </label>
                <select
                  value={formData.securityLevel}
                  onChange={(e) => handleInputChange('securityLevel', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {securityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Horaires d'Ouverture
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Ex: 08:00-17:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Jours de Travail
                </label>
                <select
                  value={formData.workingDays}
                  onChange={(e) => handleInputChange('workingDays', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {workingDaysOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="temperatureControlled"
                  checked={formData.temperatureControlled}
                  onChange={(e) => handleInputChange('temperatureControlled', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="temperatureControlled" className="text-sm font-medium">
                  Entrepôt climatisé / température contrôlée
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowNegativeStock"
                  checked={formData.allowNegativeStock}
                  onChange={(e) => handleInputChange('allowNegativeStock', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="allowNegativeStock" className="text-sm font-medium">
                  Autoriser le stock négatif
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoReorderEnabled"
                  checked={formData.autoReorderEnabled}
                  onChange={(e) => handleInputChange('autoReorderEnabled', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoReorderEnabled" className="text-sm font-medium">
                  Réapprovisionnement automatique activé
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="barcodeRequired"
                  checked={formData.barcodeRequired}
                  onChange={(e) => handleInputChange('barcodeRequired', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="barcodeRequired" className="text-sm font-medium">
                  Code-barres obligatoire pour les mouvements
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Complémentaires</CardTitle>
            <CardDescription>
              Notes et remarques
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
                rows={4}
                placeholder="Notes et remarques sur l'entrepôt..."
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
                {isSubmitting ? 'Création en cours...' : 'Créer l\'Entrepôt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
