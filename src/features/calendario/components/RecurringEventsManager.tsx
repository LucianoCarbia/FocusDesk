import { useCallback, useEffect, useState } from 'react'
import type { Category } from '../../../domain/calendario/Category'
import type { RecurringEvent } from '../../../domain/calendario/RecurringEvent'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import { CloseIcon, PencilIcon, PlusIcon, TrashIcon } from '../../../components/icons/Icons'
import {
  actualizarHorarioFijo,
  crearHorarioFijo,
  eliminarHorarioFijo,
  listarHorariosFijos,
} from '../../../services/calendario/recurringEventService'
import { toErrorMessage } from '../../../utils/errors'
import { RecurringEventFormDialog } from './RecurringEventFormDialog'
import { RecurringEventPausesDialog } from './RecurringEventPausesDialog'
import styles from './RecurringEventsManager.module.css'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface RecurringEventsManagerProps {
  categories: Category[]
  financeCategories: FinanceCategory[]
  onClose: () => void
  onChange: () => void
}

function formatDays(daysOfWeek: number[]): string {
  return WEEKDAY_LABELS.map((label, i) => (daysOfWeek.includes(i) ? label : '·')).join(' ')
}

function formatRange(startDate: string, endDate: string | null): string {
  return endDate ? `${startDate} → ${endDate}` : `desde ${startDate}, sin fin`
}

export function RecurringEventsManager({
  categories,
  financeCategories,
  onClose,
  onChange,
}: RecurringEventsManagerProps) {
  const [items, setItems] = useState<RecurringEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<RecurringEvent | null>(null)
  const [pausesFor, setPausesFor] = useState<RecurringEvent | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listarHorariosFijos())
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargar()
    })
  }, [cargar])

  function openNew() {
    setEditingEvent(null)
    setFormOpen(true)
  }

  function openEdit(event: RecurringEvent) {
    setEditingEvent(event)
    setFormOpen(true)
  }

  async function handleDelete(event: RecurringEvent) {
    if (!confirm(`¿Eliminar el horario fijo "${event.title}"? Se van a borrar también sus pausas.`)) return
    try {
      await eliminarHorarioFijo(event.id)
      await cargar()
      onChange()
    } catch (err) {
      setError(toErrorMessage(err))
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Horarios fijos</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        <button type="button" className={styles.newButton} onClick={openNew}>
          <PlusIcon /> Nuevo horario fijo
        </button>

        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.hint}>Cargando…</p>}
        {!loading && items.length === 0 && <p className={styles.hint}>Todavía no tenés horarios fijos.</p>}

        <div className={styles.list}>
          {items.map((event) => {
            const category = categories.find((c) => c.id === event.categoryId)
            return (
              <div key={event.id} className={styles.item}>
                <span className={styles.itemBar} style={{ background: category?.color }} />
                <div className={styles.itemBody}>
                  <span className={styles.itemTitle}>{event.title}</span>
                  <span className={styles.itemMeta}>{formatDays(event.daysOfWeek)}</span>
                  {(event.startTime || event.endTime) && (
                    <span className={styles.itemMeta}>
                      {event.startTime}
                      {event.endTime ? ` - ${event.endTime}` : ''}
                    </span>
                  )}
                  <span className={styles.itemMeta}>{formatRange(event.startDate, event.endDate)}</span>
                </div>
                <div className={styles.itemActions}>
                  <button type="button" onClick={() => setPausesFor(event)} className={styles.pausesButton}>
                    Pausas
                  </button>
                  <button type="button" onClick={() => openEdit(event)} aria-label="Editar horario fijo">
                    <PencilIcon />
                  </button>
                  <button type="button" onClick={() => handleDelete(event)} aria-label="Eliminar horario fijo">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {formOpen && (
        <RecurringEventFormDialog
          key={editingEvent ? editingEvent.id : 'new'}
          initialDate={new Date()}
          editingEvent={editingEvent}
          categories={categories}
          financeCategories={financeCategories}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            if (editingEvent) {
              await actualizarHorarioFijo(editingEvent.id, input)
            } else {
              await crearHorarioFijo(input)
            }
            await cargar()
            onChange()
          }}
        />
      )}

      {pausesFor && (
        <RecurringEventPausesDialog
          recurringEvent={pausesFor}
          onClose={() => setPausesFor(null)}
          onChange={onChange}
        />
      )}
    </div>
  )
}
