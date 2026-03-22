import { useCallback, useState } from 'react'
import { buscarPalabraDiccionario } from '../lib/dictionaryApi'
import type { ResultadoDiccionario } from '../types/dictionary'

export function useDictionarySearch() {
  const [terminoEntrada, setTerminoEntrada] = useState('')
  const [resultado, setResultado] = useState<ResultadoDiccionario | null>(null)
  const [isCargando, setIsCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = useCallback(async (texto?: string) => {
    const t = (texto ?? terminoEntrada).trim()
    if (!t) {
      setError('Escribí una palabra en inglés')
      return
    }
    setIsCargando(true)
    setError(null)
    try {
      const r = await buscarPalabraDiccionario(t)
      setResultado(r)
      setTerminoEntrada(r.palabra)
    } catch (e) {
      setResultado(null)
      setError(e instanceof Error ? e.message : 'Error al buscar')
    } finally {
      setIsCargando(false)
    }
  }, [terminoEntrada])

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
  }
}
