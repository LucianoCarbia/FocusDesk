import type { Category } from '../../../domain/calendario/Category'
import { holidayName } from '../../../domain/calendario/holidays'
import type { AgendaEntry } from '../../../domain/calendario/occurrences'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { Movement } from '../../../domain/finanzas/Movement'
import type { EstadoServicio } from '../../../domain/servicios/estado'
import { PencilIcon, PlusIcon, ReceiptIcon, RepeatIcon, TrashIcon, XCircleIcon } from '../../../components/icons/Icons'
import type { ServicioConEstado } from '../../../services/servicios/serviceService'
import { formatAmount, formatCurrency } from '../../../utils/currency'
import { formatFullDate } from '../../../utils/date'
import styles from './DayDetailPanel.module.css'

const ESTADO_LABEL: Record<EstadoServicio, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
}

const ESTADO_CLASS: Record<EstadoServicio, string> = {
  pagado: styles.vencimientoPagado,
  pendiente: '',
  vencido: styles.vencimientoVencido,
}

interface DayDetailPanelProps {
  selectedDate: Date
  events: AgendaEntry[]
  categories: Category[]
  movements: Movement[]
  financeCategories: FinanceCategory[]
  servicios: ServicioConEstado[]
  onAdd: () => void
  onEdit: (event: AgendaEntry) => void
  onDelete: (event: AgendaEntry) => void
  onCancelOccurrence: (event: AgendaEntry) => void
}

export function DayDetailPanel({
  selectedDate,
  events,
  categories,
  movements,
  financeCategories,
  servicios,
  onAdd,
  onEdit,
  onDelete,
  onCancelOccurrence,
}: DayDetailPanelProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const financeCategoryById = new Map(financeCategories.map((c) => [c.id, c]))
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

      {servicios.length > 0 && (
        <div className={styles.movements}>
          <span className={styles.movementsTitle}>Vencimientos</span>
          {servicios.map(({ service, period, estado }) => (
            <div key={period.id} className={`${styles.vencimiento} ${ESTADO_CLASS[estado]}`}>
              <span className={styles.vencimientoIcon}>
                <ReceiptIcon width={16} height={16} />
              </span>
              <div className={styles.vencimientoBody}>
                <span className={styles.vencimientoTitle}>{service.name}</span>
                <span className={styles.vencimientoAmount}>{formatAmount(period.amount, period.currency)}</span>
              </div>
              {estado !== 'pendiente' && (
                <span className={styles.vencimientoEstado}>{ESTADO_LABEL[estado]}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {movements.length > 0 && (
        <div className={styles.movements}>
          <span className={styles.movementsTitle}>Movimientos</span>
          {movements.map((movement) => {
            const financeCategory = financeCategoryById.get(movement.categoryId)
            const esNegativo = movement.type === 'gasto'
            return (
              <div key={movement.id} className={styles.movementItem}>
                <span
                  className={styles.movementBar}
                  style={{ background: financeCategory?.color ?? '#64748b' }}
                />
                <span className={styles.movementTitle}>{movement.title}</span>
                <span className={esNegativo ? styles.movementAmountGasto : styles.movementAmount}>
                  {esNegativo ? '-' : '+'}
                  {formatCurrency(movement.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
