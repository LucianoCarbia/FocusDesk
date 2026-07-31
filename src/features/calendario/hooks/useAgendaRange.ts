import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Category } from '../../../domain/calendario/Category'
import type { RecurringEvent, RecurringEventSkip } from '../../../domain/calendario/RecurringEvent'
import { type AgendaEntry, generarOcurrencias } from '../../../domain/calendario/occurrences'
import { listarCategorias } from '../../../services/calendario/categoryService'
import { listarEventosEntre } from '../../../services/calendario/eventService'
import { listarHorariosActivos, listarSkips } from '../../../services/calendario/recurringEventService'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'

/**
 * Carga eventos sueltos + horarios fijos (con sus pausas) para un rango de
 * fechas y los combina en una sola agenda por día. Lo usan tanto la
 * sección Calendario (rango del mes visible) como el Home (hoy/mañana).
 */
export function useAgendaRange(startDate: Date, endDate: Date) {
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<AgendaEntry[]>([])
  const [recurringEvents, setRecurringEvents] = useState<RecurringEvent[]>([])
  const [recurringSkips, setRecurringSkips] = useState<RecurringEventSkip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startISO = toISODate(startDate)
  const endISO = toISODate(endDate)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriasData, eventosData, reglasData] = await Promise.all([
        listarCategorias(),
        listarEventosEntre(startISO, endISO),
        listarHorariosActivos(startISO, endISO),
      ])
      const skipsData = await listarSkips(reglasData.map((r) => r.id))

      setCategories(categoriasData)
      setEvents(eventosData.map((e) => ({ ...e, source: 'event' as const })))
      setRecurringEvents(reglasData)
      setRecurringSkips(skipsData)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [startISO, endISO])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargar()
    })
  }, [cargar])

  const skipsByRule = useMemo(() => {
    const map = new Map<string, RecurringEventSkip[]>()
    for (const skip of recurringSkips) {
      const list = map.get(skip.recurringEventId) ?? []
      list.push(skip)
      map.set(skip.recurringEventId, list)
    }
    return map
  }, [recurringSkips])

  const occurrences = useMemo(
    () => generarOcurrencias(recurringEvents, skipsByRule, startDate, endDate),
    [recurringEvents, skipsByRule, startDate, endDate],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEntry[]>()
    for (const entry of [...events, ...occurrences]) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    }
    return map
  }, [events, occurrences])

  function eventosDelDia(date: Date): AgendaEntry[] {
    return eventsByDate.get(toISODate(date)) ?? []
  }

  return { categories, eventosDelDia, loading, error, recargar: cargar }
}
