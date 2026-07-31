import { useMemo } from 'react'
import { useAgendaRange } from '../../calendario/hooks/useAgendaRange'
import { addDays } from '../../../utils/date'

export function useHomeAgenda() {
  const today = useMemo(() => new Date(), [])
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const { categories, eventosDelDia, loading, error } = useAgendaRange(today, tomorrow)

  return {
    categories,
    loading,
    error,
    eventosHoy: eventosDelDia(today),
    eventosManiana: eventosDelDia(tomorrow),
  }
}
