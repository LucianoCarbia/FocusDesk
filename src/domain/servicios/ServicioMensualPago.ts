import type { Currency } from '../shared/Currency'

export interface ServicioMensualPago {
  id: string
  servicioMensualId: string
  month: string // 'YYYY-MM'
  occurrences: number
  amount: number
  currency: Currency
  paidAt: string
  movementId: string
  exchangeRate: number | null
  paidAmountArs: number | null
}

export interface NewServicioMensualPago {
  servicioMensualId: string
  month: string
  occurrences: number
  amount: number
  currency: Currency
  paidAt: string
  movementId: string
  exchangeRate: number | null
  paidAmountArs: number | null
}
