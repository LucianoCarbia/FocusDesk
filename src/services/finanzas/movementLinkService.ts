import { EventRepository } from '../../database/repositories/EventRepository'
import { MovementLinkRepository } from '../../database/repositories/MovementLinkRepository'
import { RecurringEventRepository } from '../../database/repositories/RecurringEventRepository'
import { generarOcurrencias, type AgendaEntry } from '../../domain/calendario/occurrences'
import type { RecurringEventSkip } from '../../domain/calendario/RecurringEvent'
import { calcularPendientes, type PendienteFinanciero } from '../../domain/finanzas/pendientes'
import { addDays, toISODate } from '../../utils/date'
import { listarCategorias as listarCategoriasFinancieras } from './financeCategoryService'
import { crearMovimiento } from './movementService'

const DIAS_VENTANA_PENDIENTES = 60

export async function listarPendientes(): Promise<PendienteFinanciero[]> {
  const today = new Date()
  const windowStart = addDays(today, -DIAS_VENTANA_PENDIENTES)
  const startISO = toISODate(windowStart)
  const endISO = toISODate(today)

  const [eventos, reglas] = await Promise.all([
    EventRepository.findBetween(startISO, endISO),
    RecurringEventRepository.findActive(startISO, endISO),
  ])

  const skips = await RecurringEventRepository.findSkips(reglas.map((r) => r.id))
  const skipsByRule = new Map<string, RecurringEventSkip[]>()
  for (const skip of skips) {
    const list = skipsByRule.get(skip.recurringEventId) ?? []
    list.push(skip)
    skipsByRule.set(skip.recurringEventId, list)
  }

  const ocurrencias = generarOcurrencias(reglas, skipsByRule, windowStart, today)
  const entradasEventos: AgendaEntry[] = eventos.map((e) => ({ ...e, source: 'event' }))
  const entradas = [...entradasEventos, ...ocurrencias]

  const links = await MovementLinkRepository.findByDateRange(startISO, endISO)

  return calcularPendientes(entradas, links, today)
}

export async function confirmarPendiente(pendiente: PendienteFinanciero): Promise<void> {
  const categorias = await listarCategoriasFinancieras()
  const categoria = categorias.find((c) => c.id === pendiente.financeCategoryId)
  if (!categoria) throw new Error('La categoría de Finanzas de este pendiente ya no existe')

  const movementId = await crearMovimiento({
    type: pendiente.movementType,
    title: pendiente.title,
    amount: pendiente.amount,
    categoryName: categoria.name,
    date: pendiente.occurrenceDate,
    notes: null,
  })

  await MovementLinkRepository.create(crypto.randomUUID(), {
    sourceType: pendiente.sourceType,
    sourceId: pendiente.sourceId,
    occurrenceDate: pendiente.occurrenceDate,
    movementId,
    status: 'confirmed',
  })
}

export async function descartarPendiente(pendiente: PendienteFinanciero): Promise<void> {
  await MovementLinkRepository.create(crypto.randomUUID(), {
    sourceType: pendiente.sourceType,
    sourceId: pendiente.sourceId,
    occurrenceDate: pendiente.occurrenceDate,
    movementId: null,
    status: 'dismissed',
  })
}
