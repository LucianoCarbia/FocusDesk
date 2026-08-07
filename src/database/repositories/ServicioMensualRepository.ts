import { getDb } from '../db'
import type {
  NewServicioMensual,
  ServicioMensual,
  ServicioMensualUpdate,
} from '../../domain/servicios/ServicioMensual'
import type { Currency } from '../../domain/shared/Currency'

interface ServicioMensualRow {
  id: string
  name: string
  days_of_week: string
  amount_per_occurrence: number
  currency: Currency
  start_date: string
  active: number
  created_at: string
  updated_at: string
}

function toServicioMensual(row: ServicioMensualRow): ServicioMensual {
  return {
    id: row.id,
    name: row.name,
    daysOfWeek: row.days_of_week
      .split(',')
      .filter(Boolean)
      .map((n) => Number(n)),
    amountPerOccurrence: row.amount_per_occurrence,
    currency: row.currency,
    startDate: row.start_date,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const ServicioMensualRepository = {
  async findAll(): Promise<ServicioMensual[]> {
    const db = await getDb()
    const rows = await db.select<ServicioMensualRow[]>('SELECT * FROM monthly_services ORDER BY name ASC')
    return rows.map(toServicioMensual)
  },

  async create(id: string, servicio: NewServicioMensual): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO monthly_services
        (id, name, days_of_week, amount_per_occurrence, currency, start_date, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'), datetime('now'))`,
      [
        id,
        servicio.name,
        servicio.daysOfWeek.join(','),
        servicio.amountPerOccurrence,
        servicio.currency,
        servicio.startDate,
        servicio.active ? 1 : 0,
      ],
    )
  },

  async update(id: string, servicio: ServicioMensualUpdate): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE monthly_services SET
        name = $1, days_of_week = $2, amount_per_occurrence = $3, currency = $4,
        start_date = $5, active = $6, updated_at = datetime('now')
       WHERE id = $7`,
      [
        servicio.name,
        servicio.daysOfWeek.join(','),
        servicio.amountPerOccurrence,
        servicio.currency,
        servicio.startDate,
        servicio.active ? 1 : 0,
        id,
      ],
    )
  },

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute('DELETE FROM monthly_services WHERE id = $1', [id])
  },
}
