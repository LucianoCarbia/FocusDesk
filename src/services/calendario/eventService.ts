import { EventRepository } from '../../database/repositories/EventRepository'
import type { CalendarEvent } from '../../domain/calendario/CalendarEvent'
import { obtenerOCrearCategoria } from './categoryService'

export interface EventFormInput {
  title: string
  categoryName: string
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
}

function validar(input: EventFormInput) {
  if (!input.title.trim()) throw new Error('El título es obligatorio')
  if (!input.categoryName.trim()) throw new Error('La categoría es obligatoria')
  if (!input.date) throw new Error('La fecha es obligatoria')
}

export async function listarEventosEntre(startDate: string, endDate: string): Promise<CalendarEvent[]> {
  return EventRepository.findBetween(startDate, endDate)
}

export async function crearEvento(input: EventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  const id = crypto.randomUUID()
  await EventRepository.create(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
  })
}

export async function actualizarEvento(id: string, input: EventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  await EventRepository.update(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
  })
}

export async function eliminarEvento(id: string): Promise<void> {
  await EventRepository.delete(id)
}
