import { contarDiaSemanaEnMes } from '../../utils/date'

export function calcularOcurrenciasDelMes(daysOfWeek: number[], year: number, month: number): number {
  const dias = new Set(daysOfWeek)
  let total = 0
  for (const weekday of dias) {
    total += contarDiaSemanaEnMes(year, month, weekday)
  }
  return total
}
