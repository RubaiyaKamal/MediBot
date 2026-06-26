import ReactMarkdown from 'react-markdown'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isUrdu: boolean
}

export default function MessageBubble({ role, content, isUrdu }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
          M
        </div>
      )}
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}
          ${isUrdu ? 'font-urdu text-base text-right' : ''}
        `}
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            components={{
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mt-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mt-1">{children}</ol>,
              li: ({ children }) => <li className="ml-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
