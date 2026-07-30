import { NavLink } from 'react-router-dom'
import { CalendarIcon, HomeIcon, SettingsIcon, WalletIcon } from '../icons/Icons'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/', label: 'Inicio', icon: HomeIcon, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarIcon, end: false },
  { to: '/finanzas', label: 'Finanzas', icon: WalletIcon, end: false },
  { to: '/configuracion', label: 'Configuración', icon: SettingsIcon, end: false },
]

export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <HomeIcon width={18} height={18} stroke="white" />
        </span>
        <div className={styles.brandText}>
          <span className={styles.brandName}>FocusDesk</span>
          <span className={styles.brandSubtitle}>Organización personal</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            <Icon className={styles.navIcon} />
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
