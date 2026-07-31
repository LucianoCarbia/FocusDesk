import { getDb } from '../db'
import type { NewService, Service, ServiceFrequency, ServiceUpdate } from '../../domain/servicios/Service'

interface ServiceRow {
  id: string
  name: string
  amount: number
  first_due_date: string
  frequency: ServiceFrequency
  custom_interval_days: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    firstDueDate: row.first_due_date,
    frequency: row.frequency,
    customIntervalDays: row.custom_interval_days,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const ServiceRepository = {
  async findAll(): Promise<Service[]> {
    const db = await getDb()
    const rows = await db.select<ServiceRow[]>('SELECT * FROM services ORDER BY name ASC')
    return rows.map(toService)
  },

  async create(id: string, service: NewService): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO services
        (id, name, amount, first_due_date, frequency, custom_interval_days, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'), datetime('now'))`,
      [
        id,
        service.name,
        service.amount,
        service.firstDueDate,
        service.frequency,
        service.customIntervalDays,
        service.notes,
      ],
    )
  },

  async update(id: string, service: ServiceUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE services SET
        name = $1, amount = $2, first_due_date = $3, frequency = $4,
        custom_interval_days = $5, notes = $6, updated_at = datetime('now')
       WHERE id = $7`,
      [
        service.name,
        service.amount,
        service.firstDueDate,
        service.frequency,
        service.customIntervalDays,
        service.notes,
        id,
      ],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM services WHERE id = $1', [id])
  },
}
