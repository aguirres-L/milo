export interface HistorialItemPeticion {
  rol: 'user' | 'assistant'
  contenido: string
}

export interface MensajePeticion {
  texto: string
  historial: HistorialItemPeticion[]
}

export interface MensajeRespuesta {
  respuesta_en: string
  explicacion_es: string
}
