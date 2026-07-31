import { useCallback, useEffect, useState } from 'react'
import type { PendienteFinanciero } from '../../../domain/finanzas/pendientes'
import {
  confirmarPendiente as confirmarPendienteService,
  descartarPendiente as descartarPendienteService,
  listarPendientes,
} from '../../../services/finanzas/movementLinkService'
import { toErrorMessage } from '../../../utils/errors'

export function usePendientesFinancieros() {
  const [pendientes, setPendientes] = useState<PendienteFinanciero[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPendientes(await listarPendientes())
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

  async function confirmar(pendiente: PendienteFinanciero) {
    await confirmarPendienteService(pendiente)
    await cargar()
  }

  async function descartar(pendiente: PendienteFinanciero) {
    await descartarPendienteService(pendiente)
    await cargar()
  }

  return { pendientes, loading, error, confirmar, descartar }
}
