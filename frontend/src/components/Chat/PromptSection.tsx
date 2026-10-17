import { useState, type FormEvent } from 'react'

type Props = {
  onSubmit: (text: string) => void
  disabled?: boolean
}

const PromptSection = ({ onSubmit, disabled = false }: Props) => {
  const [text, setText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <form className="prompt-section" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        aria-label="Message"
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Submit
      </button>
    </form>
  )
}

export default PromptSection
