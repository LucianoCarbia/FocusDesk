import { useState, type FormEvent } from 'react'
import type { CalendarEvent } from '../../../domain/calendario/CalendarEvent'
import type { Category } from '../../../domain/calendario/Category'
import type { EventFormInput } from '../../../services/calendario/eventService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './EventFormDialog.module.css'

interface EventFormDialogProps {
  initialDate: Date
  editingEvent: CalendarEvent | null
  categories: Category[]
  onClose: () => void
  onSubmit: (input: EventFormInput) => Promise<void>
  onDelete: (event: CalendarEvent) => Promise<void>
}

function categoryName(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? ''
}

export function EventFormDialog({
  initialDate,
  editingEvent,
  categories,
  onClose,
  onSubmit,
  onDelete,
}: EventFormDialogProps) {
  const [title, setTitle] = useState(editingEvent?.title ?? '')
  const [category, setCategory] = useState(
    editingEvent ? categoryName(categories, editingEvent.categoryId) : '',
  )
  const [date, setDate] = useState(editingEvent?.date ?? toISODate(initialDate))
  const [startTime, setStartTime] = useState(editingEvent?.startTime ?? '')
  const [endTime, setEndTime] = useState(editingEvent?.endTime ?? '')
  const [endTimeUnknown, setEndTimeUnknown] = useState(Boolean(editingEvent) && !editingEvent?.endTime)
  const [location, setLocation] = useState(editingEvent?.location ?? '')
  const [notes, setNotes] = useState(editingEvent?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        title,
        categoryName: category,
        date,
        startTime: startTime || null,
        endTime: endTimeUnknown ? null : endTime || null,
        location: location || null,
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
    if (!editingEvent) return
    if (!confirm(`¿Eliminar "${editingEvent.title}"?`)) return
    setSubmitting(true)
    try {
      await onDelete(editingEvent)
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
          <h2 className={styles.title}>{editingEvent ? 'Editar evento' : 'Nuevo evento'}</h2>
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
              list="category-options"
              placeholder="Elegí una o escribí una nueva"
              required
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>

          <label className={styles.field}>
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Hora inicio</span>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Hora fin</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={endTimeUnknown}
                placeholder={endTimeUnknown ? 'No especificada' : undefined}
              />
            </label>
          </div>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={endTimeUnknown}
              onChange={(e) => {
                setEndTimeUnknown(e.target.checked)
                if (e.target.checked) setEndTime('')
              }}
            />
            <span>No sé la hora de fin</span>
          </label>

          <label className={styles.field}>
            <span>Ubicación</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Opcional" />
          </label>

          <label className={styles.field}>
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" rows={3} />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {editingEvent && (
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
