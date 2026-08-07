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
import { NuevoServicioDialog } from '../../features/servicios/components/NuevoServicioDialog'
import { PagoServicioDialog } from '../../features/servicios/components/PagoServicioDialog'
import { PagoServicioMensualDialog } from '../../features/servicios/components/PagoServicioMensualDialog'
import { ServiceFormDialog } from '../../features/servicios/components/ServiceFormDialog'
import { ServicioMensualFormDialog } from '../../features/servicios/components/ServicioMensualFormDialog'
import { usePagoServicio } from '../../features/servicios/hooks/usePagoServicio'
import { usePagoServicioMensual } from '../../features/servicios/hooks/usePagoServicioMensual'
import { useServiciosData } from '../../features/servicios/hooks/useServiciosData'
import { useServiciosMensualesData } from '../../features/servicios/hooks/useServiciosMensualesData'
import type { ServicioConEstado } from '../../services/servicios/serviceService'
import type { ServicioMensualConEstado } from '../../services/servicios/servicioMensualService'
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
    recargarMovimientos,
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

  async function pagarServicioYRefrescar(periodId: string, exchangeRate?: number | null) {
    await pagarServicio(periodId, exchangeRate)
    await recargarMovimientos()
  }

  const {
    pendiente: pagoPendiente,
    error: pagoError,
    solicitarPago,
    confirmarCotizacion,
    cancelar: cancelarPago,
  } = usePagoServicio(pagarServicioYRefrescar)

  const {
    items: serviciosMensuales,
    loading: loadingServiciosMensuales,
    error: errorServiciosMensuales,
    crear: crearServicioMensual,
    actualizar: actualizarServicioMensual,
    eliminar: eliminarServicioMensual,
    pagar: pagarServicioMensual,
  } = useServiciosMensualesData()

  async function pagarServicioMensualYRefrescar(servicioMensualId: string, monto: number, exchangeRate?: number | null) {
    await pagarServicioMensual(servicioMensualId, monto, exchangeRate)
    await recargarMovimientos()
  }

  const {
    pendiente: pagoMensualPendiente,
    solicitarPago: solicitarPagoMensual,
    confirmarPago: confirmarPagoMensual,
    cancelar: cancelarPagoMensual,
  } = usePagoServicioMensual(pagarServicioMensualYRefrescar)

  const [registerMenuOpen, setRegisterMenuOpen] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)

  const [nuevoServicioDialogOpen, setNuevoServicioDialogOpen] = useState(false)

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingServiceItem, setEditingServiceItem] = useState<ServicioConEstado | null>(null)

  const [servicioMensualDialogOpen, setServicioMensualDialogOpen] = useState(false)
  const [editingServicioMensualItem, setEditingServicioMensualItem] = useState<ServicioMensualConEstado | null>(
    null,
  )

  function openNewMovementDialog() {
    setEditingMovement(null)
    setDialogOpen(true)
    setRegisterMenuOpen(false)
  }

  function openEditMovementDialog(movement: Movement) {
    setEditingMovement(movement)
    setDialogOpen(true)
  }

  function openNuevoServicioDialog() {
    setNuevoServicioDialogOpen(true)
    setRegisterMenuOpen(false)
  }

  function openEditServiceDialog(item: ServicioConEstado) {
    setEditingServiceItem(item)
    setServiceDialogOpen(true)
  }

  function openEditServicioMensualDialog(item: ServicioMensualConEstado) {
    setEditingServicioMensualItem(item)
    setServicioMensualDialogOpen(true)
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
                <button type="button" className={styles.menuItem} onClick={openNuevoServicioDialog}>
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
      {pagoError && <p className={styles.error}>{pagoError}</p>}
      <ServiciosSection
        items={servicios}
        itemsMensuales={serviciosMensuales}
        loading={loadingServicios || loadingServiciosMensuales}
        error={errorServicios ?? errorServiciosMensuales}
        onEdit={openEditServiceDialog}
        onDelete={(service) => eliminarServicio(service.id)}
        onPagar={(item) =>
          void solicitarPago({
            periodId: item.period.id,
            serviceName: item.service.name,
            amount: item.period.amount,
            currency: item.period.currency,
            dueDate: item.period.dueDate,
          })
        }
        onEditMensual={openEditServicioMensualDialog}
        onDeleteMensual={(servicio) => eliminarServicioMensual(servicio.id)}
        onPagarMensual={(item) =>
          solicitarPagoMensual({
            servicioMensualId: item.servicio.id,
            serviceName: item.servicio.name,
            ocurrencias: item.ocurrencias,
            montoEstimado: item.montoEstimado,
            currency: item.servicio.currency,
          })
        }
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

      {nuevoServicioDialogOpen && (
        <NuevoServicioDialog
          onClose={() => setNuevoServicioDialogOpen(false)}
          onSubmitFechaFija={crearServicio}
          onSubmitMensual={crearServicioMensual}
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

      {servicioMensualDialogOpen && (
        <ServicioMensualFormDialog
          key={editingServicioMensualItem ? editingServicioMensualItem.servicio.id : 'new-servicio-mensual'}
          editingServicio={editingServicioMensualItem?.servicio ?? null}
          onClose={() => setServicioMensualDialogOpen(false)}
          onSubmit={(input) =>
            editingServicioMensualItem
              ? actualizarServicioMensual(editingServicioMensualItem.servicio.id, input)
              : crearServicioMensual(input)
          }
          onDelete={(servicio) => eliminarServicioMensual(servicio.id)}
        />
      )}

      {pagoMensualPendiente && (
        <PagoServicioMensualDialog
          serviceName={pagoMensualPendiente.serviceName}
          ocurrencias={pagoMensualPendiente.ocurrencias}
          montoEstimado={pagoMensualPendiente.montoEstimado}
          currency={pagoMensualPendiente.currency}
          onClose={cancelarPagoMensual}
          onConfirm={confirmarPagoMensual}
        />
      )}

      {pagoPendiente && (
        <PagoServicioDialog
          serviceName={pagoPendiente.serviceName}
          usdAmount={pagoPendiente.amount}
          onClose={cancelarPago}
          onConfirm={confirmarCotizacion}
        />
      )}
    </div>
  )
}
