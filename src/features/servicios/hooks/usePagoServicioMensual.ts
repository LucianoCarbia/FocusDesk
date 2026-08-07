import { useState } from 'react'
import type { Currency } from '../../../domain/shared/Currency'

export interface PagoMensualPendiente {
  servicioMensualId: string
  serviceName: string
  ocurrencias: number
  montoEstimado: number
  currency: Currency
}

export function usePagoServicioMensual(
  pagar: (servicioMensualId: string, monto: number, exchangeRate?: number | null) => Promise<void>,
) {
  const [pendiente, setPendiente] = useState<PagoMensualPendiente | null>(null)

  function solicitarPago(pago: PagoMensualPendiente) {
    setPendiente(pago)
  }

  // No atrapa errores acá a propósito: PagoServicioMensualDialog los captura y los muestra
  // sin cerrarse, para que el usuario pueda corregir el importe/cotización sin perder lo tipeado.
  async function confirmarPago(monto: number, exchangeRate: number | null) {
    if (!pendiente) return
    await pagar(pendiente.servicioMensualId, monto, exchangeRate)
    setPendiente(null)
  }

  function cancelar() {
    setPendiente(null)
  }

  return { pendiente, solicitarPago, confirmarPago, cancelar }
}
