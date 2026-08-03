import { useMemo, useState } from 'react'
import { calcularGastosPorCategoria, calcularInsights, calcularResumenMensual } from '../../../domain/finanzas/summary'
import type { MovementType } from '../../../domain/finanzas/Movement'
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  type MovementFormInput,
} from '../../../services/finanzas/movementService'
import { addDays, addMonths, formatMonthYear } from '../../../utils/date'
import { useMovementsRange } from './useMovementsRange'

export type FiltroMovimiento = 'todos' | MovementType

function monthRange(date: Date): [Date, Date] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return [start, end]
}

function diasEnRango(start: Date, end: Date): Date[] {
  const dias: Date[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) {
    dias.push(d)
  }
  return dias
}

export function useFinanzasData() {
  const today = useMemo(() => new Date(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [filtro, setFiltro] = useState<FiltroMovimiento>('todos')

  const [monthStart, monthEnd] = useMemo(() => monthRange(visibleMonth), [visibleMonth])
  const previousMonth = useMemo(() => addMonths(visibleMonth, -1), [visibleMonth])
  const [prevMonthStart, prevMonthEnd] = useMemo(() => monthRange(previousMonth), [previousMonth])

  const { categories, movements, loading, error, recargar } = useMovementsRange(monthStart, monthEnd)
  const { movements: previousMonthMovements } = useMovementsRange(prevMonthStart, prevMonthEnd)

  const esMesActual = visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth()
  const diasPeriodo = useMemo(
    () => diasEnRango(monthStart, esMesActual ? today : monthEnd),
    [monthStart, monthEnd, esMesActual, today],
  )

  const resumen = useMemo(() => calcularResumenMensual(movements), [movements])
  const gastosPorCategoria = useMemo(() => calcularGastosPorCategoria(movements, categories), [movements, categories])
  const insights = useMemo(
    () => calcularInsights(movements, previousMonthMovements, categories, diasPeriodo, diasEnRango(prevMonthStart, prevMonthEnd).length),
    [movements, previousMonthMovements, categories, diasPeriodo, prevMonthStart, prevMonthEnd],
  )

  const movimientosFiltrados = useMemo(
    () => (filtro === 'todos' ? movements : movements.filter((m) => m.type === filtro)),
    [movements, filtro],
  )

  async function agregarMovimiento(input: MovementFormInput) {
    await crearMovimiento(input)
    await recargar()
  }

  async function editarMovimiento(id: string, input: MovementFormInput) {
    await actualizarMovimiento(id, input)
    await recargar()
  }

  async function borrarMovimiento(id: string) {
    await eliminarMovimiento(id)
    await recargar()
  }

  return {
    visibleMonth,
    monthLabel: formatMonthYear(visibleMonth),
    categories,
    movements,
    movimientosFiltrados,
    filtro,
    setFiltro,
    resumen,
    gastosPorCategoria,
    insights,
    loading,
    error,
    goToPrevMonth: () => setVisibleMonth((m) => addMonths(m, -1)),
    goToNextMonth: () => setVisibleMonth((m) => addMonths(m, 1)),
    agregarMovimiento,
    editarMovimiento,
    borrarMovimiento,
    recargarMovimientos: recargar,
  }
}
