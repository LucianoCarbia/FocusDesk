import { getDb } from '../db'
import type { CalendarEvent, CalendarEventUpdate, NewCalendarEvent } from '../../domain/calendario/CalendarEvent'
import type { MovementType } from '../../domain/shared/MovementType'

interface EventRow {
  id: string
  title: string
  category_id: string
  date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  notes: string | null
  amount: number | null
  movement_type: MovementType | null
  finance_category_id: string | null
  created_at: string
  updated_at: string
}

function toEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    notes: row.notes,
    amount: row.amount,
    movementType: row.movement_type,
    financeCategoryId: row.finance_category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const EventRepository = {
  async findBetween(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const db = await getDb()
    const rows = await db.select<EventRow[]>(
      'SELECT * FROM events WHERE date BETWEEN $1 AND $2 ORDER BY date ASC, start_time ASC',
      [startDate, endDate],
    )
    return rows.map(toEvent)
  },

  async create(id: string, event: NewCalendarEvent): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO events
        (id, title, category_id, date, start_time, end_time, location, notes, amount, movement_type, finance_category_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, datetime('now'), datetime('now'))`,
      [
        id,
        event.title,
        event.categoryId,
        event.date,
        event.startTime,
        event.endTime,
        event.location,
        event.notes,
        event.amount,
        event.movementType,
        event.financeCategoryId,
      ],
    )
  },

  async update(id: string, event: CalendarEventUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE events SET
        title = $1, category_id = $2, date = $3, start_time = $4,
        end_time = $5, location = $6, notes = $7, amount = $8, movement_type = $9,
        finance_category_id = $10, updated_at = datetime('now')
       WHERE id = $11`,
      [
        event.title,
        event.categoryId,
        event.date,
        event.startTime,
        event.endTime,
        event.location,
        event.notes,
        event.amount,
        event.movementType,
        event.financeCategoryId,
        id,
      ],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM events WHERE id = $1', [id])
  },
}
