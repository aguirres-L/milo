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
