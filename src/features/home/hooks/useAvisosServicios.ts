import { useCallback, useEffect, useMemo, useState } from 'react'
import { calcularAvisos } from '../../../domain/servicios/avisos'
import {
  listarServiciosConEstado,
  marcarComoPagado,
  type ServicioConEstado,
} from '../../../services/servicios/serviceService'
import { toErrorMessage } from '../../../utils/errors'

export function useAvisosServicios() {
  const [items, setItems] = useState<ServicioConEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listarServiciosConEstado())
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

  const avisos = useMemo(
    () => calcularAvisos(items.map((i) => ({ service: i.service, period: i.period })), new Date()),
    [items],
  )

  async function pagar(periodId: string, exchangeRate: number | null = null) {
    await marcarComoPagado(periodId, exchangeRate)
    await cargar()
  }

  return { avisos, loading, error, pagar }
}
