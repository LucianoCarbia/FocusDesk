import { useCallback, useEffect, useMemo, useState } from 'react'
import { calcularEvolucionMensual, calcularResumenMes, calcularSaldoUsd } from '../../../domain/ahorros/resumen'
import type { SavingsMovement } from '../../../domain/ahorros/SavingsMovement'
import {
  actualizarMovimiento,
  eliminarMovimiento,
  listarMovimientos,
  registrarMovimiento,
  type SavingsMovementFormInput,
} from '../../../services/ahorros/savingsMovementService'
import { addMonths, toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'

export function useAhorrosData() {
  const [movimientos, setMovimientos] = useState<SavingsMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setMovimientos(await listarMovimientos())
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargar()
    })
  }, [cargar])

  const monthLabel = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(visibleMonth)
  const yearMonth = toISODate(visibleMonth).slice(0, 7)

  const saldoUsd = useMemo(() => calcularSaldoUsd(movimientos), [movimientos])
  const resumenMes = useMemo(() => calcularResumenMes(movimientos, yearMonth), [movimientos, yearMonth])
  const evolucionMensual = useMemo(() => calcularEvolucionMensual(movimientos), [movimientos])

  async function registrar(input: SavingsMovementFormInput) {
    await registrarMovimiento(input)
    await cargar()
  }

  async function actualizar(id: string, input: SavingsMovementFormInput) {
    await actualizarMovimiento(id, input)
    await cargar()
  }

  async function eliminar(id: string) {
    await eliminarMovimiento(id)
    await cargar()
  }

  return {
    movimientos,
    loading,
    error,
    visibleMonth,
    monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    goToPrevMonth: () => setVisibleMonth((m) => addMonths(m, -1)),
    goToNextMonth: () => setVisibleMonth((m) => addMonths(m, 1)),
    saldoUsd,
    resumenMes,
    evolucionMensual,
    registrar,
    actualizar,
    eliminar,
  }
}
