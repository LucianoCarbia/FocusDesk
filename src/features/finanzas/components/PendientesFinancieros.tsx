import { useState } from 'react'
import type { PendienteFinanciero } from '../../../domain/finanzas/pendientes'
import { CalendarIcon } from '../../../components/icons/Icons'
import { formatCurrency } from '../../../utils/currency'
import { toErrorMessage } from '../../../utils/errors'
import { usePendientesFinancieros } from '../hooks/usePendientesFinancieros'
import styles from './PendientesFinancieros.module.css'

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

function formatPendienteDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day)).replace('.', '')
}

function claveDe(pendiente: PendienteFinanciero): string {
  return `${pendiente.sourceType}__${pendiente.sourceId}__${pendiente.occurrenceDate}`
}

export function PendientesFinancieros() {
  const { pendientes, loading, error, confirmar, descartar } = usePendientesFinancieros()
  const [procesando, setProcesando] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (loading || pendientes.length === 0) return null

  async function handleConfirmar(pendiente: PendienteFinanciero) {
    setProcesando(claveDe(pendiente))
    setActionError(null)
    try {
      await confirmar(pendiente)
    } catch (err) {
      setActionError(toErrorMessage(err))
    } finally {
      setProcesando(null)
    }
  }

  async function handleDescartar(pendiente: PendienteFinanciero) {
    setProcesando(claveDe(pendiente))
    setActionError(null)
    try {
      await descartar(pendiente)
    } catch (err) {
      setActionError(toErrorMessage(err))
    } finally {
      setProcesando(null)
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <CalendarIcon />
        </span>
        <h2 className={styles.title}>Pendientes de confirmar</h2>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={styles.list}>
        {pendientes.map((pendiente) => {
          const clave = claveDe(pendiente)
          const esGasto = pendiente.movementType === 'gasto'
          return (
            <div key={clave} className={styles.row}>
              <div className={styles.middle}>
                <span className={styles.title2}>{pendiente.title}</span>
                <span className={styles.date}>{formatPendienteDate(pendiente.occurrenceDate)}</span>
              </div>
              <span className={esGasto ? styles.amountGasto : styles.amount}>
                {esGasto ? '-' : '+'}
                {formatCurrency(pendiente.amount)}
              </span>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.dismissButton}
                  disabled={procesando === clave}
                  onClick={() => handleDescartar(pendiente)}
                >
                  Descartar
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  disabled={procesando === clave}
                  onClick={() => handleConfirmar(pendiente)}
                >
                  Confirmar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
