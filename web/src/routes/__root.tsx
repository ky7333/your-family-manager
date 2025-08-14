import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import { useUser } from '../lib/UserContext'

import Header from '../components/Header'
import Login from '../components/Login'
import { ThemeProvider } from '../lib/ThemeContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { user, setUser } = useUser()
  const handleLogout = () => setUser(null)
  return (
    <ThemeProvider>
      <Header authenticated={!!user} onLogout={handleLogout} />
      {!user ? (
        <Login/>
      ) : (
        <Outlet />
      )}
      <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </ThemeProvider>
  )
}
