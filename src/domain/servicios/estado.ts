import { addDays, addMonths, toISODate } from '../../utils/date'
import type { Service } from './Service'
import type { ServicePeriod } from './ServicePeriod'

export type EstadoServicio = 'pagado' | 'proximo' | 'vencido'

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function diasHastaVencimiento(dueDateISO: string, todayISO: string): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000
  return Math.round((parseISODate(dueDateISO).getTime() - parseISODate(todayISO).getTime()) / MS_POR_DIA)
}

// null: falta más de 2 días y no es ninguno de los tres estados relevantes para el usuario.
export function calcularEstado(period: ServicePeriod, todayISO: string): EstadoServicio | null {
  if (period.paid) return 'pagado'
  const dias = diasHastaVencimiento(period.dueDate, todayISO)
  if (dias <= 0) return 'vencido'
  if (dias <= 2) return 'proximo'
  return null
}

export function siguienteVencimiento(service: Service, desdeISO: string): string {
  const desde = parseISODate(desdeISO)

  if (service.frequency === 'mensual') return toISODate(addMonths(desde, 1))
  if (service.frequency === 'anual') return toISODate(addMonths(desde, 12))
  return toISODate(addDays(desde, service.customIntervalDays ?? 30))
}
