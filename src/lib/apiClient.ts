import type { MensajePeticion, MensajeRespuesta } from '../types/api'

export function extraerMensajeErrorApi(status: number, cuerpo: string): string {
  try {
    const j = JSON.parse(cuerpo) as { detail?: unknown }
    if (typeof j.detail === 'string' && j.detail.trim()) {
      return j.detail.trim()
    }
  } catch {
    /* no es JSON */
  }
  if (status === 429) {
    return (
      'Límite de uso de Gemini (cuota o demasiadas solicitudes). ' +
      'Esperá un minuto, probá otro modelo o revisá tu plan en Google AI.'
    )
  }
  return cuerpo.trim() || `Error ${status}`
}

export function obtenerUrlBaseApi(): string {
  const url = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (!url) {
    throw new Error('Falta VITE_API_BASE_URL en .env')
  }
  return url
}

function baseUrl(): string {
  return obtenerUrlBaseApi()
}

export async function enviarMensajeAlTutor(
  chatId: string,
  cuerpo: MensajePeticion,
): Promise<MensajeRespuesta> {
  const res = await fetch(
    `${baseUrl()}/chats/${encodeURIComponent(chatId)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    },
  )

  if (!res.ok) {
    const texto = await res.text()
    throw new Error(extraerMensajeErrorApi(res.status, texto))
  }

  return res.json() as Promise<MensajeRespuesta>
}
