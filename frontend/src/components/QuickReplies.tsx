const PRIMARY = '#1B5E47'

interface Props {
  replies: string[]
  onSelect: (reply: string) => void
}

export default function QuickReplies({ replies, onSelect }: Props) {
  if (!replies.length) return null
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border-t border-gray-100">
      {replies.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className="px-4 py-1.5 text-sm rounded-full border font-medium transition-all hover:text-white"
          style={{ borderColor: PRIMARY, color: PRIMARY }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.backgroundColor = PRIMARY
            el.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.backgroundColor = ''
            el.style.color = PRIMARY
          }}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
