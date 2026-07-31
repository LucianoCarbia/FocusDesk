import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />

      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
