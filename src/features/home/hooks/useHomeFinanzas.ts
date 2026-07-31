import { useMemo } from 'react'
import { calcularResumenMensual } from '../../../domain/finanzas/summary'
import { useMovementsRange } from '../../finanzas/hooks/useMovementsRange'

function monthRange(date: Date): [Date, Date] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return [start, end]
}

export function useHomeFinanzas() {
  const today = useMemo(() => new Date(), [])
  const [monthStart, monthEnd] = useMemo(() => monthRange(today), [today])

  const { movements, loading, error } = useMovementsRange(monthStart, monthEnd)
  const resumen = useMemo(() => calcularResumenMensual(movements), [movements])

  return { balance: resumen.balance, loading, error }
}
