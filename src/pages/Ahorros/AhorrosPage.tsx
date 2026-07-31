import { useState } from 'react'
import type { SavingsMovement } from '../../domain/ahorros/SavingsMovement'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../components/icons/Icons'
import { EvolucionMensual } from '../../features/ahorros/components/EvolucionMensual'
import { HistorialAhorros } from '../../features/ahorros/components/HistorialAhorros'
import { ResumenAhorros } from '../../features/ahorros/components/ResumenAhorros'
import { SavingsMovementFormDialog } from '../../features/ahorros/components/SavingsMovementFormDialog'
import { useAhorrosData } from '../../features/ahorros/hooks/useAhorrosData'
import styles from './AhorrosPage.module.css'

export function AhorrosPage() {
  const {
    movimientos,
    loading,
    error,
    monthLabel,
    goToPrevMonth,
    goToNextMonth,
    saldoUsd,
    resumenMes,
    evolucionMensual,
    registrar,
    actualizar,
    eliminar,
  } = useAhorrosData()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<SavingsMovement | null>(null)

  function openNew() {
    setEditingMovement(null)
    setDialogOpen(true)
  }

  function openEdit(movement: SavingsMovement) {
    setEditingMovement(movement)
    setDialogOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ahorros</h1>
        <button type="button" className={styles.registerButton} onClick={openNew}>
          <PlusIcon /> Registrar
        </button>
      </div>

      <div className={styles.monthNav}>
        <button type="button" className={styles.navButton} onClick={goToPrevMonth} aria-label="Mes anterior">
          <ChevronLeftIcon />
        </button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button type="button" className={styles.navButton} onClick={goToNextMonth} aria-label="Mes siguiente">
          <ChevronRightIcon />
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Cargando…</p>}

      <ResumenAhorros saldoUsd={saldoUsd} resumenMes={resumenMes} />
      <EvolucionMensual evolucion={evolucionMensual} />
      <HistorialAhorros movements={movimientos} onEdit={openEdit} onDelete={(m) => eliminar(m.id)} />

      {dialogOpen && (
        <SavingsMovementFormDialog
          key={editingMovement ? editingMovement.id : 'new-ahorro'}
          editingMovement={editingMovement}
          onClose={() => setDialogOpen(false)}
          onSubmit={(input) =>
            editingMovement ? actualizar(editingMovement.id, input) : registrar(input)
          }
          onDelete={(movement) => eliminar(movement.id)}
        />
      )}
    </div>
  )
}
