import { getDb } from '../db'
import type {
  DaySchedule,
  NewRecurringEvent,
  RecurringEvent,
  RecurringEventSkip,
  RecurringEventUpdate,
  ScheduleMode,
} from '../../domain/calendario/RecurringEvent'
import type { MovementType } from '../../domain/shared/MovementType'

interface RecurringEventRow {
  id: string
  title: string
  category_id: string
  days_of_week: string
  schedule_mode: ScheduleMode
  start_time: string | null
  end_time: string | null
  location: string | null
  notes: string | null
  start_date: string
  end_date: string | null
  skip_holidays: number
  amount: number | null
  movement_type: MovementType | null
  finance_category_id: string | null
  created_at: string
  updated_at: string
}

interface SkipRow {
  id: string
  recurring_event_id: string
  start_date: string
  end_date: string
}

interface DayScheduleRow {
  id: string
  recurring_event_id: string
  weekday: number
  start_time: string | null
  end_time: string | null
}

function toRecurringEvent(row: RecurringEventRow, daySchedules: DaySchedule[]): RecurringEvent {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    daysOfWeek: row.days_of_week
      .split(',')
      .filter(Boolean)
      .map((n) => Number(n)),
    scheduleMode: row.schedule_mode,
    startTime: row.start_time,
    endTime: row.end_time,
    daySchedules,
    location: row.location,
    notes: row.notes,
    startDate: row.start_date,
    endDate: row.end_date,
    skipHolidays: row.skip_holidays === 1,
    amount: row.amount,
    movementType: row.movement_type,
    financeCategoryId: row.finance_category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toSkip(row: SkipRow): RecurringEventSkip {
  return {
    id: row.id,
    recurringEventId: row.recurring_event_id,
    startDate: row.start_date,
    endDate: row.end_date,
  }
}

async function findDaySchedulesByEvent(recurringEventIds: string[]): Promise<Map<string, DaySchedule[]>> {
  const map = new Map<string, DaySchedule[]>()
  if (recurringEventIds.length === 0) return map

  const db = await getDb()
  const placeholders = recurringEventIds.map((_, i) => `$${i + 1}`).join(', ')
  const rows = await db.select<DayScheduleRow[]>(
    `SELECT * FROM recurring_event_day_schedules WHERE recurring_event_id IN (${placeholders})`,
    recurringEventIds,
  )
  for (const row of rows) {
    const list = map.get(row.recurring_event_id) ?? []
    list.push({ weekday: row.weekday, startTime: row.start_time, endTime: row.end_time })
    map.set(row.recurring_event_id, list)
  }
  return map
}

async function attachDaySchedules(rows: RecurringEventRow[]): Promise<RecurringEvent[]> {
  const schedulesByEvent = await findDaySchedulesByEvent(rows.map((r) => r.id))
  return rows.map((row) => toRecurringEvent(row, schedulesByEvent.get(row.id) ?? []))
}

async function replaceDaySchedules(
  recurringEventId: string,
  scheduleMode: ScheduleMode,
  daySchedules: DaySchedule[],
): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM recurring_event_day_schedules WHERE recurring_event_id = $1', [recurringEventId])
  if (scheduleMode !== 'personalizado') return

  for (const schedule of daySchedules) {
    await db.execute(
      'INSERT INTO recurring_event_day_schedules (id, recurring_event_id, weekday, start_time, end_time) VALUES ($1, $2, $3, $4, $5)',
      [crypto.randomUUID(), recurringEventId, schedule.weekday, schedule.startTime, schedule.endTime],
    )
  }
}

export const RecurringEventRepository = {
  async findAll(): Promise<RecurringEvent[]> {
    const db = await getDb()
    const rows = await db.select<RecurringEventRow[]>('SELECT * FROM recurring_events ORDER BY title ASC')
    return attachDaySchedules(rows)
  },

  async findActive(startDate: string, endDate: string): Promise<RecurringEvent[]> {
    const db = await getDb()
    const rows = await db.select<RecurringEventRow[]>(
      'SELECT * FROM recurring_events WHERE start_date <= $1 AND (end_date IS NULL OR end_date >= $2) ORDER BY title ASC',
      [endDate, startDate],
    )
    return attachDaySchedules(rows)
  },

  async findSkips(recurringEventIds: string[]): Promise<RecurringEventSkip[]> {
    if (recurringEventIds.length === 0) return []
    const db = await getDb()
    const placeholders = recurringEventIds.map((_, i) => `$${i + 1}`).join(', ')
    const rows = await db.select<SkipRow[]>(
      `SELECT * FROM recurring_event_skips WHERE recurring_event_id IN (${placeholders})`,
      recurringEventIds,
    )
    return rows.map(toSkip)
  },

  async create(id: string, event: NewRecurringEvent): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO recurring_events
        (id, title, category_id, days_of_week, schedule_mode, start_time, end_time, location, notes, start_date, end_date, skip_holidays, amount, movement_type, finance_category_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, datetime('now'), datetime('now'))`,
      [
        id,
        event.title,
        event.categoryId,
        event.daysOfWeek.join(','),
        event.scheduleMode,
        event.startTime,
        event.endTime,
        event.location,
        event.notes,
        event.startDate,
        event.endDate,
        event.skipHolidays ? 1 : 0,
        event.amount,
        event.movementType,
        event.financeCategoryId,
      ],
    )
    await replaceDaySchedules(id, event.scheduleMode, event.daySchedules)
  },

  async update(id: string, event: RecurringEventUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE recurring_events SET
        title = $1, category_id = $2, days_of_week = $3, schedule_mode = $4, start_time = $5, end_time = $6,
        location = $7, notes = $8, start_date = $9, end_date = $10, skip_holidays = $11,
        amount = $12, movement_type = $13, finance_category_id = $14,
        updated_at = datetime('now')
       WHERE id = $15`,
      [
        event.title,
        event.categoryId,
        event.daysOfWeek.join(','),
        event.scheduleMode,
        event.startTime,
        event.endTime,
        event.location,
        event.notes,
        event.startDate,
        event.endDate,
        event.skipHolidays ? 1 : 0,
        event.amount,
        event.movementType,
        event.financeCategoryId,
        id,
      ],
    )
    await replaceDaySchedules(id, event.scheduleMode, event.daySchedules)
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM recurring_events WHERE id = $1', [id])
  },

  async addSkip(id: string, recurringEventId: string, startDate: string, endDate: string): Promise<void> {
    const db = await getDb()
    await db.execute(
      'INSERT INTO recurring_event_skips (id, recurring_event_id, start_date, end_date) VALUES ($1, $2, $3, $4)',
      [id, recurringEventId, startDate, endDate],
    )
  },

  async removeSkip(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM recurring_event_skips WHERE id = $1', [id])
  },
}
