import { FinanceCategoryRepository } from '../../database/repositories/FinanceCategoryRepository'
import type { FinanceCategory } from '../../domain/finanzas/FinanceCategory'
import type { MovementType } from '../../domain/finanzas/Movement'
import { nextPaletteColor } from '../../domain/calendario/palette'

export async function listarCategorias(): Promise<FinanceCategory[]> {
  return FinanceCategoryRepository.findAll()
}

export async function obtenerOCrearCategoria(nombre: string, type: MovementType): Promise<FinanceCategory> {
  const name = nombre.trim()
  if (!name) {
    throw new Error('El nombre de la categoría no puede estar vacío')
  }

  const existente = await FinanceCategoryRepository.findByNameAndType(name, type)
  if (existente) return existente

  const categorias = await FinanceCategoryRepository.findAll()
  const color = nextPaletteColor(categorias.map((c) => c.color))
  const id = crypto.randomUUID()
  await FinanceCategoryRepository.create(id, { name, type, icon: 'dots', color })

  return { id, name, type, icon: 'dots', color, createdAt: new Date().toISOString() }
}
