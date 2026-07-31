export type MovementLinkSourceType = 'event' | 'recurring'
export type MovementLinkStatus = 'confirmed' | 'dismissed'

export interface MovementLink {
  id: string
  sourceType: MovementLinkSourceType
  sourceId: string
  occurrenceDate: string
  movementId: string | null
  status: MovementLinkStatus
  createdAt: string
}

export interface NewMovementLink {
  sourceType: MovementLinkSourceType
  sourceId: string
  occurrenceDate: string
  movementId: string | null
  status: MovementLinkStatus
}
