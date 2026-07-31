import { useState } from 'react'
import type { Category } from '../../../domain/calendario/Category'
import styles from './CategorySelect.module.css'

const NUEVA_CATEGORIA = '__nueva__'

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (name: string) => void
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const existe = categories.some((c) => c.name === value)
  const [creandoNueva, setCreandoNueva] = useState(value !== '' && !existe)

  if (creandoNueva) {
    return (
      <div className={styles.newRow}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          autoFocus
          required
        />
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => {
            setCreandoNueva(false)
            onChange('')
          }}
        >
          Elegir existente
        </button>
      </div>
    )
  }

  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => {
        if (e.target.value === NUEVA_CATEGORIA) {
          setCreandoNueva(true)
          onChange('')
        } else {
          onChange(e.target.value)
        }
      }}
      required
    >
      <option value="" disabled>
        Elegí una categoría
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.name}>
          {c.name}
        </option>
      ))}
      <option value={NUEVA_CATEGORIA}>+ Nueva categoría…</option>
    </select>
  )
}
