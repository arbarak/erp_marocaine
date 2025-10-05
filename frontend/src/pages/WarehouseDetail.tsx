import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function WarehouseDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [warehouse, setWarehouse] = useState({
    id: '',
    warehouseCode: '',
    name: '',
    type: '',
    status: '',
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
    notes: '',
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  })

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
          id: id || '1',
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
          notes: 'Entrepôt principal avec système de gestion automatisé. Équipé de chariots élévateurs et système de sécurité 24h/24.',
          createdAt: '2025-01-15T08:30:00Z',
          updatedAt: '2025-01-18T16:45:00Z',
          createdBy: 'Ahmed Admin'
        }
        
        setWarehouse(mockWarehouse)
      } catch (err) {
        setError('Erreur lors du chargement de l\'entrepôt')
      } finally {
        setLoading(false)
      }
    }

    loadWarehouse()
  }, [id])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Principal'
      case 'secondary': return 'Secondaire'
      case 'transit': return 'Transit'
      case 'quarantine': return 'Quarantaine'
      case 'returns': return 'Retours'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'maintenance': return 'Maintenance'
      case 'closed': return 'Fermé'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'storage': return 'Stockage'
      case 'picking': return 'Préparation'
      case 'receiving': return 'Réception'
      case 'shipping': return 'Expédition'
      case 'quality': return 'Contrôle Qualité'
      default: return type
    }
  }

  const getOccupancyPercentage = () => {
    if (warehouse.capacity === 0) return 0
    return (warehouse.currentOccupancy / warehouse.capacity) * 100
  }

  const getZoneOccupancyPercentage = (zone: any) => {
    if (zone.capacity === 0) return 0
    return (zone.currentStock / zone.capacity) * 100
  }

  const getDayLabel = (day: string) => {
    switch (day) {
      case 'monday': return 'Lundi'
      case 'tuesday': return 'Mardi'
      case 'wednesday': return 'Mercredi'
      case 'thursday': return 'Jeudi'
      case 'friday': return 'Vendredi'
      case 'saturday': return 'Samedi'
      case 'sunday': return 'Dimanche'
      default: return day
    }
  }

  if (loading) {
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
            {warehouse.name}
          </h1>
          <p className="text-muted-foreground">
            Entrepôt • {warehouse.warehouseCode}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            Retour à l'Inventaire
          </Button>
          <Button onClick={() => navigate(`/inventory/warehouses/edit/${warehouse.id}`)}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'Entrepôt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code Entrepôt</label>
                  <p className="text-sm font-mono">{warehouse.warehouseCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getTypeLabel(warehouse.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Responsable</label>
                  <p className="text-sm">{warehouse.manager}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capacité Totale</label>
                  <p className="text-sm">{warehouse.capacity.toLocaleString()} m³</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Occupation Actuelle</label>
                  <p className="text-sm">{warehouse.currentOccupancy.toLocaleString()} m³</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Taux d'Occupation</label>
                  <p className="text-sm">{getOccupancyPercentage().toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(warehouse.status)}>
                  {getStatusLabel(warehouse.status)}
                </Badge>
                <Badge variant="outline">
                  {warehouse.zones.length} zone{warehouse.zones.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{warehouse.address.line1}</p>
                {warehouse.address.line2 && (
                  <p className="text-sm">{warehouse.address.line2}</p>
                )}
                <p className="text-sm">
                  {warehouse.address.postalCode} {warehouse.address.city}
                </p>
                <p className="text-sm">{warehouse.address.region}</p>
                <p className="text-sm font-medium">{warehouse.address.country}</p>
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
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-sm">{warehouse.contact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{warehouse.contact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fax</label>
                  <p className="text-sm">{warehouse.contact.fax}</p>
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
              <div className="space-y-3">
                {Object.entries(warehouse.operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium">{getDayLabel(day)}</span>
                    <span className="text-sm">
                      {hours.closed ? (
                        <Badge variant="outline" className="text-red-600">Fermé</Badge>
                      ) : (
                        `${hours.open} - ${hours.close}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Zones */}
          <Card>
            <CardHeader>
              <CardTitle>Zones de l'Entrepôt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {warehouse.zones.map((zone, index) => (
                  <div key={zone.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{zone.name}</h4>
                        <p className="text-sm text-muted-foreground">{getZoneTypeLabel(zone.type)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{zone.currentStock.toLocaleString()} m³</div>
                        <p className="text-sm text-muted-foreground">sur {zone.capacity.toLocaleString()} m³</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taux d'occupation</span>
                        <span className="font-medium">{getZoneOccupancyPercentage(zone).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getZoneOccupancyPercentage(zone) > 90 ? 'bg-red-600' :
                            getZoneOccupancyPercentage(zone) > 75 ? 'bg-orange-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(getZoneOccupancyPercentage(zone), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {warehouse.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{warehouse.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Capacity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la Capacité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {getOccupancyPercentage().toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Taux d'occupation</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    getOccupancyPercentage() > 90 ? 'bg-red-600' :
                    getOccupancyPercentage() > 75 ? 'bg-orange-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(getOccupancyPercentage(), 100)}%` }}
                ></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Capacité totale</span>
                  <span className="text-sm font-medium">{warehouse.capacity.toLocaleString()} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Occupation actuelle</span>
                  <span className="text-sm font-medium">{warehouse.currentOccupancy.toLocaleString()} m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Espace disponible</span>
                  <span className="text-sm font-medium text-green-600">
                    {(warehouse.capacity - warehouse.currentOccupancy).toLocaleString()} m³
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warehouse Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de l'Entrepôt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`${getStatusColor(warehouse.status)} text-lg px-4 py-2`}>
                  {getStatusLabel(warehouse.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">{getTypeLabel(warehouse.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Zones</span>
                  <span className="text-sm font-medium">{warehouse.zones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Responsable</span>
                  <span className="text-sm font-medium">{warehouse.manager}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate(`/inventory/movements/create?warehouse=${warehouse.id}`)}>
                📦 Nouveau Mouvement
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/inventory/warehouses/report/${warehouse.id}`)}>
                📊 Rapport d'Inventaire
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/inventory/warehouses/optimize/${warehouse.id}`)}>
                🔧 Optimiser Zones
              </Button>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                🖨️ Imprimer
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé le</span>
                <span className="text-sm">{new Date(warehouse.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <span className="text-sm">{new Date(warehouse.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Créé par</span>
                <span className="text-sm">{warehouse.createdBy}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
