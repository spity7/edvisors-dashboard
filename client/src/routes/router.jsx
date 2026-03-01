import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import { useAuthContext } from '@/context/useAuthContext'
import { appRoutes, authRoutes, publicRoutes } from '@/routes/index'
import AdminLayout from '@/layouts/AdminLayout'
import Preloader from '@/components/Preloader'

const AppRouter = (props) => {
  const { isAuthenticated } = useAuthContext()

  return (
    <Routes>
      {/* Fully public routes — no layout wrapper at all */}
      {(publicRoutes || []).map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<Suspense fallback={<Preloader />}>{route.element}</Suspense>} />
      ))}

      {(authRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            // If already authenticated, redirect away from auth pages to home (or route.redirectTo)
            isAuthenticated ? <Navigate to={route.redirectTo || '/'} replace /> : <AuthLayout {...props}>{route.element}</AuthLayout>
          }
        />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              <AdminLayout {...props}>{route.element}</AdminLayout>
            ) : (
              <Navigate
                to={{
                  pathname: '/auth/sign-in',
                  search: 'redirectTo=' + route.path,
                }}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}
export default AppRouter
