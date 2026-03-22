import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const raiz = document.getElementById('root')!

async function iniciar() {
  const esVerificacion =
    new URLSearchParams(window.location.search).get('check') === '1'

  if (!esVerificacion) {
    const { initFirebase } = await import('./lib/firebase')
    initFirebase()
  }

  const { default: App } = await import('./App.tsx')

  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void iniciar().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error)
  raiz.innerHTML = `<div style="padding:1.5rem;font-family:system-ui,sans-serif;background:#131314;color:#e3e3e3;min-height:100vh"><p style="margin:0 0 .5rem">No se pudo iniciar Milo.</p><pre style="color:#f88;white-space:pre-wrap;font-size:.875rem">${mensaje}</pre></div>`
})
