import type { InsightsMes as InsightsMesData } from '../../../domain/finanzas/summary'
import { CalendarIcon, TrendingDownIcon, WalletIcon } from '../../../components/icons/Icons'
import { formatCurrency } from '../../../utils/currency'
import styles from './InsightsMes.module.css'

interface InsightsMesProps {
  insights: InsightsMesData
}

export function InsightsMes({ insights }: InsightsMesProps) {
  const { categoriaTop, promedioDiario, promedioDiarioAnterior, comparacionPorcentaje, mejorDia } = insights

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Insights del mes</h2>

      <div className={styles.grid}>
        <div className={styles.tile}>
          <span className={styles.icon}>
            <WalletIcon />
          </span>
          <span className={styles.label}>Gastaste más en</span>
          <span className={styles.value}>{categoriaTop ? categoriaTop.name : 'Sin datos'}</span>
          {categoriaTop && <span className={styles.detail}>{categoriaTop.percentage.toFixed(1)}% del total</span>}
        </div>

        <div className={styles.tile}>
          <span className={styles.icon}>
            <TrendingDownIcon />
          </span>
          <span className={styles.label}>Gastos diarios promedio</span>
          <span className={styles.value}>{formatCurrency(promedioDiario)}</span>
          {promedioDiarioAnterior !== null && comparacionPorcentaje !== null && (
            <span className={styles.detail}>
              vs {formatCurrency(promedioDiarioAnterior)} del mes pasado {comparacionPorcentaje >= 0 ? '↓' : '↑'}
            </span>
          )}
        </div>

        <div className={styles.tile}>
          <span className={styles.icon}>
            <CalendarIcon />
          </span>
          <span className={styles.label}>Mejor día para ahorrar</span>
          <span className={styles.value}>{mejorDia ? mejorDia.label : 'Sin datos'}</span>
          {mejorDia && <span className={styles.detail}>Gastás {Math.round(mejorDia.porcentajeMenor)}% menos</span>}
        </div>
      </div>
    </section>
  )
}
