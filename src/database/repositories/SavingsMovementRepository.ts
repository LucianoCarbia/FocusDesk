import { getDb } from '../db'
import type {
  NewSavingsMovement,
  SavingsMovement,
  SavingsMovementKind,
  SavingsMovementUpdate,
} from '../../domain/ahorros/SavingsMovement'

interface SavingsMovementRow {
  id: string
  date: string
  kind: SavingsMovementKind
  usd_amount: number
  ars_amount: number
  notes: string | null
  movement_id: string
  created_at: string
}

function toSavingsMovement(row: SavingsMovementRow): SavingsMovement {
  return {
    id: row.id,
    date: row.date,
    kind: row.kind,
    usdAmount: row.usd_amount,
    arsAmount: row.ars_amount,
    notes: row.notes,
    movementId: row.movement_id,
    createdAt: row.created_at,
  }
}

export const SavingsMovementRepository = {
  async findAll(): Promise<SavingsMovement[]> {
    const db = await getDb()
    const rows = await db.select<SavingsMovementRow[]>(
      'SELECT * FROM savings_movements ORDER BY date DESC, created_at DESC',
    )
    return rows.map(toSavingsMovement)
  },

  async create(id: string, movement: NewSavingsMovement): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO savings_movements
        (id, date, kind, usd_amount, ars_amount, notes, movement_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'))`,
      [id, movement.date, movement.kind, movement.usdAmount, movement.arsAmount, movement.notes, movement.movementId],
    )
  },

  async update(id: string, movement: SavingsMovementUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE savings_movements SET date = $1, kind = $2, usd_amount = $3, ars_amount = $4, notes = $5
       WHERE id = $6`,
      [movement.date, movement.kind, movement.usdAmount, movement.arsAmount, movement.notes, id],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM savings_movements WHERE id = $1', [id])
  },

  async deleteByMovementId(movementId: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM savings_movements WHERE movement_id = $1', [movementId])
  },
}
