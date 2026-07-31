import { categoryIcon } from '../../../domain/finanzas/categoryIcons'
import type { GastoPorCategoria } from '../../../domain/finanzas/summary'
import { formatCurrency } from '../../../utils/currency'
import styles from './GastosPorCategoria.module.css'

interface GastosPorCategoriaProps {
  gastos: GastoPorCategoria[]
}

export function GastosPorCategoria({ gastos }: GastosPorCategoriaProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Gastos por categoría</h2>

      {gastos.length === 0 && <p className={styles.empty}>Todavía no registraste gastos este mes.</p>}

      <div className={styles.list}>
        {gastos.map((gasto) => {
          const Icon = categoryIcon(gasto.icon)
          return (
            <div key={gasto.categoryId} className={styles.row}>
              <span className={styles.icon} style={{ background: `${gasto.color}1a`, color: gasto.color }}>
                <Icon />
              </span>
              <div className={styles.middle}>
                <span className={styles.name}>{gasto.name}</span>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${gasto.percentage}%`, background: gasto.color }} />
                </div>
              </div>
              <div className={styles.amounts}>
                <span className={styles.amount}>{formatCurrency(gasto.amount)}</span>
                <span className={styles.percentage}>{gasto.percentage.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {gastos[0] && (
        <p className={styles.insight}>
          La mayoría de tus gastos fueron en <strong>{gastos[0].name}</strong>.
        </p>
      )}
    </section>
  )
}
