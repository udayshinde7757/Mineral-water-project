import { FiPlus, FiMinus } from 'react-icons/fi'
import AquaChatAvatar from './AquaChatAvatar'

function AquaChatHeader({ onClose, onNewChat }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#0B4F6C] to-[#01BAEF]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          <AquaChatAvatar size={38} />
        </div>
        <div className="min-w-0">
          <div className="text-white font-display font-semibold leading-tight text-[15px]">
            AquaChat
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/85">
            <span
              className="inline-block w-2 h-2 rounded-full bg-emerald-300"
              aria-hidden="true"
            />
            AI Assistant
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onNewChat}
          title="Start a new chat"
          aria-label="Start a new chat"
          className="p-2 rounded-lg text-white/90 hover:bg-white/15 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
        >
          <FiPlus size={18} />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Minimize AquaChat"
          aria-label="Minimize AquaChat"
          className="p-2 rounded-lg text-white/90 hover:bg-white/15 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
        >
          <FiMinus size={18} />
        </button>
      </div>
    </header>
  )
}

export default AquaChatHeader
