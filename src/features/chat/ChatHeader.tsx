type Props = {
  titulo: string
  onAbrirHistorial?: () => void
  onAbrirDiccionario?: () => void
}

function IconoMenu() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )
}

function IconoLibro() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

export default function ChatHeader({
  titulo,
  onAbrirHistorial,
  onAbrirDiccionario,
}: Props) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-milo-border px-3 py-2.5 md:px-4 md:py-3">
      {onAbrirHistorial && (
        <button
          type="button"
          onClick={onAbrirHistorial}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-milo-text hover:bg-milo-elevated md:hidden"
          aria-label="Abrir conversaciones"
        >
          <IconoMenu />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-milo-text md:text-base">
        {titulo}
      </h1>
      {onAbrirDiccionario && (
        <button
          type="button"
          onClick={onAbrirDiccionario}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-milo-border bg-milo-elevated px-2.5 text-xs font-medium text-milo-accent hover:bg-milo-border/40 lg:hidden"
          aria-label="Abrir diccionario"
        >
          <IconoLibro />
          Diccionario
        </button>
      )}
    </header>
  )
}
