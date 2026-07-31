import type { ResumenMesAhorros } from '../../../domain/ahorros/resumen'
import { formatCurrency, formatUsd } from '../../../utils/currency'
import styles from './ResumenAhorros.module.css'

interface ResumenAhorrosProps {
  saldoUsd: number
  resumenMes: ResumenMesAhorros
}

export function ResumenAhorros({ saldoUsd, resumenMes }: ResumenAhorrosProps) {
  return (
    <section className={styles.card}>
      <span className={styles.label}>Saldo actual en dólares</span>
      <span className={styles.balance}>{formatUsd(saldoUsd)}</span>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Comprado este mes</span>
          <span className={styles.statValue}>{formatUsd(resumenMes.usdComprado)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Pesos destinados</span>
          <span className={styles.statValue}>{formatCurrency(resumenMes.arsDestinado)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Cotización promedio</span>
          <span className={styles.statValue}>
            {resumenMes.cotizacionPromedio != null ? formatCurrency(resumenMes.cotizacionPromedio) : '—'}
          </span>
        </div>
      </div>
    </section>
  )
}
