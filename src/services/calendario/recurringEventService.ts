import { RecurringEventRepository } from '../../database/repositories/RecurringEventRepository'
import type { RecurringEvent, RecurringEventSkip } from '../../domain/calendario/RecurringEvent'
import { obtenerOCrearCategoria } from './categoryService'

export interface RecurringEventFormInput {
  title: string
  categoryName: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  startDate: string
  endDate: string | null
  skipHolidays: boolean
}

function validar(input: RecurringEventFormInput) {
  if (!input.title.trim()) throw new Error('El título es obligatorio')
  if (!input.categoryName.trim()) throw new Error('La categoría es obligatoria')
  if (input.daysOfWeek.length === 0) throw new Error('Elegí al menos un día de la semana')
  if (!input.startDate) throw new Error('La fecha de inicio es obligatoria')
  if (input.endDate && input.endDate < input.startDate) {
    throw new Error('La fecha de fin no puede ser anterior a la de inicio')
  }
}

export async function listarHorariosFijos(): Promise<RecurringEvent[]> {
  return RecurringEventRepository.findAll()
}

export async function listarHorariosActivos(startDate: string, endDate: string): Promise<RecurringEvent[]> {
  return RecurringEventRepository.findActive(startDate, endDate)
}

export async function listarSkips(recurringEventIds: string[]): Promise<RecurringEventSkip[]> {
  return RecurringEventRepository.findSkips(recurringEventIds)
}

export async function crearHorarioFijo(input: RecurringEventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  const id = crypto.randomUUID()
  await RecurringEventRepository.create(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    daysOfWeek: input.daysOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
    startDate: input.startDate,
    endDate: input.endDate,
    skipHolidays: input.skipHolidays,
  })
}

export async function actualizarHorarioFijo(id: string, input: RecurringEventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  await RecurringEventRepository.update(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    daysOfWeek: input.daysOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
    startDate: input.startDate,
    endDate: input.endDate,
    skipHolidays: input.skipHolidays,
  })
}

export async function eliminarHorarioFijo(id: string): Promise<void> {
  await RecurringEventRepository.delete(id)
}

export async function agregarPausa(recurringEventId: string, startDate: string, endDate: string): Promise<void> {
  if (endDate < startDate) throw new Error('La fecha de fin de la pausa no puede ser anterior a la de inicio')
  const id = crypto.randomUUID()
  await RecurringEventRepository.addSkip(id, recurringEventId, startDate, endDate)
}

export async function eliminarPausa(skipId: string): Promise<void> {
  await RecurringEventRepository.removeSkip(skipId)
}

export async function cancelarOcurrencia(recurringEventId: string, date: string): Promise<void> {
  await agregarPausa(recurringEventId, date, date)
}
