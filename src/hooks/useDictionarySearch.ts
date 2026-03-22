import { useCallback, useState } from 'react'
import { buscarPalabraDiccionario } from '../lib/dictionaryApi'
import type { ResultadoDiccionario } from '../types/dictionary'

export function useDictionaryColumn(fromLang: 'en' | 'es') {
  const [terminoEntrada, setTerminoEntrada] = useState('')
  const [resultado, setResultado] = useState<ResultadoDiccionario | null>(null)
  const [isCargando, setIsCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = useCallback(
    async (texto?: string) => {
      const t = (texto ?? terminoEntrada).trim()
      if (!t) {
        setError(
          fromLang === 'es'
            ? 'Escribí una palabra en español'
            : 'Escribí una palabra en inglés',
        )
        return
      }
      setIsCargando(true)
      setError(null)
      try {
        const r = await buscarPalabraDiccionario(t, { fromLang })
        setResultado(r)
        setTerminoEntrada(r.consulta)
      } catch (e) {
        setResultado(null)
        setError(e instanceof Error ? e.message : 'Error al buscar')
      } finally {
        setIsCargando(false)
      }
    },
    [fromLang, terminoEntrada],
  )

  const limpiar = useCallback(() => {
    setResultado(null)
    setError(null)
  }, [])

  return {
    terminoEntrada,
    setTerminoEntrada,
    resultado,
    isCargando,
    error,
    buscar,
    limpiar,
    fromLang,
  }
}

export type BusquedaColumnaDiccionario = ReturnType<typeof useDictionaryColumn>
