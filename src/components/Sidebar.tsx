import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MiloConfirmModal } from './MiloConfirmModal'
import { MiloPromptModal } from './MiloPromptModal'
import type { Chat } from '../types/chat'

type Props = {
  chats: Chat[]
  chatActivoId: string | null
  onNuevoChat: () => void
  onSeleccionarChat: (id: string) => void
  onRenombrarChat: (id: string, nuevoTitulo: string) => void
  onEliminarChat: (id: string) => void
  historialMovilAbierto: boolean
  onCerrarHistorialMovil: () => void
}

type EstadoModalEliminar = { chatId: string; tituloVista: string }

type EstadoModalRenombrar = { chatId: string; tituloActual: string }

function IconoEditar() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  )
}

function IconoEliminar() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

type ListaProps = {
  chats: Chat[]
  chatActivoId: string | null
  onSeleccionarChat: (id: string) => void
  menuChatId: string | null
  setMenuChatId: (id: string | null) => void
  menuRef: RefObject<HTMLLIElement | null>
  setModalRenombrar: (v: EstadoModalRenombrar | null) => void
  setModalEliminar: (v: EstadoModalEliminar | null) => void
  /** En cajón móvil las acciones se muestran siempre (mejor área táctil). */
  accionesSiempreVisibles: boolean
}

