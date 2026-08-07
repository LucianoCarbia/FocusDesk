import type { Currency } from '../shared/Currency'

export interface ServicioMensual {
  id: string
  name: string
  daysOfWeek: number[] // 0 = lunes … 6 = domingo
  amountPerOccurrence: number
  currency: Currency
  startDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface NewServicioMensual {
  name: string
  daysOfWeek: number[]
  amountPerOccurrence: number
  currency: Currency
  startDate: string
  active: boolean
}

export type ServicioMensualUpdate = NewServicioMensual
