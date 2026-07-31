export interface RecurringEventSkip {
  id: string
  recurringEventId: string
  startDate: string
  endDate: string
}

export interface RecurringEvent {
  id: string
  title: string
  categoryId: string
  daysOfWeek: number[] // 0 = lunes … 6 = domingo
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  startDate: string
  endDate: string | null // null = indefinido
  skipHolidays: boolean
  createdAt: string
  updatedAt: string
}

export interface NewRecurringEvent {
  title: string
  categoryId: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  startDate: string
  endDate: string | null
  skipHolidays: boolean
}

export type RecurringEventUpdate = NewRecurringEvent
