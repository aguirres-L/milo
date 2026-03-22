import { useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDictionarySearch } from '../../hooks/useDictionarySearch'

type Props = {
  drawerMovilAbierto: boolean
  onDrawerMovilAbiertoChange: (abierto: boolean) => void
}

type BusquedaDic = ReturnType<typeof useDictionarySearch>

function ContenidoDiccionario({
  terminoEntrada,
  setTerminoEntrada,
  resultado,
  isCargando,
  error,
  buscar,
  limpiar,
}: BusquedaDic) {
  const idInput = useId()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        className="shrink-0 border-b border-milo-border p-3"
        onSubmit={(e) => {
          e.preventDefault()
          void buscar()
        }}
      >
        <label className="sr-only" htmlFor={idInput}>
          Palabra en inglés
        </label>
        <div className="flex gap-2">
          <input
            id={idInput}
            type="text"
            value={terminoEntrada}
            onChange={(e) => setTerminoEntrada(e.target.value)}
            placeholder="Palabra en inglés…"
            className="min-w-0 flex-1 rounded-xl border border-milo-border bg-milo-canvas px-3 py-2 text-sm text-milo-text placeholder:text-milo-muted focus:border-milo-accent/50 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isCargando}
            className="shrink-0 rounded-xl bg-milo-accent px-3 py-2 text-sm font-medium text-milo-canvas hover:opacity-90 disabled:opacity-40"
          >
            {isCargando ? '…' : 'Buscar'}
          </button>
        </div>
       
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {error && (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        {!resultado && !error && !isCargando && (
          <p className="text-center text-sm text-milo-muted">
            Buscá una palabra para ver definiciones en inglés y una pista en
            español.
          </p>
        )}
        {resultado && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-milo-text">
                {resultado.palabra}
              </h2>
              <button
                type="button"
                onClick={() => limpiar()}
                className="text-xs text-milo-accent hover:underline"
              >
                Limpiar
              </button>
            </div>
            {resultado.fonetica && (
              <p className="text-milo-muted">{resultado.fonetica}</p>
            )}
            {resultado.traduccion_es && (
              <p className="rounded-lg bg-milo-elevated/80 px-3 py-2 text-milo-text">
                <span className="text-xs font-medium text-milo-muted">
                  ES (aprox.):{' '}
                </span>
                {resultado.traduccion_es}
              </p>
            )}
            {resultado.acepciones.map((grupo, gi) => (
              <div
                key={gi}
                className="rounded-xl border border-milo-border bg-milo-canvas/50 p-3"
              >
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-milo-accent">
                  {grupo.parte}
                </p>
                <ul className="list-inside list-decimal space-y-2 text-milo-text">
                  {grupo.definiciones.map((d, i) => (
                    <li key={i} className="leading-relaxed">
                      {d.definicion}
                      {d.ejemplo && (
                        <span className="mt-1 block text-xs italic text-milo-muted">
                          ej. {d.ejemplo}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DictionaryPanel({
  drawerMovilAbierto,
  onDrawerMovilAbiertoChange,
}: Props) {
  const busqueda = useDictionarySearch()

  useEffect(() => {
    if (!drawerMovilAbierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerMovilAbierto])

  return (
    <>
      <aside
        className="hidden w-72 shrink-0 flex-col border-l border-milo-border bg-milo-surface lg:flex"
        aria-label="Diccionario"
      >
        <div className="shrink-0 border-b border-milo-border px-4 py-3 text-sm font-medium text-milo-text">
          Diccionario
        </div>
        <ContenidoDiccionario {...busqueda} />
      </aside>

      <div className="lg:hidden">
        <AnimatePresence>
          {drawerMovilAbierto && (
            <>
              <motion.button
                type="button"
                aria-label="Cerrar diccionario"
                className="fixed inset-0 z-[90] bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onDrawerMovilAbiertoChange(false)}
              />
              <motion.aside
                role="dialog"
                aria-label="Diccionario"
                aria-modal="true"
                className="fixed bottom-0 right-0 top-0 z-[95] flex w-[min(100%,20rem)] flex-col border-l border-milo-border bg-milo-surface shadow-xl"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.22 }}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-milo-border px-3 py-3">
                  <span className="text-sm font-medium text-milo-text">
                    Diccionario
                  </span>
                  <button
                    type="button"
                    onClick={() => onDrawerMovilAbiertoChange(false)}
                    className="rounded-lg px-2 py-1 text-milo-muted hover:bg-milo-elevated hover:text-milo-text"
                  >
                    Cerrar
                  </button>
                </div>
                <ContenidoDiccionario {...busqueda} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
