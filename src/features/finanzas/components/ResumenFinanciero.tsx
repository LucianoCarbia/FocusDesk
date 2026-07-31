import type { ResumenMensual } from '../../../domain/finanzas/summary'
import { formatCurrency } from '../../../utils/currency'
import styles from './ResumenFinanciero.module.css'

interface ResumenFinancieroProps {
  resumen: ResumenMensual
}

export function ResumenFinanciero({ resumen }: ResumenFinancieroProps) {
  const { ingresos, gastos, ahorros, balance, porcentajeUtilizado, porcentajeDisponible } = resumen
  const esSuperavit = balance >= 0
  const anchoBarra = Math.min(100, Math.max(0, porcentajeUtilizado))

  return (
    <section className={styles.card}>
      <span className={styles.label}>Balance del mes</span>
      <span className={styles.balance}>{formatCurrency(balance)}</span>
      <span className={styles.estado}>
        <span className={esSuperavit ? styles.dotOk : styles.dotWarn} />
        {esSuperavit ? 'Superávit del mes' : 'Déficit del mes'}
      </span>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Ingresos</span>
          <span className={styles.statValueIngreso}>{formatCurrency(ingresos)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Gastos</span>
          <span className={styles.statValueGasto}>{formatCurrency(gastos)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Ahorro</span>
          <span className={styles.statValueAhorro}>{formatCurrency(ahorros)}</span>
        </div>
      </div>

      <div className={styles.progressRow}>
        <span>{Math.round(porcentajeUtilizado)}% utilizado del ingreso</span>
        <span>{Math.round(porcentajeDisponible)}% disponible</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${anchoBarra}%` }} />
      </div>
    </section>
  )
}
