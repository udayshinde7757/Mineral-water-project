import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'
import AquaChatButton from './AquaChatButton'
import { getPageLabel } from './pageLabels'
import aquaChatService from '@services/aquaChatService'
import { getApiErrorMessage } from '@services/api/apiClient'
import './aquaChat.css'

// The chat window (header/messages/input + markdown renderer) is lazy-loaded
// so the main site stays fast even if the user never opens AquaChat.
const AquaChatWindow = lazy(() => import('./AquaChatWindow'))

const STORAGE_KEY = 'aquachat_session_v1'
const HISTORY_LIMIT = 24
const DEFAULT_ERROR =
  "I'm having trouble connecting right now. Please try again in a moment."

let idCounter = 0
function nextId() {
  idCounter += 1
  return `${Date.now()}-${idCounter}`
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
  } catch {
    return []
  }
}

function AquaChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(loadSession)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const location = useLocation()
  const pageLabel = useMemo(
    () => getPageLabel(location.pathname),
    [location.pathname]
  )

  // Preserve the conversation across page navigations (SPA + reload-safe).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
    } catch {
      /* storage unavailable — continue without persistence */
    }
  }, [messages])

  const sendMessage = useCallback(
    async (raw) => {
      const text = typeof raw === 'string' ? raw.trim() : ''
      if (!text || typing) return

      const history = messages
        .slice(-HISTORY_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }))

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: text, time: Date.now() },
      ])
      setDraft('')
      setTyping(true)
      setError(null)

      try {
        const data = await aquaChatService.sendMessage({
          message: text,
          history,
          page: pageLabel,
        })
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: data.reply, time: Date.now() },
        ])
      } catch (err) {
        setError(getApiErrorMessage(err, DEFAULT_ERROR))
      } finally {
        setTyping(false)
      }
    },
    [messages, typing, pageLabel]
  )

  const newChat = useCallback(() => {
    setMessages([])
    setError(null)
    setTyping(false)
    setDraft('')
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // Escape closes/minimizes the window.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Focus the input once the window opens.
  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 120)
    return () => clearTimeout(t)
  }, [open])

  return (
    <>
      <AquaChatButton onClick={() => setOpen((o) => !o)} isOpen={open} />

      {open && (
        <Suspense fallback={null}>
          <AquaChatWindow
            messages={messages}
            typing={typing}
            error={error}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onClose={close}
            onNewChat={newChat}
            inputRef={inputRef}
          />
        </Suspense>
      )}
    </>
  )
}

export default AquaChat
