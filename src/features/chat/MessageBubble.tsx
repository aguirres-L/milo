import { useState } from 'react'
import AnimationComponent from '../../hook/frame_motion/AnimationComponent'
import { traducirTextoRespuestaTutor } from '../../lib/dictionaryApi'
import type { Mensaje } from '../../types/message'

type Props = {
  mensaje: Mensaje
}

export default function MessageBubble({ mensaje }: Props) {
  const [isMostrandoObservaciones, setIsMostrandoObservaciones] = useState(false)
  const [isMostrandoTraduccion, setIsMostrandoTraduccion] = useState(false)
  const [textoTraducido, setTextoTraducido] = useState<string | null>(null)
  const [isTraduciendo, setIsTraduciendo] = useState(false)
  const [errorTraduccion, setErrorTraduccion] = useState<string | null>(null)

  const isAsistente = mensaje.rol === 'assistant'
  const tieneAyudaEs =
    isAsistente &&
    mensaje.contenidoEs != null &&
    mensaje.contenidoEs.length > 0

  const alternarTraduccion = async () => {
    if (isMostrandoTraduccion) {
      setIsMostrandoTraduccion(false)
      return
    }
    setIsMostrandoTraduccion(true)
    setErrorTraduccion(null)
    if (textoTraducido != null) return
    setIsTraduciendo(true)
    try {
      const t = await traducirTextoRespuestaTutor(mensaje.contenidoEn)
      setTextoTraducido(t)
    } catch (e) {
      setErrorTraduccion(
        e instanceof Error ? e.message : 'No se pudo traducir',
      )
    } finally {
      setIsTraduciendo(false)
    }
  }

  return (
    <AnimationComponent type="fadeIn" duration={0.25} className="w-full">
      <div
        className={`flex w-full ${mensaje.rol === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            mensaje.rol === 'user'
              ? 'bg-milo-elevated text-milo-text'
              : 'bg-milo-surface text-milo-text ring-1 ring-milo-border'
          }`}
        >
          <p className="whitespace-pre-wrap">{mensaje.contenidoEn}</p>

          {isAsistente && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-milo-border pt-2">
              <button
                type="button"
                onClick={() => void alternarTraduccion()}
                disabled={isTraduciendo}
                className="text-xs font-medium text-milo-accent hover:underline disabled:opacity-50"
              >
                {isTraduciendo
                  ? 'Traduciendo…'
                  : isMostrandoTraduccion
                    ? 'Ocultar traducción'
                    : 'Ver traducción al español'}
              </button>
              {tieneAyudaEs && (
                <button
                  type="button"
                  onClick={() => setIsMostrandoObservaciones((v) => !v)}
                  className="text-xs font-medium text-milo-accent hover:underline"
                >
                  {isMostrandoObservaciones
                    ? 'Ocultar observaciones'
                    : 'Ver observaciones'}
                </button>
              )}
            </div>
          )}

          {isAsistente && isMostrandoTraduccion && (
            <div className="mt-2 rounded-xl bg-milo-elevated/60 px-3 py-2 text-sm text-milo-text ring-1 ring-milo-border/60">
              {errorTraduccion && (
                <p className="text-red-300">{errorTraduccion}</p>
              )}
              {!errorTraduccion && textoTraducido && (
                <p className="whitespace-pre-wrap">{textoTraducido}</p>
              )}
              {!errorTraduccion && !textoTraducido && isTraduciendo && (
                <p className="text-milo-muted">…</p>
              )}
            </div>
          )}

          {tieneAyudaEs && isMostrandoObservaciones && (
            <div className="mt-2 border-t border-milo-border pt-2">
              <p className="text-xs font-medium text-milo-muted">
                Observaciones
              </p>
              <p className="mt-1 text-sm text-milo-muted">
                {mensaje.contenidoEs}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimationComponent>
  )
}
