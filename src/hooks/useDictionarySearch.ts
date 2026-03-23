import { useCallback, useState } from 'react'
import { buscarDiccionarioUnificado } from '../lib/dictionaryApi'
import type { ResultadoDiccionarioUnificado } from '../types/dictionary'

export function useDictionaryUnified() {
  const [terminoEntrada, setTerminoEntrada] = useState('')
  const [resultado, setResultado] =
    useState<ResultadoDiccionarioUnificado | null>(null)
  const [isCargando, setIsCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = useCallback(
    async (texto?: string) => {
      const t = (texto ?? terminoEntrada).trim()
      if (!t) {
        setError('Escribí una palabra o una frase corta')
        return
      }
      setIsCargando(true)
      setError(null)
      try {
        const r = await buscarDiccionarioUnificado(t)
        setResultado(r)
        setTerminoEntrada(r.consulta)
      } catch (e) {
        setResultado(null)
        setError(e instanceof Error ? e.message : 'Error al buscar')
      } finally {
        setIsCargando(false)
      }
    },
    [terminoEntrada],
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
  }
}

export type BusquedaDiccionarioUnificada = ReturnType<
  typeof useDictionaryUnified
>
