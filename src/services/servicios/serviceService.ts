import { ServicePeriodRepository } from '../../database/repositories/ServicePeriodRepository'
import { ServiceRepository } from '../../database/repositories/ServiceRepository'
import { calcularEstado, siguienteVencimiento, type EstadoServicio } from '../../domain/servicios/estado'
import type { Service, ServiceFrequency } from '../../domain/servicios/Service'
import type { ServicePeriod } from '../../domain/servicios/ServicePeriod'
import type { Currency } from '../../domain/shared/Currency'
import { formatCurrency, formatUsd } from '../../utils/currency'
import { toISODate } from '../../utils/date'
import { crearMovimiento } from '../finanzas/movementService'

export interface ServiceFormInput {
  name: string
  amount: number
  currency: Currency
  firstDueDate: string
  frequency: ServiceFrequency
  customIntervalDays: number | null
  notes: string | null
}

export interface ServicioConEstado {
  service: Service
  period: ServicePeriod
  estado: EstadoServicio | null
}

function validar(input: ServiceFormInput) {
  if (!input.name.trim()) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error('El importe debe ser mayor a cero')
  if (!input.firstDueDate) throw new Error('La fecha de vencimiento es obligatoria')
  if (input.frequency === 'personalizada' && (!input.customIntervalDays || input.customIntervalDays <= 0)) {
    throw new Error('Indicá cada cuántos días se repite')
  }
}

// El período congela moneda e importe del servicio al momento de crearse, para que
// un cambio posterior en el servicio (ej. ARS -> USD) no altere períodos ya generados o pagados.
async function asegurarPeriodoVigente(service: Service, periodsDelServicio: ServicePeriod[]): Promise<ServicePeriod> {
  const ultimo = periodsDelServicio[periodsDelServicio.length - 1]

  if (!ultimo) {
    const id = crypto.randomUUID()
    await ServicePeriodRepository.create(id, {
      serviceId: service.id,
      dueDate: service.firstDueDate,
      amount: service.amount,
      currency: service.currency,
    })
    return {
      id,
      serviceId: service.id,
      dueDate: service.firstDueDate,
      amount: service.amount,
      currency: service.currency,
      paid: false,
      paidAt: null,
      movementId: null,
      exchangeRate: null,
      paidAmountArs: null,
      createdAt: new Date().toISOString(),
    }
  }

  if (!ultimo.paid) return ultimo

  const dueDate = siguienteVencimiento(service, ultimo.dueDate)
  const id = crypto.randomUUID()
  await ServicePeriodRepository.create(id, {
    serviceId: service.id,
    dueDate,
    amount: service.amount,
    currency: service.currency,
  })
  return {
    id,
    serviceId: service.id,
    dueDate,
    amount: service.amount,
    currency: service.currency,
    paid: false,
    paidAt: null,
    movementId: null,
    exchangeRate: null,
    paidAmountArs: null,
    createdAt: new Date().toISOString(),
  }
}

export async function listarServicios(): Promise<Service[]> {
  return ServiceRepository.findAll()
}

export async function listarServiciosConEstado(): Promise<ServicioConEstado[]> {
  const [services, periods] = await Promise.all([ServiceRepository.findAll(), ServicePeriodRepository.findAll()])
  const todayISO = toISODate(new Date())

  const resultado: ServicioConEstado[] = []
  for (const service of services) {
    const periodsDelServicio = periods.filter((p) => p.serviceId === service.id)
    const period = await asegurarPeriodoVigente(service, periodsDelServicio)
    resultado.push({ service, period, estado: calcularEstado(period, todayISO) })
  }
  return resultado
}

export async function crearServicio(input: ServiceFormInput): Promise<void> {
  validar(input)
  const id = crypto.randomUUID()
  await ServiceRepository.create(id, {
    name: input.name.trim(),
    amount: input.amount,
    currency: input.currency,
    firstDueDate: input.firstDueDate,
    frequency: input.frequency,
    customIntervalDays: input.frequency === 'personalizada' ? input.customIntervalDays : null,
    notes: input.notes,
  })
  const periodId = crypto.randomUUID()
  await ServicePeriodRepository.create(periodId, {
    serviceId: id,
    dueDate: input.firstDueDate,
    amount: input.amount,
    currency: input.currency,
  })
}

export async function actualizarServicio(id: string, input: ServiceFormInput): Promise<void> {
  validar(input)
  await ServiceRepository.update(id, {
    name: input.name.trim(),
    amount: input.amount,
    currency: input.currency,
    firstDueDate: input.firstDueDate,
    frequency: input.frequency,
    customIntervalDays: input.frequency === 'personalizada' ? input.customIntervalDays : null,
    notes: input.notes,
  })

  const periods = await ServicePeriodRepository.findAll()
  const vigente = periods.filter((p) => p.serviceId === id).at(-1)
  if (vigente && !vigente.paid) {
    await ServicePeriodRepository.update(vigente.id, input.firstDueDate, input.amount, input.currency)
  }
}

export async function eliminarServicio(id: string): Promise<void> {
  await ServicePeriodRepository.deleteByService(id)
  await ServiceRepository.delete(id)
}

export async function marcarComoPagado(periodId: string, exchangeRate: number | null = null): Promise<void> {
  const [services, periods] = await Promise.all([ServiceRepository.findAll(), ServicePeriodRepository.findAll()])
  const period = periods.find((p) => p.id === periodId)
  if (!period) throw new Error('El vencimiento no existe')
  if (period.paid) throw new Error('Este servicio ya fue pagado en este período')
  const service = services.find((s) => s.id === period.serviceId)
  if (!service) throw new Error('El servicio no existe')

  let amountArs = period.amount
  let rate: number | null = null
  let notes: string | null = null

  if (period.currency === 'USD') {
    if (exchangeRate == null || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      throw new Error('Indicá la cotización del dólar para registrar el pago')
    }
    rate = exchangeRate
    amountArs = Math.round(period.amount * rate * 100) / 100 // evita arrastrar decimales de punto flotante
    notes = `${formatUsd(period.amount)} × ${formatCurrency(rate)}`
  }

  const movementId = await crearMovimiento({
    type: 'gasto',
    title: service.name,
    amount: amountArs,
    categoryName: 'Servicios',
    date: period.dueDate,
    notes,
  })

  await ServicePeriodRepository.markAsPaid(period.id, toISODate(new Date()), movementId, amountArs, rate)
}
