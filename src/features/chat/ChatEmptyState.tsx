import { AnimatePresence } from 'framer-motion'
import AnimationComponent from '../../hook/frame_motion/AnimationComponent'

const SUGERENCIAS = [
  'Practicar small talk',
  'Corregir mi texto',
  'Explicar esta frase en inglés',
  'Roleplay: pedir direcciones',
]

type Props = {
  onElegirSugerencia: (texto: string) => void
}

export default function ChatEmptyState({ onElegirSugerencia }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <p className="mb-6 max-w-chat text-center text-milo-muted">
        Escribí en inglés para practicar. Podés usar una sugerencia o tu propia
        idea.
      </p>
      <ul className="flex max-w-chat flex-wrap justify-center gap-2">
        <AnimatePresence>
          {SUGERENCIAS.map((texto, i) => (
            <li key={texto}>
              <AnimationComponent
                type="fadeUp"
                delay={i * 0.06}
                className="inline-block"
              >
                <button
                  type="button"
                  onClick={() => onElegirSugerencia(texto)}
                  className="rounded-full border border-milo-border bg-milo-surface px-4 py-2 text-sm text-milo-text transition hover:border-milo-accent/50 hover:bg-milo-elevated"
                >
                  {texto}
                </button>
              </AnimationComponent>
            </li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
