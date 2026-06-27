import ReactMarkdown from 'react-markdown'

interface Props {
  role: 'user' | 'assistant'
  content: string
}

const PRIMARY = '#1B5E47'

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`
          max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser ? 'text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}
        `}
        style={isUser ? { backgroundColor: PRIMARY } : {}}
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
