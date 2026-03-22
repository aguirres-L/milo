import { useCallback, useEffect, useState } from 'react'
import { enviarMensajeAlTutor } from '../lib/apiClient'
import {
  actualizarMetadatosChat,
  actualizarTituloChat,
  crearChat,
  eliminarChatCompleto,
  suscribirChats,
} from '../lib/firestoreChats'
import { agregarMensaje, suscribirMensajes } from '../lib/firestoreMessages'
import { MAX_MENSAJES_HISTORIAL_API } from '../lib/constants'
import type { Chat } from '../types/chat'
import type { Mensaje } from '../types/message'

export function useMiloChat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [chatActivoId, setChatActivoId] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [isEnviando, setIsEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  useEffect(() => {
    return suscribirChats(setChats)
  }, [])

  useEffect(() => {
    if (!chatActivoId) {
      setMensajes([])
      return
    }
    return suscribirMensajes(chatActivoId, setMensajes)
  }, [chatActivoId])

  const crearNuevoChat = useCallback(async () => {
    setErrorEnvio(null)
    const id = await crearChat()
    setChatActivoId(id)
    return id
  }, [])

  const renombrarChat = useCallback(
    async (id: string, nuevoTitulo: string) => {
      const t = nuevoTitulo.trim()
      if (!t) return
      const actual = chats.find((c) => c.id === id)
      if (actual && (actual.titulo || '').trim() === t) return
      setErrorEnvio(null)
      try {
        await actualizarTituloChat(id, t)
      } catch (e) {
        setErrorEnvio(e instanceof Error ? e.message : 'No se pudo renombrar')
      }
    },
    [chats],
  )

  const eliminarChat = useCallback(async (id: string) => {
    setErrorEnvio(null)
    try {
      await eliminarChatCompleto(id)
      setChatActivoId((actual) => (actual === id ? null : actual))
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : 'No se pudo eliminar')
    }
  }, [])

  const enviarTexto = useCallback(
    async (texto: string) => {
      const limpio = texto.trim()
      if (!limpio || isEnviando) return

      setErrorEnvio(null)
      setIsEnviando(true)

      try {
        let idChat = chatActivoId
        if (!idChat) {
          idChat = await crearChat()
          setChatActivoId(idChat)
        }

        const esPrimerMensaje = mensajes.length === 0
        if (esPrimerMensaje) {
          const titulo =
            limpio.length > 52 ? `${limpio.slice(0, 52)}…` : limpio
          await actualizarTituloChat(idChat, titulo)
        }

        await agregarMensaje(idChat, {
          rol: 'user',
          contenidoEn: limpio,
        })

        const historial = mensajes
          .slice(-MAX_MENSAJES_HISTORIAL_API)
          .map((m) => ({
            rol: m.rol,
            contenido: m.contenidoEn,
          }))

        const respuesta = await enviarMensajeAlTutor(idChat, {
          texto: limpio,
          historial,
        })

        await agregarMensaje(idChat, {
          rol: 'assistant',
          contenidoEn: respuesta.respuesta_en,
          contenidoEs: respuesta.explicacion_es,
        })

        const preview =
          respuesta.respuesta_en.length > 80
            ? `${respuesta.respuesta_en.slice(0, 80)}…`
            : respuesta.respuesta_en
        await actualizarMetadatosChat(idChat, preview)
      } catch (e) {
        setErrorEnvio(e instanceof Error ? e.message : 'Error al enviar')
      } finally {
        setIsEnviando(false)
      }
    },
    [chatActivoId, isEnviando, mensajes],
  )

  return {
    chats,
    chatActivoId,
    setChatActivoId,
    mensajes,
    isEnviando,
    errorEnvio,
    crearNuevoChat,
    renombrarChat,
    eliminarChat,
    enviarTexto,
  }
}
