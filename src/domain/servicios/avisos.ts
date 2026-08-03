import type { Currency } from '../shared/Currency'
import { formatAmount } from '../../utils/currency'
import { toISODate } from '../../utils/date'
import type { Service } from './Service'
import type { ServicePeriod } from './ServicePeriod'

export interface AvisoServicio {
  serviceId: string
  periodId: string
  name: string
  amount: number
  currency: Currency
  dueDate: string
  diasRestantes: number
  mensaje: string
}

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function diasEntre(desde: Date, hasta: Date): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000
  return Math.round((hasta.getTime() - desde.getTime()) / MS_POR_DIA)
}

function armarMensaje(name: string, amount: number, currency: Currency, diasRestantes: number): string {
  const monto = formatAmount(amount, currency)
  if (diasRestantes < 0) return `Pago vencido: ${name} — ${monto}`
  if (diasRestantes === 0) return `Hoy tenés que pagar ${name} — ${monto}`
  if (diasRestantes === 1) return `Mañana tenés que pagar ${name} — ${monto}`
  return `Faltan ${diasRestantes} días para pagar ${name} — ${monto}`
}

export function calcularAvisos(
  items: { service: Service; period: ServicePeriod }[],
  today: Date,
): AvisoServicio[] {
  const todayMidnight = parseISODate(toISODate(today))

  const avisos: AvisoServicio[] = []
  for (const { service, period } of items) {
    if (period.paid) continue
    const diasRestantes = diasEntre(todayMidnight, parseISODate(period.dueDate))
    if (diasRestantes > 7) continue

    avisos.push({
      serviceId: service.id,
      periodId: period.id,
      name: service.name,
      amount: period.amount,
      currency: period.currency,
      dueDate: period.dueDate,
      diasRestantes,
      mensaje: armarMensaje(service.name, period.amount, period.currency, diasRestantes),
    })
  }

  return avisos.sort((a, b) => a.diasRestantes - b.diasRestantes)
}
