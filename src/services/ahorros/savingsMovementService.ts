import { SavingsMovementRepository } from '../../database/repositories/SavingsMovementRepository'
import { calcularSaldoUsd } from '../../domain/ahorros/resumen'
import type { SavingsMovement, SavingsMovementKind } from '../../domain/ahorros/SavingsMovement'
import {
  actualizarMovimiento as actualizarMovimientoFinanciero,
  crearMovimiento as crearMovimientoFinanciero,
  eliminarMovimiento as eliminarMovimientoFinanciero,
} from '../finanzas/movementService'

export interface SavingsMovementFormInput {
  date: string
  kind: SavingsMovementKind
  usdAmount: number
  arsAmount: number
  notes: string | null
}

function validar(input: SavingsMovementFormInput) {
  if (!input.date) throw new Error('La fecha es obligatoria')
  if (!Number.isFinite(input.usdAmount) || input.usdAmount <= 0) {
    throw new Error('La cantidad de dólares debe ser mayor a cero')
  }
  if (!Number.isFinite(input.arsAmount) || input.arsAmount <= 0) {
    throw new Error('El monto en pesos debe ser mayor a cero')
  }
}

function categoriaYTipo(kind: SavingsMovementKind) {
  return kind === 'compra'
    ? { type: 'ahorro' as const, categoryName: 'Compra de dólares', title: 'Compra de dólares' }
    : { type: 'ingreso' as const, categoryName: 'Retiro de ahorro', title: 'Venta de dólares' }
}

export async function listarMovimientos(): Promise<SavingsMovement[]> {
  return SavingsMovementRepository.findAll()
}

export async function registrarMovimiento(input: SavingsMovementFormInput): Promise<void> {
  validar(input)

  if (input.kind === 'venta') {
    const saldoActual = calcularSaldoUsd(await listarMovimientos())
    if (input.usdAmount > saldoActual) {
      throw new Error('No tenés suficientes dólares ahorrados')
    }
  }

  const { type, categoryName, title } = categoriaYTipo(input.kind)
  const movementId = await crearMovimientoFinanciero({
    type,
    title,
    amount: input.arsAmount,
    categoryName,
    date: input.date,
    notes: input.notes,
  })

  const id = crypto.randomUUID()
  await SavingsMovementRepository.create(id, {
    date: input.date,
    kind: input.kind,
    usdAmount: input.usdAmount,
    arsAmount: input.arsAmount,
    notes: input.notes,
    movementId,
  })
}

export async function actualizarMovimiento(id: string, input: SavingsMovementFormInput): Promise<void> {
  validar(input)

  const movimientos = await listarMovimientos()
  const actual = movimientos.find((m) => m.id === id)
  if (!actual) throw new Error('El movimiento no existe')

  if (input.kind === 'venta') {
    const saldoSinEste = calcularSaldoUsd(movimientos.filter((m) => m.id !== id))
    if (input.usdAmount > saldoSinEste) {
      throw new Error('No tenés suficientes dólares ahorrados')
    }
  }

  const { type, categoryName, title } = categoriaYTipo(input.kind)
  await actualizarMovimientoFinanciero(actual.movementId, {
    type,
    title,
    amount: input.arsAmount,
    categoryName,
    date: input.date,
    notes: input.notes,
  })

  await SavingsMovementRepository.update(id, {
    date: input.date,
    kind: input.kind,
    usdAmount: input.usdAmount,
    arsAmount: input.arsAmount,
    notes: input.notes,
  })
}

export async function eliminarMovimiento(id: string): Promise<void> {
  const movimientos = await listarMovimientos()
  const actual = movimientos.find((m) => m.id === id)
  if (!actual) throw new Error('El movimiento no existe')

  await SavingsMovementRepository.delete(id)
  await eliminarMovimientoFinanciero(actual.movementId)
}
