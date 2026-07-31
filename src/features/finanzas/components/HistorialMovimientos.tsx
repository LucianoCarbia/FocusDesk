import { useState } from 'react'
import type { FiltroMovimiento } from '../hooks/useFinanzasData'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { Movement } from '../../../domain/finanzas/Movement'
import { ArrowDownLeftIcon, ArrowUpRightIcon, ChevronDownIcon, PencilIcon, PiggyBankIcon, TrashIcon } from '../../../components/icons/Icons'
import { formatCurrency } from '../../../utils/currency'
import styles from './HistorialMovimientos.module.css'

interface HistorialMovimientosProps {
  movements: Movement[]
  categories: FinanceCategory[]
  filtro: FiltroMovimiento
  onFiltroChange: (filtro: FiltroMovimiento) => void
  onEdit: (movement: Movement) => void
  onDelete: (movement: Movement) => void
}

const FILTROS: { value: FiltroMovimiento; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'gasto', label: 'Gastos' },
  { value: 'ahorro', label: 'Ahorros' },
]

const PAGE_SIZE = 6

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

function formatMovementDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day)).replace('.', '')
}

export function HistorialMovimientos({
  movements,
  categories,
  filtro,
  onFiltroChange,
  onEdit,
  onDelete,
}: HistorialMovimientosProps) {
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const visibles = mostrarTodos ? movements : movements.slice(0, PAGE_SIZE)

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Historial de movimientos</h2>
        <div className={styles.tabs}>
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={f.value === filtro ? styles.tabActive : styles.tab}
              onClick={() => onFiltroChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visibles.length === 0 && <p className={styles.empty}>No hay movimientos para mostrar.</p>}

      <div className={styles.list}>
        {visibles.map((movement) => {
          const category = categoryById.get(movement.categoryId)
          const esNegativo = movement.type === 'gasto'
          return (
            <div key={movement.id} className={styles.row}>
              <span className={esNegativo ? styles.iconGasto : movement.type === 'ahorro' ? styles.iconAhorro : styles.iconIngreso}>
                {movement.type === 'ahorro' ? <PiggyBankIcon /> : esNegativo ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
              </span>
              <div className={styles.middle}>
                <span className={styles.title2}>{movement.title}</span>
                <div className={styles.meta}>
                  {category && (
                    <span className={styles.badge} style={{ background: `${category.color}1a`, color: category.color }}>
                      {category.name}
                    </span>
                  )}
                  <span className={styles.date}>{formatMovementDate(movement.date)}</span>
                </div>
              </div>
              <div className={styles.right}>
                <span className={esNegativo ? styles.amountGasto : movement.type === 'ahorro' ? styles.amountAhorro : styles.amountIngreso}>
                  {esNegativo ? '-' : '+'}
                  {formatCurrency(movement.amount)}
                </span>
                <div className={styles.actions}>
                  <button type="button" onClick={() => onEdit(movement)} aria-label="Editar movimiento">
                    <PencilIcon />
                  </button>
                  <button type="button" onClick={() => onDelete(movement)} aria-label="Eliminar movimiento">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!mostrarTodos && movements.length > PAGE_SIZE && (
        <button type="button" className={styles.moreButton} onClick={() => setMostrarTodos(true)}>
          Ver más movimientos <ChevronDownIcon />
        </button>
      )}
    </section>
  )
}
