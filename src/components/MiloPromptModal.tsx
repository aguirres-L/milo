import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  isAbierto: boolean
  onCerrar: () => void
  titulo: string
  etiqueta?: string
  valorInicial: string
  textoCancelar?: string
  textoGuardar?: string
  onGuardar: (valor: string) => void
}

export function MiloPromptModal({
  isAbierto,
  onCerrar,
  titulo,
  etiqueta = 'Nombre',
  valorInicial,
  textoCancelar = 'Cancelar',
  textoGuardar = 'Guardar',
  onGuardar,
}: Props) {
  const idTitulo = useId()
  const idEtiqueta = useId()
  const refInput = useRef<HTMLInputElement>(null)
  const [valor, setValor] = useState(valorInicial)

  useEffect(() => {
    if (isAbierto) setValor(valorInicial)
  }, [isAbierto, valorInicial])

  useEffect(() => {
    if (!isAbierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => {
      refInput.current?.focus()
      refInput.current?.select()
    }, 0)
    return () => {
      window.clearTimeout(t)
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

  const limpio = valor.trim()
  const puedeGuardar = limpio.length > 0

  const manejarGuardar = () => {
    if (!puedeGuardar) return
    onGuardar(limpio)
    onCerrar()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCerrar}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="relative w-full max-w-md rounded-xl border border-milo-border bg-milo-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          manejarGuardar()
        }}
      >
        <h2 id={idTitulo} className="text-base font-semibold text-milo-text">
          {titulo}
        </h2>
        <label htmlFor={idEtiqueta} className="mt-4 block text-sm text-milo-muted">
          {etiqueta}
        </label>
        <input
          ref={refInput}
          id={idEtiqueta}
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-milo-border bg-milo-canvas px-3 py-2 text-sm text-milo-text outline-none ring-milo-accent/40 placeholder:text-milo-muted focus:ring-2"
          autoComplete="off"
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-milo-border bg-milo-elevated px-4 py-2 text-sm font-medium text-milo-text transition hover:bg-milo-border/40"
          >
            {textoCancelar}
          </button>
          <button
            type="submit"
            disabled={!puedeGuardar}
            className="rounded-lg bg-milo-accent px-4 py-2 text-sm font-medium text-milo-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {textoGuardar}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
