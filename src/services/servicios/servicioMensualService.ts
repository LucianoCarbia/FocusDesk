import { ServicioMensualPagoRepository } from '../../database/repositories/ServicioMensualPagoRepository'
import { ServicioMensualRepository } from '../../database/repositories/ServicioMensualRepository'
import { calcularOcurrenciasDelMes } from '../../domain/servicios/ocurrenciasMensuales'
import type { ServicioMensual } from '../../domain/servicios/ServicioMensual'
import type { ServicioMensualPago } from '../../domain/servicios/ServicioMensualPago'
import type { Currency } from '../../domain/shared/Currency'
import { formatCurrency, formatUsd } from '../../utils/currency'
import { toISODate } from '../../utils/date'
import { crearMovimiento } from '../finanzas/movementService'

export interface ServicioMensualFormInput {
  name: string
  daysOfWeek: number[]
  amountPerOccurrence: number
  currency: Currency
  startDate: string
  active: boolean
}

export interface ServicioMensualConEstado {
  servicio: ServicioMensual
  mes: string
  ocurrencias: number
  montoEstimado: number
  pago: ServicioMensualPago | null
}

function validar(input: ServicioMensualFormInput) {
  if (!input.name.trim()) throw new Error('El nombre es obligatorio')
  if (input.daysOfWeek.length === 0) throw new Error('Elegí al menos un día de la semana')
  if (!Number.isFinite(input.amountPerOccurrence) || input.amountPerOccurrence <= 0) {
    throw new Error('El importe por turno debe ser mayor a cero')
  }
  if (!input.startDate) throw new Error('La fecha de inicio es obligatoria')
}

function mesActual(): { mes: string; year: number; month: number } {
  const hoy = new Date()
  return { mes: toISODate(hoy).slice(0, 7), year: hoy.getFullYear(), month: hoy.getMonth() }
}

export async function listarServiciosMensuales(): Promise<ServicioMensual[]> {
  return ServicioMensualRepository.findAll()
}

export async function listarServiciosMensualesConEstado(): Promise<ServicioMensualConEstado[]> {
  const [servicios, pagos] = await Promise.all([
    ServicioMensualRepository.findAll(),
    ServicioMensualPagoRepository.findAll(),
  ])
  const { mes, year, month } = mesActual()

  return servicios.map((servicio) => {
    const ocurrencias = calcularOcurrenciasDelMes(servicio.daysOfWeek, year, month)
    const pago = pagos.find((p) => p.servicioMensualId === servicio.id && p.month === mes) ?? null
    return { servicio, mes, ocurrencias, montoEstimado: ocurrencias * servicio.amountPerOccurrence, pago }
  })
}

export async function crearServicioMensual(input: ServicioMensualFormInput): Promise<void> {
  validar(input)
  const id = crypto.randomUUID()
  await ServicioMensualRepository.create(id, {
    name: input.name.trim(),
    daysOfWeek: input.daysOfWeek,
    amountPerOccurrence: input.amountPerOccurrence,
    currency: input.currency,
    startDate: input.startDate,
    active: input.active,
  })
}

export async function actualizarServicioMensual(id: string, input: ServicioMensualFormInput): Promise<void> {
  validar(input)
  await ServicioMensualRepository.update(id, {
    name: input.name.trim(),
    daysOfWeek: input.daysOfWeek,
    amountPerOccurrence: input.amountPerOccurrence,
    currency: input.currency,
    startDate: input.startDate,
    active: input.active,
  })
}

export async function eliminarServicioMensual(id: string): Promise<void> {
  await ServicioMensualRepository.delete(id)
}

export async function marcarComoPagado(
  servicioMensualId: string,
  montoFinal: number,
  exchangeRate: number | null = null,
): Promise<void> {
  if (!Number.isFinite(montoFinal) || montoFinal <= 0) throw new Error('El monto debe ser mayor a cero')

  const [servicios, pagos] = await Promise.all([
    ServicioMensualRepository.findAll(),
    ServicioMensualPagoRepository.findAll(),
  ])
  const servicio = servicios.find((s) => s.id === servicioMensualId)
  if (!servicio) throw new Error('El servicio no existe')

  const { mes, year, month } = mesActual()
  if (pagos.some((p) => p.servicioMensualId === servicioMensualId && p.month === mes)) {
    throw new Error('Este servicio ya fue pagado este mes')
  }

  let amountArs = montoFinal
  let rate: number | null = null
  let notes: string | null = null

  if (servicio.currency === 'USD') {
    if (exchangeRate == null || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      throw new Error('Indicá la cotización del dólar para registrar el pago')
    }
    rate = exchangeRate
    amountArs = Math.round(montoFinal * rate * 100) / 100
    notes = `${formatUsd(montoFinal)} × ${formatCurrency(rate)}`
  }

  const movementId = await crearMovimiento({
    type: 'gasto',
    title: servicio.name,
    amount: amountArs,
    categoryName: 'Servicios',
    date: toISODate(new Date()),
    notes,
  })

  const ocurrencias = calcularOcurrenciasDelMes(servicio.daysOfWeek, year, month)
  await ServicioMensualPagoRepository.create(crypto.randomUUID(), {
    servicioMensualId,
    month: mes,
    occurrences: ocurrencias,
    amount: montoFinal,
    currency: servicio.currency,
    paidAt: toISODate(new Date()),
    movementId,
    exchangeRate: rate,
    paidAmountArs: amountArs,
  })
}
