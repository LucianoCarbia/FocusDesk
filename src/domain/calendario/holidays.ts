import { toISODate } from '../../utils/date'

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher). */
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

/**
 * Feriados "trasladables" (Ley 27.399): si caen martes se trasladan al
 * lunes anterior, si caen miércoles se trasladan al lunes siguiente. Es
 * la regla legal por defecto — el Poder Ejecutivo puede decretar
 * "puentes turísticos" adicionales cada año que esto no contempla.
 */
function trasladable(date: Date): Date {
  const day = date.getDay() // 0 domingo … 6 sábado
  if (day === 2) return addDays(date, -1) // martes → lunes anterior
  if (day === 3) return addDays(date, 5) // miércoles → lunes siguiente
  return date
}

function fixed(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

export function holidaysForYear(year: number): Map<string, string> {
  const easter = easterSunday(year)
  const map = new Map<string, string>()

  const add = (date: Date, name: string) => map.set(toISODate(date), name)

  add(fixed(year, 1, 1), 'Año Nuevo')
  add(addDays(easter, -48), 'Carnaval')
  add(addDays(easter, -47), 'Carnaval')
  add(fixed(year, 3, 24), 'Día Nacional de la Memoria')
  add(addDays(easter, -2), 'Viernes Santo')
  add(fixed(year, 4, 2), 'Día del Veterano y de los Caídos en Malvinas')
  add(fixed(year, 5, 1), 'Día del Trabajador')
  add(fixed(year, 5, 25), 'Día de la Revolución de Mayo')
  add(trasladable(fixed(year, 6, 17)), 'Paso a la Inmortalidad del Gral. Güemes')
  add(fixed(year, 6, 20), 'Día de la Bandera')
  add(fixed(year, 7, 9), 'Día de la Independencia')
  add(trasladable(fixed(year, 8, 17)), 'Paso a la Inmortalidad del Gral. San Martín')
  add(trasladable(fixed(year, 10, 12)), 'Día del Respeto a la Diversidad Cultural')
  add(trasladable(fixed(year, 11, 20)), 'Día de la Soberanía Nacional')
  add(fixed(year, 12, 8), 'Inmaculada Concepción de María')
  add(fixed(year, 12, 25), 'Navidad')

  return map
}

const cache = new Map<number, Map<string, string>>()

function forYear(year: number): Map<string, string> {
  let map = cache.get(year)
  if (!map) {
    map = holidaysForYear(year)
    cache.set(year, map)
  }
  return map
}

export function holidayName(date: Date): string | null {
  return forYear(date.getFullYear()).get(toISODate(date)) ?? null
}

export function isHoliday(date: Date): boolean {
  return holidayName(date) !== null
}
