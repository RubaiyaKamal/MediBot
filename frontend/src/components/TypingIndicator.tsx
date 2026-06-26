export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-sm w-fit max-w-[80px]">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  )
}
