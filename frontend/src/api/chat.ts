import { apiPost } from './client'

export interface ChatResponse {
  reply: string
}

export function sendChat(message: string, signal?: AbortSignal) {
  return apiPost<ChatResponse>('/chat', { message }, signal)
}
