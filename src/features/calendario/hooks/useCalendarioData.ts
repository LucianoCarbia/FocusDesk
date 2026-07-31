import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Movement } from '../../../domain/finanzas/Movement'
import {
  actualizarEvento,
  crearEvento,
  eliminarEvento,
  type EventFormInput,
} from '../../../services/calendario/eventService'
import { cancelarOcurrencia as cancelarOcurrenciaService } from '../../../services/calendario/recurringEventService'
import { listarServiciosConEstado, type ServicioConEstado } from '../../../services/servicios/serviceService'
import { useMovementsRange } from '../../finanzas/hooks/useMovementsRange'
import { addDays, addMonths, monthMatrix, toISODate } from '../../../utils/date'
import { useAgendaRange } from './useAgendaRange'

export function useCalendarioData() {
  const today = useMemo(() => new Date(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)

  const matrix = useMemo(() => monthMatrix(visibleMonth), [visibleMonth])

  const rangeStart = useMemo(() => {
    const matrixStart = matrix[0].date
    return matrixStart < today ? matrixStart : today
  }, [matrix, today])

  const rangeEnd = useMemo(() => {
    const matrixEnd = matrix[matrix.length - 1].date
    const weekEnd = addDays(today, 6)
    return matrixEnd > weekEnd ? matrixEnd : weekEnd
  }, [matrix, today])

  const { categories, eventosDelDia, loading, error, recargar } = useAgendaRange(rangeStart, rangeEnd)
  const { categories: financeCategories, movements: movimientosFinanzas } = useMovementsRange(rangeStart, rangeEnd)

  const movimientosPorFecha = useMemo(() => {
    const map = new Map<string, Movement[]>()
    for (const movimiento of movimientosFinanzas) {
      const list = map.get(movimiento.date) ?? []
      list.push(movimiento)
      map.set(movimiento.date, list)
    }
    return map
  }, [movimientosFinanzas])

  function movimientosDelDia(date: Date): Movement[] {
    return movimientosPorFecha.get(toISODate(date)) ?? []
  }

  const [servicios, setServicios] = useState<ServicioConEstado[]>([])

  const cargarServicios = useCallback(async () => {
    setServicios(await listarServiciosConEstado())
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargarServicios()
    })
  }, [cargarServicios])

  const serviciosPorFecha = useMemo(() => {
    const map = new Map<string, ServicioConEstado[]>()
    for (const item of servicios) {
      const list = map.get(item.period.dueDate) ?? []
      list.push(item)
      map.set(item.period.dueDate, list)
    }
    return map
  }, [servicios])

  function serviciosDelDia(date: Date): ServicioConEstado[] {
    return serviciosPorFecha.get(toISODate(date)) ?? []
  }

  async function agregarEvento(input: EventFormInput) {
    await crearEvento(input)
    await recargar()
  }

  async function editarEvento(id: string, input: EventFormInput) {
    await actualizarEvento(id, input)
    await recargar()
  }

  async function borrarEvento(id: string) {
    await eliminarEvento(id)
    await recargar()
  }

  async function cancelarOcurrencia(recurringEventId: string, date: string) {
    await cancelarOcurrenciaService(recurringEventId, date)
    await recargar()
  }

  return {
    today,
    visibleMonth,
    selectedDate,
    matrix,
    categories,
    financeCategories,
    loading,
    error,
    eventosDelDia,
    movimientosDelDia,
    serviciosDelDia,
    setSelectedDate,
    goToPrevMonth: () => setVisibleMonth((m) => addMonths(m, -1)),
    goToNextMonth: () => setVisibleMonth((m) => addMonths(m, 1)),
    agregarEvento,
    editarEvento,
    borrarEvento,
    cancelarOcurrencia,
    recargar,
  }
}
