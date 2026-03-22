import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { Mensaje } from '../../types/message'

type Props = {
  mensajes: Mensaje[]
}

export default function MessageList({ mensajes }: Props) {
  const finalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes])

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      role="log"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-chat flex-col gap-4">
        {mensajes.map((m) => (
          <MessageBubble key={m.id} mensaje={m} />
        ))}
        <div ref={finalRef} />
      </div>
    </div>
  )
}
