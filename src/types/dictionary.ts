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
}
