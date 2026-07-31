export type SavingsMovementKind = 'compra' | 'venta'

export interface SavingsMovement {
  id: string
  date: string
  kind: SavingsMovementKind
  usdAmount: number
  arsAmount: number
  notes: string | null
  movementId: string
  createdAt: string
}

export interface NewSavingsMovement {
  date: string
  kind: SavingsMovementKind
  usdAmount: number
  arsAmount: number
  notes: string | null
  movementId: string
}

export type SavingsMovementUpdate = Omit<NewSavingsMovement, 'movementId'>
