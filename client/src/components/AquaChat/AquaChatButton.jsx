import AquaChatAvatar from './AquaChatAvatar'

/**
 * Fixed floating launcher that opens/minimizes AquaChat.
 * The avatar is wrapped in a gradient ring so the pulse animation reads
 * clearly against any page background.
 */
function AquaChatButton({ onClick, isOpen }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="aquachat-window"
      aria-label={isOpen ? 'Minimize AquaChat' : 'Open AquaChat — AquaPure AI assistant'}
      className="aquachat-launcher"
    >
      <span className="aquachat-launcher__avatar" aria-hidden="true">
        <AquaChatAvatar size={56} />
      </span>
      <span className="aquachat-launcher__pulse" aria-hidden="true" />
    </button>
  )
}

export default AquaChatButton
