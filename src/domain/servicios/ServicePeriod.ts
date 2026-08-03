import type { Currency } from '../shared/Currency'

export interface ServicePeriod {
  id: string
  serviceId: string
  dueDate: string
  amount: number
  currency: Currency
  paid: boolean
  paidAt: string | null
  movementId: string | null
  exchangeRate: number | null
  paidAmountArs: number | null
  createdAt: string
}

export interface NewServicePeriod {
  serviceId: string
  dueDate: string
  amount: number
  currency: Currency
}
