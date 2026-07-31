import type { MovementType } from '../shared/MovementType'

export interface CalendarEvent {
  id: string
  title: string
  categoryId: string
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  amount: number | null
  movementType: MovementType | null
  financeCategoryId: string | null
  createdAt: string
  updatedAt: string
}

export interface NewCalendarEvent {
  title: string
  categoryId: string
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  amount: number | null
  movementType: MovementType | null
  financeCategoryId: string | null
}

export type CalendarEventUpdate = NewCalendarEvent
