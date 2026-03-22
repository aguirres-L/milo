import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  isAbierto: boolean
  onCerrar: () => void
  titulo: string
  mensaje: string
  textoCancelar?: string
  textoConfirmar?: string
  onConfirmar: () => void
  isPeligro?: boolean
}

export function MiloConfirmModal({
  isAbierto,
  onCerrar,
  titulo,
  mensaje,
  textoCancelar = 'Cancelar',
  textoConfirmar = 'Confirmar',
  onConfirmar,
  isPeligro = false,
}: Props) {
  const idTitulo = useId()
  const idDescripcion = useId()
  const refCancelar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isAbierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    refCancelar.current?.focus()
    return () => {
      document.body.style.overflow = anterior
    }
  }, [isAbierto])

  useEffect(() => {
    if (!isAbierto) return
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', onTecla)
    return () => document.removeEventListener('keydown', onTecla)
  }, [isAbierto, onCerrar])

  if (!isAbierto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idDescripcion}
        className="relative w-full max-w-md rounded-xl border border-milo-border bg-milo-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={idTitulo} className="text-base font-semibold text-milo-text">
          {titulo}
        </h2>
        <p id={idDescripcion} className="mt-2 text-sm text-milo-muted">
          {mensaje}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={refCancelar}
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-milo-border bg-milo-elevated px-4 py-2 text-sm font-medium text-milo-text transition hover:bg-milo-border/40"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmar()
              onCerrar()
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
              isPeligro
                ? 'bg-red-700 hover:bg-red-600'
                : 'bg-milo-accent text-milo-canvas hover:opacity-90'
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
