import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function CreateUser() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Account Settings
    password: '',
    confirmPassword: '',
    language: 'fr',
    timezone: 'Africa/Casablanca',
    
    // Permissions
    isActive: true,
    isVerified: false,
    isSuperuser: false,
    
    // Company Access
    companies: [] as string[],
    roles: [] as string[],
    
    // Additional Information
    department: '',
    position: '',
    manager: '',
    notes: ''
  })

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
  ]

  const timezones = [
    { value: 'Africa/Casablanca', label: 'Maroc (GMT+1)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ]

  const availableCompanies = [
    { id: '1', name: 'TechnoMaroc SARL' },
    { id: '2', name: 'Atlas Distribution' }
  ]

  const availableRoles = [
    { id: '1', name: 'Administrator', description: 'Accès complet au système' },
    { id: '2', name: 'Manager', description: 'Gestion des équipes et processus' },
    { id: '3', name: 'Sales Manager', description: 'Gestion des ventes' },
    { id: '4', name: 'Accountant', description: 'Gestion comptable' },
    { id: '5', name: 'Inventory Manager', description: 'Gestion des stocks' },
    { id: '6', name: 'User', description: 'Utilisateur standard' }
  ]

  const departments = [
    'Direction',
    'Comptabilité',
    'Ventes',
    'Achats',
    'Logistique',
    'Ressources Humaines',
    'IT',
    'Marketing',
    'Production',
    'Autre'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.includes(companyId)
        ? prev.companies.filter(id => id !== companyId)
        : [...prev.companies, companyId]
    }))
  }

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }))
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.username || !formData.email || !formData.firstName || !formData.lastName) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Veuillez saisir une adresse email valide')
      }

      if (!validatePassword(formData.password)) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      if (formData.companies.length === 0) {
        throw new Error('Veuillez sélectionner au moins une entreprise')
      }

      if (formData.roles.length === 0) {
        throw new Error('Veuillez sélectionner au moins un rôle')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(true)
      setTimeout(() => {
        navigate('/users')
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
                Utilisateur créé avec succès !
              </h2>
              <p className="text-green-600">
                Le compte de "{formData.firstName} {formData.lastName}" a été créé.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Redirection vers la liste des utilisateurs...
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
            Créer un Nouvel Utilisateur
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau compte utilisateur au système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/users')}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création...' : 'Créer l\'Utilisateur'}
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
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Informations de base de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: Ahmed"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: Bennani"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nom d'utilisateur *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Ex: ahmed.bennani"
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
                  placeholder="ahmed@entreprise.ma"
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
                  placeholder="+212 661 123 456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du Compte</CardTitle>
            <CardDescription>
              Configuration de connexion et préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Mot de passe *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Minimum 8 caractères"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Répéter le mot de passe"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Langue</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Fuseau Horaire</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
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
                <label className="text-sm font-medium">Compte actif</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Email vérifié</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isSuperuser"
                  checked={formData.isSuperuser}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <label className="text-sm font-medium">Super utilisateur</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Access */}
        <Card>
          <CardHeader>
            <CardTitle>Accès aux Entreprises</CardTitle>
            <CardDescription>
              Sélectionner les entreprises auxquelles l'utilisateur aura accès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCompanies.map(company => (
                <div key={company.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.companies.includes(company.id)}
                    onChange={() => handleCompanyChange(company.id)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium">{company.name}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Rôles et Permissions</CardTitle>
            <CardDescription>
              Attribuer des rôles à l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRoles.map(role => (
                <div key={role.id} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.id)}
                      onChange={() => handleRoleChange(role.id)}
                      className="rounded"
                    />
                    <label className="text-sm font-medium">{role.name}</label>
                  </div>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer l\'Utilisateur'}
          </Button>
        </div>
      </form>
    </div>
  )
}
