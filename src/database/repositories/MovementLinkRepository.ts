import { getDb } from '../db'
import type {
  MovementLink,
  MovementLinkSourceType,
  MovementLinkStatus,
  NewMovementLink,
} from '../../domain/finanzas/MovementLink'

interface MovementLinkRow {
  id: string
  source_type: MovementLinkSourceType
  source_id: string
  occurrence_date: string
  movement_id: string | null
  status: MovementLinkStatus
  created_at: string
}

function toMovementLink(row: MovementLinkRow): MovementLink {
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    occurrenceDate: row.occurrence_date,
    movementId: row.movement_id,
    status: row.status,
    createdAt: row.created_at,
  }
}

export const MovementLinkRepository = {
  async findByDateRange(startDate: string, endDate: string): Promise<MovementLink[]> {
    const db = await getDb()
    const rows = await db.select<MovementLinkRow[]>(
      'SELECT * FROM movement_links WHERE occurrence_date BETWEEN $1 AND $2',
      [startDate, endDate],
    )
    return rows.map(toMovementLink)
  },

  async create(id: string, link: NewMovementLink): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO movement_links
        (id, source_type, source_id, occurrence_date, movement_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, datetime('now'))`,
      [id, link.sourceType, link.sourceId, link.occurrenceDate, link.movementId, link.status],
    )
  },

  async deleteByMovementId(movementId: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM movement_links WHERE movement_id = $1', [movementId])
  },
}
