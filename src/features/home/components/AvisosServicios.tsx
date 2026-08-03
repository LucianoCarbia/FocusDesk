import { useState } from 'react'
import { AlertTriangleIcon } from '../../../components/icons/Icons'
import { toErrorMessage } from '../../../utils/errors'
import { useAvisosServicios } from '../hooks/useAvisosServicios'
import styles from './AvisosServicios.module.css'

export function AvisosServicios() {
  const { avisos, loading, error, pagar } = useAvisosServicios()
  const [procesando, setProcesando] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (loading || avisos.length === 0) return null

  const vencidos = avisos.filter((a) => a.diasRestantes < 0)
  const proximos = avisos.filter((a) => a.diasRestantes >= 0)

  async function handlePagar(periodId: string) {
    setProcesando(periodId)
    setActionError(null)
    try {
      await pagar(periodId)
    } catch (err) {
      setActionError(toErrorMessage(err))
    } finally {
      setProcesando(null)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Avisos</h2>
        <span className={styles.sectionCount}>{avisos.length}</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {actionError && <p className={styles.error}>{actionError}</p>}

      {vencidos.length > 0 && (
        <div className={styles.alertBox}>
          <span className={styles.alertHeader}>
            <AlertTriangleIcon /> Tenés pagos vencidos
          </span>
          <div className={styles.list}>
            {vencidos.map((aviso) => (
              <div key={aviso.periodId} className={styles.itemVencido}>
                <span className={styles.mensaje}>{aviso.mensaje}</span>
                <button
                  type="button"
                  className={styles.payButton}
                  disabled={procesando === aviso.periodId}
                  onClick={() => handlePagar(aviso.periodId)}
                >
                  Pagar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {proximos.length > 0 && (
        <div className={styles.list}>
          {proximos.map((aviso) => (
            <div key={aviso.periodId} className={styles.item}>
              <span className={styles.mensaje}>{aviso.mensaje}</span>
              <button
                type="button"
                className={styles.payButton}
                disabled={procesando === aviso.periodId}
                onClick={() => handlePagar(aviso.periodId)}
              >
                Pagar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
