import { useState, type FormEvent } from 'react'
import type { Service, ServiceFrequency } from '../../../domain/servicios/Service'
import type { ServicePeriod } from '../../../domain/servicios/ServicePeriod'
import type { ServiceFormInput } from '../../../services/servicios/serviceService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './ServiceFormDialog.module.css'

interface ServiceFormDialogProps {
  editingService: Service | null
  editingPeriod: ServicePeriod | null
  onClose: () => void
  onSubmit: (input: ServiceFormInput) => Promise<void>
  onDelete: (service: Service) => Promise<void>
}

const FRECUENCIAS: { value: ServiceFrequency; label: string }[] = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'anual', label: 'Anual' },
  { value: 'personalizada', label: 'Personalizada' },
]

export function ServiceFormDialog({
  editingService,
  editingPeriod,
  onClose,
  onSubmit,
  onDelete,
}: ServiceFormDialogProps) {
  const [name, setName] = useState(editingService?.name ?? '')
  const [amount, setAmount] = useState(
    editingService ? String(editingPeriod?.amount ?? editingService.amount) : '',
  )
  const [dueDate, setDueDate] = useState(
    editingPeriod?.dueDate ?? editingService?.firstDueDate ?? toISODate(new Date()),
  )
  const [frequency, setFrequency] = useState<ServiceFrequency>(editingService?.frequency ?? 'mensual')
  const [customIntervalDays, setCustomIntervalDays] = useState(
    editingService?.customIntervalDays != null ? String(editingService.customIntervalDays) : '',
  )
  const [notes, setNotes] = useState(editingService?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name,
        amount: Number(amount),
        firstDueDate: dueDate,
        frequency,
        customIntervalDays: frequency === 'personalizada' ? Number(customIntervalDays) : null,
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
    if (!editingService) return
    if (!confirm(`¿Eliminar el servicio "${editingService.name}"?`)) return
    setSubmitting(true)
    try {
      await onDelete(editingService)
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
          <h2 className={styles.title}>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          <label className={styles.field}>
            <span>Importe</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>{editingService ? 'Próximo vencimiento' : 'Primer vencimiento'}</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </label>

          <div className={styles.field}>
            <span>Frecuencia</span>
            <div className={styles.freqTabs}>
              {FRECUENCIAS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={f.value === frequency ? styles.freqTabActive : styles.freqTab}
                  onClick={() => setFrequency(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {frequency === 'personalizada' && (
            <label className={styles.field}>
              <span>Se repite cada (días)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(e.target.value)}
                required
              />
            </label>
          )}

          <label className={styles.field}>
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" rows={3} />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {editingService && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={submitting}
              >
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
