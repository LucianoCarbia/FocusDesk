import type { EvolucionMensual as EvolucionMensualData } from '../../../domain/ahorros/resumen'
import { formatCurrency, formatUsd } from '../../../utils/currency'
import styles from './EvolucionMensual.module.css'

interface EvolucionMensualProps {
  evolucion: EvolucionMensualData[]
}

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })

function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const label = monthFormatter.format(new Date(year, month - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function EvolucionMensual({ evolucion }: EvolucionMensualProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Evolución mensual</h2>

      {evolucion.length === 0 && <p className={styles.empty}>Todavía no hay movimientos registrados.</p>}

      {evolucion.length > 0 && (
        <div className={styles.list}>
          {[...evolucion].reverse().map((mes) => (
            <div key={mes.yearMonth} className={styles.row}>
              <div className={styles.rowHeader}>
                <span className={styles.rowMonth}>{formatYearMonth(mes.yearMonth)}</span>
                <span className={styles.rowSaldo}>Saldo: {formatUsd(mes.saldoAcumuladoUsd)}</span>
              </div>
              <div className={styles.rowDetail}>
                {mes.usdComprado > 0 && (
                  <span className={styles.detailCompra}>+{formatUsd(mes.usdComprado)} comprados</span>
                )}
                {mes.usdVendido > 0 && (
                  <span className={styles.detailVenta}>-{formatUsd(mes.usdVendido)} vendidos</span>
                )}
                {mes.arsDestinado > 0 && <span className={styles.detailArs}>{formatCurrency(mes.arsDestinado)}</span>}
                {mes.cotizacionPromedio != null && (
                  <span className={styles.detailCotizacion}>~{formatCurrency(mes.cotizacionPromedio)}/USD</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
