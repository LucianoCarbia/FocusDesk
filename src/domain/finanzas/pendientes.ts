import { toISODate } from '../../utils/date'
import type { AgendaEntry } from '../calendario/occurrences'
import type { MovementLink, MovementLinkSourceType } from './MovementLink'
import type { MovementType } from '../shared/MovementType'

export interface PendienteFinanciero {
  sourceType: MovementLinkSourceType
  sourceId: string
  occurrenceDate: string
  title: string
  amount: number
  movementType: MovementType
  financeCategoryId: string
}

export function calcularPendientes(
  entradas: AgendaEntry[],
  links: MovementLink[],
  today: Date,
): PendienteFinanciero[] {
  const todayISO = toISODate(today)
  const linkKeys = new Set(links.map((l) => `${l.sourceType}__${l.sourceId}__${l.occurrenceDate}`))

  const pendientes: PendienteFinanciero[] = []
  for (const entrada of entradas) {
    if (entrada.amount == null || entrada.movementType == null || entrada.financeCategoryId == null) continue
    if (entrada.date > todayISO) continue

    const sourceType: MovementLinkSourceType = entrada.source === 'recurring' ? 'recurring' : 'event'
    const sourceId = entrada.source === 'recurring' ? (entrada.recurringEventId ?? entrada.id) : entrada.id
    const key = `${sourceType}__${sourceId}__${entrada.date}`
    if (linkKeys.has(key)) continue

    pendientes.push({
      sourceType,
      sourceId,
      occurrenceDate: entrada.date,
      title: entrada.title,
      amount: entrada.amount,
      movementType: entrada.movementType,
      financeCategoryId: entrada.financeCategoryId,
    })
  }

  return pendientes.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate))
}
