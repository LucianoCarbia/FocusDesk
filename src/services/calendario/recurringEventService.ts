import { RecurringEventRepository } from '../../database/repositories/RecurringEventRepository'
import type { RecurringEvent, RecurringEventSkip } from '../../domain/calendario/RecurringEvent'
import type { MovementType } from '../../domain/shared/MovementType'
import { obtenerOCrearCategoria } from './categoryService'
import { obtenerOCrearCategoria as obtenerOCrearCategoriaFinanciera } from '../finanzas/financeCategoryService'

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
  amount: number | null
  movementType: MovementType | null
  financeCategoryName: string | null
}

function validar(input: RecurringEventFormInput) {
  if (!input.title.trim()) throw new Error('El título es obligatorio')
  if (!input.categoryName.trim()) throw new Error('La categoría es obligatoria')
  if (input.daysOfWeek.length === 0) throw new Error('Elegí al menos un día de la semana')
  if (!input.startDate) throw new Error('La fecha de inicio es obligatoria')
  if (input.endDate && input.endDate < input.startDate) {
    throw new Error('La fecha de fin no puede ser anterior a la de inicio')
  }
  if (input.amount != null) {
    if (input.amount <= 0) throw new Error('El monto debe ser mayor a cero')
    if (!input.movementType) throw new Error('Elegí el tipo de movimiento (ingreso, gasto o ahorro)')
    if (!input.financeCategoryName?.trim()) throw new Error('La categoría de Finanzas es obligatoria')
  }
}

async function resolverDatosFinancieros(input: RecurringEventFormInput) {
  if (input.amount == null || !input.movementType || !input.financeCategoryName) {
    return { amount: null, movementType: null, financeCategoryId: null }
  }
  const categoriaFinanciera = await obtenerOCrearCategoriaFinanciera(input.financeCategoryName, input.movementType)
  return { amount: input.amount, movementType: input.movementType, financeCategoryId: categoriaFinanciera.id }
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
  const financiero = await resolverDatosFinancieros(input)
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
    ...financiero,
  })
}

export async function actualizarHorarioFijo(id: string, input: RecurringEventFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName)
  const financiero = await resolverDatosFinancieros(input)
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
    ...financiero,
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
