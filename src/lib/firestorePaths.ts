import { ID_USUARIO_DESARROLLO } from './constants'

export function rutaChatsUsuario(): string {
  return `users/${ID_USUARIO_DESARROLLO}/chats`
}

export function rutaChat(chatId: string): string {
  return `${rutaChatsUsuario()}/${chatId}`
}

export function rutaMensajes(chatId: string): string {
  return `${rutaChat(chatId)}/messages`
}
