import { getDb } from '../db'
import type { NewServicePeriod, ServicePeriod } from '../../domain/servicios/ServicePeriod'
import type { Currency } from '../../domain/shared/Currency'

interface ServicePeriodRow {
  id: string
  service_id: string
  due_date: string
  amount: number
  currency: Currency
  paid: number
  paid_at: string | null
  movement_id: string | null
  exchange_rate: number | null
  paid_amount_ars: number | null
  created_at: string
}

function toServicePeriod(row: ServicePeriodRow): ServicePeriod {
  return {
    id: row.id,
    serviceId: row.service_id,
    dueDate: row.due_date,
    amount: row.amount,
    currency: row.currency,
    paid: row.paid === 1,
    paidAt: row.paid_at,
    movementId: row.movement_id,
    exchangeRate: row.exchange_rate,
    paidAmountArs: row.paid_amount_ars,
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
      `INSERT INTO service_periods (id, service_id, due_date, amount, currency, paid, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, datetime('now'))`,
      [id, period.serviceId, period.dueDate, period.amount, period.currency],
    )
  },

  async update(id: string, dueDate: string, amount: number, currency: Currency): Promise<void> {
    const db = await getDb()
    await db.execute(
      'UPDATE service_periods SET due_date = $1, amount = $2, currency = $3 WHERE id = $4',
      [dueDate, amount, currency, id],
    )
  },

  async markAsPaid(
    id: string,
    paidAt: string,
    movementId: string,
    paidAmountArs: number,
    exchangeRate: number | null,
  ): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE service_periods
       SET paid = 1, paid_at = $1, movement_id = $2, paid_amount_ars = $3, exchange_rate = $4
       WHERE id = $5`,
      [paidAt, movementId, paidAmountArs, exchangeRate, id],
    )
  },

  async deleteByService(serviceId: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM service_periods WHERE service_id = $1', [serviceId])
  },
}
