import type { AvisoServicio } from '../../../domain/servicios/avisos'
import { AlertTriangleIcon } from '../../../components/icons/Icons'
import { PagoServicioDialog } from '../../servicios/components/PagoServicioDialog'
import { usePagoServicio } from '../../servicios/hooks/usePagoServicio'
import { useAvisosServicios } from '../hooks/useAvisosServicios'
import styles from './AvisosServicios.module.css'

export function AvisosServicios() {
  const { avisos, loading, error, pagar } = useAvisosServicios()
  const { pendiente, procesando, error: actionError, solicitarPago, confirmarCotizacion, cancelar } =
    usePagoServicio(pagar)

  if (loading || avisos.length === 0) return null

  const vencidos = avisos.filter((a) => a.diasRestantes < 0)
  const proximos = avisos.filter((a) => a.diasRestantes >= 0)

  function pagarAviso(aviso: AvisoServicio) {
    void solicitarPago({
      periodId: aviso.periodId,
      serviceName: aviso.name,
      amount: aviso.amount,
      currency: aviso.currency,
      dueDate: aviso.dueDate,
    })
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
                  onClick={() => pagarAviso(aviso)}
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
                onClick={() => pagarAviso(aviso)}
              >
                Pagar
              </button>
            </div>
          ))}
        </div>
      )}

      {pendiente && (
        <PagoServicioDialog
          serviceName={pendiente.serviceName}
          usdAmount={pendiente.amount}
          onClose={cancelar}
          onConfirm={confirmarCotizacion}
        />
      )}
    </section>
  )
}
