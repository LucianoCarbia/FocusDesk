import { useMemo } from 'react'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { MovementType } from '../../../domain/shared/MovementType'
import styles from './FinanceLinkFields.module.css'

const TIPOS: { value: MovementType; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto', label: 'Gasto' },
  { value: 'ahorro', label: 'Ahorro' },
]

interface FinanceLinkFieldsProps {
  financeCategories: FinanceCategory[]
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  type: MovementType
  onTypeChange: (type: MovementType) => void
  amount: string
  onAmountChange: (amount: string) => void
  categoryName: string
  onCategoryNameChange: (name: string) => void
  datalistId: string
}

export function FinanceLinkFields({
  financeCategories,
  enabled,
  onEnabledChange,
  type,
  onTypeChange,
  amount,
  onAmountChange,
  categoryName,
  onCategoryNameChange,
  datalistId,
}: FinanceLinkFieldsProps) {
  const categoriasDelTipo = useMemo(
    () => financeCategories.filter((c) => c.type === type),
    [financeCategories, type],
  )

  return (
    <div className={styles.wrapper}>
      <label className={styles.checkboxField}>
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
        <span>Vincular a Finanzas</span>
      </label>

      {enabled && (
        <div className={styles.fields}>
          <div className={styles.typeTabs}>
            {TIPOS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={t.value === type ? styles.typeTabActive : styles.typeTab}
                onClick={() => onTypeChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span>Monto</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Categoría de Finanzas</span>
            <input
              value={categoryName}
              onChange={(e) => onCategoryNameChange(e.target.value)}
              list={datalistId}
              placeholder="Elegí una o escribí una nueva"
              required
            />
            <datalist id={datalistId}>
              {categoriasDelTipo.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
        </div>
      )}
    </div>
  )
}
