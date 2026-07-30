export type AgendaCategory =
  | 'tarea'
  | 'pago'
  | 'turno'
  | 'facultad'
  | 'trabajo'
  | 'actividad-personal'
  | 'recordatorio'

export interface AgendaItem {
  id: string
  title: string
  time: string
  category: AgendaCategory
}
