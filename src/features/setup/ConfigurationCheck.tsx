import { useCallback, useEffect, useState } from 'react'
import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { obtenerUrlBaseApi } from '../../lib/apiClient'
import { ID_USUARIO_DESARROLLO } from '../../lib/constants'
import {
  initFirebase,
  getDb,
  obtenerVariablesFirebaseCliente,
} from '../../lib/firebase'

type EstadoFila = 'pendiente' | 'ok' | 'error'
type EstadoProbeGemini = 'idle' | EstadoFila

type DiagnosticsJson = {
  gemini_api_key_configured: boolean
  gemini_model: string
  cors_origins: string[]
  probe_gemini_requested: boolean
  gemini_probe_ok: boolean | null
  gemini_probe_error: string | null
}

function textoEstado(estado: EstadoFila, detalle?: string) {
  if (estado === 'pendiente') return '…'
  if (estado === 'ok') return 'OK'
  return detalle ?? 'Error'
}

export default function ConfigurationCheck() {
  const [urlApi, setUrlApi] = useState<string | null>(null)
  const [errorUrlApi, setErrorUrlApi] = useState<string | null>(null)

  const [estadoHealth, setEstadoHealth] = useState<EstadoFila>('pendiente')
  const [detalleHealth, setDetalleHealth] = useState<string | undefined>()

  const [estadoDiagnostics, setEstadoDiagnostics] = useState<EstadoFila>('pendiente')
  const [detalleDiagnostics, setDetalleDiagnostics] = useState<string | undefined>()
  const [jsonDiagnostics, setJsonDiagnostics] = useState<DiagnosticsJson | null>(null)

  const [estadoFirestore, setEstadoFirestore] = useState<EstadoFila>('pendiente')
  const [detalleFirestore, setDetalleFirestore] = useState<string | undefined>()

  const [estadoProbeGemini, setEstadoProbeGemini] =
    useState<EstadoProbeGemini>('idle')
  const [detalleProbeGemini, setDetalleProbeGemini] = useState<string | undefined>()

  const variablesFb = obtenerVariablesFirebaseCliente()
  const todasVariablesFbOk = variablesFb.every((v) => v.definida)

  const ejecutarChequeosRed = useCallback(async () => {
    let base: string
    try {
      base = obtenerUrlBaseApi()
      setUrlApi(base)
      setErrorUrlApi(null)
    } catch (e) {
      setUrlApi(null)
      setErrorUrlApi(e instanceof Error ? e.message : String(e))
      setEstadoHealth('error')
      setDetalleHealth('Sin URL de API')
      setEstadoDiagnostics('error')
      setDetalleDiagnostics('Sin URL de API')
      return
    }

    setEstadoHealth('pendiente')
    try {
      const res = await fetch(`${base}/health`)
      if (!res.ok) {
        setEstadoHealth('error')
        setDetalleHealth(`HTTP ${res.status}`)
        return
      }
      const data = (await res.json()) as { status?: string }
      if (data.status !== 'ok') {
        setEstadoHealth('error')
        setDetalleHealth('Respuesta inesperada')
        return
      }
      setEstadoHealth('ok')
    } catch (e) {
      setEstadoHealth('error')
      setDetalleHealth(
        e instanceof Error ? e.message : 'No se pudo conectar (¿CORS o servidor apagado?)',
      )
    }

    setEstadoDiagnostics('pendiente')
    try {
      const res = await fetch(`${base}/diagnostics`)
      if (!res.ok) {
        setEstadoDiagnostics('error')
        setDetalleDiagnostics(`HTTP ${res.status}`)
        setJsonDiagnostics(null)
        return
      }
      const data = (await res.json()) as DiagnosticsJson
      setJsonDiagnostics(data)
      setEstadoDiagnostics('ok')
      setDetalleDiagnostics(undefined)
    } catch (e) {
      setEstadoDiagnostics('error')
      setDetalleDiagnostics(
        e instanceof Error ? e.message : 'Fallo de red hacia /diagnostics',
      )
      setJsonDiagnostics(null)
    }
  }, [])

  const ejecutarProbeGemini = useCallback(async () => {
    let base: string
    try {
      base = obtenerUrlBaseApi()
    } catch {
      setEstadoProbeGemini('error')
      setDetalleProbeGemini('Falta VITE_API_BASE_URL')
      return
    }

    setEstadoProbeGemini('pendiente')
    setDetalleProbeGemini(undefined)
    try {
      const res = await fetch(`${base}/diagnostics?probe_gemini=1`)
      let data: DiagnosticsJson | null = null
      try {
        data = (await res.json()) as DiagnosticsJson
      } catch {
        /* cuerpo no JSON */
      }
      if (data) setJsonDiagnostics(data)
      if (!res.ok) {
        setEstadoProbeGemini('error')
        setDetalleProbeGemini(`HTTP ${res.status}`)
        return
      }
      if (!data) {
        setEstadoProbeGemini('error')
        setDetalleProbeGemini('Respuesta no JSON')
        return
      }
      if (data.gemini_probe_ok === true) {
        setEstadoProbeGemini('ok')
      } else {
        setEstadoProbeGemini('error')
        setDetalleProbeGemini(
          data.gemini_probe_error ?? 'Probe sin confirmación OK',
        )
      }
    } catch (e) {
      setEstadoProbeGemini('error')
      setDetalleProbeGemini(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    void ejecutarChequeosRed()
  }, [ejecutarChequeosRed])

  useEffect(() => {
    if (!todasVariablesFbOk) {
      setEstadoFirestore('error')
      setDetalleFirestore('Completá las variables VITE_FIREBASE_* en .env')
      return
    }

    let cancelado = false
    setEstadoFirestore('pendiente')

    ;(async () => {
      try {
        initFirebase()
        const db = getDb()
        const ruta = `users/${ID_USUARIO_DESARROLLO}/_milo_setup/probe`
        const ref = doc(db, ruta)
        await setDoc(ref, { probadoEn: serverTimestamp(), origen: 'configuration_check' })
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          throw new Error('Lectura tras escritura falló')
        }
        await deleteDoc(ref)
        if (!cancelado) {
          setEstadoFirestore('ok')
          setDetalleFirestore(undefined)
        }
      } catch (e) {
        if (!cancelado) {
          setEstadoFirestore('error')
          setDetalleFirestore(
            e instanceof Error ? e.message : String(e),
          )
        }
      }
    })()

    return () => {
      cancelado = true
    }
  }, [todasVariablesFbOk])

  const inicioHref = `${window.location.pathname}`

  return (
    <div className="min-h-full overflow-y-auto bg-milo-canvas px-4 py-8 text-milo-text">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Verificación de configuración</h1>
            <p className="mt-1 text-sm text-milo-muted">
              Comprueba Firebase, la API Python y (opcional) una llamada real a Gemini.
            </p>
          </div>
          <a
            href={inicioHref}
            className="rounded-lg border border-milo-border px-3 py-2 text-sm text-milo-accent hover:bg-milo-surface"
          >
            Volver a Milo
          </a>
        </header>

        <section className="mb-8 rounded-2xl border border-milo-border bg-milo-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-milo-muted">
            Variables Firebase (cliente)
          </h2>
          <ul className="space-y-2 text-sm">
            {variablesFb.map((v) => (
              <li
                key={v.nombre}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-milo-border/60 py-2 last:border-0"
              >
                <code className="text-xs text-milo-muted">{v.nombre}</code>
                <span className={v.definida ? 'text-green-400' : 'text-red-300'}>
                  {v.definida ? `definida · ${v.vista}` : 'falta'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8 rounded-2xl border border-milo-border bg-milo-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-milo-muted">
            API Python y CORS
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-4">
              <span>VITE_API_BASE_URL</span>
              <span className="text-right text-milo-muted">
                {urlApi ?? errorUrlApi ?? '—'}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>GET /health</span>
              <span
                className={
                  estadoHealth === 'ok'
                    ? 'text-green-400'
                    : estadoHealth === 'error'
                      ? 'text-red-300'
                      : 'text-milo-muted'
                }
              >
                {textoEstado(estadoHealth, detalleHealth)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>GET /diagnostics</span>
              <span
                className={
                  estadoDiagnostics === 'ok'
                    ? 'text-green-400'
                    : estadoDiagnostics === 'error'
                      ? 'text-red-300'
                      : 'text-milo-muted'
                }
              >
                {textoEstado(estadoDiagnostics, detalleDiagnostics)}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Firestore (escribir / leer / borrar probe)</span>
              <span
                className={
                  estadoFirestore === 'ok'
                    ? 'text-green-400'
                    : estadoFirestore === 'error'
                      ? 'text-red-300'
                      : 'text-milo-muted'
                }
              >
                {textoEstado(estadoFirestore, detalleFirestore)}
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-milo-muted">
            Usuario de desarrollo:{' '}
            <code className="text-milo-text">{ID_USUARIO_DESARROLLO}</code> — las reglas
            de Firestore deben permitir ese path.
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-milo-border bg-milo-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-milo-muted">Gemini (servidor)</h2>
          <p className="mb-3 text-sm text-milo-muted">
            El chequeo ligero solo confirma que la key está configurada. La prueba real
            consume cuota.
          </p>
          {jsonDiagnostics && (
            <ul className="mb-4 space-y-1 rounded-xl bg-milo-canvas p-3 text-xs text-milo-muted">
              <li>
                Key configurada:{' '}
                <strong className="text-milo-text">
                  {jsonDiagnostics.gemini_api_key_configured ? 'sí' : 'no'}
                </strong>
              </li>
              <li>
                Modelo:{' '}
                <code className="text-milo-text">{jsonDiagnostics.gemini_model}</code>
              </li>
              <li>
                CORS permitidos:{' '}
                <code className="text-milo-text">
                  {jsonDiagnostics.cors_origins.join(', ') || '—'}
                </code>
              </li>
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void ejecutarProbeGemini()}
              className="rounded-xl bg-milo-accent px-4 py-2 text-sm font-medium text-milo-canvas hover:opacity-90"
            >
              Probar llamada a Gemini
            </button>
            <span
              className={
                estadoProbeGemini === 'ok'
                  ? 'text-sm text-green-400'
                  : estadoProbeGemini === 'error'
                    ? 'text-sm text-red-300'
                    : 'text-sm text-milo-muted'
              }
            >
              {estadoProbeGemini === 'idle'
                ? 'Opcional — sin ejecutar'
                : estadoProbeGemini === 'pendiente'
                  ? '…'
                  : textoEstado(estadoProbeGemini, detalleProbeGemini)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-milo-border bg-milo-surface p-4">
          <h2 className="mb-2 text-sm font-medium text-milo-muted">
            Última respuesta /diagnostics (JSON)
          </h2>
          <pre className="max-h-64 overflow-auto rounded-lg bg-milo-canvas p-3 text-xs text-milo-muted">
            {jsonDiagnostics
              ? JSON.stringify(jsonDiagnostics, null, 2)
              : '—'}
          </pre>
        </section>
      </div>
    </div>
  )
}
