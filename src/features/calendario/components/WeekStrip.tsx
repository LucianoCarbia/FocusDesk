import type { Category } from '../../../domain/calendario/Category'
import type { AgendaEntry } from '../../../domain/calendario/occurrences'
import type { EstadoServicio } from '../../../domain/servicios/estado'
import { ClockIcon, ReceiptIcon, RepeatIcon } from '../../../components/icons/Icons'
import type { ServicioConEstado } from '../../../services/servicios/serviceService'
import { formatAmount } from '../../../utils/currency'
import { formatWeekdayShort, isSameDay, rollingWeek } from '../../../utils/date'
import styles from './WeekStrip.module.css'

interface WeekStripProps {
  today: Date
  selectedDate: Date
  categories: Category[]
  eventosDelDia: (date: Date) => AgendaEntry[]
  serviciosDelDia: (date: Date) => ServicioConEstado[]
  onSelect: (date: Date) => void
}

const COLOR_POR_ESTADO: Record<EstadoServicio, string> = {
  vencido: 'var(--danger)',
  proximo: '#f59e0b',
  pagado: 'var(--accent)',
}

function colorVencimiento(estado: EstadoServicio | null): string {
  return estado ? COLOR_POR_ESTADO[estado] : 'var(--border)'
}

export function WeekStrip({ today, selectedDate, categories, eventosDelDia, serviciosDelDia, onSelect }: WeekStripProps) {
  const days = rollingWeek(today)
  const colorByCategory = new Map(categories.map((c) => [c.id, c.color]))

  return (
    <div className={styles.strip}>
      {days.map((date) => {
        const events = eventosDelDia(date)
        const servicios = serviciosDelDia(date).filter((item) => !item.period.paid)
        const isToday = isSameDay(date, today)
        const isSelected = isSameDay(date, selectedDate)

        return (
          <button
            key={date.toISOString()}
            type="button"
            className={[styles.day, isToday && styles.today, isSelected && styles.selected]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(date)}
          >
            <div className={styles.dayHeader}>
              <div>
                <span className={styles.weekday}>{formatWeekdayShort(date)}</span>
                <span className={styles.dayNumber}>{date.getDate()}</span>
              </div>
              {events.length + servicios.length > 0 && (
                <span className={styles.count}>{events.length + servicios.length}</span>
              )}
            </div>

            <div className={styles.events}>
              {events.length === 0 && servicios.length === 0 && (
                <span className={styles.empty}>Sin eventos</span>
              )}

              {events.map((event) => (
                <div key={event.id} className={styles.event}>
                  <span
                    className={styles.eventBar}
                    style={{ background: colorByCategory.get(event.categoryId) }}
                  />
                  <div className={styles.eventBody}>
                    <span className={styles.eventTitle}>
                      {event.source === 'recurring' && <RepeatIcon />}
                      {event.title}
                    </span>
                    {event.startTime && (
                      <span className={styles.eventTime}>
                        <ClockIcon />
                        {event.startTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {servicios.map(({ service, period, estado }) => (
                <div key={period.id} className={styles.event}>
                  <span className={styles.eventBar} style={{ background: colorVencimiento(estado) }} />
                  <div className={styles.eventBody}>
                    <span className={styles.eventTitle}>
                      <ReceiptIcon />
                      Vence {service.name} — {formatAmount(period.amount, period.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
