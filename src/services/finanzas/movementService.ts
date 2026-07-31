import { MovementLinkRepository } from '../../database/repositories/MovementLinkRepository'
import { MovementRepository } from '../../database/repositories/MovementRepository'
import { SavingsMovementRepository } from '../../database/repositories/SavingsMovementRepository'
import type { Movement, MovementType } from '../../domain/finanzas/Movement'
import { obtenerOCrearCategoria } from './financeCategoryService'

export interface MovementFormInput {
  type: MovementType
  title: string
  amount: number
  categoryName: string
  date: string
  notes: string | null
}

function validar(input: MovementFormInput) {
  if (!input.title.trim()) throw new Error('El título es obligatorio')
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('El monto debe ser mayor a cero')
  if (!input.categoryName.trim()) throw new Error('La categoría es obligatoria')
  if (!input.date) throw new Error('La fecha es obligatoria')
}

export async function listarMovimientosEntre(startDate: string, endDate: string): Promise<Movement[]> {
  return MovementRepository.findBetween(startDate, endDate)
}

export async function crearMovimiento(input: MovementFormInput): Promise<string> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName, input.type)
  const id = crypto.randomUUID()
  await MovementRepository.create(id, {
    type: input.type,
    title: input.title.trim(),
    amount: input.amount,
    categoryId: categoria.id,
    date: input.date,
    notes: input.notes,
  })
  return id
}

export async function actualizarMovimiento(id: string, input: MovementFormInput): Promise<void> {
  validar(input)
  const categoria = await obtenerOCrearCategoria(input.categoryName, input.type)
  await MovementRepository.update(id, {
    type: input.type,
    title: input.title.trim(),
    amount: input.amount,
    categoryId: categoria.id,
    date: input.date,
    notes: input.notes,
  })
}

export async function eliminarMovimiento(id: string): Promise<void> {
  await MovementRepository.delete(id)
  await MovementLinkRepository.deleteByMovementId(id)
  await SavingsMovementRepository.deleteByMovementId(id)
}
