import { useState, type FormEvent } from 'react'
import type { SavingsMovement, SavingsMovementKind } from '../../../domain/ahorros/SavingsMovement'
import type { SavingsMovementFormInput } from '../../../services/ahorros/savingsMovementService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { formatCurrency } from '../../../utils/currency'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './SavingsMovementFormDialog.module.css'

interface SavingsMovementFormDialogProps {
  editingMovement: SavingsMovement | null
  onClose: () => void
  onSubmit: (input: SavingsMovementFormInput) => Promise<void>
  onDelete: (movement: SavingsMovement) => Promise<void>
}

const KINDS: { value: SavingsMovementKind; label: string }[] = [
  { value: 'compra', label: 'Comprar dólares' },
  { value: 'venta', label: 'Vender dólares' },
]

export function SavingsMovementFormDialog({
  editingMovement,
  onClose,
  onSubmit,
  onDelete,
}: SavingsMovementFormDialogProps) {
  const [kind, setKind] = useState<SavingsMovementKind>(editingMovement?.kind ?? 'compra')
  const [date, setDate] = useState(editingMovement?.date ?? toISODate(new Date()))
  const [usdAmount, setUsdAmount] = useState(editingMovement ? String(editingMovement.usdAmount) : '')
  const [arsAmount, setArsAmount] = useState(editingMovement ? String(editingMovement.arsAmount) : '')
  const [notes, setNotes] = useState(editingMovement?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usd = Number(usdAmount)
  const ars = Number(arsAmount)
  const cotizacion = usd > 0 && ars > 0 ? ars / usd : null

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        date,
        kind,
        usdAmount: usd,
        arsAmount: ars,
        notes: notes || null,
      })
      onClose()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editingMovement) return
    if (!confirm('¿Eliminar este movimiento de ahorro?')) return
    setSubmitting(true)
    try {
      await onDelete(editingMovement)
      onClose()
    } catch (err) {
      setError(toErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{editingMovement ? 'Editar movimiento' : 'Nuevo movimiento de ahorro'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.kindTabs}>
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                className={k.value === kind ? styles.kindTabActive : styles.kindTab}
                onClick={() => setKind(k.value)}
              >
                {k.label}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label className={styles.field}>
            <span>Dólares</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Pesos {kind === 'compra' ? 'utilizados' : 'obtenidos'}</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={arsAmount}
              onChange={(e) => setArsAmount(e.target.value)}
              required
            />
          </label>

          {cotizacion != null && (
            <p className={styles.cotizacion}>Cotización efectiva: {formatCurrency(cotizacion)} por dólar</p>
          )}

          <label className={styles.field}>
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" rows={2} />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {editingMovement && (
              <button type="button" className={styles.deleteButton} onClick={handleDelete} disabled={submitting}>
                <TrashIcon /> Eliminar
              </button>
            )}
            <button type="submit" className={styles.saveButton} disabled={submitting}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
