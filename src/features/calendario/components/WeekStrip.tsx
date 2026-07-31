import type { Category } from '../../../domain/calendario/Category'
import type { AgendaEntry } from '../../../domain/calendario/occurrences'
import { ClockIcon, RepeatIcon } from '../../../components/icons/Icons'
import { formatWeekdayShort, isSameDay, rollingWeek } from '../../../utils/date'
import styles from './WeekStrip.module.css'

interface WeekStripProps {
  today: Date
  selectedDate: Date
  categories: Category[]
  eventosDelDia: (date: Date) => AgendaEntry[]
  onSelect: (date: Date) => void
}

export function WeekStrip({ today, selectedDate, categories, eventosDelDia, onSelect }: WeekStripProps) {
  const days = rollingWeek(today)
  const colorByCategory = new Map(categories.map((c) => [c.id, c.color]))

  return (
    <div className={styles.strip}>
      {days.map((date) => {
        const events = eventosDelDia(date)
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
              {events.length > 0 && <span className={styles.count}>{events.length}</span>}
            </div>

            <div className={styles.events}>
              {events.length === 0 && <span className={styles.empty}>Sin eventos</span>}

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
            </div>
          </button>
        )
      })}
    </div>
  )
}
