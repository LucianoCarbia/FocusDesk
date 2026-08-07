import { useCallback, useEffect, useState } from 'react'
import {
  actualizarServicioMensual,
  crearServicioMensual,
  eliminarServicioMensual,
  listarServiciosMensualesConEstado,
  marcarComoPagado,
  type ServicioMensualConEstado,
  type ServicioMensualFormInput,
} from '../../../services/servicios/servicioMensualService'
import { toErrorMessage } from '../../../utils/errors'

export function useServiciosMensualesData() {
  const [items, setItems] = useState<ServicioMensualConEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listarServiciosMensualesConEstado())
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

  async function crear(input: ServicioMensualFormInput) {
    await crearServicioMensual(input)
    await cargar()
  }

  async function actualizar(id: string, input: ServicioMensualFormInput) {
    await actualizarServicioMensual(id, input)
    await cargar()
  }

  async function eliminar(id: string) {
    await eliminarServicioMensual(id)
    await cargar()
  }

  async function pagar(servicioMensualId: string, monto: number, exchangeRate: number | null = null) {
    await marcarComoPagado(servicioMensualId, monto, exchangeRate)
    await cargar()
  }

  return { items, loading, error, crear, actualizar, eliminar, pagar, recargar: cargar }
}
