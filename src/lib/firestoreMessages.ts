import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDb } from './firebase'
import { rutaMensajes } from './firestorePaths'
import type { Mensaje, RolMensaje } from '../types/message'

function mensajeDesdeDoc(id: string, data: Record<string, unknown>): Mensaje {
  const creadoEn = data.creadoEn
  return {
    id,
    rol: data.rol as RolMensaje,
    contenidoEn: String(data.contenidoEn ?? ''),
    contenidoEs: data.contenidoEs != null ? String(data.contenidoEs) : undefined,
    creadoEn:
      creadoEn && typeof (creadoEn as { toDate?: () => Date }).toDate === 'function'
        ? (creadoEn as { toDate: () => Date }).toDate()
        : new Date(),
  }
}

export function suscribirMensajes(
  chatId: string,
  alActualizar: (mensajes: Mensaje[]) => void,
): Unsubscribe {
  const db = getDb()
  const ref = collection(db, rutaMensajes(chatId))
  const q = query(ref, orderBy('creadoEn', 'asc'))
  return onSnapshot(q, (snap) => {
    const lista = snap.docs.map((d) =>
      mensajeDesdeDoc(d.id, d.data() as Record<string, unknown>),
    )
    alActualizar(lista)
  })
}

export async function agregarMensaje(
  chatId: string,
  payload: Pick<Mensaje, 'rol' | 'contenidoEn' | 'contenidoEs'>,
): Promise<void> {
  const db = getDb()
  const ref = collection(db, rutaMensajes(chatId))
  await addDoc(ref, {
    rol: payload.rol,
    contenidoEn: payload.contenidoEn,
    ...(payload.contenidoEs != null ? { contenidoEs: payload.contenidoEs } : {}),
    creadoEn: serverTimestamp(),
  })
}
