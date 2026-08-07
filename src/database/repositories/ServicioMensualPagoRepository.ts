import { getDb } from '../db'
import type { NewServicioMensualPago, ServicioMensualPago } from '../../domain/servicios/ServicioMensualPago'
import type { Currency } from '../../domain/shared/Currency'

interface ServicioMensualPagoRow {
  id: string
  monthly_service_id: string
  month: string
  occurrences: number
  amount: number
  currency: Currency
  paid_at: string
  movement_id: string
  exchange_rate: number | null
  paid_amount_ars: number | null
}

function toServicioMensualPago(row: ServicioMensualPagoRow): ServicioMensualPago {
  return {
    id: row.id,
    servicioMensualId: row.monthly_service_id,
    month: row.month,
    occurrences: row.occurrences,
    amount: row.amount,
    currency: row.currency,
    paidAt: row.paid_at,
    movementId: row.movement_id,
    exchangeRate: row.exchange_rate,
    paidAmountArs: row.paid_amount_ars,
  }
}

export const ServicioMensualPagoRepository = {
  async findAll(): Promise<ServicioMensualPago[]> {
    const db = await getDb()
    const rows = await db.select<ServicioMensualPagoRow[]>('SELECT * FROM monthly_service_payments')
    return rows.map(toServicioMensualPago)
  },

  async create(id: string, pago: NewServicioMensualPago): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO monthly_service_payments
        (id, monthly_service_id, month, occurrences, amount, currency, paid_at, movement_id, exchange_rate, paid_amount_ars)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        pago.servicioMensualId,
        pago.month,
        pago.occurrences,
        pago.amount,
        pago.currency,
        pago.paidAt,
        pago.movementId,
        pago.exchangeRate,
        pago.paidAmountArs,
      ],
    )
  },
}
