import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Invoicing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [invoices] = useState([
    {
      id: 1,
      number: 'FAC-2025-001',
      client: 'Société ABC SARL',
      date: '2025-01-15',
      amount: 12000,
      tva: 2400,
      total: 14400,
      status: 'paid',
      ice: '123456789012345'
    },
    {
      id: 2,
      number: 'FAC-2025-002',
      client: 'Entreprise XYZ SA',
      date: '2025-01-16',
      amount: 8500,
      tva: 1700,
      total: 10200,
      status: 'pending',
      ice: '987654321098765'
    },
    {
      id: 3,
      number: 'FAC-2025-003',
      client: 'SARL Moderne',
      date: '2025-01-17',
      amount: 5600,
      tva: 1120,
      total: 6720,
      status: 'overdue',
      ice: '456789123456789'
    }
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Payée</Badge>
      case 'pending':
        return <Badge variant="warning">En Attente</Badge>
      case 'overdue':
        return <Badge variant="destructive">En Retard</Badge>
      default:
        return <Badge variant="outline">Brouillon</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('modules.invoicing')}
          </h1>
          <p className="text-muted-foreground">
            {t('modules.invoicingDescription')}
          </p>
        </div>
        <Button onClick={() => navigate('/invoicing/create')}>
          <span className="mr-2">➕</span>
          Nouvelle Facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">156</div>
            <p className="text-sm text-muted-foreground">Total Factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,234,567 MAD</div>
            <p className="text-sm text-muted-foreground">CA Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">246,913 MAD</div>
            <p className="text-sm text-muted-foreground">TVA Collectée</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">En Retard</p>
          </CardContent>
        </Card>
      </div>

      {/* TVA Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé TVA - Janvier 2025</CardTitle>
          <CardDescription>
            Conformité fiscale marocaine - Déclaration TVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">45,678 MAD</div>
              <p className="text-sm text-muted-foreground">TVA 20%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">12,345 MAD</div>
              <p className="text-sm text-muted-foreground">TVA 14%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">8,901 MAD</div>
              <p className="text-sm text-muted-foreground">TVA 10%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">2,345 MAD</div>
              <p className="text-sm text-muted-foreground">RAS/TVA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures</CardTitle>
          <CardDescription>
            Gérez vos factures de vente avec conformité TVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xl">🧾</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{invoice.number}</h3>
                    <p className="text-sm text-muted-foreground">{invoice.client}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">ICE: {invoice.ice}</Badge>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{invoice.total.toLocaleString()} MAD</div>
                  <div className="text-sm text-muted-foreground">
                    HT: {invoice.amount.toLocaleString()} MAD | TVA: {invoice.tva.toLocaleString()} MAD
                  </div>
                  <div className="text-xs text-muted-foreground">{invoice.date}</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/invoicing/detail/${invoice.id}`)}>
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/invoicing/edit/${invoice.id}`)}>
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Invoice Form */}
      <Card>
        <CardHeader>
          <CardTitle>Créer une Nouvelle Facture</CardTitle>
          <CardDescription>
            Formulaire rapide avec calcul automatique de la TVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Client</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Société ABC SARL</option>
                <option>Entreprise XYZ SA</option>
                <option>SARL Moderne</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date de Facture</label>
              <input 
                type="date" 
                className="w-full mt-1 p-2 border rounded-md"
                defaultValue="2025-01-18"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Montant HT (MAD)</label>
              <input 
                type="number" 
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Taux TVA</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="20">20% (Standard)</option>
                <option value="14">14% (Réduit)</option>
                <option value="10">10% (Base)</option>
                <option value="7">7% (Essentiel)</option>
                <option value="0">0% (Exonéré)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Conditions de Paiement</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Comptant</option>
                <option>30 jours</option>
                <option>60 jours</option>
                <option>90 jours</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">RAS/TVA Applicable</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option value="0">Non</option>
                <option value="10">Oui - 10%</option>
                <option value="5">Oui - 5%</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button>Créer Facture</Button>
            <Button variant="outline">Aperçu PDF</Button>
            <Button variant="outline">Brouillon</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
