import type { Category } from '../../../domain/calendario/Category'
import { holidayName } from '../../../domain/calendario/holidays'
import type { AgendaEntry } from '../../../domain/calendario/occurrences'
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons/Icons'
import type { MonthDay } from '../../../utils/date'
import { formatMonthYear, isSameDay } from '../../../utils/date'
import styles from './MonthGrid.module.css'

const WEEKDAY_HEADERS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

interface MonthGridProps {
  visibleMonth: Date
  matrix: MonthDay[]
  today: Date
  selectedDate: Date
  categories: Category[]
  eventosDelDia: (date: Date) => AgendaEntry[]
  onSelect: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function MonthGrid({
  visibleMonth,
  matrix,
  today,
  selectedDate,
  categories,
  eventosDelDia,
  onSelect,
  onPrevMonth,
  onNextMonth,
}: MonthGridProps) {
  const colorByCategory = new Map(categories.map((c) => [c.id, c.color]))

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <button type="button" className={styles.navButton} onClick={onPrevMonth} aria-label="Mes anterior">
          <ChevronLeftIcon />
        </button>
        <h2 className={styles.title}>{formatMonthYear(visibleMonth)}</h2>
        <button type="button" className={styles.navButton} onClick={onNextMonth} aria-label="Mes siguiente">
          <ChevronRightIcon />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAY_HEADERS.map((label) => (
          <span key={label} className={styles.weekdayHeader}>
            {label}
          </span>
        ))}

        {matrix.map(({ date, isCurrentMonth }) => {
          const events = eventosDelDia(date)
          const dotColors = [...new Set(events.map((e) => colorByCategory.get(e.categoryId)).filter(Boolean))]
          const isToday = isSameDay(date, today)
          const isSelected = isSameDay(date, selectedDate)
          const holiday = holidayName(date)

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelect(date)}
              title={holiday ?? undefined}
              className={[
                styles.cell,
                !isCurrentMonth && styles.faded,
                isToday && styles.today,
                isSelected && styles.selected,
                holiday && styles.holiday,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.cellNumber}>{date.getDate()}</span>
              {dotColors.length > 0 && (
                <div className={styles.cellDots}>
                  {dotColors.map((color) => (
                    <span key={color} className={styles.cellDot} style={{ background: color }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
