import { useMemo, useState } from 'react'
import {
  actualizarEvento,
  crearEvento,
  eliminarEvento,
  type EventFormInput,
} from '../../../services/calendario/eventService'
import { cancelarOcurrencia as cancelarOcurrenciaService } from '../../../services/calendario/recurringEventService'
import { addDays, addMonths, monthMatrix } from '../../../utils/date'
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
    loading,
    error,
    eventosDelDia,
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
