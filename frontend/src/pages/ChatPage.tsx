import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import ChatWindow, { type ChatMessage } from '../components/ChatWindow'
import QuickReplies from '../components/QuickReplies'
import ClinicSelector from '../components/ClinicSelector'
import { getClinics, sendMessage, type Clinic } from '../services/api'

export default function ChatPage() {
  const { t, i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [clinicsLoading, setClinicsLoading] = useState(true)
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)

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

  useEffect(() => {
    getClinics()
      .then((res) => {
        setClinics(res.data)
        if (res.data.length === 1) setSelectedClinicId(res.data[0].id)
      })
      .finally(() => setClinicsLoading(false))
  }, [])

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || !selectedClinicId) return
    setInput('')
    setQuickReplies([])
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setIsTyping(true)
    try {
      const res = await sendMessage(selectedClinicId, sessionId.current, msg)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
      setQuickReplies(res.data.quick_replies)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: isUrdu ? 'معذرت، کچھ غلطی ہوئی۔ دوبارہ کوشش کریں۔' : 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur')

  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white text-center text-xs py-1.5 px-4 font-medium">
        {t('emergencyBanner')}
      </div>

      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="font-bold text-base leading-none">{t('appName')}</h1>
            <p className="text-blue-200 text-xs">{t('tagline')}</p>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
        >
          {isUrdu ? 'EN' : 'اردو'}
        </button>
      </header>

      {/* Clinic Selector */}
      {clinics.length !== 1 && (
        <div className="px-4 py-2 bg-white border-b border-gray-200">
          <ClinicSelector
            clinics={clinics}
            selectedId={selectedClinicId}
            onChange={setSelectedClinicId}
            loading={clinicsLoading}
          />
        </div>
      )}

      {/* Chat Area */}
      <ChatWindow messages={messages} isTyping={isTyping} isUrdu={isUrdu} />

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="px-4 pb-2 bg-gray-50">
          <QuickReplies replies={quickReplies} onSelect={handleSend} isUrdu={isUrdu} />
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={selectedClinicId ? t('placeholder') : t('selectClinic')}
          disabled={!selectedClinicId || isTyping}
          className={`
            flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50
            ${isUrdu ? 'text-right' : ''}
          `}
          dir={isUrdu ? 'rtl' : 'ltr'}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || !selectedClinicId || isTyping}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <svg className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
