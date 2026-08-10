import { useEffect, useRef } from 'react'
import AquaChatAvatar from './AquaChatAvatar'
import { renderMarkdown } from './markdown.jsx'

const WELCOME_MESSAGE =
  "Hi! I'm AquaChat 💧 — AquaPure's AI assistant. I can help you with our " +
  'products, ordering, delivery, payments, orders, refunds, and more. ' +
  'What would you like to know?'

const SUGGESTED_QUESTIONS = [
  'What products do you offer?',
  'What are your prices?',
  'How can I place an order?',
  'How can I contact AquaPure?',
]

function timeLabel(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function AquaChatMessages({ messages, typing, error, onSuggestion }) {
  const scrollRef = useRef(null)

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, error])

  const showWelcome = messages.length === 0 && !typing

  return (
    <div
      ref={scrollRef}
      className="aquachat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F4FBFD]"
    >
      {showWelcome && (
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 mt-1">
            <AquaChatAvatar size={32} />
          </div>
          <div className="min-w-0">
            <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#486581] shadow-sm border border-[rgba(15,76,129,0.06)]">
              {WELCOME_MESSAGE}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSuggestion(q)}
                  className="text-xs font-medium text-[#0F4C81] bg-white border border-[#ADC7E5] hover:border-[#0F4C81] hover:bg-[#EFF4FA] rounded-full px-3 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.map((m) =>
        m.role === 'user' ? (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[82%]">
              <div className="bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF] text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm">
                {m.content}
              </div>
              {timeLabel(m.time) && (
                <div className="text-right text-[10px] text-[#7B8794] mt-1">
                  {timeLabel(m.time)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex gap-2.5">
            <div className="flex-shrink-0 mt-1">
              <AquaChatAvatar size={32} />
            </div>
            <div className="max-w-[82%]">
              <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#486581] shadow-sm border border-[rgba(15,76,129,0.06)]">
                {renderMarkdown(m.content)}
              </div>
              {timeLabel(m.time) && (
                <div className="text-[10px] text-[#7B8794] mt-1">
                  {timeLabel(m.time)}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {typing && (
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 mt-1">
            <AquaChatAvatar size={32} />
          </div>
          <div
            className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-[rgba(15,76,129,0.06)] flex items-center gap-1.5"
            aria-label="AquaChat is typing"
          >
            <span className="aquachat-typing-dot" />
            <span className="aquachat-typing-dot" />
            <span className="aquachat-typing-dot" />
          </div>
        </div>
      )}

      {error && !typing && (
        <div className="flex gap-2.5" role="alert">
          <div className="flex-shrink-0 mt-1">
            <AquaChatAvatar size={32} />
          </div>
          <div className="bg-[#FDF3F3] border border-[rgba(239,68,68,0.25)] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#9B2C2C] shadow-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

export default AquaChatMessages
