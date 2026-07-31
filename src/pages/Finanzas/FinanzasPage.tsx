import { useState } from 'react'
import type { Movement } from '../../domain/finanzas/Movement'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../components/icons/Icons'
import { GastosPorCategoria } from '../../features/finanzas/components/GastosPorCategoria'
import { HistorialMovimientos } from '../../features/finanzas/components/HistorialMovimientos'
import { InsightsMes } from '../../features/finanzas/components/InsightsMes'
import { MovementFormDialog } from '../../features/finanzas/components/MovementFormDialog'
import { PendientesFinancieros } from '../../features/finanzas/components/PendientesFinancieros'
import { ResumenFinanciero } from '../../features/finanzas/components/ResumenFinanciero'
import { ServiciosSection } from '../../features/finanzas/components/ServiciosSection'
import { useFinanzasData } from '../../features/finanzas/hooks/useFinanzasData'
import { ServiceFormDialog } from '../../features/servicios/components/ServiceFormDialog'
import { useServiciosData } from '../../features/servicios/hooks/useServiciosData'
import type { ServicioConEstado } from '../../services/servicios/serviceService'
import styles from './FinanzasPage.module.css'

export function FinanzasPage() {
  const {
    visibleMonth,
    monthLabel,
    categories,
    movimientosFiltrados,
    filtro,
    setFiltro,
    resumen,
    gastosPorCategoria,
    insights,
    loading,
    error,
    goToPrevMonth,
    goToNextMonth,
    agregarMovimiento,
    editarMovimiento,
    borrarMovimiento,
  } = useFinanzasData()

  const {
    items: servicios,
    loading: loadingServicios,
    error: errorServicios,
    crear: crearServicio,
    actualizar: actualizarServicio,
    eliminar: eliminarServicio,
    pagar: pagarServicio,
  } = useServiciosData()

  const [registerMenuOpen, setRegisterMenuOpen] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingServiceItem, setEditingServiceItem] = useState<ServicioConEstado | null>(null)

  function openNewMovementDialog() {
    setEditingMovement(null)
    setDialogOpen(true)
    setRegisterMenuOpen(false)
  }

  function openEditMovementDialog(movement: Movement) {
    setEditingMovement(movement)
    setDialogOpen(true)
  }

  function openNewServiceDialog() {
    setEditingServiceItem(null)
    setServiceDialogOpen(true)
    setRegisterMenuOpen(false)
  }

  function openEditServiceDialog(item: ServicioConEstado) {
    setEditingServiceItem(item)
    setServiceDialogOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Finanzas</h1>
        <div className={styles.registerWrapper}>
          <button
            type="button"
            className={styles.registerButton}
            onClick={() => setRegisterMenuOpen((open) => !open)}
          >
            <PlusIcon /> Registrar
          </button>

          {registerMenuOpen && (
            <>
              <div className={styles.menuBackdrop} onClick={() => setRegisterMenuOpen(false)} />
              <div className={styles.menu}>
                <button type="button" className={styles.menuItem} onClick={openNewMovementDialog}>
                  Ingreso, gasto o ahorro
                </button>
                <button type="button" className={styles.menuItem} onClick={openNewServiceDialog}>
                  Servicio
                </button>
              </div>
            </>
          )}
        </div>
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

      <PendientesFinancieros />
      <ResumenFinanciero resumen={resumen} />
      <ServiciosSection
        items={servicios}
        loading={loadingServicios}
        error={errorServicios}
        onEdit={openEditServiceDialog}
        onDelete={(service) => eliminarServicio(service.id)}
        onPagar={(periodId) => pagarServicio(periodId)}
      />
      <GastosPorCategoria gastos={gastosPorCategoria} />
      <HistorialMovimientos
        movements={movimientosFiltrados}
        categories={categories}
        filtro={filtro}
        onFiltroChange={setFiltro}
        onEdit={openEditMovementDialog}
        onDelete={(movement) => borrarMovimiento(movement.id)}
      />
      <InsightsMes insights={insights} />

      {dialogOpen && (
        <MovementFormDialog
          key={editingMovement ? editingMovement.id : `new-${visibleMonth.toISOString()}`}
          initialDate={visibleMonth}
          editingMovement={editingMovement}
          categories={categories}
          onClose={() => setDialogOpen(false)}
          onSubmit={(input) =>
            editingMovement ? editarMovimiento(editingMovement.id, input) : agregarMovimiento(input)
          }
          onDelete={(movement) => borrarMovimiento(movement.id)}
        />
      )}

      {serviceDialogOpen && (
        <ServiceFormDialog
          key={editingServiceItem ? editingServiceItem.service.id : 'new-servicio'}
          editingService={editingServiceItem?.service ?? null}
          editingPeriod={editingServiceItem?.period ?? null}
          onClose={() => setServiceDialogOpen(false)}
          onSubmit={(input) =>
            editingServiceItem ? actualizarServicio(editingServiceItem.service.id, input) : crearServicio(input)
          }
          onDelete={(service) => eliminarServicio(service.id)}
        />
      )}
    </div>
  )
}
