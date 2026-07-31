export type ServiceFrequency = 'mensual' | 'anual' | 'personalizada'

export interface Service {
  id: string
  name: string
  amount: number
  firstDueDate: string
  frequency: ServiceFrequency
  customIntervalDays: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface NewService {
  name: string
  amount: number
  firstDueDate: string
  frequency: ServiceFrequency
  customIntervalDays: number | null
  notes: string | null
}

export type ServiceUpdate = NewService
