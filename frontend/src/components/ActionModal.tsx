import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  onConfirm?: () => void
  confirmText?: string
  confirmVariant?: 'default' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Confirmer',
  confirmVariant = 'default',
  size = 'md'
}: ActionModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {children}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              {onConfirm && (
                <Button variant={confirmVariant} onClick={onConfirm}>
                  {confirmText}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Payment Recording Modal
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceNumber: string
  remainingAmount: number
  onPaymentRecord: (payment: PaymentData) => void
}

interface PaymentData {
  amount: number
  method: string
  reference: string
  date: string
  notes: string
}

export function PaymentModal({ isOpen, onClose, invoiceNumber, remainingAmount, onPaymentRecord }: PaymentModalProps) {
  const { showSuccess } = useToast()
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: remainingAmount,
    method: 'bank_transfer',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const handleSubmit = () => {
    onPaymentRecord(paymentData)
    showSuccess(
      'Paiement enregistré',
      `Paiement de ${paymentData.amount} MAD enregistré avec succès pour la facture ${invoiceNumber}`
    )
    onClose()
  }

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Enregistrer un Paiement"
      description={`Facture ${invoiceNumber} - Montant restant: ${remainingAmount.toLocaleString()} MAD`}
      onConfirm={handleSubmit}
      confirmText="Enregistrer le Paiement"
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Montant (MAD) *</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded-md"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              max={remainingAmount}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Méthode de Paiement *</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={paymentData.method}
              onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
            >
              <option value="bank_transfer">Virement bancaire</option>
              <option value="cash">Espèces</option>
              <option value="check">Chèque</option>
              <option value="card">Carte bancaire</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Référence</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Ex: CHQ-2025-001"
              value={paymentData.reference}
              onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date de Paiement *</label>
            <input
              type="date"
              className="w-full mt-1 p-2 border rounded-md"
              value={paymentData.date}
              onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md"
            rows={3}
            placeholder="Notes optionnelles sur le paiement..."
            value={paymentData.notes}
            onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
    </ActionModal>
  )
}

// Duplicate Modal
interface DuplicateModalProps {
  isOpen: boolean
  onClose: () => void
  itemType: string
  itemNumber: string
  onDuplicate: (options: DuplicateOptions) => void
}

interface DuplicateOptions {
  newNumber: string
  copyItems: boolean
  copyNotes: boolean
  newDate: string
}

export function DuplicateModal({ isOpen, onClose, itemType, itemNumber, onDuplicate }: DuplicateModalProps) {
  const { showSuccess } = useToast()
  const [options, setOptions] = useState<DuplicateOptions>({
    newNumber: '',
    copyItems: true,
    copyNotes: false,
    newDate: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = () => {
    onDuplicate(options)
    showSuccess(
      `${itemType} dupliqué`,
      `${itemType} ${options.newNumber} créé avec succès à partir de ${itemNumber}`
    )
    onClose()
  }

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dupliquer ${itemType}`}
      description={`Créer une copie de ${itemNumber}`}
      onConfirm={handleSubmit}
      confirmText="Dupliquer"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nouveau Numéro *</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md"
            placeholder={`Ex: ${itemNumber}-COPY`}
            value={options.newNumber}
            onChange={(e) => setOptions(prev => ({ ...prev, newNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nouvelle Date</label>
          <input
            type="date"
            className="w-full mt-1 p-2 border rounded-md"
            value={options.newDate}
            onChange={(e) => setOptions(prev => ({ ...prev, newDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Options de Copie</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.copyItems}
                onChange={(e) => setOptions(prev => ({ ...prev, copyItems: e.target.checked }))}
              />
              <span className="text-sm">Copier les articles/lignes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.copyNotes}
                onChange={(e) => setOptions(prev => ({ ...prev, copyNotes: e.target.checked }))}
              />
              <span className="text-sm">Copier les notes</span>
            </label>
          </div>
        </div>
      </div>
    </ActionModal>
  )
}

// Print Modal
interface PrintModalProps {
  isOpen: boolean
  onClose: () => void
  itemType: string
  itemNumber: string
  onPrint: (options: PrintOptions) => void
}

interface PrintOptions {
  format: string
  copies: number
  includeDetails: boolean
  language: string
}

export function PrintModal({ isOpen, onClose, itemType, itemNumber, onPrint }: PrintModalProps) {
  const { showSuccess } = useToast()
  const [options, setOptions] = useState<PrintOptions>({
    format: 'pdf',
    copies: 1,
    includeDetails: true,
    language: 'fr'
  })

  const handleSubmit = () => {
    onPrint(options)
    showSuccess(
      'Document imprimé',
      `${itemType} ${itemNumber} - ${options.copies} copie(s) en format ${options.format.toUpperCase()}`
    )
    onClose()
  }

  return (
    <ActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Imprimer ${itemType}`}
      description={`${itemNumber}`}
      onConfirm={handleSubmit}
      confirmText="Imprimer"
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Format</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={options.format}
              onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="word">Word</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Nombre de Copies</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded-md"
              min="1"
              max="10"
              value={options.copies}
              onChange={(e) => setOptions(prev => ({ ...prev, copies: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Langue</label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={options.language}
              onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeDetails}
              onChange={(e) => setOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
            />
            <span className="text-sm">Inclure les détails complets</span>
          </label>
        </div>
      </div>
    </ActionModal>
  )
}
