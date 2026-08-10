import AquaChatHeader from './AquaChatHeader'
import AquaChatMessages from './AquaChatMessages'
import AquaChatInput from './AquaChatInput'

function AquaChatWindow({
  messages,
  typing,
  error,
  draft,
  onDraftChange,
  onSend,
  onClose,
  onNewChat,
  inputRef,
}) {
  return (
    <section
      id="aquachat-window"
      className="aquachat-window"
      role="dialog"
      aria-label="AquaChat — AquaPure AI assistant"
      aria-describedby="aquachat-window"
    >
      <AquaChatHeader onClose={onClose} onNewChat={onNewChat} />
      <AquaChatMessages
        messages={messages}
        typing={typing}
        error={error}
        onSuggestion={onSend}
      />
      <AquaChatInput
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
        disabled={typing}
        inputRef={inputRef}
      />
    </section>
  )
}

export default AquaChatWindow
