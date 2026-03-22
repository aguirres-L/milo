import { useState } from 'react'
import ChatEmptyState from './ChatEmptyState'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import DictionaryPanel from '../dictionary/DictionaryPanel'
import Sidebar from '../../components/Sidebar'
import { useMiloChat } from '../../hooks/useMiloChat'

export default function ChatShell() {
  const [historialMovilAbierto, setHistorialMovilAbierto] = useState(false)
  const [diccionarioMovilAbierto, setDiccionarioMovilAbierto] =
    useState(false)

  const {
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
  } = useMiloChat()

  const chatActivo = chats.find((c) => c.id === chatActivoId)
  const tituloCabecera = chatActivo?.titulo ?? 'Nuevo chat'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden md:flex-row">
      <Sidebar
        chats={chats}
        chatActivoId={chatActivoId}
        historialMovilAbierto={historialMovilAbierto}
        onCerrarHistorialMovil={() => setHistorialMovilAbierto(false)}
        onNuevoChat={() => {
          void crearNuevoChat()
          setHistorialMovilAbierto(false)
        }}
        onSeleccionarChat={(id) => {
          setChatActivoId(id)
          setHistorialMovilAbierto(false)
        }}
        onRenombrarChat={(id, nuevoTitulo) => {
          void renombrarChat(id, nuevoTitulo)
        }}
        onEliminarChat={(id) => {
          void eliminarChat(id)
        }}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-milo-canvas">
        <ChatHeader
          titulo={tituloCabecera}
          onAbrirHistorial={() => {
            setDiccionarioMovilAbierto(false)
            setHistorialMovilAbierto(true)
          }}
          onAbrirDiccionario={() => {
            setHistorialMovilAbierto(false)
            setDiccionarioMovilAbierto(true)
          }}
        />

        {errorEnvio && (
          <div
            className="shrink-0 border-b border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-200"
            role="alert"
          >
            {errorEnvio}
          </div>
        )}

        {mensajes.length === 0 ? (
          <ChatEmptyState
            onElegirSugerencia={(t) => {
              void enviarTexto(t)
            }}
          />
        ) : (
          <MessageList mensajes={mensajes} />
        )}

        <ChatInput onEnviar={(t) => void enviarTexto(t)} isDeshabilitado={isEnviando} />
      </main>

      <DictionaryPanel
        drawerMovilAbierto={diccionarioMovilAbierto}
        onDrawerMovilAbiertoChange={setDiccionarioMovilAbierto}
      />
    </div>
  )
}
