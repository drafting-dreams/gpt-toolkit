import type { ReactNode } from 'react'

export type Message = {
  role: 'system' | 'user' | 'assistant'
  content: ReactNode
}
