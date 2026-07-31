import type { SavingsMovement } from '../../../domain/ahorros/SavingsMovement'
import { PencilIcon, TrashIcon } from '../../../components/icons/Icons'
import { formatCurrency, formatUsd } from '../../../utils/currency'
import styles from './HistorialAhorros.module.css'

interface HistorialAhorrosProps {
  movements: SavingsMovement[]
  onEdit: (movement: SavingsMovement) => void
  onDelete: (movement: SavingsMovement) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day)).replace('.', '')
}

export function HistorialAhorros({ movements, onEdit, onDelete }: HistorialAhorrosProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Historial de movimientos</h2>

      {movements.length === 0 && <p className={styles.empty}>Todavía no registraste compras ni ventas.</p>}

      <div className={styles.list}>
        {movements.map((movement) => {
          const esVenta = movement.kind === 'venta'
          const cotizacion = movement.arsAmount / movement.usdAmount
          return (
            <div key={movement.id} className={styles.row}>
              <span className={esVenta ? styles.badgeVenta : styles.badgeCompra}>
                {esVenta ? 'Venta' : 'Compra'}
              </span>
              <div className={styles.middle}>
                <span className={styles.amountUsd}>
                  {esVenta ? '-' : '+'}
                  {formatUsd(movement.usdAmount)}
                </span>
                <span className={styles.meta}>
                  {formatCurrency(movement.arsAmount)} · {formatCurrency(cotizacion)}/USD · {formatDate(movement.date)}
                </span>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => onEdit(movement)} aria-label="Editar movimiento">
                  <PencilIcon />
                </button>
                <button type="button" onClick={() => onDelete(movement)} aria-label="Eliminar movimiento">
                  <TrashIcon />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
