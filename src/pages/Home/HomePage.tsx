import type { AgendaItem } from '../../types/agenda'
import { ClockIcon, DollarIcon, SparkleIcon, WalletIcon } from '../../components/icons/Icons'
import styles from './HomePage.module.css'

// TODO: reemplazar por datos reales cuando existan los módulos Calendario y Finanzas.
const saldoDisponible = 396300

const eventosHoy: AgendaItem[] = [
  { id: '1', title: 'Trabajo - Turno mañana', time: '08:00 hs', category: 'trabajo' },
  { id: '2', title: 'Cursada Análisis Matemático', time: '18:00 hs', category: 'facultad' },
]

const eventosManiana: AgendaItem[] = [
  { id: '3', title: 'Turno Dentista', time: '10:00 hs', category: 'turno' },
]

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function AgendaSection({ title, items }: { title: string; items: AgendaItem[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{items.length}</span>
      </div>

      <div className={styles.agendaList}>
        {items.map((item) => (
          <div key={item.id} className={styles.agendaItem} data-category={item.category}>
            <span className={styles.agendaTitle}>{item.title}</span>
            <span className={styles.agendaTime}>
              <ClockIcon />
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.summaryCard}>
        <span className={styles.summaryIcon} aria-hidden="true">
          <WalletIcon />
        </span>
        <div className={styles.summaryText}>
          <span className={styles.summaryLabel}>Saldo disponible del mes</span>
          <span className={styles.summaryValue}>{currencyFormatter.format(saldoDisponible)}</span>
        </div>
        <span className={styles.summaryBadge} aria-hidden="true">
          <DollarIcon />
        </span>
      </section>

      <AgendaSection title="Hoy" items={eventosHoy} />
      <AgendaSection title="Mañana" items={eventosManiana} />

      <footer className={styles.footer}>
        <SparkleIcon />
        <span>Pequeños pasos todos los días, grandes cambios siempre.</span>
      </footer>
    </div>
  )
}
