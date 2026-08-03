import { useState } from 'react'
import type { Currency } from '../../../domain/shared/Currency'
import { toErrorMessage } from '../../../utils/errors'

export interface PagoPendiente {
  periodId: string
  serviceName: string
  amount: number
  currency: Currency
  dueDate: string
}

export function usePagoServicio(pagar: (periodId: string, exchangeRate?: number | null) => Promise<void>) {
  const [pendiente, setPendiente] = useState<PagoPendiente | null>(null)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function solicitarPago(pago: PagoPendiente) {
    if (pago.currency === 'USD') {
      setPendiente(pago)
      return
    }

    setProcesando(pago.periodId)
    setError(null)
    try {
      await pagar(pago.periodId)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setProcesando(null)
    }
  }

  // No atrapa errores acá a propósito: PagoServicioDialog los captura y los muestra
  // sin cerrarse, para que el usuario pueda corregir la cotización sin perder lo tipeado.
  async function confirmarCotizacion(exchangeRate: number) {
    if (!pendiente) return
    await pagar(pendiente.periodId, exchangeRate)
    setPendiente(null)
  }

  function cancelar() {
    setPendiente(null)
  }

  return { pendiente, procesando, error, solicitarPago, confirmarCotizacion, cancelar }
}
