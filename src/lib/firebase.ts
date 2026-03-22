import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let appInst: FirebaseApp | null = null
let dbInst: Firestore | null = null

export type VariableFirebaseCliente = {
  nombre: string
  definida: boolean
  vista?: string
}

function enmascarar(valor: string): string {
  const s = valor.trim()
  if (s.length <= 8) return '***'
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

/** Solo lectura de env; no inicializa el SDK (útil en pantalla de verificación). */
export function obtenerVariablesFirebaseCliente(): VariableFirebaseCliente[] {
  const entradas: [string, string | undefined][] = [
    ['VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY],
    ['VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN],
    ['VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID],
    ['VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET],
    ['VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID],
    ['VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID],
  ]
  return entradas.map(([nombre, valor]) => {
    const ok = Boolean(valor && String(valor).trim())
    return {
      nombre,
      definida: ok,
      vista: ok ? enmascarar(String(valor)) : undefined,
    }
  })
}

export function initFirebase(): FirebaseApp {
  if (appInst) {
    return appInst
  }

  const faltantes = (
    [
      ['VITE_FIREBASE_API_KEY', firebaseConfig.apiKey],
      ['VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
    ] as const
  ).filter(([, valor]) => !valor)

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables en .env: ${faltantes.map(([nombre]) => nombre).join(', ')}`,
    )
  }

  appInst = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  dbInst = getFirestore(appInst)
  return appInst
}

export function getDb(): Firestore {
  if (!dbInst) {
    initFirebase()
  }
  return dbInst!
}
