export interface ServicePeriod {
  id: string
  serviceId: string
  dueDate: string
  amount: number
  paid: boolean
  paidAt: string | null
  movementId: string | null
  createdAt: string
}

export interface NewServicePeriod {
  serviceId: string
  dueDate: string
  amount: number
}
