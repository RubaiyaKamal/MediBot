interface Props {
  replies: string[]
  onSelect: (reply: string) => void
  isUrdu: boolean
}

export default function QuickReplies({ replies, onSelect, isUrdu }: Props) {
  if (!replies.length) return null
  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${isUrdu ? 'justify-end' : 'justify-start'}`}>
      {replies.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className={`
            px-3 py-1.5 text-sm rounded-full border border-blue-600 text-blue-600
            hover:bg-blue-600 hover:text-white transition-colors
            ${isUrdu ? 'font-urdu' : ''}
          `}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
