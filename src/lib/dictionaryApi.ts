import { extraerMensajeErrorApi, obtenerUrlBaseApi } from './apiClient'
import type { ResultadoDiccionario } from '../types/dictionary'

export async function buscarPalabraDiccionario(
  termino: string,
  opciones?: { fromLang?: 'en' | 'es' },
): Promise<ResultadoDiccionario> {
  const base = obtenerUrlBaseApi()
  const url = new URL(`${base}/dictionary/lookup`)
  url.searchParams.set('q', termino.trim())
  const fromLang = opciones?.fromLang ?? 'en'
  if (fromLang !== 'en') {
    url.searchParams.set('from_lang', fromLang)
  }
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

/** Traducción completa EN→ES de la respuesta del tutor (bloque de texto). */
export async function traducirTextoRespuestaTutor(texto: string): Promise<string> {
  const base = obtenerUrlBaseApi()
  const res = await fetch(`${base}/dictionary/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto: texto.trim() }),
  })
  const cuerpo = await res.text()
  if (!res.ok) {
    throw new Error(extraerMensajeErrorApi(res.status, cuerpo))
  }
  try {
    const j = JSON.parse(cuerpo) as { texto_traducido?: string }
    if (typeof j.texto_traducido === 'string' && j.texto_traducido.trim()) {
      return j.texto_traducido.trim()
    }
  } catch {
    /* fallthrough */
  }
  throw new Error('Respuesta de traducción inválida')
}
