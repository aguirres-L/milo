import { useState } from 'react'
import AnimationComponent from '../../hook/frame_motion/AnimationComponent'
import type { Mensaje } from '../../types/message'

type Props = {
  mensaje: Mensaje
}

export default function MessageBubble({ mensaje }: Props) {
  const [isMostrandoEspanol, setIsMostrandoEspanol] = useState(false)
  const isAsistente = mensaje.rol === 'assistant'
  const tieneAyudaEs =
    isAsistente &&
    mensaje.contenidoEs != null &&
    mensaje.contenidoEs.length > 0

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
          {tieneAyudaEs && (
            <div className="mt-2 border-t border-milo-border pt-2">
              <button
                type="button"
                onClick={() => setIsMostrandoEspanol((v) => !v)}
                className="text-xs font-medium text-milo-accent hover:underline"
              >
                {isMostrandoEspanol ? 'Ocultar español' : 'Ver en español'}
              </button>
              {isMostrandoEspanol && (
                <p className="mt-2 text-sm text-milo-muted">
                  {mensaje.contenidoEs}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimationComponent>
  )
}
