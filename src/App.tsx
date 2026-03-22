import { lazy, Suspense } from 'react'

const ChatShell = lazy(() => import('./features/chat/ChatShell'))
const ConfigurationCheck = lazy(
  () => import('./features/setup/ConfigurationCheck'),
)

function esModoVerificacion() {
  return new URLSearchParams(window.location.search).get('check') === '1'
}

export default function App() {
  if (esModoVerificacion()) {
    return (
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-milo-muted">
            Cargando verificación…
          </div>
        }
      >
        <ConfigurationCheck />
      </Suspense>
    )
  }

  return (
    <div className="h-full min-h-0">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-milo-muted">
            Cargando…
          </div>
        }
      >
        <ChatShell />
      </Suspense>
    </div>
  )
}
