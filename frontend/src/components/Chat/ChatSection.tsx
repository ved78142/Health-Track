import { useEffect, useRef, useState } from 'react'
import { sendChat } from '../../api/chat'
import PromptSection from './PromptSection'
import type { ChatMessage } from './types'
import './Chat.css'

const initialMessages: ChatMessage[] = [
  { id: 0, role: 'system', text: 'Hi! How can I help you today?' },
]

const ChatSection = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const [pending, setPending] = useState(false)

  const addMessage = (role: ChatMessage['role'], text: string) =>
    setMessages((prev) => [...prev, { id: prev.length, role, text }])

  const handleSubmit = async (text: string) => {
    addMessage('user', text)
    setPending(true)
    try {
      const { reply } = await sendChat(text)
      addMessage('system', reply)
    } catch {
      addMessage('system', "Sorry, I couldn't reach the server.")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="chat-section">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-row ${m.role}`}>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <PromptSection onSubmit={handleSubmit} disabled={pending} />
    </section>
  )
}

export default ChatSection
