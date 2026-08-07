import { useState } from 'react'
import type { AgendaEntry } from '../../domain/calendario/occurrences'
import { PlusIcon, RepeatIcon } from '../../components/icons/Icons'
import { CategoryLegend } from '../../features/calendario/components/CategoryLegend'
import { DayDetailPanel } from '../../features/calendario/components/DayDetailPanel'
import { EventFormDialog } from '../../features/calendario/components/EventFormDialog'
import { MonthGrid } from '../../features/calendario/components/MonthGrid'
import { RecurringEventsManager } from '../../features/calendario/components/RecurringEventsManager'
import { WeekStrip } from '../../features/calendario/components/WeekStrip'
import { useCalendarioData } from '../../features/calendario/hooks/useCalendarioData'
import styles from './CalendarioPage.module.css'

export function CalendarioPage() {
  const {
    today,
    visibleMonth,
    selectedDate,
    matrix,
    categories,
    financeCategories,
    loading,
    error,
    eventosDelDia,
    movimientosDelDia,
    serviciosDelDia,
    setSelectedDate,
    goToPrevMonth,
    goToNextMonth,
    agregarEvento,
    editarEvento,
    borrarEvento,
    cancelarOcurrencia,
    recargar,
  } = useCalendarioData()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AgendaEntry | null>(null)
  const [recurringManagerOpen, setRecurringManagerOpen] = useState(false)

  function openNewEventDialog() {
    setEditingEvent(null)
    setDialogOpen(true)
  }

  function openEditDialog(event: AgendaEntry) {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Esta semana</h1>
        <div className={styles.headerActions}>
          <button type="button" className={styles.recurringButton} onClick={() => setRecurringManagerOpen(true)}>
            <RepeatIcon /> Horarios fijos
          </button>
          <button type="button" className={styles.newEventButton} onClick={openNewEventDialog}>
            <PlusIcon /> Nuevo evento
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <WeekStrip
        today={today}
        selectedDate={selectedDate}
        categories={categories}
        eventosDelDia={eventosDelDia}
        serviciosDelDia={serviciosDelDia}
        onSelect={setSelectedDate}
      />

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <MonthGrid
            visibleMonth={visibleMonth}
            matrix={matrix}
            today={today}
            selectedDate={selectedDate}
            categories={categories}
            eventosDelDia={eventosDelDia}
            onSelect={setSelectedDate}
            onPrevMonth={goToPrevMonth}
            onNextMonth={goToNextMonth}
          />
          <CategoryLegend categories={categories} />
        </div>

        <DayDetailPanel
          selectedDate={selectedDate}
          events={eventosDelDia(selectedDate)}
          categories={categories}
          movements={movimientosDelDia(selectedDate)}
          financeCategories={financeCategories}
          servicios={serviciosDelDia(selectedDate)}
          onAdd={openNewEventDialog}
          onEdit={openEditDialog}
          onDelete={(event) => borrarEvento(event.id)}
          onCancelOccurrence={(event) => {
            if (event.recurringEventId) cancelarOcurrencia(event.recurringEventId, event.date)
          }}
        />
      </div>

      {loading && <p className={styles.loading}>Cargando…</p>}

      {dialogOpen && (
        <EventFormDialog
          key={editingEvent ? editingEvent.id : `new-${selectedDate.toISOString()}`}
          initialDate={selectedDate}
          editingEvent={editingEvent}
          categories={categories}
          financeCategories={financeCategories}
          onClose={() => setDialogOpen(false)}
          onSubmit={(input) => (editingEvent ? editarEvento(editingEvent.id, input) : agregarEvento(input))}
          onDelete={(event) => borrarEvento(event.id)}
        />
      )}

      {recurringManagerOpen && (
        <RecurringEventsManager
          categories={categories}
          financeCategories={financeCategories}
          onClose={() => setRecurringManagerOpen(false)}
          onChange={() => void recargar()}
        />
      )}
    </div>
  )
}
