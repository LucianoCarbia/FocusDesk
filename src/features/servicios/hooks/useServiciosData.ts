import { useCallback, useEffect, useState } from 'react'
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  listarServiciosConEstado,
  marcarComoPagado,
  type ServiceFormInput,
  type ServicioConEstado,
} from '../../../services/servicios/serviceService'
import { toErrorMessage } from '../../../utils/errors'

export function useServiciosData() {
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

  async function crear(input: ServiceFormInput) {
    await crearServicio(input)
    await cargar()
  }

  async function actualizar(id: string, input: ServiceFormInput) {
    await actualizarServicio(id, input)
    await cargar()
  }

  async function eliminar(id: string) {
    await eliminarServicio(id)
    await cargar()
  }

  async function pagar(periodId: string) {
    await marcarComoPagado(periodId)
    await cargar()
  }

  return { items, loading, error, crear, actualizar, eliminar, pagar, recargar: cargar }
}
