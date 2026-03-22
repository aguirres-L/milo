import { extraerMensajeErrorApi, obtenerUrlBaseApi } from './apiClient'
import type { ResultadoDiccionario } from '../types/dictionary'

export async function buscarPalabraDiccionario(
  termino: string,
): Promise<ResultadoDiccionario> {
  const base = obtenerUrlBaseApi()
  const url = new URL(`${base}/dictionary/lookup`)
  url.searchParams.set('q', termino.trim())
  const res = await fetch(url.toString())
  const texto = await res.text()
  if (!res.ok) {
    throw new Error(extraerMensajeErrorApi(res.status, texto))
  }
  try {
    return JSON.parse(texto) as ResultadoDiccionario
  } catch {
    throw new Error('Respuesta del diccionario no es JSON válido')
  }
}
