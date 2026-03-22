export type RolMensaje = 'user' | 'assistant'

export interface Mensaje {
  id: string
  rol: RolMensaje
  contenidoEn: string
  contenidoEs?: string
  creadoEn: Date
}
