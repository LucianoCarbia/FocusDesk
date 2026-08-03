import type { ServicePeriod } from './ServicePeriod'

export interface TotalMensual {
  ars: number
  usdPendiente: number
}

// null = todavía no se puede expresar en pesos (servicio en USD sin pagar, sin cotización conocida)
function montoEnArs(period: ServicePeriod): number | null {
  if (period.paidAmountArs != null) return period.paidAmountArs
  return period.currency === 'ARS' ? period.amount : null
}

export function calcularTotalMensual(periods: ServicePeriod[], mesISO: string): TotalMensual {
  let ars = 0
  let usdPendiente = 0

  for (const period of periods) {
    if (period.dueDate.slice(0, 7) !== mesISO) continue
    const monto = montoEnArs(period)
    if (monto != null) {
      ars += monto
    } else {
      usdPendiente += period.amount
    }
  }

  return { ars, usdPendiente }
}
