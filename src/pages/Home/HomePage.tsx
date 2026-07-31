import type { Category } from '../../domain/calendario/Category'
import type { AgendaEntry } from '../../domain/calendario/occurrences'
import { BellIcon, ClockIcon, DollarIcon, RepeatIcon, SparkleIcon, WalletIcon } from '../../components/icons/Icons'
import { useHomeAgenda } from '../../features/home/hooks/useHomeAgenda'
import styles from './HomePage.module.css'

const today = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

// TODO: reemplazar por datos reales cuando exista el módulo Finanzas.
const saldoDisponible = 396300

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

interface AgendaSectionProps {
  title: string
  items: AgendaEntry[]
  categories: Category[]
}

function AgendaSection({ title, items, categories }: AgendaSectionProps) {
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionCount}>{items.length}</span>
      </div>

      <div className={styles.agendaList}>
        {items.length === 0 && <p className={styles.empty}>Sin eventos.</p>}

        {items.map((item) => {
          const category = categoryById.get(item.categoryId)
          return (
            <div key={item.id} className={styles.agendaItem} style={{ background: `${category?.color}1a` }}>
              <span className={styles.agendaBar} style={{ background: category?.color }} />
              <span className={styles.agendaTitle}>
                {item.source === 'recurring' && <RepeatIcon />}
                {item.title}
              </span>
              {item.startTime && (
                <span className={styles.agendaTime}>
                  <ClockIcon />
                  {item.startTime} hs
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function HomePage() {
  const formattedToday = today.charAt(0).toUpperCase() + today.slice(1)
  const { categories, eventosHoy, eventosManiana, loading, error } = useHomeAgenda()

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <span className={styles.date}>{formattedToday}</span>
        <button type="button" className={styles.bellButton} aria-label="Notificaciones">
          <BellIcon />
          <span className={styles.bellDot} aria-hidden="true" />
        </button>
      </header>

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

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Cargando…</p>}

      <AgendaSection title="Hoy" items={eventosHoy} categories={categories} />
      <AgendaSection title="Mañana" items={eventosManiana} categories={categories} />

      <footer className={styles.footer}>
        <SparkleIcon />
        <span>Pequeños pasos todos los días, grandes cambios siempre.</span>
      </footer>
    </div>
  )
}
