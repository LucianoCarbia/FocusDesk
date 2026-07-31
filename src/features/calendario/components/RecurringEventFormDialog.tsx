import { useState, type FormEvent } from 'react'
import type { Category } from '../../../domain/calendario/Category'
import type { RecurringEvent } from '../../../domain/calendario/RecurringEvent'
import type { RecurringEventFormInput } from '../../../services/calendario/recurringEventService'
import { CloseIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './RecurringEventFormDialog.module.css'

const WEEKDAYS = [
  { value: 0, label: 'Lun' },
  { value: 1, label: 'Mar' },
  { value: 2, label: 'Mié' },
  { value: 3, label: 'Jue' },
  { value: 4, label: 'Vie' },
  { value: 5, label: 'Sáb' },
  { value: 6, label: 'Dom' },
]

interface RecurringEventFormDialogProps {
  initialDate: Date
  editingEvent: RecurringEvent | null
  categories: Category[]
  onClose: () => void
  onSubmit: (input: RecurringEventFormInput) => Promise<void>
}

function categoryName(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? ''
}

export function RecurringEventFormDialog({
  initialDate,
  editingEvent,
  categories,
  onClose,
  onSubmit,
}: RecurringEventFormDialogProps) {
  const [title, setTitle] = useState(editingEvent?.title ?? '')
  const [category, setCategory] = useState(
    editingEvent ? categoryName(categories, editingEvent.categoryId) : '',
  )
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(editingEvent?.daysOfWeek ?? [])
  const [startTime, setStartTime] = useState(editingEvent?.startTime ?? '')
  const [endTime, setEndTime] = useState(editingEvent?.endTime ?? '')
  const [location, setLocation] = useState(editingEvent?.location ?? '')
  const [notes, setNotes] = useState(editingEvent?.notes ?? '')
  const [startDate, setStartDate] = useState(editingEvent?.startDate ?? toISODate(initialDate))
  const [hasEndDate, setHasEndDate] = useState(Boolean(editingEvent?.endDate))
  const [endDate, setEndDate] = useState(editingEvent?.endDate ?? '')
  const [skipHolidays, setSkipHolidays] = useState(editingEvent?.skipHolidays ?? true)
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
        title,
        categoryName: category,
        daysOfWeek,
        startTime: startTime || null,
        endTime: endTime || null,
        location: location || null,
        notes: notes || null,
        startDate,
        endDate: hasEndDate ? endDate : null,
        skipHolidays,
      })
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
          <h2 className={styles.title}>{editingEvent ? 'Editar horario fijo' : 'Nuevo horario fijo'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </label>

          <label className={styles.field}>
            <span>Categoría</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="recurring-category-options"
              placeholder="Elegí una o escribí una nueva"
              required
            />
            <datalist id="recurring-category-options">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>

          <div className={styles.field}>
            <span>Días</span>
            <div className={styles.days}>
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={daysOfWeek.includes(day.value) ? styles.dayActive : styles.day}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Hora inicio</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Hora fin</span>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>

          <label className={styles.field}>
            <span>Ubicación</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Opcional" />
          </label>

          <label className={styles.field}>
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" rows={2} />
          </label>

          <label className={styles.field}>
            <span>Empieza</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(e) => setHasEndDate(e.target.checked)}
            />
            <span>Tiene fecha de fin</span>
          </label>

          {hasEndDate && (
            <label className={styles.field}>
              <span>Termina</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          )}

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={skipHolidays}
              onChange={(e) => setSkipHolidays(e.target.checked)}
            />
            <span>No repetir en feriados</span>
          </label>

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
