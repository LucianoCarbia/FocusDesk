import { useState, type FormEvent } from 'react'
import type { ServicioMensual } from '../../../domain/servicios/ServicioMensual'
import type { Currency } from '../../../domain/shared/Currency'
import type { ServicioMensualFormInput } from '../../../services/servicios/servicioMensualService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './ServiceFormDialog.module.css'

const WEEKDAYS = [
  { value: 0, label: 'Lun' },
  { value: 1, label: 'Mar' },
  { value: 2, label: 'Mié' },
  { value: 3, label: 'Jue' },
  { value: 4, label: 'Vie' },
  { value: 5, label: 'Sáb' },
  { value: 6, label: 'Dom' },
]

const MONEDAS: { value: Currency; label: string }[] = [
  { value: 'ARS', label: 'Pesos' },
  { value: 'USD', label: 'Dólares' },
]

interface ServicioMensualFormDialogProps {
  editingServicio: ServicioMensual | null
  onClose: () => void
  onSubmit: (input: ServicioMensualFormInput) => Promise<void>
  onDelete: (servicio: ServicioMensual) => Promise<void>
}

export function ServicioMensualFormDialog({
  editingServicio,
  onClose,
  onSubmit,
  onDelete,
}: ServicioMensualFormDialogProps) {
  const [name, setName] = useState(editingServicio?.name ?? '')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(editingServicio?.daysOfWeek ?? [])
  const [currency, setCurrency] = useState<Currency>(editingServicio?.currency ?? 'ARS')
  const [amountPerOccurrence, setAmountPerOccurrence] = useState(
    editingServicio ? String(editingServicio.amountPerOccurrence) : '',
  )
  const [startDate, setStartDate] = useState(editingServicio?.startDate ?? toISODate(new Date()))
  const [active, setActive] = useState(editingServicio?.active ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDay(day: number) {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort(),
    )
  }

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name,
        daysOfWeek,
        amountPerOccurrence: Number(amountPerOccurrence),
        currency,
        startDate,
        active,
      })
      onClose()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editingServicio) return
    if (!confirm(`¿Eliminar el servicio mensual "${editingServicio.name}"?`)) return
    setSubmitting(true)
    try {
      await onDelete(editingServicio)
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
          <h2 className={styles.title}>{editingServicio ? 'Editar servicio mensual' : 'Nuevo servicio mensual'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          <div className={styles.field}>
            <span>Días de recurrencia</span>
            <div className={styles.currencyTabs} style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={daysOfWeek.includes(day.value) ? styles.freqTabActive : styles.freqTab}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span>Moneda</span>
            <div className={styles.currencyTabs}>
              {MONEDAS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={m.value === currency ? styles.freqTabActive : styles.freqTab}
                  onClick={() => setCurrency(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span>Importe por turno {currency === 'USD' ? '(USD)' : '(ARS)'}</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amountPerOccurrence}
              onChange={(e) => setAmountPerOccurrence(e.target.value)}
              required
            />
            <p className={styles.hint}>El importe mensual se calcula solo, contando las ocurrencias del mes.</p>
          </label>

          <label className={styles.field}>
            <span>Fecha de inicio</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>

          <label className={styles.field} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>Activo</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {editingServicio && (
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
