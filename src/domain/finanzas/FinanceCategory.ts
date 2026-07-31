import type { MovementType } from './Movement'

export interface FinanceCategory {
  id: string
  name: string
  type: MovementType
  icon: string
  color: string
  createdAt: string
}

export interface NewFinanceCategory {
  name: string
  type: MovementType
  icon: string
  color: string
}
