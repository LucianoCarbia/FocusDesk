import { addDays, addMonths, toISODate } from '../../utils/date'
import type { Service } from './Service'
import type { ServicePeriod } from './ServicePeriod'

export type EstadoServicio = 'pagado' | 'pendiente' | 'vencido'

export function calcularEstado(period: ServicePeriod, todayISO: string): EstadoServicio {
  if (period.paid) return 'pagado'
  if (period.dueDate <= todayISO) return 'vencido'
  return 'pendiente'
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function siguienteVencimiento(service: Service, desdeISO: string): string {
  const desde = parseISODate(desdeISO)

  if (service.frequency === 'mensual') return toISODate(addMonths(desde, 1))
  if (service.frequency === 'anual') return toISODate(addMonths(desde, 12))
  return toISODate(addDays(desde, service.customIntervalDays ?? 30))
}
