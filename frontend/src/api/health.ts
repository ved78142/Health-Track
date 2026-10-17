import { apiGet } from './client'

export interface HealthResponse {
  status: string
  mongo: string
  database: string
}

export function getHealth(signal?: AbortSignal) {
  return apiGet<HealthResponse>('/health', signal)
}
