import { CategoryRepository } from '../../database/repositories/CategoryRepository'
import type { Category } from '../../domain/calendario/Category'
import { nextPaletteColor } from '../../domain/calendario/palette'

export async function listarCategorias(): Promise<Category[]> {
  return CategoryRepository.findAll()
}

export async function obtenerOCrearCategoria(nombre: string): Promise<Category> {
  const name = nombre.trim()
  if (!name) {
    throw new Error('El nombre de la categoría no puede estar vacío')
  }

  const existente = await CategoryRepository.findByName(name)
  if (existente) return existente

  const categorias = await CategoryRepository.findAll()
  const color = nextPaletteColor(categorias.map((c) => c.color))
  const id = crypto.randomUUID()
  await CategoryRepository.create(id, { name, color })

  return { id, name, color, createdAt: new Date().toISOString() }
}
