import { useState, type FormEvent } from 'react'
import type { CalendarEvent } from '../../../domain/calendario/CalendarEvent'
import type { Category } from '../../../domain/calendario/Category'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { MovementType } from '../../../domain/shared/MovementType'
import type { EventFormInput } from '../../../services/calendario/eventService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import { CategorySelect } from './CategorySelect'
import { FinanceLinkFields } from './FinanceLinkFields'
import styles from './EventFormDialog.module.css'

interface EventFormDialogProps {
  initialDate: Date
  editingEvent: CalendarEvent | null
  categories: Category[]
  financeCategories: FinanceCategory[]
  onClose: () => void
  onSubmit: (input: EventFormInput) => Promise<void>
  onDelete: (event: CalendarEvent) => Promise<void>
}

function categoryName(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? ''
}

function financeCategoryName(financeCategories: FinanceCategory[], id: string | null): string {
  return financeCategories.find((c) => c.id === id)?.name ?? ''
}

export function EventFormDialog({
  initialDate,
  editingEvent,
  categories,
  financeCategories,
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
  const [financeEnabled, setFinanceEnabled] = useState(editingEvent?.amount != null)
  const [financeType, setFinanceType] = useState<MovementType>(editingEvent?.movementType ?? 'gasto')
  const [financeAmount, setFinanceAmount] = useState(
    editingEvent?.amount != null ? String(editingEvent.amount) : '',
  )
  const [financeCategory, setFinanceCategory] = useState(
    financeCategoryName(financeCategories, editingEvent?.financeCategoryId ?? null),
  )
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
        amount: financeEnabled ? Number(financeAmount) : null,
        movementType: financeEnabled ? financeType : null,
        financeCategoryName: financeEnabled ? financeCategory : null,
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
            <CategorySelect categories={categories} value={category} onChange={setCategory} />
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

          <FinanceLinkFields
            financeCategories={financeCategories}
            enabled={financeEnabled}
            onEnabledChange={setFinanceEnabled}
            type={financeType}
            onTypeChange={setFinanceType}
            amount={financeAmount}
            onAmountChange={setFinanceAmount}
            categoryName={financeCategory}
            onCategoryNameChange={setFinanceCategory}
            datalistId="event-finance-category-options"
          />

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
