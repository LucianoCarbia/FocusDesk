import { getDb } from '../db'
import type { FinanceCategory, NewFinanceCategory } from '../../domain/finanzas/FinanceCategory'
import type { MovementType } from '../../domain/finanzas/Movement'

interface FinanceCategoryRow {
  id: string
  name: string
  type: MovementType
  icon: string
  color: string
  created_at: string
}

function toFinanceCategory(row: FinanceCategoryRow): FinanceCategory {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  }
}

export const FinanceCategoryRepository = {
  async findAll(): Promise<FinanceCategory[]> {
    const db = await getDb()
    const rows = await db.select<FinanceCategoryRow[]>('SELECT * FROM finance_categories ORDER BY name ASC')
    return rows.map(toFinanceCategory)
  },

  async findByNameAndType(name: string, type: MovementType): Promise<FinanceCategory | null> {
    const db = await getDb()
    const rows = await db.select<FinanceCategoryRow[]>(
      'SELECT * FROM finance_categories WHERE name = $1 AND type = $2',
      [name, type],
    )
    return rows[0] ? toFinanceCategory(rows[0]) : null
  },

  async create(id: string, category: NewFinanceCategory): Promise<void> {
    const db = await getDb()
    await db.execute(
      "INSERT INTO finance_categories (id, name, type, icon, color, created_at) VALUES ($1, $2, $3, $4, $5, datetime('now'))",
      [id, category.name, category.type, category.icon, category.color],
    )
  },
}
