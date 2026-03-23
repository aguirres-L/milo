export interface DefinicionDiccionario {
  definicion: string
  ejemplo: string | null
}

export interface GrupoAcepcionDiccionario {
  parte: string
  definiciones: DefinicionDiccionario[]
}

export interface ResultadoDiccionario {
  palabra: string
  fonetica: string | null
  traduccion_es: string | null
  acepciones: GrupoAcepcionDiccionario[]
  /** Idioma en el que escribió el usuario en el buscador */
  idioma_consulta: 'en' | 'es'
  consulta: string
}

/** Respuesta de GET /dictionary/lookup-unified (una caja de búsqueda). */
export interface ResultadoDiccionarioUnificado {
  consulta: string
  es_frase: boolean
  frase_origen: 'en' | 'es' | null
  traduccion_frase: string | null
  entradas: ResultadoDiccionario[]
}
