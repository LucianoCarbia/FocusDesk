import { toISODate } from '../../utils/date'
import type { FinanceCategory } from './FinanceCategory'
import type { Movement } from './Movement'

export interface ResumenMensual {
  ingresos: number
  gastos: number
  ahorros: number
  balance: number
  porcentajeUtilizado: number
  porcentajeDisponible: number
}

export function calcularResumenMensual(movements: Movement[]): ResumenMensual {
  const ingresos = sumByType(movements, 'ingreso')
  const gastos = sumByType(movements, 'gasto')
  const ahorros = sumByType(movements, 'ahorro')
  const balance = ingresos - gastos - ahorros
  const porcentajeUtilizado = ingresos > 0 ? ((gastos + ahorros) / ingresos) * 100 : 0
  const porcentajeDisponible = 100 - porcentajeUtilizado

  return { ingresos, gastos, ahorros, balance, porcentajeUtilizado, porcentajeDisponible }
}

export interface GastoPorCategoria {
  categoryId: string
  name: string
  icon: string
  color: string
  amount: number
  percentage: number
}

export function calcularGastosPorCategoria(
  movements: Movement[],
  categories: FinanceCategory[],
): GastoPorCategoria[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const totals = new Map<string, number>()

  for (const movement of movements) {
    if (movement.type !== 'gasto') continue
    totals.set(movement.categoryId, (totals.get(movement.categoryId) ?? 0) + movement.amount)
  }

  const totalGastos = [...totals.values()].reduce((sum, amount) => sum + amount, 0)

  return [...totals.entries()]
    .map(([categoryId, amount]) => {
      const category = categoryById.get(categoryId)
      return {
        categoryId,
        name: category?.name ?? 'Sin categoría',
        icon: category?.icon ?? 'dots',
        color: category?.color ?? '#64748b',
        amount,
        percentage: totalGastos > 0 ? (amount / totalGastos) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

export interface InsightsMes {
  categoriaTop: { name: string; amount: number; percentage: number } | null
  promedioDiario: number
  promedioDiarioAnterior: number | null
  comparacionPorcentaje: number | null
  mejorDia: { label: string; porcentajeMenor: number } | null
}

const WEEKDAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function calcularInsights(
  movements: Movement[],
  previousMonthMovements: Movement[],
  categories: FinanceCategory[],
  diasPeriodo: Date[],
  diasMesAnterior: number,
): InsightsMes {
  const gastosPorCategoria = calcularGastosPorCategoria(movements, categories)
  const categoriaTop = gastosPorCategoria[0]
    ? {
        name: gastosPorCategoria[0].name,
        amount: gastosPorCategoria[0].amount,
        percentage: gastosPorCategoria[0].percentage,
      }
    : null

  const totalGastos = sumByType(movements, 'gasto')
  const promedioDiario = diasPeriodo.length > 0 ? totalGastos / diasPeriodo.length : 0

  const totalGastosAnterior = sumByType(previousMonthMovements, 'gasto')
  const promedioDiarioAnterior = diasMesAnterior > 0 ? totalGastosAnterior / diasMesAnterior : null
  const comparacionPorcentaje =
    promedioDiarioAnterior && promedioDiarioAnterior > 0
      ? ((promedioDiarioAnterior - promedioDiario) / promedioDiarioAnterior) * 100
      : null

  const gastoPorFecha = new Map<string, number>()
  for (const movement of movements) {
    if (movement.type !== 'gasto') continue
    gastoPorFecha.set(movement.date, (gastoPorFecha.get(movement.date) ?? 0) + movement.amount)
  }

  const totalPorWeekday = new Map<number, number>()
  const ocurrenciasPorWeekday = new Map<number, number>()
  for (const date of diasPeriodo) {
    const weekday = date.getDay()
    ocurrenciasPorWeekday.set(weekday, (ocurrenciasPorWeekday.get(weekday) ?? 0) + 1)
    const iso = toISODate(date)
    totalPorWeekday.set(weekday, (totalPorWeekday.get(weekday) ?? 0) + (gastoPorFecha.get(iso) ?? 0))
  }

  let mejorDia: InsightsMes['mejorDia'] = null
  if (promedioDiario > 0 && ocurrenciasPorWeekday.size > 0) {
    let mejorWeekday: number | null = null
    let mejorPromedio = Infinity
    for (const [weekday, ocurrencias] of ocurrenciasPorWeekday) {
      const promedio = (totalPorWeekday.get(weekday) ?? 0) / ocurrencias
      if (promedio < mejorPromedio) {
        mejorPromedio = promedio
        mejorWeekday = weekday
      }
    }
    if (mejorWeekday !== null) {
      const porcentajeMenor = Math.max(0, ((promedioDiario - mejorPromedio) / promedioDiario) * 100)
      mejorDia = { label: WEEKDAY_LABELS[mejorWeekday], porcentajeMenor }
    }
  }

  return { categoriaTop, promedioDiario, promedioDiarioAnterior, comparacionPorcentaje, mejorDia }
}

function sumByType(movements: Movement[], type: Movement['type']): number {
  return movements.filter((m) => m.type === type).reduce((sum, m) => sum + m.amount, 0)
}
