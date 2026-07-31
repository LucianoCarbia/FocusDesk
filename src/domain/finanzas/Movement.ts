import type { MovementType } from '../shared/MovementType'

export type { MovementType } from '../shared/MovementType'

export interface Movement {
  id: string
  type: MovementType
  title: string
  amount: number
  categoryId: string
  date: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface NewMovement {
  type: MovementType
  title: string
  amount: number
  categoryId: string
  date: string
  notes: string | null
}

export type MovementUpdate = NewMovement
