import type { SavingsMovement } from './SavingsMovement'

export function calcularSaldoUsd(movements: SavingsMovement[]): number {
  return movements.reduce((saldo, m) => saldo + (m.kind === 'compra' ? m.usdAmount : -m.usdAmount), 0)
}

export interface ResumenMesAhorros {
  usdComprado: number
  usdVendido: number
  arsDestinado: number
  cotizacionPromedio: number | null
}

export function calcularResumenMes(movements: SavingsMovement[], yearMonth: string): ResumenMesAhorros {
  const delMes = movements.filter((m) => m.date.slice(0, 7) === yearMonth)
  const compras = delMes.filter((m) => m.kind === 'compra')
  const usdComprado = compras.reduce((sum, m) => sum + m.usdAmount, 0)
  const usdVendido = delMes.filter((m) => m.kind === 'venta').reduce((sum, m) => sum + m.usdAmount, 0)
  const arsDestinado = compras.reduce((sum, m) => sum + m.arsAmount, 0)
  const cotizacionPromedio = usdComprado > 0 ? arsDestinado / usdComprado : null

  return { usdComprado, usdVendido, arsDestinado, cotizacionPromedio }
}

export interface EvolucionMensual {
  yearMonth: string
  usdComprado: number
  usdVendido: number
  arsDestinado: number
  cotizacionPromedio: number | null
  saldoAcumuladoUsd: number
}

export function calcularEvolucionMensual(movements: SavingsMovement[]): EvolucionMensual[] {
  const meses = [...new Set(movements.map((m) => m.date.slice(0, 7)))].sort()

  let saldoAcumulado = 0
  return meses.map((yearMonth) => {
    const resumen = calcularResumenMes(movements, yearMonth)
    saldoAcumulado += resumen.usdComprado - resumen.usdVendido
    return { yearMonth, ...resumen, saldoAcumuladoUsd: saldoAcumulado }
  })
}
