export interface RecurringEventSkip {
  id: string
  recurringEventId: string
  startDate: string
  endDate: string
}

import type { MovementType } from '../shared/MovementType'

export type ScheduleMode = 'unico' | 'personalizado'

export interface DaySchedule {
  weekday: number // 0 = lunes … 6 = domingo
  startTime: string | null
  endTime: string | null
}

export interface RecurringEvent {
  id: string
  title: string
  categoryId: string
  daysOfWeek: number[] // 0 = lunes … 6 = domingo
  scheduleMode: ScheduleMode
  startTime: string | null // horario cuando scheduleMode === 'unico'
  endTime: string | null
  daySchedules: DaySchedule[] // horarios cuando scheduleMode === 'personalizado'
  location: string | null
  notes: string | null
  startDate: string
  endDate: string | null // null = indefinido
  skipHolidays: boolean
  amount: number | null
  movementType: MovementType | null
  financeCategoryId: string | null
  createdAt: string
  updatedAt: string
}

export interface NewRecurringEvent {
  title: string
  categoryId: string
  daysOfWeek: number[]
  scheduleMode: ScheduleMode
  startTime: string | null
  endTime: string | null
  daySchedules: DaySchedule[]
  location: string | null
  notes: string | null
  startDate: string
  endDate: string | null
  skipHolidays: boolean
  amount: number | null
  movementType: MovementType | null
  financeCategoryId: string | null
}

export type RecurringEventUpdate = NewRecurringEvent
