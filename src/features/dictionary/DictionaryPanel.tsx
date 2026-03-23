import { useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useDictionaryUnified,
  type BusquedaDiccionarioUnificada,
} from '../../hooks/useDictionarySearch'
import type { ResultadoDiccionario } from '../../types/dictionary'

type Props = {
  drawerMovilAbierto: boolean
  onDrawerMovilAbiertoChange: (abierto: boolean) => void
}

function tituloSeccionEntrada(r: ResultadoDiccionario): string {
  return r.idioma_consulta === 'en'
    ? 'Palabra en inglés'
    : 'Desde tu búsqueda en español'
}

function BloqueResultado({
  r,
  mostrarTituloSeccion,
}: {
  r: ResultadoDiccionario
  mostrarTituloSeccion: boolean
}) {
  return (
    <div className="space-y-2 text-xs">
      {mostrarTituloSeccion && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-milo-accent">
          {tituloSeccionEntrada(r)}
        </p>
      )}
      {r.idioma_consulta === 'en' && r.traduccion_es ? (
        <p className="text-sm text-milo-text">
          <span className="font-semibold">{r.palabra}</span>
          <span className="mx-1.5 text-milo-muted">→</span>
          <span>{r.traduccion_es}</span>
        </p>
      ) : (
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <h3 className="text-sm font-semibold text-milo-text">{r.palabra}</h3>
        </div>
      )}
      {r.idioma_consulta === 'es' && (
        <p className="text-milo-muted">
          Buscaste:{' '}
          <span className="font-medium text-milo-text">{r.consulta}</span>
          {' · '}
          Entrada del diccionario (inglés):{' '}
          <span className="font-medium text-milo-text">{r.palabra}</span>
        </p>
      )}
      {r.fonetica && <p className="text-milo-muted">{r.fonetica}</p>}
      {r.idioma_consulta === 'es' && r.traduccion_es && (
        <p className="rounded-lg bg-milo-elevated/80 px-2 py-1.5 text-milo-text">
          <span className="text-[10px] font-medium text-milo-muted">
            Pista en español (aprox.):{' '}
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

function BloqueFraseUnificada({
  fraseOrigen,
  traduccion,
}: {
  fraseOrigen: 'en' | 'es'
  traduccion: string
}) {
  const esEnEs = fraseOrigen === 'en'
  return (
    <div className="space-y-2 rounded-lg border border-milo-border bg-milo-canvas/40 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-milo-accent">
        {esEnEs ? 'Frase · inglés → español' : 'Frase · español → inglés'}
      </p>
      <p className="text-sm leading-relaxed text-milo-text">{traduccion}</p>
      <p className="text-[10px] leading-snug text-milo-muted">
        {esEnEs
          ? 'Las definiciones del diccionario son por palabra: probá una sola palabra si querés fonética y acepciones.'
          : 'Para definiciones en inglés con ejemplos, probá también una palabra suelta en español.'}
      </p>
    </div>
  )
}

function ContenidoDiccionario({
  busqueda,
}: {
  busqueda: BusquedaDiccionarioUnificada
}) {
  const {
    terminoEntrada,
    setTerminoEntrada,
    resultado,
    isCargando,
    error,
    buscar,
    limpiar,
  } = busqueda
  const idInput = useId()
  const variasEntradas =
    resultado && resultado.entradas.length > 1

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <form
          className="shrink-0"
          onSubmit={(e) => {
            e.preventDefault()
            void buscar()
          }}
        >
          <label className="sr-only" htmlFor={idInput}>
            Palabra o frase
          </label>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch">
            <input
              id={idInput}
              type="text"
              value={terminoEntrada}
              onChange={(e) => setTerminoEntrada(e.target.value)}
              placeholder="Ej. blue, i can, azul, nariz…"
              className="min-w-0 flex-1 rounded-xl border border-milo-border bg-milo-canvas px-2 py-1.5 text-xs text-milo-text placeholder:text-milo-muted focus:border-milo-accent/50 focus:outline-none"
              autoComplete="off"
              spellCheck
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

        <div className="mt-2 min-h-0 flex-1 space-y-3">
          {error && (
            <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-2 py-1.5 text-[11px] text-red-200">
              {error}
            </p>
          )}
          {resultado && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => limpiar()}
                  className="text-[10px] text-milo-accent hover:underline"
                >
                  Limpiar
                </button>
              </div>
              {resultado.es_frase &&
                resultado.frase_origen &&
                resultado.traduccion_frase && (
                  <BloqueFraseUnificada
                    fraseOrigen={resultado.frase_origen}
                    traduccion={resultado.traduccion_frase}
                  />
                )}
              {resultado.entradas.map((r, idx) => (
                <div
                  key={`${r.palabra}-${r.idioma_consulta}-${idx}`}
                  className={
                    idx > 0
                      ? 'border-t border-milo-border pt-3'
                      : undefined
                  }
                >
                  <BloqueResultado
                    r={r}
                    mostrarTituloSeccion={Boolean(variasEntradas)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-snug text-milo-muted">
          Una sola búsqueda: en inglés ves la palabra, la traducción al español y
          las definiciones en inglés; en español te llevamos al equivalente en el
          diccionario inglés. Si hay dos interpretaciones posibles, mostramos
          ambas. Las frases cortas se traducen enteras (por ejemplo &quot;i
          can&quot; → &quot;yo puedo&quot;).
        </p>
      </div>
    </div>
  )
}

export default function DictionaryPanel({
  drawerMovilAbierto,
  onDrawerMovilAbiertoChange,
}: Props) {
  const busqueda = useDictionaryUnified()

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
        <ContenidoDiccionario busqueda={busqueda} />
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
                  <ContenidoDiccionario busqueda={busqueda} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
