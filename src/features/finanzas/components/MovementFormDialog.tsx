import { useMemo, useState, type FormEvent } from 'react'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { Movement, MovementType } from '../../../domain/finanzas/Movement'
import type { MovementFormInput } from '../../../services/finanzas/movementService'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './MovementFormDialog.module.css'

interface MovementFormDialogProps {
  initialDate: Date
  editingMovement: Movement | null
  categories: FinanceCategory[]
  onClose: () => void
  onSubmit: (input: MovementFormInput) => Promise<void>
  onDelete: (movement: Movement) => Promise<void>
}

const TIPOS: { value: MovementType; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto', label: 'Gasto' },
  { value: 'ahorro', label: 'Ahorro' },
]

function categoryName(categories: FinanceCategory[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? ''
}

export function MovementFormDialog({
  initialDate,
  editingMovement,
  categories,
  onClose,
  onSubmit,
  onDelete,
}: MovementFormDialogProps) {
  const [type, setType] = useState<MovementType>(editingMovement?.type ?? 'gasto')
  const [title, setTitle] = useState(editingMovement?.title ?? '')
  const [amount, setAmount] = useState(editingMovement ? String(editingMovement.amount) : '')
  const [category, setCategory] = useState(
    editingMovement ? categoryName(categories, editingMovement.categoryId) : '',
  )
  const [date, setDate] = useState(editingMovement?.date ?? toISODate(initialDate))
  const [notes, setNotes] = useState(editingMovement?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoriasDelTipo = useMemo(() => categories.filter((c) => c.type === type), [categories, type])

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        type,
        title,
        amount: Number(amount),
        categoryName: category,
        date,
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
    if (!confirm(`¿Eliminar "${editingMovement.title}"?`)) return
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
          <h2 className={styles.title}>{editingMovement ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.typeTabs}>
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={t.value === type ? styles.typeTabActive : styles.typeTab}
                onClick={() => {
                  setType(t.value)
                  setCategory('')
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span>Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </label>

          <label className={styles.field}>
            <span>Monto</span>
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
            <span>Categoría</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="finance-category-options"
              placeholder="Elegí una o escribí una nueva"
              required
            />
            <datalist id="finance-category-options">
              {categoriasDelTipo.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>

          <label className={styles.field}>
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label className={styles.field}>
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" rows={3} />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            {editingMovement && (
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
