import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function EditWarehouse() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    warehouseCode: '',
    name: '',
    type: 'main',
    status: 'active',
    manager: '',
    capacity: 0,
    currentOccupancy: 0,
    address: {
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      region: '',
      country: 'Maroc'
    },
    contact: {
      phone: '',
      email: '',
      fax: ''
    },
    operatingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '12:00', closed: false },
      sunday: { open: '08:00', close: '12:00', closed: true }
    },
    zones: [] as Array<{
      id: string
      name: string
      type: string
      capacity: number
      currentStock: number
    }>,
    notes: ''
  })

  // Warehouse types
  const warehouseTypes = [
    { value: 'main', label: 'Principal' },
    { value: 'secondary', label: 'Secondaire' },
    { value: 'transit', label: 'Transit' },
    { value: 'quarantine', label: 'Quarantaine' },
    { value: 'returns', label: 'Retours' }
  ]

  // Warehouse statuses
  const warehouseStatuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Fermé' }
  ]

  // Zone types
  const zoneTypes = [
    { value: 'storage', label: 'Stockage' },
    { value: 'picking', label: 'Préparation' },
    { value: 'receiving', label: 'Réception' },
    { value: 'shipping', label: 'Expédition' },
    { value: 'quality', label: 'Contrôle Qualité' }
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

  // Mock data for managers
  const managers = ['Ahmed Admin', 'Fatima Manager', 'Mohamed Supervisor', 'Aicha Coordinator']

  // Load warehouse data on component mount
  useEffect(() => {
    const loadWarehouse = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // Simulate API call to load warehouse data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for the warehouse
        const mockWarehouse = {
          warehouseCode: 'WH-001',
          name: 'Entrepôt Principal Casablanca',
          type: 'main',
          status: 'active',
          manager: 'Ahmed Admin',
          capacity: 10000,
          currentOccupancy: 7500,
          address: {
            line1: 'Zone Industrielle Sidi Bernoussi',
            line2: 'Lot 25, Secteur A',
            city: 'Casablanca',
            postalCode: '20600',
            region: 'Casablanca-Settat',
            country: 'Maroc'
          },
          contact: {
            phone: '+212 522 123 456',
            email: 'entrepot.casa@erpmaroc.com',
            fax: '+212 522 123 457'
          },
          operatingHours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '08:00', close: '12:00', closed: false },
            sunday: { open: '08:00', close: '12:00', closed: true }
          },
          zones: [
            {
              id: '1',
              name: 'Zone A - Stockage Principal',
              type: 'storage',
              capacity: 5000,
              currentStock: 3800
            },
            {
              id: '2',
              name: 'Zone B - Préparation Commandes',
              type: 'picking',
              capacity: 2000,
              currentStock: 1500
            },
            {
              id: '3',
              name: 'Zone C - Réception',
              type: 'receiving',
              capacity: 1500,
              currentStock: 1200
            }
          ],
          notes: 'Entrepôt principal avec système de gestion automatisé. Équipé de chariots élévateurs et système de sécurité 24h/24.'
        }
        
        setFormData(mockWarehouse)
      } catch (err) {
        setError('Erreur lors du chargement de l\'entrepôt')
      } finally {
        setLoading(false)
      }
    }

    loadWarehouse()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }))
  }

  const handleZoneChange = (index: number, field: string, value: any) => {
    const updatedZones = [...formData.zones]
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value
    }
    
    setFormData(prev => ({
      ...prev,
      zones: updatedZones
    }))
  }

  const addZone = () => {
    const newZone = {
      id: Date.now().toString(),
      name: '',
      type: 'storage',
      capacity: 0,
      currentStock: 0
    }
    
    setFormData(prev => ({
      ...prev,
      zones: [...prev.zones, newZone]
    }))
  }

  const removeZone = (index: number) => {
    const updatedZones = formData.zones.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      zones: updatedZones
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate API call to update warehouse
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/inventory')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'entrepôt')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.warehouseCode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">
                Chargement de l'entrepôt...
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
                Entrepôt modifié avec succès !
              </h2>
              <p className="text-green-600 mb-4">
                L'entrepôt {formData.name} a été mis à jour.
              </p>
              <p className="text-sm text-green-600">
                Redirection vers la page d'inventaire...
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
              <Button onClick={() => navigate('/inventory')}>
                Retour à l'Inventaire
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
            Modifier l'Entrepôt
          </h1>
          <p className="text-muted-foreground">
            Modifier l'entrepôt "{formData.name}"
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            Annuler
          </Button>
          <Button form="warehouse-form" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </div>

      <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-medium">Code Entrepôt</label>
                <input
                  type="text"
                  name="warehouseCode"
                  value={formData.warehouseCode}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nom de l'Entrepôt *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {warehouseTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  {warehouseStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsable</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Sélectionner un responsable</option>
                  {managers.map(manager => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Capacité (m³)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  min="0"
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
              Localisation de l'entrepôt
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
                  placeholder="Zone Industrielle Sidi Bernoussi"
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
                  placeholder="Lot 25, Secteur A"
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="+212 522 123 456"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="entrepot@erpmaroc.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fax</label>
                <input
                  type="tel"
                  name="contact.fax"
                  value={formData.contact.fax}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="+212 522 123 457"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'Ouverture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(formData.operatingHours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="font-medium capitalize">
                    {day === 'monday' ? 'Lundi' :
                     day === 'tuesday' ? 'Mardi' :
                     day === 'wednesday' ? 'Mercredi' :
                     day === 'thursday' ? 'Jeudi' :
                     day === 'friday' ? 'Vendredi' :
                     day === 'saturday' ? 'Samedi' : 'Dimanche'}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={hours.closed}
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      disabled={hours.closed}
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                        className="mr-2"
                      />
                      Fermé
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zones */}
        <Card>
          <CardHeader>
            <CardTitle>Zones de l'Entrepôt</CardTitle>
            <CardDescription>
              Organisation interne de l'entrepôt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.zones.map((zone, index) => (
              <div key={zone.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Zone {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeZone(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom de la Zone</label>
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => handleZoneChange(index, 'name', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="Zone A - Stockage"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      value={zone.type}
                      onChange={(e) => handleZoneChange(index, 'type', e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      {zoneTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Capacité (m³)</label>
                    <input
                      type="number"
                      value={zone.capacity}
                      onChange={(e) => handleZoneChange(index, 'capacity', parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock Actuel (m³)</label>
                    <input
                      type="number"
                      value={zone.currentStock}
                      onChange={(e) => handleZoneChange(index, 'currentStock', parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addZone} className="w-full">
              + Ajouter une Zone
            </Button>
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
          <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
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
