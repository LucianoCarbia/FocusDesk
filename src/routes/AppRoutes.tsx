import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { CalendarioPage } from '../pages/Calendario/CalendarioPage'
import { ConfiguracionPage } from '../pages/Configuracion/ConfiguracionPage'
import { FinanzasPage } from '../pages/Finanzas/FinanzasPage'
import { HomePage } from '../pages/Home/HomePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="calendario" element={<CalendarioPage />} />
        <Route path="finanzas" element={<FinanzasPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>
    </Routes>
  )
}
