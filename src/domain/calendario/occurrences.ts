import { addDays, toISODate } from '../../utils/date'
import type { CalendarEvent } from './CalendarEvent'
import { isHoliday } from './holidays'
import type { RecurringEvent, RecurringEventSkip } from './RecurringEvent'

export interface AgendaEntry extends CalendarEvent {
  source: 'event' | 'recurring'
  recurringEventId?: string
}

export function generarOcurrencias(
  reglas: RecurringEvent[],
  skipsPorRegla: Map<string, RecurringEventSkip[]>,
  rangeStart: Date,
  rangeEnd: Date,
): AgendaEntry[] {
  const result: AgendaEntry[] = []

  for (const regla of reglas) {
    const skips = skipsPorRegla.get(regla.id) ?? []

    for (let d = new Date(rangeStart); d <= rangeEnd; d = addDays(d, 1)) {
      const iso = toISODate(d)
      const weekday = (d.getDay() + 6) % 7 // 0 = lunes … 6 = domingo

      if (!regla.daysOfWeek.includes(weekday)) continue
      if (iso < regla.startDate) continue
      if (regla.endDate && iso > regla.endDate) continue
      if (regla.skipHolidays && isHoliday(d)) continue
      if (skips.some((s) => iso >= s.startDate && iso <= s.endDate)) continue

      result.push({
        id: `${regla.id}__${iso}`,
        title: regla.title,
        categoryId: regla.categoryId,
        date: iso,
        startTime: regla.startTime,
        endTime: regla.endTime,
        location: regla.location,
        notes: regla.notes,
        createdAt: regla.createdAt,
        updatedAt: regla.updatedAt,
        source: 'recurring',
        recurringEventId: regla.id,
      })
    }
  }

  return result
}
