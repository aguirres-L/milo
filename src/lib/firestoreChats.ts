import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDb } from './firebase'
import { rutaChat, rutaChatsUsuario, rutaMensajes } from './firestorePaths'
import type { Chat } from '../types/chat'

function chatDesdeDoc(id: string, data: Record<string, unknown>): Chat {
  const creadoEn = data.creadoEn
  const actualizadoEn = data.actualizadoEn
  return {
    id,
    titulo: String(data.titulo ?? ''),
    creadoEn:
      creadoEn && typeof (creadoEn as { toDate?: () => Date }).toDate === 'function'
        ? (creadoEn as { toDate: () => Date }).toDate()
        : new Date(),
    actualizadoEn:
      actualizadoEn &&
      typeof (actualizadoEn as { toDate?: () => Date }).toDate === 'function'
        ? (actualizadoEn as { toDate: () => Date }).toDate()
        : new Date(),
    previewUltimoMensaje: String(data.previewUltimoMensaje ?? ''),
  }
}

export function suscribirChats(
  alActualizar: (chats: Chat[]) => void,
): Unsubscribe {
  const db = getDb()
  const ref = collection(db, rutaChatsUsuario())
  const q = query(ref, orderBy('actualizadoEn', 'desc'))
  return onSnapshot(q, (snap) => {
    const lista = snap.docs.map((d) =>
      chatDesdeDoc(d.id, d.data() as Record<string, unknown>),
    )
    alActualizar(lista)
  })
}

export async function crearChat(): Promise<string> {
  const db = getDb()
  const ref = doc(collection(db, rutaChatsUsuario()))
  await setDoc(ref, {
    titulo: 'Nuevo chat',
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
    previewUltimoMensaje: '',
  })
  return ref.id
}

export async function actualizarMetadatosChat(
  chatId: string,
  previewUltimoMensaje: string,
): Promise<void> {
  const db = getDb()
  const ref = doc(db, rutaChat(chatId))
  await updateDoc(ref, {
    actualizadoEn: serverTimestamp(),
    previewUltimoMensaje,
  })
}

export async function actualizarTituloChat(
  chatId: string,
  titulo: string,
): Promise<void> {
  const db = getDb()
  const ref = doc(db, rutaChat(chatId))
  await updateDoc(ref, {
    titulo,
    actualizadoEn: serverTimestamp(),
  })
}

/** Borra todos los mensajes del chat y el documento del chat. */
export async function eliminarChatCompleto(chatId: string): Promise<void> {
  const db = getDb()
  const refMensajes = collection(db, rutaMensajes(chatId))
  const snap = await getDocs(refMensajes)
  let batch = writeBatch(db)
  let ops = 0
  for (const d of snap.docs) {
    batch.delete(d.ref)
    ops++
    if (ops >= 450) {
      await batch.commit()
      batch = writeBatch(db)
      ops = 0
    }
  }
  if (ops > 0) {
    await batch.commit()
  }
  await deleteDoc(doc(db, rutaChat(chatId)))
}
