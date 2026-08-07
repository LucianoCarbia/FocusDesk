import { useState, type FormEvent } from 'react'
import type { Currency } from '../../../domain/shared/Currency'
import { CloseIcon } from '../../../components/icons/Icons'
import { formatCurrency, formatUsd } from '../../../utils/currency'
import { toErrorMessage } from '../../../utils/errors'
import styles from './PagoServicioDialog.module.css'

interface PagoServicioMensualDialogProps {
  serviceName: string
  ocurrencias: number
  montoEstimado: number
  currency: Currency
  onClose: () => void
  onConfirm: (monto: number, exchangeRate: number | null) => Promise<void>
}

export function PagoServicioMensualDialog({
  serviceName,
  ocurrencias,
  montoEstimado,
  currency,
  onClose,
  onConfirm,
}: PagoServicioMensualDialogProps) {
  const [monto, setMonto] = useState(String(montoEstimado))
  const [cotizacion, setCotizacion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const montoNumero = Number(monto)
  const montoValido = montoNumero > 0
  const rate = Number(cotizacion)
  const rateValida = currency !== 'USD' || rate > 0

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    if (!montoValido || !rateValida) return
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(montoNumero, currency === 'USD' ? rate : null)
      onClose()
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Registrar pago</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        <p className={styles.subtitle}>
          {serviceName} — {ocurrencias} {ocurrencias === 1 ? 'ocurrencia' : 'ocurrencias'} este mes
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Importe {currency === 'USD' ? '(USD)' : '(ARS)'}</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              autoFocus
              required
            />
          </label>

          {currency === 'USD' && (
            <label className={styles.field}>
              <span>Cotización del dólar (hoy)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={cotizacion}
                onChange={(e) => setCotizacion(e.target.value)}
                required
              />
            </label>
          )}

          {currency === 'USD' && rateValida && montoValido && (
            <p className={styles.cotizacion}>
              {formatUsd(montoNumero)} × {formatCurrency(rate)} = {formatCurrency(montoNumero * rate)}
            </p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveButton} disabled={submitting || !montoValido || !rateValida}>
              Confirmar pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
