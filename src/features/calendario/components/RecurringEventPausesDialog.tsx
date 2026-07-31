import { useCallback, useEffect, useState } from 'react'
import type { RecurringEvent, RecurringEventSkip } from '../../../domain/calendario/RecurringEvent'
import { CloseIcon, TrashIcon } from '../../../components/icons/Icons'
import { agregarPausa, eliminarPausa, listarSkips } from '../../../services/calendario/recurringEventService'
import { toISODate } from '../../../utils/date'
import { toErrorMessage } from '../../../utils/errors'
import styles from './RecurringEventPausesDialog.module.css'

interface RecurringEventPausesDialogProps {
  recurringEvent: RecurringEvent
  onClose: () => void
  onChange: () => void
}

export function RecurringEventPausesDialog({ recurringEvent, onClose, onChange }: RecurringEventPausesDialogProps) {
  const [pauses, setPauses] = useState<RecurringEventSkip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(toISODate(new Date()))
  const [endDate, setEndDate] = useState(toISODate(new Date()))

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarSkips([recurringEvent.id])
      setPauses(data)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [recurringEvent.id])

  useEffect(() => {
    Promise.resolve().then(() => {
      void cargar()
    })
  }, [cargar])

  async function handleAdd() {
    setError(null)
    try {
      await agregarPausa(recurringEvent.id, startDate, endDate)
      await cargar()
      onChange()
    } catch (err) {
      setError(toErrorMessage(err))
    }
  }

  async function handleRemove(id: string) {
    try {
      await eliminarPausa(id)
      await cargar()
      onChange()
    } catch (err) {
      setError(toErrorMessage(err))
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Pausas de "{recurringEvent.title}"</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        {loading && <p className={styles.hint}>Cargando…</p>}
        {!loading && pauses.length === 0 && (
          <p className={styles.hint}>Sin pausas. Un día suelto se cancela poniendo la misma fecha en inicio y fin.</p>
        )}

        <div className={styles.list}>
          {pauses.map((pause) => (
            <div key={pause.id} className={styles.item}>
              <span>
                {pause.startDate === pause.endDate ? pause.startDate : `${pause.startDate} → ${pause.endDate}`}
              </span>
              <button type="button" onClick={() => handleRemove(pause.id)} aria-label="Eliminar pausa">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.addRow}>
          <label className={styles.field}>
            <span>Desde</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Hasta</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <button type="button" className={styles.addButton} onClick={handleAdd}>
            Agregar pausa
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
