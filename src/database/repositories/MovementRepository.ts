import { getDb } from '../db'
import type { Movement, MovementType, MovementUpdate, NewMovement } from '../../domain/finanzas/Movement'

interface MovementRow {
  id: string
  type: MovementType
  title: string
  amount: number
  category_id: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

function toMovement(row: MovementRow): Movement {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id,
    date: row.date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const MovementRepository = {
  async findBetween(startDate: string, endDate: string): Promise<Movement[]> {
    const db = await getDb()
    const rows = await db.select<MovementRow[]>(
      'SELECT * FROM movements WHERE date BETWEEN $1 AND $2 ORDER BY date DESC, created_at DESC',
      [startDate, endDate],
    )
    return rows.map(toMovement)
  },

  async create(id: string, movement: NewMovement): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO movements
        (id, type, title, amount, category_id, date, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'), datetime('now'))`,
      [id, movement.type, movement.title, movement.amount, movement.categoryId, movement.date, movement.notes],
    )
  },

  async update(id: string, movement: MovementUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE movements SET
        type = $1, title = $2, amount = $3, category_id = $4, date = $5, notes = $6, updated_at = datetime('now')
       WHERE id = $7`,
      [movement.type, movement.title, movement.amount, movement.categoryId, movement.date, movement.notes, id],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM movements WHERE id = $1', [id])
  },
}
