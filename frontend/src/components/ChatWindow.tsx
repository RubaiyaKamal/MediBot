import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  messages: ChatMessage[]
  isTyping: boolean
  isUrdu: boolean
}

export default function ChatWindow({ messages, isTyping, isUrdu }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          {isUrdu ? 'ہیلو! میں آپ کی کیا مدد کر سکتا ہوں؟' : 'Hello! How can I help you today?'}
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} isUrdu={isUrdu} />
      ))}
      {isTyping && (
        <div className="flex justify-start mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
            M
          </div>
          <TypingIndicator />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
