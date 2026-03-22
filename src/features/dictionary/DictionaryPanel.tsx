import { useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useDictionaryColumn,
  type BusquedaColumnaDiccionario,
} from '../../hooks/useDictionarySearch'
import type { ResultadoDiccionario } from '../../types/dictionary'

type Props = {
  drawerMovilAbierto: boolean
  onDrawerMovilAbiertoChange: (abierto: boolean) => void
}

function BloqueResultado({ r }: { r: ResultadoDiccionario }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h3 className="text-sm font-semibold text-milo-text">{r.palabra}</h3>
      </div>
      {r.idioma_consulta === 'es' && (
        <p className="text-milo-muted">
          Buscaste en español:{' '}
          <span className="font-medium text-milo-text">{r.consulta}</span>
        </p>
      )}
      {r.fonetica && <p className="text-milo-muted">{r.fonetica}</p>}
      {r.traduccion_es && (
        <p className="rounded-lg bg-milo-elevated/80 px-2 py-1.5 text-milo-text">
          <span className="text-[10px] font-medium text-milo-muted">
            {r.idioma_consulta === 'en' ? 'ES (aprox.): ' : 'En español: '}
          </span>
          {r.traduccion_es}
        </p>
      )}
      {r.acepciones.map((grupo, gi) => (
        <div
          key={gi}
          className="rounded-lg border border-milo-border bg-milo-canvas/50 p-2"
        >
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-milo-accent">
            {grupo.parte}
          </p>
          <ul className="list-inside list-decimal space-y-1.5 text-milo-text">
            {grupo.definiciones.map((d, i) => (
              <li key={i} className="leading-snug">
                {d.definicion}
                {d.ejemplo && (
                  <span className="mt-0.5 block text-[10px] italic text-milo-muted">
                    ej. {d.ejemplo}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ColumnaDiccionario({
  terminoEntrada,
  setTerminoEntrada,
  resultado,
  isCargando,
  error,
  buscar,
  limpiar,
  fromLang,
}: BusquedaColumnaDiccionario) {
  const idInput = useId()
  const tituloCorto =
    fromLang === 'es' ? 'Español → English' : 'English → Español'
  const placeholder =
    fromLang === 'es' ? 'Ej. azul…' : 'Ej. more…'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:border-r lg:border-milo-border lg:pr-3 last:lg:border-r-0 last:lg:pr-0">
      <p className="mb-1.5 text-[11px] font-medium text-milo-accent">
        {tituloCorto}
      </p>
      <form
        className="shrink-0"
        onSubmit={(e) => {
          e.preventDefault()
          void buscar()
        }}
      >
        <label className="sr-only" htmlFor={idInput}>
          {fromLang === 'es' ? 'Palabra en español' : 'Palabra en inglés'}
        </label>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch">
          <input
            id={idInput}
            type="text"
            value={terminoEntrada}
            onChange={(e) => setTerminoEntrada(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-xl border border-milo-border bg-milo-canvas px-2 py-1.5 text-xs text-milo-text placeholder:text-milo-muted focus:border-milo-accent/50 focus:outline-none"
            autoComplete="off"
            spellCheck={fromLang === 'es'}
          />
          <button
            type="submit"
            disabled={isCargando}
            className="shrink-0 rounded-xl bg-milo-accent px-2 py-1.5 text-xs font-medium text-milo-canvas hover:opacity-90 disabled:opacity-40"
          >
            {isCargando ? '…' : 'Buscar'}
          </button>
        </div>
      </form>
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
        {error && (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-2 py-1.5 text-[11px] text-red-200">
            {error}
          </p>
        )}
        {resultado && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => limpiar()}
                className="text-[10px] text-milo-accent hover:underline"
              >
                Limpiar
              </button>
            </div>
            <BloqueResultado r={resultado} />
          </div>
        )}
      </div>
    </div>
  )
}

function ContenidoDiccionario({
  columnaEs,
  columnaEn,
}: {
  columnaEs: BusquedaColumnaDiccionario
  columnaEn: BusquedaColumnaDiccionario
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <ColumnaDiccionario {...columnaEs} />
          <ColumnaDiccionario {...columnaEn} />
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-milo-muted lg:text-left">
          Izquierda: palabra en español → equivalente en inglés y definiciones en
          inglés. Derecha: palabra en inglés → definiciones en inglés y pista en
          español.
        </p>
      </div>
    </div>
  )
}

export default function DictionaryPanel({
  drawerMovilAbierto,
  onDrawerMovilAbiertoChange,
}: Props) {
  const columnaEs = useDictionaryColumn('es')
  const columnaEn = useDictionaryColumn('en')

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
        className="hidden min-h-0 w-[min(100%,22rem)] shrink-0 flex-col border-l border-milo-border bg-milo-surface xl:w-[min(100%,28rem)] xl:max-w-[32rem] lg:flex"
        aria-label="Diccionario"
      >
        <div className="shrink-0 border-b border-milo-border px-4 py-3 text-sm font-medium text-milo-text">
          Diccionario
        </div>
        <ContenidoDiccionario columnaEs={columnaEs} columnaEn={columnaEn} />
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
                className="fixed bottom-0 right-0 top-0 z-[95] flex w-[min(100%,24rem)] flex-col border-l border-milo-border bg-milo-surface shadow-xl"
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
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <ContenidoDiccionario
                    columnaEs={columnaEs}
                    columnaEn={columnaEn}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
