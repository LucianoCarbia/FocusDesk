export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b)
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function addMonths(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

/** Ventana de 7 días arrancando hoy (no la semana calendario). */
export function rollingWeek(from: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(from, i))
}

/** Cuenta cuántas veces cae un día de la semana (0 = lunes … 6 = domingo) dentro de un mes calendario. */
export function contarDiaSemanaEnMes(year: number, month: number, weekday: number): number {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  let count = 0
  for (let d = first; d <= last; d = addDays(d, 1)) {
    if ((d.getDay() + 6) % 7 === weekday) count++
  }
  return count
}

export interface MonthDay {
  date: Date
  isCurrentMonth: boolean
}

/** Matriz de semanas (lunes a domingo) cubriendo el mes completo de `monthDate`. */
export function monthMatrix(monthDate: Date): MonthDay[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  const mondayIndex = (firstOfMonth.getDay() + 6) % 7
  const start = addDays(firstOfMonth, -mondayIndex)

  const sundayIndex = (lastOfMonth.getDay() + 6) % 7
  const end = addDays(lastOfMonth, 6 - sundayIndex)

  const days: MonthDay[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push({ date: d, isCurrentMonth: d.getMonth() === month })
  }
  return days
}

const WEEKDAY_SHORT = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const MONTH_YEAR = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const WEEKDAY_LONG_DAY_MONTH = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT.format(date).replace('.', '').toUpperCase()
}

export function formatMonthYear(date: Date): string {
  return capitalize(MONTH_YEAR.format(date))
}

export function formatFullDate(date: Date): string {
  return capitalize(WEEKDAY_LONG_DAY_MONTH.format(date))
}
