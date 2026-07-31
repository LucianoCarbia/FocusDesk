import { getDb } from '../db'
import type { Category, NewCategory } from '../../domain/calendario/Category'

interface CategoryRow {
  id: string
  name: string
  color: string
  created_at: string
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  }
}

export const CategoryRepository = {
  async findAll(): Promise<Category[]> {
    const db = await getDb()
    const rows = await db.select<CategoryRow[]>('SELECT * FROM categories ORDER BY name ASC')
    return rows.map(toCategory)
  },

  async findByName(name: string): Promise<Category | null> {
    const db = await getDb()
    const rows = await db.select<CategoryRow[]>('SELECT * FROM categories WHERE name = $1', [name])
    return rows[0] ? toCategory(rows[0]) : null
  },

  async create(id: string, category: NewCategory): Promise<void> {
    const db = await getDb()
    await db.execute(
      "INSERT INTO categories (id, name, color, created_at) VALUES ($1, $2, $3, datetime('now'))",
      [id, category.name, category.color],
    )
  },
}
