import type { Category } from '../../../domain/calendario/Category'
import { holidayName } from '../../../domain/calendario/holidays'
import type { AgendaEntry } from '../../../domain/calendario/occurrences'
import { PencilIcon, PlusIcon, RepeatIcon, TrashIcon, XCircleIcon } from '../../../components/icons/Icons'
import { formatFullDate } from '../../../utils/date'
import styles from './DayDetailPanel.module.css'

interface DayDetailPanelProps {
  selectedDate: Date
  events: AgendaEntry[]
  categories: Category[]
  onAdd: () => void
  onEdit: (event: AgendaEntry) => void
  onDelete: (event: AgendaEntry) => void
  onCancelOccurrence: (event: AgendaEntry) => void
}

export function DayDetailPanel({
  selectedDate,
  events,
  categories,
  onAdd,
  onEdit,
  onDelete,
  onCancelOccurrence,
}: DayDetailPanelProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const holiday = holidayName(selectedDate)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{formatFullDate(selectedDate)}</h2>
          <span className={styles.count}>
            {events.length} {events.length === 1 ? 'evento' : 'eventos'}
          </span>
          {holiday && <span className={styles.holiday}>Feriado: {holiday}</span>}
        </div>
        <button type="button" className={styles.addButton} onClick={onAdd} aria-label="Agregar evento">
          <PlusIcon />
        </button>
      </div>

      <div className={styles.list}>
        {events.length === 0 && <p className={styles.empty}>No hay eventos este día.</p>}

        {events.map((event) => {
          const category = categoryById.get(event.categoryId)
          const isRecurring = event.source === 'recurring'
          return (
            <div key={event.id} className={styles.item} style={{ background: `${category?.color}1a` }}>
              <span className={styles.itemBar} style={{ background: category?.color }} />
              <div className={styles.itemBody}>
                <span className={styles.itemTitle}>
                  {isRecurring && <RepeatIcon />}
                  {event.title}
                </span>
                {(event.startTime || event.endTime) && (
                  <span className={styles.itemMeta}>
                    {event.startTime}
                    {event.endTime ? ` - ${event.endTime}` : ''}
                  </span>
                )}
                {event.location && <span className={styles.itemMeta}>{event.location}</span>}
              </div>
              <div className={styles.itemActions}>
                {isRecurring ? (
                  <button type="button" onClick={() => onCancelOccurrence(event)} aria-label="Cancelar este día">
                    <XCircleIcon />
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => onEdit(event)} aria-label="Editar evento">
                      <PencilIcon />
                    </button>
                    <button type="button" onClick={() => onDelete(event)} aria-label="Eliminar evento">
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