function ListaConversaciones({
  chats,
  chatActivoId,
  onSeleccionarChat,
  menuChatId,
  setMenuChatId,
  menuRef,
  setModalRenombrar,
  setModalEliminar,
  accionesSiempreVisibles,
}: ListaProps) {
  const claseAcciones = accionesSiempreVisibles
    ? 'rounded p-2 text-milo-muted hover:bg-milo-border/50 hover:text-milo-text'
    : 'rounded p-1 text-milo-muted opacity-70 hover:bg-milo-border/50 hover:text-milo-text md:opacity-0 md:transition md:group-hover:opacity-100'
  const claseEliminar = accionesSiempreVisibles
    ? 'rounded p-2 text-milo-muted hover:bg-red-900/30 hover:text-red-300'
    : 'rounded p-1 text-milo-muted opacity-70 hover:bg-red-900/30 hover:text-red-300 md:opacity-0 md:transition md:group-hover:opacity-100'

  return (
    <ul className="flex flex-col gap-1" role="list">
      {chats.length === 0 ? (
        <li className="px-2 py-3 text-sm text-milo-muted">
          Sin conversaciones aún
        </li>
      ) : (
        chats.map((c) => {
          const isActivo = c.id === chatActivoId
          const menuAbierto = menuChatId === c.id
          return (
            <li
              key={c.id}
              ref={menuAbierto ? menuRef : undefined}
              className="group relative w-full"
            >
              <div
                className={`flex w-full items-center gap-0.5 rounded-lg ${
                  isActivo
                    ? 'bg-milo-elevated'
                    : 'hover:bg-milo-elevated/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSeleccionarChat(c.id)}
                  className={`min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm transition md:px-2 md:py-2 ${
                    isActivo
                      ? 'text-milo-text'
                      : 'text-milo-muted group-hover:text-milo-text'
                  }`}
                >
                  {c.titulo || 'Sin título'}
                </button>
                <div className="relative flex shrink-0 items-center gap-0.5 pr-1 md:pr-1">
                  <button
                    type="button"
                    title="Renombrar chat"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuChatId(null)
                      setModalRenombrar({
                        chatId: c.id,
                        tituloActual: c.titulo || 'Sin título',
                      })
                    }}
                    className={claseAcciones}
                  >
                    <IconoEditar />
                  </button>
                  <button
                    type="button"
                    title="Eliminar chat"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuChatId(null)
                      setModalEliminar({
                        chatId: c.id,
                        tituloVista: c.titulo || 'Sin título',
                      })
                    }}
                    className={claseEliminar}
                  >
                    <IconoEliminar />
                  </button>
                  {!accionesSiempreVisibles && (
                    <button
                      type="button"
                      title="Más acciones"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuChatId(menuAbierto ? null : c.id)
                      }}
                      className="rounded p-1 text-milo-muted hover:bg-milo-border/50 hover:text-milo-text md:hidden"
                      aria-expanded={menuAbierto}
                    >
                      ⋮
                    </button>
                  )}
                </div>
              </div>
              {!accionesSiempreVisibles && menuAbierto && (
                <ul
                  className="absolute right-1 top-full z-20 mt-0.5 min-w-[9rem] rounded-lg border border-milo-border bg-milo-elevated py-1 shadow-lg md:hidden"
                  role="menu"
                >
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left text-sm text-milo-text hover:bg-milo-border/40"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuChatId(null)
                        setModalRenombrar({
                          chatId: c.id,
                          tituloActual: c.titulo || 'Sin título',
                        })
                      }}
                    >
                      Renombrar
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-950/40"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuChatId(null)
                        setModalEliminar({
                          chatId: c.id,
                          tituloVista: c.titulo || 'Sin título',
                        })
                      }}
                    >
                      Eliminar
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )
        })
      )}
    </ul>
  )
}

function BarraSuperiorSidebar({
  onNuevoChat,
  mostrarCerrar,
  onCerrar,
}: {
  onNuevoChat: () => void
  mostrarCerrar?: boolean
  onCerrar?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-milo-border px-3 py-3">
      <span className="text-sm font-medium text-milo-text">Milo</span>
      <div className="flex items-center gap-2">
        {mostrarCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-milo-muted hover:bg-milo-elevated hover:text-milo-text"
          >
            Cerrar
          </button>
        )}
        <a
          href="?check=1"
          className="text-xs text-milo-muted hover:text-milo-accent md:hidden"
        >
          Check
        </a>
        <button
          type="button"
          onClick={onNuevoChat}
          className="rounded-lg bg-milo-elevated px-3 py-1.5 text-xs font-medium text-milo-accent transition hover:bg-milo-border"
        >
          Nuevo chat
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({
  chats,
  chatActivoId,
  onNuevoChat,
  onSeleccionarChat,
  onRenombrarChat,
  onEliminarChat,
  historialMovilAbierto,
  onCerrarHistorialMovil,
}: Props) {
  const [menuChatId, setMenuChatId] = useState<string | null>(null)
  const [modalEliminar, setModalEliminar] = useState<EstadoModalEliminar | null>(
    null,
  )
  const [modalRenombrar, setModalRenombrar] =
    useState<EstadoModalRenombrar | null>(null)
  const menuRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!menuChatId) return
    const cerrar = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      setMenuChatId(null)
    }
    document.addEventListener('click', cerrar)
    return () => document.removeEventListener('click', cerrar)
  }, [menuChatId])

  useEffect(() => {
    if (!historialMovilAbierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [historialMovilAbierto])

  const listaProps: ListaProps = {
    chats,
    chatActivoId,
    onSeleccionarChat,
    menuChatId,
    setMenuChatId,
    menuRef,
    setModalRenombrar,
    setModalEliminar,
    accionesSiempreVisibles: false,
  }

  const listaPropsCajon: ListaProps = {
    ...listaProps,
    accionesSiempreVisibles: true,
  }

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-milo-border bg-milo-surface md:flex">
        <BarraSuperiorSidebar onNuevoChat={onNuevoChat} />
        <nav
          className="min-h-0 flex-1 overflow-y-auto px-2 py-2"
          aria-label="Conversaciones"
        >
          <ListaConversaciones {...listaProps} />
        </nav>
        <div className="flex flex-col gap-2 border-t border-milo-border px-3 py-2 text-xs text-milo-muted">
          <span>Dev: sin Firebase Auth</span>
          <a className="text-milo-accent hover:underline" href="?check=1">
            Verificar configuración
          </a>
        </div>
      </aside>

      <AnimatePresence>
        {historialMovilAbierto && (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar menú de conversaciones"
              className="fixed inset-0 z-[90] bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCerrarHistorialMovil}
            />
            <motion.aside
              role="dialog"
              aria-label="Conversaciones"
              aria-modal="true"
              className="fixed bottom-0 left-0 top-0 z-[95] flex w-[min(100%,20rem)] flex-col border-r border-milo-border bg-milo-surface shadow-xl md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <BarraSuperiorSidebar
                onNuevoChat={onNuevoChat}
                mostrarCerrar
                onCerrar={onCerrarHistorialMovil}
              />
              <nav
                className="min-h-0 flex-1 overflow-y-auto px-2 py-2"
                aria-label="Conversaciones"
              >
                <ListaConversaciones {...listaPropsCajon} />
              </nav>
              <div className="shrink-0 border-t border-milo-border px-3 py-2 text-xs text-milo-muted">
                <a className="text-milo-accent hover:underline" href="?check=1">
                  Verificar configuración
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <MiloConfirmModal
        isAbierto={modalEliminar !== null}
        onCerrar={() => setModalEliminar(null)}
        titulo="Eliminar conversación"
        mensaje={
          modalEliminar
            ? `¿Eliminar “${modalEliminar.tituloVista}” y todos sus mensajes? Esta acción no se puede deshacer.`
            : ''
        }
        textoCancelar="Cancelar"
        textoConfirmar="Eliminar"
        isPeligro
        onConfirmar={() => {
          if (modalEliminar) onEliminarChat(modalEliminar.chatId)
        }}
      />

      <MiloPromptModal
        isAbierto={modalRenombrar !== null}
        onCerrar={() => setModalRenombrar(null)}
        titulo="Renombrar chat"
        etiqueta="Título"
        valorInicial={modalRenombrar?.tituloActual ?? ''}
        textoCancelar="Cancelar"
        textoGuardar="Guardar"
        onGuardar={(nuevoTitulo) => {
          if (modalRenombrar)
            onRenombrarChat(modalRenombrar.chatId, nuevoTitulo)
        }}
      />
    </>
  )
}
