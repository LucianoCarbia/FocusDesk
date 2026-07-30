import { Outlet } from 'react-router-dom'
import { BellIcon } from '../icons/Icons'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

const today = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

export function AppLayout() {
  const formattedToday = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className={styles.app}>
      <Sidebar />

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.date}>{formattedToday}</span>
          <button type="button" className={styles.bellButton} aria-label="Notificaciones">
            <BellIcon />
            <span className={styles.bellDot} aria-hidden="true" />
          </button>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
