import { getDb } from '../db'
import type { NewServicePeriod, ServicePeriod } from '../../domain/servicios/ServicePeriod'

interface ServicePeriodRow {
  id: string
  service_id: string
  due_date: string
  amount: number
  paid: number
  paid_at: string | null
  movement_id: string | null
  created_at: string
}

function toServicePeriod(row: ServicePeriodRow): ServicePeriod {
  return {
    id: row.id,
    serviceId: row.service_id,
    dueDate: row.due_date,
    amount: row.amount,
    paid: row.paid === 1,
    paidAt: row.paid_at,
    movementId: row.movement_id,
    createdAt: row.created_at,
  }
}

export const ServicePeriodRepository = {
  async findAll(): Promise<ServicePeriod[]> {
    const db = await getDb()
    const rows = await db.select<ServicePeriodRow[]>('SELECT * FROM service_periods ORDER BY due_date ASC')
    return rows.map(toServicePeriod)
  },

  async create(id: string, period: NewServicePeriod): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO service_periods (id, service_id, due_date, amount, paid, created_at)
       VALUES ($1, $2, $3, $4, 0, datetime('now'))`,
      [id, period.serviceId, period.dueDate, period.amount],
    )
  },

  async update(id: string, dueDate: string, amount: number): Promise<void> {
    const db = await getDb()
    await db.execute('UPDATE service_periods SET due_date = $1, amount = $2 WHERE id = $3', [dueDate, amount, id])
  },

  async markAsPaid(id: string, paidAt: string, movementId: string): Promise<void> {
    const db = await getDb()
    await db.execute(
      'UPDATE service_periods SET paid = 1, paid_at = $1, movement_id = $2 WHERE id = $3',
      [paidAt, movementId, id],
    )
  },

  async deleteByService(serviceId: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM service_periods WHERE service_id = $1', [serviceId])
  },
}
