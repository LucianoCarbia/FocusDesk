import { useState, type FormEvent } from 'react'
import type { ServiceFrequency } from '../../../domain/servicios/Service'
import type { Currency } from '../../../domain/shared/Currency'
import type { ServiceFormInput } from '../../../services/servicios/serviceService'
import type { ServicioMensualFormInput } from '../../../services/servicios/servicioMensualService'
import { CloseIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './ServiceFormDialog.module.css'

type Modalidad = 'fecha_fija' | 'mensual'

const MODALIDADES: { value: Modalidad; label: string }[] = [
  { value: 'fecha_fija', label: 'Fecha fija' },
  { value: 'mensual', label: 'Mensual sin fecha fija' },
]

const FRECUENCIAS: { value: ServiceFrequency; label: string }[] = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'anual', label: 'Anual' },
  { value: 'personalizada', label: 'Personalizada' },
]

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

interface NuevoServicioDialogProps {
  onClose: () => void
  onSubmitFechaFija: (input: ServiceFormInput) => Promise<void>
  onSubmitMensual: (input: ServicioMensualFormInput) => Promise<void>
}

export function NuevoServicioDialog({ onClose, onSubmitFechaFija, onSubmitMensual }: NuevoServicioDialogProps) {
  const [modalidad, setModalidad] = useState<Modalidad>('fecha_fija')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<Currency>('ARS')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fecha fija
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(toISODate(new Date()))
  const [frequency, setFrequency] = useState<ServiceFrequency>('mensual')
  const [customIntervalDays, setCustomIntervalDays] = useState('')
  const [notes, setNotes] = useState('')

  // Mensual sin fecha fija
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])
  const [amountPerOccurrence, setAmountPerOccurrence] = useState('')
  const [startDate, setStartDate] = useState(toISODate(new Date()))
  const [active, setActive] = useState(true)

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
      if (modalidad === 'fecha_fija') {
        await onSubmitFechaFija({
          name,
          amount: Number(amount),
          currency,
          firstDueDate: dueDate,
          frequency,
          customIntervalDays: frequency === 'personalizada' ? Number(customIntervalDays) : null,
          notes: notes || null,
        })
      } else {
        await onSubmitMensual({
          name,
          daysOfWeek,
          amountPerOccurrence: Number(amountPerOccurrence),
          currency,
          startDate,
          active,
        })
      }
      onClose()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nuevo servicio</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <span>Modalidad</span>
            <div className={styles.freqTabs} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {MODALIDADES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={m.value === modalidad ? styles.freqTabActive : styles.freqTab}
                  onClick={() => setModalidad(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          {modalidad === 'mensual' && (
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
          )}

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

          {modalidad === 'fecha_fija' ? (
            <>
              <label className={styles.field}>
                <span>Importe {currency === 'USD' ? '(USD)' : '(ARS)'}</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {currency === 'USD' && <p className={styles.hint}>La cotización se pide al marcar el pago.</p>}
              </label>

              <label className={styles.field}>
                <span>Primer vencimiento</span>
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
            </>
          ) : (
            <>
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
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton} disabled={submitting}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
