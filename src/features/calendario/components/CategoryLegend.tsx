import type { Category } from '../../../domain/calendario/Category'
import styles from './CategoryLegend.module.css'

interface CategoryLegendProps {
  categories: Category[]
}

export function CategoryLegend({ categories }: CategoryLegendProps) {
  if (categories.length === 0) return null

  return (
    <div className={styles.legend}>
      {categories.map((category) => (
        <span key={category.id} className={styles.item}>
          <span className={styles.dot} style={{ background: category.color }} />
          {category.name}
        </span>
      ))}
    </div>
  )
}
