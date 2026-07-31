import { useCallback, useEffect, useState } from 'react'
import type { FinanceCategory } from '../../../domain/finanzas/FinanceCategory'
import type { Movement } from '../../../domain/finanzas/Movement'
import { listarCategorias } from '../../../services/finanzas/financeCategoryService'
import { listarMovimientosEntre } from '../../../services/finanzas/movementService'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'

export function useMovementsRange(startDate: Date, endDate: Date) {
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startISO = toISODate(startDate)
  const endISO = toISODate(endDate)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriasData, movimientosData] = await Promise.all([
        listarCategorias(),
        listarMovimientosEntre(startISO, endISO),
      ])
      setCategories(categoriasData)
      setMovements(movimientosData)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [startISO, endISO])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargar()
    })
  }, [cargar])

  return { categories, movements, loading, error, recargar: cargar }
}
