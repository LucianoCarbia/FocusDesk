import type { Service } from '../../../domain/servicios/Service'
import type { EstadoServicio } from '../../../domain/servicios/estado'
import { PencilIcon, ReceiptIcon, TrashIcon } from '../../../components/icons/Icons'
import type { ServicioConEstado } from '../../../services/servicios/serviceService'
import { formatCurrency } from '../../../utils/currency'
import { toISODate } from '../../../utils/date'
import styles from './ServiciosSection.module.css'

interface ServiciosSectionProps {
  items: ServicioConEstado[]
  loading: boolean
  error: string | null
  onEdit: (item: ServicioConEstado) => void
  onDelete: (service: Service) => void
  onPagar: (periodId: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

function formatDueDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day)).replace('.', '')
}

const ESTADO_LABEL: Record<EstadoServicio, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  vencido: 'Vencido',
}

const ESTADO_CLASS: Record<EstadoServicio, string> = {
  pagado: styles.badgePagado,
  pendiente: styles.badgePendiente,
  vencido: styles.badgeVencido,
}

export function ServiciosSection({ items, loading, error, onEdit, onDelete, onPagar }: ServiciosSectionProps) {
  const mesActual = toISODate(new Date()).slice(0, 7)
  const vencidos = items.filter((i) => i.estado === 'vencido').length
  const pagados = items.filter((i) => i.estado === 'pagado').length
  const totalMensual = items
    .filter((i) => i.period.dueDate.slice(0, 7) === mesActual)
    .reduce((sum, i) => sum + i.period.amount, 0)

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <ReceiptIcon />
        </span>
        <h2 className={styles.title}>Servicios</h2>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Cargando…</p>}
      {!loading && items.length === 0 && (
        <p className={styles.empty}>Todavía no cargaste ningún servicio.</p>
      )}

      {items.length > 0 && (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValueVencido}>{vencidos}</span>
              <span className={styles.statLabel}>Vencidos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValuePagado}>{pagados}</span>
              <span className={styles.statLabel}>Pagados</span>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span>Total mensual comprometido</span>
            <span className={styles.totalValue}>{formatCurrency(totalMensual)}</span>
          </div>

          <div className={styles.list}>
            {items.map((item) => (
              <div key={item.service.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{item.service.name}</span>
                  {item.estado !== 'pendiente' && (
                    <span className={ESTADO_CLASS[item.estado]}>{ESTADO_LABEL[item.estado]}</span>
                  )}
                </div>

                <div className={styles.itemBody}>
                  <span className={styles.itemAmount}>{formatCurrency(item.period.amount)}</span>
                  <span className={styles.itemDate}>Vence {formatDueDate(item.period.dueDate)}</span>
                </div>

                <div className={styles.itemActions}>
                  {item.estado !== 'pagado' && (
                    <button
                      type="button"
                      className={styles.payButton}
                      onClick={() => onPagar(item.period.id)}
                    >
                      Marcar como pagado
                    </button>
                  )}
                  <button type="button" onClick={() => onEdit(item)} aria-label="Editar servicio">
                    <PencilIcon />
                  </button>
                  <button type="button" onClick={() => onDelete(item.service)} aria-label="Eliminar servicio">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
