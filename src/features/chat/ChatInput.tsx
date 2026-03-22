import { useState, type FormEvent, type KeyboardEvent } from 'react'

type Props = {
  onEnviar: (texto: string) => void
  isDeshabilitado: boolean
  placeholder?: string
}

export default function ChatInput({
  onEnviar,
  isDeshabilitado,
  placeholder = 'Escribí en inglés…',
}: Props) {
  const [valor, setValor] = useState('')

  function enviar() {
    const t = valor.trim()
    if (!t || isDeshabilitado) return
    onEnviar(t)
    setValor('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    enviar()
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="shrink-0 border-t border-milo-border bg-milo-canvas px-4 py-3">
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-chat items-end gap-2 rounded-milo-input bg-milo-surface px-3 py-2 ring-1 ring-milo-border focus-within:ring-milo-accent/40"
      >
        <label className="sr-only" htmlFor="milo-chat-input">
          Mensaje
        </label>
        <textarea
          id="milo-chat-input"
          rows={1}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isDeshabilitado}
          placeholder={placeholder}
          className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm text-milo-text placeholder:text-milo-muted focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isDeshabilitado || !valor.trim()}
          className="shrink-0 rounded-xl bg-milo-accent px-4 py-2 text-sm font-medium text-milo-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDeshabilitado ? '…' : 'Enviar'}
        </button>
      </form>
    
    </div>
  )
}
