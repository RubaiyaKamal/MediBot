import { useState, useRef } from 'react'
import ChatWindow, { type ChatMessage } from '../components/ChatWindow'
import QuickReplies from '../components/QuickReplies'
import { sendMessage } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

const PRIMARY = '#1B5E47'
const AVATAR_GREEN = '#2d8c65'
const HOSPITAL_ID = 1

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [quickReplies, setQuickReplies] = useState<string[]>([])

  const sessionId = useRef(
    sessionStorage.getItem('medibot_session') ?? (() => {
      const id = uuidv4()
      sessionStorage.setItem('medibot_session', id)
      return id
    })()
  )

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    setInput('')
    setQuickReplies([])
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setIsTyping(true)
    try {
      const res = await sendMessage(HOSPITAL_ID, sessionId.current, msg)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
      setQuickReplies(res.data.quick_replies)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#f0f4f3' }}>
      {/* Header */}
      <header
        className="text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: AVATAR_GREEN }}
          >
            M
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">MediBot</h1>
            <p className="text-green-200 text-xs mt-0.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Online — AI Hospital Assistant
            </p>
          </div>
        </div>
        <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          🚨 Emergency: 1122
        </span>
      </header>

      {/* Chat Messages */}
      <ChatWindow messages={messages} isTyping={isTyping} />

      {/* Quick Reply Chips */}
      {quickReplies.length > 0 && (
        <QuickReplies replies={quickReplies} onSelect={handleSend} />
      )}

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-center flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message here..."
          disabled={isTyping}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 disabled:bg-gray-50 bg-gray-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="text-white rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-1.5 flex-shrink-0 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: PRIMARY }}
        >
          Send ✈
        </button>
      </div>

      {/* Footer */}
      <div
        className="text-white text-xs text-center py-2 font-medium flex-shrink-0"
        style={{ backgroundColor: PRIMARY }}
      >
        MediCare Hospital Karachi — Patient Chat
      </div>
    </div>
  )
}
