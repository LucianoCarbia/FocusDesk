import { EventRepository } from '../../database/repositories/EventRepository'
import type { CalendarEvent } from '../../domain/calendario/CalendarEvent'
import type { MovementType } from '../../domain/shared/MovementType'
import { obtenerOCrearCategoria } from './categoryService'
import { obtenerOCrearCategoria as obtenerOCrearCategoriaFinanciera } from '../finanzas/financeCategoryService'

export interface EventFormInput {
  title: string
  categoryName: string
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  amount: number | null
  movementType: MovementType | null
  financeCategoryName: string | null
}

function validar(input: EventFormInput) {
  if (!input.title.trim()) throw new Error('El título es obligatorio')
  if (!input.categoryName.trim()) throw new Error('La categoría es obligatoria')
  if (!input.date) throw new Error('La fecha es obligatoria')
  if (input.amount != null) {
    if (input.amount <= 0) throw new Error('El monto debe ser mayor a cero')
    if (!input.movementType) throw new Error('Elegí el tipo de movimiento (ingreso, gasto o ahorro)')
    if (!input.financeCategoryName?.trim()) throw new Error('La categoría de Finanzas es obligatoria')
  }
}

async function resolverDatosFinancieros(input: EventFormInput) {
  if (input.amount == null || !input.movementType || !input.financeCategoryName) {
    return { amount: null, movementType: null, financeCategoryId: null }
  }
  const categoriaFinanciera = await obtenerOCrearCategoriaFinanciera(input.financeCategoryName, input.movementType)
  return { amount: input.amount, movementType: input.movementType, financeCategoryId: categoriaFinanciera.id }
}

export async function listarEventosEntre(startDate: string, endDate: string): Promise<CalendarEvent[]> {
  return EventRepository.findBetween(startDate, endDate)
}

export async function crearEvento(input: EventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  const financiero = await resolverDatosFinancieros(input)
  const id = crypto.randomUUID()
  await EventRepository.create(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
    ...financiero,
  })
}

export async function actualizarEvento(id: string, input: EventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  const financiero = await resolverDatosFinancieros(input)
  await EventRepository.update(id, {
    title: input.title.trim(),
    categoryId: categoria.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
    ...financiero,
  })
}

export async function eliminarEvento(id: string): Promise<void> {
  await EventRepository.delete(id)
}
