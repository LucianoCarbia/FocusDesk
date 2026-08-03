import type { Currency } from '../domain/shared/Currency'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

const usdFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatUsd(amount: number): string {
  return `USD ${usdFormatter.format(amount)}`
}

export function formatAmount(amount: number, currency: Currency): string {
  return currency === 'USD' ? formatUsd(amount) : formatCurrency(amount)
}
