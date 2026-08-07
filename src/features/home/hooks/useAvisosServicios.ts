import { useCallback, useEffect, useMemo, useState } from 'react'
import { calcularAvisos, calcularAvisosMensuales } from '../../../domain/servicios/avisos'
import {
  listarServiciosConEstado,
  marcarComoPagado,
  type ServicioConEstado,
} from '../../../services/servicios/serviceService'
import {
  listarServiciosMensualesConEstado,
  marcarComoPagado as marcarServicioMensualComoPagado,
  type ServicioMensualConEstado,
} from '../../../services/servicios/servicioMensualService'
import { toErrorMessage } from '../../../utils/errors'

export function useAvisosServicios() {
  const [items, setItems] = useState<ServicioConEstado[]>([])
  const [itemsMensuales, setItemsMensuales] = useState<ServicioMensualConEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [conEstado, mensuales] = await Promise.all([
        listarServiciosConEstado(),
        listarServiciosMensualesConEstado(),
      ])
      setItems(conEstado)
      setItemsMensuales(mensuales)
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

  const avisosMensuales = useMemo(
    () =>
      calcularAvisosMensuales(
        itemsMensuales.map((i) => ({
          servicio: i.servicio,
          ocurrencias: i.ocurrencias,
          montoEstimado: i.montoEstimado,
          pagado: i.pago != null,
        })),
      ),
    [itemsMensuales],
  )

  async function pagar(periodId: string, exchangeRate: number | null = null) {
    await marcarComoPagado(periodId, exchangeRate)
    await cargar()
  }

  async function pagarMensual(servicioMensualId: string, monto: number, exchangeRate: number | null = null) {
    await marcarServicioMensualComoPagado(servicioMensualId, monto, exchangeRate)
    await cargar()
  }

  return { avisos, avisosMensuales, loading, error, pagar, pagarMensual }
}
