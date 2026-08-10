import { FiSend } from 'react-icons/fi'

function autoGrow(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function AquaChatInput({ value, onChange, onSend, disabled, inputRef }) {
  const canSend = Boolean(value && value.trim()) && !disabled

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSend(value)
    }
  }

  return (
    <div className="border-t border-[rgba(15,76,129,0.08)] bg-white px-3 py-3 flex items-end gap-2">
      <textarea
        ref={(el) => {
          inputRef.current = el
          autoGrow(el)
        }}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          autoGrow(e.target)
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        aria-label="Type your message to AquaChat"
        placeholder="Type a message…"
        disabled={disabled}
        className="flex-1 resize-none bg-[#F4FBFD] border border-[rgba(15,76,129,0.12)] rounded-xl px-3.5 py-2.5 text-sm text-[#102A43] placeholder:text-[#7B8794] outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/20 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={() => canSend && onSend(value)}
        disabled={!canSend}
        aria-label="Send message"
        className="flex-shrink-0 w-10 h-10 grid place-items-center rounded-xl text-white bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FiSend size={18} />
      </button>
    </div>
  )
}

export default AquaChatInput
